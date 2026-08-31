---
id: RN-PEC-111
title: Composição das juntas — três profissionais na 2ª instância; no mínimo três, sendo dois especialistas, na Junta Especial de Saúde
status: draft
apps: [pec]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao]
updated: 2026-08-24
---

**Regra.** A composição dos colegiados de revisão é **fixada em norma federal** e é um requisito de
validade da decisão, não um detalhe organizacional:

| Colegiado                                  | Composição mínima                                                                                                                                                 | Designado por                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Junta Médica** (2ª instância)            | **três** médicos peritos examinadores de trânsito **ou** especialistas em Medicina de Tráfego                                                                     | órgão executivo de trânsito do Estado |
| **Junta Psicológica** (2ª instância)       | **três** psicólogos peritos examinadores de trânsito **ou** especialistas em Psicologia do Trânsito                                                               | órgão executivo de trânsito do Estado |
| **Junta Especial de Saúde** (3ª instância) | **no mínimo três** médicos, **sendo dois especialistas em Medicina de Tráfego**; ou no mínimo três psicólogos, sendo dois especialistas em Psicologia do Trânsito | CETRAN / CONTRANDIFE                  |

Duas diferenças entre a 2ª e a 3ª instância são normativas e devem ser modeladas:

- a 2ª instância admite **perito examinador OU especialista** (alternativa); a 3ª **exige dois
  especialistas** entre os três membros (qualificação reforçada);
- a 2ª tem número **exato** (três); a 3ª tem **piso** (no mínimo três).

**Base legal.**

- [REF-CONTRAN-927-2022] art. 12, § 1º: _"A revisão do exame de aptidão física e mental ocorrerá por
  meio de instauração de Junta Médica, pelo órgão [...], e será constituída por três profissionais
  médicos peritos examinadores de trânsito ou especialistas em medicina de tráfego."_
- [REF-CONTRAN-927-2022] art. 12, § 2º: _"A revisão da avaliação psicológica ocorrerá por meio de
  instauração de Junta Psicológica, [...] e será constituída por três psicólogos peritos
  examinadores de trânsito ou especialistas em psicologia de trânsito."_
- [REF-CONTRAN-927-2022] art. 15, parágrafo único: _"'A Junta Especial de Saúde' deverá ser
  constituída por, no mínimo, três médicos, sendo dois especialistas em Medicina de Tráfego, ou, no
  mínimo, três psicólogos, sendo dois especialistas em psicologia do trânsito, quando for o caso."_
- [REF-CTB-147-148-habilitacao] art. 148, § 6º (titulação de especialista — nível legal desde 2026).

**Verificação.** Fecha o gap que [WF-PEC-002] §"Composição da junta" declarava como _"(fonte
pendente) — obter regimento/composição oficial da junta médica de trânsito"_: **a composição existe,
é federal e é explícita**. O gap deixa de ser documental e passa a ser **de implementação**.
Consequências verificáveis:

1. **`JUNTA` como papel RBAC monolítico é insuficiente.** A norma exige membros **identificados**,
   em número mínimo, com **qualificação verificada**. O modelo atual atribui o parecer à string
   literal `'JUNTA'` com um único `decided_by` (UUID) — o que não permite demonstrar que a junta
   estava regularmente composta.
2. **A composição é condição de validade verificável.** O sistema deve recusar o registro de
   decisão de junta que não tenha **três membros vinculados** (2ª instância) ou **três membros com
   ao menos dois especialistas** (3ª instância). É a mesma classe de verificação de quorum já
   desenhada para os colegiados do domínio `inf` (JARI/CETRAN, `_meta/steering.md` B.10).
3. **Especialidade é atributo do profissional, não do papel** — e é o mesmo atributo exigido no
   credenciamento ([RN-PEC-115]). Uma única fonte de verdade deve servir aos dois usos.
4. **Bifurcação por tipo.** Junta Médica e Junta Psicológica não compartilham pool de membros; um
   caso pode instaurar as duas, com composições independentes.
5. **Deliberação e desempate não são tratados pela norma.** Três membros sugerem maioria simples,
   mas **a norma não o diz** — não inferir. Item aberto abaixo.

**Controvérsia/risco.** _Severidade: média._ Três silêncios: (a) **como delibera** a junta (maioria,
unanimidade, voto de qualidade, possibilidade de voto divergente registrado) — nenhuma norma
capturada diz, e o regimento interno do CETRAN-AM permanece não localizado; (b) **impedimento e
suspeição** — nada impede, no texto, que um membro da Junta Médica seja o próprio perito cujo
resultado se revisa, o que é manifestamente incompatível com a função revisora; a vedação é
princípio geral de processo administrativo (Lei 9.784/1999 arts. 18-21, aplicada por extensão no
corpus RAIT, `_meta/steering.md` C.13), **não regra expressa aqui**; (c) o corpus tem **duas
figuras homônimas de CETRAN** — o colegiado recursal de infrações do domínio `inf` e o designante
da Junta Especial de Saúde. São o **mesmo órgão** (CETRAN-AM) em competências distintas; a
desambiguação já foi sinalizada para `shared/actors.md`. Item 3 de `_intake/legal-assessment.md`.
