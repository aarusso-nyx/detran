---
id: ARCH-RAIT-I18N
title: Glossário i18n pt-BR do RAIT — rótulo oficial de cada token, papel, timer e código de erro
status: draft
apps: [rait]
updated: 2026-09-13
---

# Glossário i18n (pt-BR)

O catálogo `./i18n/rait.pt-BR.json` é a **única** fonte de texto visível do console RAIT
(`CODESTYLE.md` §Frontend). Este documento explica a organização das chaves e as regras; o JSON é
gerado a partir dos catálogos canônicos (estados dos workflows, `infraction_timer_ref`,
`roles.ts`, `rait-error-catalog.md`) e só cresce por acréscimo.

## 1. Namespaces

| Namespace                                                                                              | Fonte do token                                                                          | Exemplo                                                   |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `rait.role.<código>`                                                                                   | `RAIT_ROLES` + transversais (`roles.ts`)                                                | `rait.role.rait-chair` → "Presidente"                     |
| `rait.caseState.<TOKEN>`                                                                               | `WF-RAIT-001`                                                                           | `rait.caseState.PRONTO_P_DECISAO` → "Pronto para decisão" |
| `rait.sessionState.<TOKEN>`                                                                            | `WF-RAIT-003`                                                                           | `rait.sessionState.DESEMPATE_PRESIDENTE`                  |
| `rait.infractionState.<TOKEN>`, `rait.infractionSubstate.<TOKEN>`                                      | `WF-INF-003` / `inf.infraction_state_ref`                                               | `rait.infractionState.EXTINTO_PRESCRICAO`                 |
| `rait.riskFlag.<TOKEN>`                                                                                | `WF-RAIT-002` §4 / `rait_clock.flag`                                                    | `rait.riskFlag.PRESCRITO_OPERACIONAL`                     |
| `rait.memberStatus.<TOKEN>`                                                                            | `WF-RAIT-002` §5, `WF-RAIT-004` §3                                                      | `rait.memberStatus.EM_PLANTAO`                            |
| `rait.orgState.<TOKEN>`                                                                                | `WF-RAIT-004` §5–§7 (lote, banca, turma)                                                | `rait.orgState.BANCA_INSUFICIENTE`                        |
| `rait.timer.<CÓDIGO>`                                                                                  | `inf.infraction_timer_ref`                                                              | `rait.timer.T-JUL-24M`                                    |
| `rait.instance.<token>`, `rait.decision.<token>`, `rait.channel.<token>`, `rait.closureMotive.<token>` | checks do DDL / `infraction_closure_motive_ref`                                         | `rait.decision.nao_conhecido`                             |
| `rait.action.<verbo>`                                                                                  | `RAIT_COMMAND_RULES` (`policy.ts`)                                                      | `rait.action.claim-next` → "Puxar próximo"                |
| `rait.errors.<code>`                                                                                   | `rait-error-catalog.md` (código sem `RAIT.`, minúsculas)                                | `rait.errors.case_state_invalid`                          |
| `rait.nav.<módulo>`                                                                                    | `rait-web-frontend.md` §2                                                               | `rait.nav.colegiado`                                      |
| `rait.common.*`                                                                                        | textos transversais (carregando, vazio, confirmar, "faltam N dias", prazo legal × meta) | `rait.common.daysRemaining` (ICU plural)                  |

## 2. Regras

1. **Token nunca aparece ao usuário**: o componente traduz (`'rait.caseState.' + state | translate`)
   e mantém o token em `title`/`data-token` para suporte (`CaseStateBadge`).
2. **Chave nova só por acréscimo**; renomear é mudança quebrável e exige revisão do Owner.
3. **Mensagens de erro** são curtas, na voz ativa, sem código no texto; o código vai em
   `context`/`title`. A base legal entra por `LegalBasisTooltip`, não no texto.
4. **ICU** (`{count, plural, …}`) para tudo que varia com número; datas e valores pelos pipes
   `StynxIntlDatePipe`/`StynxIntlCurrencyPipe`, nunca formatados à mão.
5. **Catálogos STYNX** (`ui.*`, `auth.*`, `tenancy.*`, `i18n.*`) são mesclados **antes** do
   catálogo `rait.*` no `loadCatalog` (guia do kit §1); sobrescrever chave STYNX exige justificativa.
6. **Vocabulário interno não vaza ao cidadão**: o Portal tem catálogo próprio; nenhuma chave
   `rait.*` é importada por `apps/portal`.
7. Rótulos de estado usam **substantivo/particípio no masculino singular** concordando com "caso"
   ("Admitido", "Pautado"); estados da infração concordam com "infração" quando o token já é
   feminino no workflow (mantidos como estão no JSON).
8. Um teste do frontend (`i18n.spec.ts`) falha se algum token dos contratos gerados (`state`,
   `instance`, `timer_code`, `flag`, `decision_kind`, `channel`) ou algum código do catálogo de
   erros não tiver chave.

## 3. Como regenerar

O JSON foi produzido em 2026-09-13 lendo os catálogos citados; a regeneração faz parte de WP-C/WP-D
(Transcriber-docs), que deve **acrescentar** chaves e nunca remover. Diferenças entre o JSON e os
catálogos aparecem no teste `i18n.spec.ts` (WP-F).
