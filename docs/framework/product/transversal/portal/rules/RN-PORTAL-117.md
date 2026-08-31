---
id: RN-PORTAL-117
title: O que o PORTAL pode exibir com valor de documento — três categorias e a fronteira do "original"
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-809-2020,
    REF-LEI-14063-2020,
    REF-LEI-14129-2021,
    REF-MP-2200-2-2001,
  ]
updated: 2026-08-24
---

**Regra.** Nem tudo que o PORTAL mostra é documento. Toda superfície que exibe informação oficial ao
cidadão declara a que categoria pertence, e a categoria determina os requisitos técnicos e o que pode
ser afirmado na tela:

| Categoria                   | O que é                                                                  | Exemplos                                                         | Requisitos                                                                                                               | Pode ser oposto a terceiro?      |
| --------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| **A. Documento oficial**    | O próprio documento, com fé pública, no meio digital oficial             | CNH-e ([RN-PORTAL-115]); CRLV-e ([RN-PORTAL-116])                | Integridade, mecanismo de verificação por terceiro (QR Code do art. 7º da Res. 809/2020), origem no sistema autoritativo | **Sim**                          |
| **B. Peça de processo**     | Documento produzido no processo administrativo, assinado eletronicamente | Decisão, parecer, ata, protocolo, comprovante de recebimento     | Assinatura eletrônica do órgão, integridade verificável, disponibilidade permanente ao interessado ([RN-PORTAL-112])     | **Sim**, nos limites do processo |
| **C. Consulta informativa** | Espelho de estado de um registro em outro sistema                        | Situação da CNH, pontuação, lista de multas, situação do veículo | Data-hora da consulta e identificação da fonte sempre visíveis                                                           | **Não** — e a tela deve dizê-lo  |

Três proibições decorrentes:

1. **Não rotular C como documento.** Uma consulta de pontuação não é certidão; chamá-la assim cria
   expectativa de oponibilidade que a tela não sustenta.
2. **Não degradar A.** Ver [RN-PORTAL-115], "Controvérsia": exportar imagem ou captura de tela do
   documento oficial produz **cópia**, não documento — se o produto oferecer exportação, deve
   distinguir o artefato exportado do documento.
3. **Não emitir A sem o mecanismo de verificação da norma.** Um PDF bonito sem o QR Code oficial não
   é CRLV-e; um cartão visual de CNH gerado pelo PORTAL sem origem no sistema autoritativo não é
   CNH-e.

**Base legal.**

- [REF-CONTRAN-809-2020] art. 7º: sistema eletrônico de validação do CRLV-e por QR Code dinâmico
  gerado a partir do RENAVAM — a verificabilidade por terceiro é **elemento do documento**, não
  acessório.
- CTB art. 159, III e § 5º _(redação da Lei nº 15.428, de 2026)_: fé pública e equivalência a
  documento de identidade; validade _"quando apresentada em original"_ — ver [RN-PORTAL-115].
- [REF-LEI-14129-2021] art. 26: presunção de autenticidade do documento apresentado por meio digital
  _"desde que o envio seja assinado eletronicamente"_ — a assinatura eletrônica é o que qualifica a
  peça da categoria B.
- [REF-LEI-14063-2020] art. 4º, II, "c": a assinatura avançada é aquela em que _"qualquer modificação
  posterior é detectável"_ — propriedade que a categoria B precisa preservar após o download, e não
  apenas dentro da tela.
- [REF-MP-2200-2-2001] art. 10, § 1º: presunção de veracidade das declarações em documento produzido
  com certificação ICP-Brasil — patamar aplicável às peças que o órgão assina com certificado
  institucional, como já adotado para atas e decisões em PAdES+TSA (`_meta/steering.md` A.8).

**Verificação.** (a) Cada superfície do PORTAL declara `categoria_documental ∈ {A, B, C}` e a UI
deriva dela os rótulos, os avisos e a presença de mecanismo de verificação — a categoria não é
decidida caso a caso pelo texto da tela. (b) Toda superfície de categoria C exibe `consultado_em` e
`fonte` (RENACH, RENAVAM, RENAINF, base própria). (c) Toda peça de categoria B baixada mantém a
assinatura verificável fora do PORTAL; se o download quebrar a verificabilidade, o produto está
entregando uma cópia e deve dizê-lo. (d) Nenhuma superfície de categoria A é gerada pelo PORTAL a
partir de dados brutos — ela é **obtida** do sistema autoritativo ou o PORTAL encaminha ao canal
oficial.

**Controvérsia/risco.** (a) A fronteira entre B e C é menos nítida do que a tabela sugere no caso do
**extrato de pontuação**: ele é consulta informativa (C) para o cotidiano, mas pode ser peça
probatória em processo de suspensão do direito de dirigir, quando então precisa ser emitido como
documento assinado. A regra prática: se o cidadão vai **usar o artefato perante alguém**, é B ou A e
precisa de assinatura/verificação; se é só para ele se informar, é C. (b) Não foi localizada norma
técnica que discipline a exibição desses documentos por **portal estadual** (distinto dos aplicativos
oficiais federais): a Res. 809/2020 fala em _"aplicativos oficiais do Governo Federal"_. Se o
DETRAN-AM optar por superficiar A no seu próprio canal, convém confirmar a legitimidade dessa
exibição com a SENATRAN antes de tratá-la como equivalente ao app oficial — é o mesmo gap registrado
em [RN-PORTAL-115], item 3. Ver `_intake/legal-assessment.md`.
