---
id: UC-DASH-005
title: Gestor compara desempenho entre unidades/circuitos
status: reviewed
apps: [dashboard, rait, pec, boat, teat]
sources: [APP-DASHBOARD, WF-RAIT-002]
updated: 2026-08-31
---

## Ator e objetivo

Gestor DETRAN (visão cross-tenant, `shared/actors.md`) quer comparar desempenho entre pools,
circuitos, unidades ou clínicas credenciadas — para identificar onde investir capacidade ou onde
há um problema estrutural, não apenas um caso isolado.

## Pré-condições

- Existem pelo menos dois grupos comparáveis (ex. pools `defesa_previa`/`jari`/`cetran` do RAIT,
  [WF-RAIT-002] §1; clínicas credenciadas do PEC; municípios integrados/não integrados ao SNT do
  BOAT).

## Fluxo principal

1. Gestor abre a visão comparativa e seleciona a dimensão (pool, circuito, unidade, clínica).
2. Sistema agrega, por grupo: distribuição do acervo por faixa de risco (`SEM_RISCO`..`CRITICO`),
   % dentro da meta operacional (ex. IND-DASH-304/305), MTTA/MTTR de alertas ([WF-DASH-001]), %
   de deveres periódicos cumpridos no prazo quando aplicável ao grupo.
3. Gestor ordena por qualquer coluna para identificar outliers (ex. pool com maior % de casos em
   N3/CRÍTICO, clínica com maior atraso médio de designação de junta).
4. Gestor aciona o Gestor de área do grupo destacado para investigação (ver [UC-DASH-002] para o
   ciclo de tratamento de um alerta específico).

## Fluxos alternativos / exceções

- **Grupo com fonte parcialmente conectada**: sistema exibe o grupo com nota "comparação parcial
  — indicador X sem fonte conectada", nunca completando com zero implícito.
- **Comparação carrega meta ≠ teto legal**: painel nunca mistura, na mesma métrica, indicadores
  de meta operacional (bloco C) com indicadores de teto legal (bloco A) — são exibidos em
  colunas/seções distintas, mesma disciplina de [RN-RAIT-110] §Distinção obrigatória na
  comunicação.

## Pós-condições

- Gestor tem visão priorizada de onde a operação está sob maior risco estrutural, com base em
  dados agregados e auditáveis, não em impressão anedótica.

## Critérios de aceitação

**AC-DASH-005-1 — comparar unidades não pode reidentificar pessoas**

- **Dado** um recorte por município, ano e gravidade
- **Quando** a célula fica pequena
- **Então** é suprimida antes de ser exibida ([RN-DASH-161]) — em municípios pequenos do AM essa
  combinação é, na prática, um identificador, e o risco foi classificado como ALTO

**AC-DASH-005-2 — agregado não é automaticamente anônimo**

- **Dado** um painel agregado
- **Quando** sua exposição é decidida
- **Então** o teste é a **reversibilidade** (art. 12 da LGPD, [RN-DASH-160]), não a mera presença
  de uma função de agregação

**AC-DASH-005-3 — dado de saúde exige ambiente controlado**

- **Dado** um indicador que envolva dado de saúde de vítima
- **Quando** é servido
- **Então** opera sob o regime do art. 13 — ambiente controlado, pseudonimização
  ([RN-DASH-162]) — e nunca compõe painel de acesso amplo

**AC-DASH-005-4 — comparar é diagnosticar, não ranquear pessoas**

- **Dado** a visão comparativa
- **Quando** exibe outliers
- **Então** a unidade de comparação é pool, circuito, unidade ou clínica ([UC-DASH-005] passo 1) —
  o painel não produz ranking individual de servidor a partir de indicador de acervo

**AC-DASH-005-5 — meta operacional e teto legal ficam em colunas distintas**

- **Dado** um grupo comparado
- **Quando** seus números aparecem
- **Então** aderência a SLA e risco de extinção são grandezas separadas — o mesmo princípio de
  [WF-RAIT-002] §4.5, aplicado à visão de gestão

## Regras aplicáveis

- [WF-RAIT-002] §1 (pools), §4 (escada de SLA, base da agregação de faixa de risco)
- [WF-DASH-001] (fonte do MTTA/MTTR)
- [WF-DASH-002] (fonte do % de deveres cumpridos)
