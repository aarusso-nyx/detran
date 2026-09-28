# R-0017 — prontidão do selo após DEVAI 1.6.0

**Papel:** Architect. **Estado observado:** `origin/main` em `e47a68014ffdd24e1f9da03c4fc9e1b78ecf381b`; PC-0017 publicado e imutável; PRs #133, #143, #144 e #145 mesclados. A worktree `local-stack` estava limpa antes desta reavaliação. Nenhum selo foi aplicado nela.

## Verificação da versão

- Release `v1.6.0` publicada em 2026-09-26: <https://github.com/aarusso-nyx/devai/releases/tag/v1.6.0>. `npm view @aarusso-nyx/devai@1.6.0` confirmou a versão e o tarball do GitHub Packages. O pacote foi extraído apenas em `/tmp/r17-devai-1.6.0`.
- O código distribuído em 1.6.0 ainda exige que `record/derived/indexes/rounds.md` contenha o ID da closure e rejeita qualquer `validation_criteria[].verdict === "fail"` com `ROUND_ARCHIVE_VALIDATION_NOT_GREEN`. O renderer `evidence render --kind rounds` ainda concatena apenas o corpo de `record.md`; `round plan --declare` gera corpo fixo sem o ID do PC. Portanto 1.6.0 não resolve os bloqueios de PC-0017 nem do índice.
- Ao executar o binário 1.6.0 num clone descartável do adotante ainda vinculado a 1.5.6, `round plan --declare` e `round seal` recusaram `AUTHORITY_POLICY_RESOLVED_BYTES_MISMATCH`. `doctor` apontou `policy-materialization-current`, `devai-version-match` e `authority-enforcement` e pediu novo `init bind`. A migração de versão é trabalho governado separado; não foi aplicada à worktree.

## Ensaio do selo com o DEVAI 1.5.6 pinado

Clone descartável: `/tmp/r17-seal.SpfsNy/repo`, com `node_modules` por symlink. `round plan --declare` criou `record.md`. `evidence render --kind rounds` gerou índice sem PC-0017. Um registro D-1/D-2 e uma linha PC-0017 **sintéticos, apenas no clone**, permitiram alcançar a última guarda: `round seal` recusou `ROUND_ARCHIVE_VALIDATION_NOT_GREEN` porque PC-0017 contém quatro critérios históricos `fail` das adendas A4–A6. Nada disso foi aplicado ao repositório real.

No mesmo clone, um novo `round close` com `supersedes: "PC-0017"` criou PC-0018 sem alterar PC-0017. Com os quatro critérios substituídos marcados `n/a` e suas justificativas, registro e índice sintéticos, `round seal` retornou `ok: true` e criou `close-state.jsonl`. Isto demonstra viabilidade técnica, **não** autorização normativa para reclassificar os critérios. O `round status` depois do selo recusou `TASK_ROUND_INACTIVE`; a saída do selo, `close-state.jsonl` e o PC referenciado são as verificações observáveis até correção upstream.

## Decisão e sequência de retomada (registro anterior à autorização)

O Owner ainda precisa decidir se um PC corretivo append-only pode tratar os quatro critérios substituídos como `n/a` na observação atual, preservando os `fail` em PC-0017 e citando A4–A6 explicitamente. A mesma decisão deve fixar D-1/D-2 em `law/register` e autorizar um gerador determinístico local para o índice derivado, já que o renderer publicado não inclui IDs de PC. A resposta recebida até agora pediu verificar 1.6.0; não autorizou esses três efeitos.

Se autorizado: manter o pin 1.5.6 para o selo; compor draft corretivo com `supersedes: PC-0017`; adicionar testes do gerador de índice; ensaiar todos os verbos `--write` em clone; obter revisão da outra família; executar `round close`, `round plan --declare`, geração do índice e `round seal` na branch isolada; verificar `close-state.jsonl`, cadeia e gates; abrir PR, exigir CI verde e reviewer PASS, mesclar e observar o SHA integrado. Se o Owner preferir correção upstream, manter PC-0017 como está e aguardar versão que resolva os três bloqueios sem reclassificação local.

Nenhum `record/`, `law/` ou `closure.json` do repositório foi alterado nesta reavaliação.

## Atualização do Owner

Após receber esta reavaliação, o Owner aprovou a correção governada. `work/rounds/R-0017/SEAL-AUTHORIZATION.md` registra o escopo autorizado; a implementação e os verbos DEVAI permanecem sujeitos aos ensaios, gates, revisão da outra família e PR.

## Execução autorizada

O clone `/tmp/r17-seal-authorized.28FQYi/repo` reproduziu o fluxo completo com o draft e as ferramentas desta branch: PC-0018 emitido pelo DEVAI, `record.md` declarado pelo DEVAI, índice local determinístico com PC-0018, `verify:state-index` verde para 18 closures e `round seal` `ok: true` com `close-state.jsonl`.

Na worktree real, os mesmos verbos retornaram PC-0018 e selo `ok: true`. O SHA-256 de PC-0017 permaneceu `7618551a11e32b830f02193806621325b8116d7265cfe3fdb9e64b044fa9c024`, igual ao do clone. A cadeia de evidências segue válida no head `25f94219921c2f37f927aa55c2aa98d97e96502d753be669134e6245c1b429d1`. A correção ainda não foi publicada em PR nem mesclada; sua revisão e CI são passos seguintes.

O comando genérico `devai check --only schema --schema <phase-closure.schema.json>` recusou uma referência relativa `common-defs.schema.json` do pacote; a validação embutida de `round close` aceitou PC-0018. Esta falha de invocação genérica é registrada como `sensor-error`, sem mudança no schema ou no PC.

O reviewer Claude Opus 5.5 retornou `PASS` no primeiro ciclo com cinco achados de baixa severidade. O caso em que a entrada por symlink/caracteres reservados poderia não executar o gate foi corrigido e recebeu teste; o renderer ganhou testes para índice obsoleto ou ausente, predecessor ausente, vínculo entre rodadas, dois terminais e JSON inválido. `law/README.md` agora aponta ao registro e D-2 cita a fonte de R-0017 sem inferir anexos das demais rodadas. O `record.md` gerado é protegido no ato do selo; uma edição manual posterior de seu frontmatter não é detectada continuamente por `format:check`. Esse limite fica registrado para uma futura checagem de integridade específica.

## Publicação e observação pós-merge

O ciclo 2 de `delivery-review` retornou `PASS`. `pnpm check` e `pnpm docs:check` passaram integralmente; a prova DEVAI CTG-SEAL foi registrada como sequência genérica 7 e a cadeia validou no head `9a1543cb2bb75554549ab7f8dbb612eff14d28854e83be4930dbe05790be80db`. O PR #147 passou por todos os checks obrigatórios, incluindo `verified-local-rc`, e foi mesclado em `b31f12728f0de35e5da0ad4c904425ed2b9fb01c`.

Depois do merge, `audit observe --at b31f12728f0de35e5da0ad4c904425ed2b9fb01c` retornou `EV-8b3063e2a763ab41`; a cadeia local validou no head `4e7d24d618730d6555af5b2e4ad5ff92af3e915f9420ab17d9c438cb8a16f994`. A observação e o histórico final seguem para PR de metadados, sem reabrir o selo.
