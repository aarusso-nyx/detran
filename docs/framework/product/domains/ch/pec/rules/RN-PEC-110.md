---
id: RN-PEC-110
title: A revisão do resultado tem TRÊS instâncias, não duas — perito → Junta Médica/Psicológica → Junta Especial de Saúde designada pelo CETRAN
status: draft
apps: [pec, portal]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao]
updated: 2026-08-24
---

**Regra.** A cadeia de revisão do resultado do exame de aptidão física e mental e da avaliação
psicológica é composta por **três instâncias sucessivas e distintas**, todas com base legal
federal expressa. Este é o **esqueleto legal que [WF-PEC-002] deve seguir**.

| #   | Instância                                   | Quem decide                                                                     | Objeto                     | Como se chega                             |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------- |
| 1ª  | **Perito examinador**                       | médico ou psicólogo credenciado                                                 | o resultado original       | ato do exame                              |
| 2ª  | **Junta Médica** e/ou **Junta Psicológica** | 3 profissionais, **designados pelo órgão executivo de trânsito**                | _reavaliação_ do resultado | **requerimento do candidato**, em 30 dias |
| 3ª  | **Junta Especial de Saúde**                 | ≥3 profissionais, 2 deles especialistas, **designados pelo CETRAN/CONTRANDIFE** | _julgamento do recurso_    | **recurso ao CETRAN**, em 30 dias         |

Quatro características vinculantes que o modelo atual não reflete:

1. **A legitimidade para provocar a 2ª instância é do candidato**, e independe do resultado —
   _"independentemente do resultado"_, diz o art. 12. Não é encaminhamento administrativo de
   auditoria, nem ato do perito, nem gatilho automático de sistema.
2. **A 2ª instância é dupla e separável**: Junta **Médica** e Junta **Psicológica** são órgãos
   distintos, com composições distintas, para objetos distintos. Um episódio pode ter uma, outra,
   ou ambas.
3. **A 3ª instância só se abre em uma hipótese**: _"mantido o resultado de **inaptidão
   permanente**"_ pela Junta. Resultado de inaptidão **temporária** mantido, ou revisão que altere
   o resultado, **não** abrem recurso ao CETRAN por este dispositivo.
4. **O CETRAN não julga: designa quem julga.** A decisão de 3ª instância é da **Junta Especial de
   Saúde**, órgão técnico colegiado composto por médicos ou psicólogos — não do colegiado
   administrativo do CETRAN.

**Base legal.**

- [REF-CONTRAN-927-2022] art. 12: _"Independentemente do resultado do exame de aptidão física e
  mental e da avaliação psicológica, o candidato poderá requerer, no prazo de trinta dias, contados
  do seu conhecimento, a instauração de Junta Médica e/ou Psicológica ao órgão ou entidade executivo
  de trânsito do Estado ou do Distrito Federal, para reavaliação do resultado."_
- [REF-CONTRAN-927-2022] art. 12, §§ 1º e 2º (composição — ver [RN-PEC-111]).
- [REF-CONTRAN-927-2022] art. 13: _"Mantido o resultado de inaptidão permanente pela Junta Médica
  ou Psicológica caberá, no prazo de trinta dias, contados a partir do conhecimento do resultado da
  revisão, recurso ao Conselho Estadual de Trânsito (CETRAN) ou ao Conselho de Trânsito do Distrito
  Federal (CONTRANDIFE)."_
- [REF-CONTRAN-927-2022] art. 14: _"O requerimento de instauração de Junta [...] e o recurso
  dirigido ao CETRAN [...] deverão ser apresentados no órgão [...] onde residir ou estiver
  domiciliado o interessado."_
- [REF-CONTRAN-927-2022] art. 15: _"Para o julgamento de recurso, o Conselho de Trânsito do Estado
  [...] deverá designar Junta Especial de Saúde."_

**Verificação.** Divergências concretas entre a norma e [WF-PEC-002], todas a corrigir:

1. **Legitimado errado.** O workflow atribui `POST /juntas` a _Auditor, Gestor (Clínica) e Gestor
   DETRAN_ e registra explicitamente que **não** é o candidato. A norma diz o contrário: o
   requerimento é **do candidato**. O ato administrativo interno pode continuar existindo como
   canal de entrada (protocolo), mas o **requerente** é o cidadão, e o sistema precisa registrar
   isso — inclusive porque é a partir do _conhecimento do resultado pelo candidato_ que corre o
   prazo de 30 dias ([RN-PEC-112]).
2. **Falta uma instância inteira.** `escalated_to_cetran` é uma **flag booleana na mesma linha de
   decisão**, que apenas troca a string do signatário de `'JUNTA'` para `'CETRAN'`. Isso não modela:
   um novo caso, um novo prazo, um novo colegiado, nem a designação da Junta Especial de Saúde. Do
   ponto de vista normativo, a 3ª instância **não existe no sistema**.
3. **Falta a bifurcação médica/psicológica.** Não há, no modelo, distinção entre Junta Médica e
   Junta Psicológica — há um papel `JUNTA` único.
4. **Falta a guarda do art. 13.** A abertura da 3ª instância deve ser **condicionada** à manutenção
   de **inaptidão permanente**; hoje `escalateToCetran` é um booleano livre no DTO de decisão.
5. **Competência territorial** (art. 14): requerimento e recurso são apresentados no órgão do
   **domicílio do interessado** — dado que o PEC não coleta e que, em estado de dimensão do
   Amazonas, não é detalhe.
6. **`UNDER_REVIEW` deixa de ser enum morto**: corresponde ao intervalo entre a designação da Junta
   (15 dias úteis) e o resultado (30 dias) — tem, agora, significado normativo e prazo próprio.

**Controvérsia/risco.** _Severidade: alta — item nº 6 da lista de validação humana._ (a) A norma
não diz se a Junta de 2ª instância **refaz o exame** ou apenas **revisa o laudo** — o verbo é
_"reavaliação do resultado"_, o que admite as duas leituras e tem consequência direta sobre se o
caso de junta gera um novo `encounter` (com nova biometria de presença, [RN-PEC-130]) ou apenas um
parecer documental. **Não resolvido; não inferir.** (b) A Res. 927/2022 não trata de efeito
suspensivo: não se sabe se o bloqueio de cadastro do art. 10, § 2º ([RN-PEC-106]) permanece durante
a revisão. Por comparação, o CTB art. 148-A, § 4º diz expressamente _"sem efeito suspensivo"_ para
o toxicológico — o silêncio aqui, ao lado do dispositivo expresso ali, sugere que o legislador sabe
dizer quando quer; a leitura conservadora (bloqueio permanece) é a adotada, **como interpretação**.
(c) O regimento interno do CETRAN-AM continua não localizado (mesmo gap da rodada RAIT,
`_meta/steering.md` A.4) — a **composição** da Junta Especial de Saúde tem base federal, mas o
**procedimento** do CETRAN para designá-la não. Item 3 de `_intake/legal-assessment.md`.
