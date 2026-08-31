---
id: RN-PEC-102
title: Periodicidade do exame de aptidão física e mental é 10/5/3 anos por faixa etária (CTB art. 147 §2º) — a regra de 5 anos/65 anos da Res. 789/2020 está superada
status: draft
apps: [pec, portal]
sources:
  [REF-CTB-147-148-habilitacao, REF-CONTRAN-789-2020, REF-CONTRAN-927-2022]
updated: 2026-08-24
---

**Regra.** A validade do exame de aptidão física e mental — e, portanto, o vencimento que
determina quando um novo `encounter` é devido — segue **três faixas etárias fixadas em lei**:

| Idade do condutor                   | Periodicidade |
| ----------------------------------- | ------------- |
| **inferior a 50 anos**              | **10 anos**   |
| **50 anos ou mais e inferior a 70** | **5 anos**    |
| **70 anos ou mais**                 | **3 anos**    |

O prazo **pode ser reduzido**, caso a caso, **por proposta do perito examinador**, quando houver
indícios de deficiência física ou mental ou de progressividade de doença que diminua a capacidade
de conduzir (CTB art. 147, § 4º). A redução é **ato do perito, motivado e registrado**, não um
parâmetro de sistema; o prazo reduzido acompanha o resultado até a CNH e a planilha RENACH.

**A regra de "5 anos, ou 3 anos para maiores de 65 anos" da [REF-CONTRAN-789-2020] art. 4º não deve
ser implementada.** É reprodução do texto do art. 147, § 2º **anterior** à Lei 14.071/2020, e a
resolução não foi atualizada.

**Base legal.**

- [REF-CTB-147-148-habilitacao] art. 147, § 2º: _"O exame de aptidão física e mental, a ser
  realizado no local de residência ou domicílio do examinado, será preliminar e renovável com a
  seguinte periodicidade: I - a cada 10 (dez) anos, para condutores com idade inferior a 50
  (cinquenta) anos; II - a cada 5 (cinco) anos, para condutores com idade igual ou superior a 50
  (cinquenta) anos e inferior a 70 (setenta) anos; III - a cada 3 (três) anos, para condutores com
  idade igual ou superior a 70 (setenta) anos."_ _(Redação dada pela Lei nº 14.071, de 2020)_
- [REF-CTB-147-148-habilitacao] art. 147, § 4º _(Redação dada pela Lei nº 14.071, de 2020)_.
- [REF-CONTRAN-789-2020] art. 4º (texto **superado**): _"renovável a cada cinco anos, ou a cada
  três anos para condutores com mais de sessenta e cinco anos de idade"_; e art. 4º, § 2º
  (redução a critério do perito — este sim, compatível com o § 4º da lei).
- [REF-CONTRAN-927-2022] art. 9º, § 2º: para a **avaliação psicológica**, a diminuição do prazo de
  validade _"constará na planilha RENACH"_ — mecanismo análogo, ver [RN-PEC-103].

**Verificação.** Regra de precedência aplicada: **lei federal posterior prevalece sobre resolução
anterior do CONTRAN** que apenas reproduzia o texto legal revogado. A Res. 789/2020 é de
24/06/2020; a Lei 14.071/2020 é de 13/10/2020, com vigência em 12/04/2021. Não há conflito
material a harmonizar — há **texto regulamentar desatualizado**.

Consequências verificáveis:

1. O cálculo de vencimento **depende da idade do condutor na data do exame**, não de um prazo
   único — e a faixa pode mudar entre dois exames (um condutor de 48 anos recebe validade de 10
   anos; aos 58, de 5).
2. A regra de corte é **"igual ou superior a"** — 50 e 70 anos exatos caem na faixa mais curta.
3. Um prazo reduzido pelo perito (§ 4º) é **dado do laudo**, não parâmetro global: precisa de campo
   próprio, com motivo, e prevalece sobre a faixa etária.
4. **Nenhum artefato PEC modela essa validade hoje** — [WF-PEC-001] não tem a linha na tabela de
   prazos e nenhum RN-PEC-00x a menciona. O PEC produz o exame mas não conhece o seu vencimento,
   ainda que ele seja o gatilho natural de um novo episódio.

**Controvérsia/risco.** _Severidade: alta — item nº 2 da lista de validação humana._ Três razões:
(a) o dossiê de pesquisa recomendava explicitamente propagar o prazo **errado** para [WF-PEC-001]
(§4, WF-PEC-001, primeira linha do EXTEND) — a recomendação foi **rejeitada** aqui, e qualquer
artefato que já a tenha absorvido precisa ser revisto; (b) implementar 5 anos onde a lei dá 10
força **renovação indevidamente antecipada** da maioria dos condutores, com custo direto ao cidadão
e risco de questionamento; (c) a Res. 789/2020 continua formalmente vigente e é a norma que um
operador do DETRAN-AM tende a consultar — o desalinhamento é uma armadilha operacional, não apenas
documental. Recomenda-se **comunicação formal do achado ao DETRAN-AM** (mesma classe da correção
autorizada em `_meta/steering.md` D.28 para as cartas de serviço). Item 2 de
`_intake/legal-assessment.md`.
