---
id: RN-DASH-162
title: Dado de saúde em painel estatístico — art. 13 da LGPD: ambiente controlado, pseudonimização, vedação de revelar e proibição absoluta de transferência a terceiro
status: draft
apps: [dashboard, boat, pec]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

**Regra.** Quando um módulo do DASHBOARD derivar indicadores de **dado de saúde** — gravidade de lesão
e óbito de vítima de sinistro (BOAT), condição clínica de candidato à habilitação (PEC) —, o art. 13 da
LGPD é o **piso legal do tratamento intermediário**, e ele impõe quatro comandos que não admitem
flexibilização:

1. **Ambiente controlado e seguro**, com práticas de segurança, e **anonimização ou pseudonimização
   sempre que possível**.
2. **Tratamento exclusivamente dentro do órgão** e estritamente para a finalidade declarada.
3. **A divulgação de resultados, ou de qualquer excerto, em nenhuma hipótese poderá revelar dados
   pessoais.**
4. **Não é permitida, em circunstância alguma, a transferência dos dados a terceiro.**

A distinção entre os arts. 12 e 13 é o eixo desta regra e deve ser modelada explicitamente:
**o art. 12 trata do dado já anonimizado** (que sai do escopo da LGPD, se irreversível); **o art. 13
rege o processo intermediário** — o dado pseudonimizado, dentro do órgão, sob responsabilidade
exclusiva. São **dois estágios distintos**, com regimes distintos, e o DASHBOARD deve tê-los separados
na arquitetura, não apenas no discurso ([RN-DASH-160], item 1).

**Base legal.** [REF-LEI-13709-2018] art. 13 _(verbatim)_:

> Art. 13. Na realização de estudos em saúde pública, os órgãos de pesquisa poderão ter acesso a bases
> de dados pessoais, que serão **tratados exclusivamente dentro do órgão** e estritamente para a
> finalidade de realização de estudos e pesquisas e **mantidos em ambiente controlado e seguro**,
> conforme práticas de segurança previstas em regulamento específico e que incluam, sempre que
> possível, a **anonimização ou pseudonimização** dos dados, bem como considerem os devidos padrões
> éticos relacionados a estudos e pesquisas.
> § 1º A divulgação dos resultados ou de qualquer excerto do estudo ou da pesquisa de que trata o caput
> deste artigo **em nenhuma hipótese poderá revelar dados pessoais**.
> § 2º O órgão de pesquisa será o responsável pela segurança da informação prevista no caput deste
> artigo, **não permitida, em circunstância alguma, a transferência dos dados a terceiro**.
> § 3º O acesso aos dados de que trata este artigo será objeto de regulamentação por parte da
> autoridade nacional e das autoridades da área de saúde e sanitárias, no âmbito de suas competências.
> § 4º Para os efeitos deste artigo, a **pseudonimização** é o tratamento por meio do qual um dado
> perde a possibilidade de associação, direta ou indireta, a um indivíduo, **senão pelo uso de
> informação adicional mantida separadamente pelo controlador em ambiente controlado e seguro**.

Convergente — [REF-LEI-13709-2018] art. 46 (medidas de segurança técnicas e administrativas), art. 37
(registro das operações de tratamento) e art. 48 (comunicação de incidente).

**Verificação.**

1. **Dois acervos, fisicamente separados.** (a) Acervo de origem, com o vínculo ao indivíduo, dentro do
   app de domínio (BOAT/PEC), com acesso restrito. (b) Acervo derivado do DASHBOARD, **pseudonimizado
   na entrada** — a chave de reversão (§ 4º) fica **mantida separadamente**, sob controle do
   controlador, e **não acompanha** o acervo derivado. Se a chave viaja junto, não há pseudonimização,
   há renomeação de campo.
2. **Nenhuma exibição de dado de saúde individual no painel.** O DASHBOARD exibe **contagens e
   estados**; diagnóstico, restrição, laudo, causa de óbito e descrição de lesão não entram — nem em
   _drill-down_, nem em _tooltip_, nem em exportação. Ver [RN-DASH-132], item 3.
3. **Vedação absoluta de transferência a terceiro (§ 2º).** Isso alcança, sem exceção: fornecedores de
   BI em nuvem que não sejam operadores contratados sob o regime do controlador, ferramentas de
   analytics de terceiros embarcadas na página, exportações para parceiros, e — o caso mais provável na
   prática — **planilhas enviadas por e-mail para consultoria ou imprensa**. A norma diz _"em
   circunstância alguma"_; é das poucas vedações do corpus sem válvula de escape.
4. **§ 1º governa até o excerto.** _"Ou de qualquer excerto"_ significa que um recorte, um gráfico
   isolado, um número citado numa apresentação — todos estão sujeitos à mesma proibição de revelar
   dado pessoal. Um painel conforme que gera um slide não conforme descumpre o § 1º.
5. **Registro de operações e de acesso** ([REF-LEI-13709-2018] art. 37): o tratamento estatístico de
   dado de saúde entra no registro de operações do controlador, com finalidade, base legal e
   salvaguardas; e todo acesso ao acervo derivado é logado ([RN-DASH-171]).
6. **Relatório de Impacto (RIPD).** O art. 38 permite à ANPD exigir RIPD **inclusive quanto a dados
   sensíveis**. Um módulo de painel que agrega dado de saúde de vítima é candidato natural — e é
   prudente produzi-lo antes de ser solicitado, não depois.
7. **Encarregado no circuito.** A decisão sobre granularidade publicável de indicador derivado de dado
   de saúde exige manifestação do Encarregado ([RN-BOAT-127]), registrada. Não é decisão de time de
   produto.

**Controvérsia/risco.** _Severidade: alta._ Três pontos abertos e materiais. **(a) Enquadramento.** O
art. 13 é redigido para _"estudos em saúde pública"_ por _"órgãos de pesquisa"_ — o DETRAN-AM produzindo
estatística de sinistro **não é literalmente** um órgão de pesquisa fazendo estudo de saúde pública. A
leitura adotada aqui é que o art. 13 é o **piso de cuidado aplicável por analogia** (a atividade é
materialmente a mesma: tratar dado de saúde para produzir conhecimento agregado), e não a base legal do
tratamento — esta continua sendo o art. 11, II, "a"/"b" c/c art. 23 (política pública e execução de
competência legal, [RN-BOAT-123]). **Esta leitura precisa de validação jurídica formal** — é o item
mais importante do handoff LEGAL do dossiê. **(b)** O § 3º remete a regulamentação da ANPD e das
autoridades sanitárias **não localizada**, o que deixa "práticas de segurança previstas em regulamento
específico" sem conteúdo determinado. **(c)** A vedação do § 2º pode conflitar com a arquitetura de
nuvem e de BI já adotada pelo monorepo — o conflito precisa ser resolvido no desenho, e resolvê-lo
depois de publicado é caro.
