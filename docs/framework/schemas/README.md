# Schemas

JSON Schemas (draft 2020-12) e outros contratos que não são OpenAPI. Publicados nesta rodada
(R-0008, WP-T3, `docs/meta/agents/orchestra/README.md`; contrato do Architect
`work/rounds/R-0008/contracts/CTG-0005.md` §5): três schemas de payload do TEAT e um schema por
evento de domínio publicado. Nada aqui é gerado — todos são escritos à mão a partir dos DTOs e
dos `events.ts` manuscritos que os produzem (`docs/meta/agents/transcriber-docs.md`: transcrição,
não invenção); onde a fonte não fixa um valor, o campo correspondente é `x-source-pending`, nunca
um exemplo inventado (ver `teat-normative-package.schema.json`, campos derivados da tabela
metrológica).

## Schemas de payload

| Arquivo                               | Cobre                                                                                                                                                                                                                                 | Fonte                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `teat-offline-sync-batch.schema.json` | `POST /v1/ops/offline-sync/sync-batches` (`SubmitSyncBatchDto` montado: `device_batch_id`, `batch_sequence`, `items[]`)                                                                                                               | M5, M19; `CTG-0005.md` §5.1 (OD-T67: descreve o comando montado, não o arquivo da origem) |
| `teat-normative-package.schema.json`  | manifesto do pacote normativo mobile (`catalog`, `framings`, `validation_rules`, `metrological_tables`, `document_templates`, `agency_parameters`) e o envelope assinado `{ manifest, manifest_hash, signature }`                     | M13, M19; `CTG-0005.md` §5.2                                                              |
| `teat-bootstrap.schema.json`          | resposta de `GET /v1/ops/mobile-bootstrap` (`readiness`, `capabilities`, `snapshot`, catálogos)                                                                                                                                       | M9, M19; `CTG-0005.md` §5.3                                                               |
| `portal-request-draft.schema.json`    | `PUT /v1/portal/requests/{id}/draft` — `oneOf` por `serviceKey` dos corpos de ato (`portal-route-contract.md` §5.1; `DRAFT_SCHEMAS` em `requests/src/handwritten/drafts.ts`); `manifestar`/`avaliar` não entram (sem ciclo de pedido) | R-0009 WP-P3, `plan.md` §Metas 4; `work/rounds/R-0009/contracts/CTG-0002.md` §3.4         |

## `events/` — um schema por evento de domínio publicado

Um JSON Schema por `type` técnico da tabela `integration.outbox` (envelope de
`rait-events-sse-contract.md` §1: `type`, `aggregate`, `data`, mais o `domainEvent` canônico do
`teat-route-contract.md` §8 quando o módulo é do TEAT), nomeado `<type>.schema.json`. Os cinco
`inf.infraction.*`/`inf.timer.*` são do agregado da infração (RAIT/R-0006); os dezesseis restantes
são do TEAT, publicados em R-0008 (WP-T2/T3) a partir dos `events.ts` manuscritos de cada módulo —
`measure.changed` e `alcohol.changed` não têm `z.strictObject` na origem (só interface
TypeScript) e por isso o schema é a definição executável desses dois envelopes (OD-T69).

```text
arquivo                                          domínio  produtor (events.ts)
------------------------------------------------ -------- ------------------------------------------
ait.changed.schema.json                          TEAT     inf/ait
ait.concurrency-suspected.schema.json            TEAT     inf/ait
sync.batch.received.schema.json                  TEAT     ops/offline-sync
sync.conflict.opened.schema.json                 TEAT     ops/offline-sync
sync.conflict.resolved.schema.json               TEAT     ops/offline-sync
numbering.reservation.changed.schema.json        TEAT     ops/offline-sync
shift.changed.schema.json                        TEAT     ops/field
device.posture-changed.schema.json               TEAT     ops/field
catalog.published.schema.json                    TEAT     inf/normative
package.published.schema.json                    TEAT     inf/normative
evidence.changed.schema.json                     TEAT     ops/evidence
custody.event.schema.json                        TEAT     ops/evidence
evidence.access-request.changed.schema.json      TEAT     ops/evidence
probative-package.generated.schema.json          TEAT     ops/evidence
measure.changed.schema.json                      TEAT     inf/measures (sem zod na origem, OD-T69)
alcohol.changed.schema.json                      TEAT     inf/alcohol (sem zod na origem, OD-T69)
inf.infraction.changed.schema.json               RAIT/inf inf/infraction
inf.infraction.penalty-final.schema.json         RAIT/inf inf/infraction
inf.infraction.refund-due.schema.json            RAIT/inf inf/infraction
inf.timer.expired.schema.json                    RAIT/inf inf/infraction
inf.timer.rescheduled.schema.json                RAIT/inf inf/infraction
```

`integration.item.changed` (citado em `teat-stream.service.ts` e em M17) **não** tem schema
nesta rodada: nenhum `events.ts` o publica de fato — `POST outbox/{id}/retry` só atualiza a linha
existente da outbox, e o único emissor do `type` é um helper de teste do e2e de `teat-stream`
(**OD-T73**; ver `docs/meta/knowledge-base/open-decisions-rait.md` §F).

## Verificação

`node -e "JSON.parse(...)"` sobre todo o diretório confirma sintaxe válida (parte de
`pnpm contracts:check` desde TASK-0010); não há gate de schema × código nesta rodada além do que
`tools/contracts/check-commands.mjs` cobre para os `*.commands.openapi.json` que os referenciam.
