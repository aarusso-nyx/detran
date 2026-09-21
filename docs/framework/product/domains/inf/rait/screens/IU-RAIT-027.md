---
id: IU-RAIT-027
title: Autoridade — provimentos a avaliar — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-extracts-raw, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `/autoridade/provimentos` (`rait-web-frontend.md` §4; tela T-16 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-008], [RN-RAIT-130], [RN-RAIT-132].

## 1. Identidade

- id: `IU-RAIT-027`; rota: `/autoridade/provimentos` (`route-manifest.md` #26);
  `screen: 'T-16'`.
- módulo: `autoridade` — "provimentos a avaliar — recurso vinculado (T-16)"
  (`rait-web-frontend.md` §2).
- página: `ProvidedAppealsPage`; componente inteligente: `AuthorityAppealDecision`
  (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #26).
- slug i18n: `autoridade-provimentos` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-central-authority` (`route-manifest.md` #26).
- guardas: `raitAuthGuard` + `roleGuard(['rait-central-authority'])` (M4).
- chave de política: `inf:rait-appeal:authority-decide` (§7, recorrer);
  `inf:rait-appeal:waive` (§7, não recorrer).
- pré-condição: caso `instancia=jari` `JULGADO_SESSAO` com resultado `provido`, comunicado ao
  requerente ([UC-RAIT-008] Pré-condições).

## 3. Entrada

- de onde se chega: `RoleHomeRedirect` de `/` para `rait-central-authority`
  (`route-manifest.md` tabela B); JW-06 passo 1.
- parâmetros de rota: nenhum; lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/autoridade/provimentos` sem parâmetros.

## 4. Dados

- resolver: "provimentos da JARI a avaliar, dias restantes de T-R2" (`route-manifest.md` #26).
- cliente gerado: `data/api/case.client.ts`,
  `GET cases?instance=jari&outcome=provido&state=COMUNICADO` (JW-06 passo 1).
- campos exibidos: parecer, voto e ata (drawer do caso — JW-06 passo 2), dias restantes da
  janela de 30 dias (CTB art. 288, `rait.timer.T-R2-AUTH` — steering §H item 47).
- calculado do backend: janela `T-R2-AUTH` (30 dias contados da publicação da decisão da JARI —
  OD-001, `open-decisions-rait.md` §A, cédula 05.1) — exibida, nunca recalculada no cliente.

## 5. Estados

- carregando: skeleton da lista.
- vazio: "nenhum provimento aguardando decisão da autoridade".
- erro recuperável: falha transitória — retry.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.AUTHORITY_APPEAL_WINDOW_CLOSED` (409) — recurso vinculado após `T-R2`;
  `RAIT.AUTHORITY_APPEAL_ALREADY_DECIDED` (409) — segunda decisão no mesmo provimento
  (`rait-error-catalog.md` §3.8) → recarrega.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`)          | Papel                    | Pré-estado → pós-estado                                                              | Comando (§7)                       | Confirmação com efeito jurídico                                                                              | Erros esperados                                                                                                      |
| ------------------------------ | ------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `rait.appeal:authority-decide` | `rait-central-authority` | `COMUNICADO` (JARI, provido) → `REMETIDO_2A_INSTANCIA` (novo caso cetran `ADMITIDO`) | `POST …/commands/authority-appeal` | "Ao recorrer, um novo caso nasce no CETRAN e o requerente é informado de que a decisão ainda não transitou." | `RAIT.AUTHORITY_APPEAL_WINDOW_CLOSED`, `RAIT.AUTHORITY_APPEAL_NOT_PROVIDED`, `RAIT.AUTHORITY_APPEAL_ALREADY_DECIDED` |
| `rait.appeal:waive`            | `rait-central-authority` | `COMUNICADO` → `TRANSITADO`                                                          | `POST …/commands/waive`            | "Ao não recorrer, o provimento torna-se definitivo; a multa é cancelada em caráter final."                   | `RAIT.AUTHORITY_APPEAL_ALREADY_DECIDED`                                                                              |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.
Silêncio até `T-R2` produz o mesmo efeito de "não recorrer", automaticamente, por timer
([UC-RAIT-008] Fluxo alternativo 1a) — não é ação de tela.

## 7. Saída

- recorreu: novo caso `instancia=cetran` nasce `ADMITIDO`/`DISTRIBUIDO`, herdando
  `caso_origem_id`, sem passar por `TRIAGEM_ADMISSIBILIDADE` ([UC-RAIT-008] AC-RAIT-008-2);
  requerente comunicado ([RN-RAIT-130]).
- não recorreu (ou silêncio no prazo): caso JARI `TRANSITADO`, provimento definitivo, multa
  cancelada ([UC-RAIT-008] AC-RAIT-008-3).
- SSE: `case.changed` remove o item da lista ao decidir.

## 8. Segurança e LGPD

- decisão exige fundamentação e fica vinculada à identidade da autoridade, com trilha de
  auditoria, inclusive em caso de não recurso ([UC-RAIT-008] AC-RAIT-008-5).
- dados do requerente exibidos conforme papel; terceiros suprimidos ([RN-RAIT-137]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir o drawer do caso (`rait-web-frontend.md` §10).
- janela de 30 dias sempre com base legal ao lado (CTB art. 288, [IU-RAIT-001] §1).
- foco visível; risco de janela expirando comunicado por rótulo textual, não só cor
  ([IU-RAIT-001] §4).

## 10. Testes

- unitário: janela de 30 dias apresentada como fila própria ([UC-RAIT-008] AC-RAIT-008-1);
  recorrer abre caso interno sem triagem de admissibilidade cidadã (AC-RAIT-008-2); silêncio é
  renúncia (AC-RAIT-008-3); requerente é comunicado do recurso da autoridade (AC-RAIT-008-4);
  decisão fundamentada e auditável (AC-RAIT-008-5).
- roteamento: `rait-central-authority` ativa; demais papéis → `/sem-permissao`.
- estados: conflito `RAIT.AUTHORITY_APPEAL_WINDOW_CLOSED`; vazio.

## Componentes compartilhados

`QueueTable`, `DeadlineChip`, `LegalBasisTooltip`, `RiskFlag`.

## Chaves i18n

- `rait.screens.autoridade-provimentos.title` — "Provimentos a avaliar"
- `rait.screens.autoridade-provimentos.intro` — "Decisões de provimento da JARI, dentro da janela para recorrer ao CETRAN"
- `rait.screens.autoridade-provimentos.empty` — "Nenhum provimento aguardando decisão"
- `rait.screens.autoridade-provimentos.cmd.appeal` — "Recorrer ao CETRAN"
- `rait.screens.autoridade-provimentos.cmd.waive` — "Não recorrer"
- `rait.screens.autoridade-provimentos.field.grounds` — "Fundamento do recurso"
