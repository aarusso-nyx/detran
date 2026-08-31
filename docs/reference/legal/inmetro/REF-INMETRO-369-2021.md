---
id: REF-INMETRO-369-2021
title: Portaria INMETRO nº 369, de 8/9/2021 — Regulamento Técnico Metrológico consolidado para etilômetros
orgao: INMETRO (Ministério da Economia)
status: vigente (em vigor desde 01/12/2021; revoga a Portaria INMETRO 6/2002 e a Portaria INMETRO 202/2010, das quais é consolidação)
url: 'http://www.inmetro.gov.br/legislacao/rtac/pdf/RTAC002831.pdf'
pdf: 'REF-INMETRO-PORTARIA-369-2021.pdf (txt: REF-INMETRO-PORTARIA-369-2021.txt)'
apps: [teat]
sources: [REF-CONTRAN-432, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

# O que este arquivo é

Primeiro arquivo do subdiretório `refs/inmetro/` (criado nesta rodada). Fecha o último elo da
cadeia normativa do procedimento de etilômetro: CTB art. 276, parágrafo único (margem de
tolerância "observada a legislação metrológica") → [REF-CONTRAN-432] art. 4º (aprovação de
modelo pelo INMETRO, verificação metrológica periódica) → **este Regulamento Técnico Metrológico**,
que fixa as condições mínimas do próprio instrumento de medição. Extraído via `pdftotext -layout`.

---

## Art. 1º — Objeto e escopo

> Art. 1º Fica aprovado o Regulamento Técnico Metrológico consolidado que estabelece as
> condições mínimas para etilômetros destinados a medir a concentração de álcool no ar expirado,
> correspondente a massa de álcool por litro de ar pulmonar profundo, fixado no Anexo.
>
> § 1º O disposto no regulamento se aplica aos etilômetros portáteis e não portáteis, usados para
> determinação da concentração de álcool no ar expirado por condutores de veículos, no âmbito da
> fiscalização de trânsito **com fins probatórios**.
>
> § 2º Para fins deste regulamento, o termo álcool refere-se ao etanol.

**Efeito no TEAT.** Confirma que a exigência de aparelho aprovado/verificado (CONTRAN 432 art. 4º)
tem propósito expresso de **valor probatório** — o dado do etilômetro só sustenta o AIT se o
aparelho estiver dentro do regime metrológico deste Regulamento. É base indireta de uma futura
validação de produto: o TEAT poderia recusar o registro de um teste de etilômetro se o aparelho
vinculado não tiver certificado de verificação metrológica vigente (dado hoje não modelado em
nenhum blueprint TEAT lido).

## Anexo (RTM) — itens com efeito direto de regra de negócio (verbatim, revisão LEGAL 2026-08-24)

A versão anterior deste REF não transcrevia o Anexo, por classificá-lo como conteúdo
técnico-metrológico. A revisão LEGAL identificou **quatro itens que não são técnicos, e sim
condições oponíveis de validade probatória** — extraídos verbatim de
`REF-INMETRO-PORTARIA-369-2021.txt`:

> **4.1 Marcas de verificação**
>
> 4.1.1 Etilômetros aprovados devem receber marca de verificação aposta conforme determinado em
> portaria de aprovação de modelo, em lugar visível ao usuário, preservando inscrições
> obrigatórias.
>
> 4.1.1.1 Para cada exemplar aprovado, deve ser emitido Certificado de Verificação contendo data de
> validade, que deve acompanhar o etilômetro.
>
> 4.1.2 Etilômetros reprovados devem receber selo de interdição.
>
> 4.1.2.1 Para cada exemplar reprovado, deve ser emitida Notificação de Reprovação.
>
> 4.1.2.2 No caso de reprovação em verificação subsequente, a marca de verificação anterior deve
> ser removida.

> **6.2 Verificação Inicial**
>
> 6.2.1 Todo modelo de etilômetro, importado ou produzido no Brasil, deve ser submetido e aprovado
> em verificação inicial por órgão da Rede Brasileira de Metrologia Legal e Qualidade do Inmetro
> (RBMLQ-I) antes de ser comercializado.

> **6.3 Verificação Subsequente**
>
> 6.3.1 A verificação periódica deve ser realizada a cada doze meses.
>
> 6.3.2 É responsabilidade do detentor do etilômetro encaminhar o instrumento ao órgão da RBMLQ-I.
>
> 6.3.3 Etilômetros reprovados em verificação periódica devem ser utilizados somente após aprovação
> em verificação após reparo.

> **6.4 Inspeção**
>
> 6.4.1 A inspeção será realizada em órgão da RBMLQ-I sempre que as autoridades competentes
> julgarem necessário.
>
> 6.4.1.1 Etilômetros reprovados em inspeção devem ser utilizados somente após aprovação em
> verificação após reparo.

**Efeito no TEAT — precondição probatória verificável pelo sistema.** O item **4.1.1.1** é o
dispositivo operacionalmente decisivo: existe, por exemplar, um **Certificado de Verificação com
data de validade que acompanha o aparelho**. Isso transforma "aparelho aferido" de conceito vago
em **campo com data**, que o TEAT pode validar no ato do teste: `data_do_teste ≤
verificacao_valida_ate`. O item **6.3.1** fixa a periodicidade de **doze meses**, e o **4.1.2**
cria o estado terminal oposto (**selo de interdição**). Aplica-se a: [RN-TEAT-135].

**Anotação LEGAL — divergência de nomenclatura com a Res. CONTRAN 432/2013.** O art. 4º, II da
[REF-CONTRAN-432] exige aprovação em verificação _"inicial, eventual, em serviço e anual"_; o RTM
estrutura o regime como **verificação inicial**, **verificação subsequente (periódica, a cada 12
meses)** e **inspeção**. As categorias não coincidem termo a termo, embora o conteúdo
substancialmente sim. Controle operacional recomendado: a **data de validade do Certificado de
Verificação**, por ser o dado que a própria norma metrológica torna oponível e que acompanha
fisicamente o exemplar. Registrado em `inf/teat/_intake/legal-assessment.md`, item 37.

## Art. 3º e 4º — Revogações e vigência

> Art. 3º Ficam revogadas: I - Portaria Inmetro nº 006, de 17 de janeiro de 2002…; e II - Portaria
> Inmetro nº 202, de 4 de junho de 2010…
>
> Art. 4º Esta Portaria entra em vigor em 1º de dezembro de 2021, conforme o art. 4º do Decreto nº
> 10.139, de 2019.

**Nota de conteúdo (atualizada na revisão LEGAL de 2026-08-24).** Os itens do Anexo com efeito de
**regra de negócio** foram transcritos verbatim na seção acima. O restante do Anexo permanece **não
transcrito** por ser efetivamente técnico-metrológico — definições de etilômetro portátil/não
portátil, tolerâncias em casas decimais (itens 2.x e 3.x), protocolos de ensaio de laboratório e
anexos A/B/C de ensaios de desempenho, incluindo a resolução de leitura de **0,001 mg/L** em ensaio
metrológico (item 3.2.2) e os requisitos de **selagem** que impedem acesso aos componentes (item
4.2). O PDF completo (18 páginas) permanece em
`refs/inmetro/REF-INMETRO-PORTARIA-369-2021.pdf` para consulta técnica pontual. **Nota**: os
valores de erro máximo admissível efetivamente aplicados na autuação vêm da _"Tabela de Valores
Referenciais para Etilômetro"_ do **Anexo I da [REF-CONTRAN-432]**, que remete a este RTM — a
tabela é o dado normativo a versionar no pacote normativo mobile ([WF-TEAT-003]), não este Anexo.

---

# Achados de conferência

Extração via `pdftotext -layout` do PDF oficial do INMETRO (`RTAC002831.pdf`, 18 páginas).
Consolidação confirmada (revoga expressamente as duas portarias anteriores de 2002 e 2010).

# Índice reverso — dispositivo → artefato TEAT

| Dispositivo                                                     | Artefato                          | Efeito                                                                |
| --------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Art. 1º §1º ("com fins probatórios")                            | procedimento de etilômetro (TEAT) | EXTENDE — fecha cadeia CTB→CONTRAN→INMETRO                            |
| Anexo 4.1.1.1 (Certificado de Verificação com data de validade) | [RN-TEAT-135]                     | **base direta** da validação `data_do_teste ≤ verificacao_valida_ate` |
| Anexo 4.1.2 (selo de interdição)                                | [RN-TEAT-135]                     | estado terminal `INTERDITADO` do instrumento                          |
| Anexo 6.3.1 (verificação periódica a cada 12 meses)             | [RN-TEAT-135]                     | periodicidade oponível                                                |
| Anexo 6.3.3 / 6.4.1.1 (uso após reparo)                         | [RN-TEAT-135]                     | reprovado só volta a operar após nova aprovação                       |
