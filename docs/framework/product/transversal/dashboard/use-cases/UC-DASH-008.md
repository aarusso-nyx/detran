---
id: UC-DASH-008
title: Gestor de área acompanha o calendário de deveres periódicos
status: approved
apps: [dashboard]
sources: [WF-DASH-002]
updated: 2026-08-31
---

## Ator e objetivo

Gestor de área quer ver, com antecedência, todos os deveres periódicos que vencem no horizonte
próximo (semana/mês), independentemente de quem seja o dono direto de cada um — visão de
calendário, não apenas reativa a alertas individuais.

## Pré-condições

- Pelo menos um ciclo de dever periódico está ativo em [WF-DASH-002].

## Fluxo principal

1. Gestor abre a visão de calendário do DASHBOARD.
2. Sistema exibe todos os ciclos de dever periódico do catálogo (bloco B), organizados por
   data-limite (quando existente) ou por periodicidade declarada, com o estado atual de cada um
   (`JANELA_ABERTA`, `EM_APURACAO`, `PREPARADO`, `SUBMETIDO_PUBLICADO`, `COMPROVADO`,
   `ARQUIVADO`, `ATRASADO`, `NAO_CUMPRIDO`).
3. Gestor identifica deveres próximos do vencimento sem avanço de estado e aciona o dono
   diretamente, antecipando o alerta automático de [WF-DASH-001].
4. Gestor consulta o histórico de ciclos anteriores para identificar padrões de atraso
   recorrente por dever.

## Fluxos alternativos / exceções

- **Dever sem data-limite numérica** (ex. IND-DASH-204, IND-DASH-205): aparece na visão de
  calendário em seção separada, "sem prazo definido", nunca misturado com os deveres com data
  certa — para não distorcer a leitura de urgência do calendário.
- **Dever com consequência automática de descumprimento** (IND-DASH-202): recebe destaque visual
  permanente no calendário, mesmo antes de entrar em `ATRASADO`, dado o risco de suspensão de
  autorização.

## Pós-condições

- Gestor tem visão antecipada do calendário de obrigações da sua área, reduzindo a dependência de
  reagir apenas a alertas já disparados.

## Critérios de aceitação

**AC-DASH-008-1 — o calendário mostra 14 deveres, e diz quais têm data**

- **Dado** a visão de calendário
- **Quando** é aberta
- **Então** exibe as 14 linhas do catálogo consolidado ([RN-DASH-120]) distinguindo as 10 com prazo
  numérico das que só têm periodicidade declarada — inventar data para as demais seria fabricar
  obrigação

**AC-DASH-008-2 — dever sem relógio vigente é dito, não silenciado**

- **Dado** os deveres estaduais do RENAEST
- **Quando** aparecem no calendário
- **Então** o painel exibe "sem prazo normativo vigente" ([RN-DASH-113]) — a lacuna é do
  regulamento nunca editado, e mostrá-la é mais honesto que um prazo inventado

**AC-DASH-008-3 — os dois relógios da ouvidoria não se misturam**

- **Dado** uma manifestação em curso
- **Quando** os prazos são exibidos
- **Então** o de 30+30 ao usuário e o de 20+20 ao agente público interno aparecem separados
  ([RN-DASH-116]) — são deveres distintos com destinatários distintos

**AC-DASH-008-4 — o Pnatrans tem data certa**

- **Dado** o dever anual de divulgação do índice
- **Quando** o calendário é montado
- **Então** a data-limite é **30 de abril** ([RN-DASH-114]), com a meta anual de redução associada

**AC-DASH-008-5 — o repasse de 5% é contínuo, e por isso é conciliação**

- **Dado** o repasse ao FUNSET
- **Quando** é monitorado
- **Então** aparece como dever **contínuo sem periodicidade própria**, vigiado por conciliação e
  não por janela de calendário ([RN-DASH-112])

**AC-DASH-008-6 — o aviso de vencimento da CNH é dever estadual expresso**

- **Dado** condutores com CNH a vencer
- **Quando** faltam 30 dias
- **Então** o aviso eletrônico é devido ([RN-DASH-119]), e o painel mede a cobertura do envio

**AC-DASH-008-7 — a relação de medidores é dever de publicidade contínua**

- **Dado** o parque de medidores de velocidade
- **Quando** um equipamento entra em operação
- **Então** ele já consta da relação publicada ([RN-DASH-173]) — o estado `NAO_CUMPRIDO` nomeia
  **quais** equipamentos operam fora da relação, não apenas sinaliza divergência

## Regras aplicáveis

- [WF-DASH-002] (ciclo completo e tabela de prazos/timers)
- [WF-DASH-001] (relação entre proximidade de vencimento e alerta automático)
