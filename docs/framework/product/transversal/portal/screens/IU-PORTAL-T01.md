---
id: IU-PORTAL-T01
title: Detalhe da autuação (NA/NP) — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CTB-extracts-raw,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-DECRETO-10543-2020,
    REF-CONTRAN-931,
    REF-BENCH-ESTADOS,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-01. Fontes: [UC-PORTAL-001], [UC-PORTAL-002], [UC-PORTAL-004],
[JRN-PORTAL-001], [JRN-PORTAL-002], [JRN-PORTAL-004], [JRN-PORTAL-005], [RN-PORTAL-101],
[RN-PORTAL-105], [RN-PORTAL-112], [RN-PORTAL-127].

## 1. Identidade

- id: `T-01`; nome visível: "Detalhe da autuação (NA/NP)".
- app: `portal`; módulo: `autos` (`portal-frontends.md` §4).
- rota: `/autos/:aitId` (`route-manifest.md` #9); `screen: 'T-01'`, `sheet: 'IU-PORTAL-T01'`.

## 2. Acesso

- ator: CIDADAO nível simples — consultar a autuação é ato de nível **simples**
  ([RN-PORTAL-101] linha 1).
- `access` do manifesto: `simples`; guardas: `portalAuthGuard` + `assuranceGuard('simples')` →
  `entitlementGuard('ait')` sobre `:aitId` (`route-manifest.md` #9; ordem auth → assurance →
  availability → entitlement, `plan.md` M8).
- pré-condição: AIT vinculado ao CPF do cidadão (`owner`/`driver`/`representative`/
  `interested_party` — `portal-route-contract.md` §1.2).
- sem vínculo comprovável → `404 PORTAL.NOT_FOUND` (disfarce de inexistência, nunca 403 com
  detalhe — `portal-route-contract.md` §1.2; `portal-error-catalog.md` §2) → tela "por que não vejo
  isto"; nunca tela vazia ([IU-PORTAL-001] §E.1 é sobre estado interno, mas o invariante geral de
  "nunca acesso negado seco" está em `portal-frontends.md` §2.8).

## 3. Entrada

- de onde se chega: `/autos` (T-14, lista de multas) ao abrir uma linha; link direto de uma
  notificação em `/notificacoes` (T-12).
- parâmetro `:aitId` validado contra o vínculo do cidadão no servidor antes de qualquer exibição —
  "parâmetros nunca substituem consulta autorizada" (`portal-route-contract.md` §1.2).
- leitura idempotente (`GET`); não há rascunho a recuperar nesta tela.

## 4. Dados

- rota consumida: `GET /v1/portal/aits/{aitId}` (`portal-route-contract.md` §4) → `aitNumber`,
  `plate`, `occurredAt`, `framingLabel`, `amount`, `situation` (`aguardando_defesa` ·
  `em_defesa` · `penalidade_aplicada` · `em_recurso` · `encerrada` · `cancelada` · `arquivada`),
  `deadlines[]{ kind, dueOn, ownedBy }`, `pointsStatus`, `actions[]{ key: defend | indicate_driver |
pay | appeal_jari | appeal_cetran, available, reason?, minimumAssurance }`, `notices[]{ kind: NA |
NP | decisao, channel, dispatchedOn, effectiveOn, fictitious, printedDeadline }`,
  `payment{ tiers[], paid, paidTier }`, `openRequestId?`, `evidenceAvailable`.
- origem: projeção `portal.infraction_view` (ADR-0020); nenhuma tabela do RAIT é lida diretamente
  (`portal-frontends.md` §1).
- prazos chegam calculados e rotulados do servidor (`dueOn`, `ownedBy`); o Portal nunca calcula
  prazo no cliente (`portal-frontends.md` §1 "Fronteiras"; [IU-PORTAL-001] §E.2).
- sem fixture como fallback: indisponibilidade da leitura cai em estado "indisponível" (§5), nunca
  em dado inventado.

## 5. Estados

- **carregando**: esqueleto do cartão de detalhe.
- **vazio**: não se aplica a um AIT identificado — a tela sempre representa um recurso único; se
  nenhuma das três ações está disponível, a tela mostra o motivo de cada uma (`actions[].reason`),
  nunca um cartão em branco.
- **indisponível/offline**: falha da projeção → banner "estamos sem acesso aos seus dados agora;
  seus prazos não mudam" + tentar novamente (`portal-error-catalog.md` §8, `*_UNAVAILABLE`).
- **erro recuperável**: falha transitória de rede → nova tentativa.
- **erro não recuperável**: `aitId` sem vínculo comprovável → `PORTAL.NOT_FOUND` disfarçado.
- **sucesso**: cartão completo com os três caminhos — defender, indicar condutor, pagar — sempre
  visíveis **juntos**, sem viés visual para pagar ([IU-PORTAL-001] nota T-01; [RN-PORTAL-127]
  verificação a).
- **dados desatualizados**: não se aplica — leitura direta da projeção, sem cache local do lado do
  cliente.

## 6. Comandos

A tela em si não submete nenhum ato jurídico — oferece três navegações (`ActionTriplet`,
`portal-frontends.md` §5.2), cada uma abrindo o wizard/tela dedicada:

| Rótulo (chave i18n)                 | Nível exigido | Destino | Base                     |
| ----------------------------------- | ------------- | ------- | ------------------------ |
| "Defender-se" (`cmd.defend`)        | avançada      | T-02    | [RN-PORTAL-101] linha 6  |
| "Indicar condutor" (`cmd.indicate`) | avançada      | T-05    | [RN-PORTAL-101] linha 5  |
| "Pagar" (`cmd.pay`)                 | simples       | T-13    | [RN-PORTAL-101] linha 10 |

- cada ação mostra `available`/`reason` exatamente como o servidor devolve — nunca calculado no
  cliente; se o nível da conta é insuficiente ao clicar, o cidadão segue o passo guiado de elevação
  (T-27), nunca um erro seco (`portal-frontends.md` §3).
- nenhuma ação desta tela muda estado jurídico por si — "um clique não muda estado jurídico só pela
  UI" (`plan.md` §Regras de transcrição/manual do perfil).
- sem idempotência própria: são apenas navegações de leitura.

## 7. Saída

- volta para `/autos` (T-14) ou para a origem (notificação em T-12).
- nada a salvar nesta tela (somente leitura); sem confirmação de abandono necessária.

## 8. Segurança

- vínculo: `portal.entitlement` sobre o AIT (`owner`/`driver`/`representative`/`interested_party`).
- titular vê o próprio CPF sem máscara ([RN-PORTAL-118] citada em `portal-frontends.md` §2.4,
  [IU-PORTAL-001] §E.4); nenhum dado de terceiro aparece nesta tela até haver indicação de condutor
  concluída (ver T-05).
- nenhum token interno em tela/URL/log; o vocabulário do RAIT (`situation`) já chega traduzido pela
  projeção — o token cru, se existir, só em `data-token` para suporte ([RN-PORTAL-112] verificação a;
  `portal-frontends.md` §2.1).

## 9. Acessibilidade

- `ActionTriplet` com rótulo completo lido fora de contexto visual ("Defender-se desta multa", não
  "Defender-se" solto — `_intake/ux-notes.md` §f).
- foco vai ao título da autuação ao concluir o carregamento.
- banners de prazo/urgência nunca só por cor — ícone + texto, testado sob luz direta
  (`_intake/ux-notes.md` §f).
- `aria-live` no banner de indisponibilidade; alvo de toque ≥ 44×44px nos três botões de ação.

## 10. Testes

- unitário: `actions[].available=false` desabilita o botão correspondente e mostra `reason`, nunca
  o esconde silenciosamente.
- roteamento: `entitlementGuard('ait')` presente (bloqueia sem vínculo) e ausente (permite com
  vínculo) — os dois casos.
- jornada feliz: AIT em `aguardando_defesa` mostra os três caminhos juntos; jornada de erro: `aitId`
  sem vínculo → 404 disfarçado; jornada de negação: nível insuficiente ao clicar "Defender-se" →
  redireciona a T-27 com o ato retomável.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                              | Ação seguinte                         |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| carregando        | "Carregando os dados da sua multa..." (`state.loading`)                                 | nenhuma                               |
| vazio             | "Nenhuma ação disponível para esta multa no momento" (`state.empty`) — caso-limite raro | canal presencial ([RN-PORTAL-105])    |
| sem elegibilidade | "Não encontramos essa multa vinculada à sua conta" (`state.ineligible`)                 | comprovar vínculo / ouvidoria         |
| erro recuperável  | "Não conseguimos carregar agora. Tente novamente." (`state.error_recoverable`)          | tentar de novo                        |
| sem permissão     | não redefinida aqui — o bloqueio de fato ocorre por ação, redirecionando a T-27         | ver `portal.screens.t27.*`            |
| indisponível      | "Estamos sem acesso aos seus dados agora; seus prazos não mudam" (`state.unavailable`)  | canal alternativo + tentar mais tarde |

## Chaves i18n

- `portal.screens.t01.title` — "Detalhe da autuação" (obrigatória)
- `portal.screens.t01.cmd.defend` — "Defender-se desta multa"
- `portal.screens.t01.cmd.indicate` — "Indicar quem estava dirigindo"
- `portal.screens.t01.cmd.pay` — "Pagar esta multa"
- `portal.screens.t01.state.loading` — "Carregando os dados da sua multa..."
- `portal.screens.t01.state.empty` — "Nenhuma ação disponível para esta multa no momento"
- `portal.screens.t01.state.ineligible` — "Não encontramos essa multa vinculada à sua conta"
- `portal.screens.t01.state.error_recoverable` — "Não conseguimos carregar agora. Tente novamente."
- `portal.screens.t01.state.unavailable` — "Estamos sem acesso aos seus dados agora; seus prazos não mudam"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
