# Prompt-review R-0033 — ciclo 1 (modo `prompt-review`)

> Você é o **reviewer** da orquestra `frontend-preview` (rodada `R-0033`), modelo da família
> **oposta** à do maestro (maestro: Claude Code Fable 5.1; você: Codex Sol 6, nível grande). Você
> não escreve código nem prompts: você julga. Papel constitucional: **Auditor** (soft gate,
> Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/frontend-preview-5281e3`. Responda **apenas**
> com o JSON do §Saída, sem prosa antes ou depois.

Esta é a **única** prompt-review da rodada (OD-C2-005): ela cobre o plano e os prompts de **todos**
os CTGs. Primeiro ciclo **exaustivo**: liste todos os achados `high` corrigíveis de uma vez, com
arquivo e linha. Distinga `high` corrigível pelo maestro (→ `REVIEW`) de contradição canônica
(→ `FAIL`).

## Autoridade (não reabra)

- Owner autorizou a rodada em 2026-10-15 (`work/rounds/R-0033/AUTHORIZATION.md`: texto literal
  "R-0003 authorized. proceed ith ir work while wait for ci", lido como R-0033). Decisões do Owner
  OD-C3-001…006 (2026-10-14, `docs/meta/knowledge-base/open-decisions-rait.md` §C-0003):
  superfície `rait-web` e jornada JW-01; canal URL local + `dist/preview/`; k6/mutation não
  executados; PR #179 (STYNX 1.5.3) decidido fora desta rodada — o pin não muda.
- Desvios registrados no bootstrap (`AUTHORIZATION.md` §Desvios): maestro Claude (não Sol 6),
  reviewer Codex (você), workers Claude (`claude-opus-5-5`/`claude-sonnet-5`); worktree empilhada
  sobre `claude/detran-r22-handoff-03f872` (PR #182); sem push nem PR nesta janela.
- OD-C2-005: branch única, um commit por tarefa, ondas O1…O4 com até 3 workers, um prompt-review no
  bootstrap, `acceptance_commands` por tarefa como definição de pronto, CI local completo + uma
  delivery-review + um PR no fim.
- Decisões do maestro M1…M5 (`plan.md` §Leitura) e M6 (tabela "Layout fixo" dos prompts): i18n por
  sobreposição (nenhum namespace novo; `app.scaffold.spec.ts` C-2A-60 fixa 14), fronteira de
  fixtures em `data/api` por `useClass`, `typecheck` vermelho entre TASK-0002 e TASK-0003 esperado
  (método §4.13), gate de marca `DETRAN_PREVIEW_MARK`, `verify:round-tasks` não cobre R > 20.

## Leitura (fechada)

1. `docs/meta/agents/orchestra/README.md` §2, §4, §5; `docs/meta/agents/README.md`;
   `docs/meta/agents/orchestra/model-ladder.md`; `AGENTS.md`.
2. `work/campaigns/C-0003-produto-primeiro.md` §2, §3, §4 (linha R-0033), §6 (locks R-0033), §7,
   §10.
3. `work/rounds/R-0033/plan.md` inteiro, `AUTHORIZATION.md`, `budget.json`, `compositions.json`,
   `tasks/*.json` (8) e **todos** os `prompts/TASK-000n.md` (8). `prompts/00-maestro.md` é o prompt
   do maestro, não de worker.
4. Para verificar comandos: `package.json` raiz (`scripts`), `apps/rait/web/package.json`,
   `apps/portal/web/package.json`, `tools/devai/verify-round-tasks.mjs`. Para caminhos: existência
   dos arquivos citados nas listas de leitura (`apps/rait/web/src/**`, `apps/teat/web/src/**`,
   `docs/framework/arch/**`, `work/rounds/R-0025/**`). Os artefatos **produzidos** pelas tarefas
   (`frontend-preview-mode.md`, `inventory-rait-web.md`, `src/app/preview/**`, `preview/rait-web/**`)
   ainda não existem; avalie se a dependência está declarada (`upstream_task_id`, ondas).
5. Invariantes que os prompts não podem violar: `apps/rait/web/src/app/app.scaffold.spec.ts`
   (C-2A-58/59/60), `apps/rait/web/src/app/i18n/i18n.spec.ts` (contagens), `apps/rait/web/src/app/features/static-gates.spec.ts`,
   `apps/rait/web/eslint.config.js` e `eslint/local-rules.js`.

## Rubrica (cite arquivo e linha)

| #   | Item                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 7, 10); Inspector só specs/roteiro/scripts, Engineer não edita specs nem `core/data/features/shared`                                                                                            |
| 2   | Leitura obrigatória fechada e suficiente; o worker executa sem procurar fora da lista; arquivos citados existem (ou a tarefa que os produz está a montante)                                                                                                                  |
| 3   | Fronteiras de escrita disjuntas entre tarefas da mesma onda (O2: TASK-0002 ∥ TASK-0005; O4: TASK-0007 ∥ TASK-0008); `target_modules` coerentes; nada de `git`/instalação para workers                                                                                        |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado explícito; `acceptance_commands` dos `tasks/*.json` batem com os prompts                                                                                             |
| 5   | Nenhum valor inventado: textos, códigos de erro, ids, papéis vêm de fonte canônica ou viram `source_pending`/`OD-*`; nenhum dado real; a prévia nunca chama `/v1`                                                                                                            |
| 6   | Tríade respeitada (TASK-0001 Architect → TASK-0002 Inspector → TASK-0003 Engineer; TASK-0005 Inspector → TASK-0006 Engineer) e testes antes da implementação                                                                                                                 |
| 7   | Contrato do modo prévia do `plan.md` respeitado sem relaxamento: production sem módulo de prévia, rede bloqueada, marca visível, ação não funcional nunca sucesso, guardas ativas, fixtures canônicas                                                                        |
| 8   | Invariantes existentes preservadas: 14 namespaces i18n, contagens de `i18n.spec.ts`, `check` do `package.json` raiz intacto, nenhum spec existente editado, `rait/no-client-deadline-math`                                                                                   |
| 9   | Decisões do Owner e ADRs respeitadas, não reabertas (OD-C3-002…006, OD-C2-005, ADR-0003, ADR-0007, ADR-0033 como precedente)                                                                                                                                                 |
| 10  | Parcimônia: nenhum prompt manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                                                                                                                                                                   |
| 11  | `tasks/*.json` coerentes com os prompts e com `compositions.json` (PC = `PC-` + 16 hex do sha256 do prompt; `upstream_task_id`; ondas do `plan.md`)                                                                                                                          |
| 12  | Realizabilidade técnica do layout fixo com Angular 22 / STYNX 1.4.0 tal como citado nos prompts (ex.: `outputPath` em objeto, `tsconfig.app.json` `files`, `useClass` sobre clientes `@Injectable`, sobreposição de catálogo) — aponte o que exigiria mudança fora dos locks |

## Veredito

- **PASS**: nenhum achado `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um `high` corrigível pelo maestro sem mudar decisão do Owner.
- **FAIL**: o plano ou um prompt contradiz definição canônica, decisão do Owner, ADR ou a
  Constituição; ou a fronteira de escrita é violada.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0033",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0033/prompts/TASK-0002.md",
      "line": 31,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
