# Prompt review 2 — R-0013 `teat-frontends`, adenda estrutural A1

Por autorização excepcional do Owner nesta sessão, você é reviewer Codex, modelo GPT-5.6 Sol,
esforço high, em papel Auditor soft gate. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Responda somente com o JSON pedido.

Este review sucede `prompt-review-1=FAIL`. A reescrita foi estrutural, portanto este ciclo é
novamente exaustivo; não se limita a diff incremental.

## Leia nesta ordem

1. `docs/meta/agents/orchestra/README.md` §4, §5 e §10.
2. `docs/meta/agents/README.md` §Regras comuns.
3. `docs/framework/arch/teat-build-pack.md` §WP-T4, §WP-T5, §WP-T6, §5 e §6.
4. `work/rounds/R-0013/reviews/prompt-review-1.json`.
5. `work/rounds/R-0013/plan.md`, especialmente Adenda A1.
6. `work/rounds/R-0013/tasks/TASK-0001.json` a `TASK-0018.json`.
7. `work/rounds/R-0013/prompts/TASK-0001.md` a `TASK-0018.md`.
8. `work/rounds/R-0013/compositions.json` e `env-detran-r13.sh`.

## Verificações obrigatórias

- Os 18 tasks formam cadeia serial exata; `plan`, JSON e CTG concordam.
- Corpus tem leitura/escrita explícita; origem TEAT é somente leitura, HEAD e hashes fixos.
- Mobile 67 + D-01/D-04/D-05 = 70; web 56 + quatro rotas operacionais fixas = 60.
- Import-manifest tem um único dono; KB esperado é 619 após mobile e 675/446 após web.
- I18n é Architect sob OD-P46; H.54 não é autoridade de namespace; Engineer só regenera três
  artefatos via script.
- Provisioning usa ADR-0025, DDL 21 e caminhos resolvidos; lê P0–P6 e INV-OFFLINE-001; mantém
  algoritmo/formato source_pending; tríade A→I→E; Inspector possui contrato/policy/tests/seed;
  banco e URLs são `detran_r13`; roles positivas e negativas são exaustivas.
- Em cada app: Architect contract → Engineer scaffold sem teste/comportamento → Inspector RED →
  Engineer feature. Inspector é primeiro autor de testes. Feature Engineer não pode editar
  specs/testing/test-setup/config/package/generated e não recebe `packages/ui`.
- Task JSON usa comandos separados e executáveis quando o upstream cria o pacote; RED esperado é
  assertion de comportamento, nunca import/configuração.
- H.39, H.54, H.55; fronteira SENATRAN; ausência de prazo legal no cliente; zero skip/todo.
- Hash/PC de todo prompt confere; modelo/esforço e papel são proporcionais.

## Veredito

`PASS`: nenhum high. `REVIEW`: high corrigível sem nova decisão estrutural. `FAIL`: contradição
canônica, constitucional, de fronteira ou plano ainda inexequível. Liste todos os achados do ciclo.

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
      "file": "path",
      "line": 1,
      "claim": "claim",
      "fix": "fix"
    }
  ],
  "notes": []
}
```
