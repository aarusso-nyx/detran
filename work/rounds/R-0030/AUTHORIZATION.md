# Autorização da R-0030 — `user-docs`

Em 2026-09-29, o Owner autorizou a abertura da R-0030 com o prompt desta sessão, o
`plan.md` e o anexo `availability-manifest.schema.md` de `origin/main`, limitada às
ondas **O1–O3** da seção Execução OD-C2-005. A adenda A-C2-13 do prompt do Owner é
vinculante enquanto o PR #158 não estiver mesclado.

## Troca de família autorizada pelo Owner

- Maestro: Codex Sol 6 (`gpt-6-sol`).
- Workers: Codex, pela escada de `docs/meta/agents/orchestra/model-ladder.md`;
  tarefas grandes com Sol 6, médias com Terra (`gpt-5.6-terra`) e pequenas com
  Luna (`gpt-6-luna`).
- Reviewer independente: Claude Code Opus 5.5 (`claude-opus-5-5`) pela ponte
  `tools/orchestra/bridge.sh claude`.

Esta troca prevalece sobre as atribuições Claude/Opus/Sonnet do plano e do prompt
anteriores. O branch autorizado é `orchestra/user-docs`, a partir de
`origin/main`. Ao fim de cada onda O1–O3 haverá push sem PR. Depois de O3, o
maestro registra o checkpoint de retomada e para, aguardando os manifestos da
fase D (R-0025…R-0029). Não há delivery-review, PR ou evidência nesta sessão.

## Decisões do Owner registradas em 2026-09-29

- **OD-UD-001:** Opção A — `docs/adopters/manuais/`, na seção Adotantes da IA
  de sete seções.
- **OD-UD-002:** Opção A — publicação seletiva: manual `cidadao`, glossário e
  trecho cidadão do FAQ são públicos; manuais internos permanecem versionados,
  verificados e fora do site público.
- **OD-UD-003:** `REF-CONTRAN-985-1003-MBFT` é fonte fechada para tópicos da
  Parte Geral; fichas individuais continuam `source_pending`.
- **OD-UD-004:** R-0030 não cria entrada nova em DASHBOARD, TEAT web ou BOAT;
  integração futura pertence à rodada dona do shell após a R-0024.
- **OD-UD-005:** reutilizar `portal.screens`, `rait.shell` e `teat.screens`;
  não criar namespace `*.help`.
