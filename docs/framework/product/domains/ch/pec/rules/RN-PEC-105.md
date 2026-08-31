---
id: RN-PEC-105
title: Vocabulário legal do resultado — `CONDICIONADO` não existe em norma alguma e deve ser mapeado para "apto com restrições"; as trilhas médica e psicológica têm taxonomias distintas
status: draft
apps: [pec, portal, dashboard]
sources:
  [
    REF-CONTRAN-927-2022,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-CTB-147-148-habilitacao,
  ]
updated: 2026-08-24
---

**Regra.** O resultado do exame é **dado normativo de vocabulário fechado**, não rótulo de
produto: ele é consignado na CNH e na planilha RENACH, e produz efeitos jurídicos distintos por
valor. Três taxonomias circulam hoje no mesmo processo, **nenhuma delas idêntica às outras**, e a
regra de correção é a seguinte.

**1. Taxonomia legal do exame de aptidão física e mental — quatro valores, exaustivos:**

| Valor legal             | Quando                                                      | Efeito                                    |
| ----------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| **apto**                | sem contraindicação para a categoria pretendida             | segue o processo                          |
| **apto com restrições** | há restrição ao condutor ou adaptação veicular a registrar  | **exige** código do Anexo XV na CNH       |
| **inapto temporário**   | motivo de reprovação **passível** de tratamento ou correção | prazo de inaptidão + bloqueio do cadastro |
| **inapto**              | motivo **irreversível**, sem possibilidade de tratamento    | bloqueio do cadastro                      |

**2. Taxonomia legal da avaliação psicológica — apenas três valores:** _apto_, _inapto temporário_,
_inapto_. **Não existe "apto com restrições" na trilha psicológica.** O análogo funcional é o
**apto com prazo de validade diminuído** do art. 9º, § 2º ([RN-PEC-103]) — que é um _apto_, com
outro atributo, e não um quarto rótulo.

**3. Regra de correção do enum do PEC.** `medical_result = 'CONDICIONADO'` **não corresponde a
nenhum valor normativo** — o termo não aparece na Res. CONTRAN 927/2022, na Portaria DETRAN-AM
005/2021, no CTB nem em qualquer norma capturada. Correção obrigatória:

- `CONDICIONADO` **≡ "apto com restrições"**, e **somente** na trilha médica;
- o enum **não pode ser compartilhado** entre as duas trilhas: a trilha psicológica precisa de
  enum próprio de três valores + atributo de validade reduzida;
- o valor exibido ao candidato, transmitido ao RENACH e impresso em qualquer documento deve ser
  **o rótulo legal**, nunca o identificador interno.

**4. O rótulo local "PENDENTE" não é um resultado.** A Portaria DETRAN-AM 005/2021 lista cinco
rótulos, incluindo _PENDENTE_, ausente da norma federal. Leitura de trabalho adotada: os quatro
valores do art. 8º da Res. 927/2022 são **exaustivos como resultado**; "PENDENTE" descreve um
**estado do processo** (exame não concluído, aguardando complemento ou junta), não uma conclusão
pericial — e deve ser modelado como estado do `encounter`, jamais gravado em `medical_result` nem
transmitido ao RENACH como resultado.

**Base legal.**

- [REF-CONTRAN-927-2022] art. 8º: _"No exame de aptidão física e mental, o candidato será
  considerado pelo médico perito examinador de trânsito como: I - apto [...]; II - apto com
  restrições - quando houver necessidade de registro na CNH de qualquer restrição referente ao
  condutor ou adaptação veicular; III - inapto temporário - quando o motivo da reprovação [...] for
  passível de tratamento ou correção; ou IV - inapto - quando o motivo da reprovação [...] for
  irreversível [...]. Parágrafo único. No resultado 'apto com restrições' constarão da CNH as
  observações codificadas no Anexo XV."_
- [REF-CONTRAN-927-2022] art. 9º: _"Na avaliação psicológica, o candidato será considerado [...]
  como: I - apto [...]; II - inapto temporário [...], porém passível de adequação; ou III - inapto
  [...]"_; § 2º (apto com validade diminuída).
- [REF-DETRANAM-PORTARIA-005-2021] art. 34, § 9º (novo): _"Registrar resultado da avaliação [...]
  constando carimbo do Médico e/ou Psicólogo assinando: APTO, APTO COM RESTRIÇÕES, PENDENTE, INAPTO
  OU INAPTO TEMPORARIAMENTE, determinando os respectivos tempos: 30, 60, 90 e 365 dias e
  ENCAMINHAMENTO À JUNTA MÉDICA ESPECIAL."_
- [REF-CTB-147-148-habilitacao] art. 147, § 1º (o resultado é registrado no RENACH — logo o
  vocabulário é o do sistema nacional, não o do sistema local).

**Verificação.** Consequências verificáveis, em ordem de risco:

1. **O enum do schema é dado de fronteira.** O que o RENACH aceita é a taxonomia federal; o PEC é
   satélite ([APP-PEC]) e não define vocabulário. Um mapeamento explícito
   `enum interno → rótulo legal` deve existir como tabela versionada, com teste que falhe se algum
   valor interno não tiver correspondente legal.
2. **`CONDICIONADO` sem restrição aplicada é estado inválido** — já é o que [RN-PEC-006] exige
   (item 5 do gate), e a base legal disso é o parágrafo único do art. 8º: o rótulo _existe para_
   carregar a codificação do Anexo XV. Sem código, o rótulo não tem conteúdo.
3. **Os códigos do Anexo XV não foram capturados** — o art. 30 da Res. 927/2022 publica os Anexos
   I-XXII separadamente, fora do PDF do DOU (negativo registrado no dossiê §2). Sem eles, o campo
   de restrição do PEC não tem domínio de valores validável. Item de pesquisa prioritário.
4. **A trilha psicológica não pode reusar o enum médico** — hoje o corpus fala de
   `medical_result` como se fosse o resultado do episódio; são dois resultados independentes, com
   taxonomias diferentes, e o episódio não tem um "resultado" único.
5. **"Apto com restrições" não é reprovação.** Diferentemente de _inapto temporário_, não gera
   bloqueio de cadastro ([RN-PEC-106]) — confundir os dois na UI ou no RENACH tem efeito jurídico
   direto sobre o cidadão.

**Controvérsia/risco.** _Severidade: alta — item nº 1 da lista de validação humana._ Quatro pontos
abertos: (a) **qual vocabulário o RENACH efetivamente aceita** não foi confirmado contra nenhuma
especificação de integração — a inferência de que é o federal decorre do art. 147, § 1º do CTB,
não de documento técnico; (b) a Portaria DETRAN-AM 005/2021 **contraria a norma federal** ao
aplicar "APTO COM RESTRIÇÕES" também ao psicólogo (o art. 9º da Res. 927/2022 não prevê esse
valor) e ao criar "PENDENTE" — norma estadual não pode ampliar taxonomia que a resolução federal
fixa exaustivamente, mas a divergência **existe no documento que o DETRAN-AM aplica**; (c) os
prazos _"30, 60, 90 e 365 dias"_ são **quatro números para cinco rótulos**, sem indicação de qual
prazo corresponde a qual — a correspondência é **indeterminada no texto** e não deve ser inferida
pelo produto; (d) a vigência da própria Portaria 005/2021 não está confirmada (possível Portaria
008/2021, 404 na captura — item 5 abaixo). Recomenda-se **consulta formal ao DETRAN-AM** sobre o
vocabulário efetivamente exigido e sobre a tabela prazo↔rótulo, **antes** de congelar o enum. Item
1 de `_intake/legal-assessment.md`.
