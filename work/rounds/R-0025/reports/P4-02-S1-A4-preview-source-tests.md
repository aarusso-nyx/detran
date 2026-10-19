# P4-02-S1-A4 — preview fixture integrity versus authorized client subsets

Status: PROPOSED. Architect, Article 7. No runtime/data grant.

Independent review required denial of unmatched preview purposes and unsupported
T resources. The unchanged 20 new boundary controls pass. The full RAIT suite
found nine old assertions in preview-fixture-source.spec.ts that expect every
canonical party/document/admissibility row through the default analyst client.
Those expectations predate T0's closed triage/archive projections and now conflict
with them. Restoring unconditional visibility would reopen the reviewed flaw.

## Exact bounded extension

Add Inspector ownership of only:
apps/rait/web/src/app/preview/preview-fixture-source.spec.ts

Retain canonical JSON integrity, method override, no-network, clock/session,
source_pending and original source-backed journey assertions. Verify full
canonical collection membership/parent integrity directly through the existing
fixture store/helper. At the client boundary, independently specify the qualified
role/purpose subsets from T0, assert exact visible IDs/counts and by-ID successes,
and explicit denial for withheld records. Preserve positive authorized actor
coverage and the new 20 boundary controls. Do not replace assertions with empty
checks, skip/TODO, unsafe casts or implementation-derived expected output.

No runtime, fixture JSON, role input normalization, permission, policy, UI,
config/threshold or scorecard change. The separately observed case-decision a11y
timeout must first be rerun in isolation; its already-colocated A2 spec does not
expand this packet.

Inspector captures the unchanged failure receipt, changes this single owned
spec in the Inspector worktree, then reruns focused and full RAIT tests against
frozen runtime. Parent records approval in R-0025 AUTHORIZATION.md and this report.
Any additional unowned path or lost qualified journey stops for review. No PR
merge, S2 or round closure is authorized.
