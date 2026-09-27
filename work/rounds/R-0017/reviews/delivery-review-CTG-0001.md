# Reviewer — `delivery-review` CTG-0001, ciclo 1

> Frente `local-stack`, R-0017. Papel constitucional: **Auditor** (Art. 18),
> modelo `claude-opus-5-5` da familia oposta. Somente leitura em
> `/Users/aarusso/.codex/worktrees/local-stack/detran`. Responda apenas JSON
> estrito no formato abaixo, sem Markdown. Este primeiro ciclo e exaustivo:
> liste todos os achados verificaveis de CTG-0001, com arquivo e linha.

## Fontes fechadas

1. `docs/meta/agents/orchestra/README.md` §4–5 e
   `docs/meta/agents/README.md` §Regras comuns.
2. `work/campaigns/C-0002-consolidacao.md` §2 linha R-0017 e §4;
   `work/rounds/R-0017/plan.md` §Metas, §Tarefas, §Criterios, §Mapa,
   §Adendas, §Decisoes do maestro e §Triagem.
3. `work/rounds/R-0017/contracts/CTG-0001.md` inteiro, inclusive Adenda 1.
4. `work/rounds/R-0017/reports/TASK-0001.md`, `TASK-0002.md`,
   `TASK-0002-retry-1.md`, `TASK-0002-escalation.md` e `TASK-0003.md`.
5. O diff completo da worktree contra `HEAD` para
   `tools/detran-stack.sh`, `tools/detran-stack.proxy.json`,
   `tools/stack/`, `backend/database/apply.sh`, `package.json` e
   `docs/meta/knowledge-base/open-decisions-rait.md`. Use `git diff --stat
HEAD`, `git diff HEAD -- <caminhos>` e leia explicitamente os arquivos
   novos ainda nao rastreados em `tools/stack/`. O commit de adocao verbatim
   e `470730d60fa5a07fab486d6570a1ed2457c35f0e`; `git show --stat` e
   leitura somente. Nao inclua arquivos de outra frente.

`pnpm test:stack` passou 26/26, `pnpm -s stack:config` retornou JSON e
`pnpm format:check` passou. O primeiro `pnpm check` do worker foi interrompido
após uma espera longa; o maestro esta repetindo esse gate de forma independente.
Nao trate esse gate como verde ate haver resultado final.

## Rubrica

1. Tríade Architect → Inspector → Engineer e fronteiras de arquivo/papel.
2. Todos os C-01-01…13 e Adenda 1 satisfeitos, sem `depois` nao registrado.
3. Banco `detran_local_stack` e flag exclusiva antes de DDL/conexao; casos
   antigos intactos; nenhum volume removido; migracao de volume documentada.
4. PostGIS pinado ao digest do CI e plataforma; variaveis aceitas/rejeitadas
   conforme esquema fechado de `config`, sem senha ou URL com credencial.
5. Compose mock publicado **somente** em loopback, versao minima verificada
   antes de `up`, espera limitada de saude e diagnostico do servico culpado.
6. `start --no-mock` desabilita o mock tambem em `health`/espera/config;
   falha de `start` nao deixa processos perdidos da stack.
7. Quatro frontends e slot PEC; RAIT usa o build target proprio; estado e
   comandos de `status`/`config` correspondem ao runtime real.
8. Testes sao sensores honestos, deterministas e offline; nenhum gate/teste
   enfraquecido, `skip` ou artefato gerado editado a mao.
9. Externos no perfil local nao usam servicos reais; SENATRAN so pela porta
   `packages/senatran-adapter`; nenhuma credencial real ou valor normativo
   inventado. ODs citadas no registro canonico no mesmo PR.
10. A revisao preserva todos os checks existentes de `pnpm check`, inclusive
    os adicionados por R-0018 quando `origin/main` for integrado.

Veredito `PASS` se nao ha `high`; `REVIEW` se ha `high` corrigivel pelo
Engineer ou maestro sem mudar o plano; `FAIL` apenas para contradicao
canonica/Owner/ADR/Constituicao ou violacao de fronteira. Achados baixos nao
bloqueiam. Mantenha `notes` curtas; em `findings` cite linha e correcao
especifica. Nao afirme que um gate pendente passou.

## Saida

```json
{
  "mode": "delivery-review",
  "round": "R-0017",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 2,
      "file": "tools/detran-stack.sh",
      "line": 100,
      "claim": "descricao verificavel",
      "fix": "correcao precisa"
    }
  ],
  "notes": ["observacoes nao bloqueantes"]
}
```
