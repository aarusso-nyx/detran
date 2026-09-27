# Correcao 1 — TASK-0002 (`inspector-tests`)

> Frente `local-stack`, rodada `R-0017`, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Esta e a unica
> tentativa corretiva do checkpoint da TASK-0002. Execute somente este escopo.
> Nunca execute `git`, `stack:start`, `db-reset` real, Docker daemon ou Postgres.
> O runner grava o relatorio em `reports/TASK-0002-retry-1.md`.

## Papel e leitura fechada

Papel constitucional: **Inspector** (Art. 6/7). Declare `Papel: Inspector` na
primeira linha. Leia somente `AGENTS.md`, `CODESTYLE.md` §Tests,
`docs/meta/agents/inspector-tests.md`, `prompts/TASK-0002.md`,
`contracts/CTG-0001.md` (incluindo Adenda 1), os dois arquivos
`tools/stack/{characterization,revision}.test.mjs`,
`reports/TASK-0002.md`, `tools/detran-stack.sh`, `tools/detran-stack.proxy.json`,
`backend/database/apply.sh` ate o `case --full`, `package.json` scripts
`stack:*`, os quatro manifests Angular apenas `projects`/`serve`,
`senatran-mock/docker-compose.yml` e `.github/workflows/ci.yml` somente
PostGIS. As falhas abaixo sao o diagnostico do maestro; nao procure fora.

## Pode tocar

Somente `tools/stack/characterization.test.mjs` e
`tools/stack/revision.test.mjs`. Nenhum arquivo de producao, contrato, prompt,
plano, governanca, gerado ou teste preexistente. Nao altere assercoes so para
faze-las verdes: conserte o sensor para refletir CTG-0001 e Adenda 1.

## Correcoes obrigatorias

1. Remova da suite **persistente** a assercao de SHA do script/proxy e o hash
   de diff guardado como constante; C-01-01 e prova pontual do maestro no
   checkpoint (a). Preserve as nove entradas `stack:*` e os demais invariantes
   que devem sobreviver TASK-0003. A caracterizacao deve ficar verde antes e
   depois da revisao. Troque a assercao tautologica `port === port` por leitura
   observavel das portas na stack ou remova-a se ja houver cobertura real.
2. Isole **todos** os `spawnSync` de comandos potencialmente ativos com
   `DETRAN_STACK_STATE_DIR` temporario proprio e `PATH` que anteponha stubs
   locais para `docker`, `pnpm`, `psql` (e outros executaveis com efeito real).
   Nao inicie Docker/Compose/DB/rede nem mesmo numa tentativa intermediaria.
   Stubs devem falhar inesperados e permitir apenas as chamadas necessarias
   ao teste. Use `writeFileSync` e `mkdtempSync`, nao um caminho fixo nem
   `rm -rf` externo. Limpe apenas diretorios criados pelo teste.
3. O teste de Compose precisa validar o override **efetivo**, nao um stub
   `docker` que sempre devolve o JSON esperado. `docker compose ... config
--format json` e leitura offline permitida, sem daemon; parseie a saida
   real e verifique uma unica publicacao loopback. Mantenha o gate da versao
   minima no contrato. Se a CLI Compose nao existir, reporte bloqueio, nao
   faca `skip` nem fabrique resultado.
4. `revision.test.mjs` deve falhar agora por funcionalidade ausente e poder
   ficar verde apos TASK-0003. Teste JSON via `pnpm -s stack:config` ou script
   direto, conforme Adenda 1; injete uma senha falsa e verifique que ela nao
   aparece no JSON. Nao aplique `assertNoSecrets` sobre o **codigo-fonte**,
   que legitimamente contem os nomes `DB_PASSWORD`/`TOKEN`.
5. Nao proiba `sefaz` no script inteiro: `config.providers.sefaz.state` deve
   ser `pending`. Garanta que apenas `health` e a espera de `start` nao sondem
   SEFAZ em CTG-0001. Teste o estado PEC por saida real de `status` com stubs;
   cheque o comando RAIT efetivo via `config` ou dry-run, nao por mera presenca
   de string no fonte. Preserve negativos de `apply.sh` e a cobertura
   restante de C-01-05…13, com casos executaveis offline onde possivel.
6. O relatorio da primeira tentativa afirmou que Docker nao foi executado;
   o transcript mostra que uma iteracao do teste `start --no-mock` chamou
   Docker e tentou `psql` local. Reconheca isso com exatidao no relatorio
   corretivo. O maestro confirmou ausencia de container/processo restante.

## Aceitacao

- `node --test tools/stack/characterization.test.mjs`: todos verdes sobre os
  bytes verbatim, sem Docker daemon, banco ou rede.
- `node --test tools/stack/revision.test.mjs`: vermelhos **esperados** apenas
  por funcionalidade ainda ausente; liste cada um. Nenhum `skip`/`todo`.
- `pnpm format:check`: exit 0.
- `rg -n 'detran_r13' tools/`: vazio.

Nao execute `git`; nao toque arquivos fora do escopo, nao instale dependencias
e nao deixe processos em segundo plano. O Engineer ainda nao comecou, entao
esta correcao nao exige adenda sobre testes apos implementacao.

## Entrega

```markdown
Papel: Inspector
Tarefa: TASK-0002 (correcao 1)
Arquivos criados/alterados: <lista>
Comandos executados e saida resumida: <um por linha>
Criterios de aceitacao: <PASS/FAIL por criterio>
Fora do escopo / deixado: <o que e por que>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descricao>
```
