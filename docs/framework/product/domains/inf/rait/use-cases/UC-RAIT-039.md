---
id: UC-RAIT-039
title: Gestor constitui nova turma ou JARI e designa o coordenador de JARIs
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-12
---

## Ator e objetivo

Gestor RAIT, com o dirigente do órgão, constitui uma unidade adicional de julgamento (turma da JARI ou nova JARI) quando a capacidade é insuficiente para julgar no prazo legal, providencia nomeações, regimento e coordenador, e ativa a unidade no sistema.

## Pré-condições

- Gatilho de capacidade de [WF-RAIT-004] §8 atingido ([RN-RAIT-139]); decisão do dirigente.

## Fluxo principal

1. Gestor abre `TURMA_EM_CONSTITUICAO` com o dimensionamento (recursos/mês, capacidade atual, fila projetada) e a composição pretendida (≥3 integrantes por categoria da Res. 357).
2. Gabinete providencia nomeações ([UC-RAIT-037]) e o regimento é cadastrado no CETRAN-AM (357 item 9.1.b); coordenador de JARIs designado (357 item 2.3).
3. Sistema cria a unidade, o pool associado e a distribuição em dois níveis (entre turmas, depois entre relatores — [WF-RAIT-004] §7); calendário de sessões da nova turma publicado.
4. Unidade ativada (`TURMA_ATIVA`); lotes seguintes já a incluem.

## Fluxos alternativos / exceções

- **2a.** Composição incompleta: unidade permanece em constituição; sem efeito na distribuição.
- **4a.** Divergência de entendimento entre turmas: mecanismo de uniformização (plenário/coordenador) **(pendente regimento)**; registrado no backlog.
- **1a.** Alternativa de reforço da composição existente (benchmark Porto Velho): registrada como opção, decisão do dirigente.

## Pós-condições

Unidade ativa com composição válida, coordenador designado, distribuição em dois níveis funcionando.

## Critérios de aceitação

**AC-RAIT-039-1 — unidade só recebe casos quando ativa**

- **Dado** uma turma em constituição
- **Quando** um lote é sorteado
- **Então** nenhum caso vai à turma

**AC-RAIT-039-2 — coordenador é obrigatório com duas ou mais unidades**

- **Dado** a segunda turma é ativada
- **Quando** sem coordenador designado
- **Então** o sistema bloqueia a ativação e cita o item 2.3 da Res. 357

## Regras aplicáveis

- [RN-RAIT-139] (quantidade de JARI e coordenador)
- [RN-RAIT-116] (composição)
- [RN-RAIT-141] (distribuição entre turmas registrada)
