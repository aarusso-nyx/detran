---
id: JRN-PORTAL-006
title: Condutor mostra CNH digital e CRLV-e numa fiscalização — paridade legal, offline, bateria acabando
status: draft
apps: [portal]
sources: [REF-CONTRAN-809-2020, REF-LEI-13460-2017]
updated: 2026-08-24
---

## Persona e contexto

Nilson dirige uma van escolar em um ramal de estrada sem sinal de internet firme, no interior do
Amazonas. É parado numa blitz. O celular está com 8% de bateria e sem conexão de dados — o cenário
mais adverso e mais real para o público do DETRAN-AM, não uma exceção rara. Ele não carrega mais o
CRLV impresso e, desde a Lei 15.428/2026, a CNH também pode ser só digital
([REF-CONTRAN-809-2020], CTB art.159, I) — mas "poder ser digital" só vale alguma coisa nesse
momento se o documento realmente abrir sem internet.

## Narrativa ponta-a-ponta

1. **O documento precisa estar pronto antes da blitz, não durante.** CNH digital e CRLV-e são
   documentos que **precisam já estar baixados e válidos no aparelho** antes da fiscalização — a
   experiência de "carregando..." numa tela de blitz, com o agente esperando, é o pior desenho
   possível deste fluxo. O PORTAL/app trata esses documentos como dados que sincronizam
   proativamente em segundo plano sempre que há conexão, exatamente como já é a prática do agente de
   campo do TEAT com seu pacote normativo offline (mesmo princípio de "nunca depender de sinal no
   momento do ato" já adotado do lado do agente, agora espelhado do lado do cidadão).
2. **Abrir o documento não pode depender de login online.** Uma vez baixado, o CRLV-e/CNH-e abre
   localmente no aparelho, com autenticação local (biometria do aparelho, PIN), sem exigir nova
   autenticação gov.br naquele momento — se abrir o documento dependesse de reautenticar contra um
   servidor, um condutor sem sinal simplesmente não teria como mostrar nada, mesmo tendo o direito
   pleno de andar só com a versão digital.
3. **Modo de bateria crítica é parte do desenho, não um detalhe de engenharia.** Com 8% de bateria,
   Nilson precisa abrir direto no documento — não numa sequência de telas de app cheio de animação e
   dados carregando. Um atalho de tela de bloqueio/widget para "mostrar documentos" reduz o tempo
   entre pedir e mostrar; o app não deveria competir por atenção e bateria com uma tela de boas-vindas
   nesse momento.
4. **O agente vê a mesma coisa que veria no papel — nem mais, nem menos.** A tela mostrada ao agente
   (foto, nome, categoria, validade, QR Code de validação — [REF-CONTRAN-809-2020] art.7º para o
   CRLV-e) é objetivamente equivalente ao documento físico, sem exigir explicação de Nilson sobre "é
   assim mesmo que funciona hoje em dia" — parte da paridade jurídica plena entre CNH física e digital
   é também uma paridade de **reconhecimento visual** para quem fiscaliza.
5. **Versão impressa continua sendo opção legítima, sem hierarquia.** O CRLV-e dispensa a via
   impressa (art.6º §2º), mas quem prefere imprimir em papel A4 comum está igualmente coberto (§1º) —
   o PORTAL nunca apresenta a versão digital como "a forma certa" e a impressa como "a forma antiga";
   ambas têm o mesmo valor legal, e a escolha é do condutor (CTB art.159, I).
6. **Se o CRLV-e não pôde ser emitido, a razão aparece antes da blitz, não durante.** O CRLV-e só é
   emitido após quitação de débitos vinculados ao veículo ([REF-CONTRAN-809-2020] art.4º) — se Nilson
   está com pendência, o app já deveria ter avisado isso com antecedência (notificação proativa, não
   busca ativa — mesmo princípio de [JRN-PORTAL-003]), nunca deixando a primeira notícia de "documento
   não pôde ser emitido" acontecer na própria fiscalização.
7. **CNH suspensa/vencida — a mesma regra de honestidade sem alarme falso.** Se a CNH de Nilson está
   perto do vencimento, o aviso de 30 dias de antecedência já chegou antes ([REF-CONTRAN-809-2020]
   CTB art.159 §12) — a tela do documento em si, no momento da blitz, mostra a validade real sem
   maquiagem, mas o momento de descobrir isso nunca deveria ser a blitz.

## Pontos de contato (apps/canais)

PORTAL/app (documentos digitais, sincronização em segundo plano, modo offline). Agente de
fiscalização (leitura visual + QR Code). Módulo de pagamento (pré-condição de emissão do CRLV-e —
ver [JRN-PORTAL-010]).

## Métricas de sucesso

Tempo entre "pedir o documento" e "mostrar o documento" com o app já instalado e sincronizado
(meta: segundos, sem depender de conexão); zero caso de documento inacessível por falta de sinal
quando já baixado previamente; % de usuários que sabem, antes da blitz, que têm pendência que
bloqueia o CRLV-e; zero condutor surpreendido pela primeira vez, na blitz, com CNH vencida sem aviso
prévio.
