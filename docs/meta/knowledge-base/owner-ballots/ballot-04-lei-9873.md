# Cédula 04 — Lei 9.873/1999 e os relógios de prescrição (OD-301…305)

Bloqueia: transições `EXTINTO_PRESCRICAO` por `T-PAR-3A` e `T-PRESC-5A` (steering C.13
`[BLOQUEIA]`); IND-DASH-104/105.

Fato novo ([REF-STJ-TEMAS-1293-1294]): STJ Tema 1.293 (03/2025) e Tema 1.294 (12/2025) — a Lei
9.873/1999 é restrita à administração federal; Estados e Municípios precisam de lei própria;
o Decreto 20.910/1932 não supre. Nenhuma lei do Amazonas sobre prescrição da ação punitiva foi
localizada. A única ponte é a Res. CONTRAN 918/2022 art. 36 (ato infralegal), cujos
"procedimentos uniformes" da SENATRAN nunca foram localizados. O art. 289-A do CTB (24 meses)
e a decadência do art. 282 §6º não são afetados.

| Opção           | Consequência                                                                                                                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A (recomendada) | `T-PAR-3A` e `T-PRESC-5A` ficam **relógios de alerta**: escalonam no DASHBOARD, mas não declaram prescrição de ofício; a declaração depende de parecer do LEGAL caso a caso ou de lei estadual superveniente. Parâmetro `deadline.*.expiry_kind_override=alert_only`, status `a_confirmar` |
| B               | manter declaração de ofício com base no art. 36 da Res. 918 — risco de ato administrativo fundado em lei que o STJ diz inaplicável                                                                                                                                                         |
| C               | pedir parecer formal ao LEGAL/PGE-AM antes de qualquer alerta — atrasa o bloco A do DASHBOARD                                                                                                                                                                                              |

Premissa atual: A. Custo tardio: parâmetro. Itens ligados: OD-302 (efeito do julgamento tardio
do 289-A — segue com declaração de ofício, C.15), OD-303, OD-304 (`T-NA-IND`), OD-305
(interrupções): mantêm as premissas do registro.

Resposta: **[x] A** — alerta sem declaração de ofício. Encaminhar ao LEGAL: sim (parecer único, H.56). Data: 2026-09-13. Owner (H.46)
