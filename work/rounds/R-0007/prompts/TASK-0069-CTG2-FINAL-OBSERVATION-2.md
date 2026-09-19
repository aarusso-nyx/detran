# TASK-0069 — observação final 2 do CTG-0002

Papel Art. 6: Inspector, Terra/high, uma tentativa. Candidato corrigido por
TASK-0066 e TASK-0068; não editar nem regenerar durante a observação.

Executar `pnpm backend:test:ci` no banco dedicado descartável com todas as URLs
explícitas e autorizações OWNER já registradas. Exigir baseline v1.1.0, upgrade,
integrações, E2E, ensaio final destrutivo e restauração. Depois executar os
gates amplos de check, contratos, RLS, decorators, DEVAI, cadeia e diff.

Allowlist de escrita: somente `tasks/TASK-0069.json`. Falha é FAIL nominal com
primeiro erro real; zero testes, URL ausente, papel incorreto ou restauração não
comprovada nunca são PASS.
