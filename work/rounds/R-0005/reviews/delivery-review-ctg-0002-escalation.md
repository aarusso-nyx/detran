# Revisão de entrega de escalada — CTG-0002

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
4. `work/rounds/R-0005/contracts/CTG-0002.md`;
5. `work/rounds/R-0005/reports/TASK-0005.md`, `TASK-0006.md` e `TASK-0007.md`;
6. `work/rounds/R-0005/reviews/delivery-review-ctg-0002-2.json`;
7. todos os arquivos CTG-0002 modificados mostrados pelo diff abaixo.

Inspecione o diff completo atual com:

    git diff HEAD -- backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts backend/database/ddl/14-inf-lifecycle-vocabulary.sql backend/database/ddl/30-inf-normative.sql backend/database/ddl/31-inf-ait.sql backend/database/ddl/32-inf-measures.sql backend/database/ddl/33-inf-alcohol.sql backend/domains/inf/ait backend/domains/inf/alcohol backend/domains/inf/measures backend/domains/inf/normative docs/framework/blueprints/BP-INF-AIT-001.json docs/framework/blueprints/BP-INF-ALCOHOL-001.json docs/framework/blueprints/BP-INF-MEASURES-001.json docs/framework/blueprints/BP-INF-NORMATIVE-001.json docs/framework/contracts/BP-INF-AIT-001.openapi.json docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json docs/framework/contracts/BP-INF-MEASURES-001.openapi.json docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json tools/blueprints/generated-files.json tools/check-lifecycle-vocabulary.ts work/rounds/R-0005/contracts/CTG-0002.md work/rounds/R-0005/reports/TASK-0005.md work/rounds/R-0005/reports/TASK-0006.md work/rounds/R-0005/reports/TASK-0007.md work/rounds/R-0005/tasks/TASK-0005.json work/rounds/R-0005/tasks/TASK-0006.json work/rounds/R-0005/tasks/TASK-0007.json

O comando é o anexo integral por referência imutável ao estado da worktree desta chamada; não
revise CTG-0003 nem artefatos de reviews anteriores como produto.

## Histórico obrigatório a confirmar

O primeiro payload não materializou veredito por erro de serialização. O primeiro review
materializado retornou FAIL com cinco highs: reject alcançava CANCELADO_RASCUNHO; REJEITADO era
terminal; remoção pulava CONVERTIDO_REMOCAO; REGULARIZADO era inalcançável; cancelamento de medida
não possuía autoridade registrada. Os lows eram CHECK/status do pedido, teste de transição fraco e
tipo bool.

A escalada alterou o contrato e a implementação para: reject sempre REJEITADO; cancelamento
pós-final por pedido/evento apenso; REJEITADO não terminal; pedido com estados fechados; release
com prazo em LIBERADO_COM_PRAZO e sem prazo em LIBERADO_LOCAL; remoção registrando
CONVERTIDO_REMOCAO e depois REMOVIDO; conclusão alcançando REGULARIZADO; cancel de medida
fail-closed sob OD-T13; boolean canônico; gate de terminalidade e testes negativos explícitos.

Evidência final já observada pelo maestro: AIT unit 5/5 PASS; Measures unit 7/7 PASS;
backend:test:ci PASS completo; pnpm check PASS completo; blueprints/contratos sincronizados;
verify:rls-ddl 159 tabelas; verify:lifecycle-vocabulary 17 estados AIT; fronteira SENATRAN PASS.

Faça revisão nova e independente: confirme fechamento de cada high anterior e procure regressões
novas. Não transforme lows de WP-T2 explicitamente roteados em high sem apontar uma definição
WP-T1 vinculante violada.

## Saída

Use exatamente as chaves `mode`, `round`, `verdict`, `findings`, `notes`. `mode` deve ser
`delivery-review`, `round` deve ser `R-0005`; verdict é `PASS`, `REVIEW` ou `FAIL`. Cada finding
tem `severity`, `item`, `file`, `line`, `claim`, `fix`. PASS exige zero highs.

REGRA DE TRANSPORTE INEGOCIÁVEL: o primeiro byte da resposta deve ser `{` e o último byte deve ser
`}`. Não escreva `json`, três acentos graves, fence Markdown ou qualquer caractere fora do objeto.
Uma resposta semanticamente correta cercada por fence é erro de sensor e será descartada.
