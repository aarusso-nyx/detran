# ADR-0017: One collection module owns payment documents, payments, refunds and the debt hand-off

## Status

Accepted on 2026-09-13 by Owner decision (steering G.37), on the Architect's proposal of the same date. Depends on ADR-0016
(payment facts change the infraction state only through the aggregate).

Implementação: PR #43 (R-0006, CTG-0002, 2026-09-15) — `BP-INF-COLLECTION-001` (DDL 57), mock `BankPort`,
fixtures and database contract tests; command surfaces, bank integration and the debt hand-off follow in
R-0007 / WP-P.

## Context

Money enters the infraction lifecycle at four points: the 80% discount until the NP due date,
the 60% discount with acknowledgement through the SNE, the full amount with interest after
closure, and the refund after a favourable decision (CTB arts. 284, 286 §2º, 290; Res.
918/2022 arts. 21–23; `RN-RAIT-127…129`). Today `UC-RAIT-032…035` describe these flows from
the finance desk, `UC-PORTAL-015` from the citizen, and `WF-INF-002` P8 from the process, but
no module owns the payment document, the bank reconciliation or the refund order. The
citizen-facing discount outside the SNE (Lei 14.599/2023, OD-003), the correction index for
refunds (OD-015) and the card/instalment authorisation (`RN-PORTAL-126`, DT-031) are open.
The payment quote and recognition contracts of the national side exist in the adapter
(`mapPaymentQuote`, `mapRecognition`, `mapSneEnrollment`).

## Decision

1. `domains/inf/collection` (`BP-INF-COLLECTION-001`) is the **only writer** of
   `inf.collection_document` (tier FK `inf.infraction_payment_tier_ref`, amount, barcode or
   PIX reference, valid until, phase of the infraction it was issued for),
   `inf.payment` (bank return, matched document, confirmed at, tier actually applied),
   `inf.refund_order` (reason, base amount, index, bank data status) and
   `inf.debt_handoff` (Fazenda reference, sent at, acknowledgement).
2. **Money facts never change state directly.** Collection publishes `PAGAMENTO_CONFIRMADO`,
   `PAGAMENTO_ESTORNADO`, `RESTITUICAO_ORDENADA`, `COBRANCA_ENCAMINHADA`; the infraction
   aggregate decides what a payment means (`pago=true` without closing; `QUITADA`;
   `motivo=reconhecimento`) per `WF-INF-003` §2 rows 12–16 and 29. Collection consumes
   `INFRACAO_ESTADO_ALTERADO` to issue or invalidate documents by phase and
   `RESTITUICAO_DEVIDA` to open refund orders.
3. **Quotes and recognition** come from the national side through `SnePort`/`RenainfPort`
   (`mapPaymentQuote`, `mapRecognition`); local tiers are parameters (`rait_parameter`,
   ADR-0015 build pack) with legal origin marked read-only. The 40% tier outside the SNE
   exists in the vocabulary but is disabled until OD-003 is decided (feature flag through
   `@stynx-nyx/feature-flags`).
4. **Bank integration** (return files, PIX, card acquirer) is an adapter inside the
   collection module (`ports/bank`), mock-first like the SENATRAN adapter, never called from
   apps. Card and instalments are out of scope until the organ's authorisation exists (DT-031).
5. **Apps only consume.** PORTAL requests a document (`POST collection-documents` with the
   infraction id and chosen tier) and shows its state; RAIT `financeiro` reconciles, orders
   refunds and hands off debt; DASHBOARD reads projections (ADR-0020).

### Ownership table

| Fact                        | Writer           | Readers                    | Events                                        | Substrate / adapter           |
| --------------------------- | ---------------- | -------------------------- | --------------------------------------------- | ----------------------------- |
| collection document by tier | `inf/collection` | PORTAL, RAIT finance       | `DOCUMENTO_ARRECADACAO_EMITIDO`               | pdf (ADR-0018), parameters    |
| payment confirmation        | `inf/collection` | infraction (state), PORTAL | `PAGAMENTO_CONFIRMADO`, `PAGAMENTO_ESTORNADO` | bank port, outbox             |
| refund order                | `inf/collection` | RAIT finance, PORTAL       | `RESTITUICAO_ORDENADA`, `RESTITUICAO_PAGA`    | parameters (index)            |
| debt hand-off               | `inf/collection` | RAIT finance, DASHBOARD    | `COBRANCA_ENCAMINHADA`                        | Fazenda port (pending source) |
| interest mark               | `inf/infraction` | collection                 | via `INFRACAO_ESTADO_ALTERADO.closureMotive`  | —                             |

## Consequences

- One blueprint (WP-A), four command groups (WP-B), a bank port with mock (senatran-adapter
  pattern), and the RAIT `financeiro` module becomes buildable against a real backend.
- `RN-RAIT-127` (SNE-only 60%), `RN-RAIT-128` (interest mark) and `RN-RAIT-129` (refund
  index) are implemented once, in this module.
- Premises carried: OD-003 (40% outside SNE), OD-012/OD-015 (index and jeton parameters),
  DT-031 (card/instalments), `RN-PORTAL-128` (waiver instrument for the 40% tier).
