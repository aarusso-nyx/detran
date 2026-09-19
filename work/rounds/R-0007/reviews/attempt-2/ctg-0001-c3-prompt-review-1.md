# Prompt do reviewer — recuperação de entrega CTG-0001 C3, ciclo 1

Você é o reviewer independente da orquestra rait-backend, R-0007, Claude Opus da família oposta ao
maestro. Papel constitucional: Auditor, soft gate da Constituição DEVAI Art. 18. Trabalhe somente em
leitura na worktree /Volumes/Thiamat II/stech/detran-worktrees/rait-backend. Responda somente com um
objeto JSON válido, sem markdown ou texto antes/depois. Dentro de strings, evite backticks e aspas
duplas.

## Contexto e escopo estrito

A revisão técnica de entrega do CTG-0001 falhou por defeitos de contrato, sensores e implementação.
O Architect materializou o plano corretivo C3 em quatro tarefas governadas, TASK-0019 a TASK-0022,
com aliases de arquivo TASK-0001-D1 a TASK-0004-D1. O Owner decidiu OD-R7-FJ0-001: F-J-0 é
fail-closed. Para remeter um caso, deve existir ao menos um vínculo TEAT_EVIDENCE válido e todos os
vínculos desse tipo devem ter mandatory=true; ausência total ou qualquer vínculo inválido ou não
obrigatório bloqueia com RAIT.REMIT_CHECKLIST_INCOMPLETE.

Revise exaustivamente os prompts, tarefas, composições e o contrato antes de qualquer worker C3. Use
os 13 itens do template e confirme em especial:

1. a decisão OD-R7-FJ0-001 está reproduzida sem ambiguidade e sem lógica fail-open;
2. os 15 highs da revisão técnica de entrega e os oito gaps adicionais do audit arquitetural têm
   responsabilidade, sensor RED, correção e gate atribuídos, sem lacuna entre as quatro tarefas;
3. TASK-0019 é uma etapa arquitetural fechada; TASK-0020 escreve testes reais PostgreSQL/HTTP e não
   implementação; TASK-0021 implementa contra sensores congelados; TASK-0022 fecha hooks e gates;
4. a ordem TASK-0019 -> PREP-CTG1-D1 -> TASK-0020 -> TASK-0021 -> TASK-0022 é inequívoca;
5. fronteiras de escrita são disjuntas onde necessário, sensores ficam imutáveis para o Engineer e
   geração de schema ocorre somente pelo gerador;
6. testes denominados integração/e2e exercitam PostgreSQL e HTTP reais, não fakes, mocks do
   repositório, transações simuladas ou invocação direta do controller;
7. identidade e transação vêm da infraestrutura DI/tenant vigente, sem arguments, Reflect metadata,
   construção manual de dependency ou database.tx fora da abstração autorizada;
8. persistência, concorrência, idempotência, precedência de erros, cardinalidade de eventos, WIP,
   pool/unit, marcos, documentos, prazo, pauta, devolução, retirada e recebimento CETRAN estão
   cobertos por sensores verificáveis;
9. os contratos HTTP, tokens de recurso, comandos, retornos, códigos de status e payloads de evento
   estão alinhados às referências canônicas;
10. hashes SHA-256 e pc_ids dos quatro prompts coincidem byte a byte com tasks e compositions.json;
11. modelos, esforços, max_iterations, dependências e status permitem execução governada;
12. o budget e o checkpoint estão aritmeticamente coerentes ou qualquer divergência está marcada
    como finding;
13. não existe decisão de produto nova delegada ao worker.

PASS exige nenhum finding high e libera TASK-0019. REVIEW significa high corrigível sem nova decisão
do Owner. FAIL significa contradição canônica, falta de autoridade ou fronteira irrecuperável. Não
avalie a implementação existente como se já fosse a correção; avalie se o pacote de execução força a
correção completa e verificável.

## Leitura fechada

- docs/meta/agents/orchestra/reviewer-prompt.template.md
- docs/meta/knowledge-base/steering.md, item 58 / OD-R7-FJ0-001
- docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-017.md
- work/rounds/R-0007/plan.md
- work/rounds/R-0007/contracts/CTG-0001.md, seção 10
- work/rounds/R-0007/reports/CTG-0001-DELIVERY-FAIL-AUDIT.md
- work/rounds/R-0007/reports/CTG-0001-C3-PLAN.md
- work/rounds/R-0007/reviews/attempt-2/delivery-review-CTG-0001-technical-retry.json
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
"cycle": "CTG-0001-C3-1",
"verdict": "PASS | REVIEW | FAIL",
"findings": [],
"notes": []
}
