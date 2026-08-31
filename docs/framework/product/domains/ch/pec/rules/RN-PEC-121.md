---
id: RN-PEC-121
title: Exame toxicológico periódico pós-CNH (a cada 2 anos e 6 meses) — obrigação legal inteiramente ausente do corpus PEC
status: draft
apps: [pec, portal]
sources: [REF-CTB-147-148-habilitacao, REF-CONTRAN-923-1009-toxicologico]
updated: 2026-08-24
---

**Regra.** Além do exame de pré-etapa de [RN-PEC-120], existe um **segundo exame toxicológico,
recorrente e pós-habilitação**, que **nenhum artefato do corpus PEC modela**:

- **Quem**: condutores das categorias **C, D e E** com **idade inferior a 70 anos**;
- **Quando**: **a cada 2 (dois) anos e 6 (seis) meses**, a partir da obtenção ou renovação da CNH,
  **independentemente da validade dos demais exames** do art. 147;
- **Calendário**: calculado com base na **data de emissão da CNH registrada no RENACH**; a emissão
  de **segunda via não altera** o calendário;
- **Dispensa**: não exigido de condutor cuja **CNH tenha validade inferior a três anos**;
- **Validade do resultado**: **90 dias** (art. 10-B);
- **Aviso**: o órgão máximo executivo de trânsito da União encaminha **alerta de vencimento com 30
  dias de antecedência** e disponibiliza ao condutor a última data de coleta e a data de vencimento;
- **Resultado positivo**: **suspensão do direito de dirigir por 3 (três) meses**, cujo levantamento
  fica condicionado à inclusão no RENACH de resultado negativo em novo exame — **vedada a aplicação
  de outras penalidades, ainda que acessórias**;
- **Garantia**: direito de **contraprova** e de **recurso administrativo, sem efeito suspensivo**.

**Base legal.**

- [REF-CTB-147-148-habilitacao] art. 148-A, § 2º _(Redação dada pela Lei nº 14.071, de 2020)_:
  _"Além da realização do exame previsto no caput deste artigo, os condutores das categorias C, D e
  E com idade inferior a 70 (setenta) anos serão submetidos a novo exame a cada período de 2 (dois)
  anos e 6 (seis) meses, a partir da obtenção ou renovação da [CNH], independentemente da validade
  dos demais exames de que trata o inciso I do caput do art. 147 deste Código."_
- [REF-CTB-147-148-habilitacao] art. 148-A, § 4º (contraprova e recurso sem efeito suspensivo) e
  § 5º, II _(Incluído pela Lei nº 14.599, de 2023)_ (suspensão por 3 meses, vedadas outras
  penalidades).
- [REF-CONTRAN-923-1009-toxicologico] art. 10-A _(acrescentado pela Res. 1.009/2024)_ — calendário,
  segunda via, dispensa por validade inferior a três anos; art. 10-B (validade de 90 dias; alerta
  com 30 dias de antecedência); art. 16 (suspensão de três meses).

**Verificação.** Este é um **fluxo de negócio inteiro sem artefato correspondente** — não uma
lacuna de detalhe. Três perguntas de escopo que precisam de resposta antes de qualquer modelagem:

1. **O PEC participa?** O gatilho, o calendário e o alerta são operados pela **SENATRAN**
   diretamente com o condutor; o laboratório insere o resultado no **RENACH**. Nada nesse circuito
   passa necessariamente por uma clínica credenciada ou pelo PEC. A hipótese mais provável é que o
   exame periódico seja **100% externo** ao PEC.
2. **Mas o efeito não é.** A **suspensão do direito de dirigir** e o **bloqueio/desbloqueio** dela
   decorrente incidem sobre o mesmo condutor cujo cadastro o PEC bloqueia por inaptidão
   ([RN-PEC-106]) — dois bloqueios de origens distintas sobre o mesmo cadastro nacional. Se o PEC lê
   o estado do cadastro, precisa distinguir a causa.
3. **A suspensão é penalidade de trânsito** — objeto do domínio `inf` (suspensão do direito de
   dirigir), não do domínio `ch`. É a **fronteira entre domínios** mais concreta encontrada nesta
   rodada, e nenhum dos dois corpora a registra.

Enquanto a pergunta 1 não for respondida pelo Owner, esta regra **documenta a obrigação legal sem
prescrever comportamento ao PEC** — é o registro de um dever do condutor que o sistema pode precisar
conhecer, não necessariamente executar.

**Controvérsia/risco.** _Severidade: média — item de escopo de produto, não de conformidade._ (a) O
art. 148-A, § 5º, I foi **VETADO**, e o inciso II é a única consequência vigente; qualquer fonte
secundária que descreva penalidade adicional está errada. (b) A vedação expressa de _"outras
penalidades, ainda que acessórias"_ é uma limitação relevante: a suspensão de 3 meses é **exaustiva**
como consequência. (c) O direito de **contraprova** (§ 4º) cria uma via de contestação **distinta**
da junta médica de [RN-PEC-110] — outro objeto, outro rito, e nada no corpus a distingue. (d) O
recurso é **sem efeito suspensivo** — dito expressamente aqui, e **silenciado** na revisão do exame
clínico, o que é o argumento textual usado em [RN-PEC-110] para a leitura conservadora. Item 7 de
`_intake/legal-assessment.md`.
