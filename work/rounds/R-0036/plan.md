# R-0036 — all 43 applicable scorecard cells

**Status:** assessment delivered; the round remains open for separate remediation,
without a formal closure or readiness claim. Initiated by the user's approved plan on 2026-10-18.
Backlog: BL-0001. Baseline: `3ec14d3a0e6b274dc367157bc4958f81750c5dc8`.

The initial assessment contract and its historical results are preserved below. The user-authorized measurement extension and current results are recorded at the end of this plan.

## Goal

Evaluate every applicable cell using DEVAI 2.2.0, enable supported sensor inputs,
and deliver a 43-row register, exact-commit scorecard, evidence manifest, baseline
comparison, and separate remediation backlog. Preserve F1:T1 and F4:T5 as N/A,
all thresholds, historical proofs, and failed observations. No application fixes,
production probes, external service probes, new performance targets, k6, mutation
workloads, sibling repository edits, publishing, or merging.

## Waves

1. Architect: register round and schema-valid source declaration; inventory the
   measured population. Freeze configuration in a branch commit before measurement.
2. Engineer: run builds and existing database setup against an isolated local
   PostGIS instance. Inspector: execute tests and persist native SensorReadings.
3. Auditor: run all canonical first-pass sweep members, record through an Inspector
   invocation, then run and record both second-pass members. Record failures too.
4. Auditor: reconcile all 43 cells and distinguish native verdicts from sufficient
   whole-repository measurement. Write reports under `.devai/local/rounds/R-0036/audit/`.
5. Architect: publish the assessment into these round working papers, with a hash
   manifest and remediation references. Run affected checks and evidence verification.

## Execution constraints and defaults

- R-0034/R-0035 remain reserved for C-0003; this evaluation uses R-0036.
- `law/policy/scorecard-sensor-inputs.json` is the validated input source. The
  installed binding actions have no sensor-input materialization operation. Do not
  hand-write `.devai/config/sensor-inputs.json`; pass supported explicit inputs to
  the CLI and record the missing binding operation as a remediation item.
- CI sample: `ci.yml`, push on main, latest attempts, completed non-cancelled runs
  in the last 30 days, minimum 10 observations, no job exclusions. These are
  observation-population choices, not changed verdict thresholds.
- Coverage target is the full RC population with no declared exclusions. Missing
  full-population coverage is a blocker; a package report cannot replace it.
- Suite declarations reuse existing backend scripts; their narrower population is
  explicit. Workspace package/test inventory and supplemental executions expose
  frontend, adapter, mock, tooling, and script omissions separately.
- The canonical sweep remains unfiltered. If the CLI rejects an existing suite
  command, retain that refusal and run available suites as supplemental evidence;
  never disguise a script behind an allowlisted command.
- Keep machine verdict, observational errors, and scope limitations separate.
  Complete means 43 dispositions; measured counts exclude blocked/partial cells.

## Acceptance

Exactly 45 unique scorecard coordinates; 43 register rows and the original two
N/A cells. Every row names sensor commands, criteria, population, evidence,
limitations, and follow-up ownership. Evidence verification passes, or a verified
baseline failure is separately disclosed. No readiness claim from command success.

## Assessment delivered

Evaluated commit: `34a89f845146523161f401ae758b5fb9fab8db93`. All 43 cells have
dispositions: 19 measured for the stated sensor predicate, 13 partial, 11 blocked.
Native scorecard: 18 PASS, 10 REVIEW, 12 FAIL, 3 UNKNOWN, 2 unchanged N/A; overall FAIL.
52 native readings were recorded. Remediation findings: BL-0002 through BL-0011.

- [Assessment and validation](reports/evaluation-34a89f84/assessment.md).
- [43-row evaluation register](reports/evaluation-34a89f84/evaluation-register.json).
- [Native scorecard](reports/evaluation-34a89f84/final-scorecard.json).
- [Evidence manifest](reports/evaluation-34a89f84/evidence-manifest.json).
- [Prioritized remediation backlog](reports/evaluation-34a89f84/remediation-backlog.md).

Native build, supplemental workspace typecheck, backend unit/integration/E2E/upgrade,
mock and adapter tests, and affected governance checks passed. Six frontend timeouts
passed targeted reruns without assertion or timeout changes. Existing empty package
suites and TODOs are explicitly inventoried. Full formatting reports only the
pre-existing ignored `.claude/settings.local.json`; delivered source formatting passes.
The disposable database and both mock services were stopped and their removal recorded.

## Authorized measurement extension completed — 2026-10-19

The Owner authorized adopting the latest published DEVAI, separate measurement repairs in DEVAI, integration after mandatory green checks, release 2.6.3, and new generous performance targets/suite. These authorizations supersede only the corresponding initial restrictions above. ADR-0044 defines the new local request-path baseline; ADR-0050 explicitly replaces proposed RC coverage with whole-source **local unit** coverage and separately measured database tiers; ADR-0051 records published DEVAI 2.6.3 adoption. All existing thresholds, product behavior and historical evidence remain preserved.

The DEVAI source repairs landed through #413, #415 and #416, with #414 preserved and closed as superseded by #416. The verified 2.6.3 release was adopted through registered upgrade/binding operations.

Frozen evaluation commit: `e9e45a4a6cbed5cfd394c716c79a55b1aca386b8`. All **43 applicable cells are measured**, including the original 11 blocked items. Native result: **24 PASS / 10 REVIEW / 9 FAIL / 0 UNKNOWN / 2 unchanged N/A**; overall FAIL. No readiness or formal round-closure claim is made.

The replay order is prerequisites, **record prerequisites before emitting any repeated sensor kind**, first canonical pass, record, second store-reader pass, record, and exact-commit scorecard. In particular, recording prerequisite coverage before the first-pass coverage emission gives its new instance an explicit immutable supersedes link. The refused ambiguous attempt remains historical evidence.

- [Completed assessment](reports/evaluation-e9e45a4a/completion.md).
- [43-row register](reports/evaluation-e9e45a4a/evaluation-register.json).
- [Native scorecard](reports/evaluation-e9e45a4a/scorecard.json).
- [Evidence manifest](reports/evaluation-e9e45a4a/evidence-manifest.json).
- [Baseline comparison](reports/evaluation-e9e45a4a/baseline-comparison.json).
- [Separate prioritized backlog](reports/evaluation-e9e45a4a/raw/remediation-backlog.md).

BL-0002 through BL-0012 are resolved as measurement findings. Product/governance tasks BL-0013 through BL-0023 remain open. The independent current-baseline replanning and unapproved P4 packet remain outside this work.

## PR #202 — reconciliation with main

The main decisions and round states are preserved. ADR-0050 and ADR-0051 are the current coverage/adoption identifiers; the old measurement slugs resolve through ADR-0035 redirects and aliases. Frozen reports retain their original identifiers and hashes. [Reconciliation and exact history custody](reports/pr202-reconciliation-20261019/reconciliation.md) preserves both evidence histories and documents native chronological proof recovery. The frozen scorecard is not a new measurement of the integrated main product tree; current Owner decisions remain those preserved from main.

## Encerramento oficial — 2026-10-19

Após autorização expressa do Owner, a integração do PR #202 e a atestação local
foram registradas em `reports/closure-20261019/`. O runtime emitiu **PC-0022**,
materializou o registro fechado e executou `round seal`; `round status` confirma
`closed`. A avaliação permanece congelada em e9e45a4a, com resultado geral FAIL.
BL-0013 a BL-0023 continuam abertos e inalterados; nenhuma correção de produto,
release DETRAN ou nova medição do produto integrado faz parte do fechamento.
