---
id: IU-RAIT-035
title: Colegiado — confirmação de banca e suplentes — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/sessoes/:id/banca` (`rait-web-frontend.md` §4; sem tela
própria em [IU-RAIT-001] — antecede T-12).
Fontes: [UC-RAIT-015], [JRN-RAIT-003], [RN-RAIT-140], [RN-RAIT-142].

## 1. Identidade

- id: `IU-RAIT-035`; rota: `/colegiado/:orgao/sessoes/:id/banca` (`route-manifest.md` #35);
  `screen: '—'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `BenchPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #35).
- slug i18n: `colegiado-orgao-sessoes-id-banca` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-secretary`, `rait-chair` (`route-manifest.md` #35).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary', 'rait-chair'])` (M4).
- chave de política: `POST attendance` (JW-04 passo 4, notação análoga ao §7 —
  confirmação de banca não tem `recurso:ação` próprio listado em §7; tratado como
  `OD-R12-013` proposto).
- pré-condição: pauta fechada ([UC-RAIT-005]); sessão em `PAUTA_FECHADA`/`CONVOCACAO_ENVIADA`
  (`WF-RAIT-003`); suplente de plantão designado para a sessão ([UC-RAIT-013]).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/pauta` (após fechar pauta) ou
  `/colegiado/:orgao/sessoes` (linha da sessão); JW-04 passo 4; JW-08 passo 3.
- parâmetros de rota: `:orgao`, `:id`.
- deep-link canônico: `/colegiado/jari/sessoes/:id/banca`.

## 4. Dados

- resolver: "confirmação de banca e suplentes" (`route-manifest.md` #35).
- cliente gerado: `data/api/session.client.ts`.
- campos exibidos: banca prevista (`BANCA_PREVISTA` — titulares escalados + suplente de plantão,
  `WF-RAIT-004` §6), confirmações de presença até `T-CONV`, membros impedidos por item.
- calculado do backend: recálculo de quorum, presença do presidente/suplente e, no CETRAN,
  paridade dos blocos ([UC-RAIT-015] Fluxo 2) — feito pelo servidor, exibido na tela.

## 5. Estados

- carregando: skeleton da grade de banca.
- vazio: não se aplica — sessão identificada.
- erro recuperável: falha transitória ao confirmar presença — retry.
- sem permissão: 403 `RAIT.FORBIDDEN_ORGAO` → banner "sem permissão para esta ação".
- conflito: `RAIT.BENCH_INSUFFICIENT` (422) — banca abaixo do quorum até `T-CONV`
  (`rait-error-catalog.md` §3.7) → diálogo com a regra e a base legal.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação                         | Papel            | Pré-estado → pós-estado                                                          | Comando (proposto)           | Confirmação com efeito jurídico                                                      | Erros esperados           |
| ---------------------------- | ---------------- | -------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| confirmar presença           | `rait-secretary` | `BANCA_PREVISTA` → `BANCA_CONFIRMADA` \| `BANCA_INSUFICIENTE` (`WF-RAIT-004` §6) | `POST attendance`            | "Confirmações abaixo do quorum impedem a abertura da sessão sem convocar suplentes." | `RAIT.BENCH_INSUFFICIENT` |
| convocar suplente de plantão | `rait-secretary` | `BANCA_INSUFICIENTE` → `BANCA_PREVISTA` (novo ciclo de confirmação)              | `POST attendance` (suplente) | "O suplente de plantão é sempre o primeiro convocado, antes de qualquer outro."      | —                         |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11 — nenhum endpoint de comando do
RAIT está gerado hoje). `If-Match` sempre exigido.

## 7. Saída

- requisitos atendidos: `BANCA_CONFIRMADA`; a sessão pode abrir
  (`/colegiado/:orgao/sessoes/:id`, IU-RAIT-034).
- confirmações abaixo do quorum: `BANCA_INSUFICIENTE`, secretaria convoca o suplente de plantão
  primeiro ([UC-RAIT-015] AC-RAIT-015-2); se insuficiente, demais suplentes na ordem do
  regimento (`pendente regimento` na fonte original — tratado como premissa vigente por
  steering §H item 57, OD-110 em `open-decisions-rait.md` §B).
- presidente ausente sem suplente: sessão não abre, escalonamento ao gestor
  ([UC-RAIT-015] Fluxo alternativo 2b).
- item sem quorum por impedimentos na abertura: item retirado da pauta, devolvido a
  `PRONTO_P_DECISAO` com prioridade na próxima sessão ([UC-RAIT-015] AC-RAIT-015-3).

## 8. Segurança e LGPD

- registro de faltas injustificadas alimenta perda de mandato ([RN-RAIT-142]), sem exposição de
  dado sensível do membro.
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar entre membros da banca.
- estado da banca sempre com rótulo textual, não só cor ([IU-RAIT-001] §4).
- foco visível; convocação de suplente com confirmação explícita.

## 10. Testes

- unitário: banca é verificada antes e na abertura, nunca indefinida
  ([UC-RAIT-015] AC-RAIT-015-1); suplente de plantão é o primeiro convocado
  (AC-RAIT-015-2); impedimento retira o item, não a sessão (AC-RAIT-015-3); paridade no
  CETRAN-AM (AC-RAIT-015-4).
- roteamento: `rait-secretary`/`rait-chair` ativam; demais papéis → `/sem-permissao`.
- estados: `RAIT.BENCH_INSUFFICIENT`.

## Componentes compartilhados

`QuorumIndicator`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-sessoes-id-banca.title` — "Confirmação de banca"
- `rait.screens.colegiado-orgao-sessoes-id-banca.intro` — "Presenças confirmadas e suplentes convocados para a sessão"
- `rait.screens.colegiado-orgao-sessoes-id-banca.cmd.confirm` — "Confirmar presença"
- `rait.screens.colegiado-orgao-sessoes-id-banca.cmd.summon_substitute` — "Convocar suplente"
- `rait.screens.colegiado-orgao-sessoes-id-banca.state.insufficient` — "Banca abaixo do quorum"
