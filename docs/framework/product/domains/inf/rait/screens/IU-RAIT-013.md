---
id: IU-RAIT-013
title: Prazos do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/prazos` (`rait-web-frontend.md` §4; sem tela própria em [IU-RAIT-001],
aba do layout T-04). Fontes: [WF-RAIT-001] §Prazos e timers, [RN-RAIT-005].

## 1. Identidade

- id: `IU-RAIT-013`; `path`: `casos/:id/prazos` (`route-manifest.md` #13).
- `screen`: `—`.
- módulo: `caso`; componente inteligente: `ClocksPanel` (`rait-web-frontend.md` §5.2).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-prazos`.

## 2. Acesso

- papéis: `todos` (`route-manifest.md` #13).
- guardas: as de `/casos/:id` (`raitAuthGuard`, `roleGuard`, `caseAccessGuard` pendente).
- sem chave de política própria: tela de leitura.

## 3. Entrada

- de onde se chega: navegação de aba a partir de `/casos/:id` (qualquer aba inicial); referenciada
  por `/gestao/radar/:caseId` (fora do lote A) para detalhar o relógio em risco.
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/prazos`.

## 4. Dados

- resolver: "timers, base legal, marcos por canal" (`route-manifest.md` #13).
- clientes: `data/api/case.client.ts` (`RaitDeadline`, `RaitClock`).
- calculado do backend: os relógios de extinção ([WF-RAIT-001] §Relógios de extinção — decadência
  180/360 dias, prescrição por inércia 24 meses, prescrição por paralisação 3 anos) e os timers
  operacionais (`T-REM10`, `T-DIL`, `T-R2`, `T-JUL-24M`, `T-PAR-3A`, `T-DEC`) — todos com base
  legal exibida ao lado, nunca só o prazo (`rait-web-frontend.md` §1; [IU-RAIT-001] §Requisitos
  transversais item 1).
- contagem de prazos segue [RN-RAIT-005] (dias consecutivos, prorrogação a dia útil) — cálculo só
  no backend, nunca no cliente (`rait-web-frontend.md` §1).

## 5. Estados

- **carregando**: skeleton do `ClocksPanel`.
- **vazio**: não se aplica — todo caso tem ao menos um marco de tempestividade.
- **erro recuperável**: falha ao carregar os relógios; retry.
- **sem permissão**: herdada do layout — `RAIT.FORBIDDEN_CASE_SCOPE` (403).
- **conflito**: não se aplica (tela só de leitura).

## 6. Comandos

Nenhum comando de mutação — prazos legais são somente leitura no frontend ([RN-RAIT-005];
`RAIT.DEADLINE_LEGAL_READONLY`, catálogo §3.9, seria o erro esperado se qualquer edição fosse
tentada por rota fora desta tela).

## 7. Saída

- não navega a outra rota por ação própria; SSE (`clock.flag-changed`) atualiza a bandeira de
  risco sem reload.

## 8. Segurança e LGPD

- painel de relógios não expõe dado de terceiro nem texto livre da petição ([RN-RAIT-134],
  [RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- meta operacional (ex.: 30 dias ao cidadão) e teto legal (ex.: 24 meses) visualmente distintos,
  nunca no mesmo componente com a mesma ênfase ([IU-RAIT-001] §Requisitos transversais item 2).
- risco nunca só por cor — rótulo textual de dias restantes acompanha cada relógio ([IU-RAIT-001]
  §4).

## 10. Testes

- roteamento: `todos` ativam a leitura (M14).
- critério transversal: todo prazo exibido carrega a base legal ao lado, nunca aparece sozinho
  ([IU-RAIT-001] §Requisitos transversais item 1) — verificável em `DeadlineChip`.
- meta operacional e teto legal nunca no mesmo componente com a mesma ênfase (item 2).

## Componentes compartilhados

`ClocksPanel`, `DeadlineChip`, `LegalBasisTooltip` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-prazos.title` — "Prazos do caso"
- `rait.screens.casos-id-prazos.intro` — "Relógios de extinção e timers operacionais, com base legal."
