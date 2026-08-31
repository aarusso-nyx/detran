---
id: RN-DASH-113
title: RENAEST — deveres estaduais permanentes sem relógio vigente: o painel exibe "sem prazo definido", nunca ausência silenciosa
status: draft
apps: [dashboard, boat]
sources: [REF-CONTRAN-808-2020, REF-CTB-sinistro-cena-renaest, REF-LEI-13614-2018]
updated: 2026-08-24
---

**Regra.** Os deveres do DETRAN-AM no RENAEST são **permanentes e incondicionais**, mas — com uma
única exceção já vencida — **não têm prazo periódico vigente**. O painel deve representar essa
combinação com precisão, porque ela é contraintuitiva: há dever, há responsável nominal, e **não há
relógio**. Quatro linhas da tabela de deveres monitoráveis caem aqui, e cada uma exige tratamento
distinto:

| Dever                                                                                     | Estado do relógio                                                                                               | Como o painel representa                                                                            |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Enviar ao órgão federal os dados de sinistro coletados (art. 9º, II)                      | **Sem prazo por registro** — suprimido em 2023, regulamentação delegada nunca editada ([RN-BOAT-106])           | Indicador de **fluxo e latência**, com rótulo permanente _"sem prazo legal vigente — meta interna"_ |
| Repassar dados estatísticos consolidados ao sistema nacional (CTB art. 326-A, § 9º)       | **Prazo extinto** — era 1º de março (Lei 13.614/2018), hoje _"conforme regulamentação do Contran"_, não editada | Estado explícito **"sem prazo definido"**, com nota da lacuna — não ocultar a linha                 |
| Integração institucional ao RENAEST (art. 16)                                             | **Vencido em 04/01/2022** — marco histórico não recorrente ([RN-BOAT-108])                                      | Indicador **binário de conformidade** (integrado sim/não), com data de vencimento exibida           |
| Reuniões periódicas com coordenadores federal e estaduais (arts. 8º, VIII e 9º, VII-VIII) | **Periódicas sem número**                                                                                       | Registro de **última ocorrência** e intervalo decorrido, sem semáforo de vencimento                 |

Publicação estatística mensal (art. 8º, V) **não entra nesta tabela como dever do DETRAN-AM**: é
dever do **órgão máximo executivo federal**. Ver [RN-BOAT-130] e [RN-DASH-142].

**Base legal.**

- [REF-CONTRAN-808-2020] art. 9º _(rol taxativo de deveres estaduais, verbatim parcial)_: _"Caberá
  aos órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal: I - organizar e
  manter os dados e as informações referentes a acidentes e estatísticas de trânsito [...]; II -
  **enviar ao órgão máximo executivo de trânsito da União os dados** referentes a acidentes e
  estatísticas de trânsito coletados conforme disposto no inciso IX do art. 22 do CTB [...]; III -
  validar os dados [...]; VII - **participar das reuniões periódicas** com os coordenadores previstos
  no art. 7º [...]; e VIII - **organizar e realizar reuniões periódicas** com os órgãos ou entidades
  integradas ao RENAEST em nível estadual."_ — seis dos oito incisos não são de envio.
- [REF-CONTRAN-808-2020] art. 16: _"Os órgãos e entidades que compõem o SNT deverão se integrar ao
  RENAEST **até 4 de janeiro de 2022**."_
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 9º _(redação da Lei nº 14.599/2023)_: _"Os dados
  estatísticos coletados em cada Estado e no Distrito Federal serão tratados e consolidados pelos
  respectivos órgãos ou entidades executivos de trânsito, que os repassarão ao órgão máximo executivo
  de trânsito da União, **conforme regulamentação do Contran**."_ — a redação original de 2018
  ([REF-LEI-13614-2018]) dizia _"até o dia 1º de março"_. O prazo saiu da lei e não voltou em
  resolução.

**Periodicidade / prazo.** Ver tabela. Em resumo: **um marco vencido (04/01/2022), um prazo extinto
sem substituto, e nenhuma periodicidade numérica vigente.**

**Consequência do descumprimento.** **Não localizada** para nenhuma das quatro linhas. Nem a Res.
808/2020 nem o art. 326-A cominam sanção ao órgão estadual. A consequência prática recai sobre o
**índice do Pnatrans** ([RN-DASH-114]): dado estadual ausente ou atrasado distorce a apuração da meta
de redução de mortes — que é o instrumento pelo qual o desempenho do Estado é medido publicamente.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Estado "sem prazo definido" como valor de primeira classe** na UI — não como célula vazia, não
   como "N/A", não como ausência de card. É uma lacuna normativa real e o painel deve comunicá-la a
   quem o consome (recomendação de UX do dossiê, § Handoff-UX).
2. **Meta interna rotulada como interna.** Se o órgão adotar, por decisão própria, um prazo de
   transmissão (ex.: D+5 do atendimento), o painel exibe _"meta interna do DETRAN-AM — sem
   fundamento legal vigente"_. Mesma disciplina de [RN-BOAT-106].
3. **Latência real, sempre**: mediana e p95 do intervalo entre registro do sinistro no BOAT e
   confirmação de aceite no RENAEST. Sem prazo legal, a métrica defensável é a **tendência**, não o
   semáforo.
4. **Backlog de não enviados / rejeitados** com idade — é o que efetivamente cria risco, e é
   auditável independentemente de prazo.
5. **Conformidade estrutural**: integração ativa (art. 16), coordenador de RENAEST designado e
   identificado por nome ([RN-BOAT-105]), última reunião periódica registrada. São três respostas
   "sim/não/quando" que o órgão precisa saber dar de imediato a controle externo.

**Controvérsia/risco.** _Severidade: média-alta._ Há a tentação de "preencher" a lacuna adotando o
antigo 1º de março como se ainda valesse. **Não vale** — a lei o suprimiu. Restabelecer prazo
equivalente **por norma interna do DETRAN-AM** é caminho legítimo (a União delegou e não
regulamentou), mas é ato do órgão e deve ser assim registrado. Item de encaminhamento ao Owner —
ver `_intake/legal-assessment.md`.
