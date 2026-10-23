# R-0044 decisions

## D-1 — Separate authorized remediation package

Source: direct Owner message in this chat on 2026-10-23; no exact message timestamp asserted.

> Execute as frentes de E2E, vulnerabilidades e lint no DETRAN em pacotes e PRs separados, sem depender da publicação do DEVAI. Preserve assertions, thresholds, históricos e rodadas encerradas, mantendo C6 bloqueado.

This packet owns only **Current dependency vulnerabilities**. Use fresh complete audit and official patched versions; smallest peer-compatible manifest/lockfile changes. Preserve DEVAI2.6.3, STYNX1.5.3, all prior reviewed security patches, thresholds and API behavior. No audit exclusions or waiver changes.

Other packets and the DEVAI release/adoption remain separate. C6 stays blocked, effective native invariant bindings stay empty, existing rounds are not reopened and old proof lines/anchors are not rewritten. Evidence is appended only through official verbs. No merge authorization or readiness verdict follows from this declaration.
