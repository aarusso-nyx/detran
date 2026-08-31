---
id: UC-DASH-002
title: Operador reconhece e trata um alerta
status: approved
apps: [dashboard]
sources: [WF-DASH-001]
updated: 2026-08-31
---

## Ator e objetivo

Operador de monitoramento quer garantir que um alerta recém-notificado não fique sem dono
respondendo — reconhece o alerta em nome do fluxo, confirma que o dono correto foi acionado, e
acompanha até a verificação de encerramento.

## Pré-condições

- Existe um alerta em estado `NOTIFICADO` em [WF-DASH-001].

## Fluxo principal

1. Operador vê o alerta `NOTIFICADO` no radar, com o dono e a cadeia de escalonamento exibidos.
2. Operador confirma que a notificação chegou ao dono (canal próprio do app de origem, ou
   confirmação manual quando o app não expõe endpoint de ACK — ver nota de gap em [WF-DASH-001]
   §Decisões de modelagem pendentes).
3. Sistema move o alerta para `RECONHECIDO`.
4. Dono inicia a ação **no app de origem** (não no DASHBOARD).
5. Operador acompanha o estado do alerta; quando o sistema detecta, por evento ou leitura do app
   de origem, que o indicador voltou à faixa normal, o alerta move para `VERIFICADO`.
6. Operador confirma o encerramento (trilha de irregularidade) ou o sistema confirma
   automaticamente (trilha de extinção, quando o app de origem já mudou de estado). Alerta move
   para `ENCERRADO`.

## Fluxos alternativos / exceções

- **SLA de reconhecimento vencido**: se o dono não reconhece a tempo, o sistema move o alerta
  para `ESCALONADO` e reinicia a notificação no próximo nível da cadeia — Operador é notificado
  do escalonamento.
- **Novo marco de severidade atingido durante o tratamento**: alerta em `EM_TRATAMENTO` cruza o
  próximo marco (ex. N1→N2) antes de ser verificado — sistema move para `ESCALONADO`; Operador
  garante que o nível superior da cadeia também tome ciência.
- **Alerta chega a `CRITICO_EXTINCAO`**: Operador nunca marca esse alerta como "encerrado" — o
  botão de ação leva a "ver apuração de incidente" ([WF-DASH-001] §Distinção obrigatória de UI),
  e o fluxo segue para `INCIDENTE_REGISTRADO`, fora do alcance de fechamento manual do Operador.

## Pós-condições

- Todo alerta tem um dono confirmado, um histórico de reconhecimento/escalonamento auditável, e
  um encerramento verificado por evidência do app de origem — nunca por autodeclaração.

## Critérios de aceitação

**AC-DASH-002-1 — o DASHBOARD não pratica o ato**

- **Dado** um alerta reconhecido
- **Quando** o dono age
- **Então** a ação ocorre **no app de origem** ([RN-DASH-101]) — o painel não julga, não declara
  prescrição, não corrige registro; oferecer esse botão aqui seria violar a fronteira

**AC-DASH-002-2 — o alerta tem anatomia mínima**

- **Dado** um alerta emitido
- **Quando** chega ao dono
- **Então** carrega indicador, caso, severidade, base legal, dono, prazo restante e ação esperada
  ([RN-DASH-135]) — sem esses elementos não é prova de diligência, é ruído

**AC-DASH-002-3 — o alerta é prova de diligência, e por isso não se apaga**

- **Dado** um alerta encerrado
- **Quando** o histórico é consultado
- **Então** todos os marcos permanecem com seus timestamps e atores ([RN-DASH-135]) — o registro
  demonstra que o órgão agiu a tempo, e é essa a sua função probatória

**AC-DASH-002-4 — encerrar exige verificação, não declaração**

- **Dado** um alerta cujo dono afirma ter agido
- **Quando** o encerramento é processado
- **Então** o sistema confirma pelo estado do app de origem antes de `VERIFICADO`
  ([WF-DASH-001]) — "já resolvi" não encerra alerta

**AC-DASH-002-5 — sem endpoint de ACK, o reconhecimento é manual e assim rotulado**

- **Dado** um app de origem que não expõe confirmação de recebimento
- **Quando** o operador reconhece
- **Então** o reconhecimento é registrado como **manual**, distinguível do automático — a lacuna
  fica visível na trilha em vez de simulada

## Regras aplicáveis

- [WF-DASH-001] (ciclo completo)
- [WF-DASH-001] §Distinção obrigatória de UI — extinção × irregularidade
