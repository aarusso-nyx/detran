---
id: IU-RAIT-029
title: Colegiado — ata do lote — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022, REF-LEI-9784-1999]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/distribuicao/:loteId` (`rait-web-frontend.md` §4; sem tela
própria em [IU-RAIT-001] — detalhamento de T-09).
Fontes: [UC-RAIT-014], [JRN-RAIT-002], [JRN-RAIT-003], [RN-RAIT-140], [RN-RAIT-141],
[RN-RAIT-142].

## 1. Identidade

- id: `IU-RAIT-029`; rota: `/colegiado/:orgao/distribuicao/:loteId` (`route-manifest.md` #29);
  `screen: '—'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `BatchDetailPage`; componente inteligente: `BatchDrawViewer`
  (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #29).
- slug i18n: `colegiado-orgao-distribuicao-loteId` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-chair`, `rait-secretary` (`route-manifest.md` #29).
- guardas: `raitAuthGuard` + `roleGuard(['rait-chair', 'rait-secretary'])` (M4).
- chave de política: `inf:rait-batch:approve` (§7, homologação — só `rait-chair`);
  `inf:rait-batch:accept` / `inf:rait-batch:impede` (§7, executados pelo relator, fora do
  alcance de escrita desta tela — a secretaria e o presidente só acompanham).
- pré-condição: lote em `LOTE_SORTEADO` ou `LOTE_ACEITO` (`WF-RAIT-004` §9); `:orgao` ∈
  {`jari`, `cetran`}.

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/distribuicao` (linha do lote); JW-04 passo 3; JW-08
  passo 1.
- parâmetros de rota: `:orgao`, `:loteId`.
- deep-link canônico: `/colegiado/jari/distribuicao/:loteId`.

## 4. Dados

- resolver: "ata do lote, aceites, impedimentos" (`route-manifest.md` #29).
- cliente gerado: `data/api/worklist.client.ts`/`session.client.ts`.
- campos exibidos: ata do sorteio (lote, semente, ordem, membro por caso — [UC-RAIT-014]
  AC-RAIT-014-1), estado de aceite por item (`T-CLAIM`, `WF-RAIT-004` §5 passo 5), impedimentos
  declarados por caso.
- calculado do backend: redistribuição automática ao próximo da ordem quando `T-CLAIM` vence
  sem aceite, ou quando o relator declara impedimento ([UC-RAIT-014] Fluxo alternativo 4a/4b) —
  a tela exibe o resultado, não decide a redistribuição.

## 5. Estados

- carregando: skeleton da ata.
- vazio: não se aplica — tela de um lote identificado.
- erro recuperável: falha transitória — retry.
- sem permissão: 403 `RAIT.FORBIDDEN_ORGAO` → banner "sem permissão para esta ação".
- conflito: `RAIT.BATCH_SEED_TAMPERED` (422) — semente/ordem não confere com a ata;
  `RAIT.BATCH_CLAIM_EXPIRED` (409) — aceite após `T-CLAIM` (`rait-error-catalog.md` §3.4) →
  recarrega.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel        | Pré-estado → pós-estado                                     | Comando (§7)     | Confirmação com efeito jurídico                                                             | Erros esperados                                        |
| --------------------- | ------------ | ----------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `rait.batch:approve`  | `rait-chair` | `LOTE_SORTEADO` → `LOTE_ACEITO` (`T-CLAIM` armado por item) | `POST …/approve` | "Ao homologar, cada relator do lote recebe `T-CLAIM` para aceitar ou declarar impedimento." | `RAIT.BATCH_SEED_TAMPERED`, `RAIT.BATCH_STATE_INVALID` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.
Os comandos de aceite/impedimento por relator (`rait-batch:accept`/`impede`) pertencem à ficha
de relatoria (IU-RAIT-030), não a esta.

## 7. Saída

- todos os itens resolvidos: lote passa a `LOTE_ACEITO`, casos `[DISTRIBUIDO]` com relator
  ([UC-RAIT-014] Pós-condições) — volta à lista `/colegiado/:orgao/distribuicao`.
- impedimento em `T-CLAIM`: redistribuído ao próximo da ordem do mesmo lote, com registro, sem
  novo sorteio ([UC-RAIT-014] Fluxo alternativo 4a).
- SSE: `batch.changed` atualiza o estado de aceite item a item, ao vivo.

## 8. Segurança e LGPD

- ata sem dado sensível de terceiro; exclusões por impedimento registradas com o fundamento
  ([RN-RAIT-140]), nunca com detalhe clínico ou familiar além do necessário.
- texto livre da petição nunca exibido nesta tela ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar entre itens do lote.
- `T-CLAIM` sempre exibido com dias/horas restantes e o efeito da expiração em texto
  ([IU-RAIT-001] §1).
- foco visível; homologação com confirmação explícita do efeito jurídico.

## 10. Testes

- unitário: sorteio reproduzível e assinado ([UC-RAIT-014] AC-RAIT-014-1); impedido excluído do
  sorteio do caso, exclusão na ata (AC-RAIT-014-2); silêncio no prazo redistribui
  (AC-RAIT-014-3).
- roteamento: `rait-chair`/`rait-secretary` ativam; demais papéis → `/sem-permissao`.
- estados: `RAIT.BATCH_SEED_TAMPERED`; `RAIT.BATCH_CLAIM_EXPIRED`.

## Componentes compartilhados

`BatchDrawViewer`, `ImpedimentDialog`, `DeadlineChip`, `EventTimeline`.

## Chaves i18n

- `rait.screens.colegiado-orgao-distribuicao-loteId.title` — "Ata do lote"
- `rait.screens.colegiado-orgao-distribuicao-loteId.intro` — "Sorteio, aceites e impedimentos do lote"
- `rait.screens.colegiado-orgao-distribuicao-loteId.cmd.approve` — "Homologar sorteio"
- `rait.screens.colegiado-orgao-distribuicao-loteId.field.seed` — "Semente do sorteio"
- `rait.screens.colegiado-orgao-distribuicao-loteId.state.claim_expired` — "O prazo de aceite deste item já venceu"
