---
id: IU-PORTAL-T17
title: Meu veículo — CRLV-e — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-809-2020]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-17. Fontes: [UC-PORTAL-012], [RN-PORTAL-116], [RN-PORTAL-117].

## 1. Identidade

`T-17`, "Meu veículo — CRLV-e", app `portal`, rota `veiculos/:vehicleId/crlv-e`
(`route-manifest.md` #26), módulo `documentos`, `screen: 'T-17'`, `sheet: 'IU-PORTAL-T17'`.

## 2. Acesso

Ator CIDADAO nível simples para consulta ([UC-PORTAL-012] pré-condições); guarda
`portalAuthGuard` + `entitlementGuard('vehicle', vehicleId)`; `serviceAvailabilityGuard
('emissao_crlv')`. Sem vínculo → "por que não vejo isto".

## 3. Entrada

Chega-se de `/veiculos` (lista, sem tela própria) — "Meu veículo" → "CRLV-e" ([UC-PORTAL-012]
passo 1). Parâmetro `vehicleId` validado contra o vínculo RENAVAM do proprietário.

## 4. Dados

`GET vehicles/{id}/clearance` (`portal-route-contract.md` §7): `{ items[]{ kind: tributo |
encargo | multa | dpvat, amount, status, blocking, reason }, restrictions[]{ kind, blocking },
suspendedEnforceability[] (não bloqueia, DT-027), canIssue }`. `POST vehicles/{id}/crlv-e`: `{
documentBytes, qrVerification, issuedAt }` ou `PORTAL.CRLV_BLOCKED_BY_DEBT/_RESTRICTION`.
Nenhuma fixture como fallback.

## 5. Estados

- **carregando**: esqueleto do estado de quitação.
- **vazio**: não se aplica — a rota exige um veículo vinculado.
- **sem elegibilidade**: `PORTAL.ENTITLEMENT_REQUIRED` — veículo sem vínculo comprovável.
- **erro recuperável**: pendência de quitação — a tela mostra **exatamente** o que falta pagar,
  com atalho direto para T-13, nunca "CRLV-e indisponível" genérico ([UC-PORTAL-012] AC-1,
  [RN-PORTAL-116]).
- **sem permissão**: tratado pelo `entitlementGuard` (redireciona).
- **indisponível**: `PORTAL.NATIONAL_READ_UNAVAILABLE` — dado em cache com data da consulta.
- **sucesso**: CRLV-e emitido, validável por QR Code, sem exigir via impressa ([UC-PORTAL-012]
  AC-3/AC-4).

## 6. Comandos

"Emitir CRLV-e" (`POST vehicles/{id}/crlv-e`): pré-condição — sem débito exigível e sem restrição
administrativa/judicial ([RN-PORTAL-116] itens 2/3). **Multa sob recurso com efeito suspensivo
não é tratada como débito exigível — decisão jurídica LEGAL, citada aqui como premissa adotada
(OD-P04/DT-027, `plan.md`); a tela não bloqueia por essa multa, e a exibe distintamente
("suspendedEnforceability", não "há débito")** ([UC-PORTAL-012] AC-2, [RN-PORTAL-116]
Controvérsia). Se o pagamento é feito no próprio fluxo (T-13), o sistema reconsulta a quitação
automaticamente na mesma sessão ([UC-PORTAL-012] alt. 3a).

## 7. Saída

Documento emitido fica disponível para download/exibição; volta para "Meus veículos". Nada a
salvar além do documento emitido.

## 8. Segurança

Vínculo por `portal.entitlement` (`kind: vehicle`). QR Code oficial obrigatório — nenhum PDF sem
ele é rotulado CRLV-e ([RN-PORTAL-117] item 3). Nada de token/segredo em tela/URL/log.

## 9. Acessibilidade

Distinção clara entre "há débito a pagar" e "há restrição que impede a emissão" — duas mensagens
diferentes, não uma genérica ([UC-PORTAL-012] passo 2/4); a impressão em papel A4 é sempre opção
do cidadão, nunca apresentada como requisito ([UC-PORTAL-012] AC-3).

## 10. Testes

Unitário: pendência de débito mostra o valor e o atalho de pagamento, nunca erro genérico (AC-1).
Roteamento: `entitlementGuard` bloqueia veículo sem vínculo. Jornada feliz: quitação total emite
o CRLV-e com QR Code (AC-3/AC-4). Jornada de recurso: multa sob recurso suspensivo não bloqueia a
emissão (AC-2).

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)           | Ação seguinte                                        |
| ----------------- | ------------------------------------ | ---------------------------------------------------- |
| carregando        | `portal.states.loading`              | —                                                    |
| vazio             | n/a — rota exige veículo vinculado   | —                                                    |
| sem elegibilidade | `portal.states.ineligible`           | ir a "por que não vejo isto"                         |
| erro recuperável  | `portal.screens.t17.state.pendencia` | ir ao pagamento (T-13)                               |
| sem permissão     | tratado pelo guarda (redireciona)    | `/vinculo/por-que-nao-vejo`                          |
| indisponível      | `portal.states.unavailable`          | dado em cache com data da consulta ([RN-PORTAL-117]) |

## Chaves i18n

- `portal.screens.t17.title` — "Meu veículo — CRLV-e"
- `portal.screens.t17.state.pendencia` — "Falta quitar {{amount}} antes de emitir o CRLV-e."
  ([UC-PORTAL-012] AC-1)
- `portal.screens.t17.state.suspenso` — "Esta multa está sob recurso e não bloqueia a emissão."
  (OD-P04/DT-027)
- `portal.screens.t17.cmd.emitir` — "Emitir CRLV-e"
- `portal.screens.t17.field.qr` — "Verificável por QR Code" ([RN-PORTAL-117])
