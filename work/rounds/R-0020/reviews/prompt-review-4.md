# Prompt-review 4 — correções do ciclo 3 (R-0020)

Você é Claude Code Opus 5.5, reviewer da outra família, papel Auditor. Trabalhe somente em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Responda só JSON puro, sem cerca Markdown. Este é o quarto e último ciclo autorizado pelo Owner para este item.

Avalie somente os achados de `work/rounds/R-0020/reviews/prompt-review-3.json`, sobre os arquivos corrigidos. Não reabra texto inalterado; um achado novo só é admissível se for FAIL por contradição canônica ou fronteira e explicar por que não surgiu antes. Use a rubrica e o formato de `docs/meta/agents/orchestra/reviewer-prompt.template.md`.

Correções:

1. TASK-0007: `target_modules` inclui `MOD-open-decisions` e `MOD-kb-open-decisions`; JSON e plan.md descrevem anexos e seção canônica. A lista fechada do prompt enumera os 16 `AUTHORIZATION.md` e prompts de abertura das mesmas rodadas.
2. TASK-0010: escopo reduzido a 15 records. R-0018 fica para o maestro após emissão do PC corretivo. A lista fechada inclui os 15 `closure.json` e `plan.md` como fontes de título, meta, isolamento e waves, além do contrato. JSON, plano e contrato concordam.
3. Contrato: sequência 0007→0008→0009→0010, proposta R18 identificada como pré-autorização e R-0021 explicitamente fora do CTG-0003.
4. TASK-0008: testes independem do ID do PC R18. Hashes e PC dos quatro prompts foram recompostos em `compositions.json` e nos JSONs.

Fontes: `reviews/prompt-review-3.json`, `plan.md`, `contracts/CTG-0003.md`, `prompts/TASK-0007.md`…`TASK-0010.md`, `tasks/TASK-0007.json`…`TASK-0010.json`, `compositions.json`, `AUTHORIZATION-CTG3-2026-09-28.md` e `law/register/DECISIONS.md`.

Saída: `{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}`.
