# TASK-0013 — iteração 2: testes RED de projeções BOAT

**Papel:** Inspector. **Estado:** pronto para TASK-0014; 5 REDs funcionais
enumerados, 1 PASS de isolamento; E2E pendente de sensor de banco isolado.

## Escopo reescrito

- `backend/app/tests/integration/boat-projections.integration.spec.ts` usa o
  `PortalProjectors` já montado pela aplicação e seus entry points reais
  `rebuild('crash_view')` e `tick`. Não há
  `BoatProjectionsReplayService`, `PortalCrashProjection`,
  `boat-crash.projection.ts` ou `readCitizen`.
- O par canônico usa `schemaVersion: 1`, UUIDs distintos e a mesma tupla
  `(domainEvent, aggregate.id, aggregate.version)`. O par legado sem
  `schemaVersion` exige erro tipado, sem efeito ou ledger. A suíte não faz
  nenhuma afirmação sobre a emissão BOAT de `SINISTRO_REGISTRADO` nem sobre
  `payload.schemaVersion`; esse ramo continua em TASK-0007.
- Dashboard e Espelho são imports relativos de seus providers manuscritos
  futuros, com portas explícitas; nenhuma busca é feita no container Nest para
  esses dois consumidores.
- `backend/app/tests/e2e/boat-projections.e2e.spec.ts` usa somente a rota
  Portal existente. Um fato canônico `source_pending` deve deixar a coleção
  cidadã vazia, sem fabricar CPF/hash ou superfície de leitura nova.
- `backend/database/seed/72-fixtures-boat-projections.sql` contém o par
  canônico sintético, sem dados pessoais.
- `tools/domain-boundaries/tests/verify-domain-boundaries.test.mjs` permanece
  com os três cenários contratuais: SQL cruzado proibido, exceção estrita de
  `*.projection.ts` com `consumedEvents` literal e rejeição da lista ausente.

## Execução e contagem

| Comando | Resultado |
| --- | --- |
| `node_modules/.bin/prettier --check` nos três arquivos TS/MJS | **PASS** |
| `DETRAN_TEST_TIER=integration pnpm --filter @detran/app exec vitest run tests/integration/boat-projections.integration.spec.ts` | **5 RED / 1 PASS** |
| `node --test tools/domain-boundaries/tests/verify-domain-boundaries.test.mjs` | **3 RED**: `tools/domain-boundaries/verify.mjs` ainda não existe |
| `pnpm --filter @detran/app test:e2e -- boat-projections.e2e.spec.ts` | **sensor-error**: banco indicado não contém `portal.brand_profile` e demais DDLs Portal; nenhum cenário próprio chegou a executar |

Os cinco REDs funcionais são: (1) fato canônico ainda não é despachado para
`crash_view`/ledger; (2) `rebuild` e `tick` ainda usam a janela R-0009 e não
reencontram o commit tardio BOAT; (3) o envelope legado é silenciosamente
ignorado, em vez de falhar tipado antes de efeito/ledger; (4) provider
Dashboard ausente; (5) provider Espelho ausente. O PASS é o teste RLS
cross-tenant: evento do tenant B não cria ledger no tenant A.

## Limites

O banco do ambiente de execução está incompleto para E2E e para as relações
das demais suítes; isso é falha de sensor isolado, não mudança de requisito.
TASK-0014 deve implementar os cinco REDs e o gate sem tocar o produtor
TASK-0007. A publicação de P-09 e o ramo positivo de leitura cidadã continuam
`source_pending` até existir vínculo canônico autorizado.
