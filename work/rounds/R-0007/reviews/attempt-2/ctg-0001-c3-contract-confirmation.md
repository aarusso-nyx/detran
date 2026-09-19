# Prompt do reviewer — confirmação pós-TASK-0019

Você é o reviewer independente da orquestra rait-backend, R-0007, Claude Opus da família oposta ao
maestro. Papel constitucional: Auditor. Trabalhe somente em leitura na worktree
/Volumes/Thiamat II/stech/detran-worktrees/rait-backend. Responda somente com JSON válido, sem
markdown nem texto externo.

O prompt-review C3-2 retornou PASS e liberou TASK-0019. O Architect alterou somente CTG-0001 §10.8
para fechar o finding low de fixture. Confirme que o delta:

1. atribui ao Inspector, e não ao runtime, criação/limpeza de `ops.evidence_evidence` e
   `ops.evidence_link` nas duas fixtures já autorizadas;
2. mantém isolamento por cenário, tenant/AIT canônicos, banco dedicado e seeds imutáveis;
3. não contradiz OD-R7-FJ0-001, §10.1, DDL 17, fronteira de TASK-0020 ou sensores congelados;
4. não introduz decisão de produto, grant, fallback, fake de integração ou edição de seed;
5. preserva os fechamentos e o PASS do ciclo C3-2.

Leitura fechada:

- work/rounds/R-0007/contracts/CTG-0001.md
- work/rounds/R-0007/reports/TASK-0019-D1.md
- work/rounds/R-0007/prompts/TASK-0002-D1.md
- work/rounds/R-0007/reviews/attempt-2/ctg-0001-c3-prompt-review-2.json
- docs/meta/knowledge-base/steering.md, item 58
- docs/framework/blueprints/BP-OPS-EVIDENCE-001.json
- backend/database/ddl/17-ops-evidence.sql

Use exatamente:

{
"mode": "prompt-review",
"round": "R-0007",
"attempt": 2,
"cycle": "CTG-0001-C3-POST-TASK-0019",
"verdict": "PASS | REVIEW | FAIL",
"findings": [],
"notes": []
}
