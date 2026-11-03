/**
 * Maintained test for the brand identity core (lib/brand.ts).
 * Runs with the Node built-in runner, no new dependencies:
 *
 *   npm test
 *
 * It transpiles the REAL lib source with the project's own tsc into a temp
 * dir, then checks hex handling, palette extraction, theme mapping and the
 * WCAG contrast guarantees the identidad page relies on.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const webDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(webDir, "node_modules", ".cache", `brand-test-${process.pid}`);
let brand;

after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

before(() => {
  mkdirSync(outDir, { recursive: true });
  const webRequire = createRequire(path.join(webDir, "package.json"));
  const ts = webRequire("typescript");
  for (const file of ["brand.ts", "photo-styles.ts"]) {
    const source = readFileSync(path.join(webDir, "lib", file), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    writeFileSync(path.join(outDir, file.replace(/\.ts$/, ".js")), outputText);
  }
  brand = createRequire(path.join(outDir, "entry.js"))("./brand.js");
});

describe("normalizeHex", () => {
  it("expands short hex and lowercases", () => {
    assert.equal(brand.normalizeHex("#ABC"), "#aabbcc");
    assert.equal(brand.normalizeHex("9A5F3B"), "#9a5f3b");
    assert.equal(brand.normalizeHex("  #f7f2ea  "), "#f7f2ea");
  });

  it("rejects malformed input", () => {
    assert.equal(brand.normalizeHex("zzz"), null);
    assert.equal(brand.normalizeHex("#12345"), null);
    assert.equal(brand.normalizeHex(""), null);
    assert.equal(brand.normalizeHex(42), null);
  });
});

describe("contrast", () => {
  it("scores black-on-white at 21 and identical colors at 1", () => {
    assert.ok(Math.abs(brand.contrastRatio("#000000", "#ffffff") - 21) < 0.01);
    assert.equal(brand.contrastRatio("#9a5f3b", "#9A5F3B"), 1);
  });

  it("picks the most readable text color", () => {
    assert.equal(brand.bestTextOn("#1a1c1e"), "#ffffff");
    assert.equal(brand.bestTextOn("#f7f2ea"), "#1a1c1e");
  });
});

function solidPixels(colors) {
  // colors: [{r,g,b,a?,n}] -> flat RGBA array.
  const out = [];
  for (const c of colors) {
    for (let i = 0; i < c.n; i++) out.push(c.r, c.g, c.b, c.a ?? 255);
  }
  return out;
}

describe("extractPaletteFromPixels", () => {
  it("ranks dominant colors first and ignores transparency", () => {
    const pixels = solidPixels([
      { r: 200, g: 30, b: 30, n: 100 },
      { r: 30, g: 180, b: 60, n: 60 },
      { r: 30, g: 60, b: 200, n: 30 },
      { r: 0, g: 0, b: 0, a: 0, n: 500 },
    ]);
    const palette = brand.extractPaletteFromPixels(pixels);
    assert.deepEqual(palette, ["#c81e1e", "#1eb43c", "#1e3cc8"]);
  });

  it("skips a white logo background and caps at six colors", () => {
    const pixels = solidPixels([
      { r: 255, g: 255, b: 255, n: 400 },
      { r: 200, g: 30, b: 30, n: 100 },
      { r: 30, g: 180, b: 60, n: 90 },
      { r: 30, g: 60, b: 200, n: 80 },
      { r: 230, g: 180, b: 40, n: 70 },
      { r: 150, g: 60, b: 180, n: 60 },
      { r: 40, g: 180, b: 180, n: 50 },
      { r: 20, g: 20, b: 20, n: 40 },
    ]);
    const palette = brand.extractPaletteFromPixels(pixels);
    assert.equal(palette.length, 6);
    assert.ok(!palette.includes("#ffffff"));
    assert.equal(palette[0], "#c81e1e");
  });

  it("returns [] without visible pixels", () => {
    assert.deepEqual(brand.extractPaletteFromPixels([]), []);
    assert.deepEqual(
      brand.extractPaletteFromPixels(solidPixels([{ r: 0, g: 0, b: 0, a: 0, n: 10 }])),
      []
    );
  });
});

describe("themeFromPalette", () => {
  it("falls back to the default theme on empty input", () => {
    assert.deepEqual(brand.themeFromPalette([]), brand.DEFAULT_THEME);
    assert.deepEqual(brand.themeFromPalette(["nope"]), brand.DEFAULT_THEME);
  });

  it("expands a single color into tints and shades", () => {
    const theme = brand.themeFromPalette(["#336699"]);
    assert.equal(theme.primary, "#336699");
    for (const key of Object.keys(brand.DEFAULT_THEME)) {
      assert.match(theme[key], /^#[0-9a-f]{6}$/, key);
    }
    const lum = (hex) => brand.relativeLuminance(hex);
    assert.ok(lum(theme.background) > lum(theme.primary));
    assert.ok(lum(theme.dark) < lum(theme.primary));
  });

  it("maps lightest to background and darkest to base", () => {
    const theme = brand.themeFromPalette([
      "#c81e1e",
      "#f7f2ea",
      "#1a1c1e",
      "#1eb43c",
    ]);
    assert.equal(theme.background, "#f7f2ea");
    assert.equal(theme.dark, "#1a1c1e");
    assert.match(theme.primary, /^#[0-9a-f]{6}$/);
  });
});

describe("checkThemeContrast", () => {
  it("passes the default rust/charcoal theme untouched", () => {
    const { checks, fixedTheme } = brand.checkThemeContrast(brand.DEFAULT_THEME);
    assert.equal(checks.length, 5);
    assert.ok(checks.every((c) => c.pass));
    assert.deepEqual(fixedTheme, brand.DEFAULT_THEME);
  });

  it("repairs an unreadable theme to full AA", () => {
    const bad = {
      primary: "#eeeeee",
      primaryDeep: "#e0e0e0",
      dark: "#f0f0f0",
      surface: "#e8e8e8",
      background: "#1a1c1e",
      accent: "#ffff99",
    };
    const before = brand.checkThemeContrast(bad).checks;
    assert.ok(before.some((c) => !c.pass));
    const { fixedTheme } = brand.checkThemeContrast(bad);
    const after = brand.checkThemeContrast(fixedTheme).checks;
    assert.ok(after.every((c) => c.pass));
  });

  it("escapes the local-maximum trap (dark bg vs dark blue)", () => {
    const trap = {
      primary: "#1d4ed8",
      primaryDeep: "#563526",
      dark: "#1f3cc8",
      surface: "#232527",
      background: "#141414",
      accent: "#c2410c",
    };
    assert.ok(brand.checkThemeContrast(trap).checks.some((c) => !c.pass));
    const { fixedTheme } = brand.checkThemeContrast(trap);
    const after = brand.checkThemeContrast(fixedTheme).checks;
    assert.ok(after.every((c) => c.pass), JSON.stringify(after.filter((c) => !c.pass)));
  });

  it("repairs mid-gray themes where both directions nearly tie", () => {
    const mid = {
      primary: "#808080",
      primaryDeep: "#808080",
      dark: "#777777",
      surface: "#777777",
      background: "#999999",
      accent: "#808080",
    };
    const { fixedTheme } = brand.checkThemeContrast(mid);
    const after = brand.checkThemeContrast(fixedTheme).checks;
    assert.ok(after.every((c) => c.pass), JSON.stringify(after.filter((c) => !c.pass)));
  });
});

describe("cssVarsForTheme", () => {
  it("emits hex and rgb-triplet variables", () => {
    const vars = brand.cssVarsForTheme(brand.DEFAULT_THEME);
    assert.equal(vars["--brand-primary"], "#9a5f3b");
    assert.equal(vars["--brand-primary-rgb"], "154 95 59");
    assert.equal(vars["--brand-bg"], "#f7f2ea");
    assert.equal(vars["--brand-on-primary"], "#ffffff");
  });
});

describe("validateBrandSettings", () => {
  it("coerces garbage to safe defaults", () => {
    const settings = brand.validateBrandSettings({ nope: true });
    assert.equal(settings.logoDataUrl, null);
    assert.deepEqual(settings.palette, brand.DEFAULT_PALETTE);
    assert.deepEqual(settings.theme, brand.DEFAULT_THEME);
  });

  it("keeps valid logos, trims palettes, fixes bad slots", () => {
    const logo = "data:image/png;base64,iVBORw0KGgo=";
    const settings = brand.validateBrandSettings({
      logoDataUrl: logo,
      palette: ["#111111", "#222222", "#333333", "#444444", "#555555", "#666666", "#777777"],
      theme: { primary: "#ABC", dark: "bogus" },
      updatedAt: "2026-11-03T00:00:00.000Z",
    });
    assert.equal(settings.logoDataUrl, logo);
    assert.equal(settings.palette.length, 6);
    assert.equal(settings.theme.primary, "#aabbcc");
    assert.equal(settings.theme.dark, brand.DEFAULT_THEME.dark);
    // Plain http logos are dropped (mixed-content risk).
    assert.equal(
      brand.validateBrandSettings({ logoDataUrl: "http://x.test/l.png" }).logoDataUrl,
      null
    );
  });

  it("fills name and fonts from defaults on legacy rows", () => {
    const settings = brand.validateBrandSettings({
      palette: ["#111111"],
      theme: { primary: "#222222" },
    });
    assert.equal(settings.companyName, "Casa de Brasas");
    assert.deepEqual(settings.fonts, brand.DEFAULT_FONTS);
    assert.deepEqual(settings.step3StyleIds, [
      "anime",
      "watercolor",
      "8bit",
      "illustrated",
      "glowy",
    ]);
  });

  it("keeps up to five distinct step-3 pins", () => {
    const settings = brand.validateBrandSettings({
      step3StyleIds: ["felt", "tarot", "felt", "", 42, "anime", "glowy", "doodle"],
    });
    assert.deepEqual(settings.step3StyleIds, ["felt", "tarot", "anime", "glowy", "doodle"]);
    assert.deepEqual(brand.validateBrandSettings({ step3StyleIds: [] }).step3StyleIds, [
      "anime",
      "watercolor",
      "8bit",
      "illustrated",
      "glowy",
    ]);
  });

  it("keeps valid names/fonts and repairs bad ones", () => {
    const settings = brand.validateBrandSettings({
      companyName: "  Parrilla  El Faro  ",
      fonts: { heading: "verdana", body: "nope", accent: "mono" },
    });
    assert.equal(settings.companyName, "Parrilla El Faro");
    assert.equal(settings.fonts.heading, "verdana");
    assert.equal(settings.fonts.body, brand.DEFAULT_FONTS.body);
    assert.equal(settings.fonts.accent, "mono");
    assert.equal(brand.validateBrandSettings({ companyName: "   " }).companyName, "Casa de Brasas");
    assert.equal(
      brand.validateBrandSettings({ companyName: "x".repeat(80) }).companyName.length,
      60
    );
  });
});

describe("fonts", () => {
  it("ships a catalog of unique, non-empty system stacks", () => {
    assert.ok(brand.FONT_CATALOG.length >= 3);
    const ids = brand.FONT_CATALOG.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const f of ids.map((id) => brand.FONT_CATALOG.find((e) => e.id === id))) {
      assert.ok(f.label.length > 0, `${f.id}.label`);
      assert.ok(f.stack.length > 0, `${f.id}.stack`);
    }
    assert.deepEqual(
      brand.FONT_ROLES.map((r) => r.key),
      ["heading", "body", "accent"]
    );
  });

  it("resolves stacks and falls back on unknown ids", () => {
    assert.ok(brand.resolveFontStack("georgia").includes("Georgia"));
    assert.equal(brand.resolveFontStack("nope"), brand.resolveFontStack("system-sans"));
  });
});

describe("cssVarsForBrand", () => {
  it("emits theme colors plus the three font stacks", () => {
    const settings = brand.defaultBrandSettings();
    settings.fonts = { heading: "verdana", body: "mono", accent: "georgia" };
    const vars = brand.cssVarsForBrand(settings);
    assert.equal(vars["--brand-primary"], "#9a5f3b");
    assert.equal(vars["--brand-font-heading"], brand.resolveFontStack("verdana"));
    assert.equal(vars["--brand-font-body"], brand.resolveFontStack("mono"));
    assert.equal(vars["--brand-font-accent"], brand.resolveFontStack("georgia"));
  });
});
