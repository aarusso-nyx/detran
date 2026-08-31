---
id: REF-CETRAN-PROCESSO-INTERNO
title: Modelos de outros estados — processo interno das JARI/CETRAN (distribuição, relator, pauta, quorum, prazos, sustentação oral)
orgao: CETRAN-RS / CETRAN-ES / CETRAN-PR / CETRAN-SP
status: informativo — regras estaduais próprias, NÃO vinculam DETRAN-AM/CETRAN-AM; usar como benchmark de desenho, nunca como fonte normativa direta para o Amazonas
url: ver por seção abaixo
pdf: REF-CETRANPR-090-2024.pdf (original, baixado); REF-CETRANSP-deliberacao-02-2025.pdf (original, baixado); REF-CETRAN-RS-88-2014.pdf (original, baixado, ver notas); ES capturado como extração verbatim (WebFetch — site não linka PDF, ver notas)
apps: [rait]
updated: 2026-08-24
---

# CETRAN-RS — Resolução nº 88/2014 (alterada pela Res. 110/2016)

**Status de captura:** PDF OFICIAL do CETRAN-RS, baixado diretamente de `cetran.rs.gov.br` em
2026-08-27 (`REF-CETRAN-RS-88-2014.pdf`, 11 páginas — bloqueio de curl/WebFetch registrado em
tentativa anterior não se repetiu nesta captura). É a versão **alterada pela Resolução nº
110/2016**, que alterou especificamente o art. 16 (o próprio PDF consolidado traz a nota
"(redação conferida pela Resolução nº 110/2016 do CETRAN/RS)" junto a esse artigo) — não foi
localizado um PDF oficial separado com a redação original pré-2016, mas o texto abaixo é a
redação **atualmente vigente**, o que é o que importa para benchmark de desenho. A Res.
110/2016 em si não foi localizada como PDF autônomo (listagem de resoluções do site é
renderizada via JS, não expõe links diretos a scraping) — não bloqueador, pois a redação
vigente já está consolidada neste PDF. Excertos abaixo (art. 13 §1º e §2º, art. 17) conferidos
contra o texto primário: conferem literalmente, sem divergência.

## Distribuição e relator

> Art. 13, §1º: "A JARI ao receber o processo com o recurso distribuirá ao relator competente
> para que realize o seu voto e o coloque em pauta para votação."

## Prazo interno de julgamento e efeito suspensivo automático por atraso

> Art. 13: julgamento em até 30 dias do recebimento; §2º: quando este prazo não pode ser
> cumprido, aplica-se **efeito suspensivo automático ao recurso** (mecanismo de proteção ao
> cidadão contra a demora do próprio órgão — comparável em espírito ao art. 289-A do CTB,
> mas operando num prazo muito mais curto, 30 dias vs 24 meses).

## Recurso ao CETRAN e triagem de admissibilidade

> Art. 14: recurso ao CETRAN em 30 dias da notificação do julgamento da JARI.
> Art. 17: "O recurso ao CETRAN será concluso ao presidente para análise dos pressupostos de
> admissibilidade, em decisão fundamentada" — modelo de **triagem unipessoal pelo presidente**
> antes da distribuição a relator (diferente do modelo ES, que distribui direto por sorteio).

---

# CETRAN-ES — Regimento Interno (capturado via WebFetch da página oficial cetran.es.gov.br/regimento-interno; NÃO baixado como PDF — a página web é HTML, não linka PDF)

## Composição

16 categorias de membros (Presidente, Diretor do DETRAN, DER, Polícia Militar, municípios,
federação de transporte, sindicatos, associações profissionais).

## Distribuição por sorteio (mais transparente que o modelo RS de distribuição livre)

> Art. 24: "Os processos de competência do Conselho serão recebidos e protocolados pela
> Secretaria Executiva para posterior envio à Presidência, que deverá determinar a
> distribuição dos mesmos a um relator."
> Art. 25: "A distribuição será registrada, obedecido ao critério de **sorteio** entre os
> Conselheiros."

## Relator e parecer

> Art. 26: "A manifestação do Conselheiro-relator será em forma de parecer que deverá conter
> um resumo descritivo, a análise fundamentada e o voto."
> Art. 8º, VII: dever do conselheiro de "relatar e emitir parecer nos processos que lhe forem
> distribuídos no **prazo de até 20 dias**" (prazo interno, prorrogável mediante justificativa
> aprovada pela Presidência).

## Disciplina de atraso do relator (mecanismo de accountability — ausente no RS)

> Art. 9º: retenção de processo além do prazo sujeita o conselheiro a **advertência**.
> Art. 10: **afastamento automático** em caso de reincidência na retenção de processos.

## Quorum e periodicidade das sessões

> Art. 19, §1º: "O Conselho somente poderá deliberar com, no mínimo, **oito Conselheiros**."
> Art. 19: sessões ordinárias **8 vezes por mês**, presenciais ou por videoconferência.
> Art. 19, §5º: cada sessão dura **1 hora**.

## Sustentação oral — VEDADA

> Art. 29, §4º: "Não será admitida a sustentação oral, por parte do recorrente, nas sessões de
> julgamento." _(Achado relevante: nem todo CETRAN admite sustentação oral — não presumir que
> é uma garantia universal ao desenhar o fluxo do RAIT/CETRAN-AM.)_

## Incompatibilidade JARI × CETRAN

> Art. 8º, §2º: "O Conselheiro do CETRAN/ES não poderá compor Junta Administrativa de Recurso
> de Infração — JARI." _(Confirma a mesma regra do item 4.1.c da Res. CONTRAN 357/2010 —
> separação estrita nacional, não peculiaridade capixaba.)_

---

# CETRAN-PR — Resolução nº 090/2024 (baixada, original, `REF-CETRANPR-090-2024.pdf`, 5 páginas)

Não trata de distribuição/pauta/quorum — é uma resolução **temática** sobre indicação de
condutor infrator (art. 162 CTB) e contagem do prazo de 30 dias do art. 281 CTB a partir do
protocolo de identificação (ou da Carteira Digital de Trânsito). Mantida no corpus por
relevância direta ao fluxo de **indicação de condutor** do PORTAL (item do backlog "Novos"),
não ao processo interno de julgamento:

> Art. 5º, §2º: "A data do protocolo do formulário/requerimento de identificação do condutor
> infrator no órgão competente ou a data da indicação através da Carteira Digital de Trânsito
> – CDT será considerada como termo inicial para a contagem dos trinta dias para expedição da
> notificação... conforme previsto no §3º do artigo 5º da Resolução 918/2022 do CONTRAN."

**Lição de UX:** o Paraná já trata a identificação via **carteira digital (app)** como
equivalente legal ao protocolo formal em papel/balcão — modelo de referência para o PORTAL
oferecer indicação de condutor 100% digital com o mesmo valor jurídico.

---

# CETRAN-SP — Deliberação nº 02/2025 (baixada, original, `REF-CETRANSP-deliberacao-02-2025.pdf`, 10 páginas) — "CETRAN-SP Digital"

Institui **tramitação exclusivamente digital** para recursos ao CETRAN-SP via Sistema
Integrado de Multas (SIM). Fundamenta-se em: princípios constitucionais de ampla defesa e
acesso à informação (CF art. 5º XXXIII, art. 37 §3º II); Decreto 10.278/2020 (digitalização
com equivalência jurídica ao original); Resoluções Conarq 31/2010 e 48/2021 (padrões técnicos
de digitalização/arquivamento).

> Art. 3º: "O DETRAN-SP, o DER-SP e os órgãos e entidades executivos de trânsito dos
> municípios... deverão cadastrar e encaminhar os recursos endereçados ao CETRAN-SP por
> intermédio do SIM, **independentemente da forma de recebimento do recurso**" — ou seja, o
> cidadão pode protocolar em qualquer canal (inclusive físico) mas o ÓRGÃO é obrigado a
> digitalizar e tramitar digitalmente a partir daí.

**Lição de arquitetura para o RAIT:** o modelo SP resolve a "porta de entrada física" sem
exigir que TODO o fluxo interno seja físico — a obrigação de digitalização recai sobre o órgão
autuador/recebedor, não sobre o cidadão. Isso é replicável no Amazonas independentemente de o
Protocolo Virtual do Estado (hoje usado) evoluir ou não — o DETRAN-AM poderia digitalizar
internamente processos recebidos em papel e tramitá-los 100% digital a partir da JARI.

---

# Síntese comparativa (para BPO)

| Dimensão                   | RS                                                          | ES                                                   | PR (só indicação de condutor)                        | SP                                                            |
| -------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Distribuição               | ao relator (critério não sorteio explícito)                 | **sorteio** registrado                               | n/a                                                  | via SIM (sistema)                                             |
| Prazo interno relator      | —                                                           | **20 dias**, prorrogável                             | n/a                                                  | —                                                             |
| Accountability por atraso  | efeito suspensivo automático ao recurso se JARI atrasa >30d | advertência → afastamento do conselheiro reincidente | n/a                                                  | —                                                             |
| Quorum CETRAN              | —                                                           | **8 conselheiros mínimo**                            | n/a                                                  | —                                                             |
| Sustentação oral           | —                                                           | **vedada**                                           | n/a                                                  | —                                                             |
| Triagem de admissibilidade | presidente, decisão fundamentada, antes da distribuição     | —                                                    | n/a                                                  | —                                                             |
| Canal                      | presencial+postal (implícito)                               | presencial/videoconferência (sessões)                | Carteira Digital de Trânsito equivalente a protocolo | **100% digital via SIM**, órgão digitaliza o que entra físico |

**Recomendação BPO:** o par ES (accountability de relator + quorum + sorteio) + SP (obrigação
do órgão de digitalizar, não do cidadão) é o combo de maior valor de referência para desenhar
o processo interno do CETRAN-AM/JARI-AM, cujo regimento próprio não foi localizado
publicamente (ver dossiê, seção DETRAN-AM).
