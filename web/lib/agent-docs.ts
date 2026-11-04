/**
 * Server-only agent document loader. Reads the repo's agent definitions
 * (agents_orig/ preferred, agents/ fallback) and the business context
 * sheet for model calls. Import from API routes only — never from client
 * components.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** Resolve the agents directory (override, agents_orig, then agents). */
export function resolveAgentsDir(): string | null {
  const candidates = [
    process.env.AI_AGENTS_DIR,
    path.resolve(process.cwd(), "..", "agents_orig"),
    path.resolve(process.cwd(), "..", "agents"),
  ];
  for (const dir of candidates) {
    if (dir && existsSync(path.join(dir, "cgmo", "SYSTEM_PROMPT.md"))) return dir;
  }
  return null;
}

/** Read one agent's system prompt; null when unavailable. */
export function loadAgentPrompt(agent: string): string | null {
  try {
    const dir = resolveAgentsDir();
    if (!dir) return null;
    const file = path.join(dir, agent, "SYSTEM_PROMPT.md");
    if (!existsSync(file)) return null;
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

/** Read the business context sheet; empty string when unavailable. */
export function loadContextSheet(): string {
  try {
    const candidates = [
      process.env.CONTEXT_FILE_PATH,
      path.resolve(process.cwd(), "..", "context", "BUSINESS_CONTEXT_SHEET.md"),
    ];
    for (const file of candidates) {
      if (file && existsSync(file)) return readFileSync(file, "utf8");
    }
  } catch {
    /* fall through */
  }
  return "";
}

/** Model config presence check (names only — never log values). */
export function modelConfigured(): { base: boolean; key: boolean } {
  return {
    base: Boolean(process.env.META_MODEL_BASE_URL),
    key: Boolean(process.env.META_MODEL_API_KEY),
  };
}
