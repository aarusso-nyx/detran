---
id: RN-RAIT-139
title: Dimensionamento das JARI ao prazo legal e coordenador quando houver mais de uma
status: draft
apps: [rait, dashboard]
sources: [REF-CONTRAN-357, REF-CTB-280-290]
updated: 2026-09-12
---

**Regra.** Junto ao órgão autuador deve funcionar **a quantidade de JARI necessária para julgar
dentro do prazo legal** os recursos interpostos; havendo mais de uma, é **obrigatório nomear um
coordenador**. O prazo legal que dimensiona a capacidade é o de 24 meses contados do recebimento do
recurso pelo órgão julgador ([RN-RAIT-110]); a escada de alertas de [WF-RAIT-002] §4 é o mecanismo
de prevenção, e a projeção de capacidade de [WF-RAIT-004] §8 é o gatilho gerencial para constituir
nova JARI/turma (`TURMA_EM_CONSTITUICAO`) antes que a fila ameace o teto.

**Base legal.**

- [REF-CONTRAN-357] item 2.2: _"Haverá, junto a cada órgão ou entidade executivo de trânsito ou
  rodoviário, uma quantidade de JARI necessária para julgar, dentro do prazo legal, os recursos
  interpostos."_
- [REF-CONTRAN-357] item 2.3: sempre que funcionar mais de uma JARI junto ao órgão, deverá ser
  nomeado um coordenador.
- [REF-CTB-280-290] art. 285 §6º (24 meses) e art. 289-A (prescrição por não julgamento).

**Verificação.** O dashboard calcula mensalmente chegada de recursos, capacidade de sessão e idade
mediana da fila por unidade ([WF-RAIT-004] §8); três meses seguidos de fila crescente ou mediana
acima de 6 meses em `EM_JULGAMENTO_JARI` abrem tarefa ao gestor RAIT de proposta de nova turma. Com
mais de uma unidade ativa, o sistema exige um membro com papel `coordenador` no pool `jari` e roteia
a distribuição em dois níveis (entre turmas, depois entre relatores).

**Controvérsia/risco.** A Res. 357/2010 é diretriz para regimento, com vigência de confiança
moderada ([RN-RAIT-116]); o Owner confirmou uma única JARI-AM (steering B.9) e a resposta
institucional sobre composição segue ambígua (DT-071). O gatilho de nova turma é proposta
gerencial, não obrigação automática.
