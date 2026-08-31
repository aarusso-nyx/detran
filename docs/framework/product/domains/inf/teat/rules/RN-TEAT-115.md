---
id: RN-TEAT-115
title: Campos de identificação do veículo não podem ser autopreenchidos sem validação do agente
status: draft
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** O talão eletrônico deve **impedir que os campos destinados à identificação do veículo
sejam preenchidos de forma automática a partir da informação da placa ou de outro elemento de
identificação, sem que haja validação dos dados do campo pelo agente**. Consulta a bases
(RENAVAM) e leitura óptica de placa (OCR/ANPR) são **permitidas como sugestão**; o que a norma
proíbe é a **efetivação do preenchimento sem ato de validação do agente sobre o campo**. A
validação é por campo, não por tela: "validação dos dados do campo pelo agente" não se satisfaz
com um aceite global no fim do formulário.

**Base legal.**

- [REF-SENATRAN-997] art. 3º, VI: _"impedir que os campos destinados à identificação do veículo
  sejam preenchidos de forma automática a partir da informação da placa ou outro elemento de
  identificação de veículo, sem que haja validação dos dados pelo agente."_
- [REF-SENATRAN-997] Anexo II, d): mesma vedação, com a precisão _"sem que haja validação dos
  dados **do campo** pelo agente"_.
- Contraponto autorizativo: [REF-SENATRAN-997] art. 3º §1º — o talão _"poderá ser dotado de
  arquivos que contenham informações, tais como código de municípios, endereços, veículos,
  condutores, códigos de infração e legislação"_. Ter a base embarcada é lícito; **usá-la para
  preencher sozinha a identificação do veículo, não**.

**Verificação.** Requisito **não modelado** em nenhum blueprint TEAT lido — gap real, com
consequência jurídica direta: um AIT cujo campo de veículo foi preenchido por OCR sem confirmação
é atacável por vício de constatação, porque o agente não atestou o que autuou. Implementação:
todo campo do grupo "identificação do veículo" (placa, marca, espécie e demais elementos do art.
280, III) carrega `source` ∈ {AGENTE, SUGERIDO_OCR, SUGERIDO_BASE} e `validated_by_agent`
booleano; a finalização é bloqueada enquanto houver campo com `source ≠ AGENTE` e
`validated_by_agent = false`. O `source` é dado de auditoria e deve constar da trilha do
Anexo II, j) ([RN-TEAT-112]).

**Controvérsia/risco.** A vedação alcança "os campos destinados à identificação do veículo" — não
diz se alcança também campos derivados (município, endereço, dados do proprietário trazidos da
mesma consulta). Leitura de trabalho: alcança **todo campo do auto cujo valor tenha origem na
leitura da placa**, porque o vício que a norma combate é o mesmo. Interpretação extensiva
deliberada, em favor da defensabilidade — item 14 de `_intake/legal-assessment.md`.
