Papel: Inspector

Corrigido exclusivamente [tools/stack/contract.test.mjs](/Users/aarusso/.codex/worktrees/local-stack/detran/tools/stack/contract.test.mjs).

Ajustes principais:

- CH usa os três literais reais e envelope Nest top-level `{ statusCode, message, error }`.
- `requestId` gerado compara duas requisições idênticas sem ID; o echo explícito segue validado separadamente.
- Removido o happy path duplicado com `targets` em array.
- Negativos agora exigem `report.complete === false` e uma `report.rows` com `target`, `result` e `reason` específicos.
- Backend indisponível injeta `TypeError('fetch failed')` em `/healthz`; falhas de leitura ocorrem na URL `/v1` do frontend.
- CH cobre 403 e 503 com mensagem incorreta como `blocked_before_adapter`.
- Happy path prova roots 4200–4203, bearer local nos quatro proxies, ausência de leitura `/v1` direta ao backend e nenhuma chamada PEC/4204.

Formato fixado para TASK-0007:

```js
runSmoke({
  targets: { frontends, backend, senatran, sefaz, pec, ch },
  fetchImpl,
})
```

```js
report.rows[] = {
  target, // ex.: "frontend.portal.proxy", "backend.healthz", "ch.pades"
  result, // "passed" | "failed" | "blocked_before_adapter"
  reason,
  status,
  adapterMessage,
}
```

Comandos executados:

- `node --check tools/stack/contract.test.mjs` — verde.
- `pnpm format:check` — inicialmente apontou formatação; após Prettier, verde.
- `pnpm exec prettier --write tools/stack/contract.test.mjs` — formatou somente o arquivo autorizado.
- `pnpm test:stack` — 40 verdes, 8 vermelhos esperados.
- `node --test tools/stack/contract.test.mjs` — 5 vermelhos esperados por produção ausente.

Vermelhos nominais:

- Mock SEFAZ ausente: 2 testes.
- `tools/stack/smoke.mjs` ausente: 3 testes.
- Perfil `fresh-local-stack` ausente: 1 teste.
- Lifecycle/health SEFAZ ausente: 2 testes.

Nenhuma produção, pacote ou outro arquivo foi alterado.