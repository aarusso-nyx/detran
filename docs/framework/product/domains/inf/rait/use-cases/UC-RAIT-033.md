---
id: UC-RAIT-033
title: Sistema dispara a restituição corrigida quando o provimento ou a extinção alcança multa já paga
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-09-12
---

## Ator e objetivo

Ao registrar decisão favorável ao administrado ou extinção da punibilidade sobre infração com pagamento registrado, o sistema abre automaticamente o processo de restituição atualizada — evento de sistema, não requerimento do cidadão — e o encaminha à área financeira (Fazenda/tesouraria do órgão).

## Pré-condições

- Infração em `CANCELADO_DEFINITIVO`, `AIT_CANCELADO`, `EXTINTO_DECADENCIA` ou `EXTINTO_PRESCRICAO` com `pago=true` ([WF-INF-003] §4).

## Fluxo principal

1. Evento `RESTITUICAO_DEVIDA` é publicado com valor pago, data do pagamento e faixa aplicada.
2. Sistema calcula a atualização pelo índice definido (IPCA-E, DT-013, sem parecer fazendário formal) do pagamento até a data da ordem.
3. Área financeira recebe a ordem de restituição com os dados bancários informados pelo titular no Portal; o cidadão é notificado do direito e do andamento.
4. Restituição paga → evento registrado no caso; Portal exibe "restituído".

## Fluxos alternativos / exceções

- **3a.** Dados bancários ausentes: notificação ao titular pelo canal de ciência com solicitação; a obrigação não expira pelo silêncio, fica pendente com alerta.
- **2a.** Índice de correção alterado por decisão fazendária: parâmetro versionado; cálculo mostra o índice usado.
- **1a.** Pagamento com reconhecimento (60%) e posterior anulação de ofício não é hipótese modelada (Owner C.22).

## Pós-condições

Ordem de restituição emitida e acompanhada; valor atualizado; cidadão informado.

## Critérios de aceitação

**AC-RAIT-033-1 — a restituição não depende de pedido**

- **Dado** um provimento com pagamento registrado
- **Quando** a decisão é comunicada
- **Então** a ordem de restituição já existe no mesmo ato

**AC-RAIT-033-2 — o índice é visível**

- **Dado** uma restituição calculada
- **Quando** o cidadão consulta
- **Então** vê valor pago, índice, período e valor atualizado

## Regras aplicáveis

- [RN-RAIT-129] (restituição obrigatória e corrigida)
- [RN-PORTAL-127] (recorrer não exige recolher)
