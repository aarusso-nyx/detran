# TASK-0001 — iteração 2 após checkpoint `reference-gap`

Papel constitucional: **Architect**. Trabalhe na mesma worktree e sob todas as regras do prompt
`work/rounds/R-0003/prompts/TASK-0001.md`. Nunca execute git.

O hard gate após TASK-0003 encontrou uma contradição interna no seu contrato:

- §2/§3 deriva `DASH_EXPORT_ROLES` de toda camada N1/N2 e, portanto, inclui `AUDITOR` e `DPO` em
  `dashboard:export:create`.
- §2 e §8.2.22 afirmam que Auditor/DPO são somente leitura e proíbem `AUDITOR` em
  `dashboard:export:create`.
- O teste falhou exclusivamente em `AUDITOR` + `dashboard:export:create`.

Fonte superior: [RN-DASH-170] diz auditor/DPO N0–N2 transversal, **somente leitura**, e exportação
herda classificação; a camada máxima não concede automaticamente permissão de exportar. Corrija
somente `work/rounds/R-0003/contracts/CTG-0001.md` para excluir `AUDITOR` e `DPO` do conjunto
`DASH_EXPORT_ROLES` e de `dashboard:export:create`, atualizando contagens/listas/critérios afetados.
Preserve todo o resto. Não toque no DDL, testes, código de produção ou outros arquivos.

Entrega: o mesmo relatório fixo do prompt original, identificando iteração 2, linhas corrigidas e
qualquer comando executado. Se houver outra ambiguidade, pare; não invente.
