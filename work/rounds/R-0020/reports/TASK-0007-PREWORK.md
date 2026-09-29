# TASK-0007 — prework reversível

**Papel:** Architect. **Estado:** preparo empilhado, não entrega final da TASK-0007 nem do CTG-0003.

## Arquivos criados

- `work/rounds/R-0020/contracts/CTG-0003.md`: minuta com 16 linhas rodada → PC → closure → `merged_as` → gates → plan/prompt, bifurcações OD-R20-001/002, tabela de normalização campo a campo e roteiro de ensaio do seal pelo maestro.
- `work/rounds/R-0020/reports/TASK-0007-PREWORK.md`: achados e pendências deste preparo.

Nenhum outro caminho foi alterado por este worker. `law/register/DECISIONS.md`, `record/`, `tools/`, tarefas, Git, PR e selo ficaram fora da fronteira autorizada para o prework.

## Fontes e verificações de leitura

Foram lidos `AGENTS.md`, o prompt e plano da R-0020, o contrato CTG-0002 e relatório TASK-0006, as fontes fechadas do prompt (manuais, schemas, README, PC-0001…0016, closures R-0003…0016/R-0018/R-0019, runtime DEVAI) e o precedente R-0017 (`record.md`, PC-0018, autorização corretiva e registro D-1/D-2). A leitura estruturada comparou os 16 PCs às respectivas `closure.json`: em todos, `round_id` e `merged_as` coincidem; plan e prompt existem. Os gates de todos os PCs estão `pass`. O índice atual contém PC-0001…0018 e o histórico de supersessão de R-0017.

## Achados e riscos

1. **OD-R20-001 e OD-R20-002 pendentes.** Não há base para escrever anexos de decisão das 16 rodadas ou escolher entre PCs atuais e novos. O ramo A/B de cada OD permanece explícito na minuta; novos IDs são `source_pending`.
2. **R-0018 não passa a guarda do selo atual.** PC-0015 inclui `validation_criteria.verdict: fail` no critério `git check-ignore -v dist → ignored`. O runtime DEVAI 1.5.6 rejeita qualquer `fail` no PC selecionado. É necessária decisão/correção governada append-only específica; a autorização corretiva de R-0017 não se estende automaticamente à R-0018. Não se deve editar PC-0015 nem converter o veredito histórico em PASS.
3. **R-0017 já está selada.** PC-0018 corrige PC-0017 por `supersedes` e seu `record.md`/`close-state.jsonl` existem. Não incluí-la na fila evita dupla emissão. R-0001/R-0002 seguem pré-método.
4. **Normalização deve preceder o selo.** O baseline histórico de 143/260 tarefas inválidas é anterior às alterações correntes; o número atual é `source_pending`. A regra de migração exige preservar refs não-INV como `tags: ref:<id>`, resolver INV pelo trace e recusar dados sem fonte. `db_isolation`, CTG e executor não admitem substituição cega.
5. **O comando `round seal` escreve sem `--write`.** O ensaio deve ocorrer só em clone descartável pelo maestro. O seal confere decisões, PC, índice, gates, critérios, plan e prompt, além do schema de `record.md`. Um índice já existente por R-0017 não decide OD-R20-002 para as demais rodadas.

## Decisões e dependências para retomar

- Merge e gates finais do CTG-0002; a minuta não pressupõe essa integração.
- Resposta explícita do Owner a OD-R20-001/002 antes de efeito normativo.
- Resolução autorizada do PC-0015 de R-0018, se a meta continuar incluir seu selo.
- TASK-0008/0009 e gate de tarefas válidas; depois TASK-0010, índice autorizado, ensaio serial, revisão e gates finais pelo maestro.

## Critérios deste prework

- Mapa de fontes e contrato reversível: **PASS**, condicionado aos pontos acima.
- Formatação dos dois arquivos: **PASS**. O contrato foi formatado; o relatório, ignorado pela configuração padrão de evidências verbatim, foi verificado com `--ignore-path /dev/null` e já estava conforme.
- Critérios finais da TASK-0007 e CTG-0003: **não avaliados**; TASK-0007 não declarada concluída.

## Comandos executados e saída resumida

- Leituras `cat`, `sed`, `rg` e script Node somente leitura: 16 PCs e closures coincidentes por rodada/merge; paths de plan/prompt presentes; PC-0015 com um `fail`.
- `node_modules/.bin/prettier --write work/rounds/R-0020/contracts/CTG-0003.md work/rounds/R-0020/reports/TASK-0007-PREWORK.md`: exit 0; contrato formatado (o relatório é ignorado pela configuração padrão).
- `node_modules/.bin/prettier --ignore-path /dev/null --write work/rounds/R-0020/reports/TASK-0007-PREWORK.md`: exit 0; relatório inalterado.
- `node_modules/.bin/prettier --ignore-path /dev/null --check work/rounds/R-0020/contracts/CTG-0003.md work/rounds/R-0020/reports/TASK-0007-PREWORK.md`: exit 0; ambos conformes.
