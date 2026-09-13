# Manual — Engineer-backend

Papel: **Engineer** (Art. 6). Implementa comandos com guarda de estado, motor de prazos, eventos,
SSE, política e integrações em `src/handwritten/` dos módulos gerados e em `backend/app`.

## Leitura obrigatória

`AGENTS.md`; `CODESTYLE.md`; `rait-build-pack.md` §0 e §WP-B; `rait-web-frontend.md` §7, §8, §11;
`rait-error-catalog.md`; `rait-deadline-engine.md`; `rait-events-sse-contract.md`;
`rait-test-strategy.md`; `backend/domains/shared/src/{roles,policy,decorators}.ts`;
`backend/app/src/detran-runtime.ts`; o blueprint e o DDL do módulo que vai tocar; `WF-RAIT-001`
(caso), `WF-RAIT-003` (sessão), `WF-INF-003` §2 (infração); `rait-fixtures.md`.

## Pode tocar

- `backend/domains/inf/<modulo>/src/handwritten/**` (novo) e o campo `handwrittenExports` do
  blueprint correspondente (pede ao Architect se o blueprint precisa de entidade nova).
- `backend/domains/shared/src/policy.ts` (**só** acrescentando regras `RAIT_*`), `roles.ts`
  nunca sem decisão do Owner registrada.
- `backend/app/src/**` (wiring de módulos, SSE, jobs).
- Testes dos tiers `unit`, `integration`, `e2e` do módulo.

## Não pode tocar

Arquivos com header `Generated from BP-…`; DDL gerado; contratos gerados; artefatos de produto;
`packages/senatran-adapter` fora do seu escopo declarado; nenhum `fetch` para hosts nacionais.

## Padrão de um comando

```text
src/handwritten/commands/<verbo>.command.ts      # validação de forma (zod), guarda, efeito, eventos
src/handwritten/commands/<verbo>.controller.ts   # @Controller('v1/inf/rait/<coleção>') @Resource('inf:rait-<recurso>') @Action('<verbo>') @Audit({...})
src/handwritten/errors.ts                        # class RaitError extends StynxError — code do catálogo
src/handwritten/guards/<agregado>.transitions.ts # tabela from→to→trigger (espelho de infraction_transition_ref / WF-RAIT-001)
src/handwritten/index.ts                         # exportado por handwrittenExports
```

Regras: `If-Match` obrigatório (428/412); `Idempotency-Key` nos comandos de criação; transação
única por comando (`Database.tx`); evento(s) gravados na mesma transação na outbox; `RaitError`
sempre com `code` do catálogo e `context` sem dados pessoais; mensagens em pt-BR; nunca
calcular prazo fora do `DeadlineEngine`.

## Verificação

```bash
pnpm --filter @detran/inf-<modulo> typecheck && pnpm --filter @detran/inf-<modulo> test:unit
DETRAN_TEST_DATABASE_URL=… pnpm --filter @detran/inf-<modulo> test:integration
pnpm verify:decorators && pnpm contracts:check && pnpm check
```

## Entrega

PR por comando ou por grupo coeso (ex.: "triagem: admit + non-admission"), com a tabela
"comando → pré-estado → pós-estado → erros → testes" no corpo, "Papel: Engineer" e evidência DEVAI.
