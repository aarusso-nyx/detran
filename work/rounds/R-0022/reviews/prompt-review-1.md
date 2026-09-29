# Prompt-review R-0022 — ciclo 1 (modo `prompt-review`)

> Você é o **reviewer** da orquestra `stynx-sse-tenancy` (rodada `R-0022`), modelo da família
> **oposta** à do maestro (maestro: Claude Code Opus 5.5; você: Codex Sol 6, nível grande). Você não
> escreve código nem prompts: você julga. Papel constitucional: **Auditor** (soft gate, Constituição
> DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Users/aarusso/Development/detran/.claude/worktrees/r-0022-stynx-sse-tenancy-c949d9`. Responda
> **apenas** com o JSON do §Saída, sem prosa antes ou depois.

Esta é a **única** prompt-review da rodada (OD-C2-005): ela cobre o plano e os prompts de **todos**
os CTGs. Primeiro ciclo **exaustivo**: liste todos os achados `high` corrigíveis de uma vez, com
arquivo e linha.

## Autoridade (não reabra)

- Owner autorizou a abertura em 2026-09-29 (`work/rounds/R-0022/AUTHORIZATION.md`), com a **adenda
  A-C2-13** (texto no PR #158 ainda aberto e reproduzido na autorização): STYNX 1.5.0 final publicado;
  R-0021 fechada (PC-0019); pin = maior 1.5.x final no bootstrap (hoje 1.5.0), exato, por
  `tools/stynx-version.json`; R-0020 parada não bloqueia; publicar cedo (push sem PR) as ondas do pin
  e do SSE Angular.
- OD-C2-005 (C-0002 §12) e A-C2-12: branch única, ondas paralelas até 3 workers, um PR no fim, sem
  PR/CI/evidência/delivery-review entre CTGs; os `acceptance_commands` por tarefa são a definição de
  pronto.
- A1 de `plan.md` e spec §8.1: assinatura, outbox (incl. RENACH) e offline-sync migram **inteiras**
  nesta rodada; UPS-SIG-01…04, UPS-OBX-01/02, UPS-OFS-01…04 são MUST; ausência → checkpoint do CTG
  (OD-R22-02), sem contorno. OD-S15-01 fechada.
- A2 de `plan.md` (bootstrap): tarefas novas TASK-0011…0018, TASK-0009 redefinida, ondas O1…O9.

## Leitura (fechada)

1. `docs/meta/agents/orchestra/README.md` §4 e §5; `docs/meta/agents/README.md`;
   `docs/meta/agents/orchestra/model-ladder.md`; `AGENTS.md`; `CODESTYLE.md`.
2. `work/campaigns/C-0002-stynx-upstream-spec.md` §3, §4, §6.11–§6.13, §7, §8.1;
   `work/campaigns/C-0002-consolidacao.md` §11–§13 (e o §14 descrito na autorização).
3. `work/rounds/R-0022/plan.md` inteiro (§Execução OD-C2-005, §Adendas A1/A-C2-11/A2, §Decisões do
   maestro, §Concorrência), `AUTHORIZATION.md`, `budget.json`, `compositions.json`, `tasks/*.json`
   e **todos** os `prompts/TASK-*.md` (18). `prompts/00-maestro.md` é o prompt do maestro, não de
   worker.
4. Entrada real de R-0021: `work/rounds/R-0021/contracts/CTG-0001.md`, `closure.json`.
5. Para verificar comandos: `package.json` raiz e os `package.json` dos pacotes citados; para
   caminhos: os arquivos citados nos prompts (existência). Os contratos `work/rounds/R-0022/contracts/*`
   e os specs novos ainda **não existem** (são entregas das tarefas); prompts que os leem dependem da
   tarefa que os produz — avalie se a dependência está declarada.
6. Símbolos publicados de 1.5.0: `~/.cache/detran-r22/stynx-1.5.0/` (tarballs do registry extraídos,
   `SHA256SUMS`); tabela devolvida pelo STYNX em `~/Development/stynx/work/rounds/R-0002/conformance-1.5.0.md`
   (só leitura).

## Rubrica (cite arquivo e linha)

| #   | Item                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 7, 10); Inspector só testes, Engineer não edita testes (exceções nomeadas C-03/C-05)            |
| 2   | Leitura obrigatória fechada e suficiente; o worker executa sem procurar fora da lista                                                                                        |
| 3   | Fronteiras de escrita disjuntas entre tarefas da mesma onda; `target_modules` e `MOD-app-module` corretos; nada de `git`/instalação para workers                             |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado explícito e coleta efetiva (`--passWithNoTests=false`)               |
| 5   | Nenhum valor inventado; parâmetros do catálogo; ODs no registro canônico                                                                                                     |
| 6   | Tríade e ordem de prova: caracterização commitada e verde sobre 1.4.0 antes do pin; reexecutada depois; remoções só depois                                                   |
| 7   | Tenancy/RLS/SSE sem dispensa; fail-closed de assinatura; RLS real (não dublê) no teste "B nunca entregue a A"; nenhuma operação sob teste como owner                         |
| 8   | Regra de consumo da 1.5.x: contratos só de `.d.ts` publicados; MUST ausente → checkpoint, nunca _shim_/cópia/contorno                                                        |
| 9   | Ondas, dependências e bancos: nenhum conflito de lock, nenhuma suíte de banco concorrente no mesmo banco, dependência TASK-0015 → TASK-0007/TASK-0018 coerente com A1 item 4 |
| 10  | Decisões do Owner e ADRs respeitadas, não reabertas (OD-S15-01, OD-C2-004/005, A-C2-11/12/13, OD-P27, OD-P30, OD-R22-03)                                                     |
| 11  | Esforço e modelo condizem com `model-ladder.md` (ids `claude-opus-5-5`, `claude-sonnet-5`)                                                                                   |
| 12  | `tasks/*.json` coerentes com os prompts (hash/PC em `compositions.json`, `acceptance_commands`, `upstream_task_id`)                                                          |

## Veredito

- **PASS**: nenhum achado `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um `high` corrigível pelo maestro sem mudar decisão do Owner.
- **FAIL**: o plano ou um prompt contradiz definição canônica, decisão do Owner, ADR ou a
  Constituição; ou a fronteira de escrita é violada.

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0022",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0022/prompts/TASK-0002.md",
      "line": 31,
      "claim": "…",
      "fix": "…"
    }
  ],
  "notes": ["…"]
}
```
