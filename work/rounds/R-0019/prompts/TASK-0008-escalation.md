# Escalação Architect — TASK-0008, revisão semântica da proposta product

Papel constitucional: **Architect**. Trabalhe na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Esta é a escalação da TASK-0008 após a tentativa inicial bloqueada por lista de leitura e a iteração Luna que produziu os 40 JNY e seis bundles. Nunca execute git. Não instale pacotes. Preserve toda fonte em `docs/framework/**`.

## Leitura obrigatória fechada

- `docs/meta/agents/transcriber-docs.md`
- `AGENTS.md`, `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0002.md`
- `work/rounds/R-0019/reports/TASK-0008-initial-blocked.md`
- `work/rounds/R-0019/reports/TASK-0008-iteration1.md`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/journey.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/use-cases.schema.json`
- `product/journeys/JNY-*.json`, `product/use-cases/*.json`, `product/README.md`, `product/specification.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-*.md`, `docs/framework/product/domains/ch/pec/use-cases/UC-*.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-*.md`, `docs/framework/product/domains/est/boat/use-cases/UC-*.md`
- `docs/framework/product/domains/inf/rait/journeys/JRN-*.md`, `docs/framework/product/domains/inf/rait/use-cases/UC-*.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-*.md`, `docs/framework/product/domains/inf/teat/use-cases/UC-*.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-*.md`, `docs/framework/product/transversal/dashboard/use-cases/UC-*.md`
- `docs/framework/product/transversal/portal/journeys/JRN-*.md`, `docs/framework/product/transversal/portal/use-cases/UC-*.md`

## Pode tocar

- `product/journeys/JNY-*.json`
- `product/use-cases/*.json`
- `product/README.md`
- `product/specification.md`

Não toque qualquer outro caminho. Em especial, não toque testes, gate, contrato, docs de origem, `law/**`, `record/**` ou `.devai/**`.

## Achados e tarefa

A iteração anterior acertou 40 JNY, 110 UC, todos os IDs e títulos de fonte, caminhos de proveniência e links. `devai check --only journeys` passou 40/40 e `pnpm format:check` passou. Ela derivou mecanicamente `preconditions` da abertura de persona e `postconditions` do último passo narrativo em **todos os 40 JNY**. Isso produziu classificação falsa: JNY-008 usa a regra contínua de alternância app/cena como postcondition; JNY-040 usa uma instrução sobre não prometer SLA como postcondition, e seu desejo de ver os dados é gatilho, não precondition. Faça revisão semântica de **todos os 40** contra cada JRN. Coloque em `preconditions` apenas estado/requisito prévio explicitamente declarado pela fonte, e em `postconditions` apenas resultado/estado final explícito. Use `[]` quando não houver. Não converta gatilho, motivação, contexto ou restrição contínua em pré/pós-condição. Preserve os passos narrativos em ordem, com ação real e condições materiais, e AC sustentados por métricas da JRN; um passo não pode ser só cabeçalho nem texto truncado.

Revise também `cases[].actors` e `roles` dos seis bundles. `goal` guarda o objetivo; actor/role guarda apenas designação de ator declarada na ficha, sem frase de objetivo, condição de turno, prazo ou artefato de parser. O corpus possui variações de cabeçalho, inclusive UC-PEC-012 `Atores e fronteiras`. Quando a própria fonte declara qualificação do ator (p. ex., órgão ou instância), preserve-a sem transformar frase completa em role. Confirme que cada ator do case aparece em `roles`, todos os títulos batem exatamente com frontmatter e 110 IDs estão nos bundles corretos. Preserve `draft` e não invente regra nem expansão. Qualquer lacuna vai ao relatório como `source_pending`/OD proposta, não a conteúdo falso.

Formate apenas arquivos autorais que tocar. Execute `pnpm exec devai check --only journeys --repo-root . --format json` (40/40 sem erros), `pnpm format:check` (exit 0) e uma auditoria local de contagens 40/110. Entregue relatório no formato: Papel; Tarefa; Arquivos; Comandos e saída; Critérios PASS/FAIL; Fora do escopo; OD; Bloqueios. Indique quantos JNY ficaram com preconditions/postconditions não vazias e liste os JNY cujas classificações mudou.
