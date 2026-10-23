# R-0044 decisions

## D-1 — Separate authorized remediation package

Source: direct Owner message in this chat on 2026-10-23; no exact message timestamp asserted.

> Execute as frentes de E2E, vulnerabilidades e lint no DETRAN em pacotes e PRs separados, sem depender da publicação do DEVAI. Preserve assertions, thresholds, históricos e rodadas encerradas, mantendo C6 bloqueado.

This packet owns only **Current dependency vulnerabilities**. Use fresh complete audit and official patched versions; smallest peer-compatible manifest/lockfile changes. Preserve DEVAI2.6.3, STYNX1.5.3, all prior reviewed security patches, thresholds and API behavior. No audit exclusions or waiver changes.

Other packets and the DEVAI release/adoption remain separate. C6 stays blocked, effective native invariant bindings stay empty, existing rounds are not reopened and old proof lines/anchors are not rewritten. Evidence is appended only through official verbs. No merge authorization or readiness verdict follows from this declaration.

## D-2 — Preserve the approved native runtime and report residual findings

The initial all-patched candidate `dd2ad455` produced a zero-advisory audit but CI refused its Vitest version at the existing native runtime guard. The three metadata suites also require the approved Vitest 4.1.11 / Vite 7.3.6 graph. This refusal is retained; no unsupported runtime is accepted and no assertion, guard, waiver or audit policy is changed.

Corrective commit `850eba8c` keeps that graph and the original parent-specific overrides while retaining the independent Angular, Vite 8 and MCP dependency patches. The complete audit now reports 13 occurrences (1 high, 11 moderate, 1 low), compared with 38 at the unchanged baseline and the same 1,099 dependency population. These findings are unresolved, not accepted risk and not PASS. Full closure requires a separately reviewed native runtime update; C6 remains blocked. This package delivers the 25 independent corrections without depending on the DEVAI release.
