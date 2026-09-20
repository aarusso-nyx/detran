# TASK-0050 — implementar deliberação e ata CTG-0002

Papel Art. 6: Engineer, Terra/high, máximo 2 iterações. Leia integralmente
`AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/engineer-backend.md`, CTG-0002
§§5/8/10, contrato técnico, ADR-0027, TASK-0049, blueprints vigentes, DDL36,
implementação da TASK-0048 e os sete sensores congelados da TASK-0049.

Implemente os cinco comandos produtivos restantes de sessão — `vote`,
`proclaim`, `create-minutes`, `sign-minutes`, `publish` endurecido — sem tocar
sensores, blueprints, DDL ou gerados.

Requisitos vinculantes:

- document trust expõe capability e operações próprias `SESSION_MINUTES` para
  preparar/obter manifesto e verificar evidência individual; falha fechada,
  `/health` separado de `/verify`, PAdES-B-LT, TSA e OCSP/CRL, sem alegar
  criptografia real dos fakes;
- presidente + relatores dos itens são os signatários obrigatórios derivados no
  servidor; ausência formal só vale quando congelada no snapshot server-owned;
  secretaria prepara/publica, mas não assina apenas por ser secretaria;
- `vote` valida composição, presença, impedimento, unicidade, voto de desempate
  apenas para empate real e presidente, e registra efeito/evento/outbox/audit na
  mesma transação;
- `proclaim` e `publish` usam a porta pública same-transaction do caso, sem SQL
  cross-domain nem transação aninhada;
- criação, assinatura e publicação da ata usam snapshot/manifest/signatários/
  recibos imutáveis, locks, versão, idempotência e trust verificado;
- contexto autenticado fornece tenant/ator; payload não pode fornecer ator,
  tenant, resultado, documento ou conjunto de signatários;
- política nominal estrita; technical-admin negado; interceptor impede
  auditoria HTTP duplicada para os cinco handlers;
- preserve o erro canônico `RAIT.CASTING_VOTE_NOT_TIED`; não introduza barra
  literal para satisfazer o regex defeituoso já registrado no sensor.

Allowlist fechada:

- `backend/domains/shared/src/documents/document-trust.ts`;
- `backend/domains/shared/src/documents/document-trust.http-adapter.ts`;
- `backend/domains/shared/src/documents/index.ts`;
- `backend/domains/shared/src/index.ts`;
- `backend/domains/inf/rait-case/src/handwritten/rait-case-transition.port.ts`;
- `backend/domains/inf/rait-session/src/handwritten/**`;
- `backend/domains/shared/src/policy.ts`;
- `backend/app/src/rait-transactional-audit.interceptor.ts`;
- `work/rounds/R-0007/tasks/TASK-0050.json`.

Proibido alterar testes, blueprint/DDL/gerados, package/lock, banco/seed,
`record/**`, corpus de produto ou repositórios irmãos. Preserve byte a byte os
hashes congelados em TASK-0047 e TASK-0049.

Gates obrigatórios:

- trust SESSION_MINUTES, porta do caso, unit session, policy e audit da
  TASK-0049 devem ficar verdes, exceto o regex defeituoso explicitamente
  isolado e o reexport/hook gerado reservado à TASK-0008;
- integração TASK-0049 com URLs explícitas do banco dedicado,
  `DETRAN_TEST_DATABASE_URL` e `role_app_backend`, sem reset/full/seed;
- regressões do trust e session existentes;
- typechecks shared/case/session/app, `pnpm verify:decorators`, Prettier e
  `git diff --check`;
- E2E pode permanecer RED somente por hooks/wiring gerados da TASK-0008.

Registre em TASK-0050.json os comandos, contagens e REDs residuais exatos. Não
declare CTG-0002 GREEN e não amplie a autoridade se um sensor exigir mudança
fora do allowlist.
