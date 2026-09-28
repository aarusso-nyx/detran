# CTG-0007 — avanço concorrente de main e vínculo dos gates

Papel: Engineer para integração e provas; Auditor dedicado para observação. Após o candidato documental `dad0d5ceaa1a1525e4bc0997699a2a312acd09eb` e a abertura do PR #153, o PR #152 de R-0020 mesclou em `main` como `c3c0df57b8fe9977bc808ff66fdc85328ffa756c`. O PR #153 ficou conflitante na cadeia governada. O merge normal `699c6ca59dd304b7138fddeb39dd8f216d447be7` aceitou `record/proofs/chain.json` e o JSONL R-0021 de `main`, sem edição de hash. A cadeia verificou nesse ponto com head `6f81515670216688e458681e32ed0d8b46bf94be90e7ab553f3fb53532ed6cf3`.

O delta de `69642874` a `c3c0df57` contém 18 arquivos: observação, prova e registros de R-0020; nenhum arquivo de produto, teste, manifesto, lockfile, ferramenta, workflow ou documentação `docs/`. A comparação dos objetos Git entre o candidato antes do merge e o merge `699c6ca5` é exata:

| Superfície | Git object antes = depois |
| --- | --- |
| `backend/` | `c9598c22dcde9fa4fd122c34c3f519e81bc14857` |
| `apps/` | `0c8928e2b8fd5553e959dfc63099e2b800bd4812` |
| `packages/` | `c377d7a443dfd92dad832901d35c6a2145a59e86` |
| `senatran-mock/` | `de7db10337ad97b9bbc2d3e09710465cbe2626a8` |
| `tools/` | `b35fd3091e2af65271b5ae9c8c9e0e3b05ff1c4a` |
| `docs/` | `bb2256e816dedaf0b5e32457848fb18befcdd9c3` |
| `package.json` | `8b424e14ca0d573d4041139a7aed350746ac7be4` |
| `pnpm-lock.yaml` | `d1b9ea0f6f46bf02cc127bf77143f263ad89b2e8` |
| `.github/workflows/` | `5a169fcb1e8879e577d4b0a01c7f2cbfab4c6599` |
| `work/rounds/R-0021/` | `099e5b217be02404d7b0377b8845df1f6d6ad345` |

O resultado local já verde de `pnpm backend:test:ci`, `pnpm build` e `pnpm backend:rls-smoke` continua vinculado à mesma árvore de produto, testes e dependências. Para os arquivos de R-0020 e provas que os gates documentais consomem, os comandos foram reexecutados após a integração:

| Comandos | Exit | Log SHA-256 |
| --- | --- | --- |
| `pnpm format:check` | 0 | `ctg0007-main-sync-format.log` `2d20b040b47a087ead8f486f7cdd3ddfc6fea73fd892371b801c5300c943d28e` |
| `pnpm docs:kb:check`; `pnpm docs:kb:publish-check` | 0; 0 | `ctg0007-main-sync-docs.log` `fd38b9c72bee02ca208c4eab93860cd6a8c0748073f61ddf084ef46c1f7a6d02` |
| `pnpm verify:state-index`; `pnpm verify:rounds-index`; `pnpm test:state-index`; `pnpm test:rounds-index` | 0; 0; 0; 0 | `ctg0007-main-sync-index.log` `f0f39a13a046b06437f71f30295ca37d1380399cf0e15b686bbcec735da69b13` |

O Auditor separado tentou observar #151 na worktree integrada; o runtime recusou com `AUDIT_OBSERVE_EXACT_HEAD_REQUIRED`, exit 2, sem mutação. Reutilizou-se a worktree exclusiva `/tmp/r21-audit-ctg2`, posicionada no SHA exato `69642874c1ccd4cf4d1c6f0ec431ecd9fb848a05`. Os bytes vigentes de `record/proofs/chain.json` e `record/proofs/work/generic/R-0020.jsonl` foram importados; `evidence verify` passou antes da operação. O Auditor executou `devai audit observe` com exit 0: `EV-13603dba522df1e8`, novo head `f96c5b7f417ffbe64223fdfb003973b3db468ad1f4c3dc97d8684e505b3df00e`. Os cinco artefatos da observação são byte a byte idênticos aos já versionados; somente a cadeia gerada pelo runtime foi incorporada no commit `775906fb402cdc0a801b17afca7ce932dc28302c`, seguida de verificação exit 0.

A prova genérica CTG-0007 emitida antes do merge de main foi substituída na cadeia integrada e será reemitida pelo runtime sobre o head acima. O review de delta e os checks obrigatórios remotos precisam passar no novo SHA do PR #153 antes do merge. O stack smoke remoto anterior continua com a divergência já triada; não é declarado PASS.
