---
id: IU-PORTAL-T07
title: Detalhe do processo (linha do tempo) — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-BENCH-ESTADOS,
    REF-CTB-extracts-raw,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
    REF-CONTRAN-931,
    REF-LEI-13460-2017,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-07. Fontes: [UC-PORTAL-005], [UC-PORTAL-009], [JRN-PORTAL-001],
[JRN-PORTAL-003], [RN-PORTAL-111], [RN-PORTAL-112].

## 1. Identidade

- id: `T-07`; nome visível: "Detalhe do processo".
- app: `portal`; módulo: `processos` (`portal-frontends.md` §4).
- rota: `/processos/:requestId` (`route-manifest.md` #15); `screen: 'T-07'`,
  `sheet: 'IU-PORTAL-T07'`.

## 2. Acesso

- ator: CIDADAO nível simples — vista do próprio processo é ato de consulta ([RN-PORTAL-101]
  linha 1); a exceção é quando o acompanhamento leva a um novo ato de nível avançado (recorrer,
  desistir), tratado no passo guiado da tela de destino, nunca nesta ([JRN-PORTAL-003] nota de
  revisão).
- `access`: `simples`; guardas `portalAuthGuard` + `assuranceGuard('simples')` →
  `entitlementGuard('request')` sobre `:requestId` (`route-manifest.md` #15).

## 3. Entrada

- de onde se chega: T-06 (lista); link de notificação em T-12 (diligência: `acao_necessaria`).
- `requestId` da URL validado contra o vínculo antes de exibir.

## 4. Dados

- `GET /v1/portal/requests/{id}` (`portal-route-contract.md` §5) → `{ request, timeline[]
(visibility=citizen), deadlines[]{ ownedBy }, documents[], diligences[], decision?, actions{
canRespondDiligence, canWithdraw, withdrawalBlockedReason, canAppeal, nextInstanceServiceKey } }`
  — projeção `portal.process_timeline`.
- linha do tempo (`ProcessTimeline`, `portal-frontends.md` §5.2) separa "com você" de "com o órgão"
  ([RN-PORTAL-112] item de desenho; [UC-PORTAL-005] AC-PORTAL-005-2); documentos enviados e
  recebidos ficam acessíveis a qualquer momento, sem pedido formal ([RN-PORTAL-112] item 1 e 4;
  [UC-PORTAL-005] AC-PORTAL-005-1).
- diligência aberta mostra prazo próprio destacado, distinto do prazo geral do órgão (`DeadlineCard`,
  `ownedBy: citizen`; [RN-PORTAL-112]; [UC-PORTAL-009] AC-PORTAL-009-1).

## 5. Estados

- **carregando**: skeleton da linha do tempo.
- **vazio**: não se aplica — a tela sempre representa um processo identificado; se não há eventos
  além do protocolo, a linha do tempo mostra apenas "Protocolado em DD/MM".
- **sem elegibilidade**: `requestId` sem vínculo comprovável → `PORTAL.NOT_FOUND` disfarçado, tela
  "por que não vejo isto".
- **erro recuperável**: falha transitória ao carregar documentos/linha do tempo → retry, sem perder
  o que já carregou.
- **sem permissão**: não se aplica diretamente à consulta; ações de nível superior disponíveis nesta
  tela (recorrer, desistir) levam ao passo guiado na tela de destino.
- **indisponível**: projeção fora do ar → banner "estamos sem acesso ao seu processo agora; seus
  prazos não mudam".
- **sucesso**: linha do tempo completa (protocolado → em análise → decidido), com "de quem é a
  próxima ação" explícito ([UC-PORTAL-005] AC-PORTAL-005-2).
- **processo sem movimentação recente**: mostra explicitamente a última ação, nunca um status
  "parado" sem explicação ([UC-PORTAL-005] 3a).
- **diligência com prazo vencido sem resposta**: informa que o processo será julgado no estado em
  que se encontra, sem suspender o acompanhamento ([UC-PORTAL-005] 4a; [UC-PORTAL-009]
  AC-PORTAL-009-5).

## 6. Comandos

Tela majoritariamente de leitura; oferece navegação condicionada às `actions{}` devolvidas pelo
servidor:

| Rótulo (chave i18n)                    | Condição (`actions{}`) | Destino                                     |
| -------------------------------------- | ---------------------- | ------------------------------------------- |
| "Responder diligência" (`cmd.respond`) | `canRespondDiligence`  | T-11                                        |
| "Desistir" (`cmd.withdraw`)            | `canWithdraw`          | T-08                                        |
| "Recorrer" (`cmd.appeal`)              | `canAppeal`            | T-03/T-04 conforme `nextInstanceServiceKey` |
| "Ver decisão" (`cmd.decision`)         | `decision` presente    | T-10                                        |

- disponibilidade de cada ação vem exatamente de `actions{}`; se `canWithdraw=false`, o motivo é
  `withdrawalBlockedReason` (ex.: já julgado) e não um botão simplesmente ausente sem explicação.
- baixar/consultar qualquer documento a qualquer momento, sem pedido formal ([RN-PORTAL-112] item 4).
- "um clique não muda estado jurídico só pela UI" — todas as ações aqui só navegam; o ato em si
  acontece na tela de destino.

## 7. Saída

- volta para T-06.
- nada a salvar nesta tela (somente leitura).

## 8. Segurança

- vínculo: `portal.entitlement` sobre o `request`.
- titular vê o próprio processo sem máscara; documentos de terceiro (quando existirem em processos
  compartilhados) seguem a mesma doutrina de supressão campo a campo de [RN-PORTAL-112] item 3.
- toda leitura de documento pessoal gera `@Audit` (`portal-route-contract.md` §1.7).

## 9. Acessibilidade

- linha do tempo navegável por teclado, cada evento com data, descrição e link de documento
  associado (quando houver).
- `aria-live` ao atualizar o status (ex.: diligência respondida com sucesso).
- distinção "com você"/"com o órgão" nunca só por cor — ícone + texto.

## 10. Testes

- unitário: `actions{}` controla exatamente quais botões aparecem, com motivo quando indisponível.
- roteamento: `entitlementGuard('request')` presente e ausente.
- jornada feliz: processo com diligência aberta → contador destacado → resposta → status muda na
  hora ([UC-PORTAL-009] AC-PORTAL-009-4); jornada de erro: `requestId` sem vínculo → 404 disfarçado;
  jornada de negação: `canAppeal=false` após instância esgotada → sem botão, com explicação.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                              | Ação seguinte                         |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| carregando        | "Carregando seu processo..." (`state.loading`)                                          | nenhuma                               |
| vazio             | não se aplica (linha do tempo mínima = protocolo)                                       | —                                     |
| sem elegibilidade | "Não encontramos esse processo vinculado à sua conta" (`state.ineligible`)              | comprovar vínculo / ouvidoria         |
| erro recuperável  | "Não conseguimos carregar agora. Tente novamente." (`state.error_recoverable`)          | tentar de novo                        |
| sem permissão     | não se aplica à consulta; ações avançadas guiadas na tela de destino                    | ver `portal.screens.t27.*`            |
| indisponível      | "Estamos sem acesso ao seu processo agora; seus prazos não mudam" (`state.unavailable`) | tentar mais tarde + canal alternativo |

## Chaves i18n

- `portal.screens.t07.title` — "Detalhe do processo" (obrigatória)
- `portal.screens.t07.cmd.respond` — "Responder diligência"
- `portal.screens.t07.cmd.withdraw` — "Desistir"
- `portal.screens.t07.cmd.appeal` — "Recorrer"
- `portal.screens.t07.cmd.decision` — "Ver decisão"
- `portal.screens.t07.state.loading` — "Carregando seu processo..."
- `portal.screens.t07.state.ineligible` — "Não encontramos esse processo vinculado à sua conta"
- `portal.screens.t07.state.error_recoverable` — "Não conseguimos carregar agora. Tente novamente."
- `portal.screens.t07.state.unavailable` — "Estamos sem acesso ao seu processo agora; seus prazos não mudam"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
