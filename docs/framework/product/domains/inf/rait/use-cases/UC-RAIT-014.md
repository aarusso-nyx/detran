---
id: UC-RAIT-014
title: Secretaria executa o sorteio de relatores em lote e o presidente homologa a ata
status: draft
apps: [rait]
sources:
  [
    REF-CONTRAN-357,
    REF-CONTRAN-901-2022,
    REF-LEI-9784-1999,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria da JARI (ou do CETRAN-AM) distribui a relatores, por sorteio registrado, os recursos
recebidos desde o último lote; o presidente homologa a ata de distribuição.

## Pré-condições

- Casos em `DISTRIBUIDO` sem relator (fila F-J-1 de [WF-RAIT-004]), com `data_recebimento` do órgão
  julgador registrada ([RN-RAIT-110], [RN-RAIT-111]).
- Escala do período publicada ([UC-RAIT-013]).

## Fluxo principal

1. Secretaria abre o lote (`LOTE_ABERTO`); sistema lista os casos na ordem única de consumo e os
   membros elegíveis (`ATIVO` e `DISPONIVEL`/`EM_PLANTAO`, titulares primeiro).
2. Sistema exclui, por caso, membros impedidos ou suspeitos ([RN-RAIT-140]) — inclusive quem lavrou
   o AIT e, no CETRAN-AM, quem integrou a JARI.
3. Sistema executa o round-robin com ordem inicial aleatória e ponderação por carga aberta, aplica a
   prevenção (mesmo requerente no lote → mesmo relator) e gera a ata (lote, semente, ordem, membro
   por caso) → `LOTE_SORTEADO`.
4. Presidente confere e assina a ata (PAdES+TSA); casos passam a `EM_INSTRUCAO` com relator e
   `T-VOTO` armado; relatores são notificados com prazo `T-CLAIM` para aceitar.
5. Aceites registrados → `LOTE_ACEITO`.

## Fluxos alternativos / exceções

- **3a.** Nenhum membro elegível para um caso (todos impedidos/ausentes): caso fica fora do lote
  e abre incidente de capacidade ao gestor ([UC-RAIT-011] 2a).
- **4a.** Relator declara impedimento ou suspeição em `T-CLAIM`: caso é redistribuído ao próximo da
  ordem do mesmo lote, com registro, sem novo sorteio.
- **4b.** `T-CLAIM` vence sem aceite: sistema redistribui ao próximo da ordem e registra o silêncio
  no perfil do relator.
- **1a.** Caso recebido com bandeira `ALERTA_N3`/`CRITICO`: entra em lote extraordinário imediato ao
  membro elegível de menor carga, sem esperar o ciclo semanal.

## Pós-condições

Todos os casos do lote com relator aceito; ata publicada no processo; `T-VOTO` correndo.

## Critérios de aceitação

**AC-RAIT-014-1 — o sorteio é reproduzível e assinado**

- **Dado** um lote sorteado
- **Quando** a ata é consultada
- **Então** ela contém semente, ordem inicial, carga considerada e o resultado por caso, e está assinada pelo presidente

**AC-RAIT-014-2 — impedido não entra no sorteio do caso**

- **Dado** um membro que lavrou o AIT de um caso do lote
- **Quando** o sorteio roda
- **Então** o membro é excluído daquele caso, permanece elegível para os demais, e a exclusão fica na ata

**AC-RAIT-014-3 — silêncio no prazo de aceite redistribui**

- **Dado** um caso sorteado sem aceite em `T-CLAIM`
- **Quando** o prazo vence
- **Então** o caso passa ao próximo da ordem do lote e o evento é registrado

**AC-RAIT-014-4 — risco não espera o ciclo**

- **Dado** um caso recebido em `CRITICO`
- **Quando** entra na fila F-J-1
- **Então** é distribuído em lote extraordinário no mesmo dia útil

## Regras aplicáveis

- [RN-RAIT-140] (impedimento e suspeição)
- [RN-RAIT-141] (distribuição impessoal e auditável)
- [RN-RAIT-142] (suplência)
- [RN-RAIT-110], [RN-RAIT-111] (marco do relógio de 24 meses)
