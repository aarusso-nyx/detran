---
id: IU-PORTAL-T10
title: Tela de decisão — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-10. Fontes: [UC-PORTAL-008], [RN-PORTAL-112].

## 1. Identidade

`T-10`, "Decisão do seu processo", app `portal`, rota `processos/:requestId/decisao`
(`route-manifest.md` #18), módulo `processos`, `screen: 'T-10'`, `sheet: 'IU-PORTAL-T10'`.

## 2. Acesso

Ator CIDADAO nível simples (`route-manifest.md` `access: simples`); guarda `portalAuthGuard` +
`entitlementGuard('request', requestId)` — sem vínculo redireciona para
`/vinculo/por-que-nao-vejo` (`plan.md` M8; direito do interessado, [RN-PORTAL-112]); sem
`assuranceGuard` (leitura, [WF-PORTAL-002] matriz ato→nível não exige nível para consulta).
Pré-condição: pedido em `RESULTADO_DISPONIVEL` ou posterior ([WF-PORTAL-001] — token do próprio
workflow). Sem vínculo → tela "por que não vejo isto" explicada, nunca tela vazia
(`portal-frontends.md` §2 inv. 8).

## 3. Entrada

Chega-se de `/processos/:requestId` (T-07) ou de um item de `/notificacoes` (T-12) sobre decisão
publicada ([UC-PORTAL-008] passo 2). Parâmetro de rota `requestId` validado contra o vínculo do
cidadão antes de exibir qualquer conteúdo ([RN-PORTAL-103], [RN-PORTAL-112]). Não há rascunho a
retomar — a tela é só-leitura.

## 4. Dados

`GET requests/{id}/decision` (`portal-route-contract.md` §5): `outcome` (`deferido` ·
`indeferido` · `parcialmente_deferido` · `provido` · `negado` · `nao_conhecido`), `summary`,
`publishedOn`, `documentUrl`, `nextStep{ kind, serviceKey?, dueOn? }`, `refundDue?`,
`finalInstance` — projeção `portal.process_timeline` (ADR-0020). Nenhuma fixture como fallback; o
rótulo do `nextStep` vem do catálogo de serviços (`GET services/{serviceKey}`, campo `title`), a
tela não fixa um rótulo próprio.

## 5. Estados

- **carregando**: esqueleto da tela.
- **vazio**: não se aplica — a rota só existe a partir de `RESULTADO_DISPONIVEL`
  ([WF-PORTAL-001]).
- **sem elegibilidade / sem permissão**: tratado pelo `entitlementGuard` antes de renderizar
  (redireciona para `/vinculo/por-que-nao-vejo`, `plan.md` M8) — não há estado in-page.
- **erro recuperável**: `PORTAL.NOT_FOUND` (`portal-error-catalog.md` §2) — mesmo destino do
  guarda.
- **indisponível**: falha de rede/servidor — tentar novamente.
- **sucesso**: resultado em destaque, resumo em linguagem simples, próximo passo como ação
  ([UC-PORTAL-008] AC-1/AC-2).

## 6. Comandos

Nenhum comando de escrita — tela de leitura ([UC-PORTAL-008] pós-condições). "Baixar decisão"
(`documentUrl`) não muda estado ([RN-PORTAL-112] item 1, "documento original permanece
acessível"). O botão de próximo passo navega para a rota do `nextStep.serviceKey` (ex.: recurso
ao CETRAN → T-04) sem comando próprio nesta tela.

## 7. Saída

Volta a `/processos/:requestId` (T-07) ou `/processos` (T-06). Nada a salvar; sem confirmação de
abandono (tela só-leitura).

## 8. Segurança

Vínculo por `portal.entitlement` (`kind: request`). Titular vê o próprio resultado sem máscara
([RN-PORTAL-118]). `outcome` sempre traduzido — nenhum token interno do RAIT vaza
(`portal-frontends.md` §2 inv. 1). Nada de token/segredo em tela/URL/log.

## 9. Acessibilidade

Resultado como heading de nível 1, lido primeiro pelo leitor de tela; resumo anunciado em
`aria-live="polite"` na troca de estado; foco move para o heading do resultado ao carregar; o
próximo passo é um botão único, nunca uma lista de opções ([UC-PORTAL-008] AC-2). Documento formal
em formato acessível mediante solicitação quando o próximo passo envolve cobrança
([RN-PORTAL-114]).

## 10. Testes

Unitário: resultado renderiza antes do fundamento ([UC-PORTAL-008] AC-1). Roteamento: presença do
botão de próximo passo somente quando `nextStep` existe (AC-2); ausência quando `finalInstance` é
`true` e não cabe mais recurso (AC-4a). Jornada feliz: provimento com `refundDue` informa a
restituição (AC-3). Jornada de aviso: provimento em 1ª instância informa que a autoridade ainda
pode recorrer (AC-4).

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)        | Ação seguinte                                          |
| ----------------- | --------------------------------- | ------------------------------------------------------ |
| carregando        | `portal.states.loading`           | —                                                      |
| vazio             | `portal.screens.t10.empty`        | volta a `/processos/:requestId`                        |
| sem elegibilidade | tratado pelo guarda (redireciona) | `/vinculo/por-que-nao-vejo`                            |
| erro recuperável  | `portal.states.retry`             | tentar novamente                                       |
| sem permissão     | tratado pelo guarda (redireciona) | `/vinculo/por-que-nao-vejo`                            |
| indisponível      | `portal.states.unavailable`       | tentar mais tarde; canal alternativo ([RN-PORTAL-105]) |

## Chaves i18n

- `portal.screens.t10.title` — "Decisão do seu processo"
- `portal.screens.t10.intro` — "Veja o resultado e o que fazer a seguir." ([UC-PORTAL-008] passo 3)
- `portal.screens.t10.empty` — "Este processo ainda não tem decisão publicada."
- `portal.screens.t10.cmd.baixar_documento` — "Baixar decisão" ([RN-PORTAL-112] item 1)
- `portal.screens.t10.field.restituicao` — "Você tem direito à restituição de {{amount}}, já
  atualizada." ([UC-PORTAL-008] AC-3, [RN-PORTAL-127])
