---
id: JRN-PORTAL-002
title: Proprietário indica o condutor infrator sem sair do app
status: draft
apps: [portal, rait]
sources:
  [
    REF-CONTRAN-918,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
  ]
updated: 2026-08-24
---

## Nota de revisão (rodada UX transversal, 2026-08-24)

O passo 3 (assinatura de duas partes) agora nomeia explicitamente a base legal do nível de
assinatura já implícito no desenho original: [REF-DECRETO-10543-2020] art.4º, II, "f" classifica a
indicação de condutor como **declaração que constitui reconhecimento de fato e assunção de
obrigação perante terceiro** — exige **assinatura avançada** para ambas as partes (Carlos e o
condutor indicado), não apenas para uma delas. A elevação de nível, quando necessária, é desenhada
como o mesmo passo guiado embutido descrito em [JRN-PORTAL-001], nunca como redirecionamento a um
fluxo à parte. O pré-preenchimento do passo 2 ganha âncora adicional em [REF-LEI-14129-2021] art.
3º, XIII/art.26 (uso único + presunção de autenticidade), com a mesma ressalva de condicionalidade
à adesão do AM já registrada em [JRN-PORTAL-001].

## Persona e contexto

Carlos é proprietário de uma frota pequena (PJ) e locador de um dos veículos. Ele não estava
dirigindo quando a infração ocorreu — quem estava foi um funcionário/locatário identificável. Se ele
não indicar o condutor certo a tempo, a responsabilidade (e a pontuação) recai sobre ele
([REF-CONTRAN-918] arts.6º-8º). Ele já teve, em outro contexto, a experiência ruim de imprimir um
formulário, preencher à caneta e levar ao balcão — a expectativa aqui é que isso não se repita.

## Narrativa ponta-a-ponta

1. **Gatilho.** Ao abrir a autuação no PORTAL, "indicar condutor" aparece como caminho de primeira
   classe ao lado de "defender-se" e "pagar" — não enterrado num menu secundário. O formulário de
   indicação, na regra nacional, acompanha a própria NA ([REF-CONTRAN-918] art.5º _caput_) — o PORTAL
   materializa isso como uma tela, não como anexo a baixar e preencher à parte.
2. **Preenchimento guiado.** Campos mínimos exigidos pelo art.5º incisos I-X (identificação do
   condutor, assinaturas de proprietário e condutor, placa, número do AIT, prazo, advertências de
   responsabilidade) — o PORTAL pré-preenche tudo que já sabe (placa, AIT, dados do proprietário
   logado) e só pede o que só Carlos sabe: quem dirigia.
3. **Assinatura de duas partes — assinatura avançada para ambas, elevação guiada quando falta.** A
   regra exige assinatura do proprietário E do condutor indicado, e o [REF-DECRETO-10543-2020] art.
   4º, II, "f" classifica esse ato como exigindo **assinatura eletrônica avançada** de quem assina —
   é uma declaração que reconhece um fato e transfere responsabilidade a terceiro, não uma simples
   solicitação. O desenho oferece dois caminhos: (a) o condutor indicado também tem conta gov.br e
   assina remotamente pelo PORTAL (modelo de referência: identificação equivalente a protocolo formal
   via Carteira Digital de Trânsito, já reconhecido no PR — [REF-CETRAN-PROCESSO-INTERNO]); (b)
   offline, com upload de documento assinado por ambos, para quem o condutor não usa o app. Se a
   conta de Carlos (ou a do condutor indicado, no caminho remoto) ainda não tem o nível necessário, o
   mesmo passo guiado embutido de [JRN-PORTAL-001] aparece no momento da assinatura — nunca antes,
   como pré-requisito genérico de cadastro que faria Carlos abandonar a tarefa sem entender por quê.
4. **Aviso de responsabilidade — sem letra miúda.** Antes de confirmar, o PORTAL mostra em linguagem
   direta a consequência de indicação irregular: gera novos AITs por infração distinta
   ([REF-CONTRAN-918] art.5º §2º) e fica registrada no RENACH para averiguação de reincidência (art.5º
   §6º) — não é um checkbox de termo de uso genérico, é uma frase que Carlos precisa realmente ler.
5. **Confirmação e novo trâmite.** Uma vez indicado e validado, a notificação passa a ser dirigida ao
   condutor indicado — ele recebe sua própria ciência no PORTAL (se cadastrado) com os mesmos três
   caminhos (defender-se, indicar outro condutor se aplicável, pagar) que Maria teve em
   [JRN-PORTAL-001]. Carlos acompanha o novo status a partir do painel da frota.
6. **Prazo de contagem.** O termo inicial dos 30 dias para expedição da nova notificação passa a
   contar do protocolo da indicação, com o mesmo valor jurídico esteja ela em papel ou 100% digital
   (modelo de referência PR — [REF-CETRAN-PROCESSO-INTERNO]) — Carlos não perde prazo por ter usado o
   canal digital em vez do balcão.

## Pontos de contato

PORTAL (indicação, assinatura dupla, painel de frota). RAIT (validação, encaminhamento ao condutor
indicado). App/Carteira Digital de Trânsito (assinatura remota do condutor, quando aplicável).

## Métricas de sucesso

% de indicações concluídas 100% digital sem visita ao balcão; tempo entre autuação e indicação
concluída; % de indicações rejeitadas por dado incompleto (meta: baixo, por causa do pré-
preenchimento); zero indicação perdida por prazo por causa do canal de assinatura escolhido.
