---
id: JRN-PORTAL-003
title: Cidadão acompanha o processo e recebe a decisão — provido ou negado
status: draft
apps: [portal, rait]
sources:
  [
    REF-CONTRAN-918,
    REF-CTB-extracts-raw,
    REF-BENCH-ESTADOS,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
  ]
updated: 2026-08-24
---

## Nota de revisão (rodada UX transversal, 2026-08-24)

Acompanhamento é ato de **consulta** — nunca exige elevação de nível de conta (assinatura simples
já cobre o acesso ao próprio processo, [REF-DECRETO-10543-2020] art.4º, I, "b"); nenhuma tela desta
jornada deveria interromper Maria com pedido de confirmação de identidade adicional. A única
exceção é quando o próprio acompanhamento leva a um novo ato que exige assinatura avançada —
recorrer ao CETRAN (passo 5) ou desistir — caso em que vale o mesmo passo guiado embutido descrito
em [JRN-PORTAL-001]. O passo 5 (encaminhamento de ofício do parecer da JARI) ganha reforço de base
legal: [REF-LEI-14129-2021] art.3º, XIII e art.26, com a mesma ressalva de condicionalidade à
adesão do AM já registrada em [JRN-PORTAL-001].

## Persona e contexto

Este é o outro lado da jornada de interposição ([JRN-PORTAL-001]/[JRN-PORTAL-002]): o tempo entre
"protocolei" e "recebi a decisão", que pode ser dias ou meses. É o momento em que a ansiedade do
cidadão é maior e a informação disponível hoje (nas cartas de serviço atuais do DETRAN-AM) é menor —
sem tela de acompanhamento, sem visibilidade do que está acontecendo com o processo.

## Narrativa ponta-a-ponta

1. **Painel de acompanhamento único.** Toda multa com processo em andamento aparece com um status em
   linguagem cidadã e uma linha do tempo simples (protocolado → em análise → decidido), nunca com o
   nome interno do estado do workflow. O cidadão não vê "DISTRIBUIDO(analista)" — vê "Em análise desde
   DD/MM".
2. **Notificações, não busca ativa.** Cada mudança relevante de estado dispara notificação (push/
   e-mail, e SNE quando aderido — [REF-CONTRAN-931] art.4º) — o cidadão não precisa entrar no PORTAL
   todo dia para saber se algo mudou. Isso inclui abertura de diligência (com o prazo próprio para
   responder) e julgamento marcado em pauta.
3. **Transparência sobre o que está pendente de quem.** Quando o processo está em diligência
   aguardando prova do cidadão, a tela diferencia claramente "está com você" (ação pendente, prazo
   correndo) de "está com o órgão" (ação pendente, sem nada a fazer da parte dele) — erro comum a
   evitar é deixar ambíguo de quem é a bola.
4. **Decisão — provido.** A multa é cancelada. A tela de resultado é positiva e definitiva: "Multa
   cancelada. Você não precisa fazer mais nada." Se o pagamento já tinha sido feito antecipadamente
   (permitido, sem prejuízo do recurso — 918 art.33), o caminho de restituição corrigida
   ([REF-CTB-extracts-raw] art.286 §2º) é mostrado junto, não como um processo separado que o cidadão
   tem que descobrir sozinho.
5. **Decisão — negado, ainda cabe recurso.** Se negado na JARI, a tela de resultado já abre com o
   próximo passo possível: recorrer ao CETRAN em 30 dias ([REF-CTB-extracts-raw] art.288), com o
   parecer e a conclusão da JARI já anexados de ofício ao próximo requerimento — o cidadão nunca junta
   de novo documentos que o órgão já tem ([RN-RAIT-003]; reforçado por [REF-LEI-14129-2021] art.3º
   XIII/art.26, condicionado à adesão do AM — ver nota de revisão). Recorrer é ato de assinatura
   avançada ([REF-DECRETO-10543-2020] art.4º, II, "h") — o mesmo passo guiado de elevação de
   [JRN-PORTAL-001] aparece aqui se necessário, embutido no botão "Recorrer ao CETRAN".
6. **Decisão — negado, definitivo (CETRAN).** Última instância administrativa
   ([REF-CTB-extracts-raw] art.290) — a tela é honesta sobre não haver mais recurso administrativo,
   mostra o valor final a pagar com os juros aplicáveis só a partir do encerramento da instância (918
   art.23 §4º), e as formas de pagamento — sem jargão de "consolidação" sem explicação.
7. **Rastro completo, a qualquer momento.** Em qualquer ponto da jornada, o cidadão pode abrir o
   histórico completo do processo (documentos enviados, decisões, prazos cumpridos) — modelo de
   referência de completude é MG (processo 100% digital, decisão visível no portal —
   [REF-BENCH-ESTADOS]).

## Pontos de contato

PORTAL (painel de acompanhamento, notificações, histórico, tela de decisão). RAIT (fonte de cada
mudança de estado — [JRN-RAIT-001], [JRN-RAIT-002]). SNE (canal de notificação, quando aderido).

## Métricas de sucesso

Zero contato de suporte perguntando "o que está acontecendo com meu processo" para casos com
notificação já disparada; tempo entre decisão assinada no RAIT e visibilidade no PORTAL (meta: mesmo
dia); % de decisões "provido com pagamento antecipado" que resultam em restituição sem o cidadão
precisar abrir chamado à parte.
