---
id: UC-TEAT-013
title: Agente lavra AIT por medição de velocidade com equipamento acoplado ao talão
status: approved
apps: [teat]
sources:
  [
    REF-CONTRAN-918,
    REF-CONTRAN-798-804-equipamentos,
    REF-CONTRAN-985-1003-MBFT,
    REF-SENATRAN-997,
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito em operação de campo opera um medidor de velocidade **acoplado ao talão
eletrônico** ([REF-CONTRAN-918] art. 3º §1º, II) e lavra o AIT de excesso de velocidade a partir da
medição, com a cadeia metrológica e probatória verificada no próprio ato.

Esta é a única hipótese de fiscalização por medidor dentro do TEAT — a fiscalização eletrônica por
equipamento fixo (inciso III, com referendo) está fora, ver `APP.md` §Fronteira.

## Pré-condições

- Dispositivo e aplicativo homologados, com postura verificada ([RN-TEAT-003]).
- Sessão do agente exclusiva no dispositivo ([RN-TEAT-111]).
- Medidor acoplado **identificado** e com cadeia metrológica vigente ([RN-TEAT-138]).
- Faixa de numeração reservada e válida ([WF-TEAT-002]).

## Fluxo principal

1. Agente inicia a operação de fiscalização de velocidade e vincula o medidor à sessão do turno —
   sistema registra modelo, número de série e identificação do equipamento no órgão.
2. Sistema verifica a cadeia metrológica do equipamento ([RN-TEAT-138]): modelo aprovado pelo
   INMETRO, verificação inicial aprovada e verificação periódica vigente. Falha em qualquer uma
   bloqueia a operação — o TEAT não lavra por equipamento sem prova de conformidade.
3. Equipamento mede e transmite ao talão: **velocidade medida** (km/h), local (latitude/longitude),
   data/hora e a imagem com a placa do veículo.
4. Sistema calcula a **velocidade considerada** subtraindo da medida o erro máximo admitido pela
   legislação metrológica ([RN-TEAT-138]) — os dois valores são persistidos e exibidos, nunca um só.
5. Sistema deriva o enquadramento a partir da velocidade considerada contra a velocidade
   regulamentada da via, e da classificação de constatação sem abordagem quando não houver
   abordagem ([RN-TEAT-108]).
6. Sistema vincula a imagem com a placa como evidência do ato, sob a cadeia de custódia comum
   ([RN-TEAT-002], [RN-TEAT-139]) — o AIT de velocidade sem essa imagem é candidato natural a
   insubsistência ([RN-TEAT-119]).
7. Agente finaliza o AIT por ato explícito ([RN-TEAT-114]); o auto segue o ciclo comum de
   [WF-TEAT-001] a partir de `FINALIZADO_LOCAL`.

## Fluxos alternativos / exceções

- **2a.** Verificação periódica vencida durante o turno: a operação é interrompida; autos já
  lavrados sob verificação vigente permanecem válidos, e o sistema registra o marco temporal do
  vencimento para auditoria.
- **3a.** Medição capturada sem imagem com placa legível: o AIT **não** pode ser finalizado por
  esta via ([RN-TEAT-139]); agente pode seguir por abordagem ([UC-TEAT-001]), se houver contato.
- **5a.** Velocidade considerada abaixo do limite de tolerância: nenhuma infração é constituída e
  nenhum rascunho é criado — a medição é descartada, não arquivada como AIT.
- **6a.** Houve abordagem ao condutor: o fluxo segue [UC-TEAT-001] para ciência/assinatura, sem
  perder os campos de medição desta via.

## Pós-condições

AIT de excesso de velocidade finalizado localmente, com velocidade medida e considerada, imagem com
placa em cadeia de custódia, e identificação do equipamento e de sua cadeia metrológica anexadas ao
auto.

## Critérios de aceitação

**AC-TEAT-013-1 — sem cadeia metrológica vigente não há lavratura**

- **Dado** um medidor cujo certificado de verificação periódica está vencido, ou cujo modelo não
  consta como aprovado pelo INMETRO
- **Quando** o agente tenta vincular o equipamento à operação
- **Então** o sistema recusa o vínculo, nomeia qual das três condições falhou ([RN-TEAT-138]) e não
  permite iniciar a fiscalização por medição

**AC-TEAT-013-2 — medida e considerada são dois campos, sempre**

- **Dado** uma medição de 78 km/h em via de 60 km/h com erro máximo admitido de 7 km/h
- **Quando** o AIT é composto
- **Então** o sistema persiste e exibe `speed_measured = 78` e `speed_considered = 71`, e em nenhuma
  tela, termo impresso ou payload aparece um valor único de velocidade ([RN-TEAT-138])

**AC-TEAT-013-3 — o enquadramento deriva da velocidade considerada**

- **Dado** uma medição cuja velocidade considerada cai abaixo do limite da via
- **Quando** o enquadramento é derivado
- **Então** nenhum rascunho de AIT é criado e a medição é descartada — o sistema nunca oferece ao
  agente a opção de enquadrar pela velocidade medida

**AC-TEAT-013-4 — sem imagem com placa o auto não finaliza**

- **Dado** um rascunho de AIT por medição sem imagem com a placa vinculada, ou com imagem marcada
  como ilegível
- **Quando** o agente tenta finalizar
- **Então** a finalização é bloqueada com a base legal citada ([RN-TEAT-139], Res. 798/2020 art. 9º)

**AC-TEAT-013-5 — a identificação do equipamento viaja com o auto**

- **Dado** um AIT lavrado por medição
- **Quando** o auto é transmitido à retaguarda
- **Então** o payload carrega modelo, número de série, identificação do equipamento no órgão e a
  referência do certificado de verificação vigente **no momento da medição** — não o certificado
  corrente no momento da transmissão

**AC-TEAT-013-6 — a medição não dispensa nenhuma garantia comum**

- **Dado** um AIT por medição
- **Quando** ele percorre [WF-TEAT-001]
- **Então** valem sem exceção a numeração reservada ([RN-TEAT-113]), a finalização explícita
  ([RN-TEAT-114]), a cadeia de custódia da evidência ([RN-TEAT-002]) e a identificação eletrônica
  do agente ([RN-TEAT-110]) — a via automatizada de captura não relaxa nenhuma delas

**AC-TEAT-013-7 — OCR propõe, o agente valida**

- **Dado** que o medidor acoplado possui tecnologia de OCR ([RN-TEAT-138] a exige)
- **Quando** a leitura da placa preenche os campos de identificação do veículo
- **Então** os campos entram como **proposta** e exigem validação explícita do agente antes da
  finalização ([RN-TEAT-115]) — autopreenchimento sem validação é vedado, e é justamente esta via
  automatizada que torna a regra operante

**AC-TEAT-013-8 — o TEAT não referenda**

- **Dado** qualquer AIT lavrado por esta via
- **Quando** ele é processado
- **Então** nenhuma etapa de referendo é exigida ou oferecida ([RN-TEAT-106]) — o agente é o autor
  do ato, e o referendo pertence ao inciso III, fora deste app

## Regras aplicáveis

- [RN-TEAT-138] (validade metrológica como precondição da prova; velocidade considerada)
- [RN-TEAT-115] (vedação de autopreenchimento dos campos do veículo sem validação do agente)
- [RN-TEAT-139] (imagem com a placa como requisito de consistência do AIT e da NA)
- [RN-TEAT-106] (talão eletrônico é inciso II — sem referendo)
- [RN-TEAT-108] (constatação sem abordagem deriva do enquadramento)
- [RN-TEAT-119] (consistência do AIT — o que se corrige e o que se arquiva)
- [RN-TEAT-002] (hash e custódia da evidência), [RN-TEAT-110] (identificação do agente),
  [RN-TEAT-113] (numeração), [RN-TEAT-114] (finalização explícita)
