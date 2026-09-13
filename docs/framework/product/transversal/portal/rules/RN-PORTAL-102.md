---
id: RN-PORTAL-102
title: Nível de conta gov.br (bronze/prata/ouro) não é nível de assinatura e não é norma — o PORTAL não pode gatilhar direito em cor de selo
status: draft
apps: [portal]
sources:
  [
    REF-DECRETO-10543-2020,
    REF-DECRETO-8936-2016,
    REF-LEI-14063-2020,
    REF-MP-2200-2-2001,
  ]
updated: 2026-09-13
---

**Regra.** São **dois eixos distintos**, e o PORTAL deve mantê-los separados no código, na UX e na
Carta de Serviços:

| Eixo                      | O que classifica                            | Valores                          | Natureza jurídica                                                                                                                  |
| ------------------------- | ------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Nível de assinatura**   | O **ato** praticado                         | simples / avançada / qualificada | **Normativo** — [REF-LEI-14063-2020] art. 4º e [REF-DECRETO-10543-2020] art. 4º                                                    |
| **Nível de conta gov.br** | A **confiabilidade do cadastro** do usuário | bronze / prata / ouro            | **Não normativo** — classificação técnico-operacional da Plataforma gov.br, sem Decreto, Portaria ou IN localizado como fundamento |

Consequências vinculantes:

1. **A regra de negócio se escreve em nível de assinatura, nunca em cor de selo.** Um caso de uso do
   PORTAL declara `nivel_assinatura_minimo: avancada` ([RN-PORTAL-101]); **não** declara "exige conta
   prata". A cor da conta pode entrar no produto apenas como **heurística de orientação** ("sua conta
   atual não permite assinar este documento — veja como elevá-la"), jamais como o predicado que
   autoriza ou nega o ato.
2. **Nível de conta é meio de prova de identidade, não o requisito.** O requisito legal do nível
   avançado é o do art. 5º, II do Decreto: cadastro com garantia de identidade por validação
   biográfica/documental conferida por agente público, validação biométrica em base governamental,
   ou validação por validador de acesso digital de elevado grau de segurança. Uma conta gov.br
   "prata" ou "ouro" é **uma** forma de satisfazer isso — não a única, e não a norma.
3. **Nunca negar um direito por insuficiência de selo.** Se o usuário não consegue elevar a conta, o
   ato continua devido: por assinatura presencial ([RN-PORTAL-105]), por certificado ICP-Brasil, ou
   por qualquer outro meio de comprovação de autoria admitido. A conta gov.br é infraestrutura de
   conveniência, e a indisponibilidade de infraestrutura de terceiro não extingue prazo nem direito
   do administrado.

**Base legal.**

- [REF-LEI-14063-2020] art. 4º, II: a assinatura avançada é _"a que utiliza certificados não emitidos
  pela ICP-Brasil ou outro meio de comprovação da autoria e da integridade [...], desde que admitido
  pelas partes"_ — a lei define a assinatura por suas **propriedades** (associação unívoca, controle
  exclusivo, detectabilidade de modificação), não por um provedor ou por um selo.
- [REF-DECRETO-10543-2020] art. 5º: _"I - para a utilização de assinatura simples, o usuário poderá
  fazer seu cadastro pela internet, mediante autodeclaração validada em bases de dados
  governamentais; II - para a utilização de assinatura avançada, o usuário deverá realizar o cadastro
  com garantia de identidade a partir de validador de acesso digital, incluída a: a) validação
  biográfica e documental, presencial ou remota, conferida por agente público; b) validação
  biométrica conferida em base de dados governamental; ou c) validação biométrica, biográfica ou
  documental [...] conferida por validador de acesso digital que demonstre elevado grau de segurança
  [...]; e III - para utilização de assinatura qualificada, o usuário utilizará certificado digital,
  nos termos da Medida Provisória nº 2.200-2, de 2001."_
- [REF-DECRETO-10543-2020] art. 6º: _"As contas digitais na Plataforma gov.br [...] **podem** realizar
  assinaturas eletrônicas, respeitados os níveis mínimos previstos no art. 4º"_ — verbo facultativo:
  a Plataforma é **um** provedor habilitado, não o titular exclusivo da função.
- [REF-DECRETO-8936-2016] art. 1º, III: a Plataforma disponibiliza os serviços _"mediante o nível de
  autenticação requerido"_ — **única** menção a nível de autenticação em todo o decreto fundacional
  da Plataforma, e sem qualquer detalhamento de bronze/prata/ouro.
- [REF-MP-2200-2-2001] art. 10, § 2º: _"O disposto nesta Medida Provisória não obsta a utilização de
  outro meio de comprovação da autoria e integridade de documentos em forma eletrônica, inclusive os
  que utilizem certificados não emitidos pela ICP-Brasil, desde que admitido pelas partes como válido
  ou aceito pela pessoa a quem for oposto o documento."_

**Verificação.** (a) Busca no código e no conteúdo do PORTAL por "bronze", "prata" e "ouro" não pode
retornar nenhuma ocorrência em posição de condição de autorização — apenas em texto de ajuda. (b) A
Carta de Serviços publica, por serviço, o **nível de assinatura** exigido ([RN-PORTAL-108]), nunca o
nível de conta. (c) O modelo de identidade do PORTAL guarda `nivel_assinatura_disponivel` derivado
das credenciais efetivamente apresentadas, e trata `nivel_conta_govbr` como metadado informativo,
sem efeito de autorização.

**Controvérsia/risco.** A correção de premissa registrada em [REF-DECRETO-10543-2020] ("Anotação de
risco — a origem real do bronze/prata/ouro") vem de pesquisa dirigida na página institucional da
Plataforma gov.br, que descreve os três níveis sem apontar instrumento normativo. **Achado negativo,
não prova de inexistência**: é possível que exista Portaria ou Instrução Normativa da Secretaria de
Governo Digital não localizada. Ainda que exista, seria ato **federal** de organização da própria
Plataforma — não criaria requisito oponível ao administrado perante uma autarquia estadual. A regra
acima é, portanto, robusta aos dois cenários. Item 4 de `_intake/legal-assessment.md`.

**Atualização (2026-09-13, steering.md H.50).** A regra permanece: a cor do selo não é norma.
Operacionalmente, o Owner decidiu que o PORTAL trata os selos **ouro e prata** como satisfazendo o
nível avançado exigido por [RN-PORTAL-101] (Decreto 10.543/2020, art. 4º), e bronze como
insuficiente, enquanto o DETRAN-AM não edita portaria própria sobre o selo prata (a PN 001/2025
menciona só o ouro). A heurística de orientação desta regra continua valendo na interface.
