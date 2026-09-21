---
id: IU-RAIT-064
title: Atos de suspensão por força maior — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-LEI-9784-1999]
updated: 2026-09-21
---

Ficha da rota `admin/atos/suspensao` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-022].

## 1. Identidade

- id `IU-RAIT-064`; `path`: `admin/atos/suspensao` (route-manifest.md #71); `screen`: `—`.
- módulo `admin`; página `SuspensionActsPage`, componente inteligente `SuspensionActForm` (§5.3).
- nível `L0`; slug i18n `admin-atos-suspensao`.

## 2. Acesso

- papel da rota (manifesto): `agency-admin` (route-manifest.md linha 71, herdado de
  `rait-web-frontend.md` §4).
- guardas: `raitAuthGuard`; `roleGuard(['agency-admin'])`.
- **divergência documentada**: a chave de política `inf:rait-suspension-act:create` já consta na
  matriz de política (`policy.ts`) concedida a `rait-signing-authority` e `rait-chair` (grant pré-existente à
  matriz de WP-A/CTG-0002 — **OD-309**, `open-decisions-rait.md` §D), não a `agency-admin`. Isso
  bate com o ator do fluxo de [UC-RAIT-022] ("Autoridade de trânsito ou presidente do colegiado
  registra") e com `JW-12-auditor-admin.md` #6, que descreve o ato "assinado pela
  autoridade/presidente" dentro da seção "Administrador do órgão". Esta ficha transcreve as duas
  fontes sem resolver a divergência — a intencionalidade de restringir a execução do comando a
  `rait-signing-authority`/`rait-chair`, mesmo com a rota visível a `agency-admin`, é a pendência
  registrada em **OD-309**.

## 3. Entrada

- chega-se pelo redirect de `/admin` ou pela navegação.

## 4. Dados

- resolver da rota: "atos de força maior — §11 linha 7 (admin pendente); comando
  `rait-suspension-act:create` 'pendente' em §7" (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 7 — mesma do [IU-RAIT-062]/[IU-RAIT-063] —
  pendente.
- desenho pretendido ([UC-RAIT-022] fluxo 1-4): casos alcançados, prazo suspenso, termo inicial e
  final, fundamento, prova de força maior; o sistema reprograma vencimentos afetados, mantém
  valores originais no histórico; entra na trilha de auditoria e gera revisão obrigatória ao
  gestor e ao LEGAL.

## 5. Estados

- **indisponível nesta versão** citando §11 linha 7.
- **suspensão sobre prazo legal**: tentativa de suspender decadência/prescrição por motivo
  operacional (greve, recesso, indisponibilidade) → `RAIT.SUSPENSION_LEGAL_TIMER` (422)
  ([UC-RAIT-022] 1a; [RN-RAIT-105]).
- **sem prova**: `RAIT.SUSPENSION_EVIDENCE_REQUIRED` (422).

## 6. Comandos

| Ação (`recurso:ação`)        | Papel                                                  | Pré-estado → pós-estado                                        | Comando                                            | Confirmação                                                                             | Erros esperados                                                    |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `rait.suspension-act:create` | `rait-signing-authority`/`rait-chair` (OD-309; ver §2) | prazos correntes → prazos suspensos, vencimentos reprogramados | `POST /v1/inf/rait/suspension-acts` (pendente, §7) | "nunca automática; a suspensão é ato motivado e auditado" ([UC-RAIT-022] AC-RAIT-022-1) | `RAIT.SUSPENSION_LEGAL_TIMER`, `RAIT.SUSPENSION_EVIDENCE_REQUIRED` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 7; `If-Match`
  sempre.

## 7. Saída

- ato revogado em revisão restaura os vencimentos originais, com registro ([UC-RAIT-022] 2a).
- histórico do caso mostra o ato, o fundamento e os vencimentos antes e depois
  ([UC-RAIT-022] AC-RAIT-022-2).

## 8. Segurança e LGPD

- prova de força maior anexada é documento institucional, sem dado sensível de terceiro.

## 9. Acessibilidade e atalhos

- `SuspensionActForm` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-022-1 — suspensão nunca é automática, mesmo com sistema indisponível por dias.
- AC-RAIT-022-2 — ato rastreável caso a caso (fundamento e vencimentos antes/depois).
- roteamento: `agency-admin` ativa a rota (por papel de rota do manifesto); execução do comando
  restrita a `rait-signing-authority`/`rait-chair` por política (OD-309) — testar as duas guardas
  separadamente.

## Componentes compartilhados

`DeadlineChip`, `LegalBasisTooltip` (§5.2); `SuspensionActForm` (§5.3, admin).

## Chaves i18n

- `rait.screens.admin-atos-suspensao.title` — "Atos de suspensão por força maior"
- `rait.screens.admin-atos-suspensao.cmd.create` — "Registrar ato de suspensão"
- `rait.screens.admin-atos-suspensao.field.evidence` — "Prova de força maior"
