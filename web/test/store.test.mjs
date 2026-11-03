/**
 * Maintained test for the CRM catalog helpers (lib/store.ts) that feed the
 * online catalog and the campaign wizard step 1.
 * Runs with the Node built-in runner, no new dependencies:
 *
 *   npm test
 *
 * It transpiles the REAL lib source with the project's own tsc into a temp
 * dir, then checks the active filter and the image fallback the catalog,
 * home grid and wizard rely on.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const webDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(webDir, "node_modules", ".cache", `store-test-${process.pid}`);
let store;

after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

before(() => {
  mkdirSync(outDir, { recursive: true });
  const webRequire = createRequire(path.join(webDir, "package.json"));
  const ts = webRequire("typescript");
  let source = readFileSync(path.join(webDir, "lib", "store.ts"), "utf8");
  // store.ts uses the @/ path alias for the seed catalog; rewire it to a
  // local copy of the REAL seed so the module loads in Node.
  source = source.replaceAll('"@/data/products.json"', '"./products-seed.json"');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  writeFileSync(path.join(outDir, "store.js"), outputText);
  copyFileSync(path.join(webDir, "data", "products.json"), path.join(outDir, "products-seed.json"));
  store = createRequire(path.join(outDir, "entry.js"))("./store.js");
});

describe("activeProducts", () => {
  it("keeps active products, drops inactive ones, preserves order", () => {
    const items = [
      { slug: "a", name: "A", priceMXN: 1, active: true },
      { slug: "b", name: "B", priceMXN: 2, active: false },
      { slug: "c", name: "C", priceMXN: 3, active: true },
    ];
    assert.deepEqual(
      store.activeProducts(items).map((p) => p.slug),
      ["a", "c"]
    );
  });

  it("returns an empty list when nothing is active", () => {
    assert.deepEqual(store.activeProducts([{ slug: "x", active: false }]), []);
    assert.deepEqual(store.activeProducts([]), []);
  });
});

describe("productImage", () => {
  it("uses the product image when present", () => {
    assert.equal(store.productImage({ image: "/images/ribeye.jpg" }), "/images/ribeye.jpg");
  });

  it("falls back to the hero image when missing or empty", () => {
    assert.equal(store.productImage({}), store.FALLBACK_PRODUCT_IMAGE);
    assert.equal(store.productImage({ image: "" }), store.FALLBACK_PRODUCT_IMAGE);
    assert.match(store.FALLBACK_PRODUCT_IMAGE, /^\/images\//);
  });
});

describe("seed catalog", () => {
  it("seeds every product as active with a resolvable image", () => {
    const seeded = store.localStore.listProducts();
    assert.ok(seeded.length > 0);
    assert.deepEqual(store.activeProducts(seeded), seeded);
    for (const p of seeded) {
      assert.match(store.productImage(p), /^\/images\//);
    }
  });
});
