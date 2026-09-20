# Prompt review 3 — R-0013 `teat-frontends`, Adenda estrutural A2

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex, modelo GPT-5.6 Sol,
esforço high, em papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Responda somente com o JSON pedido;
não edite nenhum arquivo.

Este review sucede `prompt-review-2=FAIL` e a autorização explícita do Owner para a Adenda A2.
Reavalie os sete achados integralmente e faça uma varredura de regressão na estrutura já aceita.

## Leia nesta ordem

1. `docs/meta/agents/orchestra/README.md` §4, §5 e §10.
2. `docs/meta/agents/README.md` §Regras comuns.
3. `docs/framework/arch/teat-build-pack.md` §WP-T4, §WP-T5, §WP-T6, §5 e §6.
4. `work/rounds/R-0013/reviews/prompt-review-2.json`.
5. `work/rounds/R-0013/plan.md`, especialmente Adendas A1 e A2.
6. `work/rounds/R-0013/preflight-a2.json` e `env-detran-r13.sh`.
7. `work/rounds/R-0013/tasks/TASK-0001.json` a `TASK-0018.json`.
8. `work/rounds/R-0013/prompts/TASK-0001.md` a `TASK-0018.md`.
9. `work/rounds/R-0013/compositions.json`.

## Verificações obrigatórias da A2

- TASK-0001 tem todas as fontes e somente destinos necessários para os doze itens, incluindo
  WF-TEAT-001/002, UC-TEAT-007/012, RN-TEAT-135 e os blueprints de álcool.
- Workers não precisam invocar Git: o preflight do maestro fixa remote/HEAD/status/hashes; hashes
  são verificáveis em leitura e o maestro é o único dono da validação de diff.
- O checkpoint `pnpm install`/lockfile ocorre imediatamente após TASK-0007 e antes de TASK-0008.
- TASK-0007 roda `contracts:clients`, possui `packages/api-clients/src/index.ts`, exporta os dois
  clientes de provisioning e prova o barrel público; TASK-0017 lê esse barrel real.
- `src/test-setup.ts` tem ownership exclusivo dos scaffolds; Inspectors usam apenas specs e
  `src/testing/**`.
- TASK-0008 contém precondição de ambiente, reset e duas seeds como comandos separados, todos em
  `detran_r13`.

## Varredura de regressão

- Os 18 tasks mantêm cadeia serial exata; plano, JSON e CTG concordam.
- Corpus, matrizes, i18n, provisioning e apps preservam papéis/fronteiras aceitos no review 2.
- Hash/PC de todo prompt confere com task e compositions; modelo/esforço permanece proporcional.
- Nenhum comando depende de path inexistente, instalação tardia ou ownership sobreposto.

## Veredito

`PASS`: nenhum high. `REVIEW`: high corrigível sem nova decisão estrutural. `FAIL`: contradição
canônica, constitucional, de fronteira ou plano inexequível. Liste todos os achados deste ciclo.

## Saída

```json
{
  "mode": "prompt-review",
  "round": "R-0013",
  "verdict": "PASS | REVIEW | FAIL",
  "reviewer": {
    "family": "codex",
    "model": "gpt-5.6-sol",
    "effort": "high",
    "authorization": "Owner exception for this session"
  },
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim": "claim",
      "fix": "fix"
    }
  ],
  "notes": []
}
```
