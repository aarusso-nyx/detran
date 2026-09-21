---
id: IU-RAIT-060
title: Trilha de auditoria — especificação de tela
status: draft
apps: [rait]
sources: [REF-LEI-13709-2018, REF-CONTRAN-357]
updated: 2026-09-21
---

Ficha da rota `auditoria/trilha` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-042].

## 1. Identidade

- id `IU-RAIT-060`; `path`: `auditoria/trilha` (route-manifest.md #66); `screen`: `—`.
- módulo `auditoria`; página `AuditTrailPage`, componente inteligente `EventTimeline` (§5.3).
- nível `L2`; slug i18n `auditoria-trilha`.

## 2. Acesso

- papel: AUDITOR (route-manifest.md linha 66).
- guardas: `raitAuthGuard`; `roleGuard(['AUDITOR'])`.
- pré-condição: perfil AUDITOR sem permissão de edição; finalidade da consulta informada
  ([UC-RAIT-042] Pré-condições).

## 3. Entrada

- chega-se pelo redirect de `/auditoria` (route-manifest.md §B) ou pela navegação.
- aceita `?q=&ordem=&filtro=` por caso, unidade, membro ou período.

## 4. Dados

- resolver: "trilha por caso/período" (route-manifest.md).
- leitura via `AuditFacade` sobre `GET events`, `GET audit`: distribuição, escalas, sorteios,
  atas, votos, comunicações, pagamentos, integrações, com atores, atos e hashes
  ([UC-RAIT-042] fluxo 1).

## 5. Estados

- **carregando / vazio / erro recuperável**: padrão.
- **recorte amplo demais**: `RAIT.AUDIT_RANGE_TOO_WIDE` (422) → diálogo com o limite de dias.
- **caso anonimizado**: trilha estatística disponível; dados pessoais indisponíveis por política,
  com registro ([UC-RAIT-042] 1a).

## 6. Comandos

Tela de leitura. O auditor não edita nada nesta tela ([UC-RAIT-042] AC-RAIT-042-1); qualquer
tentativa de alteração é recusada pelo backend.

## 7. Saída

- achados de irregularidade geram tarefa ao gestor ou comunicação à corregedoria, sem alterar
  nenhuma decisão ([UC-RAIT-042] fluxo 4).
- exportação do recorte segue para `/auditoria/exportacoes` ([IU-RAIT-061]).

## 8. Segurança e LGPD

- dados pessoais do requerente/procurador só com base legal registrada; terceiros suprimidos
  ([RN-RAIT-133]…[RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- `EventTimeline` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-042-1 — auditor não edita; só leitura e exportação.
- roteamento: AUDITOR ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`EventTimeline` (§5.2/§5.3, transversal e auditoria).

## Chaves i18n

- `rait.screens.auditoria-trilha.title` — "Trilha de auditoria"
- `rait.screens.auditoria-trilha.empty` — "Nenhum evento no recorte informado"
