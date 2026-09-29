# A3 — mapa de fontes das TASKs históricas

**Papel:** Architect (Art. 7). **Estado:** proposta de fonte, sem mutação de TASK ou de schema. Base read-only: `/tmp/r20-ctg3-taskinventory/baseline.json`, gerada por `pnpm devai:baseline` no candidato após PC-0020; **330 TASKs, 143 inválidas, 187 válidas, zero ilegíveis**. O relatório de inventário versionado é `work/rounds/R-0020/reports/CTG-0003-task-inventory-2026-09-28.md`. Os erros podem coexistir em um arquivo; esta tabela contém **uma linha por cada um dos 143 arquivos inválidos**. O contrato de preservação e aliases está em `../contracts/CTG-0003-A3.md`.

## Leitura das fontes e recomendação por classe

Em cada linha, `T` significa o próprio JSON histórico no caminho indicado; `P` significa `work/rounds/<rodada>/plan.md`. Ambos são fonte de **literal histórico e escopo**, não prova automática de que o valor atende ao schema. `S` significa transformação fonte-suportada pela autorização A3 e pelo contrato CTG-0003, sujeita à conferência Inspector e ao sidecar. `PEND` significa `source_pending`; a TASK não pode ser escrita enquanto houver qualquer campo pendente. Os códigos abaixo nomeiam campos do schema ou campos históricos extras.

| Código | Classe / fonte de decisão | Recomendação |
| --- | --- | --- |
| `INV` | `target_invariants`; CTG-0003 §Normalização e `law/trace.json` | `S`: mover **somente** literais não `INV-*` para `tags: ref:<literal>`; manter INV confirmado. `PEND` nos quatro `INV-EVIDENCE-001`/`INV-OFFLINE-001` de R-0005 TASK-0002/0003, ausentes do trace. |
| `DB` | `db_isolation`; `law/schemas/task.schema.json` aceita `database|cluster`; T+P por arquivo | `PEND` nos **54 `none`**, sem conversão por tipo de trabalho ou banco da rodada. `S` proposto apenas para R-0007 TASK-0079/0081: nome literal `detran_r7_ctg1_a2` + `R-0007/plan.md` documentam banco dedicado; usar `database`, preservando o nome no sidecar. |
| `EV`, `REC`, `TRAIL` | `execution_evidence`, `closure_reconciliation`, `iteration_trail`; T e autorização A3 Q1 | `S` para preservar integralmente em sidecar e projetar somente campos que tenham representação fiel no schema. Não sintetizar `started_at`, `verdict`, resultado ou `evidence_refs`. Se a semântica precisar continuar ativa na TASK canônica, `PEND` até decisão de destino. |
| `ID` | Seis IDs corretivos de R-0007; T, prompts `TASK-0004-S*.md`, `R-0007/plan.md`, autorização A3 Q3 | `S` para aliases `TASK-0004-S1/S2/S2-R1/S3/S4/S5` → `TASK-0083…0088` na ordem do contrato; revalidar colisões e preservar os originais. |
| `UP` | `upstream_task_id`; T+P, e prompts para os seis aliases | `S` somente para referência literal a um dos seis aliases cobertos pelo índice A3. `PEND` para predecessor composto `TASK-0001+PREP-*` e string vazia até tabela de precedência/decisão individual; não criar dependência fictícia. |
| `CTG` | `coupled_task_group`; `R-0012/plan.md` §§A8/CTGs e contratos `CTG-0002a/b/c`; `R-0013/plan.md` + contratos `CTG-0004a*`; `R-0014/plan.md` + contratos `CTG-0003a/b/c` | `PEND`: os sufixos `a`, `b`, `-1`, `-2`, `c` distinguem grupos reais. O plano comprova o literal, mas não autoriza colapsá-los em `CTG-nnnn`; requer ID canônico governado ou decisão de especificação, com alias. |
| `POS`, `STATUS`, `ROLE` | Posições `corrective-*`, `architect-integration`, `auditor`; status `completed_incomplete`; disciplinas `owner-delegated`/`transcriber`. T, P e prompts da própria rodada | `PEND`: nenhum mapeamento por semelhança para `architect|inspector|engineer|null`, enum de status ou papel. Preservar literal no sidecar; exigir decisão que identifique autoridade e resultado históricos. |
| `EX`, `PC` | `executor`/`prompt_composition_id`; T e prompts/relatórios da própria rodada | `PEND`: preservar runtime/modelo/composição literais; não fabricar `selection`, ID hash `PC-[a-f0-9]{16}` ou variante. A3 Q1 permite arquivar extras, mas não confirma novo contrato de execução. |
| `TITLE` | `title` com mais de 200 caracteres; T e plano da rodada | `PEND`: o sidecar preserva texto integral, mas novo título curto exige proposta editorial fonteada por arquivo; não truncar às cegas. |

**Viabilidade:** mesmo após arquivar os campos extras e aplicar os seis aliases, o gate zero continua bloqueado pelos 54 `none` e pelas classes `CTG`, `POS`, `STATUS`, `ROLE`, `EX`, `PC` e `TITLE` sem decisão suficiente. O schema não possui valor “sem banco”; a existência de um banco em uma rodada não resolve uma TASK marcada `none`. A3 Q2 pede justamente decisão explícita após esta tabela. Não aplicar normalização parcial a uma TASK com `PEND`.

## Arquivos (fonte individual e disposição)

`Fonte = T+P` aponta para **o JSON na primeira coluna** e para `work/rounds/<R>/plan.md` da mesma rodada. Para `ID`/`UP` da R-0007, consultar também `work/rounds/R-0007/prompts/TASK-0004-S*.md`; para `CTG`, consultar os contratos nomeados na tabela acima. A coluna `Proposta` indica os campos com projeção fonte-suportada (`S`) e os ainda pendentes (`PEND`), sem autorizar escrita parcial.

| Arquivo (`work/rounds/…/tasks/`) | Classes | Fonte | Proposta |
| --- | --- | --- | --- |
| `R-0003/tasks/TASK-0001.json` | `INV, TRAIL` | T+P | S: INV, TRAIL |
| `R-0003/tasks/TASK-0002.json` | `DB, INV, TRAIL` | T+P | S: INV, TRAIL; PEND: DB |
| `R-0003/tasks/TASK-0003.json` | `DB, INV, TRAIL` | T+P | S: INV, TRAIL; PEND: DB |
| `R-0003/tasks/TASK-0004.json` | `DB, INV, ROLE` | T+P | S: INV; PEND: DB, ROLE |
| `R-0005/tasks/TASK-0001.json` | `INV` | T+P | S: INV |
| `R-0005/tasks/TASK-0002.json` | `INV` | T+P | S: INV; PEND: INV |
| `R-0005/tasks/TASK-0003.json` | `INV` | T+P | S: INV; PEND: INV |
| `R-0005/tasks/TASK-0004.json` | `INV` | T+P | S: INV |
| `R-0005/tasks/TASK-0005.json` | `INV` | T+P | S: INV |
| `R-0005/tasks/TASK-0006.json` | `INV` | T+P | S: INV |
| `R-0005/tasks/TASK-0007.json` | `INV` | T+P | S: INV |
| `R-0005/tasks/TASK-0008.json` | `INV` | T+P | S: INV |
| `R-0005/tasks/TASK-0009.json` | `DB, INV, ROLE` | T+P | S: INV; PEND: DB, ROLE |
| `R-0006/tasks/TASK-0001.json` | `INV, TRAIL` | T+P | S: INV, TRAIL |
| `R-0006/tasks/TASK-0002.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0003.json` | `INV, TRAIL` | T+P | S: INV, TRAIL |
| `R-0006/tasks/TASK-0004.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0005.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0006.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0007.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0008.json` | `INV, TRAIL` | T+P | S: INV, TRAIL |
| `R-0006/tasks/TASK-0009.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0010.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0011.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0012.json` | `INV, TRAIL` | T+P | S: INV, TRAIL |
| `R-0006/tasks/TASK-0013.json` | `INV` | T+P | S: INV |
| `R-0006/tasks/TASK-0014.json` | `INV, TRAIL` | T+P | S: INV, TRAIL |
| `R-0007/tasks/TASK-0001.json` | `INV` | T+P | S: INV |
| `R-0007/tasks/TASK-0002.json` | `INV, UP` | T+P | S: INV; PEND: UP |
| `R-0007/tasks/TASK-0003.json` | `INV` | T+P | S: INV |
| `R-0007/tasks/TASK-0004-S1.json` | `DB, INV, EX, POS, ID` | T+P | S: INV, ID; PEND: DB, EX, POS |
| `R-0007/tasks/TASK-0004-S2-R1.json` | `DB, INV, EX, POS, UP, ID` | T+P | S: INV, UP, ID; PEND: DB, EX, POS |
| `R-0007/tasks/TASK-0004-S2.json` | `DB, INV, EX, POS, UP, ID, STATUS` | T+P | S: INV, UP, ID; PEND: DB, EX, POS, STATUS |
| `R-0007/tasks/TASK-0004-S3.json` | `INV, EX, POS, UP, ID, STATUS` | T+P | S: INV, UP, ID; PEND: EX, POS, STATUS |
| `R-0007/tasks/TASK-0004-S4.json` | `DB, INV, EX, POS, UP, ID` | T+P | S: INV, UP, ID; PEND: DB, EX, POS |
| `R-0007/tasks/TASK-0004-S5.json` | `INV, EX, POS, UP, ID` | T+P | S: INV, UP, ID; PEND: EX, POS |
| `R-0007/tasks/TASK-0004.json` | `INV, POS` | T+P | S: INV; PEND: POS |
| `R-0007/tasks/TASK-0006.json` | `REC` | T+P | S: REC |
| `R-0007/tasks/TASK-0007.json` | `REC` | T+P | S: REC |
| `R-0007/tasks/TASK-0008.json` | `EV, REC` | T+P | S: EV, REC |
| `R-0007/tasks/TASK-0009.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0010.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0011.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0012.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0013.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0014.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0015.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0016.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0017.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0018.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0041.json` | `DB` | T+P | PEND: DB |
| `R-0007/tasks/TASK-0046.json` | `REC` | T+P | S: REC |
| `R-0007/tasks/TASK-0048.json` | `REC` | T+P | S: REC |
| `R-0007/tasks/TASK-0050.json` | `EV, REC` | T+P | S: EV, REC |
| `R-0007/tasks/TASK-0057.json` | `REC` | T+P | S: REC |
| `R-0007/tasks/TASK-0064.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0065.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0066.json` | `DB, EV` | T+P | S: EV; PEND: DB |
| `R-0007/tasks/TASK-0067.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0068.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0069.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0070.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0071.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0072.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0073.json` | `EV` | T+P | S: EV |
| `R-0007/tasks/TASK-0074.json` | `DB, EV` | T+P | S: EV; PEND: DB |
| `R-0007/tasks/TASK-0075.json` | `DB, EV` | T+P | S: EV; PEND: DB |
| `R-0007/tasks/TASK-0076.json` | `DB, EV` | T+P | S: EV; PEND: DB |
| `R-0007/tasks/TASK-0077.json` | `DB, EV` | T+P | S: EV; PEND: DB |
| `R-0007/tasks/TASK-0078.json` | `DB, EV, EX, POS, PC` | T+P | S: EV; PEND: DB, EX, POS, PC |
| `R-0007/tasks/TASK-0079.json` | `DB, EV, EX, PC` | T+P | S: DB, EV; PEND: EX, PC |
| `R-0007/tasks/TASK-0080.json` | `DB, EV, EX, POS, PC` | T+P | S: EV; PEND: DB, EX, POS, PC |
| `R-0007/tasks/TASK-0081.json` | `DB, EV, EX, PC` | T+P | S: DB, EV; PEND: EX, PC |
| `R-0007/tasks/TASK-0082.json` | `DB, EV, EX, POS, PC` | T+P | S: EV; PEND: DB, EX, POS, PC |
| `R-0008/tasks/TASK-0008.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0009/tasks/TASK-0003.json` | `TRAIL` | T+P | S: TRAIL |
| `R-0009/tasks/TASK-0005.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0009/tasks/TASK-0006.json` | `TITLE, TRAIL` | T+P | S: TRAIL; PEND: TITLE |
| `R-0009/tasks/TASK-0007.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0009/tasks/TASK-0008.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0009/tasks/TASK-0009.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0012/tasks/TASK-0001.json` | `DB, CTG, UP` | T+P | PEND: DB, CTG, UP |
| `R-0012/tasks/TASK-0002.json` | `DB` | T+P | PEND: DB |
| `R-0012/tasks/TASK-0003.json` | `DB` | T+P | PEND: DB |
| `R-0012/tasks/TASK-0004.json` | `DB` | T+P | PEND: DB |
| `R-0012/tasks/TASK-0005.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0006.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0007.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0008.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0009.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0010.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0011.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0012.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0013.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0014.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0015.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0016.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0012/tasks/TASK-0017.json` | `DB, CTG` | T+P | PEND: DB, CTG |
| `R-0013/tasks/TASK-0010.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0011.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0012.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0013.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0014.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0015.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0016.json` | `CTG` | T+P | PEND: CTG |
| `R-0013/tasks/TASK-0017.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0001.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0014/tasks/TASK-0002.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0014/tasks/TASK-0004.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0014/tasks/TASK-0006.json` | `TITLE` | T+P | PEND: TITLE |
| `R-0014/tasks/TASK-0008.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0009.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0010.json` | `EX` | T+P | PEND: EX |
| `R-0014/tasks/TASK-0011.json` | `EX` | T+P | PEND: EX |
| `R-0014/tasks/TASK-0012.json` | `EX, TITLE` | T+P | PEND: EX, TITLE |
| `R-0014/tasks/TASK-0015.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0016.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0017.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0018.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0019.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0020.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0021.json` | `CTG` | T+P | PEND: CTG |
| `R-0014/tasks/TASK-0022.json` | `EX` | T+P | PEND: EX |
| `R-0015/tasks/TASK-0001.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0002.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0003.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0004.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0005.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0006.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0007.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0008.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0009.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0010.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0011.json` | `DB` | T+P | PEND: DB |
| `R-0015/tasks/TASK-0012.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0001.json` | `DB, UP` | T+P | PEND: DB, UP |
| `R-0016/tasks/TASK-0002.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0003.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0004.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0005.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0006.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0007.json` | `DB` | T+P | PEND: DB |
| `R-0016/tasks/TASK-0008.json` | `DB, TITLE` | T+P | PEND: DB, TITLE |

**Conferência mecânica:** 143 linhas inválidas; 54 linhas `DB` com literal `none`; 2 linhas `DB` com nome literal de banco. Por rodada: R-0003=4, R-0005=9, R-0006=14, R-0007=47, R-0008=1, R-0009=6, R-0012=17, R-0013=8, R-0014=17, R-0015=12, R-0016=8.
