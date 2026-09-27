# Transporte JSON — `prompt-review` TASK-0011 ciclo 2

A resposta anterior foi PASS, mas tinha fences Markdown e nao foi aceita
pela ponte. Repita **somente** a revisao restrita do ciclo 2: leia
`reviews/prompt-review-TASK-0011.json` e
`prompts/TASK-0011.md` na worktree desta rodada. Avalie os dois achados
altos corrigidos, sem novos itens. Papel Auditor, somente leitura.

Sua resposta deve ser **um unico objeto JSON valido**. O primeiro caractere
deve ser `{` e o ultimo `}`. Nao escreva ```json, fences, texto antes ou
depois, nem quebras literais dentro de strings. Campos obrigatorios:
`mode="prompt-review"`, `round="R-0017"`, `verdict` (`PASS`, `REVIEW` ou
`FAIL`), `findings` array e `notes` array. Seja breve.
