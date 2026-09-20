# Prompt review — R-0013 `teat-frontends`

Por autorização excepcional e explícita do Owner nesta sessão, você é o reviewer da mesma família
Codex, modelo GPT-5.6 Sol, em modo `prompt-review`. Papel constitucional: Auditor (soft gate,
Constituição DEVAI Art. 18). A exceção substitui somente a regra de família deste review; não muda
a rubrica nem cria precedente. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends` e responda apenas com JSON.

## Leitura, nesta ordem

1. `docs/meta/agents/orchestra/README.md` §4 e §5.
2. `docs/meta/agents/README.md` §Regras comuns.
3. `docs/framework/arch/teat-build-pack.md` §WP-T4, §WP-T5, §WP-T6 e mapa entregável.
4. `work/rounds/R-0013/plan.md`.
5. `work/rounds/R-0013/tasks/TASK-0001.json` a `TASK-0012.json`.
6. `work/rounds/R-0013/prompts/TASK-0001.md` a `TASK-0012.md`.
7. `work/rounds/R-0013/compositions.json`.

## Rubrica

Julgue exaustivamente: papel constitucional; leitura fechada suficiente; fronteiras e locks;
comandos existentes e resultados explícitos; ausência de valores inventados; tríade
Architect→Inspector→Engineer; vocabulário canônico; fronteira SENATRAN; decisões H.39/H.54/H.55;
parcimônia/modelo; e autorizações positivas e negativas. Confirme particularmente: allowlist
`teat.*` pelo Architect antes do i18n; transcrição de corpus antes das fichas; testes antes dos
apps; e nenhum Engineer editando blueprint/contrato/teste.

`PASS`: nenhum high. `REVIEW`: high corrigível sem mudar o plano. `FAIL`: contradição canônica,
constitucional ou de fronteira. Este primeiro ciclo é exaustivo.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0013",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "caminho",
      "line": 1,
      "claim": "achado",
      "fix": "correção"
    }
  ],
  "notes": []
}
```

## Material do maestro

Base original: `b0df484dc0ae1fc1fa742a5f60ef00b17b1c348e`; checkpoint do maestro:
`7beaba3a39df9769ee5df81fe36754016109c5e2`. O plano, tarefas, prompts e hashes acima são o material
anexado. Verifique os arquivos atuais na worktree, não versões em memória.
