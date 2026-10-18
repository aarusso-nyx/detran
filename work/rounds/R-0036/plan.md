# R-0036 — all 43 applicable scorecard cells

**Status:** active evaluation, initiated by the user's approved plan on 2026-10-18.
Backlog: BL-0001. Baseline: `3ec14d3a0e6b274dc367157bc4958f81750c5dc8`.

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
