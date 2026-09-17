---
id: IU-PORTAL-T13
title: Comparação de pagamento — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-DECRETO-10543-2020]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-13. Fontes: [UC-PORTAL-015], [RN-PORTAL-125], [RN-PORTAL-126],
[RN-PORTAL-127], [RN-PORTAL-128], [RN-PORTAL-114].

## 1. Identidade

`T-13`, "Pagar sua multa", app `portal`, rota `autos/:aitId/pagamento` (`route-manifest.md` #12),
módulo `pagamento`, `screen: 'T-13'`, `sheet: 'IU-PORTAL-T13'`.

## 2. Acesso

Ator CIDADAO nível simples para solicitar a guia — a segurança da transação em si é do meio de
pagamento (PIX/débito/cartão/boleto), fora do Decreto 10.543/2020 ([UC-PORTAL-015]
pré-condições); guarda `portalAuthGuard` + `entitlementGuard('ait', aitId')`;
`serviceAvailabilityGuard('pagamento')`. Sem vínculo → "por que não vejo isto".

## 3. Entrada

Chega-se de `/autos/:aitId` (T-01) ou `/autos` (T-14) pelo caminho "Pagar" (sempre visível ao
lado de defender/indicar, `portal-frontends.md` §5.2 `ActionTriplet`). Parâmetro `aitId`
validado. Rascunho de pedido (`serviceKey: pagamento`) persistido no servidor
(`portal-frontends.md` §1 "Estado").

## 4. Dados

`GET aits/{aitId}` (`portal-route-contract.md` §4): campo `payment{ tiers[]{ code, percent,
amount, availableUntil, requiresSne, waivesAppeal }, paid, paidTier }`. `POST requests` +
`PUT .../draft` + `POST .../submit` (`serviceKey: pagamento`, §5.1): corpo `{ tier: desconto_80 |
desconto_60_reconhecimento | desconto_40_fora_sne | integral_juros, method: pix | debito | boleto
| cartao, installments?, waiverAck? }`. Nível simples; delegação `inf:collection:issue` →
`{ documentId, barcode | pixCopyPaste, amount, validUntil }`.

## 5. Estados

- **carregando**: esqueleto das faixas.
- **vazio**: não se aplica — a rota exige um AIT existente.
- **sem elegibilidade**: `PORTAL.INELIGIBLE` — AIT sem vínculo com o cidadão.
- **erro recuperável**: `PORTAL.PAYMENT_TIER_NOT_AVAILABLE` (faixa fora da fase, ex. 80% após
  vencimento), `PORTAL.PAYMENT_ALREADY_PAID`.
- **sem permissão**: tratado pelo `entitlementGuard` (redireciona).
- **indisponível**: `PORTAL.PAYMENT_PROVIDER_UNAVAILABLE` — banner "estamos sem acesso ao módulo
  de arrecadação; seu prazo não muda" ([RN-PORTAL-125], `portal-error-catalog.md` §8).

## 6. Comandos

As faixas de 80% e 60% (com adesão ao SNE) aparecem **sempre lado a lado**, nunca uma escondida
atrás de clique ([UC-PORTAL-015] AC-1, [RN-PORTAL-128] dever 1). Rótulo da faixa de 60%/40%
descreve a consequência, não só o desconto ([RN-PORTAL-128] dever 2). **A faixa de 40% (pagar 60%
com renúncia) fica desligada nesta rodada pela flag `portal.waiver_40_term`, até OD-003 (H.53) —
a tela mostra essa faixa como indisponível com o motivo, sem simular resultado**; o termo de
renúncia digital assinado no PORTAL já existe versionado (`portal.legal.renuncia_40.v1`), pronto
para quando a flag ligar (OD-P03, transcrito de `plan.md` §Bloqueios/premissas aceitas). Faixa
disponível: nível `simples`, sem pré-condição de estado além de AIT com NP emitida
([UC-PORTAL-015] pré-condições); efeito `submit` → `inf:collection:issue`; auditoria
INF_COLLECTION_ISSUE. Um clique não encerra o direito de recorrer, salvo a faixa de 40%, com
confirmação em duas etapas quando ligada ([RN-PORTAL-128] dever 3).

## 7. Saída

Após emissão da guia, volta a `/autos/:aitId` (T-01) com o documento disponível para download; se
o pagamento libera outro serviço (ex. CRLV-e), reconsulta automática ([UC-PORTAL-015] passo 4).
Composição não enviada pede confirmação antes de abandonar.

## 8. Segurança

Vínculo por `portal.entitlement` (`kind: ait`). O PORTAL não retém valores nem é arrecadador
([RN-PORTAL-125]). Nada de token/segredo em tela/URL/log; documento de arrecadação é o
padronizado da União, obtido do sistema competente, não gerado localmente.

## 9. Acessibilidade

Valor e desconto lado a lado, nunca um escondido ([UC-PORTAL-015] AC-1); guia e boleto em formato
acessível mediante solicitação ([RN-PORTAL-114], [IU-PORTAL-001] §D.3 — T-13 e T-23 precisam do
caminho de solicitação, não só de contraste correto); alvo de toque ≥ 44×44px na confirmação de
pagamento.

## 10. Testes

Unitário: as duas faixas aparecem simultaneamente quando ambas cabem (AC-1); parcelamento não
afirma teto normativo de parcelas (AC-3, [RN-PORTAL-126]). Roteamento: `serviceAvailabilityGuard`
bloqueia quando `pagamento` está `unavailable`. Jornada feliz: pagar 80% não prejudica recurso em
curso (AC-5). Jornada de renúncia: faixa de 40% exibida como indisponível com o motivo da flag,
nunca simula um resultado.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                    | Ação seguinte                                       |
| ----------------- | --------------------------------------------- | --------------------------------------------------- |
| carregando        | `portal.states.loading`                       | —                                                   |
| vazio             | n/a — rota exige AIT existente                | —                                                   |
| sem elegibilidade | `portal.states.ineligible`                    | ir a "por que não vejo isto"                        |
| erro recuperável  | `portal.screens.t13.state.faixa_indisponivel` | escolher outra faixa disponível                     |
| sem permissão     | tratado pelo guarda (redireciona)             | `/vinculo/por-que-nao-vejo`                         |
| indisponível      | `portal.states.unavailable`                   | tentar mais tarde; prazo não muda ([RN-PORTAL-125]) |

## Chaves i18n

- `portal.screens.t13.title` — "Pagar sua multa"
- `portal.screens.t13.intro` — "Veja as opções de pagamento lado a lado antes de escolher."
  ([UC-PORTAL-015] passo 2)
- `portal.screens.t13.cmd.pagar_80` — "Pagar 80% e manter o direito de recorrer"
  ([RN-PORTAL-128] dever 2)
- `portal.screens.t13.cmd.pagar_60_sne` — "Pagar 60% com adesão ao SNE"
- `portal.screens.t13.state.faixa_40_indisponivel` — "Esta opção está temporariamente
  indisponível." (flag `portal.waiver_40_term`, OD-P03, H.53)
- `portal.screens.t13.field.formato_acessivel` — "Pedir guia em formato acessível"
  ([RN-PORTAL-114])
