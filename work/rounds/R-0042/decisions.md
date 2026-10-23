# R-0042 decisions

## D-1 — Separate measurement package

Source: direct Owner message in the current session, received before the official R-0042 declaration on 2026-10-22. No exact message timestamp is asserted.

> Resolva as sete lacunas restantes de medição em pacote separado, preservando thresholds, históricos e rodadas encerradas, sem misturar correções de produto nem contornar o bloqueio de segurança de C6.

This authorizes the bounded measurement repair and reevaluation. It does not approve the withheld C6 protocol, new product work, a changed threshold or a fabricated machine verdict. Prior express authorization permits a separate DEVAI measurement-repair branch/PR. Any new provider release must satisfy its own explicit publication authority and release gates.

## D-2 — Milestone 1 governed adoption and reassessment

Direct Owner instruction in the consolidated DETRAN chat on 2026-10-23:

> Check CI on #223, fix any failures and merge once required checks are green. Then continue milestone 1: finish attestation, governed DEVAI adoption and reassessment, keeping #211 unmerged, C6 blocked and histories preserved.

Architect reviewed the published Constitution 1.1.0 and recorded ADR-0061.
Independent pre-execution review identified the transient-journal/upgrade-receipt
boundary and historical-log provenance condition; supplemental review passed
after those corrections. Official init upgrade succeeded with exactly the six
expected generated tracked effects and no journal left open. The actual receipt
and preservation checks live in reports/m1-adoption-20261023.

This continues the active R-0042 measurement scope; no threshold, existing task,
assertion, population, C6 binding or prior proof/history is changed. Publish a clean
source candidate after delivery review, and record each emission immediately.
All existing exclusions and the native/ordinary-evidence distinction remain.
