---
id: OPS-PARAMETER-COMMAND-CONTRACT
title: Contrato do comando de alteração de parâmetro OPS
status: draft
apps: [rait]
updated: 2026-09-14
---

## Escopo

Este contrato define o comando manuscrito de alteração versionada do store
`ops.parameter` da ADR-0021. Ele implementa a disciplina de edição de
UC-RAIT-043 §§Fluxo principal e Pós-condições. Não altera o contrato OpenAPI
gerado: o CRUD gerado expõe somente `list` e `get`.

## Operação

`PUT /v1/ops/parameters/{key}`

- Ator obrigatório: `agency-admin`.
- Headers obrigatórios: `If-Match` e `Idempotency-Key`.
- `tenant_id` é obtido exclusivamente do contexto da requisição e nunca entra
  no payload.
- `{key}` identifica o parâmetro dentro do escopo resolvido pelo comando.

O corpo exige `value`, `valueType`, `reason`, `decisionRef` e `effectiveFrom`.
Aceita também `trafficAgencyId`, `scope`, `surface`, `status`, `sourcePending` e
`legalBasis`. Campos não declarados neste contrato não são aceitos pelo comando.

## Semântica de alteração

Uma alteração cria uma nova versão de `ops.parameter`; ela não sobrescreve uma
versão histórica. A resposta de sucesso é `200`, contém a nova versão e inclui
o header `ETag` correspondente. O `If-Match` protege a versão que o ator leu e
o `Idempotency-Key` identifica a tentativa de comando.

Na mesma transação que grava a nova versão, o comando grava o evento
`PARAMETRO_ALTERADO`. Esse evento invalida o cache de parâmetros do tenant.

## Falhas canônicas

| Status | Código                               | Condição                                               |
| ------ | ------------------------------------ | ------------------------------------------------------ |
| 428    | `RAIT.IF_MATCH_REQUIRED`             | `If-Match` ausente.                                    |
| 412    | `RAIT.VERSION_CONFLICT`              | A versão indicada por `If-Match` não é a versão atual. |
| 422    | `RAIT.PARAMETER_LEGAL_READONLY`      | O parâmetro tem `legal_readonly=true`.                 |
| 422    | `RAIT.PARAMETER_EFFECTIVE_DATE_PAST` | `effectiveFrom` é retroativa.                          |

Não há código de erro adicional neste comando. A regra de parâmetro de origem
legal não editável e a regra de vigência retroativa são as de UC-RAIT-043 e do
catálogo de erros RAIT §3.9.

## Invariantes para implementação e teste

- O comando só permite `agency-admin`.
- Toda nova versão preserva o histórico, motivo, referência de decisão, data de
  vigência e autor.
- Linhas `legal_readonly` não são alteráveis pela API.
- O evento e a nova versão são atômicos na mesma transação.
- A invalidação de cache decorre de `PARAMETRO_ALTERADO`.
