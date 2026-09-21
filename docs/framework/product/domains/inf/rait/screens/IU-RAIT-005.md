---
id: IU-RAIT-005
title: Fila de trabalho — recurso (relatoria) — especificação de tela
status: draft
apps: [rait]
sources:
  [
    REF-CONTRAN-357,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-CONTRAN-900,
    REF-CONTRAN-918,
  ]
updated: 2026-09-21
---

Ficha da rota `fila/recurso/:orgao` (`rait-web-frontend.md` §4; tela T-02 de [IU-RAIT-001]).
Fontes: [UC-RAIT-004], [JRN-RAIT-001].

## 1. Identidade

- id: `IU-RAIT-005`; `path`: `fila/recurso/:orgao` (`route-manifest.md` #5).
- `screen`: `T-02`; módulo: `fila` (`rait-web-frontend.md` §2).
- página: `RapporteurCasesPage`; componente inteligente: `QueueTable` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `fila-recurso-orgao`.

## 2. Acesso

- papéis: `rait-rapporteur` (`route-manifest.md` #5).
- guardas: `raitAuthGuard` + `roleGuard(['rait-rapporteur'])`.
- sem chave de comando própria nesta tela — é leitura (`GET assignments?member=me`, JW-07 passo 2);
  as ações de mérito ficam em `/casos/:id/dossie` e em
  `/colegiado/:orgao/relatoria/:caseId/voto`.
- pré-condição: relator com casos distribuídos no órgão (`:orgao`), sem impedimento pendente
  ([WF-RAIT-002] §5).

## 3. Entrada

- de onde se chega: `/` via `RoleHomeRedirect` (papel `rait-rapporteur`, rota inicial `/painel`);
  navegação lateral do módulo `fila`.
- parâmetros de rota: `:orgao` ∈ {`jari`, `cetran`}.
- `?q=&ordem=&filtro=`: aceita filtro/ordenação sincronizados com a tabela.
- deep-link canônico: `/fila/recurso/jari` ou `/fila/recurso/cetran`.

## 4. Dados

- resolver: "meus casos distribuídos (relatoria)" (`route-manifest.md` #5; [UC-RAIT-004]).
- clientes: `data/api/worklist.client.ts` (`GET assignments?member=me`, JW-07 passo 2).
- calculado do backend: dias corridos desde a distribuição e prazo interno `T-VOTO` (proposta 20
  dias — [WF-RAIT-003]; steering A.5) exibidos como meta operacional, nunca como teto legal
  (AC-RAIT-004-4).

## 5. Estados

- **carregando**: skeleton da `QueueTable`.
- **vazio**: nenhum caso distribuído no momento neste órgão.
- **erro recuperável**: falha ao carregar; retry.
- **sem permissão**: papel diferente de `rait-rapporteur`, ou órgão fora dos papéis do usuário —
  `RAIT.FORBIDDEN_ORGAO` (403, catálogo §3.1): banner "sem permissão para esta ação".
- **conflito**: impedimento registrado depois da distribuição — `RAIT.MEMBER_IMPEDED` (422,
  catálogo §3.4): a linha do caso é removida da fila do relator.

## 6. Comandos

Nenhum comando de mutação nesta tela — é leitura da carteira do relator. As ações de mérito
(aceitar lote, declarar impedimento, votar) pertencem a `/colegiado/:orgao/relatoria` e a
`/colegiado/:orgao/relatoria/:caseId/voto` (fora do lote A).

## 7. Saída

- clique num item navega a `/casos/:id/dossie` (leitura) para instrução ou diligência
  complementar (JW-07 passo 3).

## 8. Segurança e LGPD

- `QueueTable` não exibe texto livre da petição ([RN-RAIT-134]); terceiros suprimidos
  ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- `j`/`k` navegam a lista; `enter` abre o item selecionado (`rait-web-frontend.md` §10).
- prazo interno de voto exibido com rótulo textual, distinto visualmente do teto legal de 24 meses
  ([IU-RAIT-001] §Requisitos transversais item 2; AC-RAIT-004-4).

## 10. Testes

- roteamento: `rait-rapporteur` ativa; demais papéis → `/sem-permissao` (M14); `:orgao` fora dos
  órgãos do relator → `RAIT.FORBIDDEN_ORGAO`.
- critérios ligados a [UC-RAIT-004] (AC-RAIT-004-4 — prazo interno rotulado como meta operacional;
  AC-RAIT-004-5 — caso com `ALERTA_N3`/`CRITICO` elegível a reatribuição independentemente do
  prazo interno).

## Componentes compartilhados

`QueueTable`, `DeadlineChip`, `RiskFlag` (`rait-web-frontend.md` §5.2, §5.3).

## Chaves i18n

- `rait.screens.fila-recurso-orgao.title` — "Meus casos distribuídos"
- `rait.screens.fila-recurso-orgao.intro` — "Recursos distribuídos a você, por prazo interno de voto."
- `rait.screens.fila-recurso-orgao.empty` — "Nenhum caso distribuído neste órgão."
