# R-0020 CTG-0003 — retry de transporte do review final

O review solicitado em `prompts/delivery-review-CTG-0003-4.md` não produziu artefato válido porque a resposta veio dentro de cerca Markdown. Repita **o mesmo escopo e o mesmo ciclo 4**, somente leitura: PR #156, HEAD `818a5a249cd316f6e55621b98dd8571efb112a7c`, recibos A3.6/baseline no HEAD, evidência DEVAI, limitações dos 15 records, literal `round status` não cumprido e condições de merge. O CI é gate separado e não deve ser presumido verde.

Sua resposta deve ser um único objeto JSON bruto. O primeiro caractere da resposta é `{` e o último é `}`. Não use Markdown, cerca de código, texto introdutório ou pós-escrito. Campos: `mode`, `round`, `ctg`, `pull_request`, `head_sha`, `verdict` (`PASS` ou `REVIEW`), `findings` (array) e `notes` (array). Cada finding tem `severity`, `item`, `file`, `line`, `claim`, `fix`. Use textos simples nos valores, sem crases nem aspas internas. Não edite arquivos.
