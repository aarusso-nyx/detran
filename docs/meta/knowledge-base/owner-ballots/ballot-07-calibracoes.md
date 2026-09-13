# Cédula 07 — Calibrações (nada bloqueia; parâmetros com default)

Cada linha já existe em `docs/framework/arch/parameter-catalogue.md` com `status=proposta`. O
Owner pode responder em bloco ("aprovar todos os defaults") ou por linha; a resposta vira versão
`vigente`. Custo tardio: parâmetro ou flag.

| Item                       | Pergunta                                                                              | Default proposto                               | Resposta                 |
| -------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------ |
| OD-004                     | WIP por revisor / alerta                                                              | 45 / 60                                        | [ ] ok [ ] ____          |
| OD-005                     | `T-VOTO`, `T-CONV`, `T-ASS`, `T-CLAIM`                                                | 20 d, 5 du, 5 du, 2 du                         | [ ] ok [ ] ____          |
| OD-006                     | Escada do relógio B                                                                   | [WF-RAIT-002] §4.1 (RN-RAIT-112 a reconciliar) | [ ] ok                   |
| OD-007                     | Amostra de qualidade                                                                  | 5 %                                            | [ ] ok [ ] ____          |
| OD-008                     | Gatilho de nova turma                                                                 | fila > capacidade por 3 meses                  | [ ] ok [ ] ____          |
| OD-009                     | "120 dias" institucional                                                              | descartado; SLA local 30 d                     | [ ] ok                   |
| OD-014 / DT-064            | throughput de sessão e taxa de provimento                                             | dados de jul/2026 até série real               | [ ] enviar dados         |
| OD-016                     | prioridades além de 60+/80+ e PcD                                                     | lista do catálogo                              | [ ] ok [ ] ____          |
| OD-017                     | limiar de exportação nominal (DPO)                                                    | 100 linhas                                     | [ ] ok [ ] ____          |
| OD-019                     | advertência na mesma máquina                                                          | sim                                            | [ ] ok                   |
| OD-103/106/109/110/111/112 | vista, sessão virtual, voto, suplência, impedimentos, sorteio                         | premissas do registro (até regimento)          | [ ] ok                   |
| OD-T03                     | janela de concorrência                                                                | pendente (Owner pediu dados, DT-016)           | [ ] valor: ____          |
| OD-T04                     | homologação caducada                                                                  | bloqueia, tolerância 0                         | [ ] ok [ ] avisar        |
| OD-T06                     | `no_approach_reason`                                                                  | classificação (RN-TEAT-108)                    | [ ] ok                   |
| OD-T07                     | reserva expirada / faixa esgotada                                                     | devolve; esgota em `next > end`                | [ ] ok                   |
| OD-D04                     | limiares SRE                                                                          | 15 min / 24 h / p95 2 s / 5 %                  | [ ] SRE calibra          |
| OD-D06…D09, D11, D13       | ocultação, heartbeat, finalidades, 5.000 linhas, LEGAL em crítico, recursos da origem | catálogo                                       | [ ] ok                   |
| OD-P11                     | volumes e cache                                                                       | TTL 15 min                                     | [ ] ok                   |
| OD-B07 / DT-019            | proprietário hospitalizado                                                            | 60 d sem suspensão + aviso                     | [ ] ok [ ] posição: ____ |
| OD-B13                     | cancelamento só em rascunho                                                           | sim                                            | [ ] ok                   |
| OD-003 / DT-012            | desconto de 40% fora do SNE                                                           | flag off                                       | [ ] ligar quando: ____   |
| OD-012                     | jeton                                                                                 | pendente de fonte (carta)                      | [ ] valor: ____          |
| DT-042                     | lista jurídica PORTAL/DASHBOARD                                                       | leitura de trabalho                            | [ ] pedir parecer        |

**Respondida em bloco em 2026-09-13 (H.53…H.56)**: todos os defaults aprovados; OD-T04 = só avisar e registrar; OD-003 = flag desligada; DT-042/043 = parecer único; OD-T03 sem valor (DT-016); jeton pendente de fonte. Owner
