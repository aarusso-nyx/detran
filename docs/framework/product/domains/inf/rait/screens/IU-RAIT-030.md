---
id: IU-RAIT-030
title: Colegiado — meus casos de relatoria — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/relatoria` (`rait-web-frontend.md` §4; tela T-10 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-004], [JRN-RAIT-002], [RN-RAIT-116], [RN-RAIT-140].

## 1. Identidade

- id: `IU-RAIT-030`; rota: `/colegiado/:orgao/relatoria` (`route-manifest.md` #30);
  `screen: 'T-10'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `RapporteurCasesPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #30).
- slug i18n: `colegiado-orgao-relatoria` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-rapporteur` (`route-manifest.md` #30).
- guardas: `raitAuthGuard` + `roleGuard(['rait-rapporteur'])` (M4).
- chave de política: `inf:rait-batch:accept` / `inf:rait-batch:impede` (§7).
- pré-condição: relator sorteado/distribuído sem impedimento declarado ([UC-RAIT-004]
  Pré-condições; [WF-RAIT-002] §5); `:orgao` ∈ {`jari`, `cetran`}.

## 3. Entrada

- de onde se chega: `/colegiado/:orgao` (raiz de grupo, primeiro filho para `rait-rapporteur`,
  `route-manifest.md` §B); [JRN-RAIT-002] passo 1; JW-07 passo 1.
- parâmetros de rota: `:orgao`.
- lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/colegiado/jari/relatoria`.

## 4. Dados

- resolver: "meus casos, T-VOTO, aceitar lote" (`route-manifest.md` #30).
- cliente gerado: `data/api/worklist.client.ts`, `GET assignments?member=me` (JW-07 passo 2).
- campos exibidos: lote sorteado com prazo `T-CLAIM` (JW-07 passo 1), casos já aceitos com
  `T-VOTO` por caso (proposta 20 dias — `WF-RAIT-004` §9, `OD-005`), dias corridos desde a
  interposição do recurso (JRN-RAIT-002 passo 1).
- calculado do backend: `T-VOTO` e `T-CLAIM` vêm do backend, não recalculados no cliente
  ([RN-RAIT-005]).

## 5. Estados

- carregando: skeleton da tabela.
- vazio: "nenhum caso distribuído a você neste órgão".
- erro recuperável: falha transitória — retry.
- sem permissão: 403 `RAIT.FORBIDDEN_ORGAO` → banner "sem permissão para esta ação".
- conflito: `RAIT.BATCH_CLAIM_EXPIRED` (409) — aceite após `T-CLAIM`
  (`rait-error-catalog.md` §3.4) → recarrega.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel             | Pré-estado → pós-estado                                     | Comando (§7)                                    | Confirmação com efeito jurídico                                                                      | Erros esperados            |
| --------------------- | ----------------- | ----------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| `rait.batch:accept`   | `rait-rapporteur` | `LOTE_SORTEADO` (item) → `EM_INSTRUCAO` com `T-VOTO` armado | `POST …/batches/{id}/items/{caseId}/accept`     | "Ao aceitar, você assume a relatoria; o voto deve ser registrado dentro do prazo interno."           | `RAIT.BATCH_CLAIM_EXPIRED` |
| `rait.batch:impede`   | `rait-rapporteur` | `LOTE_SORTEADO` (item) → redistribuído ao próximo da ordem  | `POST …/batches/{id}/items/{caseId}/impediment` | "Ao declarar impedimento, o caso é redistribuído; nenhum trabalho seu sobre o mérito é aproveitado." | —                          |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- aceite: caso passa a `EM_INSTRUCAO`, disponível em `/casos/:id/dossie` para leitura (aba
  herdada de `/casos/:id`) e em `/colegiado/:orgao/relatoria/:caseId/voto` para o parecer.
- impedimento declarado antes de qualquer acesso ao mérito: caso retorna ao pool e é
  redistribuído a outro membro ([UC-RAIT-004] AC-RAIT-004-2); registrado no histórico do caso.
- SSE: `batch.changed`/`assignment.changed` atualiza a lista quando um novo lote é homologado.

## 8. Segurança e LGPD

- impedimento é exigido antes de liberar o dossiê ([UC-RAIT-004] AC-RAIT-004-1; [RN-RAIT-140]).
- texto livre da petição nunca em lista/painel de gestão ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir o caso (`rait-web-frontend.md` §10).
- `T-VOTO`/`T-CLAIM` sempre com base/proposta ao lado, nunca isolados ([IU-RAIT-001] §1).
- foco visível; declaração de impedimento com confirmação explícita.

## 10. Testes

- unitário: impedimento exigido antes de qualquer acesso ao mérito ([UC-RAIT-004]
  AC-RAIT-004-1); impedimento declarado redistribui sem rastro de mérito (AC-RAIT-004-2).
- roteamento: `rait-rapporteur` ativa; demais papéis → `/sem-permissao`.
- estados: `RAIT.BATCH_CLAIM_EXPIRED`; vazio.

## Componentes compartilhados

`QueueTable`, `DeadlineChip`, `ImpedimentDialog`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-relatoria.title` — "Minha relatoria"
- `rait.screens.colegiado-orgao-relatoria.intro` — "Casos distribuídos a você, com prazo interno de voto"
- `rait.screens.colegiado-orgao-relatoria.empty` — "Nenhum caso distribuído a você"
- `rait.screens.colegiado-orgao-relatoria.cmd.accept` — "Aceitar"
- `rait.screens.colegiado-orgao-relatoria.cmd.impede` — "Declarar impedimento"
