/**
 * Maintained test for the CRM product-assist core (lib/product-assist.ts).
 * Runs with the Node built-in runner, no new dependencies:
 *
 *   npm test
 *
 * It transpiles the REAL lib source with the project's own tsc into a temp
 * dir, then checks the agent prompt assembly, the model-output guardrails
 * and the rule-based fallback the /crm/productos AI flow relies on.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const webDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(webDir, "node_modules", ".cache", `assist-test-${process.pid}`);
let assist;

after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

before(() => {
  mkdirSync(outDir, { recursive: true });
  const webRequire = createRequire(path.join(webDir, "package.json"));
  const ts = webRequire("typescript");
  const source = readFileSync(path.join(webDir, "lib", "product-assist.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  writeFileSync(path.join(outDir, "product-assist.js"), outputText);
  assist = createRequire(path.join(outDir, "entry.js"))("./product-assist.js");
});

const docs = {
  cgmo: "CGMO-ROLE copy owner",
  cro: "CRO-ROLE pricing owner",
  context: "CONTEXT-SHEET batch thursday",
};

describe("buildAssistMessages", () => {
  it("injects both agent prompts, the context and the JSON contract", () => {
    const [system, user] = assist.buildAssistMessages(
      { name: "Ribeye", category: "corte" },
      docs
    );
    assert.equal(system.role, "system");
    assert.equal(user.role, "user");
    for (const needle of ["CGMO-ROLE", "CRO-ROLE", "CONTEXT-SHEET", '"priceMXN"']) {
      assert.ok(system.content.includes(needle), needle);
    }
    assert.ok(user.content.includes("Ribeye"));
    assert.ok(user.content.includes("corte"));
  });

  it("consults the documented agents in order", () => {
    assert.deepEqual([...assist.ASSIST_AGENTS], ["cgmo", "cro"]);
  });

  it("truncates oversized agent docs to protect the prompt budget", () => {
    assert.equal(assist.truncateDoc("abc", 10), "abc");
    const long = assist.truncateDoc("x".repeat(7000), 6000);
    assert.ok(long.length < 7000);
    assert.ok(long.endsWith("[…truncated]"));
  });
});

describe("parseAssistResponse", () => {
  const valid = JSON.stringify({
    description:
      "Ribeye al carbón de marmoleo generoso, ideal para asar a fuego lento en familia.",
    priceMXN: 499,
    priceRationale: "Precio premium acorde al corte y al lote semanal.",
  });

  it("accepts valid model output", () => {
    assert.deepEqual(assist.parseAssistResponse(valid), {
      description:
        "Ribeye al carbón de marmoleo generoso, ideal para asar a fuego lento en familia.",
      priceMXN: 499,
      priceRationale: "Precio premium acorde al corte y al lote semanal.",
    });
  });

  it("extracts JSON wrapped in prose and rounds the price", () => {
    const wrapped = `Here you go:\n${valid.replace("499", "499.7")}\nDone.`;
    const parsed = assist.parseAssistResponse(wrapped);
    assert.equal(parsed.priceMXN, 500);
  });

  it("rejects missing, malformed, or out-of-guardrail output", () => {
    assert.equal(assist.parseAssistResponse("no json here"), null);
    assert.equal(assist.parseAssistResponse("{oops"), null);
    assert.equal(
      assist.parseAssistResponse(JSON.stringify({ description: "short", priceMXN: 10 })),
      null
    );
    assert.equal(
      assist.parseAssistResponse(
        JSON.stringify({ description: "x".repeat(50), priceMXN: -5 })
      ),
      null
    );
    assert.equal(
      assist.parseAssistResponse(
        JSON.stringify({ description: "x".repeat(50), priceMXN: 999999999 })
      ),
      null
    );
    assert.equal(
      assist.parseAssistResponse(
        JSON.stringify({ description: "x".repeat(50), priceMXN: "499" })
      ),
      null
    );
  });
});

describe("fallbackAssist", () => {
  it("returns professional copy and a baseline price per category", () => {
    const byCategory = {
      corte: 449,
      salsa: 99,
      paquete: 899,
    };
    for (const [category, price] of Object.entries(byCategory)) {
      const result = assist.fallbackAssist({ name: "Prueba", category });
      assert.equal(result.priceMXN, price);
      assert.ok(result.description.includes("Prueba"));
      assert.ok(result.description.length >= 20);
      // The fallback itself must pass the output guardrails.
      assert.deepEqual(assist.parseAssistResponse(JSON.stringify(result)), result);
    }
  });

  it("is deterministic", () => {
    const input = { name: "Ribeye", category: "corte" };
    assert.deepEqual(assist.fallbackAssist(input), assist.fallbackAssist(input));
  });
});
