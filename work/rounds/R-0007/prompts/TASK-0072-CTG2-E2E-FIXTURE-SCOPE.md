# TASK-0072 — isolar precondição das fixtures E2E worklist

Papel Art. 6: Inspector, Terra/high, uma tentativa. Nos dois E2E worklist,
preservar a expectativa exata de 20 casos, mas contar somente as IDs canônicas
do fixture legado pelo prefixo fechado `...0000100000%`. Casos criados por
outros E2E do mesmo processo não invalidam a precondição.

Allowlist: `rait-worklist-corrective.e2e.spec.ts`,
`rait-worklist-production.e2e.spec.ts`, este prompt e `tasks/TASK-0072.json`.
Proibido runtime, DDL, seed ou relaxar a contagem. Aceite: app E2E completo com
coleta positiva e ambos os worklist executados, não skipped por setup.
