---
id: RN-PEC-122
title: Sigilo reforçado do resultado toxicológico — divulgação apenas ao interessado e vedação legal de uso para fim estranho; o PEC deve conhecer o fato, não o laudo
status: draft
apps: [pec, portal]
sources:
  [
    REF-CTB-147-148-habilitacao,
    REF-CONTRAN-923-1009-toxicologico,
    REF-LEI-13709-2018,
  ]
updated: 2026-08-24
---

**Regra.** O resultado do exame toxicológico está sujeito a um **regime de sigilo mais estrito que
o da LGPD geral**, fixado em **lei especial**: _"O resultado do exame **somente será divulgado para
o interessado** e **não poderá ser utilizado para fins estranhos** ao disposto neste artigo"_ — ou
ao § 6º do art. 168 da CLT (exame admissional/demissional do motorista profissional). São duas
regras em uma: **destinatário único** e **vinculação de finalidade por lei**.

Consequência direta e verificável para o PEC: **o sistema precisa do fato, não do laudo.** Para
operar o gate de [RN-PEC-120], basta saber que **existe resultado negativo válido** (e a data da
coleta, para calcular os 90 dias). O PEC **não deve** armazenar, exibir nem transmitir:

- o laudo laboratorial detalhado;
- as substâncias detectadas ou não detectadas;
- concentrações, metodologia analítica ou qualquer conteúdo clínico do exame.

Esta é a aplicação, ao caso concreto, do padrão de **validação em vez de dado bruto** já adotado no
corpus ([RN-BOAT-124]) — com a diferença de que aqui não é analogia de portaria: é **comando
expresso de lei**.

**Base legal.**

- [REF-CTB-147-148-habilitacao] art. 148-A, § 6º _(Incluído pela Lei nº 13.103, de 2015)_: _"O
  resultado do exame somente será divulgado para o interessado e não poderá ser utilizado para fins
  estranhos ao disposto neste artigo ou no § 6º do art. 168 da Consolidação das Leis do Trabalho
  [...]"_.
- [REF-CTB-147-148-habilitacao] art. 148-A, § 4º: direito de **contraprova** e de **recurso
  administrativo, sem efeito suspensivo**, em caso de resultado positivo.
- [REF-CONTRAN-923-1009-toxicologico] art. 3º: cadeia de custódia **com validade forense** desde a
  coleta até o registro no RENACH e a entrega do laudo **ao condutor**.
- [REF-CONTRAN-923-1009-toxicologico] art. 9º, §§ 1º-2º: retenção de **5 anos** do resultado
  eletrônico **e do material biológico**, **no laboratório credenciado** — não no PEC, não no
  DETRAN-AM.
- [REF-LEI-13709-2018] art. 5º, II (dado referente à saúde é dado sensível) e art. 6º, I e III
  (finalidade e necessidade) — a LGPD incide **cumulativamente**, e o art. 148-A, § 6º é _lex
  specialis_ mais restritiva, que prevalece onde for mais protetiva.

**Verificação.**

1. **Modelo de dados mínimo.** O que o PEC pode persistir sobre o toxicológico:
   `possui_resultado_negativo_valido` (booleano), `data_coleta` (para os 90 dias) e a **referência**
   ao registro no RENACH. Nada além disso tem finalidade demonstrável no processo do PEC.
2. **A cadeia de custódia é do laboratório, não do PEC.** O art. 3º descreve custódia com validade
   forense até a entrega **ao condutor** — o PEC não é elo dessa cadeia e não deve simular sê-lo.
3. **A retenção de 5 anos é do laboratório** — é o terceiro dos três prazos concorrentes tratados em
   [RN-PEC-141], e o único que **não** recai sobre o PEC.
4. **"Fins estranhos" alcança estatística e auditoria.** Nem o dashboard regulatório
   ([APP-DASHBOARD]) nem o papel `Auditor` do PEC têm finalidade legal para acessar conteúdo
   toxicológico; o que podem ver é o **cumprimento do gate**, não o exame.
5. **Contraprova e recurso são atos perante o laboratório/órgão**, não perante a clínica. Se o
   candidato contestar o resultado, o `process_block` do PEC **permanece** — o recurso é _sem efeito
   suspensivo_ por disposição expressa (§ 4º).

**Controvérsia/risco.** _Severidade: média-alta._ (a) O corpus **não descreve** hoje o que o PEC
recebe do RENACH sobre o toxicológico — se a integração devolver o laudo detalhado, o sistema
passará a tratar dado que a lei manda divulgar **somente ao interessado**, e a mera recepção já é
tratamento. É preciso verificar o contrato de integração **antes** de implementar. (b) "Interessado"
não é definido: a leitura óbvia é o próprio condutor; a CLT, referida no mesmo parágrafo, admite o
empregador em contexto trabalhista — o que **não** se estende ao órgão de trânsito. (c) A tensão
entre o sigilo do § 6º e a **transparência do processo administrativo** (acesso do interessado aos
autos que embasam ato desfavorável) resolve-se a favor do próprio titular, que é o destinatário
autorizado — mas não a favor de terceiros no mesmo processo. Item 8 de
`_intake/legal-assessment.md`.
