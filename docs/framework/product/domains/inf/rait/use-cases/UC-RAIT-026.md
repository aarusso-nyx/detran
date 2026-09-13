---
id: UC-RAIT-026
title: Tratar impedimento declarado ou suspeição arguida
status: draft
apps: [rait]
sources: [REF-LEI-9784-1999, REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-12
---

## Ator e objetivo

Membro (declara impedimento) ou interessado (argui suspeição) provoca a verificação de quem pode atuar no caso; o presidente decide a suspeição e o sistema redistribui, com registro que vale para sorteios e bancas futuras.

## Pré-condições

- Caso com responsável designado (`DISTRIBUIDO`, `EM_INSTRUCAO`, `DILIGENCIA`, `PRONTO_P_DECISAO`, `PAUTADO`).

## Fluxo principal

1. Membro declara impedimento (hipóteses de [RN-RAIT-140]) ou interessado protocola arguição de suspeição pelo Portal/balcão.
2. Impedimento declarado: o sistema registra `rait_impediment` com tipo e fundamento e redistribui de imediato ([UC-RAIT-011]), sem aproveitar trabalho de mérito.
3. Suspeição arguida: presidente (ou autoridade, no 1º circuito) decide em prazo interno (proposta: 5 dias úteis); deferida → redistribuição; indeferida → recurso do interessado sem efeito suspensivo (Lei 9.784 art. 21), caso segue.
4. Registro passa a excluir o membro do caso em sorteios e da contagem de quorum do item na sessão ([UC-RAIT-015]).

## Fluxos alternativos / exceções

- **1a.** Impedimento percebido só na sessão: membro se abstém, quorum do item é recontado; se cair abaixo da maioria, item retirado ([UC-RAIT-015] 4a).
- **3a.** Arguição manifestamente protelatória (repetida, sem fato novo): indeferida de plano com registro; não interrompe a pauta.
- **2a.** Omissão do dever de declarar impedimento descoberta depois: registro para apuração disciplinar (Lei 9.784 art. 19 p.ú.); decisão não é reaberta por esse fato isolado (Owner C.22), salvo recurso cabível.

## Pós-condições

Impedimento/suspeição registrados por caso; responsável substituído quando cabível; efeito sobre sorteio e quorum aplicado.

## Critérios de aceitação

**AC-RAIT-026-1 — impedimento exclui do caso, não do pool**

- **Dado** um membro impedido no caso X
- **Quando** o próximo lote é sorteado
- **Então** o membro continua elegível para os demais casos

**AC-RAIT-026-2 — suspeição tem decisão e prazo**

- **Dado** uma arguição protocolada
- **Quando** 5 dias úteis se passam
- **Então** a decisão está registrada ou o caso aparece em alerta ao presidente

**AC-RAIT-026-3 — nada do impedido é reaproveitado**

- **Dado** um relator que declara impedimento após iniciar a leitura
- **Quando** o caso é redistribuído
- **Então** nenhuma anotação de mérito dele fica visível ao novo relator

## Regras aplicáveis

- [RN-RAIT-140] (impedimento e suspeição)
- [RN-RAIT-141] (redistribuição impessoal)
- [RN-RAIT-142] (quorum por item)
