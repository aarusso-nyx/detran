# Reviewer rait-backend R-0007 — retry técnico do ciclo 1

> Papel: Auditor (soft gate). Família oposta: Claude Opus. Somente leitura na worktree. A chamada anterior não produziu veredito válido porque a saída tinha aspas não escapadas; portanto este é um retry técnico do primeiro ciclo, não um ciclo de correção. Responda exclusivamente com JSON estritamente válido, sem code fence. Em strings, não use aspas duplas literais nem quebras de linha; prefira texto simples e caminhos sem citações.

Leia, nesta ordem:

1. `docs/meta/agents/orchestra/README.md` §4–§5 e `docs/meta/agents/README.md`.
2. `docs/framework/arch/rait-build-pack.md` WP-B/WP-C e mapa.
3. `work/rounds/R-0007/plan.md`.
4. Todos os JSON em `work/rounds/R-0007/tasks/`.
5. Todos os `work/rounds/R-0007/prompts/TASK-*.md`.
6. `work/rounds/R-0007/compositions.json`.

Faça revisão exaustiva do ciclo 1. O achado recuperado da saída inválida anterior foi corrigido: arquivos gerados index/module foram removidos das fronteiras dos Engineers; TASK-0001 Architect agora altera somente hooks handwritten nos sete blueprints e regenera, e blueprints:check foi acrescentado. Verifique essa correção e todos os outros itens.

Rubrica: papel Art. 6; leitura fechada suficiente; locks/fronteiras; critérios existentes ou explicitamente criados; nenhum valor inventado; tríade; vocabulário; decisões H.46/H.53/H.54/H.57 e OD-309; modelos; política positiva/negativa; DetranError/headers/idempotência/events/tenant; SENATRAN; generated code; DeadlineEngine; completude dos CTGs; hashes de composition.

PASS = nenhum high. REVIEW = high corrigível sem mudar plano. FAIL = contradição canônica/ADR/Constituição/fronteira.

Esquema exato:
{
"mode": "prompt-review",
"round": "R-0007",
"verdict": "PASS",
"findings": [
{
"severity": "high",
"item": 1,
"file": "path",
"line": 1,
"claim": "texto simples sem aspas duplas internas",
"fix": "texto simples sem aspas duplas internas"
}
],
"notes": []
}
