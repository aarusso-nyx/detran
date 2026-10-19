# Verificação do encerramento R-0036

- `round close`: PASS, PC-0022 emitido pelo runtime; recibo preservado.
- `round plan --declare`: PASS, registro fechado materializado pelo runtime.
- `round seal` e `round status`: PASS, selo emitido e location=closed.
- 187 testes de governança: PASS.
- Estado, índice adotado de rodadas, corpus legal, âncoras, cadeia, doctor, guarda
  de PC arquivado, KB e publicação documental: PASS. Formatação dos documentos
  novos e atualizados e `git diff --check`: PASS.
- Cadeia: 96 provas ancoradas; 53 lacunas históricas reconhecidas; zero órfãos
  não declarados, âncoras duplicadas ou referências inválidas.
- Preservação: 330 registros originais nas duas histórias; prefixo canônico da main,
  cadeia legada, relatórios congelados e provas anteriores intactos. Nenhum arquivo
  de produto alterado; BL-0013 a BL-0023 continuam abertos e inalterados.

## Limitação preexistente do renderizador adicional

`devai evidence render --kind rounds --check` devolve diferença de bytes também
na main exata 6f07295b, antes destas alterações; recibo `native-render-baseline.json`.
O renderizador DEVAI usa cabeçalho inglês, ordem por rodada e coluna terminal;
o renderizador adotado em `tools/devai/render-rounds-index.mjs`, verificado pelo
`pnpm verify:rounds-index` obrigatório, usa cabeçalho português, ordem por PC e
quatro colunas. Os mesmos registros PC são preservados. O índice foi regenerado
pelo renderizador adotado e passa no seu verificador. O selo oficial já verificou
o vínculo PC-0022/R-0036 antes dessa projeção. Não foram alterados ferramentas,
formatos, controles ou contratos nesta entrega para esconder essa divergência.

A CI e a atestação aprovadas referem-se a 6f07295b; não são alegadas como CI do
commit documental de fechamento. O scorecard permanece congelado em e9e45a4a,
com resultado geral FAIL e sem promoção de prontidão.
