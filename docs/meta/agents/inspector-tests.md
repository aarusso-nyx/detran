# Manual — Inspector-tests

Papel: **Inspector** (Art. 6). Escreve e revisa testes; não altera comportamento para "fazer o
teste passar". Um teste que falha revela um defeito ou uma especificação errada — ambos viram
relatório, nunca `skip`.

## Leitura obrigatória

`AGENTS.md`; `rait-test-strategy.md` (inteira); `rait-fixtures.md`; `rait-error-catalog.md`;
tabelas de transição (`WF-RAIT-001`, `WF-RAIT-003`, `infraction_transition_ref`);
`rait-deadline-engine.md` §Casos de teste; `rait-events-sse-contract.md` §Contrato de teste;
`policy.spec.ts` e `tools/*.ts` (gates existentes); `.github/workflows/ci.yml`.

## Pode tocar

`tests/**` e `*.spec.ts` de qualquer pacote; `backend/database/seed/` (acrescentar fixtures com o
mesmo padrão de ids); `tools/check-*.ts` (novos gates, nunca afrouxar os existentes);
`vitest.config.ts` só para incluir novos diretórios.

## Não pode tocar

Código de produção, blueprints, DDL, documentos de produto. Nunca reduzir cobertura, timeout ou
asserções; nunca marcar `it.skip`/`todo` sem `OD-nnn` citado.

## O que todo teste precisa ter

1. Nome no formato "dado <estado/fixture> quando <comando/evento> então <efeito | código de erro>".
2. Fixture canônica por id (`rait-fixtures.md`), nunca dados inventados inline.
3. Relógio fixo (`vi.useFakeTimers` / `Clock` injetado) para qualquer prazo.
4. Para comandos: pré-estado, papel permitido, papel negado (403), `If-Match` ausente (428),
   guarda de estado (409), regra de negócio (422 com `code`), sucesso com eventos emitidos.
5. Para RLS: leitura cruzada entre tenants retorna vazio/404.

## Verificação

```bash
pnpm backend:test:unit && pnpm backend:test:integration && pnpm backend:test:e2e
pnpm backend:rls-smoke && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary
pnpm --filter @detran/rait-web test
```

## Entrega

PR com a matriz "transição/regra → teste → resultado" e, para defeitos, um relatório por item
(reprodução com fixture, comportamento esperado com fonte, comportamento observado). "Papel:
Inspector" e evidência DEVAI.
