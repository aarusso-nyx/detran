# Atestação local de RC para uma árvore exata

**Authority:** Architect (Constitution Articles 6, 7 and 41).

Este runbook descreve o fluxo já implementado em
[`prepare-local-rc.mjs`](../../../tools/ci/prepare-local-rc.mjs) e
[`publish-local-rc.mjs`](../../../tools/ci/publish-local-rc.mjs), sob
[ADR-0028](../../meta/adr/ADR-0028-devai-1-5-2-attested-local-rc.md).
Não amplia o perfil RC nem altera os controles do verificador.

## Quando aparece HTTP 404 depois do merge

Uma árvore nova pode ainda não ter a referência protegida
`devai-local-evidence/<tree>`. O verificador independente roda no push da main e
falha ao procurar essa referência ausente. A CI principal pode, separadamente,
executar todo o backend remoto e publicar o check de fallback. Esse sucesso não
é uma atestação local assinada. Reexecutar o verificador sem uma prova válida
não resolve a ausência.

O perfil atual de `test-tasks.json` exige somente o nó `backend-kernel`, que
executa `ci:backend-kernel:local`. Os sete descritores originais permanecem
preservados. Os nove produtores nativos adicionais de C6 continuam diferidos
em conjunto; este fluxo não os ativa nem lhes atribui evidência.

## Preparar o candidato

Use uma worktree limpa, em branch nomeado e publicado. Para uma verificação
pós-integração, confirme que o SHA escolhido é o SHA remoto da main. O branch
de ensaio pode apontar para esse mesmo commit; não envie commits para a main.
Mantenha HEAD, upstream e branch remoto iguais durante prepare e publish.
Faça documentação ou novos registros em uma etapa posterior ou worktree separada.

Confirme Node `v24.15.0` e pnpm `9.15.0` na política de
[`toolchain`](../../../law/policy/devai-local-rc-toolchain.json).
A política de [`environment`](../../../law/policy/devai-local-rc-environment.json)
contém os hashes das variáveis permitidas. O script confere as versões e fornece
as variáveis protegidas de ensaio.
O Docker precisa estar disponível para o PostGIS descartável com imagem fixada.
Banco, seed e contexto de aplicação seguem o harness existente; nenhuma conexão
de produção é necessária.

As chaves Ed25519 aprovadas ficam fora do repositório, nos caminhos que o
script declara. A chave privada exige modo `0600`. Use a chave já autorizada;
não gere um substituto nem imprima ou copie seu conteúdo para logs ou commits.
Diretórios de bundle e controles existentes são imutáveis: sua presença exige
verificação do estado original, não exclusão para permitir uma nova tentativa.

## Executar, exportar e publicar

Declare o papel Inspector para a execução do check. O script usa o verbo
registrado `devai check --rc --run --as-role inspector --write`, mantém o timeout
original e só exporta após sucesso real. A publicação precisa estar coberta pela
autorização do trabalho em curso.

Guarde cada tentativa em um diretório novo, fora da worktree:

```sh
umask 077
mkdir -p "$HOME/.config/devai/evidence/detran"
detran_rc_audit_dir="$(mktemp -d "$HOME/.config/devai/evidence/detran/rc-observation.XXXXXX")"
detran_rc_candidate="$(git rev-parse HEAD)"
node --version
pnpm --version
pnpm devai:rc:prepare > "$detran_rc_audit_dir/prepare.log" 2>&1
```

Continue somente se prepare terminar com exit zero e devolver o bundle completo
para a árvore escolhida. Uma falha de teste, timeout ou exportação é preservada
com sua saída, receipt/diagnostic disponível e identidade do candidato; não se
transforma em PASS. Testes focados de diagnóstico não substituem a população RC.
Uma nova execução integral exige uma razão de diagnóstico explícita e preserva
a tentativa anterior, com assertions, população, flags e limites originais.

Na mesma worktree limpa e no mesmo commit:

```sh
pnpm devai:rc:publish > "$detran_rc_audit_dir/publish.log" 2>&1
```

O publisher verifica o bundle, usa a trust store existente, publica a referência
protegida e solicita o workflow oficial. Não escreva manifests, signatures,
receipts ou tags equivalentes à mão. Uma referência presente e inválida bloqueia;
ela não autoriza fallback, exclusão ou troca de tag.

## Confirmar o resultado remoto

O workflow oficial usa `exact-commit` em `workflow_dispatch` e `exact-tree` no
push da main. Uma prova válida do head do PR pode servir ao merge normal quando
as árvores forem idênticas, conforme os controles existentes. Após publish,
confira o run `workflow_dispatch` com binding `exact-commit`. Após integrar uma
árvore idêntica, confira o novo run `push` com binding `exact-tree`. Não altere o
modo de binding nem simule outro evento.

Localize o novo run de `devai-local-rc-verify.yml` para o SHA escolhido e confira
`headSha`, conclusão, job `Verify trusted local RC evidence`, artefato de
verificação e identidade da tag. O ID do run e o objeto da tag vêm das respostas
reais do GitHub, nunca de um valor previsto.

```sh
gh run list --repo aarusso-nyx/detran \
  --workflow devai-local-rc-verify.yml --commit "$detran_rc_candidate" \
  --limit 5 --json databaseId,headSha,event,status,conclusion,url
```

Sucesso de prepare ou publish sozinho não basta. O novo verificador deve concluir
com sucesso para o candidato exato e comprovar a prova assinada. Diferencie esse
resultado de um check `verified-local-rc` publicado pelo fallback remoto. Preserve
os runs anteriores que falharam e a CI principal como observações separadas.

Registre os resultados na rodada ativa pelo verbo oficial de evidência e confira
a cadeia depois de qualquer append:

```sh
pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human
pnpm devai:doctor
```

A atestação do backend não encerra automaticamente a rodada, não recompõe o
scorecard completo e não elimina lacunas de especificação, histórico ou segurança.
R-0036 a R-0039 permanecem encerradas; R-0041 e C6 seguem seus estados e gates
canônicos. `docs/dev/` é conteúdo local e não deve receber links de páginas
publicadas.
