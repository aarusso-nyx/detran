# TASK-0003 — correcao do delivery-review CTG-0001

> Frente `local-stack`, R-0017, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Esta e a segunda e
> ultima iteracao do Engineer para CTG-0001. O runner grava o relatorio em
> `work/rounds/R-0017/reports/TASK-0003-delivery-fix.md`.

## Papel e leitura fechada

Papel constitucional: **Engineer** (Arts. 6/7); declare `Papel: Engineer`
na primeira linha. Leia `AGENTS.md`, `CODESTYLE.md` secoes Shell/Tests/Git,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0017/contracts/CTG-0001.md` inteiro (incluindo Adendas 1 e 2),
`work/rounds/R-0017/reviews/delivery-review-CTG-0001.json` inteiro,
`work/rounds/R-0017/plan.md` secoes Criterios/Adendas/Triagem,
`work/rounds/R-0017/reports/TASK-0002-delivery-fix.md`,
`tools/detran-stack.sh`, `tools/stack/{characterization,revision}.test.mjs`,
`tools/stack/senatran-mock.compose.yml`, `tools/detran-stack.proxy.json`,
`package.json` somente scripts check/test:stack/stack:*,
`backend/database/apply.sh` ate o case de --full,
`senatran-mock/docker-compose.yml` somente servico app/portas.

## Fronteira

Pode editar `tools/detran-stack.sh`, `tools/stack/senatran-mock.compose.yml`
se necessario, `backend/database/apply.sh` somente o novo caso de banco
`detran_local_stack`, `package.json` somente os scripts autorizados em
TASK-0003 original. Nao edite nenhum `*.test.mjs`, contrato, plano, tarefa,
prompt, review, gerado, `senatran-mock/**`, `CLAUDE.md`, `AGENTS.md`,
`record/**`, `.devai/**`, `law/**`, `docs/meta/adr/**` ou rodadas antigas.
Nao execute `git` nem instale dependencias. O maestro registra seu relatorio.

## Correcao requerida

O primeiro delivery-review deu `REVIEW`; seus oito achados altos e quatro
baixos estao no JSON acima. O Inspector corrigiu os sensores e a suite atual
tem 13/13 caracterizacoes verdes e 15/29 revisoes verdes, com 14 falhas
esperadas. Corrija a producao, sem reduzir a suite:

1. Superficie fixa: `DETRAN_DB_IMAGE`, `DB_HOST`, `DB_PORT`, `DB_USER` e
   `DETRAN_BACKEND_PORT` nao sao overrides validos. Rejeite-os **antes** de
   qualquer acesso a Docker, pnpm, psql ou rede, inclusive em `start`.
   Fixe digest PostGIS, 127.0.0.1:5432, usuario postgres e backend 3001;
   alinhe `help` a lista fechada do contrato.
2. Ambiente isolado: inicie backend/frontends com `env -i` e allowlist
   explicitamente contratada. Nunca repasse `*_TOKEN`, `*_SECRET`, `*_KEY`,
   `*_CERT`, Cognito, PAdES, biometria, conselho ou SEFAZ real. Valide
   `DETRAN_RUNTIME_PROFILE=local-sandbox`, `SENATRAN_PROVIDER=mock` e
   `SENATRAN_MOCK_BASE_URL` HTTP loopback sem userinfo. Preserve PATH/HOME e
   variaveis necessarias ao Node/pnpm de modo fechado e justificado.
3. `start --no-mock`: persista estado desabilitado em STATE_DIR; `config` o
   reporta, `health` nao sonda :3000, `status` o mostra, `stop` limpa. Na
   falha controlada de start, o estado escolhido deve ficar observavel ate
   stop, conforme o teste da Adenda 2.
4. Falha de `start`: se algum passo apos iniciar processos falhar, pare
   somente os processos/PIDs desta stack, remova PID files e traga abaixo
   o mock iniciado por esta chamada; devolva exit nao zero e o diagnostico
   do servico culpado. Nao toque no volume nem em outros processos.
5. Timeout do mock: Compose se chama `app`; use `logs --tail=80 app` e o
   override em `logs mock`. Use o timeout validado tambem na espera do DB.
6. `status`: inspecione de fato o container e o mock Compose, em vez de
   escrever `managed`; gere URLs dos frontends pela tabela unica. Nao
   apresente um servico desabilitado/inativo como ativo. `config` continua
   puro, sem criar STATE_DIR; remova `database_env` morto.

Preserve o novo caso de autorizacao em `apply.sh`, a imagem/plataforma de
CI, o isolamento de DB e os scripts existentes. `origin/main` avancou com
`verify:state-index`; o maestro fara merge depois. Nao altere esse gate.
Nenhum valor normativo inventado: se contrato e teste forem contraditorios,
pare e reporte para Adenda numerada do Architect.

## Aceitacao e seguranca

- `pnpm test:stack`: 42/42 casos verdes, sem skip/todo.
- `pnpm stack:config`: JSON valido e sem segredos.
- `pnpm check`: exit 0; caso o gate externo dure muito, registre o estado
  real sem interromper e deixe o maestro concluir.
- `pnpm stack:stop` ao fim se iniciou qualquer processo real da stack.

Use apenas stubs/offline para exercitar o runtime. Nenhuma integracao
externa real nem credencial real. Nao afrouxe politica, RLS ou tenancy;
nao rode `db-reset`/`apply.sh --full` fora do banco descartavel da stack.
Nao edite testes ou arquivos gerados. Formate arquivos tocados.

## Entrega

```markdown
Papel: Engineer
Tarefa: TASK-0003 (correcao delivery-review)
Arquivos criados/alterados: <lista>
Comandos executados e saida resumida: <um por linha>
Criterios de aceitacao: <PASS/FAIL por criterio>
Fora do escopo / deixado: <o que e por que>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descricao>
```
