# R-0041 — reavaliação nativa em 0e26c795

Produto e configuração: `a97e6def6cc4b80d65c5ab0ee9579241f0b33446`. SHA nativo autorizado: `0e26c795b08374bfdce3e21e520c3945bf97a5d5`. DEVAI 2.6.3.

Resultado nativo: **FAIL**. 43 itens reconciliados, 36 medidos e 7 com lacuna de observação. 55 leituras novas registradas individualmente. Nenhuma alegação de prontidão.

A composição nativa voltou a funcionar sem selecionar, apagar ou reescrever leituras antigas. A tentativa a97 e seus seis forks permanecem no histórico. Resultados negativos observados são separados de erros, timeouts e populações ausentes. Thresholds e os dois N/A foram preservados. C6 segue bloqueado; leituras de metadados não ativam produtores nativos.

| Item | Veredito nativo | Avaliação |
|---|---|---|
| F1:T2 | PASS | measured |
| F1:T3 | PASS | measured |
| F1:T4 | REVIEW | measured |
| F1:T5 | PASS | measured |
| F1:T6 | REVIEW | measured |
| F1:T7 | PASS | measured |
| F1:T8 | PASS | measured |
| F1:T9 | PASS | measured |
| F2:T1 | PASS | measured |
| F2:T2 | PASS | measured |
| F2:T3 | PASS | measured |
| F2:T4 | PASS | measured |
| F2:T5 | FAIL | measured |
| F2:T6 | FAIL | measured |
| F2:T7 | PASS | measured |
| F2:T8 | PASS | measured |
| F2:T9 | PASS | measured |
| F3:T1 | FAIL | blocked |
| F3:T2 | FAIL | blocked |
| F3:T3 | FAIL | blocked |
| F3:T4 | PASS | measured |
| F3:T5 | FAIL | blocked |
| F3:T6 | FAIL | blocked |
| F3:T7 | FAIL | blocked |
| F3:T8 | FAIL | blocked |
| F3:T9 | PASS | measured |
| F4:T1 | REVIEW | measured |
| F4:T2 | REVIEW | measured |
| F4:T3 | PASS | measured |
| F4:T4 | FAIL | measured |
| F4:T6 | REVIEW | measured |
| F4:T7 | REVIEW | measured |
| F4:T8 | PASS | measured |
| F4:T9 | REVIEW | measured |
| F5:T1 | PASS | measured |
| F5:T2 | PASS | measured |
| F5:T3 | REVIEW | measured |
| F5:T4 | FAIL | measured |
| F5:T5 | REVIEW | measured |
| F5:T6 | PASS | measured |
| F5:T7 | FAIL | measured |
| F5:T8 | PASS | measured |
| F5:T9 | PASS | measured |

Os comandos, populações, hashes das leituras canônicas, recibos oficiais, limitações e responsáveis constam de `evaluation-register.json`. `follow-up-proposals.json` mantém diagnósticos e correções futuras separados; não altera backlog histórico ou rodadas encerradas. `baseline-comparison.json` distingue recuperação de medição de melhoria do produto.

Entre os 36 predicados medidos: **22 PASS, 9 REVIEW e 5 FAIL**. Outros sete itens receberam FAIL na grade nativa por lacunas de observação; esses sete não são falhas de produto medidas. A ausência de cobertura admitida não representa 0% de cobertura.
