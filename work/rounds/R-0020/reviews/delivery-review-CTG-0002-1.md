# Auditor — delivery-review CTG-0002, ciclo 1 de até 4

Você é Claude Code `claude-opus-5-5`, papel constitucional **Auditor**, família oposta ao maestro Codex. Trabalhe somente em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Não edite arquivos nem execute DEVAI `--write`. Responda somente JSON válido, começando por `{` e terminando em `}`, sem Markdown.

## Contexto

R-0020, ação 5 da C-0002. O PR #150 (CTG-0001) foi mesclado; o PR #152 da reancoragem da observação também foi mesclado, com CI verde e PASS de reviewer. O `audit observe --at c3c0df57b8fe9977bc808ff66fdc85328ffa756c --round R-0020 --write` foi ensaiado em clone e executado na branch, gerando `EV-47640325d901cd0a` e cadeia válida em `b31b9b2771db655d436a1b634b3cc764db72327d0c9362d1d43a3b21f9bec14e`. Esse commit é `8e7e7038`.

O CTG-0002 corrige 52 linhas órfãs históricas de R-0005, R-0007, R-0013 e R-0017 com quatro declarações append-only e introduz um gate de âncoras. O PR #151 da R-0021 introduziu uma linha adicional sem âncora, R-0021 sequência 2, SHA-256 `c562dfce81ec9ba08c4d3eae22547ad36adb99fbb76dc2632bb20e81fbbfb804`. A proposta A2 para essa linha está no contrato, explicitamente **pendente de aprovação do Owner e sem efeito**. O PR #153 da R-0021 está aberto e toca `record/proofs/chain.json`; o maestro não escreve provas reais enquanto esse lock existir. A revisão deste ciclo deve identificar **todos os achados de implementação agora**, mesmo que a entrega ainda esteja incompleta. Não considere a proposta A2 como aprovação.

O ensaio em clone descartável `/tmp/r20-ctg2-four-after152.tmIOsh/repo` executou as quatro provas históricas: R-0005 seq. 11, R-0007 seq. 43, R-0013 seq. 16, R-0017 seq. 8. A cadeia DEVAI ficou válida, head `2c0875fe62417ac776369d466b134e1d161fe3938fced9410691c3954be6237f`; o gate contou 78 diretamente ancoradas, 52 declaradas, 1 não declarada (R-0021 seq. 2), zero duplicatas/referências inválidas. Nenhuma das provas foi escrita no branch. A issue upstream DEVAI #168 foi aberta para o cruzamento de âncoras.

## Leitura e diff

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md`, `.devai/pin/constitution.md`, `work/rounds/R-0020/plan.md`, `work/rounds/R-0020/contracts/CTG-0002.md`, `work/rounds/R-0020/baseline.json`, os relatórios `TASK-0004.md`, `TASK-0005.md`, `TASK-0006.md` e os prompts das três tarefas. Inspecione `git diff` e todos os arquivos novos/untracked de CTG-0002: `tools/devai/verify-proof-anchors.mjs`, `tools/devai/tests/verify-proof-anchors.test.mjs`, `work/rounds/R-0020/evidence-CTG-0002-correction-R-0005.json`, `-R-0007.json`, `-R-0013.json`, `-R-0017.json`. Também revise `.gitattributes`, `AGENTS.md`, `package.json`, os status TASK-0004/0005/0006 e este plano. Compare a lista de 52 trios do contrato com `baseline.json` e bytes físicos JSONL. Julgue a escolha de fail-closed baseada na baseline e se o gate implementa o contrato sem aceitar linha nova declarada.

Gates atuais: `node --test tools/devai/tests/verify-proof-anchors.test.mjs` 8/8 PASS; `pnpm devai:test` 26/26 PASS; `pnpm format:check` PASS; `devai evidence verify --scope chain` PASS. O gate real `pnpm verify:proof-anchors` está RED esperado: 53 órfãs não declaradas antes das provas, 74 âncoras diretas, zero duplicatas e referências inválidas. A entrega final ainda dependerá do lock, de A2 e de um novo delivery-review com gate verde. Trate essa pendência como achado high de completude, se aplicável, mas faça revisão exaustiva das partes já implementadas agora. Não peça para editar registros antigos nem para afrouxar testes/gates.

## Veredito

Aplique a rubrica do template, inclusive autoridade por caminho, testes antes da implementação, contratos, gates e ausência de escrita manual de `record/`. `PASS` somente sem high; `REVIEW` para high corrigível; `FAIL` para contradição canônica ou violação de autoridade. Cite arquivo e linha. Quatro ciclos por item foram autorizados pelo Owner em `AUTHORIZATION-RETAKE-2026-09-28.md`.

Resposta JSON obrigatória com `mode:"delivery-review"`, `round:"R-0020"`, `verdict:"PASS"|"REVIEW"|"FAIL"`, `findings` array de `{severity,item,file,line,claim,fix}` e `notes` array de strings.
