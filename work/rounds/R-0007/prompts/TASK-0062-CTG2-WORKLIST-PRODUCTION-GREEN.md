# TASK-0062 — implementar seis comandos worklist produtivos

Papel Art. 6: Engineer, Terra/high, máximo 2 iterações. Leia AGENTS,
CODESTYLE, manual Engineer, CTG-0002 §§4/8/9/10, contratos de trust e técnico,
ADR-0027, TASK-0060 final, blueprint 1.3.0/DDL35 e todos os sensores worklist.

Implemente contra os sensores congelados, sem editar teste ou gerado:

1. contrato/adapter documental: capabilities; prepare/get server-owned de
   `BATCH_DISTRIBUTION_MINUTES`; validação estrita de tenant/lote/hashes/kind;
   wrapper RAIT delega prepare/get e verifyBatchMinutesEvidence;
2. harness: remover evento `type:''`; linhas sem evento retornam `events: []`;
   approve valida snapshot/manifesto/recibo e mantém `LOTE_SORTEADO`;
3. serviço produtivo/controller: seis dispatches e rotas/decorators exatos,
   contexto autenticado, vínculo dinâmico, payload, If-Match/version,
   idempotência, locks, ordem canônica, estado, manifestação/recibo, deadlines,
   aceite/impedimento/redistribuição, outbox e auditoria atômicos. Sem SQL de
   caso fora de porta pública e sem constante de prazo;
4. interceptor do app: os handlers worklist com auditoria transacional não
   passam pelo interceptor genérico; preserve tratamento de DetranError;
5. ausência/configuração parcial do provider falha fechada. Fakes provam apenas
   contrato; não declare criptografia real.

Allowlist:

- `backend/domains/shared/src/documents/document-trust.ts`;
- `backend/domains/shared/src/documents/document-trust.http-adapter.ts`;
- `backend/domains/inf/rait-case/src/handwritten/rait-document-trust.verifier.ts`;
- `backend/domains/inf/rait-worklist/src/handwritten/**`;
- `backend/domains/shared/src/policy.ts`, somente se sensor nominal exigir;
- `backend/app/src/rait-transactional-audit.interceptor.ts`;
- `work/rounds/R-0007/tasks/TASK-0062.json`.

Proibido testes, blueprint/DDL/gerados, package/lock, banco/seed, record,
corpus ou irmãos. Não editar derived output manualmente. Preserve hashes
TASK-0058/0060.

Gates focados: shared trust capability/batch/worklist e regressão integral;
case wrapper; worklist unit integral (inclui 51+15+6); integração worklist com
URLs explícitas e rollback; audit spec; typechecks shared/case/worklist/app;
decorators, Prettier e diff-check. O E2E de rotas pode permanecer RED somente
por hooks ainda reservados à TASK-0008; qualquer outro RED deve ser corrigido.
Registre contagens, hashes e limites. Não declare CTG-0002 GREEN.
