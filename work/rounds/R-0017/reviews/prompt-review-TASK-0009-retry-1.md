# Prompt-review da correcao TASK-0009

Papel: Auditor externo Claude Opus 5.5, somente leitura. Leia
`work/rounds/R-0017/prompts/TASK-0009-retry-1.md`, o prompt original
`TASK-0009.md`, `.github/workflows/ci.yml` somente `stack-smoke`, e
`docs/meta/agents/orchestra/reviewer-prompt.template.md`.
O PC do retry e `PC-47edae38d004dd73`; SHA-256 completo
`47edae38d004dd7384f43d1f1e8f428d3dcd4ee9fe4825e73102fd36f9de4354`.
Confirme que a fronteira e so o job opcional, que o positivo/negativo
`bash tools/detran-stack.sh config | jq` demonstra o digest sem banner pnpm,
e que os checks obrigatorios permanecem intactos. Nao reavalie outros
pontos ja aceitos do CTG. PASS se nenhum high, REVIEW por high corrigivel,
FAIL por violacao canonica/Owner/Constituicao/fronteira.

Responda UMA LINHA de JSON cru, primeiro caractere `{`, ultimo `}`,
sem bloco Markdown ou texto fora do JSON; escape aspas internas. Chaves:
mode=`prompt-review`, round=`R-0017`, verdict, findings=array de
severity/item/file/line/claim/fix, notes=array. Formato:
{"mode":"prompt-review","round":"R-0017","verdict":"PASS","findings":[],"notes":[]}
