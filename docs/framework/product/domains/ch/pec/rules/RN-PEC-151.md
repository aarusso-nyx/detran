---
id: RN-PEC-151
title: Base legal do tratamento — art. 11, II, "a" (obrigação legal); a alínea "f" (tutela da saúde) é uma armadilha e o consentimento é inadequado
status: draft
apps: [pec]
sources: [REF-LEI-13709-2018, REF-CTB-147-148-habilitacao, REF-CONTRAN-927-2022]
updated: 2026-08-24
---

**Regra.** A hipótese legal de tratamento do dado sensível do candidato é o **art. 11, II, "a" da
LGPD — cumprimento de obrigação legal ou regulatória pelo controlador**. É a base com melhor
sustentação textual: o exame de aptidão física e mental é **imposto por lei** (CTB art. 147, I), o
registro do resultado e do examinador no RENACH é **imposto por lei** (art. 147, § 1º), e nenhuma
dessas obrigações pode ser cumprida **sem** tratar dado de saúde e dado biométrico do candidato —
que é exatamente o teste de _"indispensável"_ do inciso II.

**Base concorrente:** art. 11, II, **"b"** (tratamento compartilhado necessário à execução de
política pública prevista em lei), que sustenta especificamente o **uso compartilhado** com o RENACH
([RN-PEC-152]).

**Três posições negativas, que importam tanto quanto a positiva:**

1. **A alínea "f" (tutela da saúde) NÃO se aplica — e é a armadilha específica deste domínio.**
   O texto autoriza o tratamento _"para a tutela da saúde, **exclusivamente**, em procedimento
   realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária"_. No PEC há, de
   fato, profissionais de saúde praticando o ato — o que torna a alínea **superficialmente
   atraente**. Mas a alínea exige que a finalidade seja a **tutela da saúde do titular**, e a
   finalidade do PEC é **pericial e habilitacional**: apurar aptidão para conduzir, em benefício da
   segurança viária. O médico perito **não trata** o candidato; não há relação assistencial, não há
   conduta terapêutica, não há continuidade de cuidado. Invocar a "f" produziria dois erros em
   cadeia: legitimaria um tratamento sob finalidade que ele não tem, e **importaria** o regime de
   sigilo assistencial para um documento que a lei manda enviar a um registro nacional. É o inverso
   do erro identificado em [RN-BOAT-123] item 5 — lá a "f" era indisponível por falta de profissional
   de saúde; aqui é indisponível **apesar** de haver profissional de saúde.
2. **O consentimento (art. 11, I) é inadequado e não deve ser buscado.** O exame é **condição legal**
   para obter ou renovar a habilitação: o candidato não tem alternativa senão submeter-se. Um
   consentimento nessas condições não é livre, e sua **revogação não poderia ser atendida**, porque o
   tratamento continuaria obrigatório por lei. Coletá-lo criaria aparência de escolha inexistente —
   mesma conclusão de [RN-BOAT-123] item 3, por razão diferente (lá, incapacidade de consentir; aqui,
   ausência de alternativa).
3. **A alínea "e" (proteção da vida ou da incolumidade física) não sustenta a guarda registral.**
   Poderia justificar uma conduta de urgência durante o atendimento; não justifica a conservação do
   dado depois.

**Obrigações que a base adotada faz nascer** (não são opcionais sob "a"/"b"):

- **Publicidade da dispensa de consentimento** — art. 11, § 2º c/c art. 23, I: o DETRAN-AM deve
  publicar, em veículo de fácil acesso, a hipótese de tratamento, a previsão legal, a finalidade, os
  procedimentos e as práticas relativos ao exame de aptidão. Mesma pendência já identificada no BOAT.
- **Registro da hipótese legal por caso de uso**, no padrão de [RN-BOAT-126].
- **Vinculação estrita à finalidade** (art. 6º, I): dado colhido para habilitação **não migra** para
  finalidade diversa — nem estatística nominal, nem cruzamento com infrações, nem fiscalização.

**Base legal.**

- [REF-LEI-13709-2018] art. 11, II, "a", "b", "e" e "f"; art. 11, I; art. 11, § 2º; art. 6º, I e III;
  art. 23, I.
- [REF-CTB-147-148-habilitacao] art. 147, I e § 1º; art. 148-A (toxicológico, com o sigilo especial
  de [RN-PEC-122]).
- [REF-CONTRAN-927-2022] art. 10 e art. 10, § 2º (comunicação obrigatória do resultado de inaptidão
  ao órgão — tratamento imposto por norma).

**Verificação.**

1. **A base "a" é mais forte no PEC do que era no BOAT.** Lá a obrigação decorria de competência
   genérica de coleta estatística; aqui há **lei que impõe o exame** e **lei que impõe o registro do
   resultado**. O teste de indispensabilidade é satisfeito com folga para o núcleo.
2. **Mas ela não cobre tudo.** _"Indispensável"_ alcança **cada campo isoladamente**. Campos de texto
   livre de anamnese, observações clínicas não conclusivas e histórico de saúde não relacionado à
   aptidão são o equivalente PEC do `health_notes` de [RN-BOAT-124]: difíceis de sustentar sob esse
   teste. A orientação de [RN-BOAT-124] item 3 aplica-se integralmente — estruturar em vez de texto
   livre, e orientar explicitamente sobre o que **não** se registra.
3. **A base "a" dura enquanto durar a obrigação legal** — e aqui, ao contrário do BOAT, a obrigação
   legal **fixa expressamente 20 anos** ([RN-PEC-141]). A fragilidade que [RN-BOAT-123] apontava na
   retenção **não existe** neste domínio.
4. **O RIPD (art. 38) é recomendado**, pelas mesmas razões de [RN-BOAT-123]: tratamento sistemático e
   em larga escala de dado sensível, com decisão que afeta direito do titular.

**Controvérsia/risco.** _Severidade: média-alta._ (a) Nenhuma norma de trânsito indica a hipótese
legal aplicável — a conclusão acima é **interpretação de trabalho**, exatamente como em
[RN-BOAT-123], e está rotulada como tal. (b) O resultado do exame é **decisão que afeta direito** do
titular (dirigir), o que aproxima o caso do art. 20 da LGPD (revisão de decisões automatizadas) — não
incide hoje, porque a decisão é **humana** (do perito, art. 10 da Res. 927/2022), mas incidiria se
alguma etapa vier a ser automatizada. Registrar essa fronteira. (c) A tentação de invocar a alínea
"f" é o risco jurídico mais provável deste domínio, precisamente porque parece correta; está
documentada acima para que a escolha errada não seja feita por descuido. Item 18 de
`_intake/legal-assessment.md`.
