# TASK-0005 — escalada da revisão de entrega CTG-0001

**Papel:** Engineer. **Executor:** `gpt-6-sol/high`. Após duas iterações de
TASK-0005, o reviewer apontou duas falhas no gate. O Engineer alterou apenas
`tools/law/verify.mjs`, depois dos novos testes RED do Inspector.

A resolução de âncora segue agora `extractHeadingSlugs` e `anchorExists` do
DEVAI 1.5.6, sem normalização NFD ou remoção de diacríticos adicional. A
resolução de OD procura a primeira célula de qualquer linha da tabela
canônica, exigindo a seção R-0019 para IDs `OD-R19-*`. A verificação de
diretórios RN/WF/UC/JRN usa caminho relativo à raiz de produto.

`pnpm law:test` **PASS 28/28**; `pnpm verify:law-corpus` **PASS**;
`pnpm exec prettier --check tools/law/verify.mjs` **PASS**. Nenhum comando Git
foi executado.
