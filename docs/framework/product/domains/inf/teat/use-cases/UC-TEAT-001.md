---
id: UC-TEAT-001
title: Agente lavra AIT com abordagem ao condutor
status: approved
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/framework/product/workflows/ait-lifecycle.md',
    'teat:docs/framework/product/ux-parity/mobile-matrix.json',
    'REF-CONTRAN-918',
  ]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito (field-agent) em turno aberto, com dispositivo homologado e pacote normativo
instalado, constata infração mediante abordagem ao condutor e lavra o AIT no aplicativo móvel,
finalizando um ato legal válido e íntegro.

## Pré-condições

- Turno aberto, dispositivo autorizado e sem `tamper_flag` ([RN-TEAT-003]).
- Pacote normativo mobile vigente instalado ([WF-TEAT-003]).
- Faixa de numeração reservada ao dispositivo/agente com números disponíveis ([WF-TEAT-002]).

## Fluxo principal

1. Agente aborda o veículo/condutor (tela `ait-start` → `ait-vehicle`, UX-MOB-020/021).
2. Consulta e confirma o veículo (`AitVehicle.visually_confirmed_by_agent`); registra divergência
   observada, se houver.
3. Identifica o condutor/infrator (`ait-driver`, UX-MOB-022; `AitPerson.identified_by`).
4. Seleciona o enquadramento normativo aplicável (`ait-frame`/`ait-frame-detail`, UX-MOB-023/024),
   filtrado pelo catálogo normativo vigente.
5. Registra local (`ait-location`, UX-MOB-025, com `location_json`/`gps_accuracy_m`), observações
   obrigatórias e complementares (`ait-observations`, UX-MOB-026).
6. Sistema valida campos mínimos (`ait-validations`, UX-MOB-027) — RN-AIT-009: enquadramento
   incompatível com constatação com abordagem é bloqueado.
7. Agente anexa evidências (`ait-evidence`, UX-MOB-028) — ver [UC-TEAT-003].
8. Agente registra medidas administrativas sugeridas, se aplicável (`ait-measures`, UX-MOB-029).
9. Agente oferece assinatura/ciência ao condutor (`ait-signature`, UX-MOB-030) — ver
   [UC-TEAT-004].
10. Agente revisa o auto completo (`ait-review`, UX-MOB-031).
11. Agente finaliza — `POST /v1/ait-lifecycle/aits/:id/finalize`: sistema congela o conteúdo,
    computa `content_hash`, grava `AitStatusHistory` (`draft → issued`), publica evento
    `ait.finalized` (`ait-done`, UX-MOB-032).
12. Recibo é impresso (simulado ou físico) — `ait-print`, UX-MOB-033; evento registrado em
    `AitPrintEvent`; falha de impressão não invalida o ato (RN-AIT-017/018).

## Fluxos alternativos / exceções

- **6a.** Validação falha (campo obrigatório ausente): sistema impede avanço até correção pelo
  agente.
- **9a.** Condutor recusa ou está impossibilitado de assinar → segue [UC-TEAT-004] sem bloquear a
  finalização.
- **11a.** Sem conectividade: finalização ocorre localmente (offline); ato entra em
  `pending_transmission` até envio — ver [UC-TEAT-005] e [WF-TEAT-001].
- **12a.** Falha de impressão: evento de falha registrado (`failure_reason`); reimpressão
  controlada disponível, sem duplicar o ato.

## Pós-condições

AIT com `current_status = issued`/`finalizado_local`, `content_hash` calculado, evidências e
assinatura/recusa vinculadas, aguardando envio ([WF-TEAT-001]). Número de AIT consumido da reserva
ativa ([WF-TEAT-002]).

## Critérios de aceitação

**AC-TEAT-001-1 — o auto só fecha com o conteúdo mínimo do art. 280**

- **Dado** um rascunho a que falte qualquer elemento do rol do art. 280 do CTB
- **Quando** o agente tenta finalizar
- **Então** a finalização é bloqueada nomeando o elemento ausente ([RN-TEAT-101]) — e o rol é
  tratado como **piso**, de modo que campos exigidos por ficha de enquadramento somam-se a ele,
  nunca o substituem ([RN-TEAT-109])

**AC-TEAT-001-2 — a autuação recai sobre fato constatado, não sobre presunção**

- **Dado** um enquadramento cuja ficha exige constatação material de um elemento
- **Quando** o agente o seleciona sem o elemento registrado
- **Então** o sistema bloqueia o enquadramento ([RN-TEAT-102]) — em nenhuma tela existe campo que
  permita ao agente declarar presunção como fundamento

**AC-TEAT-001-3 — uma infração por auto**

- **Dado** dois enquadramentos simultâneos de mesma raiz de código sobre o mesmo fato
- **Quando** o agente tenta lavrar
- **Então** o sistema consolida em uma única infração ([RN-TEAT-103]); enquadramentos de raízes
  distintas exigem autos distintos, cada um com seu número consumido da reserva

**AC-TEAT-001-4 — competência e circunscrição são verificadas no ato**

- **Dado** um agente cujo vínculo não alcança o local ou o tipo de infração
- **Quando** ele tenta lavrar
- **Então** o sistema bloqueia, citando o rol taxativo de competência ([RN-TEAT-104]) — a presunção
  de veracidade do ato depende de ele ter sido lavrado por quem podia

**AC-TEAT-001-5 — finalizar é sempre um ato explícito**

- **Dado** um rascunho completo e válido
- **Quando** o agente percorre a revisão
- **Então** nenhuma transição automática o finaliza: só a indicação explícita do agente o faz
  ([RN-TEAT-114], Res. 997 Anexo II g) — e nesse instante `content_hash` congela o conteúdo legal
  ([RN-TEAT-004])

**AC-TEAT-001-6 — a assinatura do agente segue o suporte**

- **Dado** um AIT eletrônico finalizado
- **Quando** ele permanece eletrônico
- **Então** não se exige assinatura manuscrita do agente, que é identificado eletronicamente
  ([RN-TEAT-105], [RN-TEAT-110])
- **E quando** o auto é impresso no ato para entrega ao condutor
- **Então** a assinatura do agente passa a ser exigida na via impressa ([RN-TEAT-105])

**AC-TEAT-001-7 — impressão: duas vias, reimpressão no dia, legibilidade por dois anos**

- **Dado** um AIT finalizado com impressão no ato
- **Quando** o recibo é emitido
- **Então** o equipamento produz duas vias em tempo real, permite reimpressão no mesmo dia sem
  duplicar o ato, e o material atende ao piso de legibilidade de dois anos ([RN-TEAT-116])
- **E dado** falha de impressão
- **Então** o ato permanece válido, com `failure_reason` registrado — a falha nunca invalida o AIT

**AC-TEAT-001-8 — quando o AIT vale como Notificação da Autuação**

- **Dado** um AIT lavrado com abordagem e entregue ao condutor no ato
- **Quando** as três condições cumulativas do regime se verificam
- **Então** o sistema o marca como valendo por NA ([RN-TEAT-107]) e o registra assim para
  [WF-INF-001]; faltando qualquer uma delas, a NA é expedida pela retaguarda e o AIT **não** é
  apresentado ao condutor como notificação

**AC-TEAT-001-9 — o número vem da reserva, sempre**

- **Dado** um dispositivo com faixa reservada
- **Quando** um auto é criado
- **Então** consome o próximo número sequencial pré-estabelecido da reserva ([RN-TEAT-113]); sem
  reserva válida não há lavratura, inclusive offline

## Regras aplicáveis

- [RN-TEAT-001] (idempotência/numeração offline)
- [RN-TEAT-003] (dispositivo homologado)
- [RN-TEAT-004] (imutabilidade pós-finalização)
- [RN-TEAT-005] (assinatura/recusa/impossibilidade)
