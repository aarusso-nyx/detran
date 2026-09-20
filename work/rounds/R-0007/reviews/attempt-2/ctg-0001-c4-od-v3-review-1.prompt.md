# CTG-0001-C4-OD-V3-REVIEW-1 — Auditor independente Fable 5

Papel constitucional: Auditor. Faça a revisão independente somente leitura do
pacote documental C4-OD V3 em `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.
O OWNER autorizou a implementação do plano de correção de F1–F8 até aprovação
documental. Esta é a revisão após a continuação TASK-0023 e pode fechar o gate
de delta somente sobre este candidato exato. Não julgue o código atual como
implementação entregue da V3. A execução de SQL, geração e tarefas de produto
está explicitamente fora desta etapa.

Leia primeiro o parecer independente anterior
`work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v2-sol-1.json`, o template
`docs/meta/agents/orchestra/reviewer-prompt.template.md`, a matriz de respostas
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-FINDINGS.md` e o índice
`work/rounds/R-0007/prompts/C4-OD-V3-INDEX.md`. Então examine o candidato listado
em `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-REVIEW-READSET.md`, seus
contratos, prompts, tarefas e fontes de contraste necessárias. O manifesto
`work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-1.manifest.json`
identifica os bytes. O adaptador confere todos os hashes antes e depois da
chamada e preserva os bytes em `.inputs.json`; não alegue ter executado hash,
teste ou banco se não executou. Ferramentas disponíveis são apenas Read/Grep/Glob.

Avalie o fechamento de cada F1–F8 e efeitos das mudanças. Preserve a regra de
revisões subsequentes: novo achado em texto não alterado só se constitui FAIL
canônico e explique por que não foi levantado antes. Novo texto pode ser
integralmente examinado. Não use o output Fable V2 inválido como parecer.
Não aprove por deferência ao autor; não exija provas de execução futura para
declarar pronto um contrato, mas exija testes/etapas factíveis e critérios claros.

Confira especialmente: paths ddl/19 e ordem explícita única; uma transação psql
com rollback até falha de commit, distinção --full e seeds; Inspector antes do
Engineer do parser; 11 registros de tarefa e dependências/gate/locks; leitura
fechada com D1 nominal; comandos reais e coleta positiva; 36 papéis com guard
protocol anterior aos shortcuts admin/permissions, união e vínculo dinâmico;
ensaio de falhas/concorrência e ausência de grants intermediários confirmados.
Preserve PCD=80+, idade no ato, decisões de portaria, Clock seis providers,
RLS90/17, inventário85 e imutabilidade id/protocolled_at. Não reabra decisões OWNER.

Autoridade/modelos: OWNER aprovou Sol/Medium para coordenar este fechamento,
Astra/Medium para a correção arquitetural, Sol/High para futuros Inspector e
Engineer, e Fable5 para este Auditor. Budget da janela contábil18 foi reservado
antes das chamadas; não é reset de quotas. TASK0023 realizou sua continuação2/2;
primeira execução incompleta é preservada. Seu registro de instrução via agente
é explicitamente normalizado, não prova dos bytes do prompt original. As dez
composições futuras têm hashes de prompts efetivamente salvos. TASK0020/21
mantêm3/4. Próximas tarefas de produto continuam queued e não despachadas.

O OWNER aprovou o adaptador CLI local com --json-schema, preservação do raw e
validação para este pacote, em lugar do modo text da ponte antiga (§8). Não
houve alteração da ponte compartilhada. Há registro compatível de prompt/output
hash, schema, raw, timestamps e candidato; avalie sua integridade, sem pedir
que se retorne ao fluxo text responsável pela falha de formato anterior.

## Saída obrigatória

Forneça exatamente o objeto estruturado exigido pelo schema nativo da chamada:
`mode` = `prompt-review`, `round` = `R-0007`, `verdict` = PASS/REVIEW/FAIL,
`findings` = array e `notes` = array de strings. Cada finding tem exatamente
severity high/low, item inteiro1–13 da rubrica, file relativo existente, line
1-based existente, claim factual e fix delimitado. Nenhum Markdown, comentário,
prosa externa, segundo objeto, ou string contendo JSON em vez do objeto.
Use escaping JSON correto; não devolva parecer solto em texto.

PASS exige zero high; observações low não bloqueiam e não escondem high.
REVIEW exige high corrigível; FAIL exige contradição canônica/OWNER/ADR/Constituição
ou violação de fronteira. Nas notes, registre nominalmente o fechamento ou
pendência de F1–F8, limites da revisão documental e próximo gate aplicável.
Um PASS aprova o pacote, não declara código implementado, banco migrado ou merge.
