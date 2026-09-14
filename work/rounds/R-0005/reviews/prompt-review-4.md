# Prompt do reviewer — modo prompt-review — iteracao excepcional 4

Voce e o reviewer Claude Opus 5 da familia oposta ao maestro Sol na orquestra ops-agency,
R-0005. Papel constitucional: Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/ops-agency` e responda apenas com JSON. O humano
autorizou explicitamente esta quarta iteracao e determinou ignorar o budget de tokens somente para
esta chamada.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md`, secoes 4, 5 e 6.
2. `docs/meta/agents/orchestra/model-ladder.md`.
3. `docs/meta/agents/README.md`, regras comuns.
4. `docs/framework/arch/teat-build-pack.md`, somente WP-T1 e mapa entregavel-definicoes.
5. `docs/meta/knowledge-base/steering.md`, H.39, H.40, H.45, H.54 e H.55.
6. `work/rounds/R-0005/reviews/prompt-review-3.json`, campo `result`.
7. `work/rounds/R-0005/plan.md`; `tasks/TASK-0001.json`...`TASK-0009.json`;
   `prompts/TASK-0001.md`...`TASK-0009.md`; `compositions.json`.
8. `tools/blueprints/generate.mjs`, funcoes `write` e `packageFiles`.
9. `backend/domains/ops/snapshots/src/index.ts` e
   `backend/domains/ops/snapshots/src/handwritten/*.ts`.
10. Commit preparatorio `98fcf673f39d3179ddfa333932c2805e2f911f77`, somente por
    `git show --stat --oneline` e `git show --format=fuller --no-ext-diff --find-renames`.

Nao leia outros caminhos. Nao execute comandos que escrevam no repositorio.

## Delta desta iteracao

- O maestro sincronizou a worktree com `origin/main` e fez uma relocacao preparatoria isolada no
  commit `98fcf673f39d3179ddfa333932c2805e2f911f77`: `FrozenSnapshotService` e
  `FrozenSnapshotController` agora vivem em `src/handwritten`, enquanto `src/index.ts` apenas os
  reexporta. Typecheck, build e `pnpm check` passaram; `pnpm blueprints:generate` nao foi executado.
- TASK-0002 reconhece a preparacao, fixa os quatro `module.name`/nomes de pacote, exige os caminhos
  handwritten de snapshots e exige classes `@Injectable` resolviveis ou providers de fabrica para
  dependencias que o Nest nao infere.
- TASK-0004 nao remigra snapshots, permite apenas completar seu provider resolvivel, proibe edicao
  manual de package/tsconfig/vitest gerados, separa `backend/app/package.json` de `pnpm-lock.yaml` e
  preserva a atualizacao do lock via `pnpm install --lockfile-only`.
- TASK-0006 proibe editar vitest.config.ts gerado. TASK-0008 aplica DDL, seed e RLS smoke ao mesmo
  banco `detran_r5`. A tabela de locks e os criterios globais do plano foram alinhados.
- Hashes e PC ids foram recalculados para todos os prompts alterados e conferidos com os tasks.

## Rubrica e veredito

Use os 12 itens de `work/rounds/R-0005/reviews/prompt-review-1.md`. Cite arquivo e linha. Avalie se
o high de perda silenciosa do `FrozenSnapshotService` foi efetivamente eliminado antes de
TASK-0002 e se as correcoes nao criaram nova violacao de fronteira, codigo gerado ou wiring Nest.

`PASS`: nenhum finding high. `REVIEW` ou `FAIL`: qualquer high remanescente bloqueia o disparo e
deve ser escalado ao humano. Nao execute workers e nao altere arquivos.

## Saida

Emita exatamente um objeto JSON valido, sem cercas Markdown. Use somente strings JSON com aspas
duplas corretamente escapadas. Dentro de `claim`, `fix` e `notes`, nao use crases, aspas duplas
literais, quebras de linha ou blocos de codigo; prefira texto simples e conciso. Antes de responder,
valide mentalmente que a saida pode ser consumida por `JSON.parse`.

{
"mode": "prompt-review",
"round": "R-0005",
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 1,
"file": "caminho",
"line": 1,
"claim": "achado",
"fix": "correcao"
}
],
"notes": []
}
