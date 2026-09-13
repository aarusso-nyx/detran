---
id: UC-RAIT-029
title: Sistema espelha o estado do processo no RENAINF por meio do senatran-adapter
status: draft
apps: [rait, teat]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-09-12
---

## Ator e objetivo

O agregado da infração publica, a cada transição relevante, a situação do processo administrativo ao registro nacional (RENAINF) pelo senatran-adapter, único ponto de contato com a API nacional (ADR-0003), usando o mapeamento de [WF-INF-003] §8.

## Pré-condições

- Infração com código RENAINF ([RN-TEAT-116]); adapter configurado (`SENATRAN_PROVIDER=mock|real`).
- Evento de domínio publicado ([WF-INF-003] §6 ou [WF-RAIT-001] §Eventos).

## Fluxo principal

1. Evento (`RAIT_CASO_PROTOCOLADO`, `RAIT_DECISAO_PUBLICADA`, `RAIT_CASO_TRANSITADO`, `CONDUTOR_INDICADO`, `PENALIDADE_DEFINITIVA` etc.) é traduzido para a situação nacional correspondente (`AUTUACAO_ABERTA`, `DEFESA_APRESENTADA`, `JARI_PROVIDO`, `DECISAO_FINAL`, `ARQUIVADO`…).
2. Adapter envia a atualização com idempotência e registra o recibo nacional no caso.
3. Divergência entre o estado local e o retornado pelo RENAINF abre tarefa de conciliação ao operador de integração ([UC-RAIT-031]).
4. Consultas do Portal e do TEAT usam o espelho local com `consultado_em` e `fonte` ([RN-PORTAL-117]).

## Fluxos alternativos / exceções

- **1a.** Estado local sem equivalente nacional (ex.: `AGUARDANDO_RECURSO_2A`, `EXTINTO_DECADENCIA`): mantém a última situação nacional válida e registra a lacuna para o contrato real (WF-INF-003 §8).
- **2a.** Falha de envio: fila de retransmissão com backoff; o processo local nunca é bloqueado por falha nacional.

## Pós-condições

Situação nacional atualizada e conciliada; recibos registrados; lacunas de vocabulário documentadas.

## Critérios de aceitação

**AC-RAIT-029-1 — nenhum módulo fala com o RENAINF diretamente**

- **Dado** um evento de decisão
- **Quando** é publicado
- **Então** só o senatran-adapter emite a chamada nacional; a verificação de fronteira do CI passa

**AC-RAIT-029-2 — a atualização é idempotente**

- **Dado** o mesmo evento reenviado
- **Quando** o adapter processa
- **Então** o RENAINF recebe uma única atualização e o recibo é o mesmo

**AC-RAIT-029-3 — falha nacional não trava o processo**

- **Dado** o RENAINF indisponível
- **Quando** uma decisão é comunicada
- **Então** o caso avança localmente e a atualização fica em retransmissão

## Regras aplicáveis

- [RN-TEAT-116] (código RENAINF no AIT)
- [RN-PORTAL-117] (consulta informativa)
- [RN-PORTAL-121] (propagação de correções ao RENAINF)
