# Autorização A3.4-P2 do Owner — ROLE arquivístico

**Data:** 2026-09-28. **Papel decisor:** Owner. **Rodada:** R-0020. **Escopo:** somente as duas TASKs concluídas R-0003/TASK-0004 e R-0005/TASK-0009 no CTG-0003.

Após consulta específica P2/P1, o Owner respondeu:

> sim, adoto a sua recomendação

A recomendação apresentada era **A3.4-P2**, no contrato `contracts/CTG-0003-A3.4-path-authority.md` SHA-256 `6d6ae318b6dc841d98d150e9c61fcaf88f9a6f57010e1ce4f1ac0c6351d68a59` e na matriz candidata `contracts/CTG-0003-A3.4-role-matrix.json` SHA-256 `13f039bbd5b7e5dcea6a30c1d863dd093181fd9a32bed5ddbd2efde22f795739`, ambos submetidos ao reviewer Claude Opus 5.5 e aprovados com `PASS`, zero achados, no ciclo 3 (`reviews/A3.4-proposal-review-3.json`). Este registro vincula a resposta aos dois hashes finais que constaram da consulta.

O Owner autoriza projetar `discipline: owner` **somente como rótulo arquivístico** dessas duas TASKs, preservando os literais históricos, os originais byte a byte e as discrepâncias por caminho. Cada projeção terá exatamente as três tags `required_tags[]` da sua entrada na matriz, inclusive `authority-enforcement:pending` e `historical-write-authority:unclassified-at-write`. A matriz prospectiva de `apps/` e `backend/` aprovada na questão 6 continua sem enforcement materializado no DEVAI 1.5.6. P2 não ratifica escrituras antigas, não concede autoridade de execução e não declara política prospectiva fiscalizada.

Antes da aplicação, o Architect revisa `contracts/CTG-0003.md`, o prompt e JSON da TASK-0009 e os testes Inspector de `verify-task-originals`; contrato e prompt alterados precisam de revisão cruzada. Após PASS, o maestro confere novamente o SHA-256 candidato autorizado e altera **somente** `status: candidate-not-applied` para `applied` na matriz, como parte do CTG-0003. Qualquer outra alteração da matriz requer nova revisão. A implementação prospectiva de autoridade é adenda própria do CTG-0005, com fonte, testes e materialização governada.

Nenhuma TASK histórica, política DEVAI, PC, prova ou selo é alterado por este registro. Os gates e a guarda PC-B continuam obrigatórios.
