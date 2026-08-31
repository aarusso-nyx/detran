---
id: RN-PORTAL-103
title: CPF é identificador suficiente do cidadão — vedado exigir outro número para identificá-lo
status: draft
apps: [portal]
sources:
  [
    REF-LEI-13460-2017,
    REF-LEI-14129-2021,
    REF-CONTRAN-809-2020,
    REF-CONTRAN-900,
  ]
updated: 2026-08-24
---

**Regra.** O identificador primário da pessoa natural no PORTAL é o **CPF**. Nenhum cadastro,
formulário ou tela pode exigir do cidadão **outro número** com a finalidade de identificá-lo — nem
RG, nem número do RENACH, nem número de registro/matrícula interna do DETRAN-AM, nem "número de
protocolo anterior". Isso **não** significa que o PORTAL deixa de usar outros identificadores: o
número do AIT, a placa e o RENAVAM continuam sendo exigíveis, porque identificam **o processo ou o
veículo**, não a pessoa — a vedação alcança a identificação **do cidadão**.

Efeito operacional em três frentes:

1. **Cadastro/perfil**: campo de CPF obrigatório e suficiente; qualquer outro documento é opcional e
   deve ser justificado por uma finalidade distinta de identificar.
2. **Recuperação de acesso e vinculação de acervo**: o PORTAL localiza os processos, veículos e
   documentos do cidadão a partir do CPF, sem obrigá-lo a informar números que o órgão já detém —
   convergindo com o uso único ([RN-PORTAL-106]).
3. **Requerimento de defesa/recurso**: o rol do [REF-CONTRAN-900] art. 3º, II pede _"número do
   documento de identificação e CPF ou CNPJ do requerente"_; no canal digital com identidade já
   verificada, o campo "número do documento de identificação" é **pré-preenchido pelo órgão ou
   dispensado**, nunca redigitado pelo cidadão.

**Base legal.**

- [REF-LEI-13460-2017] art. 10-A: _"Para fins de acesso a informações e serviços [...] perante os
  órgãos e as entidades federais, **estaduais**, distritais e municipais ou os serviços públicos
  delegados, a apresentação de documento de identificação com fé pública em que conste o número de
  inscrição no Cadastro de Pessoas Físicas (CPF) será suficiente para identificação do cidadão,
  dispensada a apresentação de qualquer outro documento."_
  § 1º _(Redação dada pela Lei nº 14.534, de 2023)_: _"Os cadastros, os formulários, os sistemas e
  outros instrumentos exigidos dos usuários [...] deverão disponibilizar campo para registro do
  número de inscrição no CPF, de preenchimento obrigatório, que será suficiente para sua
  identificação, **vedada a exigência de apresentação de qualquer outro número para esse fim**."_
  § 2º: _"O número de inscrição no CPF poderá ser declarado pelo usuário do serviço público, desde
  que acompanhado de documento de identificação com fé pública, nos termos da lei."_
- [REF-LEI-14129-2021] art. 28: _"Fica estabelecido o número de inscrição no Cadastro de Pessoas
  Físicas (CPF) [...] como número suficiente para identificação do cidadão [...] nos bancos de dados
  de serviços públicos, garantida a gratuidade da inscrição e das alterações nesses cadastros."_
  § 1º: o CPF _"deverá constar dos cadastros e dos documentos de órgãos públicos [...] e,
  especialmente, dos seguintes cadastros e documentos: [...] X - Carteira Nacional de Habilitação
  (CNH) ou Permissão para Dirigir"_.
- [REF-CONTRAN-809-2020] / CTB art. 159, II _(Redação dada pela Lei nº 15.428, de 2026)_: a CNH
  _"deverá conter fotografia, nome, número de inscrição no Cadastro de Pessoas Físicas (CPF) e demais
  requisitos estabelecidos pelo Contran"_ — o CPF é elemento do próprio documento de habilitação,
  fechando o circuito de identificação sem número adicional.

**Verificação.** Auditoria de formulários: nenhum campo do PORTAL rotulado como identificação
pessoal, além do CPF, pode estar marcado como obrigatório. Onde o campo existir (por exigência de
formulário legado ou de integração), a obrigatoriedade migra para o **back-end**, que o preenche a
partir do RENACH/base própria — não para o cidadão. Teste negativo explícito: cadastro concluído
informando **apenas** CPF + validação de identidade deve produzir uma conta plenamente funcional para
todos os atos de nível simples de [RN-PORTAL-101].

**Controvérsia/risco.** O art. 10-A é expresso quanto a órgãos **estaduais** — diferentemente da Lei
14.129/2021, cuja aplicação ao Amazonas depende de adesão formal não localizada ([RN-PORTAL-106]).
Logo, mesmo no cenário pessimista de não adesão, esta regra permanece vinculante, porque a Lei
13.460/2017 **não tem cláusula de adesão**: seu art. 1º, § 1º já a estende aos entes federados. Esta
é uma das poucas regras deste bloco cuja obrigatoriedade não depende do item nº 1 do
`_intake/legal-assessment.md`.

Risco residual: pessoas jurídicas (proprietário PJ, locadora, embarcador, transportador) seguem
identificadas por **CNPJ**, e a representação da PJ exige documento de comprovação
([REF-CONTRAN-900] art. 5º, IV) — a suficiência do art. 10-A é escrita para a **pessoa natural** e
não dispensa a prova de representação da pessoa jurídica. Ver [RN-RAIT-121].
