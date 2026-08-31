---
id: RN-PORTAL-125
title: O que o PORTAL pode e não pode fazer no pagamento — documento padronizado da União, rede bancária, à vista e integral
status: draft
apps: [portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-LEI-14129-2021, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O PORTAL **oferece pagamento digital**, mas dentro de uma moldura estreita que a norma de
arrecadação define. O que ele pode e o que não pode:

| Pode                                                                                                                      | Não pode                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Calcular e exibir o valor devido em cada faixa ([RN-PORTAL-128])                                                          | Criar faixa, desconto ou condição não prevista em norma                                               |
| Solicitar e entregar o **documento próprio de arrecadação estabelecido pelo órgão máximo executivo de trânsito da União** | Emitir documento de arrecadação de leiaute próprio — é ele que garante o repasse automático ao FUNSET |
| Encaminhar ao pagamento na **rede bancária arrecadadora**                                                                 | Receber o valor em conta própria do PORTAL ou intermediar a custódia do recurso                       |
| Registrar e exibir a quitação, liberando o que dela depende (CRLV-e — [RN-PORTAL-116])                                    | Condicionar defesa, recurso ou admissibilidade a pagamento ([RN-PORTAL-127])                          |
| Oferecer pagamento por cartão e parcelamento **se e quando** houver autorização e credenciamento ([RN-PORTAL-126])        | Oferecer parcelamento pelo SNE — vedado expressamente                                                 |
| Entregar guia em formato acessível ([RN-PORTAL-114])                                                                      | Cobrar pelo uso do canal ([RN-PORTAL-111], item 2)                                                    |

Regra estrutural que explica a coluna direita: **o recebimento pela rede arrecadadora é à vista e
integral**. O PORTAL é ponto de emissão e de acompanhamento; a arrecadação em si é operação bancária
regida por norma federal e pelo SPB.

**Base legal.**

- [REF-CONTRAN-918] art. 24: os órgãos estaduais _"para arrecadarem multas de trânsito de sua
  competência ou de terceiros, deverão utilizar o documento próprio de arrecadação de multas de
  trânsito estabelecido pelo órgão máximo executivo de trânsito da União, com vistas a garantir o
  repasse automático dos valores relativos ao FUNSET."_
  § 1º: recolhimento de **5%** ao FUNSET é responsabilidade do órgão arrecadador.
  § 2º: _"O pagamento das multas de trânsito será efetuado na rede bancária arrecadadora."_
  § 3º: _"O recebimento de multas pela rede arrecadadora será feito **exclusivamente à vista e de
  forma integral**, podendo ser realizado parcelamento, por meio de cartão de crédito, por conta e
  risco de instituições integrantes do Sistema de Pagamentos Brasileiro (SPB)."_
- [REF-CONTRAN-931] art. 9º, § 1º: os documentos de arrecadação _"serão gerados pelos órgãos
  autuadores, e disponibilizados pelo SNE"_, nas três formas (desconto de 40%, desconto de 20%,
  acrescido de juros); § 4º: _"O SNE não permitirá o parcelamento das multas de trânsito."_
- [REF-CONTRAN-918] arts. 22 e 23: encargos após o vencimento — 1% no mês seguinte ao vencimento;
  após, valor original acrescido da variação SELIC do período mais 1%, com fator multiplicador
  `1,01 + Σ SELIC`, definido com duas casas decimais, desprezadas as demais **sem arredondamento**.
- [REF-LEI-14129-2021] art. 21, VIII: a ferramenta digital deve prever _"possibilidade de pagamento
  digital de serviços públicos e de outras cobranças, quando necessário"_.
- [REF-CTB-280-290] art. 286, _caput_: o recurso pode ser interposto _"sem o recolhimento"_ do valor.

**Verificação.** (a) O documento de arrecadação entregue pelo PORTAL é o padronizado da União,
obtido do sistema competente — não gerado localmente. (b) O cálculo de encargos segue literalmente os
arts. 22-23, inclusive o **truncamento** de duas casas sem arredondamento; um cálculo que arredonde
produz divergência de centavos oponível ao órgão. (c) Nenhum fluxo de pagamento no PORTAL escreve em
conta do órgão: o PORTAL registra a **confirmação** vinda do arrecadador. (d) O PORTAL exibe, em toda
tela de pagamento, que recorrer não exige recolher ([RN-PORTAL-127]).

**Controvérsia/risco — PIX.** Nenhuma resolução CONTRAN localizada nomeia o PIX. O art. 24, § 2º manda
pagar _"na rede bancária arrecadadora"_; o § 3º admite o parcelamento por cartão _"por conta e risco
de instituições integrantes do Sistema de Pagamentos Brasileiro (SPB)"_; e o art. 27 nomeia apenas
_"cartões de débito ou crédito"_. O PIX integra o SPB, mas a menção ao SPB no § 3º está sintaticamente
ligada ao **parcelamento por cartão** — não é uma autorização genérica de meios. A leitura defensável
é que o PIX cabe no art. 24, § 2º (pagamento à vista e integral, na rede bancária, do documento
padronizado), desde que o arranjo preserve o repasse automático ao FUNSET. **Gap de nomeação, e não
necessariamente gap de cobertura** — mas convém confirmar com a SENATRAN antes de anunciar PIX como
meio oficial, porque a garantia do repasse do art. 24 é o interesse que a norma protege. Ver
`_intake/legal-assessment.md`.

Risco secundário: o art. 24 fala em arrecadar multas _"de sua competência **ou de terceiros**"_, e o
art. 27, § 12, III e IV exclui do parcelamento veículos licenciados em outras UF e multas de órgãos
que não autorizam cartão. O PORTAL, portanto, exibirá débitos que **não pode** processar da mesma
forma — e precisa dizer isso por débito, não em aviso genérico.
