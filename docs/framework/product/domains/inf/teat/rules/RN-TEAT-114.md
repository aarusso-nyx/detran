---
id: RN-TEAT-114
title: A finalização do AIT é ato explícito do agente — vedado encadeamento automático
status: draft
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** O talão eletrônico deve **exigir que o agente de trânsito indique a finalização do
preenchimento do AIT** para que um novo AIT possa ser preenchido — e essa indicação **não pode ser
automática ao final do preenchimento**. Em consequência: (a) não pode existir "auto-submit" ao
completar o último campo; (b) não pode existir fluxo que abra o próximo AIT como efeito colateral
do preenchimento do anterior; (c) a finalização é o **ato de vontade** que congela o conteúdo
legal ([RN-TEAT-004]) e, portanto, o único ponto em que o agente assume o auto.

**Base legal.** [REF-SENATRAN-997] Anexo II, g):

> "Deverá exigir que o agente de trânsito indique a finalização do preenchimento do AIT, para que
> um novo AIT possa ser preenchido, não podendo ser de forma automática ao final do preenchimento;"

**Verificação.** `POST /v1/ait-lifecycle/aits/:id/finalize` já é comando explícito — a regra
**confirma** o desenho de [WF-TEAT-001] e o transforma em restrição normativa: qualquer futura
otimização de UX que dispare a finalização por completude de formulário, por temporizador, por
saída de tela ou por início de novo atendimento **viola a Portaria**. O runtime móvel deve
impedir a coexistência de dois rascunhos abertos pelo mesmo agente no mesmo dispositivo, já que a
norma condiciona o novo preenchimento à finalização do anterior. Cancelamento de rascunho, quando
o agente não quiser finalizar, segue [RN-TEAT-120] — não é caminho livre de abandono.

**Controvérsia/risco.** A norma condiciona o **novo** preenchimento à finalização do anterior, o
que literalmente proíbe rascunhos simultâneos. Isso colide com cenários operacionais reais
(abordagem interrompida por ocorrência prioritária). A saída conforme é cancelar o rascunho com
justificativa ([RN-TEAT-120]) e reabrir depois como novo auto — nunca manter dois abertos. Se o
órgão precisar de suspensão temporária de rascunho, é matéria a submeter à SENATRAN, não a
resolver por desenho. Item 13 de `_intake/legal-assessment.md`.
