# TASK-0049 — RED de deliberação e ata CTG-0002

Papel Art. 6: Inspector, Terra/high, máximo 2 iterações. Leia AGENTS,
CODESTYLE, manual Inspector, CTG-0002 §§5/6/8/10, contrato técnico, ADR-0027,
TASK-0047, blueprint/DDL36, trust compartilhado, porta de caso, runtime,
controller, policy, interceptor e configuração de testes.

Congele sensores novos para `POST /votes`, `agenda proclaim`, `POST /minutes`,
`minutes sign` e hardening de `minutes publish`:

- voto nominal imutável, ator presente/não impedido, um voto por membro,
  quorum/paridade por item e casting vote CETRAN apenas em empate/presidente;
- proclamação calcula maioria/resultado, porta same-transaction muda caso para
  `JULGADO_SESSAO`, sem SQL cross-domain e com rollback integral;
- ata deriva snapshot canônico dos registros vivos, não payload livre;
- trust `SESSION_MINUTES` tem capability, prepare/get e verificação por
  signatário; presidente + relatores dos itens, com ausência/dispensa formal;
- recibos múltiplos sobre os mesmos hashes, `ATA_ASSINADA` somente após cobrir
  conjunto requerido; votos/snapshot/manifesto/signatários/recibos imutáveis;
- publish exige ata confiável, muda casos para `COMUNICADO` pela porta mesma
  transação, emite evento por item e arma T-R2 pelo deadline engine;
- If-Match, idempotência/replay, tenant/vínculo/role, outbox/auditoria única e
  negativas sem efeitos;
- cinco rotas/decorators únicos, CRUD conflitante ausente e policy nominal.

Crie apenas arquivos novos: shared trust spec de session minutes; case port
spec; session unit/integration schema+transação; policy spec; app E2E/audit
spec; e atualize `tasks/TASK-0049.json`. Não toque produção, testes existentes,
blueprint/DDL, banco/seed, packages, record ou irmãos. DB dedicado/URLs
explícitas/role_app_backend/rollback, sem reset. Fakes não provam criptografia
real. RED funcional esperado; coleta zero/fallback/owner request-path é
BLOCKED. Valide hashes, typechecks, Prettier e diff-check.
