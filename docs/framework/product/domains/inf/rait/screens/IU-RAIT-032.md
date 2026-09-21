---
id: IU-RAIT-032
title: Colegiado — montagem e fechamento da pauta — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/pauta` (`rait-web-frontend.md` §4; tela T-11 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-005], [JRN-RAIT-002], [RN-RAIT-112].

## 1. Identidade

- id: `IU-RAIT-032`; rota: `/colegiado/:orgao/pauta` (`route-manifest.md` #32);
  `screen: 'T-11'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `AgendaBuilderPage`; componente inteligente: `AgendaComposer` — "arrasta itens; bloqueio
  sem N3/CRÍTICO" (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #32).
- slug i18n: `colegiado-orgao-pauta` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-chair` (`route-manifest.md` #32).
- guardas: `raitAuthGuard` + `roleGuard(['rait-chair'])` (M4).
- chave de política: `inf:rait-agenda:close` (§7).
- pré-condição: existem casos em `PRONTO_P_DECISAO` com parecer/voto do relator já registrado
  ([UC-RAIT-005] Pré-condições).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/distribuicao/:loteId` (após homologar o sorteio); JW-08
  passo 2.
- parâmetros de rota: `:orgao`.
- deep-link canônico: `/colegiado/jari/pauta`.

## 4. Dados

- resolver: "montagem e fechamento da pauta" (`route-manifest.md` #32).
- cliente gerado: `data/api/session.client.ts`, `POST /v1/inf/rait/sessions/{id}/commands/close-agenda`
  (§7).
- campos exibidos: fila `PRONTO_P_DECISAO` do pool (JARI ou CETRAN), casos com bandeira
  `ALERTA_N3`/`CRITICO` destacados como entrada obrigatória ([UC-RAIT-005] Fluxo 2; `WF-RAIT-002`
  §4), demais casos por ordem FIFO/ordem única.
- calculado do backend: bandeira de risco (`ALERTA_N3`/`CRITICO`) vem do relógio B de
  [WF-RAIT-001] via `WF-RAIT-002` §4 — a tela nunca recalcula o nível de risco.

## 5. Estados

- carregando: skeleton do `AgendaComposer`.
- vazio: "nenhum caso pronto para pauta".
- erro recuperável: falha transitória — retry.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.AGENDA_ITEM_WITHOUT_OPINION` (422) — item sem parecer registrado;
  `RAIT.AGENDA_CRITICAL_MISSING` (422) — fechamento sem `ALERTA_N3`/`CRITICO`;
  `RAIT.AGENDA_SHORT_NOTICE` (422) — antecedência insuficiente, exige `shortNoticeAck`;
  `RAIT.AGENDA_ITEM_DUPLICATE` (409) — caso já pautado em outra sessão aberta
  (`rait-error-catalog.md` §3.7) → diálogo bloqueante com a regra e a base legal.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel        | Pré-estado → pós-estado                                                                        | Comando (§7)                                            | Confirmação com efeito jurídico                                                                     | Erros esperados                                                                                                              |
| --------------------- | ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `rait.agenda:close`   | `rait-chair` | `PRONTO_P_DECISAO` (itens) → `PAUTADO` ([WF-RAIT-001]); sessão `PAUTA_FECHADA` ([WF-RAIT-003]) | `POST /v1/inf/rait/sessions/{id}/commands/close-agenda` | "Ao fechar a pauta, a convocação aos membros é disparada no mesmo ato, sem etapa manual adicional." | `RAIT.AGENDA_ITEM_WITHOUT_OPINION`, `RAIT.AGENDA_CRITICAL_MISSING`, `RAIT.AGENDA_SHORT_NOTICE`, `RAIT.AGENDA_ITEM_DUPLICATE` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- fechamento bem-sucedido: N casos passam a `PAUTADO`, sessão vai a `PAUTA_FECHADA`
  (`WF-RAIT-003`), convocação disparada no mesmo ato ([UC-RAIT-005] AC-RAIT-005-3) — navega a
  `/colegiado/:orgao/sessoes`.
- volume de `CRITICO` excede a capacidade de uma sessão ordinária: presidente é orientado a
  `/colegiado/:orgao/extraordinaria` ([UC-RAIT-005] Fluxo alternativo 2a).
- desistência antes da sessão: caso é removido da pauta automaticamente, pauta permanece válida
  para os demais ([UC-RAIT-005] AC-RAIT-005-5).
- SSE: `agenda-item.changed` atualiza a composição da pauta ao vivo.

## 8. Segurança e LGPD

- texto livre da petição nunca exibido no `AgendaComposer` além do estritamente necessário à
  montagem ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- arrastar itens tem alternativa por teclado (`rait-web-frontend.md` §10, item 5;
  [IU-RAIT-001] §5).
- risco (`ALERTA_N3`/`CRITICO`) sempre por rótulo textual e ordenação, não só cor
  ([IU-RAIT-001] §4).
- foco visível; bloqueio de fechamento sem N3/CRÍTICO anunciado por `aria-live`.

## 10. Testes

- unitário: casos em risco entram na pauta obrigatoriamente ([UC-RAIT-005] AC-RAIT-005-1); só
  entra caso com parecer registrado (AC-RAIT-005-2); fechar a pauta pauta os casos e dispara a
  convocação (AC-RAIT-005-3); antecedência mínima de convocação é verificada
  (AC-RAIT-005-4); desistência remove da pauta (AC-RAIT-005-5).
- roteamento: `rait-chair` ativa; demais papéis → `/sem-permissao`.
- estados: `RAIT.AGENDA_CRITICAL_MISSING`; `RAIT.AGENDA_SHORT_NOTICE`.

## Componentes compartilhados

`RiskFlag`, `DeadlineChip`, `QueueTable`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-pauta.title` — "Montagem da pauta"
- `rait.screens.colegiado-orgao-pauta.intro` — "Casos prontos para decisão, priorizando risco de prescrição"
- `rait.screens.colegiado-orgao-pauta.empty` — "Nenhum caso pronto para pauta"
- `rait.screens.colegiado-orgao-pauta.cmd.close` — "Fechar pauta"
- `rait.screens.colegiado-orgao-pauta.state.critical_missing` — "Há casos em risco crítico fora da pauta"
