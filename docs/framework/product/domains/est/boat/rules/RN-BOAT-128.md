---
id: RN-BOAT-128
title: Compartilhamento com parceiros — regime público↔público (LGPD art. 26) e a vedação específica do art. 11, §4º quanto ao DPVAT
status: draft
apps: [boat]
sources: [REF-LEI-13709-2018, REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** O compartilhamento de dados de sinistro com os parceiros do art. 6º da Res. CONTRAN
808/2020 ([RN-BOAT-112]) obedece a **dois regimes distintos, e não a um**:

- **Com entes públicos** (Ministério da Saúde, secretarias de saúde, SAMU, polícias civis, corpos de
  bombeiros): aplica-se o art. 26 da LGPD — o uso compartilhado deve atender a **finalidades
  específicas de execução de políticas públicas e atribuição legal**, com observância dos princípios
  do art. 6º. É via aberta, desde que finalística e documentada.
- **Com a administradora do Seguro DPVAT**, que é **pessoa jurídica de direito privado**: aplica-se
  o regime restritivo dos arts. 26, § 1º e 27 (transferência público→privado, em regra **vedada**,
  salvo hipóteses taxativas) e — decisivamente — a vedação do **art. 11, § 4º**: _é vedado o
  compartilhamento, entre controladores, de dado sensível referente à saúde **com objetivo de obter
  vantagem econômica**_, cujas exceções são todas relativas a prestação de serviços de saúde,
  assistência farmacêutica e assistência à saúde. **Seguro não é nenhuma delas.**

**Base legal.** [REF-LEI-13709-2018]:

> "Art. 26. O uso compartilhado de dados pessoais pelo Poder Público deve atender a finalidades
> específicas de execução de políticas públicas e atribuição legal pelos órgãos e pelas entidades
> públicas, respeitados os princípios de proteção de dados pessoais elencados no art. 6º desta Lei.
> § 1º **É vedado ao Poder Público transferir a entidades privadas dados pessoais** constantes de
> bases de dados a que tenha acesso, exceto: I - em casos de execução descentralizada de atividade
> pública que exija a transferência, exclusivamente para esse fim específico e determinado [...];
> IV - quando houver previsão legal ou a transferência for respaldada em contratos, convênios ou
> instrumentos congêneres; ou V - na hipótese de a transferência dos dados objetivar exclusivamente
> a prevenção de fraudes e irregularidades, ou proteger e resguardar a segurança e a integridade do
> titular dos dados, desde que vedado o tratamento para outras finalidades; VI - nos casos em que os
> dados forem acessíveis publicamente [...]"
>
> "Art. 11 [...] § 4º **É vedada a comunicação ou o uso compartilhado entre controladores de dados
> pessoais sensíveis referentes à saúde com objetivo de obter vantagem econômica**, exceto nas
> hipóteses relativas a prestação de serviços de saúde, de assistência farmacêutica e de assistência
> à saúde, desde que observado o § 5º deste artigo, incluídos os serviços auxiliares de diagnose e
> terapia, em benefício dos interesses dos titulares de dados, e para permitir: I - a portabilidade
> de dados quando solicitada pelo titular; ou II - as transações financeiras e administrativas
> resultantes do uso e da prestação dos serviços de que trata este parágrafo."
>
> "Art. 27. A comunicação ou o uso compartilhado de dados pessoais de pessoa jurídica de direito
> público a pessoa de direito privado será informado à autoridade nacional e dependerá de
> consentimento do titular, exceto: I - nas hipóteses de dispensa de consentimento previstas nesta
> Lei; II - nos casos de uso compartilhado de dados, em que será dada publicidade [...]; ou III - nas
> exceções constantes do § 1º do art. 26 desta Lei."

[REF-CONTRAN-808-2020] art. 6º, § 1º, V (a administradora do DPVAT entre os integrantes facultativos)
e § 3º (integra-se **por meio da União**, não do Estado).

**Verificação.** Regras de desenho que decorrem diretamente:

1. **O DETRAN-AM não é a via de integração do DPVAT.** O § 3º manda a administradora integrar-se
   **pela União**. Logo o BOAT **não deve** desenhar canal de envio de dado de vítima ao seguro; se
   o fluxo existir, ele é federal.
2. **Se algum fluxo local ao seguro vier a ser proposto**, ele deve ser bloqueado quanto a **dado de
   saúde** enquanto não houver parecer que enquadre a hipótese no art. 11, § 4º — o que, pela
   literalidade, é improvável. Dado **não** sensível do sinistro (local, data, veículos) segue o
   regime do art. 26, § 1º/27, exigindo previsão legal ou convênio, com informe à ANPD.
3. **Com órgãos de saúde**, o compartilhamento é de **mão dupla** e deve ser tratado como tal:
   ao receber dado de saúde do SAMU, o DETRAN-AM passa a tratá-lo e responde por ele
   ([RN-BOAT-127]); ao devolver, precisa de finalidade específica documentada.
4. Todo compartilhamento deve registrar **finalidade, base legal e instrumento** (convênio, acordo),
   no mesmo padrão de caso de uso que a SENATRAN exige de terceiros
   ([REF-SENATRAN-PORTARIA-139-2025] art. 16, § 3º).

**Controvérsia/risco.** _Severidade: alta se o fluxo DPVAT for priorizado; baixa enquanto não for._
A Res. 808/2020 **nomeia** a administradora do DPVAT como possível integrante do RENAEST, e a LGPD
**veda** o compartilhamento de dado de saúde com vantagem econômica entre controladores — as duas
normas convivem sem se falar. A leitura harmônica possível: a integração do art. 6º, § 1º, V
alcança o **fluxo de sinistro** (ocorrência, veículos, local), não o **dado clínico da vítima**; e o
que a seguradora precisa para liquidar sinistro obtém do próprio beneficiário, não do órgão de
trânsito. **É interpretação sobre conflito aparente entre norma setorial e norma geral de proteção
de dados, e precisa de parecer** antes de qualquer integração. Item 5 de
`_intake/legal-assessment.md`.
