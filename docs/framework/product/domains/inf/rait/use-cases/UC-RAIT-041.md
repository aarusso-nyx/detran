---
id: UC-RAIT-041
title: Processamento expede a notificação da penalidade após a decisão ou o decurso do prazo, registrando os marcos por canal
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

Área de processamento/notificação expede a NP quando a defesa é indeferida, não conhecida ou não apresentada, dentro do prazo de decadência, pelo canal de ciência do sujeito passivo, registrando expedição e ciência separadamente.

## Pré-condições

- Infração em `PENALIDADE_A_APLICAR` ([WF-INF-003]); decisão da autoridade ou `T-DEF` vencido; `T-DEC` aberto.

## Fluxo principal

1. Sistema monta a NP com o conteúdo do art. 12 da Res. 918: dados do art. 280 do CTB, comunicação do não acolhimento, valor e desconto, data-limite única de recurso/pagamento, autenticação, instruções.
2. Expede pelo canal: SNE (disponibilização = expedição; ciência ficta em 30 dias) ou postal (entrega à ECT = expedição); registra `data_expedicao`, `data_ciencia` e a data-limite impressa ([RN-RAIT-104]).
3. Infração passa a `NOTIFICADO_PENALIDADE`; `T-NP-VENC` armado; documento de arrecadação emitido ([UC-RAIT-032]).
4. Devolução por endereço desatualizado ou recusa vale como notificação (CTB art. 282 §1º); outras falhas permitem refazer o ato dentro dos prazos (918 art. 31) e, esgotadas as tentativas, edital ([RN-RAIT-126]).

## Fluxos alternativos / exceções

- **1a.** `T-DEC` vencido antes da expedição: bloqueio e declaração de decadência ([UC-RAIT-023]).
- **2a.** Sujeito passivo é condutor indicado: NP dirigida ao proprietário quando responsável pelo pagamento (CTB art. 282 §3º), com registro de ambos.
- **4a.** Refazimento após a decadência: bloqueado ([RN-RAIT-126]).

## Pós-condições

NP expedida com marcos registrados; prazo de recurso correndo; documento de arrecadação disponível.

## Critérios de aceitação

**AC-RAIT-041-1 — dois marcos por notificação**

- **Dado** uma NP pelo SNE
- **Quando** é expedida
- **Então** o caso guarda expedição e ciência ficta separadas, 30 dias apart

**AC-RAIT-041-2 — NP fora da decadência não sai**

- **Dado** um caso com `T-DEC` vencido
- **Quando** a expedição é tentada
- **Então** o sistema bloqueia e abre a tarefa de declaração

**AC-RAIT-041-3 — edital é residual**

- **Dado** uma NP com uma tentativa postal falha
- **Quando** o operador tenta edital
- **Então** o sistema exige tentativas esgotadas e não aderência ao SNE

## Regras aplicáveis

- [RN-RAIT-102] (prazo de recurso = vencimento)
- [RN-RAIT-104] (marcos por canal)
- [RN-RAIT-114] (decadência)
- [RN-RAIT-126] (edital e refazimento)
