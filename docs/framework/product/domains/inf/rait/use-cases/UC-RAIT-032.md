---
id: UC-RAIT-032
title: Sistema emite e atualiza o documento de arrecadação conforme a fase do processo
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

O módulo de pagamento gera o documento próprio de arrecadação estabelecido pelo órgão máximo executivo de trânsito da União com o valor correto para a fase: 80% até o vencimento, 60% com reconhecimento nas condições legais, valor original com juros após o encerramento da instância — e o atualiza a cada transição.

## Pré-condições

- Infração em `NOTIFICADO_PENALIDADE` ou `INSTANCIA_ENCERRADA`; valor original e faixas calculados ([RN-RAIT-127], [RN-RAIT-128]).

## Fluxo principal

1. Na expedição da NP, o sistema emite o documento com 80% até a data-limite única e a informação do desconto (918 art. 12 III).
2. Se o infrator reconhece a infração nas condições do art. 284 §1º (adesão ao SNE antes do envio da NA, renúncia a defesa e recurso — termo digital do Portal, DT-026), emite documento com 60% e o pagamento encerra a instância (290 III).
3. Enquanto pende recurso admitido, nenhum juros nem restrição; o documento de 80% permanece válido até a data-limite; após ela, sem recurso, o valor passa a original + juros (918 arts. 22-23) a partir do marco de [RN-RAIT-128].
4. Após o encerramento da instância, o documento é reemitido com Selic + 1% e disponibilizado no Portal e no SNE (931 art. 9º §1º III).

## Fluxos alternativos / exceções

- **2a.** Emissão do documento de 60% para órgão não aderente ao SNE: caminho **não construído** (DT-012) — o sistema registra a elegibilidade e bloqueia a emissão até decisão.
- **3a.** Recurso intempestivo: juros desde o vencimento da NP (918 art. 23 §5º).
- **1a.** Pagamento antecipado antes da NP (918 art. 33): NP expedida com a informação de multa paga, sem código de barras, com prazo de recurso.

## Pós-condições

Documento de arrecadação correto para a fase; valores com truncamento de duas casas; repasse ao FUNSET garantido pelo documento padrão.

## Critérios de aceitação

**AC-RAIT-032-1 — uma só data-limite**

- **Dado** uma NP expedida
- **Quando** o documento é emitido
- **Então** a data de vencimento é a mesma data-limite de recurso

**AC-RAIT-032-2 — juros só após o encerramento**

- **Dado** um recurso tempestivo pendente
- **Quando** o vencimento passa
- **Então** o documento não acrescenta juros até a instância encerrar

**AC-RAIT-032-3 — truncamento sem arredondamento**

- **Dado** um valor com Selic acumulada
- **Quando** o documento é gerado
- **Então** duas casas decimais, truncadas ([RN-RAIT-128])

## Regras aplicáveis

- [RN-RAIT-127] (faixas 80/60)
- [RN-RAIT-128] (juros e marco)
- [RN-RAIT-129] (pagamento antecipado)
- [RN-PORTAL-125] (o que o Portal pode fazer no pagamento)
