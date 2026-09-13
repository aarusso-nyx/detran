---
id: RN-BOAT-117
title: O booleano `evaded` não comporta os três regimes de dever da cena — captura deve ser por dever descumprido
status: draft
apps: [boat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** O modelo de dados de [APP-BOAT] representa a conduta do condutor na cena por **um campo
booleano** — `CrashVehicle.evaded`. O ordenamento representa a mesma realidade por **três regimes
jurídicos distintos, com sujeitos, fatos geradores e penalidades diferentes** ([RN-BOAT-114],
[RN-BOAT-115], [RN-BOAT-116]), sendo que o primeiro deles se subdivide em **cinco deveres
autônomos**. A captura em campo deve registrar **qual dever foi descumprido**, não apenas "evadiu-se
ou não" — porque é do dever descumprido, e não da evasão genérica, que decorre o enquadramento do
auto e a penalidade aplicável.

**Base legal.** [REF-CTB-sinistro-cena-renaest] arts. 176 (incisos I a V, gravíssima + suspensão +
recolhimento do documento), 177 (grave, condutor solicitado pela autoridade) e 178 (média, sinistro
sem vítima) — transcritos nas três regras citadas acima.

**Verificação.** Estrutura mínima de captura que a norma sustenta — proposta ao BPO, não decisão
tomada aqui:

| Fato a registrar                                                                 | Regime        | Efeito                    |
| -------------------------------------------------------------------------------- | ------------- | ------------------------- |
| Condutor deixou de prestar/providenciar socorro, podendo fazê-lo                 | art. 176, I   | gravíssima ×5 + suspensão |
| Condutor não adotou providências para evitar novo perigo, podendo fazê-lo        | art. 176, II  | idem                      |
| Condutor não preservou o local para polícia/perícia                              | art. 176, III | idem                      |
| Condutor não removeu o veículo **após determinação** do agente/policial          | art. 176, IV  | idem                      |
| Condutor não se identificou ao policial / não prestou informações para o boletim | art. 176, V   | idem                      |
| Condutor **não envolvido** recusou socorro **solicitado pela autoridade**        | art. 177      | grave                     |
| Condutor, em sinistro **sem vítima**, não removeu o veículo necessário à fluidez | art. 178      | média                     |
| Condutor **impedido** de socorrer (ferido/inconsciente/outra causa)              | —             | afasta 176, I e II        |

Notas de modelagem: (a) o conjunto aplicável **depende da gravidade** do sinistro — sem vítima, só a
última linha é possível; (b) `evaded` deve ser mantido, se necessário, como **derivação** dos fatos
acima (compatibilidade), nunca como a captura primária; (c) o registro do **impedimento** é tão
relevante quanto o da omissão, porque é elemento negativo do tipo; (d) cada fato marcado é candidato
a AIT no TEAT — a associação `CrashRecord`↔AIT deixa de ser navegacional e passa a ser
**instrutória**.

**Controvérsia/risco.** _Severidade: média — é decisão de produto com efeito jurídico, não decisão
técnica._ Enquanto a captura permanecer booleana, ocorrem dois efeitos: o auto lavrado a partir do
registro carece do fato específico que o fundamenta (fragilidade na defesa — [WF-INF-003]), e a
estatística estadual não distingue as três condutas, que a lei distingue expressamente. A decisão de
refinar o modelo é do BPO/Owner (handoff BPO nº 2 do `_intake/research-dossier.md`); esta regra
fornece o recorte jurídico que essa decisão precisa respeitar, qualquer que seja o formato adotado.
