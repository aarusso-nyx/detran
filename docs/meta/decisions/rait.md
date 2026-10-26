# RAIT — owner decisions (2026-08-28)

**Source of truth:** canonical in-repository rules
[RN-RAIT-113](../../framework/product/domains/inf/rait/rules/RN-RAIT-113.md),
[RN-RAIT-129](../../framework/product/domains/inf/rait/rules/RN-RAIT-129.md), and
[RN-RAIT-130](../../framework/product/domains/inf/rait/rules/RN-RAIT-130.md), plus workflows
[WF-RAIT-001](../../framework/product/domains/inf/rait/workflows/WF-RAIT-001.md),
[WF-RAIT-002](../../framework/product/domains/inf/rait/workflows/WF-RAIT-002.md), and
[WF-RAIT-003](../../framework/product/domains/inf/rait/workflows/WF-RAIT-003.md).
Directly actionable — RAIT has real code in `backend/domains/inf/{rait-case,rait-worklist,
rait-session}` and DDL in `backend/database/ddl/34-36-inf-rait-*.sql`.

## DT-010 — authority's appeal against a favorable (`provimento`) decision (`RN-RAIT-130`)

Three of four open points now answered, one still open:

1. **Vinculado, not discretionary.** The authority is _obligated_ to appeal whenever the 1st-
   instance decision is `provimento` — this was already settled in an earlier steering round
   (2026-08-24), restated here for completeness.
2. **Centralized authority, not each of the 55.** The DETRAN-AM has 55 individuals holding
   "Autoridade de Trânsito" (50 capital, 5 interior). The Owner decided the appeal is exercised by
   a **single centralized role**, not distributed to whichever of the 55 issued the original NP.
   **Which specific cargo/setor is still unidentified** — next step is an institutional ask to
   DETRAN-AM, not a product decision. Model a single designated queue/owner for this appeal, but
   the actor assignment itself is still a placeholder.
3. **No citizen counter-argument step.** When the authority appeals, the citizen is explicitly
   **not** intimated for contrarrazões — the subsidiary Lei 9.784/1999 mechanism (art. 62 notice,
   art. 64 _reformatio in pejus_ safeguard) was considered and rejected. Do not build a
   counter-argument UI/step for this flow.
4. **Still unanswered: the appeal deadline.** No numeric prazo has been fixed for when the
   authority's appeal clock starts or how long it runs — `WF-RAIT-001`'s "Reentrância" section for
   this path cannot be fully modeled without it.

## DT-011 — sustentação oral (oral argument) at JARI/CETRAN sessions (`WF-RAIT-003`)

Omitted by default and **not a configurable toggle**. The state `SUSTENTACAO_ORAL` stays in the
state machine (for a possible future local regimento that admits it) but the default path is
`RELATORIA_LIDA → VOTACAO` directly. If a session/hearing UI currently exposes this as a toggle,
remove it — it should never be presented as part of the normal flow.

## DT-013 — restitution correction index (`RN-RAIT-129`)

When a provimento decision triggers restitution of a prepaid fine, the correction index is
**IPCA-E**. No formal legal/fazendária opinion behind this — it's a working decision, same risk
class as the rest of this corpus. If restitution calculation exists or is planned, wire it to
IPCA-E rather than leaving the index unconfigured or defaulting to something else.

## New: five-year prescription clock (Relógio D) added to the SLA ladder

Not itself a DT item — surfaced while propagating a DASHBOARD decision (DT-030) that required
calibrating an alert ladder for `RN-RAIT-113`'s quinquennial prescription clock. `RN-RAIT-113`
already described **four** extinction clocks, but `WF-RAIT-001`'s consolidated table and
`WF-RAIT-002`'s calibrated ladders only had three. Added:

- **`WF-RAIT-001`** — new row in the "Relógios de extinção" table and a `T-PRESC-5A` timer entry:
  5 years (60 months) from `data_pratica_ato`, Lei 9.873/1999 art.1º _caput_.
- **`WF-RAIT-002` §4.4** — new escada, same 50/75/90% discipline as the other clocks: `ALERTA_N1`
  at 30 months, `ALERTA_N2` at 45 months, `CRITICO` at 54 months, `PRESCRITO_OPERACIONAL` at 60
  months.

Unlike the 3-year paralisação clock (Relógio C), this one does **not** reset on every case
movement — only on the specific interruption hypotheses of Lei 9.873/1999 art.2º (notification,
condemnatory decision). Whether a penalty notice (`NP`) itself counts as the interrupting
condemnatory decision is flagged as an open legal question in `RN-RAIT-113` (controvérsia point 3) — do not implement an auto-reset on NP issuance without confirming that reading first.

## Still open, not decided (DT-012)

`DT-012` — the operational procedure for issuing the arrecadação document for the 40%-discount
outside the SNE — remains unanswered. This affects `RN-RAIT-127` (the discount regime) and is
distinct from PORTAL's DT-026 (which only settled the waiver-declaration instrument, not this
issuance procedure). Do not build the outside-SNE document-issuance path yet.

## Addendum — approved P4-02 reconciliation, 2026-10-18

D1–D11 are recorded additively in the [RAIT decision register](../knowledge-base/open-decisions-rait.md).
D8–D11 approve bounded role-purpose reads, canonical authenticated staff identity,
provenance-qualified legacy defense compatibility and current-risk prerequisites.
Supplemental ADR0047/48/49 and [P4-02 amendment A1](../../../work/rounds/R-0025/reports/P4-02-D8-D11-bounded-amendment.md)
close T0 design classification while leaving runtime implementation, production
qualification and R-0025 closure unexecuted. Earlier decisions above retain their
historical sources; no numeric deadline, threshold or institutional appointment is
chosen by this addendum. Local and scorecard work remain separate.

## Addendum — D1-L Gate A approved, 2026-10-25

Article 7 Owner decision, transcribed from the human approval in Codex chat
`01a175a6-8a1b-7003-8915-c315e359dca6` on 2026-10-25:

> Approve D1-L Gate A scope SHA256 2fd770788290b52cb5edb50301e65e9626d1f582aeea817b805dc5552cd2dfb5 as written. Proceed within that exact scope; keep Gate B held, #211 unmerged, C6 blocked and S3 held.

The exact approved scope is `gate-A-scope.json`, SHA256
`2fd770788290b52cb5edb50301e65e9626d1f582aeea817b805dc5552cd2dfb5`,
in the retained packet directory
`/Volumes/Development/.codex/artifacts/detran/u1b1-native33-independent-20261025/D1-L-final`.
The corresponding `approval-text.md` SHA256 is
`f1ee698f9f6dac45be812e3229de1e83bf2d63248be0c6b53abfb6b5131330bd`.
Its full Gate A decision is approved as written:

**Gate A:** “Approve D1-L Gate A scope SHA256 `2fd770788290b52cb5edb50301e65e9626d1f582aeea817b805dc5552cd2dfb5` as written: the exact published DEVAI 2.8.0 dependency patch, registered Constitution 1.2.0 upgrade in the named new isolated target, and the five-path finite ADR0062 compatibility proposal, with the exact Owner decision and machine-result report paths, role separation, derivation rules, validation and stop conditions. Preserve original acceptance criteria, histories and local work. Gate A permits the specified registered binding write and bounded compatibility implementation; it does not authorize proof-chain/epoch mutation, reconciliation host provisioning, canonical selection, recovery, proof-index CAS, diagnostic publication, merge of #211, C6 activation or S3 runtime.”

The named isolated target is
`/Volumes/Development/.codex/worktrees/d1l-devai280-binding/detran`, starting from
exact reviewed main `7abe89cd3e7049fdcf38b33411d38a3442a0e1e1`.
Only the scope's finite path allowlist, role separation, derivation, validation
and stop conditions are authorized. This entry records approval; it does not
claim execution, successful validation, integration or product acceptance.

Gate B remains held for a separate exact Owner decision after authentic target,
host, plan, manifest, index and expected-head identities exist. PR #211 remains
unmerged, C6 blocked and S3 held. Original acceptance criteria, histories,
local work and every prior decision above remain preserved.

## Addendum — D1-L schema-only amendment approved, 2026-10-25

Article 7 Owner decision, transcribed from the human approval in Codex chat
`01a175a6-8a1b-7003-8915-c315e359dca6` on 2026-10-25:

> Approve schema-only amendment SHA256 7d1e22ce043959fe99b6a20bf8b57c4947255becfacb70800a46e5020cadace1 as written. Apply it and resume validation; keep Gate B held, #211 unmerged, C6 blocked and S3 held.

The exact approved amendment is `proposed-schema-corpus-amendment.json`, SHA256
`7d1e22ce043959fe99b6a20bf8b57c4947255becfacb70800a46e5020cadace1`,
retained in
`/Volumes/Development/.codex/artifacts/detran/u1b1-native33-independent-20261025/D1-L-Gate-A-execution`.
It supplements the original Gate A scope SHA256
`2fd770788290b52cb5edb50301e65e9626d1f582aeea817b805dc5552cd2dfb5`
at current base `12b87fa6833ea19db75f146b80d5e681d2384dd4`, tree
`5d8ff1aa11e092c52201eb431af3cdf75b73f92e`, in the same isolated target
`/Volumes/Development/.codex/worktrees/d1l-devai280-binding/detran`.

The ten additional repository paths are exactly:

- `law/schemas/action-registry.schema.json` — update.
- `law/schemas/authority-policy.schema.json` — update.
- `law/schemas/evidence-reconciliation-plan.schema.json` — create.
- `law/schemas/evidence.schema.json` — update.
- `law/schemas/reconciliation-inventory-result.schema.json` — create.
- `law/schemas/reconciliation-materialize-result.schema.json` — create.
- `law/schemas/reconciliation-owner-action.schema.json` — create.
- `law/schemas/reconciliation-owner.schema.json` — create.
- `law/schemas/reconciliation-proof-index-result.schema.json` — create.
- `law/schemas/manifest.json` — update.

Only the nine enumerated schema bodies may be copied byte-for-byte from the
exact published DEVAI 2.8.0 package, tar SHA256
`d63d2da92427ef8f5e947ca2fd72e14b393caaf6623275e7bffa0b89be15ec59`;
only the specified schema manifest metadata may be derived. The amendment's
exact before/after hashes, path authority, validation and stop conditions apply.
The existing allowlist permits only append-only approval and ADR-0062 additions.
No handwritten schema semantic changes, v3 sealed-path exception extension,
waiver or additional effect is approved. This entry records approval without
claiming materialization, passing validation, integration or acceptance.

Gate B remains held; PR #211 remains unmerged, C6 blocked and S3 held. This
approval grants no proof-chain, epoch, recovery, reconciliation host, index-CAS,
diagnostic, S2 fixture/source import or merge authority. Authentic adoption/v3
ancestry, prior manifests and records, receipts, proof chains, epochs, local
work, original acceptance criteria and gates remain preserved.

## Addendum — D1-L current-provider header amendment approved, 2026-10-25

Article 7 Owner decision, transcribed from the human approval in Codex chat
`01a175a6-8a1b-7003-8915-c315e359dca6` on 2026-10-25:

> Approve header amendment SHA256 d176e7f598b3a70a0da8c04a64795b92874b4a10e5a68d7e08aa512f16a8dd99 as written. Apply it and resume validation; keep Gate B held, #211 unmerged, C6 blocked and S3 held.

The exact approved amendment is `proposed-current-provider-header-amendment.json`,
SHA256 `d176e7f598b3a70a0da8c04a64795b92874b4a10e5a68d7e08aa512f16a8dd99`,
retained in
`/Volumes/Development/.codex/artifacts/detran/u1b1-native33-independent-20261025/D1-L-Gate-A-execution`.
It supplements the approved Gate A scope and schema-only amendment at base
`f91f6c380ecda6e1e4f2e5fa4cbf6dca4f3c4418`, tree
`922ef3e719c5f787dce5502e86ee0d0c93fa6173`, in the isolated target
`/Volumes/Development/.codex/worktrees/d1l-devai280-binding/detran`.

The sole additional path is `work/rounds/README.md`: replace exactly
`Governed rounds of this repository (DEVAI 2.7.0).` with
`Governed rounds of this repository (DEVAI 2.8.0).` The one-byte version change
must match before SHA256
`f2d51bc60b6b9b9226149f22b98d4aafc0878ed62debcdb435002423c84952eb`
and after SHA256
`ef66ce2962afb1275ac8d49d2d506c1615445ecf00074ec42dd5ded83b9fc05a`.
Every other byte remains identical. Only append-only approval and ADR-0062 notes
are permitted in existing allowed paths; no round table, status, date, closure,
scope, acceptance or history change is authorized. The amendment's role separation,
validation and stop conditions remain binding. This entry records approval without
claiming execution, passing validation, integration or acceptance.

Gate B remains held, PR #211 unmerged, C6 blocked and S3 held. No proof record,
epoch, recovery, index-CAS, canonical selection, host provisioning, diagnostic,
native inventory, DB permission, S2 source import, waiver or merge operation is
authorized. Original failed observations, proof chains, epochs, authentic
adoption/v3 objects and local work remain preserved.
