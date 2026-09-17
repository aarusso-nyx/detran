---
id: IU-PORTAL-T05
title: Assistente de indicação de condutor — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-918,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-05. Fontes: [UC-PORTAL-004], [JRN-PORTAL-002], [RN-PORTAL-101],
[RN-PORTAL-104], [RN-PORTAL-106].

## 1. Identidade

- id: `T-05`; nome visível: "Assistente de indicação de condutor".
- app: `portal`; módulo: `indicacao` (`portal-frontends.md` §4).
- rota: `/autos/:aitId/condutor/nova` (`route-manifest.md` #11); `screen: 'T-05'`,
  `sheet: 'IU-PORTAL-T05'`.

## 2. Acesso

- ator: CIDADAO nível avançada — indicação de condutor é declaração que constitui reconhecimento
  de fato e assunção de obrigação perante terceiro, exigindo assinatura avançada de **ambas** as
  partes ([RN-PORTAL-101] linha 5, Decreto 10.543/2020 art. 4º, II, "f"; [JRN-PORTAL-002] passo 3).
- `access`: `avancada`; guardas `portalAuthGuard` + `assuranceGuard('avancada')` →
  `entitlementGuard('ait')` sobre `:aitId`; `serviceAvailabilityGuard('indicacao_condutor')`
  (`route-manifest.md` #11).
- pré-condição: proprietário/possuidor equiparado (arrendamento/comodato/aluguel ≥ 180 dias —
  [REF-CONTRAN-918] art. 8º) autenticado como parte legítima do veículo; formulário disponível com
  o prazo de indicação em aberto ([UC-PORTAL-004] Pré-condições).

## 3. Entrada

- de onde se chega: T-01, botão "Indicar condutor".
- rascunho persistido no servidor; se a assinatura do condutor está pendente, fica em rascunho com
  alerta de prazo até a segunda assinatura ([UC-PORTAL-004] 5a).

## 4. Dados

- `POST /v1/portal/requests` `{ serviceKey: 'indicacao_condutor', targetKind: 'ait', targetId:
aitId, channel: 'portal' }` → `{ requestId, state: PEDIDO_EM_COMPOSICAO, prefilled{ órgão, placa,
aitNumber, dados do proprietário }, requirements[], minimumAssurance }`.
- `PUT requests/{id}/draft` `{ driver{ cpf, cnhNumber, cnhUf, category, name }, signatures{ owner:
govbr | upload, driver: govbr | upload | pending }, consequenceAck }` — corpo do ato
  `indicacao_condutor` (`portal-route-contract.md` §5.1).
- `POST requests/{id}/submit` `{ signature }` (`Idempotency-Key`
  `indicacao_condutor:<aitId>:<fingerprint>`) → `PROTOCOLADO` → delegação
  `inf:infraction:indicate-driver`.
- formulário pré-preenche tudo que já sabe (placa, AIT, dados do proprietário logado); pede só os
  dados do condutor indicado — conteúdo mínimo dos incisos I-X do [REF-CONTRAN-918] art. 5º
  ([UC-PORTAL-004] AC-PORTAL-004-1).

## 5. Estados

- **carregando**: skeleton do formulário.
- **vazio**: não se aplica.
- **sem elegibilidade**: prazo de indicação vencido → `PORTAL.INDICATION_WINDOW_CLOSED` (`dueOn`,
  CTB art. 257 §7º).
- **erro recuperável**: CPF/CNH inválidos ou dado incompleto/incompatível → devolve ao proprietário
  com o campo específico destacado, sem exigir reinício completo (`PORTAL.INDICATION_DRIVER_INVALID`
  `fields[]`; [UC-PORTAL-004] 6a).
- **sem permissão**: nível insuficiente do proprietário (ou do condutor no caminho remoto) ao
  assinar → passo guiado embutido, sem perder o preenchido ([JRN-PORTAL-002] passo 3).
- **indisponível**: serviço `indicacao_condutor` `unavailable` →
  `/servico-indisponivel/indicacao_condutor`.
- **sucesso** (assinatura dupla completa): protocolo com data/hora como termo inicial da nova
  contagem de prazo ([UC-PORTAL-004] passo 5).
- **aguardando segunda assinatura**: rascunho aguardando o condutor assinar
  (`PORTAL.INDICATION_SECOND_SIGNATURE_PENDING`, `pendingSigner`) — estado próprio, distinto de
  erro, exibido como "Aguardando a assinatura de [condutor]" ([UC-PORTAL-004] 5a).

## 6. Comandos

| Rótulo (chave i18n)                  | Nível    | Validação de forma                                          | Idempotência                               | Efeito                                                      |
| ------------------------------------ | -------- | ----------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| "Confirmar indicação" (`cmd.submit`) | avançada | CPF/CNH válidos; consequência confirmada (`consequenceAck`) | `indicacao_condutor:<aitId>:<fingerprint>` | `submit` → `PROTOCOLADO` → `inf:infraction:indicate-driver` |
| "Salvar rascunho" (`cmd.draft`)      | avançada | —                                                           | —                                          | `compose`                                                   |

- antes de confirmar, aviso direto sobre a consequência de indicação irregular (novos AITs por
  infração distinta, registro no RENACH) aparece **antes** do ato, não depois
  ([UC-PORTAL-004] AC-PORTAL-004-3; `ConsequenceDialog`) — sem `consequenceAck` a submissão é
  rejeitada (`PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED`).
- dois caminhos de assinatura do condutor: (a) condutor com conta gov.br assina remotamente; (b)
  upload de documento físico assinado por ambas as partes ([UC-PORTAL-004] passo 3) — o caminho (a)
  é o padrão, o (b) a alternativa ([RN-PORTAL-104]).
- todo comando gera `@Audit` (`portal-route-contract.md` §1.7).

## 7. Saída

- volta para T-01 após protocolar; se assinatura do condutor está pendente, volta a T-06/T-07 com o
  status "aguardando segunda assinatura".
- abandono antes da segunda assinatura: rascunho persiste com alerta de prazo.

## 8. Segurança

- vínculo: `portal.entitlement` sobre o AIT (proprietário).
- dados do condutor indicado são de terceiro até a confirmação — tratados com o mesmo cuidado de
  minimização de PII do restante do PORTAL; nenhum dado do condutor é exibido a quem não seja parte
  do ato.
- nenhum token/segredo em tela/URL/log.

## 9. Acessibilidade

- formulário com navegação por teclado completa, erros associados ao campo.
- aviso de consequência com contraste AA e foco automático ao aparecer (momento de maior
  consequência).
- alvo de toque ≥ 44×44px no botão de confirmar.

## 10. Testes

- unitário: bloqueio de submissão sem `consequenceAck`; validação de CPF/CNH.
- roteamento: `assuranceGuard('avancada')` e `entitlementGuard('ait')` presentes e ausentes.
- jornada feliz: assinatura dupla via gov.br → protocolo; jornada de erro: CNH inválida → campo
  destacado sem reinício; jornada de negação: condutor sem conta gov.br → caminho de upload.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                     | Ação seguinte                      |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| carregando        | "Preparando a indicação..." (`state.loading`)                                  | nenhuma                            |
| vazio             | não se aplica                                                                  | —                                  |
| sem elegibilidade | "O prazo para indicar o condutor desta multa já terminou" (`state.ineligible`) | canal presencial ([RN-PORTAL-105]) |
| erro recuperável  | "Verifique os dados do condutor destacados abaixo" (`state.error_recoverable`) | corrigir o campo indicado          |
| sem permissão     | explicação embutida no wizard (`state.forbidden`)                              | passo guiado de elevação           |
| indisponível      | "Este serviço está indisponível no momento" (`state.unavailable`)              | canal presencial                   |

## Chaves i18n

- `portal.screens.t05.title` — "Assistente de indicação de condutor" (obrigatória)
- `portal.screens.t05.intro` — "Diga quem estava dirigindo. Isso transfere a responsabilidade desta multa para essa pessoa."
- `portal.screens.t05.cmd.submit` — "Confirmar indicação"
- `portal.screens.t05.cmd.draft` — "Salvar rascunho"
- `portal.screens.t05.field.driverCpf` — "CPF do condutor"
- `portal.screens.t05.field.driverCnh` — "CNH do condutor"
- `portal.screens.t05.state.loading` — "Preparando a indicação..."
- `portal.screens.t05.state.ineligible` — "O prazo para indicar o condutor desta multa já terminou"
- `portal.screens.t05.state.error_recoverable` — "Verifique os dados do condutor destacados abaixo"
- `portal.screens.t05.state.forbidden` — "Para confirmar a indicação, confirme sua identidade com um passo a mais"
- `portal.screens.t05.state.unavailable` — "Este serviço está indisponível no momento"
- `portal.screens.t05.state.pending_signature` — "Aguardando a assinatura do condutor indicado"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
