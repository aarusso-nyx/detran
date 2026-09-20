# R-0007 CTG-0001 — revisão independente do delta TASK-0020

Papel: Auditor independente Fable 5, somente leitura. Avalie **apenas** a
continuação OWNER autorizada após TASK-0020 4/4 BLOCKED; não reabra SQL2
waived nem revise toda a CTG. Sem edição, conexão DB, Git mutante ou execução
de testes. Worktree: `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Leia `AGENTS.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT.md`,
`work/rounds/R-0007/prompts/TASK-0020-V3.md`,
`work/rounds/R-0007/tasks/TASK-0020.json`,
`work/rounds/R-0007/compositions.json`,
`work/rounds/R-0007/budget.json`,
o topo vigente de `work/rounds/R-0007/plan.md`,
`backend/database/ddl/19-rait-priority-enforce.sql` linhas 98–260,
`backend/database/seed/05-parameters.sql` e
`backend/database/seed/20-fixtures-rait.sql`. Para autoridade, leia
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md` §5 e sequência final e
`docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`.

Hashes congelados de entradas mutáveis: prompt TASK0020
`09a7c2ed2921dfcec8d4171f122554778b958342e885c5ee597b21a90ca7012d`;
tarefa `6edd63654f85c7467cbbbe39ae7e6b15f3581c20737791a616ae0653c496c9e7`;
composições `67a392d728f96582c76fc669ba3d24b89a8cc66d74eca5fa1089e6ed70e26878`;
orçamento `783604ed0ca5c0839caf2216be610c996bc24173efa6953b6ef7c022ff022a24`;
plano `5492b4e7459e4372be5311fe1ccda14ddcd61cd1d1055ae088cc1c20901574b0`;
relatório `013e5d74474e183d4e05a8e8036d35db5c62674c1748d3e50290c51d72d9db1e`.

Fatos do Maestro, **não provas executadas pelo Auditor**: a primeira tentativa
de seed20 pós-DDL19 falhou e foi revertida por falta de assessment; o banco
dedicado descartável foi então preparado como baseline legado em uma transação
com seed05, trigger `rait_priority_case_complete` desabilitado somente durante
seed20 e reabilitado antes do commit. Leitura posterior: 20 cases, 1 inquiry,
parâmetro presente, trigger `tgenabled='O'`; integração existente 2/2 PASS.
Nenhum DDL/seed do repositório foi alterado. O teste novo de instalação fresh
deve permanecer RED até reparo Engineer de seed20, sem inventar prova histórica.

Julgue especificamente: (1) essa preparação isolada representa legado
pré-enforcement sem enfraquecer o DDL operacional, e não mascara o problema
fresh; (2) o prompt pede RED verificável da seed fresh, mantém Inspector antes
de Engineer para produto, e separa BLOCKED infra de RED real; (3) uma única
continuação 5/5 preserva 4/4 histórico, modelos/PC/locks/allowlist e não libera
TASK0021 por inferência; (4) há qualquer conflito material com ADR-0024,
contrato ou fronteira de escrita. Achados baixos não bloqueiam, mas high sim.

Responda **somente** no objeto nativo do JSON Schema fornecido: cinco chaves
`mode`, `round`, `verdict`, `findings`, `notes`; `mode="prompt-review"`,
`round="R-0007"`. Cada finding deve citar arquivo real, linha 1-based, item
1–13, claim e fix. `PASS` exige zero high. Não alegue execução de DB/testes,
entrega completa ou aprovação de SQL2.
