<!--
  Vendored copy of the DEVAI Constitution (version 0.3.0), imported from the
  DEVAI repository (aarusso-nyx/devai, commit b985ab4) at the @devai-nyx/cli
  0.1.1 registry cutover. Previously this file was a symlink to
  ../devai/CONSTITUTION.md and required a sibling DEVAI checkout.
  Do not edit locally: upgrades happen only by re-vendoring from a DEVAI
  release (Constitution upgrade policy, Part I).
-->
# DEVAI Constitution

**Version:** 0.3.0
**Status:** ratified for implementation

This is the immutable axiom set for DEVAI. Every other artifact in the framework — contracts, charters, skills, bootstrap layout, scorecard — derives from these axioms and may not contradict them.

The constitution is part of substrate F5 (Harness). It is upgraded only via the DEVAI release process and version-bumped per change. Client repositories inherit the constitution at bootstrap time and pin to a specific version; constitutional upgrade in a client is an explicit `devai upgrade` operation, never an implicit one.

The constitution states what must always be true. It does not state how mechanisms are implemented; those are in skills, charters, and contracts.

---

## Part I — Mission and frame

### Article 1. Purpose

DEVAI is a multi-loop, multi-dimensional control framework for AI-assisted software development on a declared stack. The primary stack is NestJS, Angular, Postgres; additional stacks are supported through stack-adapter packs carried as F5 policy artifacts. Each adopter repository declares exactly one resolved stack; the framework's mechanisms assume a declared stack per repository, not stack universality. Its purpose is to allow autonomous and semi-autonomous agents to write, test, and document code on a shared codebase while preserving the semantic intent of human authority and producing auditable evidence of every change.

### Article 2. Control-theoretic frame

The framework treats software development as a discrete-time control system:

- Documents (specifications) are the reference signal.
- Code (the plant) is the system under control.
- Tests (sensors) measure plant behavior against reference.
- Error is the deviation of measurements from reference.
- Agents (controllers) act on the plant to minimize error.

This frame is binding on framework vocabulary, mechanism design, and gate semantics.

### Article 3. Operating mode

DEVAI operates as a steady-state regulator. There is no terminal "done" state. Work enters the framework as backlog items, is regulated through the control loop, and exits as merged commits with retained evidence. The framework is quiescent when the backlog is empty and integration is stable; it does not spawn work on its own.

---

## Part II — Substrates and properties

### Article 4. Fundamental substrates

The framework partitions all artifacts in a client repository into five fundamental substrates. Each substrate has a distinct authority, a distinct file population, and a distinct sensor regime.

- **F1 — Specification.** The reference signal. Includes business specs (Owner-authored), engineering specs (Architect-authored), invariants, trace, ADRs, glossary, contracts.
- **F2 — Plant.** Application code under control. Source code, migrations, configurations, infrastructure-as-code, build scripts.
- **F3 — Observation.** Sensors. Tests at all levels, plus the configurations of executable sensors (linters, type-checkers) when those configurations encode intent rather than ambient defaults.
- **F4 — Inventory.** Plant-identification artifacts. Derived deterministically from F1, F2, F3. Never authored.
- **F5 — Harness.** The DEVAI machinery as instantiated in the client repo. Includes this constitution, contracts schemas, skill manifests, agent prompts, role configurations.

### Article 5. Transversal properties

Every substrate is evaluated against the same nine transversal properties. The Cartesian product of substrates and properties defines the aspect grid against which the scorecard is computed.

- T1 — Coverage
- T2 — Depth
- T3 — Coherence
- T4 — Alignment
- T5 — Idiomaticity
- T6 — Security and Privacy
- T7 — Performance and Efficiency
- T8 — Robustness
- T9 — Discipline

Some cells in the aspect grid are degenerate (e.g., Inventory × Idiomaticity) and are marked N/A in the scorecard.

### Article 6. Substrate authority-by-path

Authority is enforced by filesystem path. The harness refuses writes that violate this mapping at the tool layer, not at review time.

- F1 Owner-authority paths: `docs/framework/product/`, `docs/framework/glossary/` (joint with Architect).
- F1 Architect-authority paths: `docs/start/`, `docs/theory/`, `docs/framework/` (excluding `product/`), `docs/framework/glossary/` (joint with Owner), `docs/roles/`, `docs/adopters/`, `docs/reference/`, `docs/meta/`, `README.md`.
- F2 Engineer-authority paths: all source code under `apps/`, `libs/`, `db/migrations/`, `db/seeds/`, `iac/`, build scripts at root level.
- F3 Inspector-authority paths: `**/*.spec.ts`, `**/*.test.ts`, `tests/`, `e2e/`, and configuration files that encode test intent.
- F4 paths: `.devai/inventory/`. No human or agent writes; regenerated only by the inventory subsystem.
- F5 paths: `.devai/` (excluding `inventory/` and `worktrees/`). Modified only via `devai upgrade`, never by ordinary disciplines.

Clients may extend the path mapping for client-specific disciplines. Extensions are additive; the core mapping is immutable.

---

## Part III — Roles and authorities

### Article 7. Human roles

A human user of DEVAI declares one of five roles at session start. The declaration constrains which agent disciplines the harness may dispatch during that session. Cross-role work requires a session boundary.

- **Owner.** Business and behavioral authority. Authors and modifies business specifications under F1 Owner-authority paths.
- **Architect.** Engineering authority. Authors and modifies engineering specifications, invariants, trace, and ADRs under F1 Architect-authority paths.
- **Inspector.** Sensor authority. Authors and modifies tests under F3 paths.
- **Engineer.** Plant authority. Authors and modifies code under F2 paths.
- **Auditor.** Observer authority. Read-only on all substrates. Produces reports, scorecards, backlogs, status assessments. The Auditor role makes no commits that modify F1, F2, F3, or F5.

### Article 8. Agent disciplines

Each human role has a corresponding agent discipline with the same authority constraints. Agent disciplines may be specialized (e.g., Engineer subtypes for Backend, Frontend, DBA, UI/UX) but specializations share the parent discipline's authority and protocol; they differ only in expertise prompts and tool access.

Inspector and Auditor are non-extensible singleton disciplines, to prevent sensor-calibration fragmentation and observation-authority fragmentation respectively. Owner, Architect, and Engineer are extensible under their respective authority classes.

### Article 9. Authority chain

The authority chain is:

**Human > Constitution > Architect/Owner > Contracts > Engineer**

Closer-to-code documents lose against higher-level documents when they contradict. A function-level docstring that contradicts an architecture ADR loses; an ADR that contradicts the constitution loses; the constitution loses only to the human Architect operating outside any session (via `devai upgrade`).

This rule prevents the canonical failure mode of agents rewriting high-level documents to match code they have written.

### Article 10. Authority separation in a single loop iteration

Within a single loop iteration, no discipline may both set its own reference and actuate against it. Architect may not edit code; Engineer may not edit tests; Inspector may not edit specifications. Cross-substrate work in a single task is therefore impossible by design; coordinated work across substrates traverses the authority chain via coupled task triplets (Article 24).

---

## Part IV — Specifications and invariants

### Article 11. Invariant as atomic spec unit

The atomic unit of Architect-authored specification is the invariant. An invariant has a unique ID of the form `INV-<DOMAIN>-<NNN>`, a severity (`must` or `should`), a type, a canonical statement, a rationale, a scope, a change policy, a verification declaration, and authority anchors back to source documents.

Invariants are the control setpoints of the framework. Every test references one or more invariants. Every scorecard computation is ultimately reducible to invariant-level measurements.

### Article 12. Owner-authored specs and compilation

Owner-authored artifacts (journeys, user stories, acceptance criteria, business rules) constitute the business tier of the reference signal. They are written in a structured natural-language schema and are not themselves invariants.

The link between Owner-authored artifacts and Architect-authored invariants is explicit: every Owner artifact references the invariants it depends on (zero or more). The `elicit` skill assists Owners and Architects in identifying invariant gaps relative to business artifacts.

### Article 13. Trace

Trace is the F1 artifact that maps each invariant to:

- The Owner or Architect documents that justify it (authority anchors).
- The tests that probe it (test references with reliability metadata).
- The code areas that implement it (path globs).

Trace lives at `docs/framework/arch/trace.json` under Architect authority. Inspector and Engineer consume trace but never edit it. Trace completeness ratios are deterministic gate inputs.

### Article 14. Per-invariant change policy

Each invariant declares its own mutability rules in a `change_policy` field, including: what artifacts must be updated together when the invariant changes, whether test weakening relative to this invariant is permitted, and whether human approval is required for changes. The orchestrator enforces these rules at the tool layer.

This grades the authority chain at invariant granularity. A security-critical invariant can require human approval to modify even within an authorized Architect session.

---

## Part V — The control loop

### Article 15. Loop entry through triage

Every failure that enters the framework is classified by the triage skill before any remediation is dispatched. Triage assigns each failure to exactly one of four classes:

- **plant-bug** — code violates clear specification. Routes to Engineer.
- **sensor-error** — test, probe, or adapter is incorrect, stale, or misconfigured. Routes to Inspector.
- **policy-issue** — harness policy or threshold is misconfigured. Routes to harness review.
- **reference-gap** — specification is silent, contradictory, or ambiguous. Routes to Architect or Owner via RGR (Article 22).

No discipline begins feedback work until triage has classified the failure.

### Article 16. Cycles

The loop has three cycle levels:

- **Cycle A** — within-iteration checkpoint. Type-check, lint, affected-only unit tests. Runs continuously during agent work. No iteration counter advance.
- **Cycle B** — pre-merge gate. Full hard gate on task scope. Iteration cap applies here.
- **Cycle C** — post-merge integration. Full scorecard including soft gates and Auditor regeneration. Runs once per merge.

### Article 17. Hard gate

The hard gate is the deterministic component of Error(0). It comprises:

- Type-check clean on affected projects.
- Lint clean on errors (warnings handled by `Plant × Discipline`).
- Build succeeds for all affected apps.
- All assigned unit, integration, API, DB, E2E, and journey tests pass.
- Migrations apply cleanly from empty database.
- Contract validation: OpenAPI, JSON Schema, SQL DDL contracts validate; generated artifacts regenerate to identical bytes.
- Inventory regenerates without error.
- AST-diff test-weakening check: weakening does not exceed configured thresholds (Article 30).

A merge requires the hard gate fully green. The hard gate is non-negotiable.

### Article 18. Soft gate

The soft gate is the stochastic component of Error(0). It comprises LLM-judged scorings against documented rubrics for: spec coherence, plant idiomaticity not covered by linters, test depth and non-triviality, spec-to-test traceability quality, and mutation-testing kill rate where applicable.

Every gate verdict is tri-state: **PASS**, **REVIEW**, or **FAIL**. PASS allows merge; FAIL blocks merge; REVIEW triggers the tie-breaker ladder (Article 23) before resolution. The hard gate emits only PASS or FAIL; the soft gate may emit any of the three.

Soft-gate evaluation is performed by a model distinct from the working agent — at minimum a different model instance with no shared context, preferably a different model family from the tie-breaker ladder. This prevents an agent from being evaluator of its own output.

A merge requires both gates at or above their thresholds. Thresholds live in `.devai/scorecard/thresholds.json` with DEVAI-supplied defaults and per-client overrides permitted.

### Article 19. Iteration cap and bump-model escalation

A Cycle-B convergence attempt that does not pass both gates within three iterations at the default model tier triggers escalation. One additional iteration is then attempted at the next model tier; the bump itself counts as that fourth iteration. Total budget across both tiers is therefore four attempts.

1. After the three default-tier iterations are exhausted, the same task is re-spawned at the next tier of model power for one final attempt.
2. If the bumped-tier iteration also fails to pass both gates, the task escalates to human.

Cycle-A micro-iterations within a Cycle-B attempt do not count against the cap. The cap exists to prevent agent thrashing, not to prevent work.

### Article 20. No automatic revert

Once work has been merged to the integration branch and the post-merge gate has passed, that work is committed history. The framework shall not roll back integration HEAD as part of any automated remediation. Rework caused by rebase onto new integration HEAD is not a revert; it is normal pipeline behavior.

A human Architect may deliberately spawn a corrective task that performs a `git revert` of a specific merge. This is a human action, not framework automation.

### Article 21. Escalation lifecycle (convergence failure)

When a task escalates to human after iteration-cap exhaustion:

1. Backlog entry status changes to `escalated` with full failure context.
2. Task branch is renamed to `escalated/<task-id>`.
3. Module locks held by the task are released.
4. Worktree is destroyed; per-worktree database is dropped.
5. Human is notified via the configured channel.
6. The orchestrator does not spawn a replacement task. Resolution awaits human action.

Human resolution paths: adopt the escalated branch in a human-owned worktree (not counted against the worktree cap); edit the specification to make the task feasible and re-queue; or cancel. Escalated branches are preserved indefinitely; pruning is a manual human-invoked operation.

### Article 22. Reference Gap Report (RGR)

Any agent discipline (Engineer, Inspector, Auditor) may emit an RGR when triage classifies a failure as reference-gap, or when the discipline encounters a specification ambiguity it cannot resolve within its authority.

RGR contains: the invariant or artifact under examination, the specific ambiguity, the impacted surfaces, the risk classification, evidence gathered, and an optional non-authoritative suggested resolution. The RGR also carries structured questions (each with a qid and optional candidate answers) so that resolution by the Architect or Owner is concrete rather than open-ended.

RGR pauses the emitting task: module locks released, branch preserved as `rgr/<task-id>`, worktree destroyed, backlog entry status changes to `rgr-pending`. The RGR routes as a high-priority backlog item to Architect or Owner.

When the spec update is merged to integration, the paused task auto-resumes: orchestrator spawns a fresh worktree from new integration HEAD with RGR resolution as additional context.

RGR is the only authorized upward semantic feedback path from implementation disciplines to specification disciplines.

### Article 23. Tie-breaking ladder

When two disciplines disagree on whether a change satisfies a specification, or when a soft-gate verdict is REVIEW, the resolution ladder is:

1. Independent verification by a model from a different family with the same context and prompt.
2. If still tied, escalate to a larger model in the same family.
3. If still tied, escalate to a larger model in the alternate family.
4. If still tied, escalate to human.

The concrete model families and the ladder's tier ordering are F5 policy configuration, not constitutional text; they are recorded in the harness policy artifacts and may change without constitutional amendment.

The ladder applies to soft-gate scoring disputes, RGR ambiguity classification, triage classification confidence below threshold, and any other case where stochastic judgment governs.

---

## Part VI — Concurrency

### Article 24. Coupled task triplets

Work that spans the authority chain is grouped into coupled triplets: an Architect task that produces invariant changes, an Inspector task that produces tests for those invariants, and an Engineer task that produces code satisfying those tests. The three tasks share a `coupled_task_group` ID in the backlog.

Triplet branches form a pipeline:
- Architect branch is created from integration HEAD.
- Inspector branch is created from Architect's HEAD.
- Engineer branch is created from Inspector's HEAD.

Merge order respects the authority chain: Architect to integration first, then Inspector, then Engineer. Each merge triggers rebase of downstream pipeline branches.

Triplet branches may execute concurrently in separate worktrees. They synchronize via checkpoints (Article 26).

### Article 25. Module-level semantic locking

Concurrent tasks coordinate through module-level locks tied to F4 inventory units. Before spawning a task worktree, the orchestrator acquires locks on the `(substrate, module)` pairs the task declares in its `target_modules` field.

If any required lock is held, the task is denied and re-queued with priority bump. After repeated denials a task is flagged blocked for human review.

Locks are held for the lifetime of the task worktree and released on merge, escalation, or RGR pause.

Locks are not held across coupled-triplet boundaries; each task in a triplet acquires and releases its own locks.

### Article 26. Checkpoints and pipelined rebase

Upstream branches in a coupled triplet emit explicit checkpoints when their work reaches a stable consumable state. Downstream branches rebase automatically on upstream checkpoint emission and on upstream merge to integration.

Downstream branches do not rebase on every upstream commit. Checkpoint cadence is at the upstream discipline's discretion, with one mandatory checkpoint at task completion.

### Article 27. Worktree discipline

All agent work occurs in dedicated worktrees under `.devai/worktrees/<task-id>`. The repository root checkout is reserved for human use; agents do not operate in the root.

The active agent worktree count is capped. The cap value is a harness policy parameter, not constitutional text; the decision log records the current default. Harness-owned worktrees (the persistent inventory worktree, the human-adopted review worktrees for escalated branches, the dedicated soft-gate evaluator worktree) are tracked separately and do not count against the cap.

A worktree is provisioned with cache symlinks to shared `node_modules`, TypeScript build cache, Jest cache, and ESLint cache, provided the package lockfile hash matches the integration HEAD. On lockfile mismatch, the worktree falls back to fresh install.

### Article 28. Single integration branch

The repository has a single integration branch (`main`). Task branches merge directly to it. No `staging` layer exists in the default DEVAI configuration.

---

## Part VII — Sensors and observation

### Article 29. Test as sensor

A test is a sensor on the plant. Tests measure plant behavior against specification. Tests are not malleable documentation and must not be modified to make failing code pass.

Inspector authority over tests is constrained by Article 30 (weakening) and by trace (Article 13): every test references the invariant or invariants it probes.

### Article 30. Test weakening prohibition

Every commit touching F3 is AST-diffed against its parent commit. Weakening events are quantified by metrics including: change in assertion count, change in expect-call count, change in HTTP-status assertions, addition of `skip`/`todo`/`only` annotations, and removal of invariant references.

A test change is **unjustified weakening** when its weakening metrics exceed configured thresholds in `.devai/scorecard/thresholds.json` AND the weakening does not correspond to a tracked invariant change (deprecation, retirement, or scope reduction with Architect commit).

Default thresholds: maximum 20% assertion-decrease ratio per file, absolute floor of one assertion, exempt when test-case count increases (split-not-weaken pattern). Clients may tighten or loosen thresholds per-aspect.

Unjustified weakening produces a hard-gate `FAIL`. Weakening within thresholds but without tracked invariant change produces `REVIEW`. The Inspector or Engineer must either strengthen back, justify against an invariant change, or emit an RGR.

Per-invariant `change_policy.test_weakening_allowed: false` overrides all thresholds for tests referencing that invariant: any weakening is unjustified regardless of magnitude.

An Inspector acting outside a coupled triplet has no authorized route to weaken a test independently. Relaxation of an over-strict assertion requires either an Architect invariant change (Article 24) or an RGR (Article 22).

### Article 31. Flaky test quarantine

Tests identified as flaky by repeated non-deterministic outcomes may be moved to quarantine. Quarantined tests carry metadata in trace (`flaky: true`, `quarantine: true`, optional ticket reference) and are excluded from hard-gate failure aggregation.

Quarantine is a temporary state subject to Auditor scrutiny. The Auditor surfaces the quarantine list periodically and pressures it toward zero. A quarantined test that remains broken indefinitely is itself a hard-gate failure of `Observation × Discipline` and surfaces in the scorecard.

### Article 32. Sensor adapter uniformity

Every executable sensor emits its output through a normalized `SensorReading` schema: status, evidence path, timestamp, command, command hash, failure mode, optional structured findings. Scorecard composition is polymorphic over sensor types via this contract.

---

## Part VIII — The auditor and the backlog

### Article 33. Auditor as state estimator

The Auditor is outside the control loop. It does not actuate; it observes and reports. The Auditor regenerates the F4 inventory, recomputes the scorecard, compiles the backlog from scorecard deltas, and updates the status assessment.

### Article 34. Auditor spawn cadence

The Auditor runs:

- Automatically after every merge to integration, in the persistent inventory worktree, as a post-merge hook.
- On demand by human request.
- On demand by orchestrator request before spawning a task batch.
- Never on a timer; the framework is quiescent when integration is quiet.

### Article 35. Backlog as the only work queue

All work entering the framework passes through the backlog. The orchestrator dequeues tasks; humans and external callers add tasks via explicit backlog operations. There is no direct task injection that bypasses the backlog.

This invariant gives the controller a single queue to regulate.

---

## Part IX — Self-application and harness governance

### Article 36. DEVAI applies to itself

The F5 substrate is scored by the same scorecard machinery that scores F1 through F4. The constitution, contracts, charters, skills, and prompt registry are subject to coherence, alignment, and discipline measurement.

Drift between the framework version installed in a client and the upstream DEVAI release is itself a scorable property of F5.

### Article 37. Prompt composition is governed

Agent prompts are composed deterministically from global, role, task, and payload components. Each composition records component hashes and an overall stack hash. Drift in any component hash is detectable and attributable.

When prompt behavior is part of a governed loop, prompt fingerprints may be frozen and tracked as sensors on F5.

### Article 38. JSON canon

All machine-readable artifacts produced or consumed by the DEVAI engine are JSON. Markdown is valid only for prose documents, prompt bodies, and human-readable reports. Markdown does not carry canonical machine-readable metadata.

### Article 39. Explicit uncertainty over false precision

When uncertainty remains after available checks, the framework records explicit uncertainty rather than fabricating precision. A scorecard cell may be reported as `unknown`; a triage classification may be reported as `inconclusive`; a soft-gate score may be reported with a confidence interval.

---

## Part X — Amendments

### Article 40. Amendment process

Amendments to this constitution are made only via the DEVAI release process. A client repository pins to a specific constitution version and adopts amendments by explicit `devai upgrade` action.

The constitution's history is preserved indefinitely. Every amendment records: the article changed, the prior text, the new text, the rationale, and the version bump.

Clients may not amend the constitution locally. Client-specific rules go into policy artifacts under F5, not into the constitution.

---

## Amendment history

### 0.1.0 → 0.1.1

Pre-Phase-0 reconciliation pass. The `devai upgrade` mechanism (Article 40) is a Phase 7 deliverable and does not yet exist; this version bump is recorded manually. Both amendments are clarifications of prior intent, not changes to it.

- **Article 19 (Iteration cap and bump-model escalation).** Tightened the wording to state the total iteration budget explicitly (three default-tier attempts plus one bumped-tier attempt = four total). The prior text said "within three iterations triggers escalation" followed by a numbered list mentioning one additional bumped attempt; the arithmetic was correct but had to be inferred. New text states it on the first line. Rationale: D-19 in `DESIGN-DECISIONS.md` describes the design as "two tiers"; the constitutional text should match without requiring the reader to consult the decision log.
- **Article 30 (Test weakening prohibition).** Appended a clarifying paragraph stating that an Inspector acting outside a coupled triplet has no authorized route to weaken a test independently, and that relaxation requires either an Architect invariant change (Article 24) or an RGR (Article 22). Rationale: the prior text made every unjustified weakening a FAIL and tied justified weakening to a tracked invariant change, but did not state the negative case in one place; a future Inspector reading Article 30 alone might have assumed REVIEW was self-resolvable. This is restatement of Articles 24 and 30 read together, not a change in policy.

### 0.1.1 → 0.2.0

R14 docs-IA round, 2026-06-04. This is Article 40's first invocation against this constitution; the amendment exercises the process end-to-end. The substantive change is a single article (Article 6) whose F1 path enumeration is rewritten to support the seven-section published documentation IA established by ADR-DOCS-IA. Articles 1-5, 7-39 are textually unchanged.

- **Article 6 (Substrate authority-by-path).** F1 Owner-authority paths and F1 Architect-authority paths are rewritten to point at the new top-level documentation section roots (`docs/start/`, `docs/theory/`, `docs/framework/`, `docs/roles/`, `docs/adopters/`, `docs/reference/`, `docs/meta/`). F2 Engineer, F3 Inspector, F4 Inventory, and F5 Harness path mappings are unchanged. The semantic substance of authority-by-path is preserved; only the path names move. Seven prior path strings (the F1 path-string components `docs` then `arch`, `contracts`, `adr`, `ops`, `security`, `product`, `glossary` — written here decomposed because the W03 path-rewrite script would otherwise edit any verbatim form) cease to be enumerated paths at 0.2.0 — clients pinned to 0.1.1 continue to honour the old enumeration via the snapshotted version. Rationale: the seven-section IA established by ADR-DOCS-IA requires section-rooted paths so the published Pages site's URL tree matches authority structure; the prior enumeration was a flat top-level-per-discipline list that the IA cannot publish coherently. The "core mapping is immutable" clause is honoured by the version bump itself — clients at 0.1.1 see the old mapping; clients at 0.2.0 see the new. Both mappings co-exist via the per-version snapshot under Docusaurus versioned-docs (per ADR-DOCS-IA Decision 8).

  Prior Article 6 F1 enumeration (path components written with `<slash>` decomposition where the literal form would be rewritten by the W03 path-rewrite script; reader reads `<slash>` as `/`):
  - F1 Owner-authority paths: `docs<slash>product<slash>`, `docs<slash>glossary<slash>` (joint with Architect).
  - F1 Architect-authority paths: `docs<slash>arch<slash>`, `docs<slash>contracts<slash>`, `docs<slash>adr<slash>`, `docs<slash>ops<slash>`, `docs<slash>security<slash>`, `docs<slash>glossary<slash>` (joint with Owner), `README.md`.

  Amended Article 6 F1 enumeration:
  - F1 Owner-authority paths: `docs/framework/product/`, `docs/framework/glossary/` (joint with Architect).
  - F1 Architect-authority paths: `docs/start/`, `docs/theory/`, `docs/framework/` (excluding `product/`), `docs/framework/glossary/` (joint with Owner), `docs/roles/`, `docs/adopters/`, `docs/reference/`, `docs/meta/`, `README.md`.

  The amended enumeration uses **section-root granularity**, following the precedent of F5's `.devai/` enumeration with explicit exclusion syntax. Eight Architect entries plus two Owner entries cover every path under `docs/` that the new IA produces, including top-level section files (e.g., `docs/framework/substrates.md`) without per-subdirectory enumeration. The "Clients may extend the path mapping" closing paragraph stays unchanged. The amended core mapping becomes the new immutable baseline for clients at 0.2.0.

### 0.2.0 → 0.3.0

Documentation-drift remediation round, 2026-06-09 (D-108). Trigger: an Auditor review found three places where constitutional text had drifted from the system it governs — one article contradicted by locked decision and enforced code for ~23 phases (Article 27 vs D-52), one article carrying operational detail at the wrong altitude (Article 23's hard-coded model families), and one article whose framing no longer described the shipped system (Article 1's "fixed stack" vs the Phase 17 stack-adapter packs, D-57). All three amendments move volatile operational values out of constitutional text and into policy artifacts, so the constitution states only what must always be true (per its own preamble). Articles 2–22, 24–26, 28–40 are textually unchanged.

- **Article 1 (Purpose).** Prior text: "DEVAI is a multi-loop, multi-dimensional control framework for AI-assisted software development on a fixed stack (NestJS, Angular, Postgres)." New text describes a **declared stack**: primary stack NestJS/Angular/Postgres, additional stacks via stack-adapter packs as F5 policy artifacts, exactly one resolved stack per adopter repository. Rationale: Phase 17 (D-57) shipped seven stack-adapter packs including Laravel, Express, and Spring variants; the "fixed stack" axiom no longer described the shipped system. The load-bearing assumption was never "one stack forever" but "one known stack per repository, exploited deeply" — the amendment states the real axiom.

- **Article 23 (Tie-breaking ladder).** Prior text named concrete model families in ladder step 1: "a model from a different family (Claude ↔ Codex)" and step 3: "a larger model in the other family." New text removes the parenthetical, renames step 3's target to "the alternate family," and adds a paragraph delegating concrete families and tier ordering to F5 policy configuration. Rationale: model families are operational policy with a shelf life measured in months; constitutional text has a shelf life measured in years. The axiom is the ladder structure (different family → larger same family → larger alternate family → human), not the vendor names.

- **Article 27 (Worktree discipline).** Prior text: "The active agent worktree count is capped at six." New text: the count is capped; the cap value is a harness policy parameter recorded in the decision log. Rationale: D-52 (Phase 16.C, locked) reduced the enforced cap to three and the code has enforced three since; the constitutional "six" was contradicted by a locked decision and by `WORKTREE_CAP = 3` for roughly twenty-three phases without amendment. The axiom is that a cap exists and harness-owned worktrees are exempt; the number is policy. Delegating the value prevents recurrence of this exact drift class.
