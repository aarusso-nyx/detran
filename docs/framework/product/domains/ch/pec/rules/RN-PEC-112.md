---
id: RN-PEC-112
title: Escada de prazos da revisão — 30 dias / 15 dias úteis / 30 dias / 30 dias / 20 dias úteis
status: draft
apps: [pec, portal, dashboard]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao]
updated: 2026-08-24
---

**Regra.** A cadeia de revisão de [RN-PEC-110] tem **cinco prazos numéricos**, todos com base
federal expressa. Nenhum deles existe hoje em qualquer workflow do PEC.

| #   | Ato                                              | Prazo             | Termo inicial                                | Quem age                    | Base          |
| --- | ------------------------------------------------ | ----------------- | -------------------------------------------- | --------------------------- | ------------- |
| 1   | Requerer instauração de Junta Médica/Psicológica | **30 dias**       | **conhecimento do resultado** pelo candidato | candidato                   | art. 12       |
| 2   | Designar a Junta                                 | **15 dias úteis** | recebimento do requerimento                  | órgão executivo de trânsito | art. 14, § 1º |
| 3   | Junta proferir o resultado                       | **30 dias**       | **data da designação**                       | Junta Médica/Psicológica    | art. 14, § 3º |
| 4   | Recorrer ao CETRAN/CONTRANDIFE                   | **30 dias**       | conhecimento do resultado da revisão         | candidato                   | art. 13       |
| 5   | Remeter os documentos ao CETRAN                  | **20 dias úteis** | recebimento do recurso                       | órgão executivo de trânsito | art. 14, § 2º |

Dois são **prazos do administrado** (1 e 4) e três são **prazos do órgão** (2, 3 e 5). A distinção
importa: a norma **não comina sanção** ao descumprimento dos prazos do órgão — são SLA legais sem
consequência expressa, exatamente o mesmo padrão já identificado no domínio `inf`
(`inf/rait/_intake/legal-assessment.md` §1.2, item 4). Já os prazos do administrado são
**preclusivos**: vencido o prazo, extingue-se o direito de provocar a instância.

**Contagem.** Prazos em **dias** (1, 3 e 4) são corridos; prazos em **dias úteis** (2 e 5) seguem
a convenção já adotada no corpus — calendário nacional + estadual do Amazonas, com exclusão do dia
inicial ([RN-RAIT-005], `_meta/steering.md` A.6).

**Base legal.** [REF-CONTRAN-927-2022]:

> "Art. 12. [...] o candidato poderá requerer, **no prazo de trinta dias**, contados do seu
> conhecimento, a instauração de Junta Médica e/ou Psicológica [...]"
>
> "Art. 13. Mantido o resultado de inaptidão permanente pela Junta Médica ou Psicológica caberá,
> **no prazo de trinta dias**, contados a partir do conhecimento do resultado da revisão, recurso
> ao [CETRAN] ou ao [CONTRANDIFE]."
>
> "Art. 14. [...] § 1º O órgão [...] deverá, **no prazo de quinze dias úteis**, contados do
> recebimento do requerimento, designar Junta Médica ou Psicológica. § 2º Em se tratando de
> recurso, o prazo para remessa dos documentos ao CETRAN ou ao CONTRANDIFE é de **vinte dias
> úteis**, contados da data do seu recebimento. § 3º As Juntas Médicas ou Psicológicas deverão
> proferir o resultado **no prazo de trinta dias**, contados da data de sua designação."

**Verificação.**

1. **Preenche a lacuna de [WF-PEC-002] §"Prazos e timers"**, que registrava _"Nenhum prazo numérico
   foi encontrado nos documentos do PEC para o fluxo de junta/recurso — (fonte pendente)"_. Deixa de
   ser fonte pendente.
2. **O termo inicial do prazo 1 é "o conhecimento do resultado", não a emissão do laudo.** O PEC
   precisa registrar um **evento de ciência do candidato** (disponibilização no portal, entrega,
   entrevista devolutiva do § 22 da [REF-CFP-01-2019]). Sem esse marco, o prazo não é calculável —
   é o mesmo problema de termo inicial já enfrentado e decidido no RAIT (`_meta/steering.md` C.21).
3. **O prazo 3 corre da designação, não do requerimento** — o que significa que o prazo 2 (15 dias
   úteis) **não é consumido** pelo prazo 3. O tempo total máximo da 2ª instância é
   `15 dias úteis + 30 dias`, e um atraso do órgão na designação **estende** o total.
4. **Escada de alertas.** Recomenda-se, por paridade com a escada já calibrada e aprovada para o
   RAIT (`_meta/steering.md` A.1), marcos de alerta em **50%/75%/90%** de cada prazo do órgão
   (2, 3 e 5) — proposta de BPO, não exigência normativa.
5. **`UNDER_REVIEW` ganha semântica temporal**: é o estado entre a designação (fim do prazo 2) e o
   resultado (prazo 3). O enum deixa de ser inalcançável por falta de significado.

**Controvérsia/risco.** _Severidade: média._ (a) **Não há prazo para o julgamento pela Junta
Especial de Saúde** — a norma fixa prazo para remeter os documentos (20 dias úteis) e silencia
sobre decidir. A 3ª instância é, no texto, **sem prazo**; nenhuma norma capturada o supre, e o
regimento do CETRAN-AM não foi localizado. É a mesma lacuna estrutural já registrada no RAIT
(`inf/rait/_intake/legal-assessment.md` item 13). (b) **Não há regra de suspensão ou prorrogação**
por diligência: se a Junta precisar de exame complementar, o prazo de 30 dias corre igualmente. (c)
Os prazos do órgão sem sanção convivem mal com o **bloqueio do cadastro nacional** ([RN-PEC-106]),
que permanece durante toda a revisão sob a leitura conservadora de [RN-PEC-110]: a demora do órgão
recai integralmente sobre o cidadão impedido de dirigir. É risco de exposição real, não apenas de
modelagem. Item 4 de `_intake/legal-assessment.md`.
