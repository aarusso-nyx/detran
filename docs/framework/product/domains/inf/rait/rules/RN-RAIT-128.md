---
id: RN-RAIT-128
title: Encargos moratórios — o marco inicial dos juros depende da tempestividade do recurso
status: draft
apps: [portal, rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** Juros de mora **não incidem** enquanto não encerrada a instância administrativa. O marco
inicial da incidência varia conforme o comportamento processual:

| Situação                                                     | Marco inicial dos juros                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **Recurso interposto no prazo legal e julgado improcedente** | A partir do **encerramento da instância administrativa** ([RN-RAIT-119]) |
| **Recurso interposto fora do prazo legal**                   | A partir do **vencimento da NP**                                         |
| Sem recurso, multa não paga até o vencimento                 | A partir do encerramento da instância (art. 284 §4º c/c art. 290, II)    |

Cálculo: entre o dia seguinte ao vencimento e o último dia do mês seguinte ao do vencimento, valor
original × 1,01 (juros de 1% do mês de pagamento). Após o mês subsequente ao vencimento, valor
original × fator multiplicador, sendo o fator = 1,01 + somatório dos percentuais mensais da SELIC do
período (incluir o mês subsequente ao vencimento, excluir o mês do pagamento), com duas casas
decimais, desprezadas as demais **sem arredondamento**.

**Base legal.**

- [REF-CTB-280-290] art. 284 §3º (não incidência de cobrança moratória enquanto não encerrada a
  instância) e §4º (juros SELIC + 1% após o encerramento).
- [REF-CONTRAN-918] art. 22 (fórmula do 1º mês) e art. 23, _caput_ e incisos I a III (fórmula SELIC),
  §1º (manutenção do cálculo pelo órgão arrecadador, duas casas, sem arredondamento), §2º (1% fixo do
  mês de pagamento), §3º (orientação ao devedor na NP).
- [REF-CONTRAN-918] art. 23 §4º: _"Interposto recurso no prazo legal, se julgado improcedente, a
  incidência de juros de mora deverá ser considerada a partir do encerramento da instância
  administrativa."_
- [REF-CONTRAN-918] art. 23 §5º: _"A interposição do recurso fora do prazo legal ensejará a cobrança
  de juros de mora a partir do vencimento da NP."_
- [REF-CONTRAN-918] art. 19: sujeitam-se ao art. 284 §4º do CTB **apenas os AIT lavrados a partir de
  1º de novembro de 2016** (regra de corte para acervo histórico).

**Verificação.** O cálculo de encargos é derivado de `estado_instancia` ([RN-RAIT-119]) e de
`recurso_tempestivo` ([RN-RAIT-109]), nunca da simples existência de recurso. O RAIT publica ao
módulo de cobrança o evento de encerramento com o **marco inicial** aplicável, e o PORTAL exibe o
valor atualizado com a data-base do cálculo.

**Coerência com o efeito suspensivo.** Esta regra é a face financeira de [RN-RAIT-108]: recurso
intempestivo não tem efeito suspensivo, e é exatamente por isso que os juros correm desde o
vencimento da NP.
