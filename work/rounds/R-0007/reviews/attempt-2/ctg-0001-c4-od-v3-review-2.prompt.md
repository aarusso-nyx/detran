# CTG-0001-C4-OD-V3-REVIEW-2 — revisão restrita das duas observações low

Papel: Auditor independente, Fable 5, somente leitura. Worktree:
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.
O OWNER autorizou uma revisão adicional restrita às correções. A REVIEW-1 foi
PASS, fechou F1–F8 e registrou apenas dois lows sobre locks. Agora foram alterados
exatamente dois arquivos do candidato anterior: retirar o módulo read-only da
TASK-0020 e alinhar a tabela de locks de TASK-0020/21 com seus registros. A trava
global de escritor serial permanece. Não há mudança de produto ou allowlist.

Leia somente estes artefatos e o contexto estritamente necessário para avaliar
os dois lows; não repetir a revisão integral já aprovada:

- `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-1.json`
- `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-1.bridge.json`
- `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-2.delta.json`
- `work/rounds/R-0007/tasks/TASK-0002-D1.json`
- `work/rounds/R-0007/tasks/TASK-0003-D1.json`
- `work/rounds/R-0007/prompts/C4-OD-V3-INDEX.md`
- `work/rounds/R-0007/prompts/TASK-0020-V3.md`
- `work/rounds/R-0007/prompts/TASK-0021-V3.md`
- `docs/meta/agents/orchestra/reviewer-prompt.template.md`

O delta.json preserva before/after dos dois arquivos, hashes e identidade do
candidato anterior. O adaptador verificou que nenhum outro dos 183 inputs mudou.
O novo manifesto `ctg-0001-c4-od-v3-review-2.manifest.json` na mesma pasta desta
instrução congela o candidato final; hashes são conferidos pelo adaptador antes
e depois da chamada. Não alegue executar verificações de hash/testes/DB.
Nenhum escritor opera durante a revisão. A extração structured_output e o raw
são preservados pelo adaptador CLI local autorizado, como na REVIEW-1.

Confirme: TASK-0020 não declara lock de upgrade0028; planned_files e prompt
continuam sem escrita nesse sensor; tabela0020 e0021 reflete exatamente cada
target_modules; registros são fonte de verdade e trava global continua vigente.
Os oito highs já foram fechados em REVIEW-1. Novo finding sobre texto inalterado
somente se houver FAIL por contradição canônica, explicando por que não foi
levantado antes. Não transformar a observação opcional sobre equivalência de
comandos do primeiro parecer em novo bloqueio sem alteração correspondente.

Retorne o objeto estruturado obrigatório do schema nativo: mode=prompt-review,
round=R-0007, verdict=PASS/REVIEW/FAIL, findings array, notes array. Nenhuma prosa
externa ou string contendo JSON. Cada finding deve ter severity high/low, item
inteiro1–13, file relativo real, line real 1-based, claim e fix. PASS exige zero
high; se os dois lows estão resolvidos, findings vazio. Notes identificam o
fechamento de ambos e a manutenção do PASS documental F1–F8. Este gate não
significa SQL aplicado, implementação, PR ou merge.
