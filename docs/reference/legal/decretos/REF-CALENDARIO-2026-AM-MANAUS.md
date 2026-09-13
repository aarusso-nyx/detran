---
id: REF-CALENDARIO-2026-AM-MANAUS
title: Calendário oficial 2026 — feriados e pontos facultativos da União, do Estado do Amazonas e do Município de Manaus (atos localizados em 2026-09-13)
orgao: Governo do Amazonas; Prefeitura de Manaus; União
status: parcial — Manaus consolidado em decreto anual (DOM 6.251, 11/02/2026); Estado sem decreto anual, pontos facultativos por decreto avulso
url: https://www.legisweb.com.br/legislacao/?id=490727
apps: [rait, teat, portal, dashboard]
sources: [REF-LEI-12527-2011]
updated: 2026-09-13
---

# O que este arquivo é

Validação da fixture `docs/framework/arch/fixtures/calendar-2026.json` contra os atos oficiais
localizados. O calendário de produção continua sendo **parâmetro do `agency-admin`** (`rait_holiday`,
[UC-RAIT-043]); este arquivo fornece os valores iniciais e a fonte de cada linha.

# Fontes

| Fonte                                                                                                                                                                       | O que fixa                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decreto municipal s/n de 11/02/2026, DOM Manaus ed. 6.251 (legisweb id 490727; nota oficial em manaus.am.gov.br/noticia/nota/calendario-de-feriados-e-pontos-facultativos/) | calendário anual de Manaus: feriados e pontos facultativos municipais                                                                                  |
| Página "Feriados municipais" da Prefeitura de Manaus (manaus.am.gov.br/prefeitura/feriados-municipais/)                                                                     | base legal de cada feriado municipal: Lei 448/1998 (Carnaval), Lei 970/2006 (Corpus Christi), Lei 496/1999 (8/12), Lei Orgânica art. 437 (5/9 e 24/10) |
| Decreto estadual de 18/12/2025 (legisla.imprensaoficial.am.gov.br/diario_am/41533/2025/12/17639)                                                                            | ponto facultativo em 26/12/2025 e 02/01/2026 nas repartições, autarquias e fundações do Estado                                                         |
| Decreto estadual publicado no DOE-AM de 10/02/2026 (Agência Amazonas; amazonas1.com.br)                                                                                     | ponto facultativo estadual em 16, 17 e 18/02/2026 (Carnaval)                                                                                           |
| Decreto estadual de 27/03/2026 (amazonasatual.com.br, com base na Lei 9.093/1995)                                                                                           | ponto facultativo estadual em 02/04/2026 (quinta-feira santa)                                                                                          |
| Decretos estadual e municipal noticiados em junho/2026 (amazonasatual.com.br)                                                                                               | ponto facultativo em 05/06/2026 (sexta após Corpus Christi)                                                                                            |
| Portaria MGI federal de feriados 2026 (10 feriados, 9 pontos facultativos federais)                                                                                         | feriados nacionais                                                                                                                                     |

# Calendário consolidado 2026

| Data  | Dia | Classe                                                          | Base                                                           |
| ----- | --- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| 01/01 | qui | feriado nacional                                                | Lei 662/1949                                                   |
| 02/01 | sex | ponto facultativo estadual                                      | Decreto AM 18/12/2025                                          |
| 16/02 | seg | ponto facultativo (Estado e Manaus)                             | Decretos de fev/2026                                           |
| 17/02 | ter | feriado municipal (Carnaval); ponto facultativo estadual        | Lei mun. 448/1998; Decreto AM                                  |
| 18/02 | qua | ponto facultativo (Estado dia inteiro; Manaus a partir das 12h) | Decretos de fev/2026                                           |
| 02/04 | qui | ponto facultativo (Estado e Manaus)                             | Decreto AM 27/03/2026; calendário municipal                    |
| 03/04 | sex | feriado nacional (Paixão de Cristo)                             | Lei 9.093/1995                                                 |
| 20/04 | seg | ponto facultativo municipal                                     | calendário municipal                                           |
| 21/04 | ter | feriado nacional (Tiradentes)                                   | Lei 662/1949                                                   |
| 01/05 | sex | feriado nacional                                                | Lei 662/1949                                                   |
| 04/06 | qui | **feriado municipal** (Corpus Christi)                          | Lei mun. 970/2006 — a fixture o tratava como ponto facultativo |
| 05/06 | sex | ponto facultativo (Estado e Manaus)                             | decretos de jun/2026                                           |
| 05/09 | sáb | feriado estadual (Elevação do Amazonas à Província)             | Lei Orgânica de Manaus art. 437, I; norma estadual             |
| 07/09 | seg | feriado nacional                                                | Lei 662/1949                                                   |
| 12/10 | seg | feriado nacional                                                | Lei 6.802/1980                                                 |
| 24/10 | sáb | feriado municipal (Elevação de Manaus a Cidade)                 | Lei Orgânica art. 437, II                                      |
| 28/10 | qua | ponto facultativo municipal (Dia do Servidor)                   | calendário municipal                                           |
| 02/11 | seg | feriado nacional                                                | Lei 662/1949                                                   |
| 15/11 | dom | feriado nacional                                                | Lei 662/1949                                                   |
| 20/11 | sex | feriado nacional (Consciência Negra)                            | Lei 14.759/2023                                                |
| 07/12 | seg | ponto facultativo municipal                                     | calendário municipal                                           |
| 08/12 | ter | feriado municipal (N. Sra. da Conceição)                        | Lei mun. 496/1999                                              |
| 24/12 | qui | ponto facultativo municipal                                     | calendário municipal                                           |
| 25/12 | sex | feriado nacional                                                | Lei 662/1949                                                   |
| 31/12 | qui | ponto facultativo municipal                                     | calendário municipal                                           |

# Efeito na fixture e no parâmetro

- Corrigido em `calendar-2026.json`: 04/06 passa de "ponto facultativo" a **feriado municipal**;
  acrescentados 02/01, 18/02 (parcial), 02/04, 05/06, 20/04, 28/10, 07/12, 24/12, 31/12 como
  pontos facultativos com a esfera que os decretou.
- **Lacuna**: o Estado não publica decreto anual consolidado; os pontos facultativos estaduais do
  2º semestre de 2026 (28/10, 24/12, 31/12) só serão conhecidos por decreto avulso. O motor de
  prazos deve tratar ponto facultativo como **dia útil para o cidadão e não útil para o órgão**
  conforme o parâmetro `deadline.optional_day_policy` (proposta: conta como dia útil; o órgão
  não expede atos), decisão do Owner (OD-016 do PORTAL / cédula 07).
- Feriado estadual de 05/09: norma estadual instituidora não capturada (só a referência da Lei
  Orgânica de Manaus); registrar como `source_pending` até localizar a lei estadual.
