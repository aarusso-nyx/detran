Return exactly one JSON object. First character `{`, last character `}`. No Markdown fences or prose outside JSON.

# Revisão cruzada A1 — proposta de meta para CTG-0004

Você é Claude Code Opus 5.5, reviewer da outra família e Auditor constitucional. Trabalhe somente em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Não edite arquivos, não execute comandos DEVAI com `--write` e não trate esta revisão como entrega do CTG-0004.

Leia, nesta ordem, `docs/meta/agents/orchestra/reviewer-prompt.template.md`, `work/rounds/R-0020/plan.md` (Metas, Critérios e A1), `work/rounds/R-0020/contracts/CTG-0001.md`, `work/rounds/R-0020/baseline.json`, `work/rounds/R-0020/baseline.md` e `work/rounds/R-0020/contracts/CTG-0004-A1-proposal.md` (SHA-256 `e25500f954cc6d2e8acabb82eb13269b8f831b78fb074b6eb34f0f959989ece5`). Consulte `package.json` e o registry instalado DEVAI 1.5.6 somente para conferir os 16 checks, os quatro emissores e a inferência do piso; não varra o repositório.

Julgue exaustivamente, como revisão de proposta para decisão Owner: (1) se as quatro células `F2:T5`, `F2:T8`, `F2:T9` e `F3:T1` e o piso 0/3/1/0/0 são justificados como meta prospectiva sem alegação de PASS atual; (2) se os 16 membros de `devai check` e as exceções de autoaplicação preservam os gates e a baseline; (3) se a divergência entre o destino de `sense record` e a leitura de `audit scorecard` está demonstrada e a condição de correção governada evita PASS fictício; (4) se as três perguntas A1-1/2/3 são concretas e suficientes para o Owner decidir; (5) se há contradição com o plano, Constituição, Art. 41 ou sequência de CTGs. Cite arquivo e linha para cada achado; se faltar fonte, peça uma correção específica. `PASS` apenas libera a consulta ao Owner, sem executar CTG-0004 nem mudar critério.

Use a rubrica e a semântica de veredito do template. Responda JSON estrito:

{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}.
