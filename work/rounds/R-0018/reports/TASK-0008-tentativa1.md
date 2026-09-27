Papel: Architect (transcrição)
Tarefa: TASK-0008
Arquivos criados/alterados: apps/teat/web/README.md; apps/teat/mobile/README.md; apps/boat/mobile/README.md; backend/domains/shared/README.md; backend/domains/{ch,dashboard,est,inf,ops,portal}/README.md; tools/README.md; docs/framework/arch/README.md
Comandos executados e saída resumida:
- git log origin/main -- tools/detran-stack.sh tools/stack → vazio (R-0017 fora de main; §3.6 literal)
- prettier --write/--check nos 12 arquivos → OK
- C-03-10: grep placeholder/Built in Phase 3 (TEAT) → vazio; BOAT → 1 linha (`standalone Capacitor app`)
- C-03-11: 'Boletim de Acidentalidade de Trânsito' → 1; 'Boletim de Ocorrência de Acidente' → 0
- C-03-13: '36 codes' → 1; DETRAN_ROLES.length → 36
- C-03-14/15: sem 'Populated/Skeleton in Phase'; `## Modules` em cada domínio; linhas = package.json: ch 17, dashboard 2, est 1, inf 14, ops 9, portal 6
- C-03-16: sem 'Phase-2 checks'; 28 linhas de tabela; 'pendente R-0017' → 1
- C-03-17: todos os docs/framework/arch/*.md linkados; 'Stub — Phase 2' → 0
- C-03-18: git diff --quiet 7d6bd665 -- backend/database/ → exit 0
Critérios de aceitação: C-03-10…C-03-18 PASS (C-03-15 para integration conferido pelo maestro após TASK-0009)
Fora do escopo / deixado: backend/domains/integration/README.md (TASK-0009); fechamento (TASK-0011); backend/database/ddl/README.md (OD-R18-005)
OD tocadas ou propostas: nenhuma
Bloqueios: nenhum

Nota do maestro (T8): esta entrega foi apagada por TASK-0005 (git checkout -- / rm fora da fronteira, execução concorrente de dois CTGs na mesma worktree). Redespacho idêntico, mesmo PC, sem contar iteração.
