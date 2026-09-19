# CTG-0001 C4-OD V3 — contrato de idempotência DDL05

Papel Art. 6: **Architect**. TASK-0031, execução **1/1**, 2026-09-16.
Worktree: `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.
Branch e HEAD informados pelo Maestro: `orchestra/rait-backend`,
`df1e1769941e527a07b6db7550aee84068f3a872`; worker não executa Git.
Este contrato é a saída F1 do ciclo OWNER delimitado; não declara implementação,
PASS de sensor, revisão de entrega ou execução PostgreSQL.

## Autoridade, proveniência e fronteira

Prompt ativo: `work/rounds/R-0007/prompts/TASK-0031-DDL05-CONTRACT.md`,
SHA-256 `271dae2a67a0be4fe07728555f96cd8e3915e9b1665e4ca6dfbdfbf5eb399a67`.
Prompt-review Fable 5 nativo estruturado PASS, zero high e três low,
candidato `b3f47879cc36e9ecea4e937a05ad801950fd005676a1babceda4f2fa770804f0`.
O PASS tem esse candidato como limite; o contrato presente ainda será avaliado
pela revisão de entrega dos bytes reais. As fontes fechadas do prompt foram
lidas integralmente, inclusive os estados históricos e os adendos finais.

O ciclo `reports/CTG-0001-C4-OD-V3-DDL05-CYCLE.md` e o estado vigente de
`plan.md`, relativos a `work/rounds/R-0007/`, prevalecem sobre instruções
históricas conflitantes. A única escrita desta tarefa é este arquivo.
TASK-0032 será Inspector, apenas nos dois sensores nominais abaixo;
TASK-0033 será Architect, apenas em `backend/database/ddl/05-role-catalog.sql`.
O manual `docs/meta/agents/architect-blueprint.md`, seção “Pode tocar”, atribui
DDL manual `0x`/`1x` ao Architect. DDL05 não é saída de gerador;
`tools/check-role-catalog.ts` verifica chaves e não gera SQL. Essa disciplina
local explica o escritor Architect de TASK-0033; não autoriza Engineer a editar
DDL, nem autoriza TASK-0031 a implementar o contrato.

Esclarecimentos operacionais posteriores ao freeze, correspondentes aos três
lows registrados no plano e reiterados no despacho do Maestro:

1. `backend/database/tests/` é extensão cliente F3 **exata e autorizada pelo
   OWNER para este ciclo**, com os dois arquivos nominais desta especificação.
   É compatível com a extensão aditiva permitida no Art. 6; não é path positivo
   literalmente listado na Constituição ou no manual Inspector padrão.
2. Nenhum worker executa Git, inclusive comandos de leitura. O Maestro verifica
   identidade/estado e executa `git diff --check` na aceitação; os workers não
   fazem commit, push, PR, merge ou mudanças de índice/branch.
3. A expressão SQL esperada escrita **dentro deste contrato** é especificação
   F1. A proibição de escrever código/SQL nesta tarefa refere-se aos arquivos
   de produto; não impede especificar a guarda de forma inequívoca aqui.

Esses esclarecimentos não são atribuídos ao texto do prompt congelado e não
alteram seu hash. Um escritor global e lock `MOD-role-catalog-ddl` serializam
as tarefas. `record/` e `.devai/` não são escritos pelo worker; o Maestro
registra evidência pelos verbos instalados. Siblings permanecem somente leitura.

## INV-DDL05-001 — atualização somente por divergência canônica

Severidade: hard-fail. Tipo: integridade e idempotência de catálogo. Escopo:
o único `INSERT INTO auth.role_catalog ... ON CONFLICT (key)` do DDL05.
Autoridade: ciclo OWNER, CODESTYLE SQL e reference-gap TASK-0029. Mudança da
regra exige nova decisão/revisão; enfraquecimento de sensor não é permitido.

Os sete campos canônicos, na ordem abaixo, continuam no SET e continuam
recebendo **exatamente** a respectiva coluna de `EXCLUDED`:

| Campo           | Atribuição preservada                    |
| --------------- | ---------------------------------------- |
| `family`        | `family = EXCLUDED.family`               |
| `name`          | `name = EXCLUDED.name`                   |
| `description`   | `description = EXCLUDED.description`     |
| `apps`          | `apps = EXCLUDED.apps`                   |
| `is_staff`      | `is_staff = EXCLUDED.is_staff`           |
| `source`        | `source = EXCLUDED.source`               |
| `introduced_on` | `introduced_on = EXCLUDED.introduced_on` |

O SET preserva `updated_at = clock_timestamp()`. A guarda vinculante do
`DO UPDATE`, usando o nome atual da relação alvo, é:

```sql
WHERE ROW(
  role_catalog.family,
  role_catalog.name,
  role_catalog.description,
  role_catalog.apps,
  role_catalog.is_staff,
  role_catalog.source,
  role_catalog.introduced_on
) IS DISTINCT FROM ROW(
  EXCLUDED.family,
  EXCLUDED.name,
  EXCLUDED.description,
  EXCLUDED.apps,
  EXCLUDED.is_staff,
  EXCLUDED.source,
  EXCLUDED.introduced_on
)
```

Os pares são posicionais, completos e sem duplicação. `IS DISTINCT FROM`
fornece comparação null-safe: dois NULLs não divergem; NULL e valor divergem.
Não substituir por `<>`, coerção textual, hashes, COALESCE com sentinela ou
comparação de timestamps. Arrays conservam a igualdade PostgreSQL de arrays;
não ordenar/deduplicar `apps` para ocultar divergência. As sete colunas atuais
são NOT NULL: não remover constraints nem inserir NULL inválido como fixture.

Se a guarda for falsa, nenhuma linha conflitante recebe UPDATE e a expressão
`clock_timestamp()` **do SET** não atualiza seu timestamp. `created_at` jamais
entra no SET; `created_at` e `updated_at` jamais motivam a guarda. Os defaults
do INSERT continuam intactos, inclusive seus clocks: este contrato não afirma
que PostgreSQL deixe de avaliar defaults da tentativa de inserção, adquirir
locks ou executar o restante do DDL. A garantia é ausência de UPDATE da linha
conflitante idêntica, incluindo seus efeitos de auditoria por UPDATE de linha;
não é alegação de zero I/O ou de ausência de todo trigger de statement.

| Caso                                                                 | Resultado canônico                              | `updated_at` esperado                           | `created_at` esperado                           |
| -------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| Chave existente, sete campos iguais, quaisquer timestamps existentes | Sem UPDATE da linha                             | Exatamente o valor anterior                     | Exatamente o valor anterior                     |
| Chave existente, ao menos um campo canônico divergente               | UPDATE dos sete campos com `EXCLUDED`           | Valor de `clock_timestamp()` do UPDATE          | Exatamente o valor anterior                     |
| Chave canônica ausente                                               | INSERT original com os oito valores catalogados | Default original da inserção                    | Default original da inserção                    |
| Reapply após igualdade, correção de divergência ou inserção          | Conteúdo agora igual, sem novo UPDATE           | Exatamente o valor resultante da etapa anterior | Exatamente o valor resultante da etapa anterior |

A prova de divergência deve variar cada campo separadamente com valor válido,
além de exercitar divergência conjunta; não basta um caso de `name` para
demonstrar todos os pares. Usar timestamp anterior conhecido e comparação de
precisão PostgreSQL para distinguir update real de preservação; não depender de
sleep, arredondamento JavaScript ou desigualdade por acaso. Não exigir igualdade
entre os dois clocks independentes do INSERT.

## INV-DDL05-002 — população e valores preservados

Severidade: hard-fail. Escopo: DDL05, fontes de roles e consumidores congelados.
Autoridade: catálogo vigente e ciclo OWNER. Não permite enfraquecimento de teste.
Somente a guarda do conflito muda em TASK-0033. Permanecem os 36 registros,
todos os seus valores literais, ordem, chave, famílias, tipos, defaults, CHECK,
FK, comentários e grants; o SET existente é preservado. Não alterar outras
DDLs, `apply.sh`, políticas, aliases, grants de aplicação ou roles PostgreSQL.

População nominal fechada:

| Família     | Chaves canônicas                                                                                                                                                                       | Quantidade |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `pec`       | `ADMIN`, `ADMIN_CLINICA`, `MEDICO`, `PSICOLOGO`, `RECEPCAO`, `TECNICO_BIOMETRIA`, `AUDITOR`, `GESTOR`, `SUPERVISOR`, `GESTOR_DETRAN`, `JUNTA`, `CETRAN`, `DPO`, `SUPORTE`, `CANDIDATO` | 15         |
| `teat`      | `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`, `technical-admin`, `bi-analyst`, `integration-operator`                                 | 8          |
| `rait`      | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair`, `rait-manager`, `rait-hr`, `rait-finance`   | 10         |
| `dashboard` | `dash-operator`, `dash-duty-owner`                                                                                                                                                     | 2          |
| `citizen`   | `CIDADAO`                                                                                                                                                                              | 1          |

`auditor` continua alias de `AUDITOR`, não 37ª entrada. Roles de negócio não
são os roles técnicos PostgreSQL; a autorização separada de criação futura de
`role_rait_priority_writer` em TASK-0029 não integra este ciclo DDL05.

Hashes SHA-256 verificados na leitura desta tarefa:

| Fonte preservada                                                                            | SHA-256                                                            |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `backend/database/ddl/05-role-catalog.sql` antes da correção                                | `4cf0316afdb235495420cddb7297fe20ac2d5714aa449e049cf531b2ca6124d9` |
| `backend/database/ddl/14-inf-lifecycle-vocabulary.sql`                                      | `7568c0b433aa55183d1cec22a4eba6e70a88a3a42e7ab378332f71263257dd1d` |
| `backend/domains/shared/src/roles.ts`                                                       | `7798eed732608df2ef5aa28d77b69be7d2608ec26fa704a05cabfa90cd91eb20` |
| `tools/check-role-catalog.ts`                                                               | `1eea542f22ceb6e4a5468f78a52a6e251af856681496818c630a6a9a20d1cd08` |
| `backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts` | `aab9bde147c33fd047ee9e8fa5f1d7b4a9acb8298a34bc5d6d05dadc7d6e9577` |

O primeiro hash identifica o baseline RED, não o SQL corrigido futuro. Os demais
devem permanecer byte-a-byte idênticos. A preservação literal do bloco VALUES
e dos bytes externos à guarda precisa de prova própria: o checker existente
compara conjuntos de chaves e documentação, não todos os atributos nem a
semântica de ausência de UPDATE.

## INV-DDL05-003 — prova independente e gates separados

Severidade: gate. Autoridade: ciclo OWNER e Artigos 29–30. Inspector é autor
exclusivo dos sensores, com trace aos três invariantes deste contrato. Hashes
são congelados antes da correção; TASK-0033 não modifica sensores para obter
GREEN. Não há retry ou nova iteração implícita.

TASK-0032 escreve exatamente:

- `backend/database/tests/ddl05-role-catalog.test.mjs`;
- `backend/database/tests/ddl05-role-catalog.integration.test.mjs`.

O primeiro executa sem conexão DB. Deve conferir conflito por `key`, os sete
SETs originais, o clock do SET condicionado, a guarda completa null-safe,
ausência de timestamps como causa, 36 chaves e valores catalogados intactos.
Não basta localizar `IS DISTINCT FROM` em comentário ou SQL não executado.
O baseline precisa produzir RED contratual pela guarda ausente, com coleta
positiva; import quebrado, erro de sintaxe ou ferramenta ausente são BLOCKED,
nunca RED. TASK-0033 produz GREEN do mesmo sensor congelado. Exigir zero
skip/todo, contagem positiva e resultados nominais registrados pelo Maestro.

O segundo é **autoria agora; execução PENDENTE**. Exercitar PostgreSQL real
sobre os bytes exatos revisados de DDL05, com sessão explícita, BEGIN e ROLLBACK
incondicional inclusive em falha. Verificar previamente URL explícita,
`current_database() = detran_r7_ctg1_a2`, identidade administrativa autorizada
para DDL, isolamento e ausência de uso concorrente. Não usar fallback ambiental
de banco nem principal administrativo para alegar identidade de aplicação.
Não executar `apply.sh`, seeds, reset, criação de banco ou alteração global de
roles pelo sensor DDL05. Fechar conexão e provar que o estado inicial retorna
após rollback; nenhuma fixture pode ficar commitada.

Os casos dinâmicos são os quatro da tabela, incluindo cada campo divergente,
preservação de linhas não afetadas e ausência de UPDATE de linha idêntica
observada independentemente do timestamp. Instrumentação de observação deve
ficar restrita à transação de teste e desaparecer no rollback. Fixture ausente
deve respeitar FKs existentes: não desabilitar constraints, apagar dependentes
ou truncar catálogo para fabricar sucesso. Se o ambiente não admite fixture
segura sob essa fronteira, registrar BLOCKED e devolver a limitação.
Fixtures NULL inválidas não são prova; a guarda null-safe é verificada
estaticamente e, se usado teste SQL de expressão, com valores tipados válidos
fora de INSERT inválido no catálogo. Isso não substitui os casos de linha real.

Comandos reais futuros, a partir da raiz desta worktree:

```bash
node --check backend/database/tests/ddl05-role-catalog.test.mjs
node --check backend/database/tests/ddl05-role-catalog.integration.test.mjs
node --test backend/database/tests/ddl05-role-catalog.test.mjs
pnpm verify:role-catalog
pnpm exec prettier --ignore-path /dev/null --check backend/database/tests/ddl05-role-catalog.test.mjs backend/database/tests/ddl05-role-catalog.integration.test.mjs
```

RED estático em TASK-0032; GREEN estático e checker em TASK-0033. O comando
abaixo somente pode ser executado depois do PASS independente dos bytes SQL
e autorização específica do ensaio, com a URL dedicada configurada e validada:

```bash
node --test backend/database/tests/ddl05-role-catalog.integration.test.mjs
```

Não usar glob que execute esse segundo arquivo durante a fase estática.
Ausência de URL, identidade errada, sensor não executado ou falha de infraestrutura
é BLOCKED/PENDENTE, jamais PASS ou RED comportamental. Revisão de entrega PASS
fecha somente o ajuste documental/SQL estático; não antecipa PASS DB.

## Upgrade preservador, DDL14 e STOP

O baseline admissível de upgrade preservador tem catálogos DDL05 e DDL14
canônicos. Corrigir conteúdo divergente de DDL05 é comportamento contratual do
upsert, mas não demonstra preservação desse conteúdo divergente no upgrade.
Antes do apply futuro, o preflight deve comparar chaves e todos os valores
catalogados das dez relações DDL14 com os VALUES canônicos, usando comparação
null-safe nas colunas nullable. São `inf.ait_state_ref`,
`inf.infraction_state_ref`, `inf.infraction_substate_ref`,
`inf.infraction_closure_motive_ref`, `inf.infraction_subject_kind_ref`,
`inf.infraction_payment_tier_ref`, `inf.notification_channel_ref`,
`inf.infraction_timer_ref`, `inf.infraction_event_ref` e
`inf.infraction_transition_ref`. Inventário ausente/incompleto ou forma de schema
desconhecida impede provar essa precondição.

**DDL14 divergente causa STOP antes de apply.** Seus dez upserts determinísticos
podem substituir valores legados divergentes; não se deduz política de
sobrescrita desta correção. Nenhuma comparação DB foi realizada por TASK-0031.
Não alterar DDL14, esconder colunas de `legacyRows`, restaurar timestamps depois
do write, pular DDL05, nem redefinir baseline após aplicação para mascarar erro.
O sensor TASK-0028 permanece integralmente congelado, incluindo comparação de
todos os valores legados `auth` após primeiro upgrade e reaplicações.

Também causam STOP: drift de fonte/hash congelado; necessidade de path adicional;
mudança de valores de negócio; outro escritor; SQL/sensor fora de allowlist;
REVIEW/FAIL/saída inválida no gate independente; tentativa 1/1 esgotada;
falta de autorização ou identidade do banco; teste vazio/skip; impossibilidade
de demonstrar rollback ou invariantes com fixture válida. Registrar path/linha
e evidência da lacuna, sem reiniciar tarefa ou ampliar fronteira.

Após 0031 → 0032 RED/freeze → 0033 GREEN, o Maestro congela candidato e obtém
delivery-review independente válido. Só então considera a continuação da mesma
TASK-0029 **1/1**, ainda preparação. Revisão dos SQL19/apply/DDL gerado reais
antes de aplicação e PASS DB integral TASK-0028 antes de TASK-0030 continuam
gates próprios. Este contrato não altera 96 planned_files de TASK-0029,
prioridade legal, Clock, RLS, 90/17, seis providers ou 14 comandos.

Aceitação documental desta tarefa:

```bash
pnpm exec prettier --ignore-path /dev/null --check work/rounds/R-0007/contracts/CTG-0001-C4-OD-V3-DDL05-IDEMPOTENCE.md
shasum -a 256 work/rounds/R-0007/contracts/CTG-0001-C4-OD-V3-DDL05-IDEMPOTENCE.md
```

O Maestro executa `git diff --check` separadamente na aceitação. A entrega
informa path, hash, resultado de formatação e qualquer reference-gap real;
não transforma especificação em alegação de SQL implementado ou banco aprovado.
