# ADR-0022: Execution of the implementation backlog by dedicated agent orchestras

## Status

Proposed on 2026-09-14 by the Architect, on the Owner's decisions of the same date. Depends on
ADR-0013…0021 and on the DEVAI Constitution 1.0.0 (Articles 10, 17, 18, 19, 23, 24, 25, 27, 35, 37).

## Context

The five build packs (`docs/framework/arch/*-build-pack.md`) define 33 work packages with gates,
sources and open questions; the Owner closed the implementation gate (steering §H). Executing them
serially with one large model wastes the planning it already paid for, and executing them with
many small agents without a governed method reproduces the defects the definition round found
(inventions, weakened gates, unmounted modules). DEVAI 1.4.5 ships the schemas for tasks,
executors, rounds and governed prompt composition, but its `round run` cycle is experimental and
nothing is materialized in this repository. The human playbook in
`docs/meta/knowledge-base/team-prompt.md` proved the disjoint-write, orchestrator-commits pattern
over six rounds.

## Decision

1. Each **front** (one WP or a coupled group, `docs/meta/agents/orchestra/waves.md`) is executed by
   a dedicated **orchestra**: a maestro (large model: GPT-5.6 Sol or Fable 5.1) that plans,
   writes every worker prompt, dispatches, verifies, commits, records evidence, opens and merges
   the PR; a **reviewer of the other family** (Article 18/23) that judges the prompts before
   dispatch and the deliveries before the PR; **workers of the maestro's family** (medium/small
   models) that execute one task each inside a write boundary and never touch git.
2. **Hybrid DEVAI**: one DEVAI round per front; tasks, executors and prompt compositions are
   materialized as JSON under `work/rounds/R-nnnn/` in the DEVAI schemas; evidence, `audit observe`
   and `round close` go through the DEVAI CLI; execution runs in Claude Code / Codex CLI sessions
   on per-front worktrees, not through the experimental `round run`.
3. **Two concurrent fronts, alternating families**, so each family's 5-hour window carries one
   maestro and its workers; no two active fronts share a lock module (`policy.ts`, `roles.ts`, a
   DDL file, a blueprint, `packages/ui`).
4. **Formal correctness gates**: coupled triads Architect → Inspector → Engineer per command or
   entity; acceptance criteria as executable commands; no invented values (parameter
   `source_pending` or `OD-*`); generated code never hand-edited; hard gates never weakened;
   merge only with green CI and a reviewer `PASS`.
5. The method, the model ladder, the templates and the cross-family bridge live in
   `docs/meta/agents/orchestra/` and `tools/orchestra/bridge.sh`; they are Architect-owned and
   revised after each round (`waves.md` §Histórico).

## Consequences

- Work enters only through `waves.md` (Article 35: the backlog is the only queue); a front opens
  only when its dependencies are in `main`.
- The maestro is authorized to merge its own PR under the stated conditions (Owner decision
  2026-09-14); humans keep the right to revert.
- `work/rounds/README.md` documents the round folder convention; R-0003 (`dash-roles`) and
  R-0004 (`param-store`) are the first instances.
- Out of scope: `devai round run`, automatic dequeuing, cross-family workers, and the model
  registry (`model-runtime-registry.schema.json`) until the bridge is exercised in practice.
