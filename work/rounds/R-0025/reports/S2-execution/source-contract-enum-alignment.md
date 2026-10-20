# S2 CASE command response enum alignment

Architect, Article 7. TASK-0043 continuation; parent authorized this exact source correction.

The existing handwritten CASE commands OpenAPI now exposes outer code enums on
exactly six responses: claim-next403/409/422, claim-context403/409 and risk403.
Each enum is the exact deduplicated union of existing oneOf branch code enums.
Outer type=object and required code are redundant with existing branch requirements;
no outer additionalProperties=false was added. Every existing branch, status,
context shape and branch additionalProperties restriction is unchanged. The scoped
JSON receipt records exact codes and before/after SHA256 values.

PASS: JSON parsing, six-response census, exact branch preservation, source Prettier
and node tools/contracts/check-commands.mjs (331 operations). Full contracts:check
and client generation remain parent-owned/pending deterministic generation. No
checker, tests, runtime, database or Git edits; no client generation performed.
