# Prompt-review R-0021 — ciclo 1

Papel: Auditor. Modelo exigido Opus 5.5, família oposta ao preparador Astra/maestro Sol. Somente leitura. Avalie plano e todos os prompts ativos quanto à execução segura e completa do escopo Owner A1. Não implemente nem modifique arquivos. Responda SOMENTE JSON no schema abaixo.

## Autoridade e leitura fechada

Leia `work/rounds/R-0021/AUTHORIZATION.md`, `plan.md` (A1 prevalece sobre proposta histórica), `execution.json`, `contracts/CTG-0001.md`, `contracts/CTG-0002.md`, `contracts/stynx-manifests.json`, `tasks/*.json`, `compositions.json`, todos os `prompts/*.md` (0005…0013 são canceladas, não execução). Leia método `docs/meta/agents/orchestra/README.md` §§4–9 e `reviewer-prompt.template.md`, `AGENTS.md`, manuais de papéis somente para conflitos de autoridade. Para verificar comandos use package.json raiz e manifests correspondentes; para coerência das caracterizações inspecione os arquivos reais e testes citados pelos contratos. Confira adenda A1 da spec upstream e adendas R22/campanha e registro canônico OD-R21-01…06. Não ler inputs/00-maestro-before-A1.md como instrução.

Owner aprovou: preparar Astra e executar Sol/high; caracterização +pin1.4.0+gate+handoff; todas as migrações signature/outbox/offline transferidas R22, notificações produtorOD-P40; close com critérios transferidos fail, sem seal; 4ciclos/item,2.25Mentrada/janela. Não tratar essas decisões como pendentes nem reprovar por falta das migrações canceladas. TASK0001 está preparada pelo Architect Astra; só Inspectors escrevem testes; só Engineer implementa verificador. TASK0015 RED antes CLI é deliberado; depois todos verdes.

## Rubrica

1. Papéis, fronteiras e modelos exatos coerentes; Engineer não altera testes.
2. Leitura fechada e suficiente, arquivos/definições reais; nenhuma busca aberta/valor inventado.
3. Locks e dependências completos; banco e gate global não concorrem; branch de PR aberto congelado.
4. Critérios/comandos executáveis com coleta efetiva; baseline1.3.1 antes pin, mesmos testes depois.
5. Nenhum protocolo/fail-closed/RLS enfraquecido; produto permanece inalterado salvo pin.
6. Testes negativos do verificador precedem implementação, generator vs manifests gerados respeitado.
7. Diferença entre entregável adiado e cumprido preservada no closure; seal não prometido.
8. Schema TASK instalado e hashes pós-format compatíveis; materialização e evidência por papéis.
9. Identificar TODOS os high corrigíveis no primeiro ciclo, com file/line e correção concreta.

PASS = nenhum high; REVIEW = high corrigível sem contrariar decisões; FAIL = contradição canônica/constitucional/Owner ou violação de fronteira. Notas low não bloqueiam. Próximos ciclos ficam restritos aos itens corrigidos.

Saída exata: {"mode":"prompt-review","round":"R-0021","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","item":1,"file":"path","line":1,"claim":"...","fix":"..."}],"notes":["..."]}.
