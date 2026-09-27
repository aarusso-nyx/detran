# Iteracao corretiva — TASK-0006 (`engineer-backend`)

> Frente `local-stack`, R-0017, worktree
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. O runner grava
> `work/rounds/R-0017/reports/TASK-0006-delivery-ratify.md`. Nao execute
> git nem instale pacotes.

O PC deste prompt e o SHA-256 do arquivo, registrado em `compositions.json`
e `tasks/TASK-0006.json` antes do despacho. Registre esse PC no relatorio.

Papel constitucional: **Engineer** (Art. 7; Art. 6 para autoridade por
caminho). Declare `Papel: Engineer` primeiro. Leia somente `AGENTS.md`,
`CODESTYLE.md`, `docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0017/contracts/CTG-0002.md` C-02-01,
`work/rounds/R-0017/reviews/delivery-review-CTG-0002.json` somente o
achado em `backend/database/seed/40-fixtures-rait-org-fresh-local-stack.sql`,
`work/rounds/R-0017/reports/TASK-0006.md`,
`backend/database/ddl/36-inf-rait-session.sql` (linhas 421-470: gatilhos
das tabelas imutaveis, inclusive `inf.rait_minutes` e
`inf.rait_minutes_required_signer`),
`backend/database/seed/40-fixtures-rait-org.sql`,
`backend/database/seed/60-fixtures-rait-integration.sql`,
`backend/database/seed.sh` e os dois SQL
`backend/database/seed/{40-fixtures-rait-org-fresh-local-stack,60-fixtures-rait-integration-fresh-local-stack}.sql`.
Antes de consultar a adenda do maestro, derive do DDL a politica de
imutabilidade e examine todos os INSERTs em tabelas imutaveis das duas
fixtures. Depois leia `work/rounds/R-0017/reports/TASK-0006-maestro-adenda.md`
como evidencia historica provisoria, nao como conclusao vinculante.

Pode tocar somente os dois SQL novos `*-fresh-local-stack.sql` caso ache
correcao necessaria. Nao toque testes, `seed.sh`, DDL, contratos, docs,
planos, tools, apps, packages, `record/**`, `.devai/**`, `law/**`,
`docs/meta/adr/**`, `senatran-mock/**`, rounds anteriores ou arquivos
gerados. O maestro havia alterado em sua fronteira de Engineer o conflito
de `inf.rait_minutes` para `ON CONFLICT DO NOTHING` apos a primeira
tentativa de TASK-0006 falhar no banco scratch. Voce deve **avaliar e
ratificar independentemente** essa correcao ou conserta-la. A ata e
imutavel; `ON CONFLICT DO UPDATE` nao pode ser usado para mascarar falha.
Confirme que as duas fixtures locais continuam deterministicas,
idempotentes, com referencias somente a base fresh, sem historia legada.

Rode `pnpm format:check`; falhas fora dos dois SQL sao relatadas, nao
consertadas aqui. Se nao alterar os SQL, registre seus dois SHA-256 e
ratifique ou rejeite os bytes que a adenda mediu. Se alterar qualquer SQL,
o 3/3 historico deixa de provar o artefato entregue: rode novamente o
spec em PostGIS descartavel com banco scratch dedicado e teardown
documentado, ou reporte C-02-01 `PENDING/BLOCKED` sem ratificacao final.
Nao rode `db-reset` nem `--full` em banco nao scratch; nao toque no banco
persistente da stack. A adenda nao comprova de forma independente o
host:port do container; declare essa limitacao se usar sua medicao como
historico. Relate a regra exata
do gatilho que justifica `DO NOTHING`, se a linha imutavel esta correta,
se as novas linhas derivam apenas do escopo das fixtures-base e se ratifica
a mudanca sob este PC.

```markdown
Papel: Engineer
Tarefa: TASK-0006 iteracao corretiva
Arquivos criados/alterados: <lista ou nenhum>
Comandos e resultados: <um por linha>
Ratificacao independente de `ON CONFLICT DO NOTHING`: <sim/nao e motivo>
SHA-256 dos SQL ratificados: <40>, <60>
Estado C-02-01: <provado por medicao identificada | PENDING/BLOCKED>
Perfil e idempotencia: <conclusao>
Bloqueios: <nenhum ou descricao>
```
