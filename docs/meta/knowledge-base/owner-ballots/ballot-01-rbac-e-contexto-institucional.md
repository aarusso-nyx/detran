# Cédula 01 — Papéis RBAC e contexto institucional

Bloqueia: WP-0/WP-T0/WP-D0 (custo `DDL+política`). Superfícies: DASHBOARD, TEAT, RAIT.

## 1.1 Operador de monitoramento e dono de dever periódico (OD-D01)

Pergunta: criar os papéis `dash-operator` e `dash-duty-owner` no catálogo canônico ou mapear em
papéis existentes?

| Opção           | Consequência                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A (recomendada) | dois papéis novos; `05-role-catalog.sql`, `roles.ts`, `policy.ts`, `shared/actors.md`; ouvidor e financeiro recebem `dash-duty-owner` |
| B               | `dash-operator` = `technical-admin` com atributo; deveres a `agency-admin` — mistura camadas N1/N2 ([RN-DASH-170])                    |

Premissa atual: A, com leitura provisória em `agency-admin`. Custo tardio: DDL+política.
Evidências: `dashboard-frontends.md` §3, [RN-DASH-170].

Resposta: **[x] A** — dois papéis novos. Data: 2026-09-13. Owner (prompt interativo; steering H.38)

## 1.2 Diretoria de Fiscalização (OD-T01)

Pergunta: papel próprio `teat-fiscalization-board` ou `traffic-authority` com atributo
`decision_body`?

| Opção        | Consequência                                                       |
| ------------ | ------------------------------------------------------------------ |
| A            | papel próprio; auditoria separa quem decide cancelamento pós-final |
| B (premissa) | `traffic-authority` + atributo; rota exige `addressed_to`          |

Custo tardio: DDL+política. Evidências: `teat-build-pack.md` OD-T01, [RN-TEAT-119].

Resposta: **[x] B** — `traffic-authority` + atributo. Data: 2026-09-13. Owner (H.39)

## 1.3 Contexto institucional (OD-T02, OD-013)

Pergunta: portar `agency-context` da origem como módulo `ops/agency` (órgãos, unidades,
convênios, competências, circunscrições) ou usar `auth.tenants`/`tenancy` do STYNX?

| Opção        | Consequência                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| A (premissa) | `ops/agency` mínimo (unidade, circunscrição, competência); alimenta roteamento por circunscrição do RAIT e escala de assinatura |
| B            | tenancy do STYNX; sem circunscrição nem competência — roteamento do RAIT fica manual                                            |

Custo tardio: DDL+política. Evidências: `teat-route-contract.md` §7, `rait-build-pack.md` WP-A.

Resposta: **[x] A** — `ops/agency` mínimo. Data: 2026-09-13. Owner (H.40)
