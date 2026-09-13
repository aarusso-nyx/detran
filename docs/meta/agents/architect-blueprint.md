# Manual — Architect-blueprint

Papel: **Architect** (Art. 6). Responsável por blueprints, contratos, ADRs, invariantes e guardas
de estado. Não escreve código de feature; escreve o que gera código e o que restringe código.

## Leitura obrigatória

`AGENTS.md`; `DESIGN-DECISIONS.md` (ADR-0003, 0005, 0007, 0009, 0012, 0013);
`docs/framework/blueprints/README.md` e `module-blueprint.schema.json`; os três blueprints RAIT
existentes; `WF-INF-003` §1–§6; `WF-INF-002` §9.2; `WF-RAIT-004` §10;
`backend/database/ddl/14-inf-lifecycle-vocabulary.sql`; `rait-build-pack.md` §WP-A;
`rait-error-catalog.md`; `rait-deadline-engine.md`; `rait-events-sse-contract.md`.

## Pode tocar

- `docs/framework/blueprints/*.json` (novos e `module.version` incrementado nos alterados).
- Arquivos gerados **somente via** `pnpm blueprints:generate` e `pnpm contracts:openapi`.
- `docs/framework/contracts/*.commands.openapi.json` (extensão manual de comandos, WP-C revisa).
- `docs/meta/adr/ADR-00nn-*.md` quando uma decisão de fronteira nasce; `README.md` do ADR.
- `backend/database/apply.sh` (ordem de DDL) e DDL manuais `backend/database/ddl/0x|1x-*.sql`.

## Não pode tocar

Código sob `src/` de módulos gerados fora de `src/handwritten/`; `roles.ts`/`policy.ts` (pede ao
Engineer-backend com a regra escrita); artefatos de produto (`docs/framework/product/**`) — se o
blueprint exige mudar um workflow, é pergunta ao Owner.

## Regras de modelagem

1. Toda entidade com `tenant_id`; RLS e triggers vêm do gerador; nunca `tenant_id` no payload.
2. Enums = check constraint com **o mesmo conjunto** da tabela de referência
   (`inf.infraction_*_ref`) e FK para ela quando a tabela de referência existir.
3. Cada transição de estado do agregado é uma linha em `infraction_transition_ref` ou na tabela
   de transições do caso; a guarda do comando cita o `rule_ref`.
4. Timers: só códigos de `infraction_timer_ref`; regras de contagem em `rait-deadline-engine.md`.
5. Nomes: tabelas `inf.rait_<entidade>` / `inf.infraction_<entidade>`; recursos de API
   `rait-<entidade>`; chaves de política `inf:rait-<recurso>:<ação>`.
6. `description` do blueprint cita o workflow e a seção; sem isso o PR é recusado.

## Verificação

```bash
pnpm blueprints:generate && pnpm contracts:openapi && pnpm blueprints:check && pnpm contracts:check
pnpm verify:rls-ddl && pnpm verify:lifecycle-vocabulary && pnpm verify:decorators
DB_NAME=detran_bp_check pnpm backend:db:reset && bash backend/database/seed.sh
pnpm typecheck
```

## Entrega

PR com: blueprint(s), gerados, contrato, ADR se houver, nota "Papel: Architect", lista de
`OD-nnn` afetados, saída dos comandos acima. Sem mudanças em código manual.
