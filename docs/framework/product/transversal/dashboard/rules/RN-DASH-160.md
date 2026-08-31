---
id: RN-DASH-160
title: Quando um painel agregado deixa de ser dado pessoal — art. 12 da LGPD e a reversibilidade como condição de validade
status: draft
apps: [dashboard, boat, pec, rait]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

**Regra.** Um painel agregado **só sai do regime da LGPD se o dado que o compõe estiver
efetivamente anonimizado** — e a lei define anonimização de forma **condicional e revogável**: o dado
anonimizado não é dado pessoal _"salvo quando o processo de anonimização [...] for revertido,
utilizando exclusivamente meios próprios, ou quando, **com esforços razoáveis, puder ser
revertido**"_. Duas consequências que o produto precisa internalizar:

1. **Agregar não é anonimizar.** Somar não apaga identidade. Uma contagem de "1" numa célula é um
   indivíduo com um rótulo em cima. A anonimização é **propriedade do resultado**, não operação
   aplicada à entrada.
2. **A proteção do art. 12 é condicional e pode ser perdida depois.** Um conjunto publicado hoje como
   anonimizado pode deixar de sê-lo amanhã, quando outro conjunto público permitir o cruzamento. A
   avaliação de reversibilidade é **contínua**, não um carimbo permanente.

Corolário de método: a pergunta operacional nunca é _"agregamos?"_ — é _**"com esforços razoáveis,
alguém consegue voltar ao indivíduo a partir do que publicamos?"**_. Se a resposta for sim ou "talvez",
o conteúdo continua sendo dado pessoal, com todas as obrigações da LGPD.

**Base legal.** [REF-LEI-13709-2018] art. 12 _(verbatim)_:

> Art. 12. Os dados anonimizados não serão considerados dados pessoais para os fins desta Lei, **salvo
> quando o processo de anonimização ao qual foram submetidos for revertido, utilizando exclusivamente
> meios próprios, ou quando, com esforços razoáveis, puder ser revertido.**

Princípios que sustentam a análise — [REF-LEI-13709-2018] art. 6º:

> III - **necessidade: limitação do tratamento ao mínimo necessário** para a realização de suas
> finalidades, com abrangência dos dados pertinentes, proporcionais e **não excessivos** em relação às
> finalidades do tratamento [...]; VII - **segurança** [...]; X - **responsabilização e prestação de
> contas: demonstração**, pelo agente, da adoção de medidas eficazes [...]

Princípio anti-reidentificação convergente — [REF-SENATRAN-PORTARIA-139-2025] art. 17, § 2º: _"A
classificação do grupo de informação como público ou restrito [...] dependerá da **conjugação entre os
parâmetros de entrada e de saída**"_ — a norma setorial adota exatamente o mesmo teste: o risco nasce
da combinação, não do campo isolado.

**Verificação.**

1. **Modelar dois estágios separados**, nunca um só ([RN-DASH-162]): o acervo **identificado ou
   pseudonimizado**, dentro do órgão e sob regime pleno da LGPD; e o **conjunto derivado
   anonimizado**, que é o único que pode sair. A fronteira entre os dois é o ponto de controle — é ali
   que se aplica a avaliação de reidentificação de [RN-DASH-161].
2. **Anonimização é engenharia, não marcação de campo** ([RN-BOAT-131]). Remover nome e CPF e manter
   data, hora, município, gravidade e tipo de veículo **não anonimiza nada** num domínio de eventos
   raros. Este é o erro mais frequente e o mais fácil de cometer de boa-fé.
3. **Registrar a decisão de anonimização** — método aplicado, limiares, risco residual aceito,
   responsável, data. É o art. 6º, X aplicado: sem registro, não há como **demonstrar** a adequação, e
   a demonstração é a obrigação.
4. **Reavaliação periódica** de cada conjunto publicado, e reavaliação **por evento** quando novo
   conjunto público correlato surgir (outra base do Estado, dado federal aberto, base de imprensa).
5. **Distinguir necessidade de conveniência.** O art. 6º, III limita ao **mínimo necessário**. Um
   painel de gestão que exibe recorte por município **e** faixa etária **e** gravidade **e** mês
   raramente precisa dos quatro simultaneamente — e é a interseção dos quatro que reidentifica.
   Reduzir dimensões é, ao mesmo tempo, conformidade e melhor design de painel.

**Controvérsia/risco.** _Severidade: alta._ O art. 12 usa o padrão aberto _"esforços razoáveis"_, sem
critério quantitativo. Não existe, no corpus, norma que fixe limiar de célula, k-anonimato ou
metodologia obrigatória para o setor de trânsito. Isso significa que **a definição do que é "razoável"
é decisão do órgão**, tomada com apoio do Encarregado ([RN-BOAT-127]) e **documentada** — e é
precisamente o tipo de decisão que precisa de parecer jurídico formal antes de qualquer publicação
envolvendo sinistros. Ver `_intake/legal-assessment.md`.
