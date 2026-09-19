---
schemaVersion: '1.0.0'
round_id: 'R-0009'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-16T00:00:00.000Z'
source: 'Explicit user instruction of 2026-09-16: "Execute @work/rounds/R-0009/prompts/00-maestro.md e prossiga até o completo encerramento do round com o merge correspondente" (single Owner message of the session; lifts the suspension recorded on 2026-09-16 in plan.md §Retomada, "suspenda a execução até disponibilizarmos o R-0007")'
publication: true
release: false
---

# R-0009 authorization

The Owner explicitly instructed the maestro to execute the R-0009 maestro prompt and proceed
until the complete closure of the round with the corresponding merge. This lifts the earlier
suspension ("until R-0007 is available"): R-0007 `rait-backend` has not started (no remote branch,
no PR), so CTG-0002 is delivered as the prompt §0 prescribes — delegated routes answer
`PORTAL.SERVICE_UNAVAILABLE` with reason and the real-delegation test is marked `todo` citing R-0007.

This record transcribes the instruction through the prompt's declared boundary: normal push of
`orchestra/portal-backend`, PR creation against `main`, merge after green CI and cross-family
PASS, exact-SHA audit observation, and governed round-close. It grants no package publication,
release, deployment, force-push, or mutation outside this repository. It was written by the maestro
from the Owner's instruction, not by the Owner; the Owner may revoke or amend it.
