# TASK-0066 — compatibilidade da FK composta no upgrade CTG-0002

Papel Art. 6: Architect, Sol/medium, uma tentativa. Corrigir somente a falha
reproduzida pelo baseline histórico: DDL36 cria a FK de attendance para
`inf.rait_pool_member(tenant_id,id)`, mas o DDL35 v1.1.0 congelado ainda não
possui a unicidade composta exigida pelo PostgreSQL.

Adicionar ao contrato declarativo da FK diferida uma pré-condição explícita de
índice único referenciado e ensinar o gerador a emiti-la imediatamente antes
da FK. O nome deve coincidir com o índice/constraint já produzido pelo DDL35
atual, de modo que instalação nova seja idempotente e upgrade legado crie só o
objeto ausente. Preservar a FK tenant-first. Não editar fixture histórico nem
DDL/gerados à mão.

Allowlist: `docs/framework/blueprints/BP-INF-RAIT-SESSION-001.json`,
`tools/blueprints/generate.mjs`, saídas oficiais regeneradas do blueprint de
session e inventário de gerados, este prompt e `tasks/TASK-0066.json`.
Proibido runtime, sensores, seeds, fixtures históricas, outros blueprints e
mudanças de produto.

Aceite: duas gerações idênticas; no DDL36 o índice
`ux_inf_rait_pool_member_tenant_id` antecede
`fk_inf_rait_attendance_member_tenant`; `blueprints:check`, `contracts:check`,
`verify:rls-ddl`, typecheck session e `git diff --check` verdes. O ensaio oficial
destrutivo pertence à TASK-0067 Inspector.
