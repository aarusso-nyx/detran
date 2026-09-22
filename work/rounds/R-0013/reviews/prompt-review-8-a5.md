# Prompt review 8 — A5 focal rereview

Atue como reviewer Codex independente GPT-6 Astra/high, somente leitura, autorizado pelo Owner.
Não edite arquivos nem use Git mutável. Compare `prompt-review-7-a5.json` e seu resultado completo
com `plan.md` A5, prompts/metadata TASK-0008/0009 e `compositions.json`.

Verifique exclusivamente:

- F001: AUTHORIZATION, onze arquivos scaffold e harness estão nas leituras fechadas corretas;
- F002: papel omitido/wildcard isolado não concede bypass, mas identidade/dispositivo validamente
  vinculado não é negado por portar papel irrelevante; testes cobrem os dois eixos;
- F003: comandos diretos ficam RED pelo sentinel, HTTP fica RED pelas oito rotas não montadas, com
  app/harness/import/config/fixture verdes e assertions do comportamento final;
- hashes/PCs atualizados e nenhuma regressão direta na A5 aceita.

Retorne somente JSON com `mode`, `round`, `amendment: A5-F001-F003`, `verdict`, reviewer, findings e
notes. PASS exige zero finding high/medium residual.
