---
id: UC-RAIT-017
title: Secretaria remete o recurso admitido à JARI com o dossiê de ofício e registra o recebimento
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria do órgão autuador remete à JARI o recurso tempestivo admitido, no prazo legal de 10 dias, com tudo o que o órgão já possui anexado de ofício; a secretaria da JARI registra o recebimento, que é o marco do relógio de 24 meses.

## Pré-condições

- Caso `instancia=jari` em `ADMITIDO` → `AGUARDANDO_REMESSA_JARI` ([WF-RAIT-001]); `T-REM10` armado.

## Fluxo principal

1. Sistema monta o dossiê de remessa: AIT, evidências do TEAT, NA/NP com marcos de ciência, decisão da defesa prévia e sua minuta, petição e anexos do recorrente, registro de admissibilidade — sem exigir nada do cidadão (CTB art. 285 §4º).
2. Secretaria confere e assina a remessa; caso segue na fila F-J-0 até o recebimento.
3. Secretaria da JARI registra o recebimento (`data_recebimento_jari`); caso passa a `DISTRIBUIDO` sem relator, na fila F-J-1; evento `RAIT_RECURSO_RECEBIDO_JULGADOR` arma `T-JUL-24M` e `T-PAR-3A` na infração ([WF-INF-003] #18).
4. Caso entra no próximo lote de sorteio ([UC-RAIT-014]).

## Fluxos alternativos / exceções

- **2a.** `T-REM10` vence sem remessa: alerta ao gestor e indicador `dias_ate_remessa` ([RN-RAIT-107]); não há sanção legal, mas o atraso empurra o início do relógio de prescrição.
- **1a.** Documento do órgão ausente (ex.: evidência não sincronizada do TEAT): abre tarefa ao órgão autuador, nunca ao recorrente ([RN-RAIT-003]).
- **3a.** Recurso recebido de órgão de outra UF (CTB art. 287): a tempestividade usa a data do protocolo de origem ([RN-RAIT-106]); remessa segue igual.

## Pós-condições

Caso em `DISTRIBUIDO` na JARI com data de recebimento registrada; dossiê completo de ofício; relógios da 2ª instância armados.

## Critérios de aceitação

**AC-RAIT-017-1 — a remessa nunca depende do cidadão**

- **Dado** um dossiê sem a decisão da defesa
- **Quando** a secretaria tenta remeter
- **Então** o sistema anexa de ofício ou abre tarefa interna; não pede ao recorrente

**AC-RAIT-017-2 — duas datas distintas são registradas**

- **Dado** um recurso interposto em D1 e recebido pela JARI em D2
- **Quando** o recebimento é registrado
- **Então** `T-JUL-24M` conta de D2 e `T-REM10` é medido de D1 ([RN-RAIT-110])

**AC-RAIT-017-3 — atraso de remessa é visível**

- **Dado** um caso com `T-REM10` vencido
- **Quando** o gestor abre o radar
- **Então** o caso aparece com o atraso de remessa destacado, separado do risco de prescrição

## Regras aplicáveis

- [RN-RAIT-107] (remessa em 10 dias)
- [RN-RAIT-110] (marco do relógio de 24 meses)
- [RN-RAIT-003], [RN-RAIT-122] (documentos de ofício)
- [RN-RAIT-106] (marco por canal)
