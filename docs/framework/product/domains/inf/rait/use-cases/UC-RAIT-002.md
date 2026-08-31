---
id: UC-RAIT-002
title: Analista realiza juízo de admissibilidade
status: approved
apps: [rait]
sources: [REF-CONTRAN-900]
updated: 2026-08-26
---

## Ator e objetivo

Analista (ou secretaria, conforme o desenho local) verifica se o caso protocolado preenche os
quatro requisitos de admissibilidade antes de qualquer análise de mérito, evitando que
recursos manifestamente inadmissíveis consumam capacidade de instrução/julgamento.

## Pré-condições

Caso em `PROTOCOLADO` ([WF-RAIT-001]).

## Fluxo principal

1. Analista abre o caso a partir da fila de triagem.
2. Sistema calcula tempestividade automaticamente via motor de prazos único ([RN-RAIT-005]) —
   compara data de protocolo contra o prazo aplicável ao tipo de pleito (30 dias defesa; até o
   vencimento da NP para recurso JARI; 30 dias para recurso CETRAN).
3. Analista confere os demais critérios: legitimidade da parte (proprietário, condutor
   identificado, embarcador/transportador responsável, ou procurador habilitado); presença de
   assinatura; existência de pedido compatível com os fatos ([RN-RAIT-001], CONTRAN-900 art.4º).
4. Se todos os critérios são atendidos → caso passa a `ADMITIDO`.
5. Se qualquer critério falha → caso passa a `NAO_CONHECIDO`, com motivo registrado (um dos
   quatro incisos do art.4º).
6. Em ambos os casos, o caso segue para comunicação ao requerente ([UC-RAIT-007]).

## Fluxos alternativos / exceções

- **2a.** Prazo calculado cai em dia não útil: vencimento é prorrogado ao 1º dia útil seguinte
  antes do cálculo de tempestividade ([RN-RAIT-005]).
- **3a.** Falta documento emitido pelo próprio órgão autuador (NA/NP/AIT): não pode ser
  motivo de não-conhecimento — o RAIT anexa de ofício ([RN-RAIT-003]).
- **5a.** Não-conhecimento por intempestividade em `instancia=jari`: recurso intempestivo é
  arquivado por força de lei (CTB art.285 §5º), sem efeito suspensivo desde a interposição
  ([RN-RAIT-109], CTB art.285 §§1º e 5º).

## Pós-condições

Caso em `ADMITIDO` (segue para [UC-RAIT-003]/distribuição) ou `NAO_CONHECIDO` (segue
diretamente para comunicação), com motivo de decisão registrado no dossiê.

## Critérios de aceitação

**AC-RAIT-002-1 — tempestividade é calculada, nunca digitada**

- **Dado** um caso em `PROTOCOLADO`
- **Quando** o analista abre a triagem
- **Então** o sistema apresenta o veredito de tempestividade produzido pelo motor de prazos único ([RN-RAIT-005]) com o cálculo visível (termo inicial, prazo aplicável, vencimento), e não oferece campo editável para o veredito

**AC-RAIT-002-2 — vencimento em dia não útil prorroga antes do juízo**

- **Dado** um prazo cujo vencimento calculado cai em sábado, domingo ou feriado nacional ou estadual do AM
- **Quando** a tempestividade é avaliada
- **Então** o vencimento é prorrogado ao 1º dia útil seguinte **antes** da comparação ([RN-RAIT-005], CONTRAN-918 art.29), e um protocolo feito nesse dia é tempestivo

**AC-RAIT-002-3 — os quatro critérios são registrados individualmente**

- **Dado** um caso em `TRIAGEM_ADMISSIBILIDADE`
- **Quando** o analista conclui o juízo
- **Então** o sistema exige veredito explícito para cada um dos quatro critérios do art.4º (tempestividade, legitimidade, assinatura, pedido compatível — [RN-RAIT-001], [RN-RAIT-120]), e o motivo de `NAO_CONHECIDO` é sempre um desses incisos

**AC-RAIT-002-4 — documento do próprio órgão nunca reprova a admissibilidade**

- **Dado** um caso cujo dossiê não contém a NA, a NP ou o AIT
- **Quando** o analista tenta registrar não-conhecimento por ausência desse documento
- **Então** o sistema recusa o motivo e abre tarefa de anexação de ofício ([RN-RAIT-003]) — a falta de peça produzida pelo órgão não é fundamento de inadmissibilidade

**AC-RAIT-002-5 — o intempestivo não ganha efeito suspensivo, e é arquivado**

- **Dado** um caso `instancia=jari` julgado intempestivo na triagem
- **Quando** o não-conhecimento é registrado
- **Então** o caso termina em `NAO_CONHECIDO` com `motivo_nao_conhecimento='intempestivo'` e `arquivado=true`, `efeito_suspensivo=false` desde a interposição ([RN-RAIT-109], CTB art.285 §§1º e 5º), e **não** é distribuído a relator

**AC-RAIT-002-6 — admissão instaura o efeito suspensivo**

- **Dado** um recurso tempestivo de parte legítima
- **Quando** o caso passa a `ADMITIDO`
- **Então** o sistema publica `RAIT_EFEITO_SUSPENSIVO_INSTAURADO` ([RN-RAIT-108]), bloqueando restrições derivadas da penalidade enquanto o caso tramita

**AC-RAIT-002-7 — órgão incompetente devolve o prazo, não arquiva**

- **Dado** um pleito protocolado perante órgão diverso do competente
- **Quando** a incompetência é identificada na triagem
- **Então** o sistema abre tarefa de redirecionamento ao órgão competente com **devolução do prazo** ([RN-RAIT-109], Lei 9.784 art.63 §1º), e não registra não-conhecimento

## Regras aplicáveis

- [RN-RAIT-001] (juízo de admissibilidade precede o mérito)
- [RN-RAIT-003] (vedado exigir documento próprio do órgão)
- [RN-RAIT-005] (contagem de prazos)
