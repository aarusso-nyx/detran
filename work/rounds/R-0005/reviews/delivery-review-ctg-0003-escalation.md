# Revisão de entrega de escalada — CTG-0003

Você é o reviewer Auditor da família oposta para a orquestra ops-agency, rodada R-0005. Trabalhe
somente em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda
apenas com um objeto JSON RFC 8259 estrito, sem Markdown, texto anterior ou posterior e sem
caracteres de crase dentro de valores string.

## Leitura e rubrica vinculantes

Leia, nesta ordem:

1. `docs/meta/agents/orchestra/reviewer-prompt.template.md`, aplicando integralmente o modo
   `delivery-review` e seus 13 itens;
2. `docs/framework/arch/teat-build-pack.md`, somente WP-T1 e seu mapa de definições;
3. `work/rounds/R-0005/plan.md`;
4. `work/rounds/R-0005/contracts/CTG-0002.md`, apenas para as autoridades de vocabulário usadas
   pelas fixtures;
5. `work/rounds/R-0005/reports/TASK-0008.md`;
6. `work/rounds/R-0005/reviews/delivery-review-ctg-0003.json` e
   `work/rounds/R-0005/reviews/delivery-review-ctg-0003-2.json`;
7. os arquivos CTG-0003 modificados mostrados pelo diff abaixo.

Inspecione o diff completo atual com:

    git diff HEAD -- backend/database/seed/10-fixtures-inf-ait.sql backend/database/seed/25-fixtures-teat.sql work/rounds/R-0005/reports/TASK-0008.md work/rounds/R-0005/tasks/TASK-0008.json

O comando é o anexo integral por referência imutável ao estado da worktree desta chamada; não
revise CTG-0002 nem artefatos de reviews anteriores como produto.

## Histórico obrigatório a confirmar

O ciclo 1 retornou REVIEW com três highs: vocabulário de cancelamento sem autoridade, seleção
oculta da linha-base do AIT e hash/protocolo antes dos marcos legais. O ciclo 2 confirmou esses
highs fechados, mas retornou REVIEW porque 7455-0 fora invertido para caso_1 sem autoridade. Seus
lows pediram source_pending para usage_mode, roteamento do dispositivo não autorizado distinto,
backend:test:ci final e convergência integral dos upserts.

A escalada preservou 5541-0 em caso_1 e a semântica anterior de 7455-0 em caso_2; declarou a ficha
MBFT definitiva como source_pending; usa literalmente source_pending em usage_mode; tornou todos
os upserts convergentes; e roteou a postura não autorizada distinta para WP-T2 porque não há token
persistido no contrato WP-T1. A fixture continua determinística e idempotente.

Evidência final já observada pelo maestro: apply completo PASS; seed executado duas vezes PASS;
consulta independente 17/17 PASS; estados cancelled, consumed, expired e reserved presentes; RLS
smoke PASS; backend:test:ci PASS completo; pnpm check PASS completo.

Faça revisão nova e independente: confirme fechamento de cada high anterior e procure regressões
novas. Não transforme a fixture de postura de WP-T2 explicitamente roteada em high sem apontar uma
definição WP-T1 vinculante violada.

## Saída

Use exatamente as chaves `mode`, `round`, `verdict`, `findings`, `notes`. `mode` deve ser
`delivery-review`, `round` deve ser `R-0005`; verdict é `PASS`, `REVIEW` ou `FAIL`. Cada finding
tem `severity`, `item`, `file`, `line`, `claim`, `fix`. PASS exige zero highs.
