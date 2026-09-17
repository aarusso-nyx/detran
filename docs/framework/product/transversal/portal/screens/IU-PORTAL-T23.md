---
id: IU-PORTAL-T23
title: Pagar sem abrir mão do recurso — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-DECRETO-10543-2020,
    REF-CTB-extracts-raw,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-23. Fontes: [UC-PORTAL-015], [JRN-PORTAL-010], [RN-PORTAL-127].

## 1. Identidade

Tela `T-23` "Pagar sem abrir mão do recurso" ([IU-PORTAL-001] §B). App `portal`. Rota
`autos/:aitId/pagamento/preservando-recurso` (`route-manifest.md` #13; `portal-frontends.md` §4
"T-23 pagar sem abrir mão do recurso"). Módulo `pagamento`. `screen: 'T-23'`,
`sheet: 'IU-PORTAL-T23'`.

## 2. Acesso

Ator Cidadão, nível simples para solicitar a guia — a segurança da transação em si é do meio
de pagamento (SPB/cartão), fora do Decreto 10.543/2020 ([UC-PORTAL-015] pré-condições;
[RN-PORTAL-101] linha 11). `access: simples` (`route-manifest.md` #13): `portalAuthGuard` +
`assuranceGuard('simples')`. Guarda de vínculo `entitlementGuard('ait')` sobre `:aitId`
(`route-manifest.md`). `serviceKey: pagamento` sob `serviceAvailabilityGuard`
(`route-manifest.md`; `portal-frontends.md` §3).

## 3. Entrada

Chega-se do detalhe da autuação (T-01) ou da comparação de pagamento (T-13), quando o cidadão
escolhe pagar sem abrir mão do recurso ([JRN-PORTAL-010] passo 1). O parâmetro de rota `:aitId`
é validado pelo `entitlementGuard('ait')` antes de qualquer composição — "parâmetros nunca
substituem consulta autorizada". Premissa adotada ([IU-PORTAL-001] §F; T-13/T-23): DT-026 está
**respondida** — OD-P03 fixa o termo de renúncia digital assinado no PORTAL, com texto versionado
`portal.legal.renuncia_40.v1` já existente; a faixa de 40% fica **desligada pela flag**
`portal.waiver_40_term` até OD-003 (H.53), e por isso esta tela — dedicada à faixa que **preserva**
o recurso — nunca oferece nem simula a faixa de 40% enquanto a flag estiver desligada; se o
cidadão a buscar (via T-13), a faixa aparece como indisponível com o motivo, nunca omitida sem
explicação.

## 4. Dados

`GET aits/{aitId}` (`portal-route-contract.md` §4) para o campo `payment` (faixas, valores,
`paid`); `POST requests` + `PUT requests/{id}/draft` + `POST requests/{id}/submit`
(`serviceKey: pagamento`, `portal-route-contract.md` §5/§5.1) para compor e confirmar o
pagamento. Campos exibidos: valor com 80% de desconto (até o vencimento) e valor integral com
juros (fora do prazo, cálculo já pronto — [UC-PORTAL-015] fluxo 2, 3a), sempre lado a lado, nunca
um escondido atrás de clique extra ([RN-PORTAL-128] item 1; [UC-PORTAL-015] AC-1). Meio de
pagamento: PIX/débito/boleto ou parcelado no cartão, sem limite normativo de parcelas — "até 12x"
é falso (DT-120; [UC-PORTAL-015] AC-3; [RN-PORTAL-126] item 2). O documento de arrecadação é o
padronizado da União, obtido do sistema competente, nunca gerado localmente ([RN-PORTAL-125]).
Relógio do servidor calcula os encargos por truncamento de duas casas, sem arredondamento
([RN-PORTAL-125] item Verificação b). Sem fixture como fallback.

## 5. Estados

- **Carregando**: aguardando o valor calculado da autuação.
- **Vazio**: n/a (a tela sempre parte de um `:aitId` com pagamento pendente).
- **Indisponível/offline**: `PORTAL.PAYMENT_PROVIDER_UNAVAILABLE` — banner "estamos sem acesso ao
  módulo de arrecadação; seu prazo não muda" (`portal-error-catalog.md` §4/§8).
- **Erro recuperável**: `PORTAL.PAYMENT_METHOD_UNAVAILABLE` (cartão/parcelamento sem autorização
  do órgão, DT-031) — mostra os meios disponíveis (`portal-error-catalog.md` §4).
- **Erro não recuperável**: `PORTAL.PAYMENT_ALREADY_PAID` — documento já quitado
  (`portal-error-catalog.md` §4).
- **Sucesso**: confirmação explícita antes de processar ("Você está pagando esta multa agora.
  Isso não impede você de continuar se defendendo ou recorrendo" — [JRN-PORTAL-010] passo 2) e
  comprovante que reflete a mesma garantia, com a data-limite de recurso quando aplicável
  ([JRN-PORTAL-010] passo 3).

## 6. Comandos

"Pagar sem abrir mão do recurso" (`portal.screens.t23.cmd.pagar_sem_abrir_mao`), nível simples,
validação de forma: faixa (80%/integral) e meio (PIX/débito/boleto/cartão) —
`portal-frontends.md` §7 "Pagamento (T-13/T-23)"; idempotência `Idempotency-Key`
`<ato>:<alvo>:<fingerprint>` (`portal-route-contract.md` §1.4); efeito `submit` →
`inf:collection:issue` (`portal-frontends.md` §4); destino módulo `pagamento`; auditado
(`@Audit`). "Um clique não muda estado jurídico só pela UI": o pagamento não encerra defesa nem
recurso — o processo segue normalmente ([RN-PORTAL-127] item 2; [UC-PORTAL-015] AC-5), e a tela
afirma isso antes da confirmação, não em letra miúda ([JRN-PORTAL-010] passo 2).

## 7. Saída

Após confirmar, retorna ao detalhe da autuação (T-01) ou ao processo em curso (T-07), mostrando
que o wizard de recurso segue disponível normalmente — "já pago" não bloqueia nem complica a
interposição ([JRN-PORTAL-010] passo 5). Antes de confirmar, abandonar a tela não exige aviso
adicional (nenhum rascunho de pagamento persiste como pendência jurídica).

## 8. Segurança

Vínculo checado por `portal.entitlement` (`kind: ait`). Nenhum dado de cartão é retido pelo
PORTAL — o PORTAL não é o arrecadador, nem intermedeia a custódia do recurso ([RN-PORTAL-125];
[UC-PORTAL-015] AC-4). Nenhum token/segredo em tela, URL ou log; o `data-token` do estado
interno da autuação (`NOTIFICADO_AUTUACAO` etc.) fica fora da tela de pagamento
(`portal-frontends.md` §2.1). Canal digital nunca é o único — a alternativa presencial é sempre
mostrada ([IU-PORTAL-001] §E.6; [RN-PORTAL-105]).

## 9. Acessibilidade

Guia/boleto em formato acessível mediante solicitação, com o caminho de solicitação explícito,
não apenas exportação PDF padrão ([RN-PORTAL-114]; [UC-PORTAL-015] AC-6). Alvo de toque generoso
no botão de confirmação de pagamento (mínimo 44×44px efetivo — `_intake/ux-notes.md` §f "Alvo de
toque"). `aria-live` na confirmação; contraste AA; WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: as duas faixas aplicáveis (80%/integral) sempre lado a lado, nunca a de 40% oferecida
enquanto `portal.waiver_40_term` estiver desligada ([RN-PORTAL-128] item 1; premissa §3 acima).
Roteamento: `entitlementGuard('ait')` e `serviceAvailabilityGuard('pagamento')`, presença e
ausência. Jornada feliz: pagamento confirmado, recurso segue tramitando. Jornada de erro: módulo
de arrecadação indisponível, prazo não muda. Jornada de negação: documento já quitado.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                           | Ação seguinte                       |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------- |
| Carregando        | `portal.screens.t23.state.carregando`        | "Calculando o valor da sua multa."                                      | aguardar                            |
| Vazio             | `portal.screens.t23.state.vazio`             | "Não aplicável — a tela parte sempre de uma autuação identificada."     | —                                   |
| Sem elegibilidade | `portal.screens.t23.state.sem_elegibilidade` | "Este serviço de pagamento não está disponível agora."                  | canal alternativo ([RN-PORTAL-105]) |
| Erro recuperável  | `portal.screens.t23.state.erro_recuperavel`  | "Cartão parcelado não está disponível agora; PIX, débito e boleto sim." | escolher outro meio                 |
| Sem permissão     | `portal.screens.t23.state.sem_permissao`     | "Não encontramos vínculo seu com esta autuação."                        | "por que não vejo isto" + ouvidoria |
| Indisponível      | `portal.screens.t23.state.indisponivel`      | "Estamos sem acesso ao módulo de pagamento agora; seu prazo não muda."  | tentar depois; canal presencial     |

## Chaves i18n

- `portal.screens.t23.title` — "Pagar sem abrir mão do recurso"
- `portal.screens.t23.intro` — "Pagar agora não impede você de continuar se defendendo ou recorrendo."
- `portal.screens.t23.cmd.pagar_sem_abrir_mao` — "Pagar sem abrir mão do recurso"
- `portal.screens.t23.state.carregando` — (ver tabela acima)
- `portal.screens.t23.state.vazio` — (ver tabela acima)
- `portal.screens.t23.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t23.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t23.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t23.state.indisponivel` — (ver tabela acima)
- `portal.screens.t23.field.valor_80` — "Valor com desconto de 20% (pagar 80%)"
- `portal.screens.t23.field.valor_integral` — "Valor integral com encargos"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`, inclusive `portal.legal.renuncia_40.v1` quando a faixa de 40% estiver
disponível na tela irmã T-13) são referenciados por esta tela, não redefinidos aqui.
