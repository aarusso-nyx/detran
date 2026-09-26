# Iteração restrita 2 — `TASK-0002` (`inspector-tests`) — delivery-review-CTG-0001

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca escreva código de produção. Declare na primeira linha: **Papel: Inspector**.

Continuação de `work/rounds/R-0018/prompts/TASK-0002.md` (mesmas regras, fronteira e formato de
entrega), restrita aos três achados de `work/rounds/R-0018/reviews/delivery-review-CTG-0001.json`.

## Leitura (lista fechada)

1. `work/rounds/R-0018/reviews/delivery-review-CTG-0001.json` (os 3 achados)
2. `work/rounds/R-0018/contracts/CTG-0001.md` §3.4 (§Aliases), §6.5, §7.1 (C-01-05), §7.2 (C-01-11),
   §7.3 (C-01-15/16), §9.1 e §9.2 (linhas da série `law/adr` entre crases), §Adendas
3. `tools/docs/state-index/tests/gate.test.mjs`, `tools/docs/state-index/tests/fixture.mjs`
4. `DESIGN-DECISIONS.md` e `docs/meta/adr/README.md` (forma real das linhas da série `law/adr`)

## Pode tocar

`tools/docs/state-index/tests/**` — somente **acrescentar** casos (e, se preciso, variantes de fixture
no próprio `fixture.mjs` sem mudar o comportamento dos casos existentes). Nenhum teste existente é
removido, relaxado ou alterado.

## Tarefa

Acrescentar os negativos que faltam, com o id do critério no nome:

1. **C-01-05** — linha de §Aliases com ID trocado na coluna 1 (`Número antigo`) → achado; com ID
   trocado na coluna 3 (`Número novo`) → achado; linha obsoleta (alias sem stub correspondente) →
   achado.
2. **C-01-15 / C-01-16** — linha da série `law/adr` na forma real (caminho entre crases, sem link) com
   status divergente do arquivo (ex.: `Proposed` para uma ADR `Accepted`) → achado em cada índice; e
   ID exibido divergente (`LAW-ADR-0002` citando `law/adr/ADR-0001-…`) → achado.
3. **C-01-11** (modo `migrated`) — stub em `law/adr/` válido mas sem linha em §Aliases → achado;
   linha remanescente da série `law/adr` nos índices (entre crases) no modo `migrated` → achado.

## Critérios de aceitação

- `node --test 'tools/docs/state-index/tests/*.test.mjs' 'tools/docs/adr/tests/*.test.mjs'` → todos
  os testes anteriores continuam passando; os novos negativos que o `check.mjs` atual não detecta
  **falham** (relate quais falham e a saída) — é o sinal de que detectam.
- `node_modules/.bin/prettier --check tools/docs/state-index/tests` → OK.

Entrega: relatório no formato de `TASK-0002.md` §Entrega, com `Tarefa: TASK-0002 (iteração 2)`.
