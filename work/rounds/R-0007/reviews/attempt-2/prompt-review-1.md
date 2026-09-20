# Prompt-review R-0007 — tentativa 2, ciclo 1

> Papel constitucional: Auditor (soft gate). Você é Claude Opus, família oposta ao maestro.
> Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.
> Responda exclusivamente com JSON estritamente válido, sem code fence. Não use aspas duplas
> literais dentro de strings; use texto simples.

## Leitura, nesta ordem

1. `docs/meta/agents/orchestra/README.md` §4–§5.
2. `docs/meta/agents/README.md` §Regras comuns.
3. `docs/framework/arch/rait-build-pack.md` inteiro, com foco WP-B/WP-C.
4. `work/rounds/R-0007/plan.md`.
5. Todos os `work/rounds/R-0007/tasks/TASK-*.json`.
6. Todos os `work/rounds/R-0007/prompts/TASK-*.md`.
7. `work/rounds/R-0007/compositions.json`.

Os arquivos diretamente sob `reviews/` são histórico da tentativa 1 e não contam como ciclo desta
tentativa. Esta revisão é o ciclo 1, contadores zerados.

## Rubrica exaustiva

1. Papel Art. 6 compatível com cada caminho tocado.
2. Leitura fechada suficiente e sem pesquisa implícita.
3. Locks e fronteiras reais, disjuntos; workers sem git/instalação.
4. Critérios executáveis existentes ou explicitamente criados, com resultado esperado.
5. Nenhum valor inventado; lacunas são source_pending/OD.
6. Tríade: contrato Architect, sensores Inspector, runtime Engineer.
7. Hooks de blueprint só depois do alvo manuscrito existir; gerados apenas por comando.
8. Policy tests exclusivamente Inspector, positivos e negativos por papel; OD-309 preservada.
9. policy-routes exclusivamente Inspector e bidirecional.
10. Wiring completo de app: manifest, aliases, AppModule, typecheck/build/e2e.
11. PREP-DEPS pelo maestro; TASK-0017 não instala nem toca lockfile.
12. Sete nomes canônicos de contratos e checker/client com sensores prévios.
13. backend:test:integration realmente recebe os sete módulos.
14. DetranError, If-Match/ETag, Idempotency-Key, events, tenant e RLS.
15. DeadlineEngine, alert-only e SENATRAN boundary.
16. Modelos/esforços conforme model-ladder e CTGs autocontidos/mescláveis.
17. Hashes/PC ids coincidem byte a byte.

Primeiro ciclo exaustivo: liste todos os achados. PASS se nenhum high; REVIEW se high corrigível
sem mudar decisões; FAIL somente por contradição canônica, constitucional, ADR ou fronteira.

## Saída

{
"mode": "prompt-review",
"round": "R-0007",
"attempt": 2,
"cycle": 1,
"verdict": "PASS",
"findings": [
{
"severity": "high",
"item": 1,
"file": "path",
"line": 1,
"claim": "texto simples",
"fix": "texto simples"
}
],
"notes": []
}
