---
id: RN-BOAT-116
title: Cena do sinistro, regime 3 — sinistro SEM vítima: único dever é remover o veículo quando necessário à fluidez (CTB art. 178)
status: draft
apps: [boat, teat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** No sinistro **sem vítima**, o regime de deveres do condutor envolvido é **radicalmente
mais leve**: existe **um único dever** — adotar providências para **remover o veículo do local,
quando necessária tal medida para assegurar a segurança e a fluidez do trânsito** — cuja omissão é
infração **média**, punida com multa. Não há, no sinistro sem vítima: dever de socorro (não há
vítima), dever de preservar o local para a perícia, dever de identificar-se para boletim, nem
suspensão do direito de dirigir. A inversão em relação ao art. 176 é completa: lá, preservar; aqui,
**liberar**.

**Base legal.** [REF-CTB-sinistro-cena-renaest] art. 178:

> "Art. 178. Deixar o condutor envolvido em sinistro sem vítima de adotar providências para remover
> o veículo do local, quando necessária tal medida para assegurar a segurança e a fluidez do
> trânsito: _(Redação dada pela Lei nº 14.599, de 2023)_
>
> Infração - média; Penalidade - multa."

**Verificação.** Três consequências:

1. **A gravidade do sinistro determina o regime jurídico da cena** — e, portanto, o conjunto de
   fatos que faz sentido capturar. Um `CrashRecord` sem vítima não deveria oferecer ao agente
   campos de omissão de socorro/preservação: são deveres inexistentes naquele regime. A UI de
   captura deve derivar do valor de gravidade ([RN-BOAT-111]), com a ressalva de que a gravidade
   pode ser **reclassificada** se surgir vítima (óbito posterior), hipótese em que o regime muda
   retroativamente.
2. O dever é **condicionado** ("quando necessária tal medida"): a necessidade é juízo de quem está
   na cena. Sem necessidade demonstrada, não há infração — logo o registro precisa capturar **por
   que** a remoção era necessária (obstrução de faixa, risco de novo sinistro, via de fluxo
   intenso), não apenas que não foi feita.
3. É dever do **condutor envolvido**, não do agente: a remoção pela administração, quando não há
   responsável no local, é outra figura, do art. 279-A ([RN-BOAT-120]).

**Controvérsia/risco.** A fronteira entre os arts. 176 e 178 é a **existência de vítima**, aferida
**no momento da cena**. Dois problemas reais decorrem disso: (a) vítima constatada depois — pessoa
que se afasta e depois procura atendimento, ou óbito posterior — desloca o enquadramento para o art.
176 quando o agente já classificou a cena como sem vítima e possivelmente já determinou a remoção;
(b) o dever de preservar o local (art. 176, III) **não existe** no art. 178, mas a via já liberada
inviabiliza a perícia se a classificação inicial se mostrar errada. Nenhuma norma localizada
disciplina a **reclassificação da cena** nem seus efeitos sobre autos já lavrados. O produto deve,
no mínimo, **preservar o croqui e as evidências** de todo sinistro, inclusive sem vítima, e
registrar a hora e o fundamento da liberação da via — que é o que resta como prova quando a cena
desaparece. Ver [RN-BOAT-118]; item 20 de `_intake/legal-assessment.md`.
