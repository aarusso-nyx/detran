---
id: RN-RAIT-106
title: Protocolo multicanal — o marco de tempestividade varia com o canal de entrada
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-900, REF-CTB-280-290, REF-DETRANAM-SERVICOS]
updated: 2026-08-24
---

**Regra.** A tempestividade da defesa ou do recurso afere-se pelo marco correspondente ao canal
utilizado, **nunca** pela data em que a peça chega às mãos do julgador:

| Canal                                                                    | Marco de tempestividade                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Protocolo presencial no órgão autuador                                   | Data do protocolo                                                                                       |
| Via postal                                                               | **Data da entrega na ECT** (postagem), não a data do recebimento                                        |
| Protocolo no órgão de trânsito da residência ou domicílio (CTB art. 287) | **Data do protocolo nesse órgão**; o tempo de remessa ao órgão autuador não corre contra o administrado |
| Meio eletrônico disponibilizado pelo órgão                               | Data do protocolo eletrônico                                                                            |

O órgão que recebe pela via do art. 287 deve remeter a peça **imediatamente** ao órgão autuador,
acompanhada das cópias dos prontuários necessários ao julgamento.

**Base legal.**

- [REF-CONTRAN-900] art. 6º, _caput_ e §1º: _"Para verificação da tempestividade, deverá ser
  considerada: I - a data da entrega na Empresa Brasileira de Correios e Telégrafos (ECT) … ou II -
  a data de protocolo no órgão ou entidade de trânsito da residência ou domicílio do proprietário ou
  infrator, quando utilizada a forma prevista no art. 287 do CTB."_
- [REF-CONTRAN-900] art. 6º §2º: o protocolo de recebimento deve conter, no mínimo, identificação e
  assinatura do recebedor, identificação do órgão e data do recebimento.
- [REF-CONTRAN-900] art. 6º §3º: remessa **imediata** ao órgão autuador.
- [REF-CONTRAN-900] art. 6º §4º: _"A protocolização de defesa prévia ou de recurso poderá ser feita
  por meio eletrônico, desde que disponibilizado pelo órgão ou entidade de trânsito que efetuou a
  autuação"_ — âncora legal do canal digital do PORTAL.
- [REF-CTB-280-290] art. 287 e parágrafo único.

**Verificação.** Todo processo carrega `canal_entrada` e `data_marco_tempestividade` distintos de
`data_recebimento_interno`; o juízo de admissibilidade ([RN-RAIT-001]) usa exclusivamente o
primeiro. Entradas por Protocolo Virtual do Estado e por balcão são normalizadas ao mesmo modelo.

**Controvérsia/risco.** A carta de serviço do DETRAN-AM ([REF-DETRANAM-SERVICOS]) direciona o
cidadão ao Protocolo Virtual genérico do Estado. Enquanto o DETRAN-AM não disponibilizar canal
eletrônico **próprio** nos termos do art. 6º §4º, é preciso garantir que o protocolo virtual
estadual gere comprovante com os elementos do §2º — sem isso, a prova da tempestividade fica frágil.
