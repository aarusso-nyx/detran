---
id: IU-RAIT-028
title: Colegiado — distribuição por lote e sorteio — especificação de tela
status: draft
apps: [rait]
sources:
  [
    REF-CONTRAN-357,
    REF-CONTRAN-901-2022,
    REF-LEI-9784-1999,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/distribuicao` (`rait-web-frontend.md` §4; tela T-09 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-014], [JRN-RAIT-002], [JRN-RAIT-003], [RN-RAIT-140], [RN-RAIT-141],
[RN-RAIT-142].

## 1. Identidade

- id: `IU-RAIT-028`; rota: `/colegiado/:orgao/distribuicao` (`route-manifest.md` #28);
  `screen: 'T-09'`.
- módulo: `colegiado` — "distribuição por lote e sorteio (T-09) ... parametrizado por órgão
  (`jari` \| `cetran`)" (`rait-web-frontend.md` §2).
- página: `BatchesPage`; componente inteligente: `BatchDrawViewer` (`rait-web-frontend.md`
  §5.3).
- nível: `L2` (`route-manifest.md` #28).
- slug i18n: `colegiado-orgao-distribuicao` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-chair`, `rait-secretary` (`route-manifest.md` #28).
- guardas: `raitAuthGuard` + `roleGuard(['rait-chair', 'rait-secretary'])` (M4).
- chave de política: `inf:rait-batch:open` (§7, abrir lote); `inf:rait-batch:draw` (§7, sortear);
  `inf:rait-batch:approve` (§7, homologar — só `rait-chair`).
- pré-condição: casos em `DISTRIBUIDO` sem relator (fila F-J-1, [WF-RAIT-004] §2.2), com
  `data_recebimento` do órgão julgador registrada ([RN-RAIT-110], [RN-RAIT-111]); escala do
  período publicada ([UC-RAIT-013]); parâmetro `:orgao` ∈ {`jari`, `cetran`}.

## 3. Entrada

- de onde se chega: `/colegiado/:orgao` (raiz de grupo, primeiro filho para `rait-chair`/
  `rait-secretary`, `route-manifest.md` §B); [JRN-RAIT-002] (formação de pauta antecede a
  relatoria, mesma cadeia); JW-04 passo 1; JW-08 passo 1.
- parâmetros de rota: `:orgao` ∈ {`jari`, `cetran`}.
- lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/colegiado/jari/distribuicao` ou `/colegiado/cetran/distribuicao`.

## 4. Dados

- resolver: "lotes de sorteio" (`route-manifest.md` #28).
- cliente gerado: `data/api/session.client.ts`/`worklist.client.ts` (`rait-web-frontend.md`
  §8), `POST /v1/inf/rait/batches`, `…/draw`, `…/approve` (§7).
- campos exibidos: lista de casos na ordem única de consumo (§2 de [WF-RAIT-004]: risco →
  prioridade legal → cronológica, [RN-RAIT-141]), membros elegíveis (`ATIVO` e
  `DISPONIVEL`/`EM_PLANTAO`, titulares primeiro — `WF-RAIT-004` §5, passo 2), estado do lote
  (`LOTE_ABERTO` · `LOTE_SORTEADO` · `LOTE_ACEITO` — `WF-RAIT-004` §9).
- calculado do backend: exclusão de membros impedidos/suspeitos por caso ([RN-RAIT-140]),
  round-robin com semente aleatória e carga ponderada ([WF-RAIT-004] §5 passo 4) — a tela nunca
  recalcula o sorteio, só exibe e homologa.

## 5. Estados

- carregando: skeleton da lista de casos e da ata.
- vazio: "nenhum caso aguardando distribuição neste órgão".
- erro recuperável: falha transitória — retry.
- sem permissão: `RAIT.FORBIDDEN_ORGAO` (403) — papel atuando no órgão errado
  (`rait-error-catalog.md` §3.1) → banner "sem permissão para esta ação".
- conflito: `RAIT.BATCH_STATE_INVALID` (409) — operação fora de
  `LOTE_ABERTO`/`LOTE_SORTEADO`/`LOTE_ACEITO`; `RAIT.BATCH_NO_ELIGIBLE_MEMBERS` (422) — sem
  membros elegíveis suficientes → diálogo bloqueante com a base legal.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel            | Pré-estado → pós-estado                            | Comando (§7)                | Confirmação com efeito jurídico                                                              | Erros esperados                                        |
| --------------------- | ---------------- | -------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `rait.batch:open`     | `rait-secretary` | — → `LOTE_ABERTO` (`WF-RAIT-004` §9)               | `POST /v1/inf/rait/batches` | "Ao abrir o lote, os casos sem relator entram na base do próximo sorteio."                   | `RAIT.BATCH_STATE_INVALID`                             |
| `rait.batch:draw`     | `rait-secretary` | `LOTE_ABERTO` → `LOTE_SORTEADO`                    | `POST …/draw`               | "Ao sortear, a ata registra semente, ordem e membro por caso, e é assinada pelo presidente." | `RAIT.BATCH_NO_ELIGIBLE_MEMBERS`                       |
| `rait.batch:approve`  | `rait-chair`     | `LOTE_SORTEADO` → `LOTE_ACEITO` (`T-CLAIM` armado) | `POST …/approve`            | "Ao homologar, `T-CLAIM` inicia para cada relator aceitar ou declarar impedimento."          | `RAIT.BATCH_SEED_TAMPERED`, `RAIT.BATCH_STATE_INVALID` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- lote sorteado leva a `/colegiado/:orgao/distribuicao/:loteId` (ata do lote, aceites,
  impedimentos, IU-RAIT-029).
- caso sem membro elegível: fica fora do lote e abre incidente de capacidade ao gestor
  ([UC-RAIT-014] Fluxo alternativo 3a).
- caso `ALERTA_N3`/`CRITICO` recebido fora do ciclo: entra em lote extraordinário imediato, ao
  membro elegível de menor carga, sem esperar o ciclo semanal ([UC-RAIT-014] AC-RAIT-014-4).
- SSE: `batch.changed` (`rait-web-frontend.md` §8) atualiza a lista quando o sorteio conclui ou
  quando um relator aceita/declara impedimento no mesmo lote.

## 8. Segurança e LGPD

- ata do sorteio guarda semente, ordem e resultado por caso, assinada (PAdES+TSA) pelo
  presidente ([UC-RAIT-014] AC-RAIT-014-1) — sem dado sensível de terceiro na ata.
- membros excluídos por impedimento aparecem na ata com o fundamento ([UC-RAIT-014]
  AC-RAIT-014-2), nunca com dado clínico ou sensível não pertinente.
- texto livre da petição nunca em painéis de distribuição ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar entre casos do lote (`rait-web-frontend.md` §10).
- risco (`ALERTA_N3`/`CRITICO`) sempre por rótulo textual, não só cor ([IU-RAIT-001] §4).
- foco visível; homologação com confirmação explícita e efeito jurídico em linguagem clara.

## 10. Testes

- unitário: sorteio reproduzível e assinado ([UC-RAIT-014] AC-RAIT-014-1); impedido não entra
  no sorteio do caso (AC-RAIT-014-2); silêncio no prazo de aceite redistribui
  (AC-RAIT-014-3); risco não espera o ciclo (AC-RAIT-014-4).
- roteamento: `rait-chair`/`rait-secretary` ativam; demais papéis canônicos → `/sem-permissao`;
  `:orgao` inválido fora de {`jari`, `cetran`} não roteia.
- estados: `RAIT.BATCH_NO_ELIGIBLE_MEMBERS`; vazio.

## Componentes compartilhados

`BatchDrawViewer`, `QueueTable`, `RiskFlag`, `ImpedimentDialog`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-distribuicao.title` — "Distribuição por sorteio"
- `rait.screens.colegiado-orgao-distribuicao.intro` — "Lotes de casos sem relator, distribuídos por sorteio auditável"
- `rait.screens.colegiado-orgao-distribuicao.empty` — "Nenhum caso aguardando distribuição"
- `rait.screens.colegiado-orgao-distribuicao.cmd.open` — "Abrir lote"
- `rait.screens.colegiado-orgao-distribuicao.cmd.draw` — "Sortear"
- `rait.screens.colegiado-orgao-distribuicao.cmd.approve` — "Homologar"
