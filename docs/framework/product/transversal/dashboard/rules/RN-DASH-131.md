---
id: RN-DASH-131
title: Vigilância dos quatro relógios de extinção do RAIT (A/B/C/D) — decadência, inércia recursal, paralisação e prescrição quinquenal
status: draft
apps: [dashboard, rait]
sources: [REF-CTB-280-290, REF-LEI-9873-1999, REF-CONTRAN-918]
updated: 2026-08-31
---

**Regra.** O RAIT é o app com maior densidade de **prazos extintivos** do ecossistema: quatro relógios
independentes, com termos iniciais distintos, que podem correr simultaneamente sobre o mesmo processo
e cuja perda **extingue o direito material do Estado**, não apenas atrasa o serviço. O DASHBOARD deve
monitorar os quatro **separadamente** e exibir, por processo, **qual deles vence primeiro** — porque
é esse, e só esse, que governa a urgência.

| #                      | Relógio                                           | Teto                                                         | Termo inicial                                                         | Efeito da perda                                                                  | Regra-teto                   |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| A                      | **Decadência** do direito de aplicar a penalidade | **180 dias**; **360** se houver defesa prévia tempestiva     | cometimento da infração                                               | Perda do **direito material** de aplicar a penalidade                            | [RN-RAIT-114]                |
| B _(instancia=jari)_   | Julgamento em **1ª instância** (JARI)             | **24 meses**                                                 | **recebimento do recurso pela JARI**                                  | Prescrição da pretensão punitiva                                                 | [RN-RAIT-110]                |
| B _(instancia=cetran)_ | Julgamento em **2ª instância** (CETRAN-AM)        | **24 meses**, independentes do ciclo da JARI                 | **recebimento do recurso pelo CETRAN**                                | Prescrição da pretensão punitiva                                                 | [RN-RAIT-111], [RN-RAIT-112] |
| D                      | **Prescrição quinquenal**                         | **5 anos**                                                   | prática do ato (interrompida pelas hipóteses do art. 2º da Lei 9.873) | Prescrição da ação punitiva                                                      | [RN-RAIT-113]                |
| C                      | **Prescrição intercorrente** por paralisação      | **3 anos** de paralisação pendente de julgamento ou despacho | qualquer paralisação                                                  | Prescrição + **arquivamento de ofício** + apuração de responsabilidade funcional | [RN-RAIT-113]                |

**Vocabulário — o RAIT é o dono das letras.** Os códigos A/B/C/D são os únicos aceitos pelo campo
`clock_code` do modelo de dados (`rait_clock`, constraint `ck_inf_rait_clock_code` em
`aarusso-nyx/detran`), e correspondem aos relógios de [WF-RAIT-002] §4. ⚠ **Divergência aberta**: o
relógio D (prescrição quinquenal) já existe no código, mas a seção correspondente de
[WF-RAIT-002] ainda não foi publicada neste repositório — ver `_meta/backlog.md` §Rodada DASHBOARD. Esta regra usava, até
2026-08-31, um esquema próprio (B1/B2/C1/C2) em que **C significava coisa diferente da que o RAIT
chama de C** — um operador lendo "relógio C" no painel e "relógio C" no RAIT veria relógios
distintos, e nenhum dos valores `B1/B2/C1/C2` poderia sequer ser gravado. A distinção 1ª/2ª
instância do relógio B é real e permanece, mas expressa como **dimensão do caso** (`instancia`),
não como letra nova: são dois ciclos do mesmo relógio B, com termos iniciais próprios.

**O que deve ser monitorado.** Os quatro relógios acima, por processo, em paralelo, com o **menor
tempo restante** promovido a indicador de urgência do processo (decisão de steering C.14: _o mais
curto governa_). Adicionalmente, três grandezas de segunda ordem, que são as que efetivamente
antecipam o desastre:

1. **Idade da fila por estado** — pool de defesa, pool JARI, pool CETRAN ([WF-RAIT-002] § 1).
2. **Tempo desde o último ato praticado** no processo — é o insumo direto do relógio C, e é a métrica
   que ninguém acompanha até ser tarde.
3. **Throughput do colegiado** (casos julgados/mês) × entrada. Um teto de 24 meses só é cumprível se a
   vazão zerar a fila antes dele; a inversão desse balanço é um evento de meses, e é previsível com
   meses de antecedência. O steering registrou esse ponto explicitamente como não fechado (§ "Pontos
   que a múltipla escolha não fechou", item B).

**Consequência legal da perda.** Extinção. Não é atraso, não é SLA, não é degradação de serviço: o
Estado **perde a pretensão**. No caso de C, a norma ainda determina **arquivamento de ofício** e
**apuração de responsabilidade funcional pela paralisação** — o único ponto do domínio `inf` em que a
consequência alcança pessoalmente o servidor. Em B, o sistema **declara a prescrição de ofício**
(decisão de steering C.15) — o que significa que o DASHBOARD verá o evento acontecer
automaticamente, sem intervenção humana, e precisa exibi-lo como **incidente**, não como transição
normal de estado.

**Alerta mínimo para demonstrar diligência.** Escada aprovada em [WF-RAIT-002] § 4 (steering A.1),
reproduzida aqui como calibração vinculante do painel:

- **Relógio A** (180/360 dias): degraus em **50% / 75% / 90%** do prazo.
- **Relógio B** (24 meses): degraus em **12 / 18 / 21 / 23 meses**.
- **Relógio C** (3 anos de paralisação): degraus em **24 / 30 / 33 meses**.
- **Relógio D** (5 anos): degraus derivados, com atenção às **interrupções** do art. 2º da Lei
  9.873/1999 — notificação do indiciado (inclusive por edital) e decisão condenatória recorrível
  **reiniciam** a contagem, e um painel que não modelar a interrupção exibirá risco falso.

Cada degrau com **destinatário nomeado** (relator, presidente da JARI, autoridade de trânsito,
gestor) e **trilha imutável** de emissão, entrega e reconhecimento ([RN-DASH-130], [RN-DASH-135]).

**Verificação.**

1. **Painel de risco de extinção** ordenado por menor tempo restante, com o relógio governante
   identificado por letra — o operador precisa saber _qual_ relógio está apertando, porque a ação
   corretiva difere (A exige expedir notificação; B exige pautar julgamento; C exige praticar
   qualquer ato).
2. **Contador de processos extintos por relógio, por mês.** É o indicador de resultado do módulo
   inteiro, e é o número que o órgão terá de explicar a controle externo.
3. **Suspensão de prazo só aparece se houver ato administrativo motivado e auditado** — nunca
   automática (decisão de steering C.20, sobre a lacuna do art. 290-A do CTB). Processo exibido como
   "prazo suspenso" sem ato vinculado é achado de conformidade do próprio painel.
4. **Divergência entre o relógio do painel e o do RAIT é sempre bug do painel**, e deve ser tratada
   como incidente de dado. A fonte de verdade do prazo é o app de origem ([RN-DASH-101]).

**Controvérsia/risco.** _Severidade: alta._ Três decisões de steering marcadas `[BLOQUEIA]` sustentam
esta regra sem parecer jurídico formal: C.13 (aplicabilidade da Lei 9.873/1999 ao órgão estadual),
C.14 (prevalência do prazo mais curto) e C.15 (declaração de ofício). Se C.13 for revertida em parecer,
**os relógios C e D desaparecem** e a calibração de risco do painel muda materialmente. O painel
deve, portanto, permitir **desativar a família C sem reescrever a família B** — é requisito de
arquitetura derivado de risco jurídico, não de flexibilidade genérica.
