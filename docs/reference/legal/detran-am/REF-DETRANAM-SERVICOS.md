---
id: REF-DETRANAM-SERVICOS
title: DETRAN-AM — cartas de serviço de defesa e recursos (páginas oficiais)
orgao: DETRAN-AM
status: vigente (páginas capturadas em 2026-08-24; conteúdo pode mudar — recapturar periodicamente)
url: https://www.detran.am.gov.br/servicos/
pdf: (páginas web; salvar snapshots — pendente)
apps: [rait, portal]
updated: 2026-08-24
---

# Operação local (Amazonas) — o que o PORTAL/RAIT devem reproduzir e superar

## Defesa de Autuação ou Prévia (fonte: /servicos/defesa-de-autuacao-ou-previa/)

- Prazo: o impresso na NA; **parecer em 30 dias após a interposição** (SLA local do 1º circuito!).
- Canais hoje: presencial (Protocolo Geral, Av. Mário Ypiranga 2884, Manaus, 8h-14h) e carta
  registrada; formulário PDF no site. (Sem protocolo virtual citado nesta página.)
- Documentos: requerimento; CNH/doc com foto; representação/procuração (Portaria nº 5046/2018);
  PJ: CNPJ + contrato social (+ contrato de locação p/ locadora); CRLV se veículo de outra UF.

## Recurso à JARI (fonte: /servicos/recurso-a-jari/)

- Prazo para o cidadão recorrer: o impresso na NIP (=NP), com piso legal de 30 dias da notificação da
  penalidade ([RN-RAIT-102]).
- SLA anunciado: **processamento em "30 dias úteis" da entrada na JARI**.
  ⚠ **CORREÇÃO LEGAL (2026-08-24).** A anotação anterior deste arquivo atribuía esse prazo ao
  **CTB art. 285 §3º** — dispositivo **REVOGADO pela Lei 14.229/2021**. O prazo legal de julgamento
  pela JARI é hoje o do **art. 285 §6º: 24 meses** contados do recebimento do recurso pelo órgão
  julgador ([REF-CTB-280-290]; [RN-RAIT-110]). Os "30 dias úteis" anunciados são, portanto, **meta
  operacional interna**, não prazo legal — possivelmente ancorada em
  [REF-LEI-9784-1999] art. 59 §1º (30 dias, prorrogáveis por igual período), de aplicação
  subsidiária. Não há discrepância normativa: há um SLA local muito mais generoso que o teto legal, o
  que é lícito e desejável. O que **não** pode subsistir é a citação do §3º revogado.
- Canais: presencial, Correios e **Protocolo Virtual do Estado**:
  https://protocolovirtual.amazonas.am.gov.br/index.asp
  ⚠ Verificar se o comprovante emitido pelo Protocolo Virtual contém os elementos exigidos por
  [REF-CONTRAN-900] art. 6º §2º (identificação e assinatura do recebedor, identificação do órgão,
  data) — sem isso a prova da tempestividade fica frágil ([RN-RAIT-106]).
- Não conhecimento espelha [REF-CONTRAN-900] art. 4º ([RN-RAIT-001], [RN-RAIT-122]).
- Peculiaridade local: documento autenticado em cartório de outro estado exige **endosso em cartório
  do AM**.
  ⚠ **Exigência sem base na norma local.** A [REF-DETRANAM-PORTARIA-5046] art. 2º, I e §2º
  **dispensa** o reconhecimento cartorial e autoriza o próprio servidor do DETRAN-AM a lavrar a
  autenticidade da firma. O endosso cartorial adicional é atrito eliminável **sem alteração
  normativa** — ver [RN-RAIT-121] e `inf/rait/_intake/legal-assessment.md`, item 15.
  **Decisão do Owner (2026-08-24, steering.md D.28):** correção autorizada a proceder agora, sem
  esperar validação jurídica formal.

## Recurso ao CETRAN-AM (fonte: /servicos/recurso-ao-cetran/)

- Prazo: **30 dias da publicação/notificação da decisão da JARI** — coerente com CTB art. 288, _caput_
  ([RN-RAIT-103]). Prazo **fixo em lei**, não piso.
- Canais: Protocolo Administrativo DETRAN-AM presencial; Protocolo Virtual (genérico).
- Exige juntar **parecer e conclusão da JARI**.
  ⚠ **Exigência contra legem.** São documentos emitidos pelo próprio órgão, e o
  [REF-CTB-280-290] art. 285 §4º veda exigi-los _"em qualquer fase do processo, para efeitos de
  admissibilidade"_ — regra de **lei**, reforçada por [REF-CONTRAN-900] art. 5º, parágrafo único. O
  RAIT deve **anexar de ofício** o parecer e a conclusão ao recurso, e jamais condicionar a
  admissibilidade à juntada pelo cidadão ([RN-RAIT-003], [RN-RAIT-117], [RN-RAIT-122]).
  **Decisão do Owner (2026-08-24, steering.md D.28):** correção autorizada a proceder agora, sem
  esperar validação jurídica formal.

## Instrumentos locais a capturar (backlog)

- **Portaria DETRAN-AM nº 5046/2018** (exigências de representação) — obter PDF.
- Regimento/composição da(s) JARI-AM e do CETRAN-AM; calendário de sessões.

## Decisões

**2026-08-24 (steering.md D.28).** Owner autorizou correção imediata das duas exigências sem
base legal documentadas acima (endosso cartorial em "Recurso à JARI"; juntada do parecer da JARI
pelo cidadão em "Recurso ao CETRAN-AM"), sem aguardar validação jurídica formal. Este repositório
não contém código/UI — a ação decorrente é atualizar a linguagem das páginas de carta de serviço
do DETRAN-AM e o checklist de documentos do PORTAL (fora deste repo, no monorepo/CMS) para
eliminar as duas exigências; o papel deste arquivo é registrar que a correção está autorizada
pelo Owner para quem administra esse conteúdo agir.
