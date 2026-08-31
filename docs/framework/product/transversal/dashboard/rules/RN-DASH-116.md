---
id: RN-DASH-116
title: Ouvidoria — dois relógios de resposta (30+30 ao usuário, 20+20 ao agente público interno) e responsabilidade pela recusa de recebimento
status: draft
apps: [dashboard, portal]
sources: [REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** A ouvidoria opera **dois relógios legais distintos e encadeados**, que o DASHBOARD deve
tratar separadamente porque têm sujeitos, prazos e consequências diferentes:

| #   | Relógio                                                   | Prazo       | Prorrogação                                           | Termo inicial                      | Quem responde  |
| --- | --------------------------------------------------------- | ----------- | ----------------------------------------------------- | ---------------------------------- | -------------- |
| 1   | **Decisão administrativa final ao usuário**               | **30 dias** | 1x, por igual período, **justificada** (60 no limite) | recebimento da manifestação        | ouvidoria      |
| 2   | **Resposta de agente público a solicitação da ouvidoria** | **20 dias** | 1x, por igual período, **justificada** (40 no limite) | recebimento da solicitação interna | área demandada |

O relógio 2 corre **dentro** do relógio 1 e é o mecanismo pelo qual o atraso interno converte-se em
descumprimento externo. Um painel que só mede o relógio 1 mede o sintoma; medir o 2 é medir a causa.

Regra de fronteira associada: **em nenhuma hipótese o recebimento de manifestação pode ser
recusado**, sob pena de responsabilidade do agente público. Isso significa que **não existe estado
"manifestação rejeitada na entrada"** — só existe recebida e tratada.

**Base legal.** [REF-LEI-13460-2017] _(verbatim)_:

> **Art. 16. A ouvidoria encaminhará a decisão administrativa final ao usuário, observado o prazo de
> trinta dias, prorrogável de forma justificada uma única vez, por igual período.**
> Parágrafo único. Observado o prazo previsto no caput, a ouvidoria poderá solicitar informações e
> esclarecimentos diretamente a agentes públicos do órgão [...], e as **solicitações devem ser
> respondidas no prazo de vinte dias, prorrogável de forma justificada uma única vez, por igual
> período**.
>
> Art. 11. **Em nenhuma hipótese, será recusado o recebimento de manifestações** formuladas nos
> termos desta Lei, **sob pena de responsabilidade do agente público**.
>
> Art. 12. [...] Parágrafo único. A efetiva resolução das manifestações dos usuários compreende: I -
> recepção da manifestação no canal de atendimento adequado; II - **emissão de comprovante de
> recebimento**; III - análise e obtenção de informações, quando necessário; IV - **decisão
> administrativa final**; e V - **ciência ao usuário**.
>
> Art. 10. [...] § 2º São vedadas quaisquer exigências relativas aos **motivos determinantes** da
> apresentação de manifestações perante a ouvidoria.

**Periodicidade / prazo.** Não é periódico — é **prazo por evento**, disparado a cada manifestação
(relógio 1) e a cada solicitação interna (relógio 2).

**Consequência do descumprimento.** Para a **recusa de recebimento**, a lei é expressa:
**responsabilidade do agente público** (art. 11). Para o **estouro dos prazos** dos relógios 1 e 2,
**não há sanção específica localizada** — é o mesmo padrão de "SLA legal sem cominação" já
identificado no domínio `inf` e no PEC ([RN-PEC-112]). A consequência efetiva é a alimentação do
indicador público de qualidade do art. 23 ([RN-DASH-117]) e a exposição em relatório anual
([RN-DASH-115]).

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Fila por idade, não por volume.** O indicador primário é a distribuição de manifestações abertas
   por dias decorridos, com corte em D-30 e D-60. Volume total é ruído; idade é risco.
2. **Prorrogação como evento auditável.** A prorrogação exige **justificativa** e é **única**. O
   painel deve exibir quantas manifestações foram prorrogadas, com a justificativa registrada, e
   sinalizar tentativa de segunda prorrogação como **impossível por lei**, não como exceção a aprovar.
3. **Relógio 2 por área demandada** — é o único indicador que atribui o atraso a quem o causa. Sem
   ele, a ouvidoria absorve sozinha um atraso que é da área técnica.
4. **Prova dos cinco passos do art. 12, parágrafo único**, por manifestação: recepção, **comprovante
   emitido**, análise, decisão final, **ciência ao usuário**. Encerrar sem ciência não é encerrar.
5. **Contador de recusas de recebimento = 0, exibido.** Um zero exibido é prova; um campo ausente não
   é. Se o sistema tiver qualquer caminho que rejeite manifestação na entrada (validação de formulário
   que impeça envio, exigência de motivo — vedada pelo art. 10, § 2º), isso é achado de conformidade
   e deve aparecer no painel de saúde do PORTAL.

**Controvérsia/risco.** _Severidade: média._ A ausência de sanção para o estouro de prazo cria a
tentação de tratar 30/60 dias como meta flexível. Não é: é prazo legal, e seu descumprimento
sistemático é exatamente o tipo de dado que a própria lei manda **publicar** (art. 23, § 2º, ranking
de reclamações) — a transparência é a sanção.
