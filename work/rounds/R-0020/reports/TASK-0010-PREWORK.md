# TASK-0010 — inventário read-only antes dos registros de rodada

**Papel:** Inspector (Art. 7). **Estado:** prework somente leitura em 2026-09-28. Este
inventário não conclui TASK-0010, não executa `round seal` e não declara novos selos.

## Fontes e conferência

Foram comparados `work/rounds/<R>/closure.json`, os PCs em
`record/proofs/compliance/closures/`, `work/rounds/<R>/record.md`,
`work/rounds/<R>/close-state.jsonl`, os anexos D-1/D-2 em
`law/register/DECISIONS.md` e `record/derived/indexes/rounds.md`. Para cada PC
selecionado abaixo, `merged_as` coincide com o `closure.json`, todos os gates
têm `status: pass`, nenhum `validation_criteria` tem `verdict: fail`, e a
entrada do PC consta do índice. Plano e `prompts/00-maestro.md` existem em
todas as rodadas. Essa conferência de arquivos não substitui os gates nem o
ensaio do verbo DEVAI no candidato de selo.

| Rodada | PC selecionado | `closure.json` | `record.md` | `close-state.jsonl` | D-1/D-2 e índice | Gates / critérios do PC |
| --- | --- | --- | --- | --- | --- | --- |
| R-0003 | PC-0001 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0004 | PC-0002 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0005 | PC-0003 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0006 | PC-0004 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0007 | PC-0011 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0008 | PC-0005 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0009 | PC-0006 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0010 | PC-0008 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0011 | PC-0009 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0012 | PC-0010 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0013 | PC-0013 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0014 | PC-0007 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0015 | PC-0014 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0016 | PC-0012 | presente | ausente | ausente | presentes | pass / sem fail |
| R-0017 | PC-0018, corretivo | presente | presente | presente | presentes | pass / sem fail; já selada |
| R-0018 | PC-0020, corretivo | presente | presente | ausente | presentes | pass / sem fail |
| R-0019 | PC-0016 | presente | ausente | ausente | presentes | pass / sem fail |

O `record.md` de R-0018 já aponta a PC-0020, com `merged_as` e as cinco
chaves de gates iguais às do PC. O `record.md` e o `close-state.jsonl` de
R-0017 apontam a PC-0018 e o mesmo merge; R-0017 fica fora da fila de selos.

## PCs históricos e trabalho ainda necessário

- `record/proofs/compliance/closures/PC-0015.json` conserva um critério
  `fail` de R-0018 (`git check-ignore -v dist → ignored`). A PC-0020 declara
  `supersedes: PC-0015`, não contém critério `fail` e é o PC selecionado para
  R-0018. Não alterar a PC-0015.
- `record/proofs/compliance/closures/PC-0017.json` conserva quatro critérios
  `fail` de R-0017. A PC-0018 declara `supersedes: PC-0017` e é a PC do selo
  já existente. Não alterar a PC-0017 nem repetir o selo de R-0017.
- TASK-0010 precisa transcrever 15 arquivos
  `work/rounds/<R>/record.md`: R-0003…R-0016 e R-0019. R-0018 já possui seu
  registro; R-0001/R-0002 são pré-método e não entram na fila.
- Após os gates obrigatórios e o ensaio em clone, o maestro ainda precisa
  executar `round seal` serialmente para 16 rodadas: R-0003…R-0016,
  R-0018 e R-0019. Somente o verbo DEVAI deve gerar os respectivos
  `close-state.jsonl`. Nenhum deles está presente agora.

O roteiro e a forma exigida do `record.md` estão em
`work/rounds/R-0020/contracts/CTG-0003.md` (§Mapa fechado, §Forma dos
`record.md`). O índice atual preserva tanto as PCs históricas quanto as
corretivas: PC-0017/PC-0018 e PC-0015/PC-0020.
