# Reviewer R-0015 — prompt-review CTG-0002, ciclo 4 excepcional e residual

Você é `claude opus`, Auditor soft gate da família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. O Owner autorizou
excepcionalmente este quarto ciclo. Verifique exclusivamente o residual isolado pelo gate integral:
a propriedade do Inspector sobre `apps/teat/web/src/app/app.homologation.spec.ts`. Não reavalie
outros itens, não abra achado sobre texto inalterado e não reavalie CTG-0001.

Não execute busca, glob, `git grep`, `rg` nem leia qualquer arquivo fora da lista fechada abaixo.
Um arquivo, teste ou contrato não listado não pode fundamentar finding, nota ou veredito neste
ciclo. Este parecer não avalia o gate integral futuro; avalia somente se a Emenda 3 resolve a
fronteira do residual nomeado.

## Leitura fechada

1. `work/rounds/R-0015/AUTHORIZATION.md` — somente Emenda 3
2. `work/rounds/R-0015/plan.md` — somente a linha de triagem da Emenda 3
3. `work/rounds/R-0015/prompts/TASK-0008.md`
4. `work/rounds/R-0015/tasks/TASK-0008.json`
5. `work/rounds/R-0015/compositions.json` — somente a entrada TASK-0008
6. `apps/teat/web/src/app/app.homologation.spec.ts` — somente o caso que navega para
   `/ux/web/crashes-list` e espera `source_pending · BOAT`

## Verificação única

Confirme apenas que:

1. a Emenda 3 autoriza expressamente incluir o spec e este quarto ciclo, sem mudança de produto ou
   relaxamento de testes;
2. o spec consta na leitura fechada e em `Pode tocar` de TASK-0008;
3. a mudança permitida limita-se a atualizar a expectativa provisória do outlet
   `/ux/web/crashes-list` para a página real, preservando o mesmo caso, persona, papéis,
   acessibilidade e zero HTTP;
4. o critério de aceitação web executa explicitamente o spec junto dos outros testes focais;
5. SHA-256 e `PC-*` de TASK-0008 coincidem entre prompt, `compositions.json` e os dois campos de
   `tasks/TASK-0008.json`.

PASS: os cinco pontos estão satisfeitos. FAIL: permanece contradição high exatamente nesse
residual e somente nos arquivos da leitura fechada. REVIEW: somente residual low diretamente
causado pelas alterações deste ciclo e somente nos arquivos da leitura fechada. Se os cinco pontos
estiverem satisfeitos, responda PASS mesmo que outra superfície não listada possa exigir trabalho
futuro do Inspector.

Responda apenas com o último objeto JSON estrito, sem cercas, prosa, preâmbulo nem repetir
veredito anterior:

```json
{
  "mode": "prompt-review",
  "round": "R-0015",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim_b64": "base64 UTF-8",
      "fix_b64": "base64 UTF-8"
    }
  ],
  "notes_b64": ["base64 UTF-8"]
}
```

Todo claim, fix e note deve usar somente o campo `_b64` em base64 RFC 4648.
