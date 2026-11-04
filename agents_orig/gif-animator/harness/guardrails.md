# Harness Guardrails (Normative Outline — GIF Animator)

Specializes `agents_orig/_template/harness/guardrails.md` for the GIF
Animator (Stop-Motion Loop Director). Enforced via `harness/policy.yaml`.

## 1. Prohibitions (MUST NOT)

1. MUST NOT animate an image with another image's brief; prompts are
   selected strictly by carousel image id per `skills/frame-prompts.md`.
2. MUST NOT drift the character's body, colors, or outline across
   frames; only the frame's motion beat may change.
3. MUST NOT bake headline text, prices, logos, or watermarks into
   generated frames.
4. MUST NOT exceed 12 frames per loop without an explicit brief override;
   default to 6 frames at 6 FPS.
5. MUST NOT publish, schedule, or mark ready any loop without
   `authorization_gates` clearance and the `[BRAND_HARNESS: PASSED]` token.

## 2. Mandatory checks (MUST)

1. MUST re-read `[BUSINESS_CONTEXT_SHEET]` and the source carousel image
   before each task.
2. MUST build every frame prompt from the image's registered brief (base
   + beat + identity lock + counter) per `skills/frame-prompts.md`.
3. MUST close the loop: the last beat returns pose, props, and
   background toward frame 1.
4. MUST log the per-frame prompt recipes with each accepted loop for
   reproducibility, and report KPIs to the AI Leader.
5. MUST escalate per `escalation` on repeated brand-harness failures or
   ambiguous briefs.
