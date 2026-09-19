# Prompt do reviewer — recuperação de entrega CTG-0001 C3, ciclo 2

Você é o reviewer independente da orquestra rait-backend, R-0007, Claude Opus da família oposta ao
maestro. Papel constitucional: Auditor, soft gate da Constituição DEVAI Art. 18. Trabalhe somente em
leitura na worktree /Volumes/Thiamat II/stech/detran-worktrees/rait-backend. Responda somente com um
objeto JSON válido, sem markdown ou texto antes/depois. Dentro de strings, evite backticks e aspas
duplas.

## Escopo estrito

O ciclo C3-1 retornou REVIEW com quatro highs e cinco lows. Verifique o fechamento de todos eles,
sem reabrir os 23 achados já mapeados salvo evidência nova concreta:

1. o relatório CTG-0001-C3-PLAN preserva o histórico, mas o marca inequivocamente supersedido por
   OD-R7-FJ0-001 e não instrui mais nenhum worker a manter RG-FJ0-EMPTY aberta;
2. F-J-0 é literal e uniforme: existe ao menos um link válido; um único link válido satisfaz o piso
   mesmo quando mandatory=false; todos os links mandatory=true devem ser válidos; vazio, nenhum
   válido ou obrigatório ausente/inválido bloqueia com RAIT.REMIT_CHECKLIST_INCOMPLETE;
3. validade usa link/evidência do mesmo tenant do caso, entity_type inf.ait_ait e entity_id do AIT;
   status aceitos são somente validated, linked e packaged, com storage_uri, hash_algorithm e
   hash_value não vazios. Os demais status do DDL falham fechado;
4. UC-TEAT-003 e BP-OPS-EVIDENCE-001 entraram na leitura dos quatro workers e o Inspector possui
   sensores nomeados para vínculo único não obrigatório, vazio, nenhum válido, obrigatório
   ausente/inválido e múltiplos obrigatórios;
5. janela 9 foi encerrada em 600k; janelas 10/11 continuam reservadas; janela 12 contém C3-2 e
   entradas nominais TASK-0019 a TASK-0022. Totais declarados devem igualar a soma das entradas;
6. hashes SHA-256/pc_ids dos quatro prompts devem coincidir byte a byte em tasks e compositions;
7. C3-1 gateia TASK-0019 e C3-2 só é necessário se esta alterar contrato/prompts; nenhum ciclo é
   consumido silenciosamente;
8. cetran-receipt.schema.spec.ts e documents.spec.ts são sensores imutáveis must-stay-green;
9. TASK-0020 distingue RED contratual de BLOCKED ambiental e contém typechecks verdes além das
   suites RED;
10. plan.md e budget.json concordam sobre o checkpoint e o próximo dispatch.

PASS exige nenhum finding high e libera TASK-0019. REVIEW significa high corrigível sem decisão
nova do Owner. FAIL significa contradição canônica, falta de autoridade ou fronteira
irrecuperável.

## Leitura fechada

- docs/meta/agents/orchestra/reviewer-prompt.template.md
- docs/meta/knowledge-base/steering.md, item 58 / OD-R7-FJ0-001
- docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-017.md
- docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-003.md
- docs/framework/blueprints/BP-OPS-EVIDENCE-001.json
- backend/database/ddl/17-ops-evidence.sql
- work/rounds/R-0007/plan.md
- work/rounds/R-0007/contracts/CTG-0001.md, seção 10
- work/rounds/R-0007/reports/CTG-0001-C3-PLAN.md
- work/rounds/R-0007/reviews/attempt-2/ctg-0001-c3-prompt-review-1.json
- work/rounds/R-0007/budget.json
- work/rounds/R-0007/compositions.json
- work/rounds/R-0007/tasks/TASK-0001-D1.json
- work/rounds/R-0007/tasks/TASK-0002-D1.json
- work/rounds/R-0007/tasks/TASK-0003-D1.json
- work/rounds/R-0007/tasks/TASK-0004-D1.json
- work/rounds/R-0007/prompts/TASK-0001-D1.md
- work/rounds/R-0007/prompts/TASK-0002-D1.md
- work/rounds/R-0007/prompts/TASK-0003-D1.md
- work/rounds/R-0007/prompts/TASK-0004-D1.md

Use exatamente estas chaves e tipos:

{
"mode": "prompt-review",
"round": "R-0007",
"attempt": 2,
"cycle": "CTG-0001-C3-2",
"verdict": "PASS | REVIEW | FAIL",
"findings": [],
"notes": []
}
