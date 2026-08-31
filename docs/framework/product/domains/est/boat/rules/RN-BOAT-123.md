---
id: RN-BOAT-123
title: Base legal do tratamento de dado de saúde da vítima — nenhuma norma a define; posição prudencial e o que ela exige do órgão
status: draft
apps: [boat]
sources:
  [
    REF-LEI-13709-2018,
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
    REF-CTB-sinistro-cena-renaest,
  ]
updated: 2026-08-24
---

**Regra.** **Nenhuma norma localizada — CTB, Lei 13.614/2018, Res. CONTRAN 808/2020, Portaria
SENATRAN 139/2025, atos do DETRAN-AM — indica qual é a hipótese legal de tratamento aplicável ao
dado de saúde da vítima de sinistro.** Duas normas afirmam que a LGPD deve ser observada
([REF-CONTRAN-808-2020] art. 5º, § 5º) e que o dado sensível exige hipótese do art. 11
([REF-SENATRAN-PORTARIA-139-2025] art. 18), **sem dizer qual**. Esta é a lacuna mais sensível de
todo o corpus BOAT. Na sua ausência, adota-se a posição prudencial abaixo — **rotulada como
interpretação de trabalho, sujeita a parecer jurídico humano**, e acompanhada das obrigações que ela
mesma faz nascer.

**Base legal (as hipóteses em disputa, verbatim).** [REF-LEI-13709-2018] art. 11:

> "Art. 11. O tratamento de dados pessoais sensíveis somente poderá ocorrer nas seguintes hipóteses:
> I - quando o titular ou seu responsável legal consentir, de forma específica e destacada, para
> finalidades específicas; II - sem fornecimento de consentimento do titular, nas hipóteses em que
> for **indispensável** para: a) cumprimento de obrigação legal ou regulatória pelo controlador;
> b) tratamento compartilhado de dados necessários à execução, pela administração pública, de
> políticas públicas previstas em leis ou regulamentos; [...] d) exercício regular de direitos,
> inclusive em contrato e em processo judicial, administrativo e arbitral [...]; e) proteção da vida
> ou da incolumidade física do titular ou de terceiro; f) tutela da saúde, exclusivamente, em
> procedimento realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária [...]"
>
> "§ 2º Nos casos de aplicação do disposto nas alíneas 'a' e 'b' do inciso II do caput deste artigo
> pelos órgãos e pelas entidades públicas, **será dada publicidade à referida dispensa de
> consentimento**, nos termos do inciso I do caput do art. 23 desta Lei."

Para o dado **não** sensível do sinistro (veículo, via, dinâmica, identificação de envolvidos), as
hipóteses correspondentes são o art. 7º, II (_"cumprimento de obrigação legal ou regulatória pelo
controlador"_) e III (_"pela administração pública, para o tratamento e uso compartilhado de dados
necessários à execução de políticas públicas previstas em leis e regulamentos"_), c/c o art. 23
(finalidade pública, execução de competências legais).

**Posição prudencial adotada (interpretação).**

1. **Base principal: art. 11, II, "a" — cumprimento de obrigação legal ou regulatória.** É a
   hipótese com melhor sustentação textual: o DETRAN-AM está **obrigado** a coletar dados de
   sinistro (CTB art. 22, IX) e a enviá-los ao RENAEST ([REF-CONTRAN-808-2020] art. 9º, II), e o
   registro se dá por **BAT**, cuja primeira categoria de dados é, por norma, _"à pessoa, vítima
   e/ou condutor"_ (art. 4º, I). Existe, portanto, obrigação normativa expressa que **não pode ser
   cumprida sem** tratar dado de vítima — que é exatamente o teste de "indispensável" do inciso II.
2. **Base concorrente: art. 11, II, "b" — política pública prevista em lei.** O Pnatrans é política
   pública instituída por lei (Lei 13.614/2018; CTB art. 326-A), e a meta de redução de mortes é
   apurada com o dado que o BOAT produz. Sustenta especificamente o **uso compartilhado**
   (estadual→federal) e o tratamento para fins estatísticos.
3. **O consentimento (art. 11, I) é inadequado e não deve ser buscado.** Em cena de sinistro o
   titular está frequentemente ferido, inconsciente ou morto; o consentimento não seria livre nem
   informado, e — decisivo — sua revogação não poderia ser atendida, porque o tratamento continuaria
   obrigatório por lei. Coletar consentimento aqui criaria aparência de escolha inexistente, o que é
   pior que não coletá-lo.
4. **A alínea "e" (proteção da vida/incolumidade física) sustenta o socorro, não a guarda
   registral.** Ela justifica o tratamento por quem presta atendimento, no momento em que o presta;
   **não** justifica a conservação do dado no DETRAN após encerrado o atendimento. Confundir as duas
   coisas é o erro mais provável nesta matéria.
5. **A alínea "f" (tutela da saúde) não está disponível ao DETRAN-AM.** O texto é expresso:
   _"exclusivamente, em procedimento realizado por profissionais de saúde, serviços de saúde ou
   autoridade sanitária"_ — o órgão de trânsito não é nenhum dos três. Se o dado vier do SAMU ou de
   secretaria de saúde ([RN-BOAT-112]), a base **daquele** órgão pode ser a "f"; a do DETRAN-AM,
   ao receber, não é.

**Obrigações que a posição adotada faz nascer** (não são opcionais se a base for "a"/"b"):

- **Publicidade da dispensa de consentimento** (art. 11, § 2º c/c art. 23, I): o DETRAN-AM deve
  publicar, em veículo de fácil acesso, a hipótese de tratamento, a previsão legal, a finalidade,
  os procedimentos e as práticas — hoje a página institucional de LGPD do órgão **não menciona**
  dado de saúde nem vítima de sinistro (`_intake/research-dossier.md` §7).
- **Registro da hipótese legal por caso de uso**, no mesmo padrão que a SENATRAN já exige de quem
  acessa seus sistemas ([REF-SENATRAN-PORTARIA-139-2025] art. 16, § 3º, III: _"hipótese legal de
  tratamento dos dados"_).
- **Vinculação estrita à finalidade** (art. 6º, I): dado de vítima coletado para registro/estatística
  não pode migrar para finalidade diversa sem nova análise.

**Verificação.** Fecha, com fundamentação, o "(fonte pendente)" de [RN-BOAT-003] — mas o fecha com
**interpretação**, não com norma. Toda tela, contrato e política de retenção derivada desta regra
deve citar a hipótese adotada e o fato de ela ser posição de trabalho.

**Controvérsia/risco.** _Severidade: ALTA — item nº 1 da lista de validação humana._ Três razões
para não tratar a questão como resolvida: (a) a qualificação de "indispensável" do art. 11, II é
mais estrita que a de "necessário" do art. 7º, e alcança cada campo isoladamente —
`health_notes`, campo de texto livre, é o mais difícil de justificar sob esse teste ([RN-BOAT-124]);
(b) a base "a" sustenta o tratamento **enquanto durar a obrigação legal**, o que torna a retenção
permanente juridicamente frágil ([RN-BOAT-125]); (c) o mesmo padrão de lacuna já foi identificado na
rodada TEAT para a bodycam (§2.3 de `inf/teat/_intake/legal-assessment.md`) — governança LGPD
institucional existente, sem tratamento do caso de uso sensível específico. Recomenda-se
**Relatório de Impacto à Proteção de Dados** ([REF-LEI-13709-2018] art. 38) e consulta ao Comitê de
Privacidade (CPPD) e ao Encarregado do DETRAN-AM **antes** de consolidar o modelo de dados de
vítima. Item 1 de `_intake/legal-assessment.md`.
