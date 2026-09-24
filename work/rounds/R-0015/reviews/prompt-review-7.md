# Reviewer R-0015 — prompt-review CTG-0002, ciclo 3 excepcional e residual

Você é `claude opus`, Auditor soft gate da família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. O Owner autorizou
excepcionalmente este terceiro ciclo. Verifique exclusivamente o único residual high de
`prompt-review-6.json`: a propriedade do Inspector sobre
`apps/teat/web/src/app/app.runtime-foundations.spec.ts`. Não reavalie os outros 16 itens, não abra
achado sobre texto inalterado e não reavalie CTG-0001.

Não execute busca, glob, `git grep`, `rg` nem leia qualquer arquivo fora da lista fechada abaixo.
Um arquivo, teste ou contrato não listado não pode fundamentar finding, nota ou veredito neste
ciclo, ainda que você saiba ou suspeite que exista. Este parecer não avalia o gate integral futuro;
avalia somente se a correção autorizada resolveu o residual nomeado de `prompt-review-6.json`.

## Leitura fechada

1. `work/rounds/R-0015/AUTHORIZATION.md` — somente Emenda 2
2. `work/rounds/R-0015/reviews/prompt-review-6.json` — somente o finding high residual
3. `work/rounds/R-0015/plan.md` — somente Concorrência, Bloqueios e a linha de triagem do ciclo 2
4. `work/rounds/R-0015/prompts/TASK-0008.md`
5. `work/rounds/R-0015/tasks/TASK-0008.json`
6. `work/rounds/R-0015/compositions.json` — somente a entrada TASK-0008
7. `apps/teat/web/src/app/app.runtime-foundations.spec.ts`

## Verificação única

Confirme apenas que:

1. a Emenda 2 autoriza expressamente incluir o spec e este terceiro ciclo, sem mudança de produto
   ou relaxamento de testes;
2. o spec consta na leitura fechada e em `Pode tocar` de TASK-0008;
3. a mudança permitida no spec limita-se a substituir expectativas provisórias do outlet BOAT
   pelas páginas reais, preservando ou fortalecendo os casos e as garantias de axe, papéis, SSE e
   ausência de fallback, sem pressuposto silencioso de HTTP;
4. o critério de aceitação web executa explicitamente o spec junto dos outros testes focais;
5. SHA-256 e `PC-*` de TASK-0008 coincidem entre prompt, `compositions.json` e os dois campos de
   `tasks/TASK-0008.json`.

PASS: os cinco pontos estão satisfeitos. FAIL: permanece contradição high exatamente nesse
residual e somente nos arquivos da leitura fechada. REVIEW: somente residual low diretamente
causado pelas alterações deste ciclo e somente nos arquivos da leitura fechada. Liste somente
residuais dessa verificação única. Se os cinco pontos estiverem satisfeitos, responda PASS mesmo
que outra superfície não listada possa exigir trabalho futuro do Inspector.

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
