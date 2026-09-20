# TASK-0047 — RED de sessão e pauta CTG-0002

Papel Art. 6: Inspector, Terra/high, máximo 2 iterações. Leia AGENTS,
CODESTYLE, manual Inspector, CTG-0002 §§5/6/8/10, contrato técnico, ADR-0027,
ownership, blueprint/DDL36, runtime/controller atuais, policy, deadline engine,
interceptor e configuração real de testes.

Congele sensores executáveis novos para `open` endurecido e os seis comandos
`close-agenda`, `adjourn`, `convene-extraordinary`, `agenda read/view/withdraw`.
Prove serviço produtivo, banco e HTTP, não só harness:

- contexto/ator/papel/vínculo/tenant e payload proibido;
- If-Match/version do agregado pai, idempotência/replay, locks e rollback;
- banca confirmada, presidente/suplente, mandato/status/presença, quorum e
  paridade CETRAN derivada da representação, revalidados por item;
- T-CONV e vista pelo Clock/deadline/parameter transacionais;
- pauta exige parecer, prioridades críticas, sem duplicata; transições de caso
  usam porta same-transaction e nunca SQL cross-domain no session service;
- outbox/auditoria única e nenhum efeito de sucesso nas negativas;
- sete rotas/decorators nominais, ausência de CRUD de escrita e oral argument;
- policy nominal com positivos e negativos, inclusive technical-admin.

Crie apenas arquivos novos sob session tests unit/integration, shared policy
`policy-ctg2-session-agenda.spec.ts`, app E2E
`rait-session-agenda-production.e2e.spec.ts`, app audit spec próprio e atualize
`tasks/TASK-0047.json`. Não edite produção, sensor existente, blueprint/DDL,
banco/seed, package/lock, record ou irmãos. Integração usa DB dedicado, URLs
explícitas, role_app_backend e rollback; não resetar. RED funcional esperado;
zero testes/URL errada/fallback/owner request-path é BLOCKED. Valide hashes,
typechecks, Prettier e diff-check.
