# TASK-0070 — reconciliar sensor RLS com seis tabelas CTG-0002

Papel Art. 6: Inspector, Terra/high, uma tentativa. Atualizar somente o sensor
`inf-rls.integration.spec.ts`: preservar a cardinalidade fechada e elevá-la de
90 para 96, enumerando nominalmente as duas tabelas novas de worklist e quatro
de session. Todas devem integrar o conjunto protegido que exige RLS, FORCE,
policy tenant única e trigger tenant único. Preservar as 17 tabelas case e dez
referências sem tenant.

Allowlist: esse sensor, este prompt e `tasks/TASK-0070.json`. Proibido runtime,
DDL, blueprint, seed ou expectativa aberta (`>=`). Aceite: teste filtrado coleta
três testes e passa no banco dedicado atual; zero coleta é falha.
