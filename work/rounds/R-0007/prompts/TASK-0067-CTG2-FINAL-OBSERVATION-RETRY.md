# TASK-0067 — observação final do CTG-0002 após compatibilidade de upgrade

Papel Art. 6: Inspector, Terra/high, uma tentativa. Não corrigir, regenerar ou
editar o candidato. Executar o gate oficial `pnpm backend:test:ci` no banco
dedicado e descartável `detran_r7_ctg1_a2`, usando conexão owner explícita nos
harnesses que assumem o papel local e URLs request-path explícitas para app e
reader. As autorizações OWNER para baseline, reset, upgrade, full e restauração
estão registradas; nunca imprimir credenciais.

Confirmar em particular que o baseline DDL35 v1.1.0 recebe DDL36 atual sem a
falha `there is no unique constraint matching given keys`, que a restauração
obrigatória ocorre e que os testes não são classificados como PASS quando
coleção é zero, URL falta ou papel efetivo está incorreto.

Depois executar `pnpm check`, `blueprints:check`, `contracts:check`,
`verify:rls-ddl`, `verify:decorators`, `devai:doctor`, verificação da cadeia de
evidências e `git diff --check`. Registrar contagens e o primeiro erro real se
algum comando falhar.

Allowlist de escrita: somente `work/rounds/R-0007/tasks/TASK-0067.json`.
Qualquer defeito do candidato é FAIL e volta a Architect/Engineer; Inspector não
o corrige. PASS exige todos os gates executados sobre o mesmo candidato.
