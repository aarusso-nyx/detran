# Prompt do reviewer — modo prompt-review — iteracao 2

Voce e o reviewer Claude Opus da familia oposta ao maestro Sol na orquestra ops-agency, R-0005.
Papel constitucional: Auditor soft gate. Trabalhe somente em leitura na worktree
/Volumes/Thiamat II/stech/detran-worktrees/ops-agency e responda apenas com JSON.

## Leitura fechada

1. docs/meta/agents/orchestra/README.md, secoes 4, 5 e 6.
2. docs/meta/agents/orchestra/model-ladder.md.
3. docs/meta/agents/README.md, regras comuns.
4. docs/framework/arch/teat-build-pack.md, somente WP-T1 e mapa entregavel-definicoes.
5. docs/meta/knowledge-base/steering.md, H.39, H.40, H.45, H.54 e H.55.
6. work/rounds/R-0005/reviews/prompt-review-1.json, campo result.
7. work/rounds/R-0005/plan.md; tasks/TASK-0001.json...TASK-0009.json;
   prompts/TASK-0001.md...TASK-0009.md; compositions.json.

## Delta obrigatorio a verificar

- TASK-0003 agora escreve somente testes integration/e2e de @detran/app, ambos descobertos pelos
  scripts existentes; TASK-0004 exige os nomes desses specs no log de backend:test:ci.
- TASK-0002 preserva explicitamente todos os entity.table fisicos existentes de FIELD, SNAPSHOTS
  e EVIDENCE e exige mapear nomes novos.
- Globs de TASK-0003 e TASK-0008 foram removidos ou protegidos; driver_* e vehicle_* estao em
  codigo inline. Todos os hashes e PC ids foram recalculados.
- Lows corrigidos: DDL 20 ganhou lock/fronteira; sensor opcional de FK tem arquivo unico;
  MOD-seed-timers foi declarado; Engineers nao editam campos handwritten dos blueprints;
  TASK-0008 declara apply + duas seeds; TASK-0006 inclui backend:test:unit; referencia RLS morta
  foi removida; TASK-0001 -> TASK-0002 esta alinhado no plano.
- O uso de Opus permanece porque prompts/00-maestro.md exige explicitamente claude opus, regra
  mais especifica que a heuristica geral da escada.

## Rubrica e veredito

Use os 12 itens de reviews/prompt-review-1.md. Cite arquivo e linha. PASS: nenhum high. REVIEW:
high corrigivel sem mudar plano. FAIL: contradicao de Owner, ADR, Constituicao ou fronteira. Esta
e a segunda e ultima iteracao permitida antes de escalar.

## Saida

{
"mode": "prompt-review",
"round": "R-0005",
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{"severity":"high | low","item":1,"file":"caminho","line":1,"claim":"achado","fix":"correcao"}
],
"notes": []
}
