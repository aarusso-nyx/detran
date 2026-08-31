---
id: UC-RAIT-011
title: Reatribuir caso por afastamento, impedimento ou rebalanceamento
status: approved
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-08-26
---

## Ator e objetivo

Coordenador do pool ou gestor RAIT move um ou mais casos de um responsável (analista ou
relator) para outro, por impedimento declarado, afastamento, sobrecarga, ou risco de
prescrição por inércia individual.

## Pré-condições

Caso em `DISTRIBUIDO`, `EM_INSTRUCAO` ou `DILIGENCIA`, com responsável identificado.

## Fluxo principal

1. Gatilho de reatribuição ocorre por um dos motivos: (a) impedimento declarado pelo próprio
   responsável ([UC-RAIT-004] fluxo 2a); (b) responsável passa a `AFASTADO_TEMP`
   ([WF-RAIT-002] §5 — reincidência em atraso, ou faltas injustificadas, CONTRAN-357 item
   7.3); (c) rebalanceamento de carga decidido pelo coordenador; (d) escalonamento por risco
   de prescrição ([UC-RAIT-010]).
2. Sistema remove o caso do responsável atual e aplica a estratégia de distribuição
   configurada para o pool ([WF-RAIT-002] §2) para escolher o novo responsável.
3. Trabalho já registrado (instrução, diligências abertas) é preservado no dossiê — a
   reatribuição não reinicia o caso, apenas troca o responsável.
4. Novo responsável é notificado; caso permanece no mesmo estado ([WF-RAIT-001]).

## Fluxos alternativos / exceções

- **1a.** Reatribuição em massa por afastamento de um relator (ex.: fim de mandato — CONTRAN-357
  item 7.1): todos os casos abertos daquele relator são redistribuídos em lote, priorizando os
  de maior risco de prescrição primeiro.
- **2a.** Pool sem membros disponíveis (todos afastados/impedidos para o caso específico):
  escala como incidente de capacidade ao gestor RAIT ([UC-RAIT-010]).

## Pós-condições

Caso permanece no mesmo estado do ciclo de vida, com novo responsável designado; histórico de
reatribuição registrado no dossiê (auditabilidade).

## Critérios de aceitação

**AC-RAIT-011-1 — reatribuir preserva o trabalho e o estado**

- **Dado** um caso em `EM_INSTRUCAO` ou `DILIGENCIA` com instrução parcial e diligências abertas
- **Quando** é reatribuído
- **Então** o caso permanece no mesmo estado, as diligências abertas seguem correndo com seus prazos originais, e nada do dossiê é descartado

**AC-RAIT-011-2 — o motivo da reatribuição é obrigatório e tipado**

- **Dado** uma reatribuição
- **Quando** registrada
- **Então** exige motivo em {`impedimento`, `afastamento`, `rebalanceamento`, `risco_prescricao`} e fica no histórico do caso, auditável

**AC-RAIT-011-3 — o novo responsável sai da estratégia do pool**

- **Dado** um caso removido do responsável atual
- **Quando** o sistema escolhe o novo responsável
- **Então** aplica a estratégia configurada do pool ([WF-RAIT-002] §2) e nunca devolve o caso a quem declarou impedimento nele

**AC-RAIT-011-4 — reatribuição em massa prioriza risco**

- **Dado** um relator com mandato encerrado e N casos abertos
- **Quando** a reatribuição em lote é executada
- **Então** os casos são redistribuídos em ordem decrescente de risco de prescrição

**AC-RAIT-011-5 — pool esgotado vira incidente de capacidade**

- **Dado** um caso cujo pool não tem membro elegível (todos afastados ou impedidos para ele)
- **Quando** a reatribuição é tentada
- **Então** o sistema escala incidente de capacidade ao gestor RAIT ([UC-RAIT-010]) em vez de deixar o caso sem responsável silenciosamente

## Regras aplicáveis

- [RN-RAIT-116] (impedimentos e perda de mandato — CONTRAN-357 itens 5 e 7.3)
- Referência: [WF-RAIT-002] §5 (estados do responsável)
