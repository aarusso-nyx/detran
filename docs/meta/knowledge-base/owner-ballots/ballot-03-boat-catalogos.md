# Cédula 03 — BOAT: catálogos, gravidade, LGPD e retenção

Bloqueia: WP-B1 (seed do DDL). Superfícies: BOAT, DASHBOARD.

## 3.1 Catálogos fechados (OD-B11)

Pergunta: aprovar os valores do protótipo para `crash_type` e as quatro condições (via, clima,
iluminação, sinalização) como catálogo inicial do órgão?

| Opção        | Consequência                                                                                |
| ------------ | ------------------------------------------------------------------------------------------- |
| A (premissa) | valores do protótipo, `source_pending` até os Manuais RENAEST; editáveis por `agency-admin` |
| B            | Owner fornece a lista do DETRAN-AM agora                                                    |

Custo tardio: parâmetro (`est.catalog.*`). Resposta: **[x] A** — valores do protótipo, pendentes. Data: 2026-09-13. Owner (H.42)

## 3.2 Derivação gravidade ↔ vítima (OD-B06 / DT-018 — proposta da equipe para aprovação)

Proposta: gravidade do sinistro = pior gravidade entre as vítimas (`COM_VITIMA_FATAL` >
`COM_VITIMA_FERIDA`); sem vítima registrada = `SEM_VITIMA`; gravidade informada na abertura é
provisória e é sobrescrita no fechamento; divergência bloqueia o fechamento
(`BOAT.SEVERITY_REQUIRES_VICTIMS`).

Resposta: **[x] aprovada**. Data: 2026-09-13. Owner (H.43)

## 3.3 Hipótese legal do dado de saúde (OD-B01 / DT-047)

Fato novo: o DETRAN-AM tem Encarregado, CPPD e a PN 002/2026 exige inventário de bases com
hipóteses e prazos (art. 28) — [REF-DETRANAM-PORTARIAS-LGPD-2026]. O guia da ANPD sustenta
art. 11, II, a (obrigação legal: CTB 326-A, Res. 808) e II, b (política pública) —
[REF-ANPD-GUIA-PODER-PUBLICO-2024].

Pergunta: autorizar o registro do BAT no inventário do art. 28 com essas hipóteses e a
publicação na página de transparência do PORTAL?

Resposta: **[x] sim** — registrar e publicar após revisão do CPPD. Data: 2026-09-13. Owner (H.44)

## 3.4 Retenção (OD-B02 / DT-049)

Fato novo: a CSAD (PN 015/2026) é quem elabora a tabela de temporalidade; ela não existe. O
benchmark DETRAN-DF ([REF-DETRANDF-INSTRUCAO-146-2023-TTD]) dá 5 anos para defesa/recurso e
notificações e 10 anos para fiscalização.

Pergunta: pedir à CSAD um Plano de Destinação (art. 3º, III) para BAT, dado de saúde, bodycam e
autos encerrados, usando os defaults do catálogo (5/5/–/5 anos) como proposta?

Resposta: **defaults adotados já como vigentes** (5/5/10 anos; bodycam pendente); carta à CSAD com esses valores como proposta. Data: 2026-09-13. Owner (H.45)
