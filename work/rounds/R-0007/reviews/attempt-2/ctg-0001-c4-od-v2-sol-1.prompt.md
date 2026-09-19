# CTG-0001-C4-OD-V2-SOL-1 — revisão independente ad hoc

Você é o Auditor independente, somente leitura, no papel constitucional de
reviewer de `prompt-review` da rodada R-0007. Use a worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. O OWNER autorizou
exatamente esta revisão ad hoc em GPT-5.6 Sol/alto após a tentativa Fable 5
terminar com JSON inválido. É exceção **somente para esta chamada** à regra
ordinária de família oposta; não redefine independência, limites ou precedência.
Não escreva, gere, instale, rode banco, faça commit, push, PR ou merge. Não
despache workers. O parecer Fable inválido não é fonte de findings validados.

## Candidato e trabalho

Leia AGENTS.md, CODESTYLE.md, Constituição Art. 6/18, o template
`docs/meta/agents/orchestra/reviewer-prompt.template.md` (rubrica 1–13 e
vereditos), e apenas as fontes C4-OD V2 e canônicas necessárias abaixo.
Esta é a **primeira revisão válida deste candidato V2 corrigido**; seja
exaustivo e liste todos os problemas materiais agora. Julgue a prontidão da
decomposição/contrato/prompt para o próximo despacho, **não** a implementação.
Não trate código pré-existente não alterado pelo pacote como entrega da V2.

Verifique nominalmente: decisões Owner PCD=80+, idade no ato de qualificação,
PCD anexado e validado no protocolo, ausência de prova como default, `none`
para protocolo sem prioridade, `null` legado inelegível, congelamento V1 com
mecanismo de revisão futura auditável; via POST existente como `protocol`,
nenhum caso novo sem qualificação, ausência de bypass por CRUD/repository/SQL;
bases/provas e catálogo tipado sem upload etário novo; função SQL, role writer
NOLOGIN não owner, RLS/FORCE, grants pós-DDL20, triggers e sensores negativos;
distinção entre autenticação de ator na aplicação e membership verificada no
SQL; upgrade idempotente pre-DDL/pós-grants/verify, preservação de legado,
schema fresco versus upgrade e falha fechada; `protocolled_at` e `id`
imutáveis após INSERT, inclusive legado, em blueprint, SQL e testes negativos;
seis providers Clock, snapshot/fuso tenant, RLS 90/17, inventário nominal de
85 gerados, separação Architect–Inspector–Engineer, sensores antes de GREEN,
allowlists, budget e gates. O drift atual de saídas de parâmetro geradas é
declarado; avalie a correção da alocação de parser/generator/testes, sem fingir
que o drift já foi resolvido. Preserve C4 não substituído.

Fonte principal e precedência: `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`
seção V2 final > somente instruções conflitantes antigas em C4/prompt;
decisões Owner e ADRs nunca são sobrepostas. Consulte também
`work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`,
`work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md` e
`work/rounds/R-0007/prompts/C4-OD-V2-PROPOSED.md`.

## Identidade do candidato

Antes de julgar, confira SHA-256 das entradas abaixo. Se qualquer hash divergir,
emita `REVIEW` ou `FAIL` com finding explícito de candidato móvel; não julgue
um misto de versões. Paths futuros ainda inexistentes não têm hash inventado.

| Arquivo                                                        | SHA-256                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `work/rounds/R-0007/plan.md`                                   | `099cd62ae4b624f5b5b804177b8a8a0d02b78c23b65d0e0276ab373878c0c1a5` |
| `work/rounds/R-0007/budget.json`                               | `9985ff53d886552e8ecda9121bbc8b5255d69add83b5e382cba486f8487ab16e` |
| `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`               | `6c4906517972cd7acfa5c41e0e187cbfde8bf6238fb560883f1376a8e96108eb` |
| `work/rounds/R-0007/contracts/CTG-0001-C4.md`                  | `04d0b5f7a61c882a5595043216876a5cb387d72a4dd2a30f7d830b306b5d589a` |
| `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`            | `17dbdfa21ea27f8f363f11e7faeae2d170984845198ddaf2b94d095100b690ba` |
| `work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md`           | `42494d0ddba6c9ce9e4b38e9a29bbfa3388c1b15fc8939295cbc2065c6c68fa7` |
| `work/rounds/R-0007/prompts/C4-OD-V2-PROPOSED.md`              | `a9a3a6471acfaffd090df7947b1b851b2e9bcd05c4ad9d9fa49dca134d0baf9c` |
| `docs/framework/product/domains/inf/rait/rules/RN-RAIT-141.md` | `dcc911d70141fbab38e8d3178727542fa616c3d15d4b1cedfbad2b0e1e285194` |
| `docs/framework/arch/parameter-catalogue.md`                   | `744b46722d02f6d958c18864e1411f0dbf0e7cb544876354c0d5bada2e79690b` |
| `docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`   | `718128591c5ff7448e3e2a8a6d77cde3d010577cf9a8f63dc7d2f8f2e0ffd81c` |
| `docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`   | `136f7fc6cc4536bdb3924befdded423f192d3ef8c2631bc4f805a408c5538e1e` |
| `docs/meta/knowledge-base/open-decisions-rait.md`              | `9112066a9104dfb1c19f251860c5d23ec60829a3773c3d68f5d6fcdb02841cdb` |

## Saída obrigatória e validade

Sua resposta **inteira** deve ser exatamente **um objeto JSON** UTF-8 válido,
sem cercas Markdown, cabeçalho, prosa antes/depois, comentários JSON, vírgulas
finais ou segundo objeto. A chamada também impõe
`ctg-0001-c4-od-v2-sol-1.schema.json` como esquema de saída. Use apenas estas
cinco chaves de topo, nessa ordem: `mode`, `round`, `verdict`, `findings`,
`notes`. `mode` = `prompt-review`; `round` = `R-0007`; `verdict` = `PASS`,
`REVIEW` ou `FAIL`. `findings` é array; cada item tem exatamente
`severity` (`high`/`low`), `item` (inteiro da rubrica 1–13), `file`
(path real relativo à worktree), `line` (inteiro 1-based existente), `claim`
(fato verificável) e `fix` (ação delimitada). `notes` é array de strings.
Escape aspas e caracteres especiais conforme JSON. Não insira citações ou
texto de código crus que quebrem o parse.

`PASS` só se não houver finding `high`; para `PASS`, coloque apenas `low` ou
array vazio, nunca esconda bloqueio em `notes`. `REVIEW` exige pelo menos um
`high` corrigível sem replanejamento; `FAIL` exige pelo menos um `high` de
contradição canônica/Owner/ADR/Constituição ou violação de fronteira. Cada
finding deve citar arquivo e linha do candidato efetivamente lido. Sem
resultado íntegro e parseável, **não há veredito**. Mesmo um `PASS` libera
somente solicitar autorização da próxima etapa: não executa SQL, banco,
TASK-0023, Inspector, Engineer, commit, PR ou merge.
