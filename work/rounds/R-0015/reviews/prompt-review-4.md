# Reviewer R-0015 — ciclo restrito de correções do prompt-review-3

Você é `claude opus`, Auditor soft gate da família oposta ao maestro GPT-5.6 Sol. Trabalhe somente
em leitura em `/Volumes/Thiamat II/stech/detran-worktrees/boat-mobile`. Este é o segundo ciclo
válido: avalie **somente** as correções dos achados de
`work/rounds/R-0015/reviews/prompt-review-3.json`. Achado novo sobre texto não alterado só é
admitido se for FAIL por contradição canônica/Owner/ADR/Constituição/fronteira, explicando por que
não foi levantado no ciclo exaustivo.

Leia: `plan.md`, `budget.json`, `tasks/TASK-0001.json`…`TASK-0011.json`,
`prompts/TASK-0001.md`…`TASK-0007.md`, `compositions.json` e o parecer anterior. Confira somente:

1. OD-P46 é o único token da célula Decisão; autorização aparece só como proveniência.
2. TASK-0001 pode corrigir os parágrafos normativos e afirma `boat.` só para namespace i18n.
3. TASK-0004 testa parser e uso desconhecido; roda isolado. TASK-0005 pode tocar parser/verifier e
   fecha a suíte inteira; parâmetros permanecem `est.*`.
4. TASK-0003 usa caminho Portal existente, lê ballot/open-issues/LGPD, segue lista literal do
   contrato e declara o vermelho esperado até TASK-0005.
5. Plano registra M12 e fontes H.42/DT-047/DT-049 corretas.
6. KB: artifactIdCount 756→773, workflow tokens 446; front-matter fechado.
7. TASK-0006 depende de TASK-0002/0003, executa typecheck+node:test via script dentro de `check`.
8. Budget tem uma linha por task/chamada, sete prompts e onze tasks.
9. Fronteira explícita prevalece sobre manual genérico; TASK-0011 registra alinhamento futuro.
10. Formulários: 14 por tela, 15 linhas de gate porque W-04 ocupa duas.

PASS se todos os high foram corrigidos; REVIEW se resta high corrigível; FAIL somente nas hipóteses
acima. Responda apenas JSON estrito:

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
      "claim_b64": "YmFzZTY0",
      "fix_b64": "YmFzZTY0"
    }
  ],
  "notes_b64": []
}
```

Todo texto de claim/fix/note deve ser UTF-8 em base64 RFC 4648 nos campos `_b64`; não emita
claim/fix/notes textuais, aspas internas, barras invertidas, cercas ou prosa.
