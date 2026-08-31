---
id: RN-PEC-152
title: Finalidade de habilitação e compartilhamento com o RENACH — vai o resultado, não o prontuário
status: draft
apps: [pec, dashboard]
sources:
  [
    REF-LEI-13709-2018,
    REF-CTB-147-148-habilitacao,
    REF-CONTRAN-927-2022,
    REF-CFP-01-2019,
  ]
updated: 2026-08-24
---

**Regra.** O compartilhamento com o RENACH é **compartilhamento entre entes públicos** (LGPD art.
26), fundado em obrigação legal expressa — mas é **delimitado pelo seu objeto**. A lei manda
registrar no RENACH **os resultados dos exames e a identificação dos examinadores**; manda consignar
o **prazo de inaptidão** e a **validade reduzida** na planilha RENACH; e manda comunicar a inaptidão
aos setores médico e psicológico do órgão para bloqueio. **Nada disso é o prontuário.**

**Regra de fronteira:** ao RENACH transmitem-se o **resultado**, sua **qualificação** (restrições
codificadas do Anexo XV, prazo de inaptidão, validade), a **identificação do examinador** e os
**metadados de integridade** do laudo. **Não** se transmitem anamnese, achados clínicos,
diagnósticos, protocolos de teste psicológico, nem o conteúdo do exame toxicológico ([RN-PEC-122]).

Essa fronteira não é escolha de arquitetura: é a aplicação conjunta do art. 6º, I e III da LGPD
(finalidade e necessidade) e do § 20 da [REF-CFP-01-2019], que já manda o resultado
_"restringir-se às informações estritamente necessárias à solicitação, preservando a individualidade
da(o) candidata(o)"_ — regra de minimização anterior à LGPD e específica desta perícia.

**Base legal.**

- [REF-LEI-13709-2018] art. 26: _"O uso compartilhado de dados pessoais pelo Poder Público deve
  atender a finalidades específicas de execução de políticas públicas e atribuição legal pelos órgãos
  e pelas entidades públicas, respeitados os princípios [...] do art. 6º"_; § 1º (vedação de
  transferência a entidades privadas, com exceções).
- [REF-LEI-13709-2018] art. 6º, I (finalidade), III (necessidade); art. 23 (finalidade pública).
- [REF-CTB-147-148-habilitacao] art. 147, § 1º: _"Os resultados dos exames e a identificação dos
  respectivos examinadores serão registrados no RENACH."_
- [REF-CONTRAN-927-2022] art. 9º, §§ 1º-2º (prazo de inaptidão e validade reduzida na planilha
  RENACH); art. 10, § 2º (comunicação do resultado de inaptidão ao órgão); art. 8º, parágrafo único
  (códigos do Anexo XV na CNH).
- [REF-CFP-01-2019] art. 2º, § 20 (minimização do resultado).

**Verificação.**

1. **O evento RENACH é um contrato de dados com fronteira legal.** Qualquer campo do _payload_ que
   não seja resultado, qualificação, examinador ou integridade precisa de justificativa própria — e
   provavelmente não a tem.
2. **A clínica credenciada é agente de tratamento.** Ela é **entidade privada** executando
   competência pública por credenciamento; o dado que produz é do processo de habilitação. A
   qualificação controlador/operador entre DETRAN-AM, clínica e plataforma PEC **não está resolvida
   por norma alguma** — mesmo problema estrutural de [RN-BOAT-127], aqui com uma camada a mais
   (o prestador privado). É determinante para saber **quem responde perante a ANPD e o titular**.
3. **Transferência a privado é regra restritiva** (art. 26, § 1º). Empregadores, seguradoras,
   empresas de transporte e CFCs **não** têm acesso ao resultado por essa via — ainda que tenham
   interesse legítimo aparente. A única exceção do corpus é a remissão do CTB art. 148-A, § 6º ao
   § 6º do art. 168 da CLT, e ela é **do laboratório para o empregador**, no exame toxicológico, não
   do PEC ([RN-PEC-122]).
4. **Estatística é finalidade distinta.** As remessas do art. 23 e do art. 24 da Res. 927/2022
   ([RN-PEC-115]) são **estatísticas** — devem ser agregadas, e não é evidente que precisem ser
   nominais. Um dashboard regulatório ([APP-DASHBOARD]) que exiba resultado por candidato identificado
   é tratamento com finalidade diversa da estatística declarada.
5. **A `renach_process_key` é identificador de vínculo**, e vincular o prontuário a ela dentro do PEC
   é necessário; **expor** a chave fora do circuito autorizado não é.

**Controvérsia/risco.** _Severidade: média-alta._ (a) **O corpus não descreve o conteúdo real do
payload RENACH** — a fronteira acima é normativa, não verificada contra a especificação de
integração. Verificá-la é pré-requisito de conformidade, não refinamento. (b) A repartição
controlador/operador entre DETRAN-AM, clínica credenciada e plataforma **não existe em norma nem em
instrumento contratual conhecido**; sem ela, a responsabilidade por incidente é indeterminada. (c) O
mesmo conflito de [RN-BOAT-126] item (b) reaparece: o acesso do **próprio candidato** ao seu dossiê é
direito ([RN-PEC-153]), mas o dossiê contém o **juízo pericial** de um profissional identificado —
sem colisão com dado de terceiro, ao contrário do BOAT, mas com tensão real quanto a anotações
técnicas do perito. Item 19 de `_intake/legal-assessment.md`.
