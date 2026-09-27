Papel: Engineer  
Tarefa: TASK-0009 correção restrita

Arquivos alterados: `.github/workflows/ci.yml`

Comandos e resultados:
- Prova positiva com digest exato: exit `0`.
- Prova negativa com digest incorreto: exit `1`.
- `pnpm exec prettier --check .github/workflows/ci.yml`: PASS.
- `pnpm format:check`: PASS.

Critérios:
- CLI direta sem banner: PASS.
- Digest preservado: PASS.
- `workflow_dispatch` preservado: PASS.
- Cleanup e demais comportamentos: PASS.
- `pnpm check`: não executado nesta correção.

Fora do escopo: todos os demais arquivos e jobs.

OD tocada: OD-R17-003

Bloqueios: nenhum.