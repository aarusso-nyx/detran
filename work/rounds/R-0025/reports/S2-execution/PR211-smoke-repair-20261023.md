# PR211 smoke repair — bounded execution packet

Architect, Constitution Articles6–10. Owner active goal on2026-10-23: repair
and merge PR211. This packet acts within that authority, preserving every required
gate, immutable proof, historical failed result and the S3 runtime pause. It does
not authorize sibling edits, production activation, scorecard work or round closure.
Baseline924bb52cb7baff624a5123f32b118d844ccfaf7d; observed manual CI39955591719.

## Observations and repair boundary

The diagnostic printed16reports: aggregate38PASS/4FAIL. Three healthz probes
returned backend_unreachable/status0 immediately after backend restart; subsequent
readyz probes passed. RAIT proxy returned empty_json/HTTP200. Diagnostic/cleanup
steps passed and original smoke failure stayed intact. These reports do not prove
the underlying transport cause. A lightweight real-server experiment reproduced
a possible stale-connection ECONNRESET after synchronous restart, not exclusive CI
causality. No retry, sleep, timeout, status waiver or lifecycle change follows yet.

RAIT smoke currently uses coordinator/default actor without explicit oversight
read_scope. ADR0046/0047 require that binding; do not manufacture a new grant.
Use the existing fresh-local-stack secretary actor
00000000-0000-4000-8000-0000b0000005 with rait-secretary for pre-admission T only.
Existing core fixture provides authuser/tenant membership; freshRAIT fixture provides
active secretary pool membership and the protocolled case. Existing purposeSql T
predicate allows this matching membership/state; no S secretary administration or
M merits authority is inferred. Preserve expected fixture protocol number and all
nonempty/tenant/proxy assertions. No seed, action grant, route or backend change.

## Closed ownership

- Engineer: tools/stack/smoke.mjs only. Pass explicit frontend.actorId through
  restartFor, set it only for the RAIT secretary fixture, retain default/reset
  semantics for other personas. Add transportErrorName and transportCauseCode on
  transport failure only; preserve backend_unreachable/status0 and failed verdict.
- Inspector: tools/stack/contract.test.mjs and tools/stack/revision.test.mjs only.
  Assert exact persona+actor, unaffected other persona resets, known/unknown
  transport identifiers, arbitrary messages/code rejection and unchanged failures.
  Extend existing sensors rather than removing controls. Actual stack CI must
  validate fixture/authorization; mocked success alone is insufficient.
- Architect: this packet, work/rounds/R-0025/AUTHORIZATION.md, and
  docs/dev/operations/local-stack.md only for persona/diagnostic documentation.

Closed diagnostic identifiers: error.name admits TypeError, Error, AbortError,
TimeoutError; error.cause.code admits ECONNRESET, ECONNREFUSED, EPIPE, ETIMEDOUT,
ENOTFOUND, EAI_AGAIN, UND_ERR_SOCKET, UND_ERR_CONNECT_TIMEOUT,
UND_ERR_HEADERS_TIMEOUT, UND_ERR_BODY_TIMEOUT. Everything else maps to unknown.
Do not print raw exception messages, arbitrary properties, credentials, connection
strings or environment values. The safe fields must reach the failed report row.

## Sequence and stop conditions

Inspector RED against existing source, Engineer bounded implementation, Inspector
GREEN and structural review, affected stack tests/format/type checks, normal
fast-forward commit/push to211 and existing workflow_dispatch on exact head.
Capture all reports, failures and cleanup; next decision follows actual cause.
Transport lifecycle repair, any new path or authorization/grant change requires
a newly specified bounded amendment. No speculative successful retry is permitted.

Parallel approved scope/JW01/kernel validation uses exclusive disposable53343/53344
and unchanged backend/test source; this tools-only repair must not contend with
those resources. Preserve partial/resource-blocked outcomes accurately. Proof line7
remains a separate fail-closed blocker requiring the released supported upstream
recovery action and reviewed exact-version adoption; never hand-edit the chain.

## Execution checkpoint

Independent Architect review found no actionable packet finding. Inspector RED
against924bb52c:3selected tests failed on the expected persona and missing safe
identifiers. After the one-file Engineer change, focused3/3GREEN and complete
pnpm test:stack60/60PASS, nativeexit0. Source smoke.mjs SHA256
6167e569a9e89e4d7872356fe8b3ddb0763f9a168b1f186372525149e54d687b.
Inspector verified closed lists, all failure paths, one-attempt behavior and other
persona resets. Actual stack CI remains required; these tests do not prove health.

Parallel remaining acceptance retained406PASS scope/JW01. Canonical kernel native
exit1 after1435.284s: unit3069PASS/8historicalTODO; executed integration869PASS/1FAIL
with later stages not executed. Provisioning failure has a separate diagnostic
packet; no timeout was raised. Original kernel raw SHA256
89c658c5b5662f45dbad4af41d548bc7f7caffac1e3e794702b79104588402fa.
Full receipts remain in local durable custody under
/Volumes/Development/.codex/artifacts/detran/pr211-repair-20261023. No proof
anchor or acceptance promotion is inferred from human diagnostic custody.
