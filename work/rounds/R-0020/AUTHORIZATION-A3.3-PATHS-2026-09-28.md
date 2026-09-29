# Autorização A3.3 do Owner — matriz de autoridade para raízes multistack

**Data:** 2026-09-28. **Papel decisor:** Owner. **Rodada:** R-0020. **Escopo:** resposta à questão 6, complementar às escolhas 1A–5A em `AUTHORIZATION-A3.2-A3.3-PARTIAL-2026-09-28.md`.

Depois de discutir a equivalência conceitual entre `src/` e as raízes de stack e receber a recomendação do maestro, o Owner declarou:

> sim, adoto a sua recomendação

A recomendação aceita é definir uma **matriz de autoridade comum**, aplicada prospectivamente às raízes existentes `apps/` e `backend/`: código e README local de implementação sob Engineer/F2; testes sob Inspector/F3; DDL de blueprint e especificações de arquitetura sob Architect/F1; documentação canônica em `docs/` sob Architect/F1. `frontend/`, `mobile/` e `portal/` não existem como raízes atuais e só entram por adesão explícita futura, após fonte, revisão e materialização próprias. Não há regra implícita para toda raiz nova.

A aprovação autoriza preparar a fonte versionada, a matriz de caminhos e os testes positivos e negativos de autoridade. **Não autoriza** conceder Engineer/F2 indiscriminadamente a `apps/**` ou `backend/**`: os testes, DDL e demais caminhos de outra disciplina devem continuar protegidos. O Art. 6 pinado exige decisão por caminho em tabela de prefixos fixos de até dois segmentos. Se o mecanismo vigente não puder expressar as exceções necessárias, a implementação para e apresenta emenda constitucional/versionamento apropriado; nenhuma edição manual de `.devai/config/authority-policy.json` ou `.devai/pin/constitution.md` é permitida. Qualquer `devai init bind|apply` exige ensaio em clone, execução pelo maestro, autoria por caminho, revisão e gates da rodada.

A classificação é **prospectiva**. A escolha ROLE=R1 continua apenas rótulo arquivístico fiel ao papel Owner delegado declarado nas duas transcrições antigas; não valida retroativamente escrita em `docs/`, `apps/` ou `backend/`. A aplicação de ROLE exige matriz por cada caminho efetivamente tocado, contrato atualizado e revisão cruzada com PASS. A parte desta matriz necessária ao CTG-0003 deve ser resolvida antes da migração das duas TASKs; a relação com o CTG-0005 de autoridade por caminho será registrada em adenda para preservar a ordem dos CTGs e os limites de escrita.

Este registro não altera política, Constituição, TASK histórica, PC, prova ou selo. Os gates de zero TASK inválida, guarda dos PCs arquivísticos, ensaio de verbos DEVAI com escrita, delivery-review, CI verde e PR por CTG permanecem obrigatórios.
