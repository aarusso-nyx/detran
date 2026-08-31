---
id: JRN-DASH-002
title: Gestor RAIT no DASHBOARD — o mesmo radar de prescrição, visto do ponto de entrada consolidado
status: draft
apps: [dashboard, rait]
sources:
  [
    JRN-RAIT-004,
    RN-RAIT-110,
    RN-RAIT-111,
    RN-RAIT-112,
    RN-RAIT-113,
    RN-RAIT-114,
    WF-RAIT-002,
  ]
updated: 2026-08-24
---

## Persona e contexto

Esta jornada é a mesma vivida por Aline em [JRN-RAIT-004] — gestora do RAIT, guardiã dos três
relógios de extinção de punibilidade por inércia do órgão (decadência de 180/360 dias
[RN-RAIT-114]; prescrição por não julgamento em 24 meses, art. 289-A [RN-RAIT-112]/[RN-RAIT-110]/
[RN-RAIT-111]; prescrição por paralisação de 3 anos, Lei 9.873/1999 [RN-RAIT-113]) — mas descrita
a partir do **ponto de entrada que ela efetivamente usa primeiro**: o DASHBOARD, não o console
RAIT. A diferença não é de conteúdo, é de **camada**: o DASHBOARD é onde Aline decide se hoje é
um dia normal ou um dia de intervenção; o RAIT é onde ela intervém depois de decidir.

## Narrativa ponta-a-ponta

1. **O DASHBOARD não duplica o radar do RAIT — ele é a porta de entrada dele.** Aline não abre o
   RAIT diretamente pela manhã; abre o DASHBOARD, porque é ali que ela vê, num único olhar, se o
   RAIT tem algo mais urgente hoje do que os outros domínios que ela também acompanha (ela é
   gestora de área, não só do RAIT).
2. **Um processo aparece com o rótulo `ALERTA_N3` e "21 meses / 24 — art. 289-A".** O DASHBOARD
   nunca mostra "21 meses" sozinho — mostra sempre o teto e a base legal ao lado, mesmo princípio
   já fixado em `inf/rait/_intake/ux-notes.md` §c ("prazos sempre com a base legal visível ao
   lado, não só o número"), reaplicado aqui na camada consolidada.
3. **Clique único leva ao contexto certo, não a uma busca.** Ao clicar no card do processo, Aline
   não cai numa tela genérica de busca do RAIT — cai direto no dossiê do processo, no mesmo ponto
   descrito no passo 2 de [JRN-RAIT-004]. A promessa do DASHBOARD como "ponto de entrada único" só
   se cumpre se o salto de contexto for imediato.
4. **O DASHBOARD cruza os dois relógios que o RAIT cruza — mas também soma outros processos em
   risco simultâneo.** Enquanto o RAIT mostra o cruzamento de relógio B (24 meses) e relógio C
   (paralisação, [WF-RAIT-002] §4.2) por processo, o DASHBOARD soma isso à carga de trabalho:
   quantos processos estão em `CRITICO` simultaneamente, e se isso excede a capacidade real de
   triagem do dia — pergunta que só faz sentido na camada agregada.
5. **Nunca uma ação de mérito a partir do DASHBOARD.** Consistente com o escopo do APP.md do
   DASHBOARD ("fora: qualquer ação de negócio"), Aline não julga nem redistribui a partir daqui —
   ela decide **que** precisa agir, e a ação em si (escalar, cobrar relator, verificar quorum,
   como descrito nos passos 3-4 de [JRN-RAIT-004]) acontece no RAIT.
6. **Retorno ao DASHBOARD confirma o efeito.** Depois de agir no RAIT, o card do processo no
   DASHBOARD reflete a mudança — não porque Aline "atualizou o painel", mas porque o painel lê o
   mesmo estado que o RAIT já mudou. Um DASHBOARD que exige atualização manual de status seria, em
   si, uma fonte de desatualização silenciosa (ver `ux-notes.md` §d).
7. **Fim do dia — o DASHBOARD é onde Aline confirma que nada ficou sem dono entre domínios.** Ela
   pode ter agido no RAIT, no PEC (ver [JRN-DASH-007]) e ter escalado uma pendência técnica (ver
   [JRN-DASH-004]) no mesmo turno — o DASHBOARD é o único lugar onde essas três linhas de trabalho
   convergem numa visão só, sem que ela precise abrir três consoles para confirmar que fechou o
   dia.

## Pontos de contato (apps/canais)

DASHBOARD (radar consolidado, decisão de "agir hoje?"); RAIT (drill-down, ação de escalonamento —
mesmo conteúdo de [JRN-RAIT-004] passos 2-4).

## Métricas de sucesso

As mesmas de [JRN-RAIT-004] (zero prescrição por inércia do órgão sem alerta prévio registrado),
acrescidas de: tempo entre o card aparecer no DASHBOARD e o clique de drill-down no RAIT (mede se
o painel está sendo de fato o ponto de entrada, ou se está sendo ignorado em favor de acesso
direto ao RAIT); nenhuma divergência entre o estado mostrado no card do DASHBOARD e o estado real
do processo no RAIT.
