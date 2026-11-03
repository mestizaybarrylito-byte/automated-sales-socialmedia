import { buildPrompt } from "../_shared/config.ts";

Deno.serve(async (req) => {
  const { agent, messages, conversationKey } = await req.json();
  const system = await buildPrompt(agent);
  const res = await fetch(
    `${Deno.env.get("HARNESS_GLOBAL_URL")}/s/${conversationKey}/v1/chat/completions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("META_MODEL_API_KEY")}` },
      body: JSON.stringify({ messages: [{ role: "system", content: system }, ...messages] }),
    },
  );
  return new Response(await res.text(), { headers: { "Content-Type": "application/json" } });
});