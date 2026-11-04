/* Capture 1280x720 stills of the real app, one per video scene. */
import { writeFileSync } from "node:fs";

const CDP = "http://127.0.0.1:9345";
const BASE = "http://127.0.0.1:3105";
const SHOTS = [
  ["identidad", "/identidad", null],
  ["productos", "/crm/productos", null],
  ["productos-cutout", "/crm/productos", "[class*=cutout],button"],
  ["trends", "/owner/trends", null],
  ["whatsapp", "/crm/whatsapp", null],
];

const target = await (await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(String(ev.data));
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error)));
    else resolve(m.result);
  }
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const cur = ++id;
    pending.set(cur, { resolve, reject });
    ws.send(JSON.stringify({ id: cur, method, params }));
  });
}
async function ev(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.value;
}
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1280, height: 720, deviceScaleFactor: 1, mobile: false,
});
for (const [name, path, scrollSel] of SHOTS) {
  await send("Page.navigate", { url: BASE + path });
  await new Promise((r) => setTimeout(r, 4000));
  if (scrollSel) {
    await ev(`[...document.querySelectorAll('button,p,h2,h3')].find(e=>/cutout|recorte|fondo/i.test(e.textContent||''))?.scrollIntoView({block:'center'})`);
    await new Promise((r) => setTimeout(r, 1200));
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(new URL(`./${name}.png`, import.meta.url), Buffer.from(shot.data, "base64"));
  console.log("shot", name, (await ev("document.title"))?.slice(0, 60));
}
await fetch(`${CDP}/json/close/${target.id}`);
ws.close();
