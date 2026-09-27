# Runbook da stack local

Papel: Architect (transcricao)

Este runbook descreve o perfil observado `local-sandbox`, resolvido por
`pnpm stack:config`. Ele não habilita integração externa real, não contém
credenciais e não altera os perfis canônicos `fresh` ou `legacy-upgrade`.

## Pré-requisitos

- Node.js `>=24 <25` e pnpm `9.15.0`.
- Docker Desktop com Compose disponível e em execução. Em Apple Silicon, o
  PostGIS usa a plataforma `linux/amd64` por emulação.
- Acesso de leitura ao GitHub Packages:

  ```bash
  export NODE_AUTH_TOKEN="$(gh auth token)"
  pnpm install --frozen-lockfile
  ```

O arquivo `.env.example` é somente uma lista de overrides. O script não lê
`.env` nem `.env.example`; exporte manualmente cada override escolhido, sem
copiar o arquivo esperando ativar a configuração.

## Configuração resolvida

Execute primeiro, offline e sem segredo:

```bash
pnpm stack:config
```

O JSON usa o banco lógico `detran_local_stack`, loopback `127.0.0.1:5432`,
usuário `postgres`, volume `detran-local-stack-postgres`, imagem
`postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5`
e timeout padrão de 120 segundos. O `state_dir` é derivado de
`DETRAN_STACK_STATE_DIR` ou do diretório temporário do sistema; não o fixe em
documentação.

Não são overrides: `DB_HOST`, `DB_PORT`, `DB_USER`, `DETRAN_DB_IMAGE` e
`DETRAN_BACKEND_PORT`; se exportados, o script recusa a execução. O banco,
imagem e porta do backend são definidos pela stack.

## Portas e serviços

| Serviço       | Endereço                                         |
| ------------- | ------------------------------------------------ |
| SENATRAN mock | `127.0.0.1:3000`                                 |
| backend       | `127.0.0.1:3001`                                 |
| SEFAZ mock    | `127.0.0.1:3999`                                 |
| Portal        | `127.0.0.1:4200`                                 |
| RAIT          | `127.0.0.1:4201`                                 |
| Dashboard     | `127.0.0.1:4202`                                 |
| TEAT          | `127.0.0.1:4203`                                 |
| PEC           | `127.0.0.1:4204`, reservado e inativo até R-0031 |

Os dev servers encaminham `/v1` para o backend. O PEC aparece como
`not_built_r0031`; não é construído nem sondado enquanto seu projeto não
existir.

## Ciclo seguro

Com as dependências instaladas, use esta sequência:

```bash
pnpm stack:config
pnpm stack:db-reset
pnpm stack:start
pnpm stack:health
pnpm stack:smoke
pnpm stack:status
pnpm stack:logs backend
pnpm stack:stop
```

`stack:logs backend` acompanha os logs do backend até a interrupção pelo
operador.

`db-reset` atua somente em `detran_local_stack`: é destrutivo para esse banco
lógico descartável, aplica DDL e o perfil `fresh-local-stack`, mas não remove
volumes Docker. `db-init` é diferente: aplica DDL e seed sem recriar/resetar o
banco. Nunca use reset como migração de um volume antigo. Para esse caso,
pare a stack, crie um volume novo, exporte e importe os dados manualmente e
aponte `DETRAN_DB_VOLUME` para o volume escolhido; não há migração automática.

`stack:start` aguarda saúde limitada. Se faltarem os artefatos `dist` ignorados
de `@detran/ui` ou `@detran/boat-mobile`, execute antes:

```bash
pnpm --filter @detran/ui build
pnpm --filter @detran/boat-mobile build
```

Depois, repita `pnpm stack:start`; a ausência não deve ser mascarada por outra
configuração.

## Perfil e externos

O seed é `fresh-local-stack`. O smoke aplica, somente durante a própria prova,
uma fixture Portal sintética determinística no banco descartável; ela não é
parte de `fresh`, `legacy-upgrade` ou `fresh-local-stack`. O ator padrão recebe
somente `auth.users` e membership ativa: não acrescente roles ou permissões.

| Integração            | Estado observado                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------ |
| SENATRAN              | mock local via `senatran-adapter`, adapter-only                                            |
| SEFAZ                 | mock local em `3999`, seis rotas do adapter, dados determinísticos de teste (`OD-R17-001`) |
| PAdES clínico         | off; sondas declaradas retornam 503 (`OD-R17-002`)                                         |
| Biometria             | off; sondas declaradas retornam 503 (`OD-R17-002`)                                         |
| Conselho profissional | off; sondas declaradas retornam 503 (`OD-R17-002`)                                         |
| Banco                 | `createMockBankPort`, in-process                                                           |
| Assinador normativo   | `local-unsigned`, in-process e sem validade jurídica                                       |
| Autenticação          | `DetranLocalTokenVerifier`, in-process                                                     |
| VAPID                 | `source_pending` (`OD-P88`)                                                                |
| SNE                   | mock, somente via adapter                                                                  |

Os três 503 são resultado esperado apenas nas sondas declaradas do smoke; não
autorizam ignorar falhas gerais. Nenhuma credencial ou URL nacional entra no
runbook.

## Runtime e smoke

Portal, RAIT e Dashboard possuem `runtime-config.js` com exatamente três chaves
sem segredo: `tenantId`, `oidcAuthority` e `clientId`. TEAT mobile também possui
esse arquivo; TEAT web não possui `apps/teat/web/public/runtime-config.js`.

`pnpm stack:smoke` verifica raízes dos quatro frontends, chamadas de leitura
por `/v1`, saúde do backend e dos mocks e as três sondas CH desligadas. A prova
Portal usa a fixture sintética somente no smoke. A saída fica no diretório
resolvido por `DETRAN_STACK_STATE_DIR` (ou no temporário do sistema), em
`smoke-report.json` e `smoke-report.txt`; execuções com sufixo geram
`smoke-report-<sufixo>.json/.txt`.

## Diagnóstico

- `pnpm stack:status`: processos gerenciados, serviços Docker e URLs.
- `pnpm stack:health`: `/healthz` e `/readyz` do backend, `/health` dos mocks e
  raízes dos frontends ativos.
- `pnpm stack:logs <serviço>`: `db`, `mock`, `sefaz-mock`, `backend`, `portal`,
  `rait`, `dashboard` ou `teat`.
- `pnpm stack:config`: valores resolvidos, estados e matriz sem segredos.

Se o smoke falhar, confirme primeiro o status e a saúde, depois consulte os
logs do serviço culpado e reavalie a configuração. Não substitua falhas de
adapter, proxy, RLS ou policy por respostas vazias.
