---
id: RN-RAIT-140
title: Impedimento e suspeição na distribuição — quem não pode receber, relatar ou votar um caso
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022, REF-LEI-9784-1999]
updated: 2026-09-12
---

**Regra.** Ninguém recebe distribuição, relata ou vota em caso no qual esteja **impedido** ou seja
**suspeito**. São impedidos: quem lavrou o AIT objeto do recurso; quem tem interesse direto ou
indireto na matéria; quem participou ou participará como perito, testemunha ou representante, ou
cujo cônjuge, companheiro, parente ou afim até o terceiro grau esteja nessas situações; quem
integra simultaneamente JARI e CETRAN. Pode ser arguida a **suspeição** de quem tenha amizade
íntima ou inimizade notória com interessado ou seus parentes até o terceiro grau. O impedimento é
declarado **antes de qualquer acesso ao mérito** e o caso é redistribuído sem aproveitar trabalho
do impedido; o membro impedido num item de pauta não vota nem conta para o quorum daquele item.

**Base legal.**

- [REF-CONTRAN-357] item 5.1.c (não julgar recurso relativo a AIT que o próprio integrante lavrou)
  e item 4.1.c (vedação de compor JARI e CETRAN); [REF-CONTRAN-901-2022] Anexo 5.4 e 10.1
  (impedimentos facultativos ao regimento do CETRAN).
- [REF-LEI-9784-1999] art. 18 (impedimento: interesse direto ou indireto; perito, testemunha ou
  representante, inclusive por cônjuge, companheiro, parente e afins até o terceiro grau; litígio
  com interessado), art. 19 (dever de comunicar o impedimento; omissão é falta grave), art. 20
  (suspeição por amizade íntima ou inimizade notória) e art. 21 (indeferimento da suspeição
  recorrível sem efeito suspensivo) — aplicação subsidiária ([REF-LEI-9784-1999] art. 69).

**Verificação.** O sorteio ([WF-RAIT-004] §5) exclui automaticamente quem lavrou o AIT (dado do
TEAT) e quem tem registro de impedimento/suspeição no caso; ao aceitar o lote, o relator declara
ausência de impedimento ([UC-RAIT-004] AC-1); a arguição de suspeição por interessado abre tarefa
ao presidente, com decisão registrada. O registro `rait_impediment` passa a distinguir
`impedimento` de `suspeicao` e a guardar o fundamento ([WF-RAIT-004] §10).

**Controvérsia/risco.** O Decreto AM 53.557/2026 revogou o inciso V do art. 5º do regimento do
CETRAN-AM, que provavelmente vedava a participação de agentes da autoridade de trânsito no
colegiado ([REF-DECRETO-53557-2026]) — o impedimento **por caso** (item 5.1.c) permanece; o que
caiu foi a vedação **por categoria**. Teor exato do inciso revogado não confirmado.
