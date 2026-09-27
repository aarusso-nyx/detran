# Retry 1 — TASK-0007 (`engineer-backend`)

> Worktree `/Users/aarusso/.codex/worktrees/local-stack/detran`, R-0017.
> Execute so este retry. Nao execute git, nao instale pacotes e nao rode
> `stack:db-reset` aqui. O runner grava
> `work/rounds/R-0017/reports/TASK-0007-retry-1.md`.

Papel constitucional: **Engineer**. Declare `Papel: Engineer` primeiro.
Leia `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0017/contracts/CTG-0002.md` §C-02-04…06,
`work/rounds/R-0017/prompts/TASK-0007.md`,
`work/rounds/R-0017/reports/TASK-0007.md` e
`work/rounds/R-0017/reports/TASK-0005-escalation.md` (o relatorio existe
nesse caminho, apesar da nota equivocada da primeira tentativa). Leia
`tools/stack/smoke.mjs`, `tools/detran-stack.sh`,
`tools/stack/contract.test.mjs`, `backend/domains/ch/**/src` somente para
controllers, DTOs, services e repositories da matriz C-02-04,
`backend/database/ddl/40-ch-clinical-network.sql` ate
`45-ch-biometrics.sql`, e `backend/database/seed/00-fixtures-core.sql`
para IDs do tenant e ator local. Consulte `backend/domains/shared/src/policy.ts`
para roles reais. Nao adivinhe corpos nem FKs.

Pode alterar somente `tools/detran-stack.sh`, `tools/stack/smoke.mjs`,
novos scripts de producao sob `tools/stack/` (incluindo fixture CH) e,
se necessario, `package.json` para comando ja previsto. Nao altere testes,
backend, seed RAIT, frontends, contratos, docs, plans, record, law ou CI.

## Lacuna a resolver

A primeira tentativa passou `pnpm test:stack` 48/48, mas a CLI ficou
`ch: []`, nao prepara fixture CH, nao troca persona e nao prova os tres
503 reais. Isso bloqueia C-02-04/06. Preserve a factory `runSmoke({targets,
fetchImpl})` e seus sensores offline. Complete a CLI para:

1. Fazer preflight de backend `/healthz` **antes** de qualquer SQL ou restart;
   backend parado gera `backend_unreachable`, relatorio final tabela+JSON e
   exit nao-zero. Nenhuma fixture CH roda nesse caso.
2. Rodar fases por persona usando somente overrides `DETRAN_LOCAL_ROLES`:
   Portal `AUDITOR`, RAIT `rait-coordinator`, Dashboard `dash-operator`,
   TEAT `field-agent`, PAdES `MEDICO`, biometria um role permitido por
   `ch:biometric:capture`, conselho `ADMIN_CLINICA`. Reiniciar so backend
   que preflight encontrou ativo, com cleanup trap e restaurar os cinco
   roles default no fim, inclusive apos falha. Nao alterar RLS/policy.
3. Preparar fixture CH sintetica, deterministica e idempotente em script
   separado sob `tools/stack/`. Usar somente `DB_NAME=detran_local_stack`,
   com a guarda de `detran-stack.sh` antes de todo `psql`. Recusar outro
   DB_NAME com mensagem `die`, exit nao-zero e nenhum SQL. A fixture deve
   satisfazer as precondicoes PAdES e biometria da tabela C-02-04; conselho
   pode chegar ao adapter sem fixture, se DTO valido e cache inedito.
   Prove no relatorio comando com DB_NAME diverso, exit e mensagem. Para
   conselho, reutilize a clinica da fixture ou justifique explicitamente a
   ordem `ensureCouncilCached` antes de `assertActiveClinic` no service.
4. Enviar POSTs CH validos **via proxy frontend** com bearer local e bodies
   /IDs da fixture, nunca direto em `backend.url`. Exigir os tres 503 com
   mensagem exata dos adapters do contrato; 400/401/403/404/409 ou 503
   anterior ao adapter vira `blocked_before_adapter`, exit nao-zero e
   diagnostico de passo/status. Nao simule 503.
5. Para os quatro GET `/v1`, verifique fixture concreta e tenant, alem de
   JSON nao vazio; `rait-web` usa seu serve real. Dashboard envia
   `?layer=N1` e verifica `items[]` nao vazio, cada `item.layer === 'N1'`
   e ID de alerta concreto de `81-fixtures-dashboard-state.sql`; o
   payload real nao tem `body.layer`. Prove tenant pelo header
   `x-detran-tenant-id` e por ID publico semeado sob `...a001`/RLS;
   confira `tenantId` no payload somente quando ele existir. Os novos
   matchers de ID/layer e metadados CH sao campos opcionais dos targets,
   usados na CLI; preserve compatibilidade com a fixture offline do
   Inspector, que nao os fornece. Nao substitua IDs por labels
   genericos na validacao **nem na evidencia persistida**: grave persona
   real (codigo de role), IDs publicos da fixture, rota, policy key e
   precondicao cumprida por linha, sobretudo nas sondas CH. Use codigos
   neutros como `adapter_unconfigured` e `signing_url_absent`, nunca texto
   que contenha as palavras proibidas. Remova a
   substituicao generica em `evidenceRow()`. A evidencia permanece sem
   header, `Bearer` nem palavras `token/password/secret`.
6. Evidencia e PID/restart usam o mesmo STATE_DIR resolvido por
   `detran-stack.sh` (`${TMPDIR:-/tmp}/detran-stack` no default macOS), via
   wrapper que exporte `DETRAN_STACK_STATE_DIR` ou resolucao identica em
   `smoke.mjs`. Cada fase pode gravar arquivo sufixado, mas grave no fim
   tabela e JSON agregados de nome estavel com `complete = AND` das fases.
   O negativo
   do preflight tambem grava esse final. Nao grave segredo, URL com
   userinfo nem credencial de banco.

Rode `pnpm test:stack`, `pnpm format:check` e os comandos offline que
comprovem a guarda, sem iniciar stack nem resetar DB. Se nao for possivel
fechar PAdES/biometria, registre a precondicao exata faltante, rota,
status e proposta de adenda/OD; nao declare C-02-04 verde. O maestro faz
`pnpm check`, live smoke e checkpoint (b) em worktree limpa depois.

Entrega:

```markdown
Papel: Engineer
Tarefa: TASK-0007 retry 1
Arquivos criados/alterados: <lista>
Comandos e resultados: <um por linha>
C-02-04/05/06: <PASS/FAIL, offline vs live>
Guarda outro banco: <comando, exit, mensagem>
Processos ao final: <IDs ou nenhum>
Bloqueios e adenda/OD proposta: <nenhum ou descricao>
```
