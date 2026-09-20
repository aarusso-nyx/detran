# TASK-0020 — Inspector 11/11, observação independente do mesmo candidato

Papel Art. 6: Inspector Terra/High. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`; observação final 11/11, sem reset. **Sem allowlist
de escrita em arquivos**: read-only de repositório, mutações transitórias
somente no banco dedicado descartável que os testes já usam. Sem
commit/push/PR/merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-IDENTITY-BRIDGE.md`,
`work/rounds/R-0007/prompts/TASK-0021-V3-6-IDENTITY-GREEN.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-9.md`,
os quatro arquivos de produto Engineer e os sete sensores congelados
enumerados no prompt Engineer. A decisão OWNER dispensa repetição de
review intermediário, mas TASK-0022 só pode iniciar após GREEN integral
observado por Inspector no mesmo candidato.

Verifique SHA dos sete sensores e quatro arquivos de produto declarados
na entrega Engineer. Execute os dirigidos full-auth/runtime/command/policy,
E2E RAIT completo com coleta não zero no banco `detran_r7_ctg1_a2`,
owner URL `postgresql://aarusso@localhost/detran_r7_ctg1_a2`, app e
DATABASE URL com papel efetivo `role_app_backend`; confirme current_user,
current_role, sem superuser/bypassrls. Classifique cada RED remanescente:
teste/fixture inválido, estado de banco, produto dentro/fora da allowlist,
contrato ou infra. Relacione o comando/código esperado/observado e provas
sem propor afrouxar asserções. Não editar files, DDL, seed, produto,
testes, contratos, record, `.devai` ou sibling. Zero testes/URL/papel
incorreto é BLOCKED, não GREEN. Entregue veredito objetivo de elegibilidade
TASK-0022; se 11 RED persistirem, STOP e discrimine o menor próximo ciclo.
