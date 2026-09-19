---
id: IU-PORTAL-T08
title: Confirmação de desistência — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-08. Fontes: [UC-PORTAL-006], [RN-PORTAL-105], [RN-PORTAL-128].

## 1. Identidade

- id: `T-08`; nome visível: "Confirmação de desistência".
- app: `portal`; módulo: `processos` (`portal-frontends.md` §4).
- rota: `/processos/:requestId/desistencia` (`route-manifest.md` #17); `screen: 'T-08'`,
  `sheet: 'IU-PORTAL-T08'`; nível de forma: "simples (forma escrita = assinatura eletrônica)"
  (`portal-frontends.md` §4).

## 2. Acesso

- ator: CIDADAO nível simples para acessar a tela; a confirmação em si equivale a assinatura
  eletrônica por exigência de forma escrita ([REF-CONTRAN-900] art. 11; [UC-PORTAL-006]
  AC-PORTAL-006-2) — o corpo canônico da matriz de [RN-PORTAL-101] classifica desistir como
  **avançada** por paralelismo de forma com defesa/recurso (linha 8, confiança "Média" — a própria
  regra registra a inferência, não nomeação literal).
- `access`: `simples`; guardas `portalAuthGuard` + `assuranceGuard('simples')` →
  `entitlementGuard('request')` sobre `:requestId` (`route-manifest.md` #17). A divergência entre o
  `access: simples` do manifesto e a linha 8 de [RN-PORTAL-101] (avançada, por inferência) não tem
  fonte que a reconcilie explicitamente nesta leitura fechada — registrada como **OD-P52** no
  relatório desta ficha, sem decidir aqui.
- pré-condição: processo em tramitação, ainda não julgado, em qualquer fase ([UC-PORTAL-006]
  Pré-condições).

## 3. Entrada

- de onde se chega: T-07, botão "Desistir".
- `requestId` validado contra o vínculo antes de exibir.

## 4. Dados

- `POST /v1/portal/requests/{id}/withdraw` `{ confirm: true, reason? }` (`portal-route-contract.md`
  §5) → `DESISTIDO` (antes do protocolo) ou delegação `inf:rait-case:withdraw` (caso RAIT em curso)
  → `ENCERRADO_DESISTENCIA`.
- nenhum dado adicional é lido nesta tela além do que T-07 já carregou (fase atual, se pautado para
  sessão do dia).

## 5. Estados

- **carregando**: skeleton do texto de consequência enquanto a tela confirma a fase atual do
  processo.
- **vazio**: não se aplica.
- **sem elegibilidade**: processo já julgado → ação indisponível, com explicação do porquê e do
  caminho restante ([UC-PORTAL-006] AC-PORTAL-006-3).
- **erro recuperável**: falha transitória ao registrar → nenhuma alteração é feita, cidadão pode
  tentar de novo ([UC-PORTAL-006] 3a, por analogia ao cancelamento da confirmação).
- **sem permissão**: se a leitura conservadora de [RN-PORTAL-101] linha 8 prevalecer (avançada), o
  bloqueio seria o passo guiado padrão — comportamento **não confirmado nesta leitura fechada**
  (ver OD-P52).
- **indisponível**: falha ao registrar a desistência de forma persistente → banner de
  indisponibilidade, sem alterar o processo.
- **sucesso**: consequência explicada **antes** da confirmação — desistência é definitiva para
  aquele requerimento, penalidade/AIT segue seu curso normal ([UC-PORTAL-006] AC-PORTAL-006-1);
  se motivada por pagamento com desconto, direciona à tela de pagamento com valor e prazo já
  calculados ([UC-PORTAL-006] AC-PORTAL-006-4, passo 5).
- **processo pautado no dia**: sistema verifica se ainda há tempo hábil antes do início da sessão;
  se não houver, informa que a desistência pode não ser processada a tempo e orienta contato direto
  com a secretaria ([UC-PORTAL-006] 1a).

## 6. Comandos

| Rótulo (chave i18n)                     | Nível (ver §2, OD-P52)                                  | Validação de forma                                                                       | Idempotência                                                                                              | Efeito                                           |
| --------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| "Confirmar desistência" (`cmd.confirm`) | simples (manifesto) / avançada (matriz, por inferência) | forma escrita — confirmação equivale a assinatura eletrônica ([REF-CONTRAN-900] art. 11) | — (comando de estado, sem `Idempotency-Key` documentada em `portal-route-contract.md` §5 para `withdraw`) | `withdraw` → `DESISTIDO`/`ENCERRADO_DESISTENCIA` |
| "Cancelar" (`cmd.cancel`)               | —                                                       | —                                                                                        | —                                                                                                         | nenhuma alteração ([UC-PORTAL-006] 3a)           |

- a consequência (definitiva, penalidade segue seu curso) é dita **antes** da confirmação, não
  depois ([UC-PORTAL-006] AC-PORTAL-006-1; `ConsequenceDialog`).
- só disponível até o julgamento ([UC-PORTAL-006] AC-PORTAL-006-3).
- "um clique não muda estado jurídico só pela UI" — a confirmação é etapa distinta da leitura da
  consequência.
- todo comando gera `@Audit` (`portal-route-contract.md` §1.7).

## 7. Saída

- confirmado: segue para T-07 (status atualizado) ou, se motivado por desconto, para T-13
  (pagamento) com valor e prazo já calculados.
- cancelado: volta para T-07 sem nenhuma alteração.

## 8. Segurança

- vínculo: `portal.entitlement` sobre o `request`.
- nenhum token/segredo em tela/URL/log.
- termo de desistência anexado ao dossiê, com data/hora ([UC-PORTAL-006] AC-PORTAL-006-2).

## 9. Acessibilidade

- texto de consequência com foco automático ao abrir a tela (momento de maior consequência).
- botões "Confirmar"/"Cancelar" com alvo de toque ≥ 44×44px e contraste AA.
- leitor de tela lê a consequência por completo antes do botão de confirmar, nunca depois.

## 10. Testes

- unitário: bloqueio da ação após julgamento, com explicação; texto de consequência exibido antes
  do botão habilitar.
- roteamento: `entitlementGuard('request')` presente e ausente.
- jornada feliz: desistência antes do julgamento → processo encerrado, caminho de pagamento se
  motivado por desconto; jornada de erro: tentativa após julgamento → ação indisponível com
  explicação; jornada de negação: cancelamento da confirmação → nenhuma alteração.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                        | Ação seguinte                           |
| ----------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| carregando        | "Verificando a fase do seu processo..." (`state.loading`)                         | nenhuma                                 |
| vazio             | não se aplica                                                                     | —                                       |
| sem elegibilidade | "Este processo já foi julgado e não pode mais ser desistido" (`state.ineligible`) | volta para T-07 com explicação          |
| erro recuperável  | "Não conseguimos registrar agora. Nada foi alterado." (`state.error_recoverable`) | tentar de novo                          |
| sem permissão     | não confirmado nesta leitura (ver OD-P52) — `state.forbidden` reservada           | ver `portal.screens.t27.*` se aplicável |
| indisponível      | "Não conseguimos registrar sua desistência agora" (`state.unavailable`)           | tentar mais tarde                       |

## Chaves i18n

- `portal.screens.t08.title` — "Confirmar desistência" (obrigatória)
- `portal.screens.t08.intro` — "Isso é definitivo para este requerimento. A multa segue seu curso normal."
- `portal.screens.t08.cmd.confirm` — "Confirmar desistência"
- `portal.screens.t08.cmd.cancel` — "Cancelar"
- `portal.screens.t08.state.loading` — "Verificando a fase do seu processo..."
- `portal.screens.t08.state.ineligible` — "Este processo já foi julgado e não pode mais ser desistido"
- `portal.screens.t08.state.error_recoverable` — "Não conseguimos registrar agora. Nada foi alterado."
- `portal.screens.t08.state.unavailable` — "Não conseguimos registrar sua desistência agora"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
