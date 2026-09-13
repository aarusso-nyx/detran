---
id: UC-RAIT-018
title: Secretaria executiva do CETRAN-AM registra o recebimento do recurso de 2ª instância e devolve a decisão
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-901-2022, REF-CONTRAN-918]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria executiva do CETRAN-AM recebe o recurso de 2ª instância (do cidadão, já triado, ou da autoridade centralizada), registra a data de recebimento que arma o segundo relógio de 24 meses, e ao final devolve a decisão ao órgão autuador para comunicação e execução.

## Pré-condições

- Caso `instancia=cetran` criado por [UC-RAIT-009] (cidadão) ou [UC-RAIT-008] (autoridade).
- Integração ou canal formal com o CETRAN-AM disponível para registrar `data_recebimento_cetran` ([RN-RAIT-111]).

## Fluxo principal

1. Secretaria executiva recebe o processo com parecer e conclusão da JARI anexados de ofício ([RN-RAIT-117]).
2. Registra `data_recebimento_cetran`; evento `RAIT_RECURSO_RECEBIDO_JULGADOR` arma o `T-JUL-24M` do CETRAN-AM; caso em `DISTRIBUIDO` na fila F-C-0/F-J-1 do pool `cetran`.
3. Distribuição por sorteio ([UC-RAIT-014]) excluindo quem integrou a JARI e quem pertence ao órgão recorrente ([RN-RAIT-140]).
4. Após `JULGADO_SESSAO` e ata assinada ([UC-RAIT-020]), a secretaria devolve a decisão ao órgão autuador; caso passa a `COMUNICADO` → `TRANSITADO`; evento `RAIT_CASO_TRANSITADO` encerra a instância na infração ([WF-INF-003] #27/#28).

## Fluxos alternativos / exceções

- **2a.** Sem integração, o registro é manual a partir de ofício/protocolo do CETRAN-AM; o sistema exige evidência anexada (número do protocolo) e sinaliza o caso como "marco por comunicação manual".
- **4a.** Decisão favorável ao administrado com multa já paga: dispara restituição ([UC-RAIT-033]).

## Pós-condições

Recurso de 2ª instância com marco de recebimento registrado; decisão devolvida; instância encerrada na infração.

## Critérios de aceitação

**AC-RAIT-018-1 — o marco do CETRAN não é a data da remessa**

- **Dado** um recurso remetido em D1 e recebido em D3
- **Quando** o registro é feito
- **Então** `T-JUL-24M` do CETRAN conta de D3 ([RN-RAIT-111])

**AC-RAIT-018-2 — sem marco, o caso fica sinalizado**

- **Dado** um caso remetido sem `data_recebimento_cetran` após 10 dias
- **Quando** o gestor abre o radar
- **Então** o caso aparece como "cego" quanto ao relógio de 2ª instância

**AC-RAIT-018-3 — o CETRAN encerra a instância**

- **Dado** uma decisão do CETRAN-AM devolvida
- **Quando** o caso é comunicado
- **Então** o único destino é `TRANSITADO`; nenhum novo `REMETIDO_2A_INSTANCIA` é oferecido ([RN-RAIT-119])

## Regras aplicáveis

- [RN-RAIT-111] (24 meses no CETRAN)
- [RN-RAIT-117] (competência e parecer da JARI de ofício)
- [RN-RAIT-119] (encerramento da instância)
- [RN-RAIT-140] (impedimentos)
