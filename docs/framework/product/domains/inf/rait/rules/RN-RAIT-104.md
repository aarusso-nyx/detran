---
id: RN-RAIT-104
title: Termo inicial do prazo conforme o canal de ciência (postal, pessoal, edital, eletrônico)
status: draft
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-CONTRAN-931]
updated: 2026-08-24
---

**Regra.** O evento que inicia a contagem depende do canal pelo qual a ciência se deu:

| Canal                                                      | Evento que fixa o termo inicial                                                                                         | Fonte                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Remessa postal                                             | **Expedição** = entrega da notificação pelo órgão autuador à empresa responsável pelo envio                             | [REF-CONTRAN-918] art. 30, I                                                                   |
| Notificação eletrônica (SNE)                               | **Expedição** = envio eletrônico pelo órgão; e **ciência ficta 30 dias** após a inclusão no sistema + envio da mensagem | [REF-CONTRAN-918] art. 30, II; [REF-CTB-280-290] art. 282-A §2º; [REF-CONTRAN-931] art. 4º §6º |
| Edital                                                     | **Publicação** no diário oficial, esgotadas as tentativas postal/pessoal                                                | [REF-CONTRAN-918] art. 14 e art. 29                                                            |
| AIT assinado que vale como NA                              | **Assinatura pelo condutor**, desde que conste a data-limite de defesa                                                  | [REF-CONTRAN-918] art. 3º §5º; [REF-CTB-280-290] art. 280, VI                                  |
| Notificação devolvida por endereço desatualizado ou recusa | **Vale como notificação** — considera-se o marco da tentativa                                                           | [REF-CTB-280-290] art. 282 §1º; [REF-CONTRAN-918] art. 32 §5º                                  |

Sobre o marco assim definido aplica-se a contagem de [RN-RAIT-005]: dias consecutivos, excluído o
dia inicial, incluído o do vencimento, prorrogando-se para o 1º dia útil.

**Base legal.**

- [REF-CONTRAN-918] art. 30: _"A expedição das notificações … se caracterizará: I - pela entrega da
  notificação pelo órgão autuador à empresa responsável por seu envio, quando utilizada a remessa
  postal; ou II - pelo envio eletrônico da notificação pelo órgão autuador do veículo, quando
  utilizado sistema de notificação eletrônica."_
- [REF-CONTRAN-931] art. 4º §6º: _"O proprietário ou o condutor autuado será considerado notificado
  trinta dias após a inclusão da informação no sistema e do envio da respectiva mensagem…"_
- [REF-CONTRAN-931] art. 4º §7º: _"Independentemente do acesso regular ao SNE, prevalecem, para
  todos os efeitos, os prazos estabelecidos nas notificações…"_ — a leitura pelo destinatário é
  **irrelevante** para a contagem.

**Verificação.** O evento de notificação no RAIT é tipado (`canal`, `data_expedicao`,
`data_publicacao`, `data_ciencia_ficta`) e o motor de prazos seleciona o marco pela tabela acima;
nenhum prazo é calculado a partir de data de leitura ou de acesso do cidadão.

**Controvérsia/risco.** Para o SNE convivem **dois** marcos: a _expedição_ (art. 30, II — relevante
para os prazos de decadência do órgão) e a _ciência ficta em 30 dias_ (relevante para os prazos do
administrado). Confundi-los encurta indevidamente o prazo do cidadão em 30 dias. O sistema deve
persistir os dois separadamente.
