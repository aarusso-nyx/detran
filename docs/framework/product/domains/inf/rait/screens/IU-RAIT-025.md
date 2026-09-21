---
id: IU-RAIT-025
title: Assinatura — fila da circunscrição — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/assinatura` (`rait-web-frontend.md` §4; sem tela própria em [IU-RAIT-001] —
antecede T-07).
Fontes: [UC-RAIT-016], [RN-RAIT-141], [RN-RAIT-143].

## 1. Identidade

- id: `IU-RAIT-025`; rota: `/assinatura` (`route-manifest.md` #24); `screen: '—'`.
- módulo: `assinatura` — "fila da autoridade signatária e decisão da defesa (T-07 lado
  autoridade)" (`rait-web-frontend.md` §2).
- página: `SigningQueuePage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #24).
- slug i18n: `assinatura` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-signing-authority` (`route-manifest.md` #24).
- guardas: `raitAuthGuard` + `roleGuard(['rait-signing-authority'])` (M4).
- chave de política: leitura da fila não exige chave própria; a decisão em si usa
  `inf:rait-decision:sign` (§7), avaliada em `/assinatura/:caseId`.
- pré-condição: autoridade `EM_PLANTAO` ou `DISPONIVEL` na escala de assinatura da circunscrição
  ([UC-RAIT-016] Pré-condições; [WF-RAIT-004] §3).

## 3. Entrada

- de onde se chega: `RoleHomeRedirect` de `/` para `rait-signing-authority`
  (`route-manifest.md` tabela B); JW-05 passo 1.
- parâmetros de rota: nenhum; lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/assinatura` sem parâmetros.

## 4. Dados

- resolver: "fila F-DP-5 da circunscrição, ordenada" (`route-manifest.md` #24; [WF-RAIT-004]
  §2.1).
- cliente gerado: `data/api/case.client.ts`, `GET cases?state=PRONTO_P_DECISAO&unit=…` (JW-05
  passo 1).
- campos exibidos: minuta pronta por caso, circunscrição, dias restantes de `T-DEC` por caso
  ([UC-RAIT-016] Fluxo 1), `T-ASS` (meta operacional, [WF-RAIT-004] §9).
- calculado do backend: ordem única de consumo — risco de prescrição, prioridade legal,
  cronologia ([RN-RAIT-141]) — a tela nunca reordena localmente.

## 5. Estados

- carregando: skeleton da tabela.
- vazio: "nenhuma minuta aguardando assinatura na sua circunscrição".
- erro recuperável: falha transitória — retry.
- sem permissão: `RAIT.FORBIDDEN_CASE_SCOPE` (403) — caso fora da circunscrição/escala do
  usuário (`rait-error-catalog.md` §3.1) → banner "sem permissão para esta ação".
- conflito: não se aplica (tela de leitura).
- indisponível: não se aplica (`L2`).

## 6. Comandos

Tela de leitura; a decisão fica em `/assinatura/:caseId` (IU-RAIT-026). Nenhum comando de
mudança de estado é disparado aqui.

## 7. Saída

- linha da fila abre `/assinatura/:caseId`.
- SSE: `case.changed` (`rait-web-frontend.md` §8) atualiza a fila quando novas minutas chegam ou
  uma decisão é assinada por outra sessão.

## 8. Segurança e LGPD

- fila exibida só da circunscrição/escala do usuário — dado de terceiro (outra circunscrição)
  nunca listado ([RN-RAIT-143]).
- texto livre da petição nunca em listas ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir a minuta (`rait-web-frontend.md` §10).
- ordem única exibida por rótulo textual, não só por posição (`RiskFlag`, [IU-RAIT-001] §4).
- foco visível na linha ativa.

## 10. Testes

- roteamento: `rait-signing-authority` ativa; demais papéis → `/sem-permissao` (M14).
- estados: `RAIT.FORBIDDEN_CASE_SCOPE` para caso de outra circunscrição; vazio.
- SSE: atualização da fila sem recarregar a página.

## Componentes compartilhados

`QueueTable`, `RiskFlag`, `DeadlineChip`.

## Chaves i18n

- `rait.screens.assinatura.title` — "Assinatura"
- `rait.screens.assinatura.intro` — "Minutas prontas para decisão, na sua circunscrição"
- `rait.screens.assinatura.empty` — "Nenhuma minuta aguardando assinatura na sua circunscrição"
