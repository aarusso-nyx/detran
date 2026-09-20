# Prompt do reviewer — `prompt-review` corretivo CTG-0001, tentativa 2

> Você é o **reviewer** da orquestra `rait-backend` (R-0007), Claude Opus da família oposta ao
> maestro. Papel constitucional: Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente
> em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Responda apenas
> com um objeto JSON válido, sem markdown ou prosa antes/depois.

## Natureza do ciclo

O Owner autorizou um novo ciclo corretivo e reiniciou limites de tentativa, retry e escalada após a
revisão substantiva do maestro rejeitar o runtime parcial de TASK-0003. Não reavalie a campanha
inteira. Avalie somente a correção de CTG-0001: plano, contrato, budget, composições, TASK-0002,
TASK-0003 e a compatibilidade de TASK-0004 com os hooks corrigidos.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4, §5 e §8
2. `docs/meta/agents/orchestra/reviewer-prompt.template.md`
3. `AGENTS.md`
4. `work/rounds/R-0007/plan.md`
5. `work/rounds/R-0007/contracts/CTG-0001.md`
6. `work/rounds/R-0007/budget.json`
7. `work/rounds/R-0007/compositions.json`
8. `work/rounds/R-0007/tasks/TASK-0002.json`, `TASK-0003.json`, `TASK-0004.json`
9. `work/rounds/R-0007/prompts/TASK-0002.md`, `TASK-0003.md`, `TASK-0004.md`
10. `work/rounds/R-0007/reports/TASK-0002.md`, `TASK-0003.md`
11. runtime/testes parciais em `backend/domains/inf/rait-case/src/handwritten/**` e
    `backend/domains/inf/rait-case/tests/**`
12. `backend/database/ddl/04-integration-storage.sql`, `12-audit-functions.sql`,
    `34-inf-rait-case.sql`, `35-inf-rait-worklist.sql`
13. `backend/domains/inf/rait-case/package.json`, repositório gerado do case,
    `backend/domains/shared/src/tenant-context.ts`, parameter handwritten e API pública de
    `backend/domains/inf/deadlines/src/**`

## Perguntas obrigatórias

- TASK-0002 agora exige testes comportamentais suficientemente discriminantes para cada guarda e
  efeito de CTG-0001, sem hardcode de fixture nem inspeção de substring como substituto?
- TASK-0003 consegue implementar com DI Nest concreta, contexto autenticado, RLS, DDL exato,
  idempotência/outbox/auditoria atômicas e `claim-next` por pool/ordem/WIP?
- PREP-CTG1-DEPS fecha legitimamente a dependência de `@detran/inf-deadlines`, e o
  `RaitDeadlineEngineFactory` contratado pode adaptar o motor sem cálculo local ou novo moduleImport?
- Fronteiras de escrita são fechadas e compatíveis, especialmente testes imutáveis, gerados,
  manifesto/lockfile e hooks exclusivos de TASK-0004?
- Hashes/PC IDs/modelos/esforços e totais/janelas do budget conferem?
- A decomposição evita repetir a causa da falha anterior e é executável sem decisão de produto nova?

Use os 13 itens do template de reviewer. `PASS` exige nenhum achado high. `REVIEW` significa high
corrigível sem nova decisão Owner. `FAIL` significa contradição canônica/Owner/ADR/Constituição ou
fronteira irrecuperável.

Responda exatamente neste formato JSON:

```json
{
  "mode": "prompt-review",
  "round": "R-0007",
  "attempt": 2,
  "cycle": "CTG-0001-C2-1",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [],
  "notes": []
}
```
