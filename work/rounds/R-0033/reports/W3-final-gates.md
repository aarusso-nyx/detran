# R-0033 — W3 final delivery gates

Role: Auditor / orchestration receipt. This is a pre-PR report, not a round closure.

The preserved checkpoint `aca40880ae0d8e2c5e292f92627904c7e4453748` was merged
normally with main `3ec14d3a0e6b274dc367157bc4958f81750c5dc8` in `311412f9`.
The final preview builds use source commit
`3eeb95ca9989a7d2a86b9319fd3a1c8f59d89989`. Subsequent delivery receipts change
documentation and generated evidence only; the artifact identity follows plan D-12/A6.
Node 24.22.0, pnpm 9.15.0, DEVAI 2.2.0, Constitution 1.0.2, STYNX 1.5.3.

## Local acceptance

| Gate | Observed result | Receipt |
| --- | --- | --- |
| Complete `pnpm check` | PASS, exit 0, including every step in root package.json | `W3-pnpm-check.log` |
| Portal final regression suite | 125 files; 1551 passed, 14 existing todo | full check log |
| RAIT final regression suite | 163 files passed, 1 skipped; 4958 passed, 139 existing todo | full check log |
| Other app suites, workspace typecheck, lint, production builds | PASS through the complete serial chain | full check log |
| Doctor | PASS, `ok: true` | `W3-doctor.log` |
| Round task validation | PASS, 320 tasks | `W3-round-tasks.log` |
| Production isolation | Portal 35 files; RAIT 47 files; both indexes present, marker absent | `W3-production-gates.log` |
| Development isolation | Portal 71 files; RAIT 108 files; marker absent in every emitted file | `W3-development-builds.log` |
| Final preview builds | Both PASS after the complete production/check chain | `W3-final-preview-builds.log` |
| Final live preview smoke | Both HTTP 200 with their own preview root; owned process groups terminated | `W3-final-smokes.log` |
| Final manifests | RAIT 48 files and Portal 32 files, every size/hash verified | `W3-artifacts.json` and both manifests |
| Final RAIT browser | 87 captures, two role-denial counterexamples; 29 axe pages, zero serious/critical, 13 moderate retained | `W3-rait-capture.log`, `W3-rait-axe.log`, versioned captures/report |
| Final Portal browser | PASS: 38 routes, 96 captures, 32 axe pages, two guard counterexamples; zero `/v1`, console or page errors; all 32 tested asset hashes match the final manifest | `W3-portal-browser.json` |

The first complete check attempt stopped at the offline Compose configuration test:
the host Docker CLI could not locate the installed Compose plugin. The unchanged test
passed in the final full run with `DOCKER_CONFIG=/tmp/r0033-docker-config`, whose
`cli-plugins/docker-compose` symlink points to the installed Docker Desktop Compose
5.6.0 binary. No daemon, repository test, gate, or user Docker configuration was changed.
The unsuccessful attempt is preserved in `W3-pnpm-check-compose-missing.log`.

## Boundaries and limitations

All pre-existing application test files remain unchanged against current main. New
tests are confined to the preview modules. The round diff excludes backend code,
generated clients, STYNX pins, workflows, `.devai/`, `record/`, `law/register`, and
`policy.ts`. The governed and legacy proof chains are preserved; proof verification
passed as part of the complete check.

Portal keeps all 38 canonical routes and the real guards. The canonical catalog has
no `junta_medica` service: its route honestly redirects to
`/servico-indisponivel/junta_medica`. Anonymous and insufficient-assurance access
remain denied. Preview control reads do not invent service availability. Commands,
authentication flows and downloads remain non-functional and observable; no fake
success or `/v1` response is synthesized.

The Portal translation overlay remains isolated. Its type-derived key registry and
new regression tests validate all 15 keys while preserving the original production
catalog and its existing scanner. CPF-bearing `me` variants without a canonical seed
source are omitted; the canonical fixture without that field remains intact.

All accessibility findings remain visible. RAIT's 13 moderate findings and Portal's
six smaller findings in the final browser run are not presented as fixed.
Existing untranslated pagination and other documented kit/page limitations remain
follow-ups. Dashboard/TEAT preview expansion and OD-C3-009 decisions are deferred.
k6 and mutation remain not run under the recorded Owner decision.

## Delivery state

`preview-R-0033.zip` contains both final static builds and their manifests. The ZIP
CRC check passes; its SHA256 and local path are in `W3-artifacts.json`. It is an
ignored build artifact, not a committed static bundle. Upload awaits the GitHub
browser sign-in requested from the Owner; CLI authentication is already usable.

Cross-family delivery review: **PASS**, Claude via CLI alias `opus`, cycle 1,
read-only against `40741b11a7053df98d6b914c9389d60faba6a36e`. Receipt:
`../reviews/delivery-review-W3-1.json`; bridge: `../reviews/delivery-review-W3-1.bridge.json`.
Prompt SHA256 `f8061926301a83c05fa7e3db510583ed70af1b8d71a8f1a268910283d3a8231b`;
output SHA256 `f33130a3e6b4e279e47dc0bdb39246f0c0eaa50e754a411a31d332d043db1aab`.
The two low findings are addressed by clarifying the final browser status and
network observation scope; neither requires runtime changes or another review.

The Portal browser network sensor observes `/v1` and descendants only. Its zero
requests result does not independently measure every origin or URL. The broader
restriction is supported by the preview interceptor, HTTP mock/unit specs with
`expectNoNetwork()`, replacement stream transport, null auth provider and
`uploadToSignedUrl` override. A future browser sensor should observe all requests
outside same-origin documents, bundles and `assets/**`; this follow-up is not a
condition for opening this PR (delivery-review low finding 2).

PR [#191](https://github.com/aarusso-nyx/detran/pull/191) is open (initial published head `bb6c4458`).
Remote CI was pending at PR creation; follow the live [PR checks](https://github.com/aarusso-nyx/detran/pull/191/checks).
No remote PASS is claimed here. ZIP upload remains pending on browser authentication.
Build source `3eeb95ca` and review HEAD `40741b11` identify their observed trees;
subsequent commits change metadata only. Merge, governed round evidence
recording, exact-merge audit, round close and round seal remain post-integration
steps requiring their own authority; C-10 remains partial and no round closure is claimed.
