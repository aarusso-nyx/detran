# R-0043 decisions

## D-1 — Separate authorized remediation package

Source: direct Owner message in this chat on 2026-10-23; no exact message timestamp asserted.

> Execute as frentes de E2E, vulnerabilidades e lint no DETRAN em pacotes e PRs separados, sem depender da publicação do DEVAI. Preserve assertions, thresholds, históricos e rodadas encerradas, mantendo C6 bloqueado.

This packet owns only **E2E fixture isolation**. Use per-run isolated mock workflow fixtures; preserve all88 existing assertions. No runtime behavior change. Reproduce RED repeated execution, then focused, complete mock test:ci and repeated whole E2E GREEN.

Other packets and the DEVAI release/adoption remain separate. C6 stays blocked, effective native invariant bindings stay empty, existing rounds are not reopened and old proof lines/anchors are not rewritten. Evidence is appended only through official verbs. No merge authorization or readiness verdict follows from this declaration.

## D-2 — Preserve and verify the official test emission

The R-0043 official test recorder emitted a valid test proof that the local anchor consumer did not yet understand. Preserve the emission and add explicit namespace/path/sequence/hash verification under ADR-0059; do not delete records, exempt a line or relax a guard. This compatibility work is required to deliver the authorized E2E package through the official evidence workflow. C6 remains blocked.
