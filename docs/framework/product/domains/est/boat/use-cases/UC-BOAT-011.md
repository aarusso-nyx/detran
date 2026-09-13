---
id: UC-BOAT-011
title: Sistema transmite à RENAEST e acompanha pendência de validação
status: reviewed
apps: [boat]
sources: [REF-CONTRAN-808-2020, WF-BOAT-001, WF-BOAT-003]
updated: 2026-09-13
---

## Ator e objetivo

Após o encerramento local ([UC-BOAT-005]), operador de processamento/autoridade acompanha o
sinistro pela cascata de validação em três níveis e pela submáquina nacional até a decisão
terminal (`CONSOLIDADO`/`REJEITADO`), agindo sobre pendências e retificações — complementa
[UC-BOAT-005] com a visão de **acompanhamento**, hoje ausente do corpus.

## Pré-condições

`CrashRecord` em `closed`/`integrated` ([UC-BOAT-005]); protocolo RENAEST associado.

## Fluxo principal

1. Sistema exibe o estado corrente do sinistro na cascata de validação ([WF-BOAT-003]):
   `RECEBIDO_LOCAL` → `VALIDACAO_MUNICIPAL` (se aplicável) → `VALIDACAO_ESTADUAL` →
   `ENVIADO_NACIONAL` → submáquina nacional (`RECEBIDO`/`EM_ANALISE`/`CONSOLIDADO`/`REJEITADO`).
2. Operador consulta pendências abertas: retificação solicitada por coordenador municipal/
   estadual ([UC-BOAT-009]), ou rejeição nacional por dados incompletos (`RENAEST.CRASH.
INCOMPLETE_DATA`, [RN-BOAT-002]).
3. Para pendência de retificação, operador complementa o registro local e reencaminha —
   mecanismo exato de reencaminhamento a partir de um nível intermediário **não normado**
   (PROPOSTA OPERACIONAL, mesmo padrão do `pending_complement` local).
4. Para rejeição nacional definitiva (`REJEITADO`), sistema mantém o estado como terminal —
   nenhuma norma prevê caminho de correção pós-terminal ([WF-BOAT-003] §Gap); operador é
   informado explicitamente de que eventual correção exigiria novo registro formal
   (PROPOSTA-PENDENTE-DE-NORMA).
5. Sistema mede, para fins de KPI operacional ([APP-BOAT] §KPIs), o tempo decorrido entre
   `closed` e `CONSOLIDADO`/`REJEITADO`, contra o SLA operacional proposto `T-BOAT-TRANSM`
   ([WF-BOAT-001] §Prazos) — sem consequência normativa formal por descumprimento.

## Fluxos alternativos / exceções

- **2a. Reenvio duplicado.** Reenvio da mesma tupla natural sem `Idempotency-Key` →
  `RENAEST.CRASH.DUPLICATED` (402) — não gera pendência nova, apenas rejeição técnica do reenvio.
- **4a. Registro permanece pendente além do SLA proposto.** Sem consequência normativa; sistema
  pode sinalizar atraso operacionalmente (alerta interno), nunca como extinção de direito ou
  prazo legal (distinto, por exemplo, dos relógios de extinção de [WF-RAIT-001] — este domínio
  não tem relógio de extinção normado).

## Pós-condições

Sinistro em estado terminal nacional (`CONSOLIDADO`/`REJEITADO`) com histórico de pendências e
retificações rastreável; ou em acompanhamento ativo, com pendência explícita visível ao operador.

## Critérios de aceitação

**AC-BOAT-011-1 — o operador vê a cascata inteira, não só o estado local**

- **Dado** um sinistro em trânsito pelos níveis
- **Quando** o operador o consulta
- **Então** vê `RECEBIDO_LOCAL` → validação municipal (se aplicável) → estadual → nacional, com o
  nível corrente destacado ([WF-BOAT-003])

**AC-BOAT-011-2 — a obrigação de integrar está vencida, e o painel não deixa esquecer**

- **Dado** o estado da integração ao RENAEST
- **Quando** o operador consulta
- **Então** o sistema apresenta a integração como **obrigação vencida desde 04/01/2022**
  ([RN-BOAT-108]) — não como funcionalidade opcional em avaliação

**AC-BOAT-011-3 — acesso do DETRAN-AM ao RENAEST é por caso de uso declarado**

- **Dado** uma consulta aos dados do registro nacional
- **Quando** é feita
- **Então** ocorre sob o regime de casos de uso e grupos de informação da Portaria 139/2025
  ([RN-BOAT-132]) — não há acesso amplo por perfil

**AC-BOAT-011-4 — divulgação estatística é agregada, e é federal**

- **Dado** um pedido de dado de sinistro para divulgação
- **Quando** é atendido
- **Então** o registro individual **não** é a fonte de divulgação ([RN-BOAT-130]); a publicação
  agregada tem limiar de célula a definir antes da primeira publicação ([RN-DASH-161], DT-029)

**AC-BOAT-011-5 — rejeição nacional definitiva é informada como terminal**

- **Dado** um registro `REJEITADO`
- **Quando** o operador o abre
- **Então** o sistema diz explicitamente que a correção exigiria novo registro formal e que **não
  há norma** prevendo o caminho — rotulado PENDENTE-DE-NORMA (DT-020)

## Regras aplicáveis

- [RN-BOAT-002] (gate de dados de vítima)
- [RN-BOAT-105] (Coordenador de RENAEST, herdada de [UC-BOAT-009])
- [RN-BOAT-106] (ausência de prazo legal por sinistro — periodicidade mensal como parâmetro do
  órgão, base do SLA `T-BOAT-TRANSM`)

**Atualização (2026-09-13).** Limiar de célula respondido pelo Owner (DT-029: supressão abaixo
de 10, com supressão secundária; [RN-DASH-161]); Manuais RENAEST pedidos à SENATRAN (ofício 04).
