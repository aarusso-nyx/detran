---
id: RN-DASH-130
title: Regra geral do dever derivado — todo teto legal de outro app é um relógio do DASHBOARD, e a diligência precisa ser demonstrável
status: draft
apps: [dashboard, rait, teat, boat, pec]
sources: [REF-LEI-13709-2018, REF-LEI-9873-1999, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** Sempre que uma norma fixa, para outro app do ecossistema, um **prazo cuja perda extingue
direito** (prescrição, decadência, preclusão) ou um **requisito cuja falta invalida o ato**, nasce
para o DASHBOARD um **dever derivado de vigilância** com três componentes obrigatórios e
indissociáveis:

1. **O que monitorar** — a grandeza observável que antecipa a perda (idade do processo no estado
   crítico, validade do certificado, latência da transmissão), nunca o evento consumado.
2. **A consequência legal de perder** — nomeada, com o id da regra-teto de origem. O painel não
   explica a norma; ele **cita** quem a explica.
3. **O alerta mínimo** para que o órgão possa **demonstrar diligência** — não apenas praticá-la.

O terceiro componente é o que distingue esta família de "boa gestão". A LGPD consagra, como princípio,
a **responsabilização e prestação de contas**: a **demonstração** de que as medidas foram adotadas e
de que foram eficazes. Transposto para prazos processuais, o raciocínio é o mesmo que a Lei 9.873/1999
já embute ao mandar **apurar responsabilidade funcional pela paralisação**: quando um processo
prescreve, a pergunta que se faz ao órgão não é _"por que prescreveu?"_, é _"quem foi avisado, quando,
e o que foi feito?"_. Um painel sem registro de alerta não consegue responder — e a ausência de
resposta é, ela própria, o achado.

**Base legal.**

- [REF-LEI-13709-2018] art. 6º, X: _"responsabilização e prestação de contas: **demonstração**, pelo
  agente, da adoção de medidas eficazes e capazes de **comprovar** a observância e o cumprimento das
  normas [...] e, inclusive, da **eficácia dessas medidas**"_.
- [REF-LEI-9873-1999] art. 1º, § 1º _(aplicável ao processo do DETRAN-AM por extensão da Res. 918 art.
  36 — decisão de steering C.13, sem parecer formal)_: a prescrição intercorrente por paralisação
  superior a 3 anos incide _"sem prejuízo da **apuração da responsabilidade funcional** decorrente da
  paralisação"_ — ver [RN-RAIT-113].
- [REF-LEI-13460-2017] art. 23, III: dever de **avaliar** o _"cumprimento dos compromissos e prazos
  definidos para a prestação dos serviços"_ — dever de medir prazos, não apenas de cumpri-los.

**Verificação — o contrato mínimo de um relógio derivado.** Todo card de vigilância no DASHBOARD deve
carregar, sem exceção:

| Campo           | Conteúdo                                                    | Por quê                                                  |
| --------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| `fonte`         | id da regra-teto de origem ([RN-RAIT-112], [RN-PEC-112], …) | rastreabilidade; o painel não é fonte normativa autônoma |
| `consequência`  | o efeito jurídico da perda, em uma linha                    | evita que operador trate teto legal como SLA             |
| `termo_inicial` | evento que inicia a contagem                                | é onde quase todo erro de relógio nasce                  |
| `marcos`        | escada de alerta (verde/amarelo/laranja/vermelho)           | [RN-DASH-135]                                            |
| `destinatário`  | papel humano que recebe cada degrau                         | alerta sem destinatário não é alerta                     |
| `trilha`        | registro imutável de emissão, entrega e reconhecimento      | é a prova de diligência                                  |

**Quatro princípios de calibração.**

1. **Antecipar, não constatar.** Um alerta disparado no dia da prescrição é registro de óbito. Os
   degraus úteis ficam entre 50% e 90% do prazo — padrão já aprovado no RAIT ([WF-RAIT-002] § 4).
2. **O relógio mais curto governa.** Quando dois prazos incidem sobre o mesmo objeto, o painel
   apresenta o menor como vinculante — decisão de steering C.14, aplicada em [RN-RAIT-113].
3. **Nenhum alerta se silencia sozinho.** Alerta vermelho permanece até que o **estado subjacente**
   mude no app de origem. Reconhecimento (_ack_) registra ciência, não resolve ([RN-DASH-101]).
4. **Alerta insanável é ruído.** Se o marco já foi perdido e não há ação possível (ex.: prazo vencido
   em 2022), o item migra de "relógio" para "conformidade estrutural" — visível, mas fora da fila de
   urgência. Fadiga de alerta é risco operacional, não estética.

**Controvérsia/risco.** _Severidade: alta._ Há um efeito perverso conhecido: **um painel que registra
alertas cria prova de que o órgão sabia**. Se o processo prescrever depois de quatro alertas
ignorados, a trilha documenta a omissão. Isso é desconfortável e é _exatamente o ponto_ — a alternativa
(não monitorar para não deixar rastro) é indefensável e agrava a responsabilidade. A mitigação correta
é organizacional: destinatário nomeado por degrau, escalonamento hierárquico e prazo interno de
tratamento do próprio alerta.
