---
id: IU-RAIT-061
title: Exportações com controle LGPD — especificação de tela
status: draft
apps: [rait]
sources: [REF-LEI-13709-2018, REF-CONTRAN-357]
updated: 2026-09-21
---

Ficha da rota `auditoria/exportacoes` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-042].

## 1. Identidade

- id `IU-RAIT-061`; `path`: `auditoria/exportacoes` (route-manifest.md #67); `screen`: `—`.
- módulo `auditoria`; página `ExportsPage`, componente inteligente `ExportRequestForm` (§5.3).
- nível `L0`; slug i18n `auditoria-exportacoes`.

## 2. Acesso

- papel: AUDITOR (route-manifest.md linha 67).
- guardas: `raitAuthGuard`; `roleGuard(['AUDITOR'])`.
- chave de política: `inf:rait-export:create` (`rait-web-frontend.md` §7; grant pré-existente
  confirmado na matriz de política (`policy.ts`) antes da matriz de WP-A/CTG-0002 — **OD-309**,
  `open-decisions-rait.md` §D).

## 3. Entrada

- chega-se pela navegação do módulo `auditoria` ou de `/auditoria/trilha`
  ([IU-RAIT-060]) após localizar o recorte.

## 4. Dados

- resolver da rota: "exportações registradas — §11 linha 8 (exportações assinadas pendentes)"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 8 — "Jeton (folha) e exportações assinadas" —
  módulo FE `organizacao`/`auditoria` — situação **pendente**.
- desenho pretendido ([UC-RAIT-042] fluxo 3): recorte, finalidade obrigatória; dados pessoais do
  requerente/procurador só com base legal; terceiros suprimidos; exportação assinada e
  registrada.

## 5. Estados

- **indisponível nesta versão** citando §11 linha 8.
- **finalidade ausente**: `RAIT.EXPORT_PURPOSE_REQUIRED` (422).
- **nominal em massa sem aprovação**: `RAIT.EXPORT_DPO_APPROVAL_REQUIRED` (422), limiar de 100
  linhas nominais (OD-017 vigente, `open-decisions-rait.md` §A/§E; steering item 54/H.54).

## 6. Comandos

| Ação (`recurso:ação`) | Papel   | Pré-estado → pós-estado                           | Comando                                    | Confirmação                                                                                                | Erros esperados                                                     |
| --------------------- | ------- | ------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `rait.export:create`  | AUDITOR | finalidade informada → arquivo assinado, registro | `POST /v1/inf/rait/exports` (pendente, §7) | "cada exportação fica registrada com finalidade, escopo, solicitante e hash" ([UC-RAIT-042] AC-RAIT-042-2) | `RAIT.EXPORT_PURPOSE_REQUIRED`, `RAIT.EXPORT_DPO_APPROVAL_REQUIRED` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 8; `If-Match` não
  se aplica a uma criação nova, mas `Idempotency-Key` é exigida (`rait-error-catalog.md` §3.2).

## 7. Saída

- exportação nominal em massa aguarda aprovação do DPO antes do arquivo assinado
  (`JW-12-auditor-admin.md`, sequência).
- registro de exportação fica na trilha de auditoria.

## 8. Segurança e LGPD

- dado pessoal do requerente/procurador só com base legal registrada; terceiros suprimidos
  ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- `ExportRequestForm` navegável por teclado, finalidade obrigatória com foco no campo.

## 10. Testes

- AC-RAIT-042-2 — cada exportação tem finalidade e assinatura registradas.
- roteamento: AUDITOR ativa; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`ExportRequestForm` (§5.3, auditoria); `LegalBasisTooltip` (§5.2, quando finalidade cita base legal).

## Chaves i18n

- `rait.screens.auditoria-exportacoes.title` — "Exportações com controle LGPD"
- `rait.screens.auditoria-exportacoes.cmd.create` — "Exportar recorte"
- `rait.screens.auditoria-exportacoes.field.purpose` — "Finalidade da exportação"
