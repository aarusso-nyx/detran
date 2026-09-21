# Prompt review 9 — A5 command-count correction

Atue como Auditor Codex independente GPT-6 Astra/high, somente leitura, pela exceção do Owner.
Verifique TASK-0008 prompt/metadata, `compositions.json`, os contratos reais e
`tools/contracts/tests/check-commands.test.mjs`.

Confirme que existem exatamente oito novas operações provisioning, elevando somente as expectativas
reais de 152→160 total e 92→100 TEAT; a allowlist autoriza apenas essas duas substituições e proíbe
qualquer outra mudança no teste. Confirme hash/PC e ausência de regressão direta A5. Retorne JSON com
verdict PASS/REVIEW/FAIL, findings e notes. Não edite nem use Git mutável.
