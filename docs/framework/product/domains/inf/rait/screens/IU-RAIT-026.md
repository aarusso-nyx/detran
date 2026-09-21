---
id: IU-RAIT-026
title: Assinatura — decisão da defesa prévia — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/assinatura/:caseId` (`rait-web-frontend.md` §4; tela T-07 de [IU-RAIT-001],
lado autoridade).
Fontes: [UC-RAIT-016], [JRN-RAIT-001], [RN-RAIT-115], [RN-RAIT-140], [RN-RAIT-143].

## 1. Identidade

- id: `IU-RAIT-026`; rota: `/assinatura/:caseId` (`route-manifest.md` #25); `screen: 'T-07'`.
- módulo: `assinatura` (`rait-web-frontend.md` §2).
- página: `SigningDecisionPage`; componentes inteligentes: `DecisionPanel`,
  `ReturnToReviewerDialog` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #25).
- slug i18n: `assinatura-caseId` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-signing-authority` (`route-manifest.md` #25).
- guardas: `raitAuthGuard` + `roleGuard(['rait-signing-authority'])` (M4).
- chave de política: `inf:rait-decision:sign` (§7, decisão); `inf:rait-decision:return-draft`
  (§7, devolução); `inf:rait-impediment:declare` (§7, impedimento).
- pré-condição: caso em `PRONTO_P_DECISAO` com minuta do revisor (fila F-DP-5, [WF-RAIT-004]
  §2.1); autoridade `EM_PLANTAO`/`DISPONIVEL` na escala do dia; `T-DEC` da infração ainda
  aberto ([UC-RAIT-016] Pré-condições).

## 3. Entrada

- de onde se chega: `/assinatura` (linha da fila); JW-05 passo 2.
- parâmetros de rota: `:caseId`.
- deep-link canônico: `/assinatura/:caseId`.

## 4. Dados

- resolver: "decisão com minuta lado a lado" (`route-manifest.md` #25).
- cliente gerado: `data/api/case.client.ts` (`case`), leitura de minuta, dossiê e parecer de
  admissibilidade ([UC-RAIT-016] Fluxo 2).
- campos exibidos: enquadramento, provas do órgão anexadas de ofício, diligências realizadas,
  dias restantes de `T-DEC` ([UC-RAIT-016] Fluxo 2; [RN-RAIT-114]).
- calculado do backend: `T-DEC` (decadência 180/360 dias, [RN-RAIT-114]) exibido, nunca
  recalculado no cliente ([RN-RAIT-005]).

## 5. Estados

- carregando: skeleton do painel lado a lado.
- vazio: não se aplica.
- erro recuperável: falha transitória ao ler o caso — retry.
- sem permissão: `RAIT.DECISION_JURISDICTION` (403) — autoridade fora da circunscrição do AIT
  (`rait-error-catalog.md` §3.6) → banner "sem permissão para esta ação".
- conflito: `RAIT.DECISION_ALREADY_SIGNED` (409) — segunda assinatura do mesmo ato → recarrega e
  reabre a tela com os dados atuais.
- indisponível: não se aplica (`L2`); falha do kernel de assinatura trata-se como erro de
  comando (§6), não como estado "indisponível nesta versão" (não há dependência §11 aqui).

## 6. Comandos

| Ação (`recurso:ação`)        | Papel                    | Pré-estado → pós-estado                                    | Comando (§7)                                        | Confirmação com efeito jurídico                                                                                | Erros esperados                                                                                                                                       |
| ---------------------------- | ------------------------ | ---------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rait.decision:sign`         | `rait-signing-authority` | `PRONTO_P_DECISAO` → `DECIDIDO_AUTORIDADE`                 | `POST /v1/inf/rait/decisions` + `…/commands/decide` | "Ao acolher, o AIT é cancelado e o registro arquivado; ao indeferir, a penalidade é aplicada e a NP expedida." | `RAIT.DECISION_JURISDICTION`, `RAIT.DECISION_NOT_ON_DUTY`, `RAIT.DECISION_GROUNDS_REQUIRED`, `RAIT.DRAFT_AUTHOR_CANNOT_SIGN`, `RAIT.SIGNATURE_FAILED` |
| `rait.decision:return-draft` | `rait-signing-authority` | `PRONTO_P_DECISAO` → `EM_INSTRUCAO`                        | `POST …/commands/return-draft`                      | "Ao devolver, a minuta volta ao revisor com orientação; só é permitido uma vez."                               | `RAIT.DRAFT_RETURN_LIMIT`                                                                                                                             |
| `rait.impediment:declare`    | `rait-signing-authority` | caso ativo → sem alteração de estado; roteado a substituto | `POST /v1/inf/rait/impediments`                     | "Ao declarar impedimento, o caso é roteado ao substituto de plantão."                                          | —                                                                                                                                                     |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido em
todos os três comandos.

## 7. Saída

- decisão assinada: `[DECIDIDO_AUTORIDADE]`; evento `RAIT_DECISAO_PUBLICADA`; infração
  `AIT_CANCELADO` (acolhida) | `PENALIDADE_A_APLICAR` (indeferida) (JW-05 fluxo de telas); volta
  ao próximo item da fila `/assinatura`.
- devolvida com orientação: volta a `EM_INSTRUCAO`, revisor notificado, `T-ASS` reinicia
  ([UC-RAIT-016] Fluxo alternativo 3a).
- impedimento declarado: devolve à fila da circunscrição, substituto da escala assume
  ([UC-RAIT-016] Fluxo alternativo 3b).
- SSE: `case.changed` remove o caso da fila de outros signatários assim que decidido.

## 8. Segurança e LGPD

- assinatura pessoal e territorial: só a autoridade escalada na circunscrição do AIT, ou seu
  substituto, assina ([UC-RAIT-016] AC-RAIT-016-1; [RN-RAIT-143]).
- o revisor nunca assina ([UC-RAIT-016] AC-RAIT-016-2) — quem instrui não é quem assina
  ([IU-RAIT-001] §3); áreas de minuta e decisão visualmente separadas, com autoria explícita.
- texto livre da petição nunca em painéis fora do contexto de instrução ([RN-RAIT-134]);
  terceiros suprimidos ([RN-RAIT-137]).
- nenhum segredo em URL/log; `signature_ref` do kernel PAdES+TSA nunca exposto em texto livre.

## 9. Acessibilidade e atalhos

- decisão operável por teclado (`rait-web-frontend.md` §10, item 5).
- prazo `T-DEC` sempre com base legal ao lado ([IU-RAIT-001] §1).
- foco visível; falha de assinatura (`RAIT.SIGNATURE_FAILED`) anunciada por `aria-live`, com
  opção de tentar novamente sem perder o texto de fundamentação.

## 10. Testes

- unitário: assinatura é pessoal e territorial ([UC-RAIT-016] AC-RAIT-016-1); o revisor nunca
  assina (AC-RAIT-016-2); devolução é única e rastreada (AC-RAIT-016-3); decisão fora do prazo
  decadencial é bloqueada e encaminhada à declaração de decadência (AC-RAIT-016-4).
- roteamento: `rait-signing-authority` ativa; demais papéis → `/sem-permissao`.
- jornada feliz: decisão assinada → comunicação disparada; jornada de erro: `T-DEC` vencido →
  bloqueio da NP.

## Componentes compartilhados

`DecisionPanel`, `SignatureDialog`, `DossierViewer`, `MinutaEditor`, `ImpedimentDialog`,
`DeadlineChip`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.assinatura-caseId.title` — "Decisão da defesa prévia"
- `rait.screens.assinatura-caseId.cmd.sign` — "Assinar decisão"
- `rait.screens.assinatura-caseId.cmd.return_draft` — "Devolver com orientação"
- `rait.screens.assinatura-caseId.cmd.declare_impediment` — "Declarar impedimento"
- `rait.screens.assinatura-caseId.field.grounds` — "Fundamentação"
- `rait.screens.assinatura-caseId.state.already_signed` — "Esta decisão já foi assinada"
