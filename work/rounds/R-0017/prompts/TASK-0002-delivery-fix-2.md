# TASK-0002 — sensor de ambiente opcional (delivery-review ciclo 2)

> Frente `local-stack`, R-0017, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Adenda 3 autoriza
> somente o sensor abaixo. O runner grava o relatorio em
> `work/rounds/R-0017/reports/TASK-0002-delivery-fix-2.md`.

## Papel e leitura fechada

Papel constitucional: **Inspector** (Arts. 6/7); declare `Papel: Inspector`
na primeira linha. Leia `AGENTS.md`, `CODESTYLE.md` §Tests,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0017/contracts/CTG-0001.md` (Adenda 3),
`work/rounds/R-0017/reviews/delivery-review-CTG-0001-2.json` inteiro,
`tools/stack/revision.test.mjs` (harness e teste de ambiente do backend),
`tools/detran-stack.sh` (somente `start_backend`),
`backend/app/src/detran-runtime.ts` linhas 300-352 e
`packages/senatran-adapter/src/config.ts` linhas 65-90.

## Fronteira e tarefa

Edite somente `tools/stack/revision.test.mjs`. No teste offline existente
que captura o ambiente do backend, acrescente assercoes de que, com defaults
e sem valores explicitos, **nao existem** as linhas
`DETRAN_LOCAL_ACTOR_ID=`, `DETRAN_LOCAL_CPF=`,
`DETRAN_LOCAL_ASSURANCE_LEVEL=`, `SENATRAN_MOCK_CPF_USUARIO=` e
`SENATRAN_MOCK_CLIENT_CERT_CN=`. Isto preserva os defaults `??` do runtime.
Nao diminua as assercoes de ausencia de segredos ja existentes. O caso novo
deve falhar com a implementacao atual; os demais casos permanecem verdes.
Nao altere producao, outros testes, plano, contrato, tarefa, prompt, review,
gerado, `senatran-mock/**`, `CLAUDE.md`, `AGENTS.md`, `record/**`,
`.devai/**`, `law/**`, `docs/meta/adr/**` ou rodadas antigas. Nao execute
`git` nem instale dependencias. Nenhuma integracao externa/credencial real.

## Aceitacao

- `node --test tools/stack/characterization.test.mjs`: 13/13 verde.
- `node --test tools/stack/revision.test.mjs`: apenas o novo sensor vermelho;
  nenhum skip/todo.
- `pnpm format:check`: exit 0.

Formate o arquivo tocado e entregue no formato padrao do relatorio:
`Papel`, `Tarefa`, `Arquivos criados/alterados`, `Comandos executados e saida
resumida`, `Criterios de aceitacao`, `Fora do escopo / deixado`,
`OD tocadas ou propostas`, `Bloqueios`.
