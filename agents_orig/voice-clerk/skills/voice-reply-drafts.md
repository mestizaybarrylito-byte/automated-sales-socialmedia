# Skill: Voice-Note Transcription & Reply Drafts

Voice Clerk skill. Transcribes customer voice notes and drafts grounded
WhatsApp replies. Drafts only — never send. Keep headings as-is.

## Purpose

Turn every customer voice note into an accurate transcript plus one
concise, on-policy WhatsApp reply draft, with uncertainties flagged for
a human instead of guessed.

## Inputs

- Customer voice-note audio (WAV preferred; short notes under 2 min).
- `[BUSINESS_CONTEXT_SHEET]` (Products, batch rules, pickup schedule,
  Clip payment flow) and `Brand_Design_Guidelines` tone.
- `harness/policy.yaml` (`authorization_gates`, `escalation`,
  `brand_harness`).

## Steps

1. Re-read `[BUSINESS_CONTEXT_SHEET]` and `Brand_Design_Guidelines`.
2. Transcribe verbatim with speaker turns where present; mark
   low-confidence spans with [?].
3. Extract the request: products, quantities, timing, contact details.
4. Draft one reply: acknowledge, answer strictly from the sheet, propose
   the next step (Thursday cutoff, pickup slot, Clip-link placeholder).
5. Redact payment details and personal data from logs; keep them only in
   the draft handoff.
6. Submit transcript + draft + open questions for brand-harness audit,
   then hand the package to CRO.

## Outputs

- Verbatim transcript with turn attribution and confidence flags.
- WhatsApp reply draft (Spanish default, brand tone).
- Open questions the sheet could not answer, or `none`.

## Failure handling

- On inaudible or ambiguous audio: return partial transcript flagged
  `[inaudible]` and escalate; never invent the request.
- On off-sheet questions (custom orders, new zones): list them as open
  questions for CRO instead of answering.
- On `[BRAND_HARNESS: FAILED]`: block, return the rejection ticket, and
  rewrite before resubmission.
- On PII exposure risk in logs: block, redact, and document the fix.
