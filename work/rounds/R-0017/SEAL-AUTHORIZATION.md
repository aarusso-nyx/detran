# Autorização do Owner — correção governada do selo de R-0017

Em 2026-09-27, após a publicação de DEVAI 1.6.0 e a verificação de que ela não resolve as recusas do selo, o Owner aprovou prosseguir com a correção governada proposta para R-0017:

1. Preservar PC-0017 e seus quatro vereditos históricos `fail` sem editar os bytes existentes.
2. Emitir pelo verbo `devai round close` um PC corretivo append-only com `supersedes: PC-0017`. Os quatro critérios substituídos pelas adendas A4–A6 são `n/a` na observação corretiva, com referência expressa aos `fail` preservados no PC-0017; nenhum é promovido a `pass`.
3. Registrar D-1 e D-2 em `law/register`, vinculando a autorização original do Owner e o fechamento do maestro aos três CTGs mesclados.
4. Gerar `record/derived/indexes/rounds.md` por ferramenta local determinística a partir dos PCs, pois o renderer publicado omite o ID de closure exigido pelo selo.
5. Manter o pin DEVAI 1.5.6 para esta correção. Uma migração a 1.6.0 requer `init bind` e não é pré-requisito nem solução para o selo.

Esta autorização não altera o recibo PC-0017 nem dispensa CI verde, revisão da outra família, cadeia válida ou os demais gates do repositório.
