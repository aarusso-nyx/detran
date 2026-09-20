# TASK-0048 — implementar sessão e pauta CTG-0002

Papel Art. 6: Engineer, Terra/high, máximo 2 iterações. Leia AGENTS,
CODESTYLE, manual Engineer, CTG-0002 §§5/8/10, contrato técnico, ADR-0027,
TASK-0047, blueprints 1.4/1.2, DDL35/36 e sensores congelados.

Implemente `open` endurecido e `close-agenda`, `adjourn`,
`convene-extraordinary`, `agenda read/view/withdraw`:

- porta pública `RaitCaseTransitionPort` same-transaction, operações fechadas,
  lock/version/event/outbox de caso, sem abrir transação e sem SQL de caso no
  serviço session;
- serviço/controller produtivos com sete handlers/decorators, contexto/vínculo,
  If-Match real, idempotência, locks, estado, banca/composição/paridade/mandato/
  presença/impedimento por item;
- deadline/Clock/parameter oficiais para T-CONV e vista, sem constante/fallback;
- transições de caso e efeitos session/agenda/outbox/audit numa transação;
- policy nominal estrita e technical-admin negado;
- interceptor reconhece os sete handlers para impedir auditoria duplicada.

Allowlist:

- `backend/domains/inf/rait-case/src/handwritten/rait-case-transition.port.ts`;
- `backend/domains/inf/rait-case/src/handwritten/index.ts`;
- `backend/domains/inf/rait-session/src/handwritten/**`;
- `backend/domains/shared/src/policy.ts`;
- `backend/app/src/rait-transactional-audit.interceptor.ts`;
- `tasks/TASK-0048.json`.

Proibido testes, blueprint/DDL/gerados, package/lock, banco/seed, record,
corpus ou irmãos. Preserve hashes TASK-0047/0049. Gates: sensores unit/policy/
porta/integration/audit da TASK-0047; regressão session existente; integração
com URLs explícitas/role_app_backend; typechecks case/session/shared/app;
decorators, Prettier e diff-check. E2E pode ficar RED somente por hooks de
TASK-0008; qualquer outro RED deve ser corrigido. Não declare CTG-0002 GREEN.
