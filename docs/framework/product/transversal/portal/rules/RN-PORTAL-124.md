---
id: RN-PORTAL-124
title: Dois canais eletrônicos juridicamente distintos — o PORTAL identifica por qual o cidadão protocolou e emite comprovante com os elementos exigidos
status: draft
apps: [portal, rait]
sources:
  [REF-CONTRAN-900, REF-CONTRAN-931, REF-LEI-14129-2021, REF-DETRANAM-SERVICOS]
updated: 2026-08-24
---

**Regra.** Convivem **dois** canais eletrônicos de protocolo, com fundamentos, marcos de
tempestividade e trilhas de auditoria diferentes:

| Canal                                 | Base                                                              | Quem opera                                             | Marco de tempestividade       |
| ------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------- |
| **SNE**                               | [REF-CONTRAN-931] art. 4º, IV-V; [REF-CTB-280-290] art. 284, § 5º | Órgão máximo executivo de trânsito da União            | Registro no próprio SNE       |
| **Canal eletrônico próprio do órgão** | [REF-CONTRAN-900] art. 6º, § 4º                                   | DETRAN-AM (hoje, também o Protocolo Virtual do Estado) | Protocolo no sistema do órgão |

Quatro deveres do PORTAL:

1. **Dizer por qual canal o cidadão está protocolando**, antes da submissão e no comprovante. Não é
   detalhe técnico: é o que determina onde a prova da tempestividade vai ser buscada em caso de
   litígio.
2. **Emitir comprovante com os elementos do art. 6º, § 2º da Res. 900/2022** — identificação e
   assinatura do recebedor, identificação do órgão ou entidade de trânsito, e data do recebimento —
   transpostos para o meio eletrônico como: identificação do sistema recebedor, assinatura eletrônica
   do órgão, e data-hora do recebimento. Comprovante sem esses elementos deixa a prova da
   tempestividade frágil.
3. **Registrar `canal_entrada` no processo** e preservá-lo por todo o ciclo, alimentando o cálculo de
   tempestividade de [RN-RAIT-106].
4. **Mostrar um estado único ao cidadão**, qualquer que tenha sido o canal — inclusive balcão e
   postal ([RN-PORTAL-105], item 3). Canal é fato jurídico; fragmentação de experiência não é.

**Base legal.**

- [REF-CONTRAN-900] art. 6º, § 4º: _"A protocolização de defesa prévia ou de recurso poderá ser feita
  por meio eletrônico, desde que disponibilizado pelo órgão ou entidade de trânsito que efetuou a
  autuação"_ — âncora legal do canal digital próprio.
- [REF-CONTRAN-900] art. 6º, § 2º: _"o protocolo de recebimento da defesa prévia ou do recurso deverá
  conter, pelo menos, a identificação e assinatura do recebedor, a identificação do órgão ou entidade
  de trânsito e a data do recebimento."_
- [REF-CONTRAN-900] art. 12: a apresentação de defesa ou recurso pelo SNE obedece à regulamentação
  específica do CONTRAN — a Res. 931/2022.
- [REF-CONTRAN-931] art. 4º, IV a VIII: o SNE disponibiliza e recebe interposição de defesa prévia,
  interposição de recursos, resultado de julgamentos, indicação de condutor infrator e resultado da
  identificação; art. 11: formulário de identificação do condutor infrator.
- [REF-CTB-280-290] art. 284, § 5º _(Redação dada pela Lei nº 14.440, de 2022)_: o sistema de
  notificação eletrônica _"deve disponibilizar, na mesma plataforma, campo destinado à apresentação de
  defesa prévia e de recurso, quando o infrator não reconhecer o cometimento da infração, na forma
  regulamentada pelo Contran."_
- [REF-LEI-14129-2021] art. 27, IV: direito ao recebimento de protocolo das solicitações apresentadas.

**Verificação.** (a) O comprovante emitido pelo PORTAL contém os três elementos do § 2º em forma
eletrônica, e é ele próprio peça de categoria B ([RN-PORTAL-117]) — assinado e verificável fora do
sistema. (b) `canal_entrada` é obrigatório, imutável após o protocolo, e visível na linha do tempo do
cidadão. (c) Auditoria de conformidade sobre o **Protocolo Virtual do Estado**: verificar se o
comprovante que ele emite hoje contém os elementos do § 2º — a dúvida está registrada em
[REF-DETRANAM-SERVICOS] e não foi resolvida; enquanto não for, cada protocolo por aquele canal carrega
risco probatório que o PORTAL não controla. (d) Teste negativo: nenhum fluxo pode protocolar em dois
canais simultaneamente para o mesmo AIT — [REF-CONTRAN-900] art. 3º, parágrafo único exige um AIT por
requerimento, e duplicidade de canal produz dois protocolos do mesmo pedido, com dois marcos de tempo.

**Controvérsia/risco.** (a) O CTB art. 284, § 5º obriga o **sistema de notificação eletrônica** a
oferecer campo de defesa/recurso na mesma plataforma — dever da União enquanto operadora do SNE, não
do DETRAN-AM. O PORTAL não substitui esse campo e não pode prometer que o protocolo feito nele
aparecerá no SNE, salvo integração comprovada. (b) O risco central é o cidadão **acreditar** que
protocolou pelo SNE quando protocolou pelo canal próprio, ou o inverso — e descobrir a diferença
apenas quando a tempestividade for contestada. Daí o dever 1 ser de exibição, e não apenas de
registro interno. (c) Persiste a fragilidade probatória do Protocolo Virtual do Estado apontada em
[REF-DETRANAM-SERVICOS]: é canal do Estado, não do DETRAN-AM, e a conformidade do seu comprovante ao
§ 2º nunca foi confirmada. É item de verificação operacional, barato, com impacto direto sobre
[RN-RAIT-106]. Ver `_intake/legal-assessment.md`.
