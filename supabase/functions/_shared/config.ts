import { parse } from "jsr:@std/yaml@1";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;

export async function loadManifest() {
  const raw = await Deno.readTextFile(env("AGENTS_MANIFEST", "./agents/agents.config.yaml"));
  return parse(raw.replace(/\$\{(\w+)\}/g, (_, k) => env(k))) as any;
}

export async function loadContext(sb?: any): Promise<string> {
  if (env("CONTEXT_SOURCE", "file") === "supabase") {
    const { data, error } = await sb.from("context_documents")
      .select("content").eq("name", "BUSINESS_CONTEXT_SHEET")
      .order("version", { ascending: false }).limit(1).single();
    if (error) throw error;
    return data.content;
  }
  return await Deno.readTextFile(env("CONTEXT_FILE_PATH"));
}

export async function buildPrompt(agentId: string, sb?: any) {
  const m = await loadManifest();
  const a = m.agents[agentId] ?? m.external[agentId];
  if (!a) throw new Error(`Unknown agent: ${agentId}`);
  const base = await Deno.readTextFile(a.prompt);
  const ctx = a.inject?.includes("context") ? await loadContext(sb) : "";
  const rules = await Promise.all(m.shared_harness.map((p: string) => Deno.readTextFile(p)));
  return [base, "\n\n# [BUSINESS_CONTEXT_SHEET]\n" + ctx, "\n\n# HARNESS RULES\n" + rules.join("\n---\n")].join("");
}