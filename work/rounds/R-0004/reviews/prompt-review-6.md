# Prompt do reviewer — modo `prompt-review` — iteração 6 autorizada

> Você é o reviewer da orquestra `param-store` (rodada `R-0004`), **Fable 5.1** da família
> oposta ao maestro. Você não escreve código nem prompts: julga em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/param-store`. Papel constitucional: **Auditor**
> (soft gate, Constituição DEVAI Art. 18). Responda somente com o objeto JSON do §Saída, sem
> cercas Markdown nem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4, §5, §6 e §7
2. `docs/meta/agents/orchestra/model-ladder.md`
3. `docs/meta/agents/README.md` §Regras comuns
4. `docs/framework/arch/rait-build-pack.md` somente WP-A e mapa entregável → definições
5. `docs/meta/adr/ADR-0021-shared-parameter-store.md`
6. `work/rounds/R-0004/reviews/prompt-review-5.json`
7. `work/rounds/R-0004/reviews/preflight-after-review-5.md`
8. `work/rounds/R-0004/plan.md`
9. Todos os seis prompts e task JSON listados em Material anexado
10. `work/rounds/R-0004/compositions.json`
11. Para conferir executabilidade: `tools/blueprints/generate.mjs` somente o manifesto gerado;
    `tools/contracts/generate-openapi.mjs` somente seleção de nomes/órfãos;
    `backend/app/{package.json,tsconfig.build.json,vitest.config.ts}` somente dependências,
    `rootDir` e aliases; `package.json` somente scripts; `.github/workflows/ci.yml` somente jobs
    que executam `check` e `backend:test:ci`

## Autorização e delta desta iteração

O Owner autorizou uma emenda única com os dois highs e cinco lows de `prompt-review-5`, seguida
desta revisão com Fable 5.1. O Owner também dispensou o token budget como condição de parada
somente para esta chamada. Verifique o resultado; não presuma que as correções estão certas:

1. TASK-0002 e TASK-0003 agora fixam o mapeamento fechado de prefixos para surfaces e falham para
   prefixos desconhecidos.
2. TASK-0004 contrata, TASK-0005 testa e TASK-0006 gera
   `backend/app/src/generated/parameter-flags.ts`; o app o importa relativamente como
   `./generated/parameter-flags.js`.
3. O contrato manual mudou para `docs/framework/arch/ops-parameter-command-contract.md`, fora do
   diretório integralmente gerado.
4. TASK-0006 inclui `@detran/ops-parameter` no script raiz `build`, imediatamente antes do app.
5. Os aliases pending BOAT/DASHBOARD foram explicitamente adiados; nesta rodada o comportamento
   público obrigatório é RAIT.
6. O alias legado `DETRAN_FEATURE_SPEED_METERS` permanece para `teat.speed_meters`.
7. O teste do app chama somente `detranFeatureFlagSet()`; a associação aos gerados é provada nos
   testes black-box das ferramentas.
8. Os acceptance commands de TASK-0001 e TASK-0006 foram alinhados aos respectivos prompts; seis
   hashes/composition IDs foram recalculados.
9. O plano registra PR #35 mesclado. Durante o preflight, PR #36 avançou `main`; a worktree foi
   sincronizada por fast-forward para `d8fe83a96b0301d27015de5958507cdad4a06d75` e `pnpm check`
   passou novamente, incluindo `verify:orchestra-bridge`.

Nenhuma outra decisão de produto, fronteira de worker ou liberação de execução foi autorizada.

## Rubrica

1. Papel constitucional declarado e compatível com os caminhos tocados.
2. Leitura fechada e suficiente; nenhum convite a explorar o repositório inteiro.
3. Fronteiras de escrita e locks corretos; workers sem git.
4. Acceptance commands existentes ou verificáveis e resultado esperado explícito.
5. Nenhum valor inventado; lacunas viram `source_pending`/OD/bloqueio.
6. Tríades Architect → Inspector → Engineer e testes antes da implementação.
7. Vocabulário canônico e decisões do steering respeitados.
8. Fronteira SENATRAN, gerados e gates preservados.
9. Prompts autocontidos, parcimoniosos e modelos/esforços coerentes.
10. Plano completo para ADR-0021 dentro do escopo, com adiamentos justificados.
11. As sete correções de `prompt-review-5` são executáveis em conjunto e não criam nova lacuna de
    path, import, build, teste, contrato ou ownership.

Para cada achado cite arquivo e linha. `PASS`: nenhum high. `REVIEW`: high corrigível sem mudar a
decisão canônica. `FAIL`: contradição de ADR/Owner/Constituição ou fronteira de escrita. Qualquer
high volta ao Owner; somente `PASS` libera workers.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0004",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0004/prompts/TASK-0002.md",
      "line": 1,
      "claim": "descrição verificável",
      "fix": "correção concreta"
    }
  ],
  "notes": []
}
```

## Material anexado

- `TASK-0001`: `work/rounds/R-0004/prompts/TASK-0001.md`, sha256
  `74993deec3f154a5e122f06d95bfbb677b57cdb2886b731d1d38a16ccd853e60`
- `TASK-0002`: `work/rounds/R-0004/prompts/TASK-0002.md`, sha256
  `32804e4eff876998b6f07c827da290d32e257e2037d28994228fa74fcf5f650f`
- `TASK-0003`: `work/rounds/R-0004/prompts/TASK-0003.md`, sha256
  `3e96e2e0f0379d9ea8a5ff55f679375c3d16a14f52769c12a9660a6668e480ba`
- `TASK-0004`: `work/rounds/R-0004/prompts/TASK-0004.md`, sha256
  `934f15d073ee507ac8c9b614405e7909df0f6d5c1a21d3c121d30f8f6ddc809b`
- `TASK-0005`: `work/rounds/R-0004/prompts/TASK-0005.md`, sha256
  `f75d3fc93b8d27656b60ccdee4682749a7080ad941fb06347b027466a3da9e0d`
- `TASK-0006`: `work/rounds/R-0004/prompts/TASK-0006.md`, sha256
  `379f22a59548f627f8dea1ae088a5cb0dfb1912f0dec3a0924d4aacdfdf203e0`
- Tasks: `work/rounds/R-0004/tasks/TASK-0001.json` … `TASK-0006.json`
- Compositions: `work/rounds/R-0004/compositions.json`
