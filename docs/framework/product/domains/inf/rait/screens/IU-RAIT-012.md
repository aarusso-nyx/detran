---
id: IU-RAIT-012
title: Decisão / assinatura da defesa prévia — especificação de tela
status: draft
apps: [rait]
sources:
  [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `casos/:id/decisao` (`rait-web-frontend.md` §4; tela T-07 de [IU-RAIT-001], lado
autoridade). Fontes: [UC-RAIT-003] (`route-manifest.md`, coluna `uc`); conteúdo dos comandos e
estados por [UC-RAIT-016], [RN-RAIT-115], [RN-RAIT-143], [RN-RAIT-114], [RN-RAIT-132],
[RN-RAIT-140].

## 1. Identidade

- id: `IU-RAIT-012`; `path`: `casos/:id/decisao` (`route-manifest.md` #12).
- `screen`: `T-07`; módulo: `caso` (`rait-web-frontend.md` §2).
- a página não tem nome próprio em §5.3 para `/casos/:id/decisao` (distinta de
  `SigningDecisionPage`, que serve `/assinatura/:caseId`); componentes inteligentes:
  `DecisionPanel` (minuta lado a lado, decisão, fundamentação, assinatura PAdES+TSA) e
  `SignatureDialog` (`rait-web-frontend.md` §5.2).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-decisao`.

## 2. Acesso

- papéis: `rait-signing-authority` (`route-manifest.md` #12).
- guardas: as de `/casos/:id` + `roleGuard(['rait-signing-authority'])`.
- chaves de política: `inf:rait-decision:sign`, `inf:rait-decision:return-draft`,
  `inf:rait-impediment:declare` (`rait-web-frontend.md` §7).
- pré-condição: caso em `PRONTO_P_DECISAO` com minuta do revisor (fila `F-DP-5`,
  [WF-RAIT-004] §2.1); autoridade `EM_PLANTAO`/`DISPONIVEL` na escala de assinatura da
  circunscrição ([UC-RAIT-016] Pré-condições); `T-DEC` da infração ainda aberto ([WF-INF-003] §3).
- é a aba inicial para `rait-signing-authority` quando a URL termina em `/casos/:id`
  (`route-manifest.md` §C).

## 3. Entrada

- de onde se chega: `/assinatura` (fila F-DP-5 da circunscrição, JW-05 passo 1); aba inicial do
  layout para `rait-signing-authority`.
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/decisao` (equivalente, para esta autoridade, a
  `/assinatura/:caseId`).

## 4. Dados

- resolver: "decisão/assinatura (lado autoridade)" (`route-manifest.md` #12).
- clientes: `data/api/case.client.ts` (minuta, dossiê, parecer de admissibilidade).
- calculado do backend: dias restantes de `T-DEC` ([UC-RAIT-016] passo 1); enquadramento e provas
  anexadas de ofício exibidos, não editáveis nesta tela ([UC-RAIT-016] passo 2).

## 5. Estados

- **carregando**: skeleton do `DecisionPanel`.
- **vazio**: não se aplica — sempre há uma minuta pronta ao chegar a esta aba.
- **erro recuperável**: falha ao carregar minuta/dossiê; retry.
- **sem permissão**: `RAIT.FORBIDDEN_CASE_SCOPE` (403, catálogo §3.1) — caso fora da
  circunscrição da autoridade.
- **conflito**: `RAIT.DECISION_ALREADY_SIGNED` (409, catálogo §3.6) — segunda assinatura do mesmo
  ato; recarrega.
- **erro de negócio**: `RAIT.DECISION_JURISDICTION` (403) — autoridade fora da circunscrição do
  AIT; `RAIT.DECISION_NOT_ON_DUTY` (422) — fora da escala do dia; `RAIT.DECISION_GROUNDS_REQUIRED`
  (422) — fundamentação vazia; `RAIT.DRAFT_AUTHOR_CANNOT_SIGN` (403) — autor da minuta tentando
  decidir; `RAIT.DRAFT_RETURN_LIMIT` (422) — segunda devolução; `RAIT.SIGNATURE_FAILED` (502) —
  kernel PAdES+TSA indisponível; `RAIT.SIGNATURE_CERT_MISMATCH` (422).

## 6. Comandos

| Ação (`recurso:ação`)            | Papel                    | Pré-estado → pós-estado                  | Comando                                                                                      | Confirmação com efeito jurídico                                                                                                    | Erros esperados                                                                                                                                       |
| -------------------------------- | ------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rait.decision:sign` (acolher)   | `rait-signing-authority` | `PRONTO_P_DECISAO`→`DECIDIDO_AUTORIDADE` | `POST /v1/inf/rait/decisions` + `.../commands/decide` (endpoint de comando: R-0007 CTG-0004) | "Ao acolher, o AIT é cancelado, o registro é arquivado e o proprietário é comunicado" ([RN-RAIT-132]; [UC-RAIT-016] passo 3)       | `RAIT.DECISION_JURISDICTION`, `RAIT.DECISION_NOT_ON_DUTY`, `RAIT.DECISION_GROUNDS_REQUIRED`, `RAIT.DRAFT_AUTHOR_CANNOT_SIGN`, `RAIT.SIGNATURE_FAILED` |
| `rait.decision:sign` (indeferir) | `rait-signing-authority` | `PRONTO_P_DECISAO`→`DECIDIDO_AUTORIDADE` | idem                                                                                         | "Ao indeferir, a penalidade é aplicada e a NP expedida; o prazo de recurso começa a contar" ([RN-RAIT-132]; [UC-RAIT-016] passo 3) | idem                                                                                                                                                  |
| `rait.decision:return-draft`     | `rait-signing-authority` | `PRONTO_P_DECISAO` (revisor notificado)  | `POST /v1/inf/rait/.../commands/return-draft` (endpoint de comando: R-0007 CTG-0004)         | "Devolução única; nova devolução exige ato motivado do coordenador" ([UC-RAIT-016] 3a; AC-RAIT-016-3)                              | `RAIT.DRAFT_RETURN_LIMIT`                                                                                                                             |
| `rait.impediment:declare`        | `rait-signing-authority` | inalterado (roteado ao substituto)       | `POST /v1/inf/rait/impediments` (endpoint de comando: R-0007 CTG-0004)                       | "O caso é roteado ao substituto de plantão da circunscrição" ([UC-RAIT-016] 3b; [RN-RAIT-140])                                     | —                                                                                                                                                     |

- `If-Match` sempre exigido; assinatura só após confirmação com o efeito jurídico em linguagem
  clara (`rait-web-frontend.md` §7 último parágrafo).
- a assinatura é pessoal e territorial: só a autoridade escalada na circunscrição do AIT, ou seu
  substituto designado, assina (AC-RAIT-016-1; [RN-RAIT-143]).
- decisão fora do prazo decadencial (`T-DEC` vencido) é bloqueada e encaminha à declaração de
  decadência (AC-RAIT-016-4; `/gestao/incidentes`, fora do lote A).

## 7. Saída

- decisão assinada segue para comunicação ao requerente ([UC-RAIT-016] passo 5) e a infração
  transita conforme [WF-INF-003] #8/#9.
- devolução com orientação volta o caso à minuta do revisor (`/casos/:id/minuta`).
- impedimento roteia o caso ao substituto de plantão; a autoridade segue para o próximo item da
  fila F-DP-5.

## 8. Segurança e LGPD

- `DecisionPanel` não exibe texto livre de terceiros sem necessidade ([RN-RAIT-134],
  [RN-RAIT-137]).
- autoria de minuta e decisão fica visualmente separada ([IU-RAIT-001] §3; AC-RAIT-004-1
  correspondente do lado colegiado).

## 9. Acessibilidade e atalhos

- risco de vencimento de `T-DEC` nunca só por cor ([IU-RAIT-001] §4); foco visível no diálogo de
  assinatura.

## 10. Testes

- roteamento: `rait-signing-authority` ativa; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-016]: AC-RAIT-016-1 (assinatura pessoal e territorial),
  AC-RAIT-016-2 (revisor nunca assina), AC-RAIT-016-3 (devolução única e rastreada),
  AC-RAIT-016-4 (decisão fora do prazo decadencial é bloqueada).

## Componentes compartilhados

`DecisionPanel`, `SignatureDialog`, `ImpedimentDialog`, `LegalBasisTooltip`
(`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-decisao.title` — "Decisão da defesa prévia"
- `rait.screens.casos-id-decisao.intro` — "Minuta e dossiê lado a lado, para decisão e assinatura."
- `rait.screens.casos-id-decisao.cmd.accept` — "Acolher"
- `rait.screens.casos-id-decisao.cmd.reject` — "Indeferir"
- `rait.screens.casos-id-decisao.cmd.return-draft` — "Devolver com orientação"
- `rait.screens.casos-id-decisao.cmd.declare-impediment` — "Declarar impedimento"
