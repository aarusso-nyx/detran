# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T3` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0005 (WP-T3), ciclo 1

Grupo CTG-0005 = TASK-0013 (Architect, `contracts/CTG-0005.md`), TASK-0012 (Inspector, `tools/contracts/tests/*.test.mjs` + fixtures, 16 casos) e TASK-0010 (Engineer). Entregue: `tools/contracts/check-commands.mjs` (gate: JSON/`x-blueprint`, rota⇔controlador manuscrito nos dois sentidos por varredura AST, `code` no catálogo, `operationId` único; `inf/speed` excluído por `FLAG_GATED_CONTROLLERS`, §9.1), `tools/contracts/generate-clients.mjs` (`openapi-typescript` 7.13.0 → `packages/api-clients/src/generated/*.ts`, 47 arquivos commitados, idempotente), nove `docs/framework/contracts/*.commands.openapi.json` com 92 operações (18/8/8/6/17/12/13/2/8), três schemas + 16 schemas de evento em `docs/framework/schemas/`, pacote `@detran/api-clients`, scripts `contracts:test`/`contracts:clients`, `contracts:check` com o gate, filtro de órfãos em `generate-openapi.mjs`, seção nova no `docs/framework/contracts/README.md`. Resultados do Engineer: `node --test` 16/16, `contracts:check` "commands contracts: OK (92 operations)", `contracts:clients` idempotente, `pnpm check` exit 0. Gates completos do maestro (`pnpm check`, `backend:test:ci`) em execução sobre este candidato após reseed; resultado registrado antes do commit. Decisões vinculantes do Architect em §9 (itens 1–13, anexa): status/códigos transcritos como o código montado devolve (OD-T70/T71), enum do recibo sem os três códigos abreviados no catálogo (OD-T72), sem schema de `integration.item.changed` (OD-T73). Anexos: CTG-0005 §1.1–§1.2 (formato), §3–§4 (assinaturas), §9 (adenda); relatório TASK-0010 (tabela das 92 operações); `--stat` dos arquivos gerados/contratos/schemas; diff de `tools/contracts/*` (ferramentas e testes), `package.json`, README, um contrato completo (`BP-INF-ALCOHOL-001`, 6 operações), três schemas representativos e o pacote `api-clients`. Os demais contratos e schemas estão na worktree em `docs/framework/contracts/` e `docs/framework/schemas/` para inspeção direta.

## Anexo — CTG-0005 §1.1–§1.2, §3–§4, §9

````markdown
## 1. Formato dos `*.commands.openapi.json` (M19)

### 1.1 Topo do documento

```text
openapi              "3.1.0"                          (igual ao gerado)
info.title           "<Módulo> — comandos manuscritos (<x-blueprint>)"
info.version         semver do próprio documento de comandos, começando em "1.0.0" e
                     incrementado à mão quando a superfície de comandos muda. NÃO é a
                     `module.version` do blueprint: o documento é manuscrito e não
                     acompanha a regeneração do CRUD. O gate só exige que seja string
                     não vazia (§3.3).
info.description     uma frase dizendo o que o arquivo cobre e de onde vem
info.x-blueprint     id de um arquivo existente em docs/framework/blueprints/<id>.json
info.x-commands      true                             (marca o documento como manuscrito)
info.x-source        "teat-route-contract.md §<n>"    (§2.1 fixa o §n de cada arquivo)
paths                um path por rota manuscrita montada; um método por operação
components.schemas   só as DTOs referenciadas por `requestBody` (§1.2 item 5)
```
````

O documento **não** carrega `info.x-generated`: esse marcador é do gerador e continua exclusivo
dos arquivos gerados (é assim que o filtro de órfãos e a leitura humana separam os dois mundos).

### 1.2 Operação — regras campo a campo

```text
 1. tags          [ "<recurso de política sem o prefixo de domínio>" ], ex.: ["ait"],
                  ["evidence-access-request"] — uma tag por recurso, estável
 2. operationId   §2.2; único em todos os nove arquivos somados
 3. summary       uma linha em pt-BR; o verbo do comando e o agregado
 4. x-policy      "<domínio>:<recurso>:<ação>" exatamente como os decoradores
                  @Resource/@Action do método (o gate não lê, o revisor lê)
    x-audit       o `action` do @Audit quando o método tem @Audit; ausente nas leituras
    x-command     caminho do arquivo `*.command.ts` que executa (ou do serviço)
    x-contract    "CTG-000n §m" — o bloco de comando que originou a operação
 5. requestBody   obrigatório quando o método tem @Body tipado:
                  { required: true, content: { "application/json": {
                      schema: { $ref: "#/components/schemas/<DTO da origem>" },
                      example: { … ids de fixture … } } } }
                  ausente quando o comando não tem corpo (GET, e os POST cujo bloco de
                  CTG diz "DTO —")
                  quando o corpo é `Record<string, unknown>` no controlador (§2.2, bloco
                  BP-OPS-FIELD-001), o schema é
                  { type: "object", additionalProperties: true, description: "…" } com
                  `x-source-pending` apontando a OD — nunca uma cópia manual do schema
                  gerado (ADR-0007: não se transcreve artefato gerado)
 6. parameters    na ordem: path params (um por `{param}`, `required: true`), depois
                  query params (quando houver), depois headers:
                    If-Match          in: header, required: true, schema: { type: string },
                                      description citando 428/412 — só nas operações
                                      marcadas `If-Match` em §2.2
                    Idempotency-Key   in: header, required: false, schema: { type: string }
                                      — em todo POST (o kernel STYNX trata o replay no
                                      pipeline; provado por
                                      backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts)
 7. responses     a) exatamente um status de sucesso, o que o controlador montado devolve
                     hoje (coluna "ok" de §2.2). `POST /cancel-requests` é a única com
                     dois (201 e 202, CTG-0001 §4.15). `POST …/administrative-measures/
                     {id}/cancel` é a única sem sucesso: só declara 409 (CTG-0004 §4.7).
                     Schema do sucesso: inline, com as chaves da linha "resposta" do bloco
                     de CTG correspondente; `example` com ids de fixture.
                  b) headers da resposta de sucesso:
                       ETag                    nas operações marcadas `If-Match`
                       idempotency-replayed    em todo POST (string "true" no replay)
                  c) um status por família de erro, com o schema de erro **inline**
                     (§1.2 item 8) — nunca `$ref`, para que o `code.enum` fique sempre
                     no caminho fixo que o gate lê:
                       responses.<status>.content["application/json"]
                         .schema.properties.code.enum
                  d) o conjunto genérico entra em toda operação (§1.2 item 9)
 8. schema de erro (inline, idêntico em forma, diferente só no enum e no const):
                  { "type": "object",
                    "required": ["code", "status", "message"],
                    "additionalProperties": false,
                    "properties": {
                      "code":       { "type": "string", "enum": [ … ] },
                      "status":     { "type": "integer", "const": <status> },
                      "message":    { "type": "string" },
                      "messageKey": { "type": "string" },
                      "requestId":  { "type": "string" },
                      "context":    { "type": "object", "additionalProperties": true } } }
 9. conjuntos de resposta que se somam aos códigos específicos de §2.2:
      G (todo POST de comando)
        400  TEAT.VALIDATION_FAILED · TEAT.ENUM_INVALID
        401  TEAT.AUTH_REQUIRED
        403  TEAT.FORBIDDEN_ACTION
        404  TEAT.TENANT_MISMATCH
        500  TEAT.INTERNAL
      R (toda leitura GET)
        401  TEAT.AUTH_REQUIRED
        403  TEAT.FORBIDDEN_ACTION
        404  TEAT.TENANT_MISMATCH
        500  TEAT.INTERNAL
      C (operação marcada `If-Match` em §2.2)
        412  TEAT.VERSION_CONFLICT
        428  TEAT.IF_MATCH_REQUIRED
      K (todo POST) — replay de Idempotency-Key com corpo divergente
        422 com `"x-kernel": "idempotency"` na própria resposta e **sem** `code.enum`:
        o 422 é do kernel @stynx-nyx/idempotency e não carrega código do catálogo; o
        catálogo prevê TEAT.IDEMPOTENCY_REPLAY 409, que o kernel não emite (OD-T45).
        É a **única** resposta 4xx/5xx admitida sem `code.enum` (§3.3 regra 3).
      quando um status aparece em G/R/C e também nos específicos, os códigos se somam num
      único enum ordenado alfabeticamente (um status = uma resposta)
10. os códigos específicos de cada operação são os da linha "erros" do bloco de CTG citado
    em `x-contract`; o Engineer não acrescenta nem remove nenhum
```

## 3. `tools/contracts/check-commands.mjs`

Molde: `tools/parameters/verify.mjs` (CLI `.mjs` com opções de diretório, para que os testes do
Inspector o rodem sobre fixtures em diretório temporário) e `tools/verify-controller-decorators.ts`
(varredura de controladores por AST do `typescript`, já disponível no workspace).

### 3.1 Assinatura

```text
export function checkCommands({
  contractsDir,       // default: <root>/docs/framework/contracts
  controllerRoots,    // default: CONTROLLER_ROOTS (§3.2); array de caminhos
  catalogPath,        // default: <root>/docs/framework/arch/teat-error-catalog.md
  blueprintsDir,      // default: <root>/docs/framework/blueprints
}): {
  ok: boolean,          // problems.length === 0
  operations: number,   // total de operações válidas encontradas nos *.commands.openapi.json
  problems: Array<{
    kind:   'missing-route' | 'missing-operation' | 'unknown-error-code'
          | 'duplicate-operation-id' | 'unknown-blueprint' | 'invalid-json',
    file:   string,     // caminho relativo à raiz do repositório
    detail: string,     // uma linha, em pt-BR, com rota/código/operationId envolvido
  }>,
}
```

Funções puras e exportadas, para o Inspector montar casos sem passar pelo CLI:

```text
export function scanControllers(controllerRoots) → Array<{
  method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'ALL'|'HEAD'|'OPTIONS',
  path:   string,        // já normalizada (§3.2)
  file:   string,
  line:   number,
}>
export function parseErrorCatalog(catalogPath) → Set<string>   // todos os `TEAT.*` do documento
export function collectOperations(contractsDir) → { operations, problems }
```

O módulo é importável (`import { checkCommands } from '../check-commands.mjs'`) **e** executável;
a execução como CLI só acontece quando
`process.argv[1]` resolve para o próprio arquivo, como em `tools/parameters/verify.mjs`.

### 3.2 Varredura AST dos controladores

```text
CONTROLLER_ROOTS (constante nomeada do módulo, na ordem)
  backend/domains/inf/ait/src
  backend/domains/inf/normative/src
  backend/domains/inf/measures/src
  backend/domains/inf/alcohol/src
  backend/domains/ops/field/src/handwritten
  backend/domains/ops/offline-sync/src/handwritten
  backend/domains/ops/evidence/src/handwritten
  backend/domains/ops/snapshots/src/handwritten
  backend/app/src                      (só arquivos `teat-*.controller.ts`)

FLAG_GATED_CONTROLLERS (constante nomeada; exclusão única e auditável — §2.6)
  backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts
    motivo: módulo atrás da flag `teat.speed_meters` (default false, seed 05); a rota não
    está montada. Retirar daqui quando a flag virar `true` é ato de uma rodada futura.

seleção de arquivos
  1. recursão a partir de cada raiz
  2. arquivo entra se termina em `.controller.ts` e não contém `.spec.`
  3. diretório é podado quando seu nome é `controllers` ou `generated` (CRUD gerado,
     ADR-0007) ou `tests`
  4. em `backend/app/src`, além disso, `path.basename(file).startsWith('teat-')`
  5. arquivo em FLAG_GATED_CONTROLLERS é descartado

extração (mesma técnica de tools/verify-controller-decorators.ts)
  - classe com decorador `@Controller`: base = primeiro argumento string literal, ou '' quando
    o decorador não tem argumento
  - método com um dos decoradores de rota (`Get`, `Post`, `Put`, `Patch`, `Delete`, `All`,
    `Head`, `Options`): sub = primeiro argumento string literal, ou ''
  - argumento presente e **não** literal de string ⇒ problema `invalid-json` com
    `detail: 'rota não estática em <classe>.<método>; a superfície não é derivável do
    código-fonte'` (fail-closed: a rota não é varrida e o gate reprova)

junção e normalização
  path = '/' + [base, sub]
           .map(s => s.replace(/^\/+|\/+$/g, ''))   // tira barras nas pontas
           .filter(s => s.length > 0)
           .join('/')
  path = path.replace(/:([A-Za-z0-9_]+)/g, '{$1}')  // :id ↔ {id}
  método = nome do decorador em maiúsculas

chave de comparação
  `${method} ${path}` — o nome do parâmetro importa: `{id}` e `{correctionId}` são rotas
  distintas, e é assim que o contrato tem de escrevê-las
```

### 3.3 As seis verificações

```text
1. invalid-json
   - arquivo `*.commands.openapi.json` que não faz `JSON.parse`
   - documento sem `info`, sem `info.x-blueprint`, sem `paths`, com `paths` não-objeto,
     ou com `info.version` ausente/vazia
   - documento com `info.x-commands !== true`
   - `info.x-generated` presente (é marcador de arquivo gerado)
   - rota não estática na varredura AST (§3.2)
   detail cita o que falta; `file` é o arquivo ofensor

2. unknown-blueprint
   - `info.x-blueprint` sem `<id>.json` correspondente em `blueprintsDir`
   detail: 'x-blueprint <id> não existe em docs/framework/blueprints'
   o nome do arquivo NUNCA é usado para resolver o blueprint (BP-OPS-BOOTSTRAP-001 §2.1)

3. unknown-error-code
   a) para toda resposta de status >= 400 de toda operação: o gate lê
      `responses[status].content['application/json'].schema.properties.code.enum`
      - enum ausente ⇒ problema, salvo quando a resposta declara `"x-kernel": "idempotency"`
        (exceção única e nomeada — §1.2 item 9 conjunto K)
      - todo valor do enum tem de estar no conjunto devolvido por `parseErrorCatalog`
   b) idem para todo `enum` de uma propriedade chamada `error_code` em qualquer schema do
      documento (os códigos por item do protocolo de sincronização, §2.2)
   detail: '<operationId> resposta <status>: código <X> não está em teat-error-catalog.md'
   parseErrorCatalog extrai de `docs/framework/arch/teat-error-catalog.md` toda ocorrência
   de /`TEAT\.[A-Z0-9_]+`/ (em crases nas tabelas e em prosa na §9) e devolve o Set

4. duplicate-operation-id
   - mesmo `operationId` em duas operações, no mesmo arquivo ou em arquivos diferentes
   detail: '<operationId> aparece em <arquivo A> e <arquivo B>'

5. missing-route
   (contrato → código) operação cuja chave `${method} ${path}` não existe na varredura
   detail: '<operationId> (<MÉTODO> <rota>) não tem controlador manuscrito montado'

6. missing-operation
   (código → contrato) rota varrida cuja chave não aparece em nenhuma operação
   detail: '<MÉTODO> <rota> (<arquivo>:<linha>) não tem operação em nenhum
            *.commands.openapi.json'
```

Ordem de execução: 1 e 2 por arquivo (um arquivo com `invalid-json` não contribui operações e
não gera 5/6 por suas rotas); depois 3 e 4 sobre as operações coletadas; depois 5 e 6 sobre os
dois conjuntos de chaves. `operations` conta as operações dos arquivos que passaram em 1 e 2.

### 3.4 CLI

```text
node tools/contracts/check-commands.mjs [--contracts-dir <dir>] [--controllers <dir>]…
                                        [--catalog <arquivo>] [--blueprints <dir>]
  `--controllers` pode repetir-se; quando aparece ao menos uma vez, substitui
  CONTROLLER_ROOTS inteiro (é assim que o Inspector aponta o gate para uma fixture)

sucesso  stdout: "commands contracts: OK (<n> operations)\n"   exit 0
falha    stderr: uma linha por problema, na ordem de `problems`:
           "<kind>: <file> — <detail>\n"
         stdout: nada
         exit 1

`pnpm contracts:check` = node tools/contracts/generate-openapi.mjs --check
                      && node tools/contracts/check-commands.mjs
O gerador roda **antes**: um drift de CRUD tem de reprovar antes de o gate de comandos falar.
```

---

## 4. `tools/contracts/generate-clients.mjs`

### 4.1 Assinatura

```text
export async function generateClients({
  contractsDir,   // default: <root>/docs/framework/contracts
  outDir,         // default: <root>/packages/api-clients/src/generated
}): Promise<{ written: string[] }>
```

`written` lista, em ordem alfabética e em caminho relativo à raiz, **todo** arquivo de saída sob
a responsabilidade da execução — inclusive os cujo conteúdo não mudou. `written.length` é o `<n>`
do CLI.

### 4.2 Regras

```text
entrada   todo `*.openapi.json` de contractsDir (gerados **e** `.commands`), em ordem
          alfabética; nenhum filtro por prefixo
saída     outDir/<basename sem `.openapi.json`>.ts
          BP-INF-AIT-001.openapi.json           → BP-INF-AIT-001.ts
          BP-INF-AIT-001.commands.openapi.json  → BP-INF-AIT-001.commands.ts
geração   `openapiTS(pathToFileURL(input))` + `astToString`, exatamente como
          packages/senatran-adapter/scripts/generate-contracts.ts; `openapi-typescript`
          7.13.0 (a versão já presente no workspace)
cabeçalho primeira linha de todo arquivo gerado:
          `// Generated from docs/framework/contracts/<arquivo>. Do not edit.`
formato   `format(conteúdo, { parser: 'typescript', singleQuote: true })` do `prettier` do
          workspace — `pnpm format:check` roda sobre `packages/**` e tem de continuar limpo
idempotência
          o arquivo só é escrito quando o conteúdo difere do que está em disco; duas
          execuções seguidas produzem bytes idênticos e a mesma linha de saída
órfãos    `.ts` em outDir sem `*.openapi.json` correspondente é **removido** (é saída da
          própria ferramenta; sem isso `pnpm check` passaria com cliente de contrato morto)
índice    `packages/api-clients/src/index.ts` **não** é gerado por esta ferramenta (§6.1):
          é escrito à mão e reexporta os módulos; o gerador não o toca
CLI       node tools/contracts/generate-clients.mjs
          stdout: "clients written: <n>\n"  exit 0
          erro de `openapiTS` em qualquer entrada: stderr com o arquivo e a mensagem, exit 1
`pnpm contracts:clients` = node tools/contracts/generate-clients.mjs
```

O gerador de clientes **não** entra em `pnpm check`: ele escreve arquivos versionados e um
`--check` seria um segundo gate sobre o mesmo material. A garantia de que a saída está em dia é
`pnpm --filter @detran/api-clients typecheck` (que roda dentro de `pnpm typecheck`) mais a
revisão do PR. Registrado em §8.7 como escolha explícita.

---

## 9. Adenda do maestro (Architect, 2026-09-16, após TASK-0013)

Decisões sobre §8, vinculantes para TASK-0012, TASK-0010 e TASK-0011:

1. **§8.1 / OD-T66 — ratificado.** Nove arquivos, sem `BP-INF-SPEED-001.commands.openapi.json`;
   `backend/domains/inf/speed/**` fica fora da varredura por `FLAG_GATED_CONTROLLERS` (§3.2). A rodada
   que ligar `teat.speed_meters` cria o décimo arquivo e retira a entrada da constante, no mesmo PR.
   M19 lê-se "rotas **montadas** de `inf/{ait,normative,measures,alcohol,speed}` e `ops/*`".
2. **§8.2 / OD-T70 e §8.7 / OD-T71 — o contrato transcreve o comportamento montado.** WP-T3 é
   transcrição (build pack §WP-T3): `*.commands.openapi.json` declara os status de sucesso e os
   pares (status, `code`) que o código mesclado devolve hoje (`upload-intents` 200, `outbox/{id}/retry`
   201; `TEAT.VALIDATION_FAILED`/`TEAT.ENUM_INVALID` com 400 **e** 422 onde ocorrem). A correção do
   código para o texto de CTG-0003 §4.4, CTG-0004 §7.3 e catálogo §9 é rodada futura (OD-T70/T71);
   nenhum Engineer desta rodada altera status HTTP. O gate (§3.3 regra 3) confere só a existência do
   `code` no catálogo, não o status.
3. **§8.3 / OD-T67 — ratificado**: o schema do lote (§5.1) descreve o que `submit-batch` aceita
   (CTG-0002 §14d, `declared_keys`), não o arquivo da origem.
4. **§8.4 — `integration.item.changed`**: produtor é `teat-integrations.service.ts` (`retry`) e a
   suíte e2e de `teat-stream` (CTG-0004 §16.2); o schema do evento entra na lista de §5.4 como os
   demais.
5. **§8.5 / OD-T69 — ratificado**: sem `z.strictObject` nesta rodada; schemas de evento de
   `measure.changed`/`alcohol.changed` transcritos dos `events.ts` manuscritos.
6. **§8.6 — ratificado**: `*.commands.openapi.json` é a verdade das dezesseis rotas sombreadas;
   TASK-0011 escreve a seção "Rotas manuscritas vencem o CRUD gerado" em
   `docs/framework/contracts/README.md`. `app-versions` × `application-versions` fica em OD-T68.
7. **§8.8 — `events[]`** na resposta: transcrito como está (array opcional de `{ type, id }`), sem
   normalização.
8. **§8.9 — ratificado**: `contracts:clients` fora de `pnpm check`; `contracts:check` (com
   `check-commands.mjs`) dentro. Os arquivos gerados em `packages/api-clients/src/generated/` são
   commitados e o gate `C-5-2x` de "gerado ⇔ commitado" (§7) roda em `contracts:check`.
9. **Numeração**: OD-T65 foi alocada pelo maestro em CTG-0004 §16.6; OD-T66…OD-T71 conforme §8.10.
   Registro em `open-decisions` é de TASK-0011.
10. **`openapi-typescript`** como devDependency da raiz e `pnpm install`: ato do maestro, antes de
    TASK-0010 (§6.2).
11. **Script `contracts:test`** (após TASK-0012): `node --test tools/contracts/tests/` não expande o
    diretório no Node 24 desta instalação. TASK-0010 acrescenta `scripts["contracts:test"] =
"node --test tools/contracts/tests/*.test.mjs"` (mesma convenção de `parameters:test`) e insere
    `pnpm contracts:test` em `scripts.check` imediatamente após `pnpm parameters:test`. Os testes do
    Inspector (`tools/contracts/tests/*.test.mjs` + `fixtures/`) não são alterados pelo Engineer.
12. **Códigos `TEAT.SYNC_INVALID_*` abreviados no catálogo** (TASK-0010): `teat-error-catalog.md` §1 grafa
    `…_CRASH_RECORD`, `…_ALCOHOL_SIGNS_TERM_RECORD` e `…_AIT_CANCELLATION_REQUEST` por abreviação; nenhum
    dos quatro códigos é emitido pelo código montado (só o spec de `submit-batch`). Decisão: o enum do
    recibo fica como entregue (só códigos grafados por extenso); TASK-0011 soletra os três códigos por
    extenso no catálogo (transcrição, sem mudança semântica) — **OD-T72**; o enum é completado na rodada
    que os emitir.
13. **`integration.item.changed` sem produtor** (TASK-0010, corrige o item 4 desta adenda): `retry()` só
    atualiza a linha da outbox; o `type` só é gravado pelo helper do e2e de `teat-stream`. Decisão: sem
    schema de evento nesta rodada; §5.4 fica com 16 schemas; o filtro do SSE continua a provar o critério
    de §16.2 de CTG-0004 com o helper. Produtor real e forma de `data` — **OD-T73** (rodada de
    integrações). TASK-0011 registra OD-T72/T73 com OD-T66…T71.

````

## Anexo — relatório TASK-0010

```markdown
# TASK-0010 — Engineer (sonnet)

Papel: Engineer
Tarefa: TASK-0010
Arquivos criados/alterados:
Criados:
- `tools/contracts/check-commands.mjs` — gate dos 92 comandos manuscritos (CTG-0005 §3)
- `tools/contracts/generate-clients.mjs` — gerador de clientes TS (CTG-0005 §4)
- `docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json` (18 ops)
- `docs/framework/contracts/BP-INF-NORMATIVE-001.commands.openapi.json` (8 ops)
- `docs/framework/contracts/BP-INF-MEASURES-001.commands.openapi.json` (8 ops)
- `docs/framework/contracts/BP-INF-ALCOHOL-001.commands.openapi.json` (6 ops)
- `docs/framework/contracts/BP-OPS-FIELD-001.commands.openapi.json` (17 ops)
- `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.commands.openapi.json` (12 ops)
- `docs/framework/contracts/BP-OPS-EVIDENCE-001.commands.openapi.json` (13 ops)
- `docs/framework/contracts/BP-OPS-SNAPSHOTS-001.commands.openapi.json` (2 ops)
- `docs/framework/contracts/BP-OPS-BOOTSTRAP-001.commands.openapi.json` (8 ops; `x-blueprint: BP-OPS-FIELD-001`)
- `docs/framework/schemas/teat-offline-sync-batch.schema.json`
- `docs/framework/schemas/teat-normative-package.schema.json`
- `docs/framework/schemas/teat-bootstrap.schema.json`
- `docs/framework/schemas/events/{ait.changed, ait.concurrency-suspected, sync.batch.received, sync.conflict.opened, sync.conflict.resolved, numbering.reservation.changed, shift.changed, device.posture-changed, catalog.published, package.published, evidence.changed, custody.event, evidence.access-request.changed, probative-package.generated, measure.changed, alcohol.changed}.schema.json` (16 arquivos)
- `packages/api-clients/package.json`, `packages/api-clients/tsconfig.json`, `packages/api-clients/src/index.ts`
- `packages/api-clients/src/generated/*.ts` (47 arquivos, saída commitada de `pnpm contracts:clients`)

Alterados:
- `package.json` (raiz): `scripts.check` ganha `pnpm contracts:test` após `pnpm parameters:test`; `contracts:check` passa a rodar também `check-commands.mjs`; novos scripts `contracts:test` e `contracts:clients` (`openapi-typescript` já estava adicionado pelo maestro, não toquei nessa linha)
- `tools/contracts/generate-openapi.mjs`: única mudança, o filtro de órfãos ganha `&& !n.endsWith('.commands.openapi.json')` + comentário (CTG-0005 §6.3)
- `docs/framework/contracts/README.md`: nova seção "`*.commands.openapi.json` — hand-written command contracts" (única edição permitida pela fronteira)

Comandos executados e saída resumida:
- `node --test tools/contracts/tests/*.test.mjs` → 16 passed, 0 failed
- `pnpm contracts:test` → idem, 16/16
- `pnpm contracts:check` → "contracts are in sync with the blueprints" + "commands contracts: OK (92 operations)"
- `pnpm contracts:clients` (rodado duas vezes) → "clients written: 47" nas duas, bytes idênticos (idempotência); `packages/api-clients/src/generated/` com 47 arquivos
- `pnpm --filter @detran/api-clients typecheck` → sem erros
- `node -e "JSON.parse(...)"` sobre todo `docs/framework/schemas/*.json` e `events/*.json` → sem erro
- `pnpm format:check` → "All matched files use Prettier code style!"
- `node tools/docs/kb/check.mjs` → "OK (521 artifacts, 446 canonical tokens)" — inalterado
- `pnpm check` (rodada completa) → exit 0 (confirmado; log em `/tmp/pnpm-check-final.log`), incluindo `verify:decorators` (863 handlers, inalterado), `verify:senatran-boundary`, `verify:pec-parity`/`verify:pec-superset` e `typecheck` de todos os pacotes tocados (`inf/ait`, `inf/measures`, `inf/alcohol`, `inf/normative`, `ops/field`, `ops/offline-sync`, `ops/evidence`, `ops/snapshots`, `@detran/api-clients`)
- `git status --porcelain` final → só os arquivos listados acima; nenhum arquivo gerado (`Generated from BP-…`), teste, blueprint, DDL ou `pnpm-lock.yaml` tocado por mim

Critérios de aceitação:
- `node --test tools/contracts/tests/` (glob `*.test.mjs`, convenção de `parameters:test` — adenda §9 item 11) → 0 failed: PASS
- `pnpm contracts:check` → "contracts are in sync with the blueprints" e "commands contracts: OK (92 operations)": PASS
- `pnpm contracts:clients` → "clients written: 47" (38 gerados + 9 de comando); `pnpm --filter @detran/api-clients typecheck` sem erro: PASS
- `JSON.parse` de todo `docs/framework/schemas/*.json` e `events/*.json`: PASS
- `pnpm format:check` limpo; `node tools/docs/kb/check.mjs` → 521/446 inalterado; `pnpm check` verde: PASS
- Tabela rota → operationId → arquivo (todas as 92) e lista de schemas: PASS (abaixo)

Tabela "rota manuscrita → `operationId` → arquivo de contrato" (todas as 92):
````

POST /v1/inf/ait/aits/{id}/vehicles → teatAitVehicleAdd → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/people → teatAitPersonAdd → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/science → teatAitScience → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/finalize → teatAitFinalize → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/print-events → teatAitPrintEventAdd → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/queue-transmission → teatAitQueueTransmission → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/receive-protocol → teatAitReceiveProtocol → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/concurrency-review → teatAitReviewConcurrency → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/request-correction → teatAitRequestCorrection → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/corrections → teatAitCorrectionAdd → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/corrections/{correctionId}/approve → teatAitCorrectionApprove → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/accept → teatAitAccept → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/reject → teatAitReject → BP-INF-AIT-001
POST /v1/inf/ait/aits/{id}/archive → teatAitArchive → BP-INF-AIT-001
POST /v1/inf/ait/cancel-requests → teatAitCancelRequestCreate → BP-INF-AIT-001
POST /v1/inf/ait/cancel-requests/{id}/review → teatAitCancelRequestReview → BP-INF-AIT-001
POST /v1/inf/ait/cancel-requests/{id}/decide → teatAitCancelRequestDecide → BP-INF-AIT-001
GET /v1/inf/ait/cancel-requests/outcomes/{targetLocalActId} → teatAitCancelRequestOutcomes → BP-INF-AIT-001
POST /v1/inf/alcohol/procedures/{id}/start → teatAlcoholProcedureStart → BP-INF-ALCOHOL-001
POST /v1/inf/alcohol/procedures/{id}/tests → teatAlcoholProcedureRecordTest → BP-INF-ALCOHOL-001
POST /v1/inf/alcohol/procedures/{id}/refusals → teatAlcoholProcedureRecordRefusal → BP-INF-ALCOHOL-001
POST /v1/inf/alcohol/procedures/{id}/psychomotor-signs → teatAlcoholProcedureRecordPsychomotorSigns → BP-INF-ALCOHOL-001
POST /v1/inf/alcohol/procedures/{id}/forwardings → teatAlcoholProcedureForward → BP-INF-ALCOHOL-001
POST /v1/inf/alcohol/procedures/{id}/close → teatAlcoholProcedureClose → BP-INF-ALCOHOL-001
POST /v1/inf/measures/administrative-measures/{id}/start → teatAdministrativeMeasureStart → BP-INF-MEASURES-001
POST /v1/inf/measures/administrative-measures/{id}/retentions → teatAdministrativeMeasureRegisterRetention → BP-INF-MEASURES-001
POST /v1/inf/measures/administrative-measures/{id}/removals → teatAdministrativeMeasureRegisterRemoval → BP-INF-MEASURES-001
POST /v1/inf/measures/administrative-measures/{id}/inventories → teatAdministrativeMeasureInventoryVehicle → BP-INF-MEASURES-001
POST /v1/inf/measures/administrative-measures/{id}/terms → teatAdministrativeMeasureApplyTerm → BP-INF-MEASURES-001
POST /v1/inf/measures/retentions/{id}/release → teatAdministrativeMeasureRelease → BP-INF-MEASURES-001
POST /v1/inf/measures/administrative-measures/{id}/conclude → teatAdministrativeMeasureConclude → BP-INF-MEASURES-001
POST /v1/inf/measures/administrative-measures/{id}/cancel → teatAdministrativeMeasureCancel → BP-INF-MEASURES-001
POST /v1/inf/normative/catalogs/{id}/publish → teatNormativeCatalogPublish → BP-INF-NORMATIVE-001
POST /v1/inf/normative/catalogs/{id}/retire → teatNormativeCatalogRetire → BP-INF-NORMATIVE-001
POST /v1/inf/normative/mobile-packages/generate → teatMobileNormativePackageGenerate → BP-INF-NORMATIVE-001
POST /v1/inf/normative/mobile-packages/{id}/publish → teatMobileNormativePackagePublish → BP-INF-NORMATIVE-001
POST /v1/inf/normative/mobile-packages/{id}/retire → teatMobileNormativePackageRetire → BP-INF-NORMATIVE-001
POST /v1/inf/normative/mobile-packages/{id}/validate → teatMobileNormativePackageValidate → BP-INF-NORMATIVE-001
GET /v1/inf/normative/mobile-packages/{id}/content → teatMobileNormativePackageContent → BP-INF-NORMATIVE-001
GET /v1/inf/normative/mobile-packages/sync-metadata → teatMobileNormativePackageSyncMetadata → BP-INF-NORMATIVE-001
GET /v1/ops/mobile-bootstrap → teatMobileBootstrapRead → BP-OPS-BOOTSTRAP-001
POST /v1/ops/mobile-bootstrap/shifts → teatShiftOpen → BP-OPS-BOOTSTRAP-001
POST /v1/ops/mobile-bootstrap/shifts/{id}/close → teatShiftClose → BP-OPS-BOOTSTRAP-001
POST /v1/ops/mobile-bootstrap/sessions/handoff → teatSessionHandoff → BP-OPS-BOOTSTRAP-001
GET /v1/ops/stream → teatOpsStreamRead → BP-OPS-BOOTSTRAP-001
GET /v1/ops/integrations/outbox → teatIntegrationOutboxList → BP-OPS-BOOTSTRAP-001
POST /v1/ops/integrations/outbox/{id}/retry → teatIntegrationItemRetry → BP-OPS-BOOTSTRAP-001
GET /v1/ops/integrations/health → teatIntegrationHealth → BP-OPS-BOOTSTRAP-001
POST /v1/ops/evidence/upload-intents → teatEvidenceInitiateUpload → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence/{id}/complete-upload → teatEvidenceCompleteUpload → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence/{id}/validate → teatEvidenceValidate → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence/{id}/links → teatEvidenceLink → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence/{id}/custody-events → teatEvidenceCustodyEventAdd → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence/probative-packages/generate → teatProbativePackageGenerate → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence/maintenance/purge-expired-unverified → teatEvidencePurgeUnverified → BP-OPS-EVIDENCE-001
GET /v1/ops/evidence/evidence → teatEvidenceList → BP-OPS-EVIDENCE-001
GET /v1/ops/evidence/evidence/{id} → teatEvidenceGet → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence-access-requests → teatEvidenceAccessRequestCreate → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence-access-requests/{id}/approve → teatEvidenceAccessRequestApprove → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence-access-requests/{id}/deny → teatEvidenceAccessRequestDeny → BP-OPS-EVIDENCE-001
POST /v1/ops/evidence-access-requests/{id}/deliver → teatEvidenceAccessRequestDeliver → BP-OPS-EVIDENCE-001
POST /v1/ops/field/devices/{id}/block → teatOperationalDeviceBlock → BP-OPS-FIELD-001
POST /v1/ops/field/devices/{id}/unblock → teatOperationalDeviceUnblock → BP-OPS-FIELD-001
POST /v1/ops/field/devices/{id}/wipe → teatOperationalDeviceWipe → BP-OPS-FIELD-001
POST /v1/ops/field/homologations/{id}/renew → teatHomologationRenew → BP-OPS-FIELD-001
POST /v1/ops/field/homologations/{id}/cancel-by-audit → teatHomologationCancelByAudit → BP-OPS-FIELD-001
GET /v1/ops/field/agents → teatAgentProfileList → BP-OPS-FIELD-001
POST /v1/ops/field/agents → teatAgentProfileCreate → BP-OPS-FIELD-001
GET /v1/ops/field/devices → teatOperationalDeviceList → BP-OPS-FIELD-001
POST /v1/ops/field/devices → teatOperationalDeviceCreate → BP-OPS-FIELD-001
GET /v1/ops/field/teams → teatTeamList → BP-OPS-FIELD-001
POST /v1/ops/field/teams → teatTeamCreate → BP-OPS-FIELD-001
GET /v1/ops/field/shifts/{id} → teatShiftGet → BP-OPS-FIELD-001
POST /v1/ops/field/shifts → teatShiftCreate → BP-OPS-FIELD-001
GET /v1/ops/field/homologations → teatHomologationList → BP-OPS-FIELD-001
POST /v1/ops/field/homologations → teatHomologationCreate → BP-OPS-FIELD-001
GET /v1/ops/field/app-versions → teatApplicationVersionList → BP-OPS-FIELD-001
POST /v1/ops/field/app-versions → teatApplicationVersionCreate → BP-OPS-FIELD-001
POST /v1/ops/offline-sync/numbering-reservations/reserve → teatNumberingReservationReserve → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/offline-sync/numbering-reservations/{id}/cancel → teatNumberingReservationCancel → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/offline-sync/numbering-reservations/{id}/block → teatNumberingReservationBlock → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/offline-sync/numbering-reservations/{id}/close → teatNumberingReservationClose → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/offline-sync/numbering-reservations/{id}/reconcile → teatNumberingReservationReconcile → BP-OPS-OFFLINE-SYNC-001
GET /v1/ops/offline-sync/numbering-reservations/{id}/consumption → teatNumberingReservationConsumption → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/offline-sync/sync-batches → teatSyncBatchSubmit → BP-OPS-OFFLINE-SYNC-001
GET /v1/ops/offline-sync/receipts/{tenantId} → teatSyncReceiptList → BP-OPS-OFFLINE-SYNC-001
GET /v1/ops/offline-sync/receipts/{tenantId}/by-idempotency/{key} → teatSyncReceiptByIdempotency → BP-OPS-OFFLINE-SYNC-001
GET /v1/ops/offline-sync/sync-queue-items → teatSyncQueueItemList → BP-OPS-OFFLINE-SYNC-001
GET /v1/ops/offline-sync/sync-conflicts → teatSyncConflictList → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/offline-sync/sync-conflicts/{id}/resolve → teatSyncConflictResolve → BP-OPS-OFFLINE-SYNC-001
POST /v1/ops/snapshots/external-queries → teatExternalQueryCreate → BP-OPS-SNAPSHOTS-001
GET /v1/ops/snapshots/external-queries → teatExternalQueryList → BP-OPS-SNAPSHOTS-001

```
(nomes de arquivo sem sufixo `.commands.openapi.json`, omitido por espaço — todos em `docs/framework/contracts/`)

Schemas gerados (19): `teat-offline-sync-batch.schema.json`, `teat-normative-package.schema.json`, `teat-bootstrap.schema.json`; `events/ait.changed`, `ait.concurrency-suspected`, `sync.batch.received`, `sync.conflict.opened`, `sync.conflict.resolved`, `numbering.reservation.changed`, `shift.changed`, `device.posture-changed`, `catalog.published`, `package.published`, `evidence.changed`, `custody.event`, `evidence.access-request.changed`, `probative-package.generated`, `measure.changed`, `alcohol.changed` (16, todos `.schema.json`).

Fora do escopo / deixado:
- `events/integration.item.changed.schema.json` **não** criado apesar de CTG-0005 §9 item 4 (adenda) instruir que o produtor é `teat-integrations.service.ts` (`retry`): a leitura do código mostra que `retry()` só atualiza `status`/`available_at`/`last_error` da linha existente da outbox — nunca insere um envelope `integration.item.changed`. O único lugar que grava esse `type` é `backend/app/tests/e2e/teat-stream.e2e.spec.ts` (`insertOutboxRow`), com `aggregate.kind: 'ait'` emprestado do helper genérico e `data: { aitId }` — não é uma forma canônica de "item de integração" para transcrever sem inventar. Deixei o schema de fora e registro a questão abaixo, sem numerá-la.
- No `error_code` enum do recibo de sincronização (`BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`, operações `teatSyncBatchSubmit`/`teatSyncReceiptList`/`teatSyncReceiptByIdempotency`), omiti `TEAT.SYNC_INVALID_ALCOHOL_SIGNS_TERM_RECORD`, `TEAT.SYNC_INVALID_AIT_CANCELLATION_REQUEST` e `TEAT.SYNC_INVALID_CRASH_RECORD`: `teat-error-catalog.md` §1 linha 2 só escreve por extenso `TEAT.SYNC_INVALID_ADMINISTRATIVE_MEASURE_RECORD` e usa abreviação "…_" para os outros três (nunca grafados por extenso em nenhum ponto do arquivo). `check-commands.mjs` (regra 3b, conforme a especificação) lê literais `TEAT\.[A-Z0-9_]+`; incluir esses três no enum reprovaria o gate por "código fora do catálogo" mesmo sendo, para um leitor humano, óbvios pela convenção. Mantive só os códigos grafados por extenso e registrei a questão abaixo.
- Não escrevi testes para os schemas (`docs/framework/schemas/**`): fora da lista fechada de TASK-0012 (que cobriu só `check-commands.test.mjs`/`generate-clients.test.mjs`) e fora do pedido desta tarefa.
- `docs/meta/knowledge-base/open-decisions-rait.md`: registro formal das duas questões novas é ato do maestro/TASK-0011 (CTG-0005 §8.10), fora da minha fronteira de escrita.

OD tocadas ou propostas:
- Tocadas (implementadas conforme a adenda vinculante, §9): OD-T45 (conjunto K, 422 `x-kernel:idempotency`, sem `code.enum` quando não há código de negócio no status), OD-T66 (`FLAG_GATED_CONTROLLERS` excluindo `inf/speed`), OD-T70/OD-T71 (status/códigos transcritos exatamente como o código montado devolve hoje — `upload-intents` 200, `outbox/{id}/retry` 201, `VALIDATION_FAILED`/`ENUM_INVALID` em 400 e 422 conforme a operação), OD-T68 (seis DTOs sem tipo com `x-source-pending`), OD-T65 (`MEDIDA_LIBERADA` no schema de `measure.changed`).
- Propostas, sem numeração (a atribuir por TASK-0011/maestro): (1) três códigos `TEAT.SYNC_INVALID_*` do catálogo §1 linha 2 só existem como abreviação "…_"; cabe soletrá-los por extenso no catálogo para que os gates baseados em regex os reconheçam. (2) `integration.item.changed` não tem produtor real nem forma de `data` canônica no código montado — só um helper de teste com `aggregate.kind` emprestado; cabe decidir se o `retry()` passa a publicar esse evento de verdade (e com que `data`) antes de fixar o schema.

Bloqueios: nenhum.

Tokens brutos medidos pelo maestro: 656.744 (245 chamadas, 55 min).

```

## Anexo — `--stat`

```text
 .../contracts/BP-INF-AIT-001.commands.openapi.json | 7588 ++++++++++++++++++++
 .../BP-INF-ALCOHOL-001.commands.openapi.json       | 2224 ++++++
 .../BP-INF-MEASURES-001.commands.openapi.json      | 2879 ++++++++
 .../BP-INF-NORMATIVE-001.commands.openapi.json     | 2532 +++++++
 .../BP-OPS-BOOTSTRAP-001.commands.openapi.json     | 2781 +++++++
 .../BP-OPS-EVIDENCE-001.commands.openapi.json      | 4278 +++++++++++
 .../BP-OPS-FIELD-001.commands.openapi.json         | 4212 +++++++++++
 .../BP-OPS-OFFLINE-SYNC-001.commands.openapi.json  | 3490 +++++++++
 .../BP-OPS-SNAPSHOTS-001.commands.openapi.json     |  633 ++
 docs/framework/contracts/README.md                 |   47 +
 .../schemas/events/ait.changed.schema.json         |  292 +
 .../events/ait.concurrency-suspected.schema.json   |  121 +
 .../schemas/events/alcohol.changed.schema.json     |  163 +
 .../schemas/events/catalog.published.schema.json   |  107 +
 .../schemas/events/custody.event.schema.json       |  115 +
 .../events/device.posture-changed.schema.json      |  111 +
 .../evidence.access-request.changed.schema.json    |  123 +
 .../schemas/events/evidence.changed.schema.json    |  158 +
 .../schemas/events/measure.changed.schema.json     |  207 +
 .../numbering.reservation.changed.schema.json      |  131 +
 .../schemas/events/package.published.schema.json   |  117 +
 .../events/probative-package.generated.schema.json |  116 +
 .../schemas/events/shift.changed.schema.json       |  163 +
 .../schemas/events/sync.batch.received.schema.json |  128 +
 .../events/sync.conflict.opened.schema.json        |  113 +
 .../events/sync.conflict.resolved.schema.json      |  114 +
 docs/framework/schemas/teat-bootstrap.schema.json  |  400 ++
 .../schemas/teat-normative-package.schema.json     |   94 +
 .../schemas/teat-offline-sync-batch.schema.json    |  101 +
 packages/api-clients/package.json                  |   20 +
 .../api-clients/src/generated/BP-CH-BILLING-001.ts |  559 ++
 .../src/generated/BP-CH-BIOMETRICS-001.ts          |  545 ++
 .../src/generated/BP-CH-CLINICAL-CONTROLS-001.ts   |  158 +
 .../src/generated/BP-CH-CLINICAL-NETWORK-001.ts    |  521 ++
 .../src/generated/BP-CH-ENCOUNTERS-001.ts          |  297 +
 .../api-clients/src/generated/BP-CH-EXAMS-001.ts   |  471 ++
 .../src/generated/BP-CH-INCONSISTENCIES-001.ts     |  159 +
 .../api-clients/src/generated/BP-CH-JUNTAS-001.ts  |  682 ++
 .../generated/BP-CH-OPERATIONAL-CONTROLS-001.ts    |  157 +
 .../src/generated/BP-CH-PATIENTS-001.ts            |  202 +
 .../src/generated/BP-CH-PROCESS-BLOCKS-001.ts      |  137 +
 .../api-clients/src/generated/BP-CH-REPORTS-001.ts |  887 +++
 .../src/generated/BP-CH-RESTRICTIONS-001.ts        |  250 +
 .../src/generated/BP-CH-RETENTION-001.ts           |  369 +
 .../src/generated/BP-CH-SCHEDULING-001.ts          |  331 +
 .../src/generated/BP-CH-TELEHEALTH-001.ts          |  159 +
 .../src/generated/BP-CH-TOXICOLOGY-001.ts          |  253 +
 .../src/generated/BP-INF-AIT-001.commands.ts       | 4329 +++++++++++
 .../api-clients/src/generated/BP-INF-AIT-001.ts    | 1961 +++++
 .../src/generated/BP-INF-ALCOHOL-001.commands.ts   | 1291 ++++
 .../src/generated/BP-INF-ALCOHOL-001.ts            | 1308 ++++
 .../src/generated/BP-INF-COLLECTION-001.ts         | 1010 +++
 .../src/generated/BP-INF-INFRACTION-001.ts         |  828 +++
 .../src/generated/BP-INF-MEASURES-001.commands.ts  | 1701 +++++
 .../src/generated/BP-INF-MEASURES-001.ts           | 1957 +++++
 .../src/generated/BP-INF-NORMATIVE-001.commands.ts | 1535 ++++
 .../src/generated/BP-INF-NORMATIVE-001.ts          | 1712 +++++
 .../src/generated/BP-INF-NOTIFICATION-001.ts       |  578 ++
 .../src/generated/BP-INF-RAIT-CASE-001.ts          | 2804 ++++++++
 .../src/generated/BP-INF-RAIT-INTEGRATION-001.ts   |  248 +
 .../src/generated/BP-INF-RAIT-ORG-001.ts           | 1864 +++++
 .../src/generated/BP-INF-RAIT-SESSION-001.ts       | 1390 ++++
 .../src/generated/BP-INF-RAIT-WORKLIST-001.ts      | 2926 ++++++++
 .../api-clients/src/generated/BP-INF-SPEED-001.ts  |  650 ++
 .../api-clients/src/generated/BP-OPS-AGENCY-001.ts |  596 ++
 .../src/generated/BP-OPS-BOOTSTRAP-001.commands.ts | 1571 ++++
 .../src/generated/BP-OPS-EVIDENCE-001.commands.ts  | 2547 +++++++
 .../src/generated/BP-OPS-EVIDENCE-001.ts           | 1449 ++++
 .../src/generated/BP-OPS-EXAMPLE-001.ts            |  117 +
 .../src/generated/BP-OPS-FIELD-001.commands.ts     | 2621 +++++++
 .../api-clients/src/generated/BP-OPS-FIELD-001.ts  | 2789 +++++++
 .../generated/BP-OPS-OFFLINE-SYNC-001.commands.ts  | 2086 ++++++
 .../src/generated/BP-OPS-OFFLINE-SYNC-001.ts       | 1374 ++++
 .../src/generated/BP-OPS-PARAMETER-001.ts          |  168 +
 .../src/generated/BP-OPS-SNAPSHOTS-001.commands.ts |  360 +
 .../src/generated/BP-OPS-SNAPSHOTS-001.ts          |  983 +++
 .../src/generated/BP-PORTAL-COMPLAINTS-001.ts      |  143 +
 packages/api-clients/src/index.ts                  |   51 +
 packages/api-clients/tsconfig.json                 |   12 +
 79 files changed, 84654 insertions(+)

```

## Anexo — diff

````diff
diff --git a/docs/framework/contracts/BP-INF-ALCOHOL-001.commands.openapi.json b/docs/framework/contracts/BP-INF-ALCOHOL-001.commands.openapi.json
new file mode 100644
index 0000000..d737eab
--- /dev/null
+++ b/docs/framework/contracts/BP-INF-ALCOHOL-001.commands.openapi.json
@@ -0,0 +1,2224 @@
+{
+  "openapi": "3.1.0",
+  "info": {
+    "title": "Alcohol — comandos manuscritos (BP-INF-ALCOHOL-001)",
+    "version": "1.0.0",
+    "description": "Comandos do procedimento de alcoolemia, montados em AlcoholCommandsController.",
+    "x-blueprint": "BP-INF-ALCOHOL-001",
+    "x-commands": true,
+    "x-source": "teat-route-contract.md §6"
+  },
+  "paths": {
+    "/v1/inf/alcohol/procedures/{id}/start": {
+      "post": {
+        "tags": ["alcohol-procedure"],
+        "operationId": "teatAlcoholProcedureStart",
+        "summary": "Inicia a triagem de alcoolemia (ABORDAGEM → TRIAGEM).",
+        "x-policy": "inf:alcohol-procedure:start",
+        "x-audit": "INF_ALCOHOL_START",
+        "x-command": "backend/domains/inf/alcohol/src/handwritten/start-procedure.command.ts",
+        "x-contract": "CTG-0004 §5.1",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string",
+              "format": "uuid"
+            }
+          },
+          {
+            "name": "Idempotency-Key",
+            "in": "header",
+            "required": false,
+            "schema": {
+              "type": "string"
+            }
+          }
+        ],
+        "requestBody": {
+          "required": false,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/StartAlcoholProcedureCommandDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "Triagem iniciada.",
+            "headers": {
+              "idempotency-replayed": {
+                "description": "\"true\" quando a resposta é o replay gravado pelo kernel.",
+                "schema": {
+                  "type": "string"
+                }
+              }
+            },
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["id", "status"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "status": {
+                      "type": "string",
+                      "const": "TRIAGEM"
+                    }
+                  }
+                },
+                "example": {
+                  "id": "00000000-0000-7000-8000-0000ee000001",
+                  "status": "TRIAGEM"
+                }
+              }
+            }
+          },
+          "400": {
+            "description": "Erro de forma do payload.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ENUM_INVALID", "TEAT.VALIDATION_FAILED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 400
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "401": {
+            "description": "Sem autenticação.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.AUTH_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 401
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "403": {
+            "description": "Papel sem a chave de política exigida.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.FORBIDDEN_ACTION"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 403
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "Recurso de outro tenant ou inexistente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.TENANT_MISMATCH"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 404
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "409": {
+            "description": "Procedimento fora de ABORDAGEM.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_STATE_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 409
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "422": {
+            "description": "Replay de Idempotency-Key com corpo divergente (kernel, OD-T45).",
+            "x-kernel": "idempotency",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string"
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 422
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "500": {
+            "description": "Erro não catalogado.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.INTERNAL"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 500
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/alcohol/procedures/{id}/tests": {
+      "post": {
+        "tags": ["alcohol-procedure"],
+        "operationId": "teatAlcoholProcedureRecordTest",
+        "summary": "Registra o teste do etilômetro e classifica o resultado.",
+        "x-policy": "inf:alcohol-procedure:record-test",
+        "x-audit": "INF_ALCOHOL_TEST",
+        "x-command": "backend/domains/inf/alcohol/src/handwritten/record-test.command.ts",
+        "x-contract": "CTG-0004 §5.2",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string",
+              "format": "uuid"
+            }
+          },
+          {
+            "name": "Idempotency-Key",
+            "in": "header",
+            "required": false,
+            "schema": {
+              "type": "string"
+            }
+          }
+        ],
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/RecordAlcoholTestCommandDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "Teste registrado e resultado classificado.",
+            "headers": {
+              "idempotency-replayed": {
+                "description": "\"true\" quando a resposta é o replay gravado pelo kernel.",
+                "schema": {
+                  "type": "string"
+                }
+              }
+            },
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": [
+                    "id",
+                    "procedure_id",
+                    "result_mg_l",
+                    "max_error_mg_l",
+                    "considered_mg_l",
+                    "procedure_status"
+                  ],
+                  "additionalProperties": false,
+                  "properties": {
+                    "id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "procedure_id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "result_mg_l": {
+                      "type": "number"
+                    },
+                    "max_error_mg_l": {
+                      "type": "number"
+                    },
+                    "considered_mg_l": {
+                      "type": "number"
+                    },
+                    "procedure_status": {
+                      "type": "string"
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "400": {
+            "description": "result_mg_l ausente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": [
+                        "TEAT.ALCOHOL_RESULT_PAIR_REQUIRED",
+                        "TEAT.ENUM_INVALID",
+                        "TEAT.VALIDATION_FAILED"
+                      ]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 400
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "401": {
+            "description": "Sem autenticação.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.AUTH_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 401
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "403": {
+            "description": "Papel sem a chave de política exigida.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.FORBIDDEN_ACTION"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 403
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "Recurso de outro tenant ou inexistente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.TENANT_MISMATCH"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 404
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "409": {
+            "description": "Procedimento fora de TRIAGEM/ETILOMETRO_OFERECIDO.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_STATE_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 409
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "422": {
+            "description": "Etilômetro sem verificação vigente, ou pacote sem tabela metrológica ativa, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45).",
+            "x-kernel": "idempotency",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": [
+                        "TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED",
+                        "TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING"
+                      ]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 422
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "500": {
+            "description": "Erro não catalogado.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.INTERNAL"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 500
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/alcohol/procedures/{id}/refusals": {
+      "post": {
+        "tags": ["alcohol-procedure"],
+        "operationId": "teatAlcoholProcedureRecordRefusal",
+        "summary": "Registra recusa ou impossibilidade técnica do teste.",
+        "x-policy": "inf:alcohol-procedure:record-refusal",
+        "x-audit": "INF_ALCOHOL_REFUSAL",
+        "x-command": "backend/domains/inf/alcohol/src/handwritten/record-refusal.command.ts",
+        "x-contract": "CTG-0004 §5.3",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string",
+              "format": "uuid"
+            }
+          },
+          {
+            "name": "Idempotency-Key",
+            "in": "header",
+            "required": false,
+            "schema": {
+              "type": "string"
+            }
+          }
+        ],
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/RecordAlcoholRefusalCommandDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "Recusa/impossibilidade registrada.",
+            "headers": {
+              "idempotency-replayed": {
+                "description": "\"true\" quando a resposta é o replay gravado pelo kernel.",
+                "schema": {
+                  "type": "string"
+                }
+              }
+            },
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": [
+                    "id",
+                    "procedure_id",
+                    "kind",
+                    "procedure_status"
+                  ],
+                  "additionalProperties": false,
+                  "properties": {
+                    "id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "procedure_id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "kind": {
+                      "type": "string"
+                    },
+                    "procedure_status": {
+                      "type": "string"
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "400": {
+            "description": "kind ausente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": [
+                        "TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED",
+                        "TEAT.ENUM_INVALID",
+                        "TEAT.VALIDATION_FAILED"
+                      ]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 400
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "401": {
+            "description": "Sem autenticação.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.AUTH_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 401
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "403": {
+            "description": "Papel sem a chave de política exigida.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.FORBIDDEN_ACTION"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 403
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "Recurso de outro tenant ou inexistente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.TENANT_MISMATCH"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 404
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "409": {
+            "description": "Procedimento fora de TRIAGEM/ETILOMETRO_OFERECIDO.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_STATE_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 409
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "422": {
+            "description": "Replay de Idempotency-Key com corpo divergente (kernel, OD-T45).",
+            "x-kernel": "idempotency",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string"
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 422
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "500": {
+            "description": "Erro não catalogado.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.INTERNAL"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 500
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/alcohol/procedures/{id}/psychomotor-signs": {
+      "post": {
+        "tags": ["alcohol-procedure"],
+        "operationId": "teatAlcoholProcedureRecordPsychomotorSigns",
+        "summary": "Registra o conjunto de sinais psicomotores observados.",
+        "x-policy": "inf:alcohol-procedure:record-psychomotor-signs",
+        "x-audit": "INF_ALCOHOL_SIGNS",
+        "x-command": "backend/domains/inf/alcohol/src/handwritten/record-signs.command.ts",
+        "x-contract": "CTG-0004 §5.4",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string",
+              "format": "uuid"
+            }
+          },
+          {
+            "name": "Idempotency-Key",
+            "in": "header",
+            "required": false,
+            "schema": {
+              "type": "string"
+            }
+          }
+        ],
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/RecordPsychomotorSignsCommandDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "Sinais registrados.",
+            "headers": {
+              "idempotency-replayed": {
+                "description": "\"true\" quando a resposta é o replay gravado pelo kernel.",
+                "schema": {
+                  "type": "string"
+                }
+              }
+            },
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["procedure_id", "procedure_status", "signs"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "procedure_id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "procedure_status": {
+                      "type": "string"
+                    },
+                    "signs": {
+                      "type": "array",
+                      "items": {
+                        "type": "object",
+                        "additionalProperties": false,
+                        "properties": {
+                          "id": {
+                            "type": "string",
+                            "format": "uuid"
+                          },
+                          "sign_code": {
+                            "type": "string"
+                          },
+                          "observed": {
+                            "type": "boolean"
+                          }
+                        }
+                      }
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "400": {
+            "description": "Erro de forma do payload.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ENUM_INVALID", "TEAT.VALIDATION_FAILED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 400
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "401": {
+            "description": "Sem autenticação.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.AUTH_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 401
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "403": {
+            "description": "Papel sem a chave de política exigida.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.FORBIDDEN_ACTION"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 403
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "Recurso de outro tenant ou inexistente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.TENANT_MISMATCH"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 404
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "409": {
+            "description": "Procedimento fora dos pré-estados admitidos.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_STATE_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 409
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "422": {
+            "description": "Menos de dois sinais observados (RN-TEAT-132), ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45).",
+            "x-kernel": "idempotency",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_SIGNS_SET_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 422
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "500": {
+            "description": "Erro não catalogado.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.INTERNAL"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 500
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/alcohol/procedures/{id}/forwardings": {
+      "post": {
+        "tags": ["alcohol-procedure"],
+        "operationId": "teatAlcoholProcedureForward",
+        "summary": "Registra o encaminhamento a outro meio de prova.",
+        "x-policy": "inf:alcohol-procedure:forward",
+        "x-audit": "INF_ALCOHOL_FORWARD",
+        "x-command": "backend/domains/inf/alcohol/src/handwritten/forward-procedure.command.ts",
+        "x-contract": "CTG-0004 §5.5",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string",
+              "format": "uuid"
+            }
+          },
+          {
+            "name": "Idempotency-Key",
+            "in": "header",
+            "required": false,
+            "schema": {
+              "type": "string"
+            }
+          }
+        ],
+        "requestBody": {
+          "required": true,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/RecordAlcoholForwardingCommandDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "201": {
+            "description": "Encaminhamento registrado.",
+            "headers": {
+              "idempotency-replayed": {
+                "description": "\"true\" quando a resposta é o replay gravado pelo kernel.",
+                "schema": {
+                  "type": "string"
+                }
+              }
+            },
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": [
+                    "id",
+                    "procedure_id",
+                    "forwarding_type",
+                    "destination",
+                    "procedure_status"
+                  ],
+                  "additionalProperties": false,
+                  "properties": {
+                    "id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "procedure_id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "forwarding_type": {
+                      "type": "string"
+                    },
+                    "destination": {
+                      "type": "string"
+                    },
+                    "procedure_status": {
+                      "type": "string"
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "400": {
+            "description": "Erro de forma do payload.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ENUM_INVALID", "TEAT.VALIDATION_FAILED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 400
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "401": {
+            "description": "Sem autenticação.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.AUTH_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 401
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "403": {
+            "description": "Papel sem a chave de política exigida.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.FORBIDDEN_ACTION"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 403
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "Recurso de outro tenant ou inexistente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.TENANT_MISMATCH"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 404
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "409": {
+            "description": "Procedimento fora dos pré-estados admitidos.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_STATE_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 409
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "422": {
+            "description": "forwarding_type fora do vocabulário desta rodada, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45).",
+            "x-kernel": "idempotency",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ENUM_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 422
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "500": {
+            "description": "Erro não catalogado.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.INTERNAL"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 500
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          }
+        }
+      }
+    },
+    "/v1/inf/alcohol/procedures/{id}/close": {
+      "post": {
+        "tags": ["alcohol-procedure"],
+        "operationId": "teatAlcoholProcedureClose",
+        "summary": "Fecha o procedimento no estado terminal correspondente.",
+        "x-policy": "inf:alcohol-procedure:close",
+        "x-audit": "INF_ALCOHOL_CLOSE",
+        "x-command": "backend/domains/inf/alcohol/src/handwritten/close-procedure.command.ts",
+        "x-contract": "CTG-0004 §5.6",
+        "parameters": [
+          {
+            "name": "id",
+            "in": "path",
+            "required": true,
+            "schema": {
+              "type": "string",
+              "format": "uuid"
+            }
+          },
+          {
+            "name": "Idempotency-Key",
+            "in": "header",
+            "required": false,
+            "schema": {
+              "type": "string"
+            }
+          }
+        ],
+        "requestBody": {
+          "required": false,
+          "content": {
+            "application/json": {
+              "schema": {
+                "$ref": "#/components/schemas/CloseAlcoholProcedureCommandDto"
+              }
+            }
+          }
+        },
+        "responses": {
+          "200": {
+            "description": "Procedimento fechado.",
+            "headers": {
+              "idempotency-replayed": {
+                "description": "\"true\" quando a resposta é o replay gravado pelo kernel.",
+                "schema": {
+                  "type": "string"
+                }
+              }
+            },
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["id", "status", "outcome"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "id": {
+                      "type": "string",
+                      "format": "uuid"
+                    },
+                    "status": {
+                      "type": "string"
+                    },
+                    "outcome": {
+                      "type": "string"
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "400": {
+            "description": "Erro de forma do payload.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ENUM_INVALID", "TEAT.VALIDATION_FAILED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 400
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "401": {
+            "description": "Sem autenticação.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.AUTH_REQUIRED"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 401
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "403": {
+            "description": "Papel sem a chave de política exigida.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.FORBIDDEN_ACTION"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 403
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "404": {
+            "description": "Recurso de outro tenant ou inexistente.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.TENANT_MISMATCH"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 404
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "409": {
+            "description": "Procedimento fora dos pré-estados admitidos.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.ALCOHOL_STATE_INVALID"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 409
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "422": {
+            "description": "Resultado crime sem encaminhamento, ou outro-meio-de-prova sem outcome válido, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45).",
+            "x-kernel": "idempotency",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": [
+                        "TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME",
+                        "TEAT.ALCOHOL_TERM_MINIMUM_CONTENT"
+                      ]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 422
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          },
+          "500": {
+            "description": "Erro não catalogado.",
+            "content": {
+              "application/json": {
+                "schema": {
+                  "type": "object",
+                  "required": ["code", "status", "message"],
+                  "additionalProperties": false,
+                  "properties": {
+                    "code": {
+                      "type": "string",
+                      "enum": ["TEAT.INTERNAL"]
+                    },
+                    "status": {
+                      "type": "integer",
+                      "const": 500
+                    },
+                    "message": {
+                      "type": "string"
+                    },
+                    "messageKey": {
+                      "type": "string"
+                    },
+                    "requestId": {
+                      "type": "string"
+                    },
+                    "context": {
+                      "type": "object",
+                      "additionalProperties": true
+                    }
+                  }
+                }
+              }
+            }
+          }
+        }
+      }
+    }
+  },
+  "components": {
+    "schemas": {
+      "StartAlcoholProcedureCommandDto": {
+        "type": "object",
+        "additionalProperties": false,
+        "properties": {
+          "user_ref": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "reason": {
+            "type": "string"
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true
+          }
+        }
+      },
+      "RecordAlcoholTestCommandDto": {
+        "type": "object",
+        "additionalProperties": false,
+        "required": ["breathalyzer_id", "result_mg_l"],
+        "properties": {
+          "breathalyzer_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "test_number": {
+            "type": "string",
+            "maxLength": 80
+          },
+          "tested_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "result_mg_l": {
+            "type": "number"
+          },
+          "counterproof": {
+            "type": "boolean"
+          },
+          "result_image_evidence_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "outcome": {
+            "type": "string"
+          },
+          "user_ref": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "reason": {
+            "type": "string"
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true
+          }
+        }
+      },
+      "RecordAlcoholRefusalCommandDto": {
+        "type": "object",
+        "additionalProperties": false,
+        "required": ["refusal_description", "kind"],
+        "properties": {
+          "refused_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "refusal_description": {
+            "type": "string"
+          },
+          "witness_person_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "evidence_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "kind": {
+            "type": "string",
+            "enum": ["refusal", "technical_impossibility"]
+          },
+          "user_ref": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "reason": {
+            "type": "string"
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true
+          }
+        }
+      },
+      "RecordPsychomotorSignsCommandDto": {
+        "type": "object",
+        "additionalProperties": false,
+        "required": ["signs"],
+        "properties": {
+          "signs": {
+            "type": "array",
+            "minItems": 1,
+            "items": {
+              "type": "object",
+              "additionalProperties": false,
+              "required": ["sign_code", "description"],
+              "properties": {
+                "sign_code": {
+                  "type": "string",
+                  "maxLength": 80
+                },
+                "description": {
+                  "type": "string"
+                },
+                "observed": {
+                  "type": "boolean",
+                  "default": true
+                },
+                "sign_group": {
+                  "type": "string",
+                  "maxLength": 80
+                },
+                "sign_status": {
+                  "type": "string",
+                  "maxLength": 20
+                },
+                "method": {
+                  "type": "string",
+                  "maxLength": 120
+                }
+              }
+            }
+          },
+          "user_ref": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "reason": {
+            "type": "string"
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true
+          }
+        }
+      },
+      "RecordAlcoholForwardingCommandDto": {
+        "type": "object",
+        "additionalProperties": false,
+        "required": ["forwarding_type", "destination"],
+        "properties": {
+          "forwarding_type": {
+            "type": "string",
+            "maxLength": 80,
+            "enum": [
+              "exame_sangue",
+              "exame_clinico",
+              "exame_laboratorial",
+              "policia_judiciaria"
+            ],
+            "description": "Vocabulário de modelagem fixado em CTG-0004 §5.5 — não é token canônico."
+          },
+          "destination": {
+            "type": "string",
+            "maxLength": 255
+          },
+          "forwarded_at": {
+            "type": "string",
+            "format": "date-time"
+          },
+          "protocol": {
+            "type": "string",
+            "maxLength": 120
+          },
+          "notes": {
+            "type": "string"
+          },
+          "user_ref": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "reason": {
+            "type": "string"
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true
+          }
+        }
+      },
+      "CloseAlcoholProcedureCommandDto": {
+        "type": "object",
+        "additionalProperties": false,
+        "properties": {
+          "outcome": {
+            "type": "string",
+            "enum": [
+              "RESULTADO_ABAIXO_LIMITE",
+              "RESULTADO_ADMINISTRATIVO",
+              "RESULTADO_CRIME"
+            ]
+          },
+          "user_ref": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "reason": {
+            "type": "string"
+          },
+          "details_json": {
+            "type": "object",
+            "additionalProperties": true
+          }
+        }
+      }
+    }
+  }
+}
diff --git a/docs/framework/contracts/README.md b/docs/framework/contracts/README.md
index d16da08..0361531 100644
--- a/docs/framework/contracts/README.md
+++ b/docs/framework/contracts/README.md
@@ -24,3 +24,50 @@ Regenerate with:
 ```bash
 pnpm contracts:openapi
````

-

+## `*.commands.openapi.json` — hand-written command contracts (WP-T3, CTG-0005) +
+A `*.openapi.json` file **with** the `.commands` suffix is the opposite of everything above:
+it is hand-written, never generated, and documents the handwritten command controllers under +`src/handwritten/` (and the few `backend/app/src/teat-*.controller.ts` ones) rather than a
+blueprint's CRUD surface. `tools/contracts/generate-openapi.mjs` ignores these files in its
+orphan scan; `tools/contracts/check-commands.mjs` is their gate instead — it cross-checks every
+route the document declares against the AST of the mounted controllers (both directions), every +`code` in a 4xx/5xx response or an `error_code` enum against `docs/framework/arch/teat-error-catalog.md`, +`operationId` uniqueness across all nine files, and that `info.x-blueprint` resolves to a real
+file in `docs/framework/blueprints/` (by `x-blueprint`, never by filename — see +`BP-OPS-BOOTSTRAP-001.commands.openapi.json` below). `pnpm contracts:check` runs the CRUD
+generator's `--check` first, then this gate; both are part of `pnpm check`. +
+Nine files today, one per TEAT command surface: +
+```text
+BP-INF-AIT-001.commands.openapi.json BP-INF-NORMATIVE-001.commands.openapi.json
+BP-INF-MEASURES-001.commands.openapi.json BP-INF-ALCOHOL-001.commands.openapi.json
+BP-OPS-FIELD-001.commands.openapi.json BP-OPS-OFFLINE-SYNC-001.commands.openapi.json
+BP-OPS-EVIDENCE-001.commands.openapi.json BP-OPS-SNAPSHOTS-001.commands.openapi.json
+BP-OPS-BOOTSTRAP-001.commands.openapi.json (bootstrap/turno/handoff/stream/integrações;

-                                                  x-blueprint: BP-OPS-FIELD-001 — no blueprint
-                                                  of its own)

+``
+
+**Rotas manuscritas vencem o CRUD gerado.** Sixteen (route, method) pairs are declared by both
+a generated blueprint contract and one of the `.commands` files above — for example
+`POST /v1/ops/offline-sync/sync-batches`, `GET`/`POST /v1/ops/snapshots/external-queries`, and
+`GET /v1/ops/evidence/evidence(/{id})`. In every one of these, the handwritten controller is
+registered before the generated CRUD controller and is the one that actually answers; the
+`.commands` document is the source of truth for that path, and the generated document is stale
+for it (CTG-0005 §8.6). `GET`/`POST /v1/ops/field/app-versions` does **not** shadow anything: the
+generated CRUD for that entity mounts at `/v1/ops/field/application-versions`, a different path
+for the same resource (tracked as OD-T68).
+
+Generate the TypeScript clients for both kinds of contract (generated and `.commands`) with:
+
+``bash
+pnpm contracts:clients
+``` +
+which writes `packages/api-clients/src/generated/<name>.ts` (see that package's own layout);
+unlike `contracts:openapi`, this generator has no `--check` mode and does not run inside +`pnpm check` — `pnpm --filter @detran/api-clients typecheck` (part of `pnpm typecheck`) is what
+keeps the committed output honest (CTG-0005 §4.2, §8.9).
diff --git a/docs/framework/schemas/events/measure.changed.schema.json b/docs/framework/schemas/events/measure.changed.schema.json
new file mode 100644
index 0000000..139d3be
--- /dev/null
+++ b/docs/framework/schemas/events/measure.changed.schema.json
@@ -0,0 +1,207 @@
+{

- "$schema": "https://json-schema.org/draft/2020-12/schema",
- "$id": "https://detran.example.invalid/schemas/events/measure.changed.schema.json",
- "title": "measure.changed",
- "description": "Transições publicadas da medida administrativa: início, liberação, conclusão e emissão de termo (CTG-0004 §4/§9; §16.6/OD-T65 acrescenta MEDIDA_LIBERADA — sem z.strictObject nesta rodada, OD-T69).",
- "type": "object",
- "additionalProperties": false,
- "required": [
- "id",
- "type",
- "domainEvent",
- "version",
- "occurredAt",
- "tenantId",
- "actor",
- "correlationId",
- "aggregate",
- "data"
- ],
- "properties": {
- "id": {
-      "type": "string",
-      "description": "Id da linha da outbox (integration.outbox.id, uuid — não ULID; CTG-0001 §11.1)."
- },
- "type": {
-      "const": "measure.changed"
- },
- "domainEvent": {
-      "type": "string",
-      "enum": [
-        "MEDIDA_INICIADA",
-        "MEDIDA_LIBERADA",
-        "MEDIDA_CONCLUIDA",
-        "TERMO_EMITIDO"
-      ]
- },
- "version": {
-      "type": "integer",
-      "minimum": 1
- },
- "occurredAt": {
-      "type": "string",
-      "format": "date-time"
- },
- "tenantId": {
-      "type": "string"
- },
- "actor": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": ["kind", "id"],
-      "properties": {
-        "kind": {
-          "type": "string",
-          "enum": ["user", "system", "timer"]
-        },
-        "id": {
-          "type": "string"
-        },
-        "role": {
-          "type": "string"
-        }
-      }
- },
- "correlationId": {
-      "type": "string"
- },
- "causationId": {
-      "type": "string"
- },
- "aggregate": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": ["kind", "id", "version"],
-      "properties": {
-        "kind": {
-          "const": "administrative-measure"
-        },
-        "id": {
-          "type": "string"
-        },
-        "version": {
-          "type": "integer",
-          "minimum": 1
-        }
-      }
- },
- "data": {
-      "oneOf": [
-        {
-          "type": "object",
-          "additionalProperties": false,
-          "title": "MEDIDA_INICIADA",
-          "required": [
-            "measureId",
-            "measureTypeId",
-            "aitId",
-            "agentId",
-            "currentStatus",
-            "startedAt"
-          ],
-          "properties": {
-            "measureId": {
-              "type": "string"
-            },
-            "measureTypeId": {
-              "type": ["string", "null"]
-            },
-            "aitId": {
-              "type": ["string", "null"]
-            },
-            "agentId": {
-              "type": ["string", "null"]
-            },
-            "currentStatus": {
-              "type": "string"
-            },
-            "startedAt": {
-              "type": "string"
-            }
-          }
-        },
-        {
-          "type": "object",
-          "additionalProperties": false,
-          "title": "MEDIDA_LIBERADA",
-          "required": ["measureId", "fromState", "toState", "releasedAt"],
-          "properties": {
-            "measureId": {
-              "type": "string"
-            },
-            "fromState": {
-              "type": "string"
-            },
-            "toState": {
-              "const": "LIBERADO_LOCAL"
-            },
-            "releasedAt": {
-              "type": "string"
-            }
-          }
-        },
-        {
-          "type": "object",
-          "additionalProperties": false,
-          "title": "MEDIDA_CONCLUIDA",
-          "required": ["measureId", "fromState", "toState", "endedAt"],
-          "properties": {
-            "measureId": {
-              "type": "string"
-            },
-            "fromState": {
-              "type": "string"
-            },
-            "toState": {
-              "type": "string"
-            },
-            "endedAt": {
-              "type": "string"
-            }
-          }
-        },
-        {
-          "type": "object",
-          "additionalProperties": false,
-          "title": "TERMO_EMITIDO",
-          "required": [
-            "measureId",
-            "termId",
-            "termType",
-            "termNumber",
-            "issuedAt",
-            "withdrawalDeadlineAt",
-            "ctbDeadlineAt",
-            "contentHash"
-          ],
-          "properties": {
-            "measureId": {
-              "type": "string"
-            },
-            "termId": {
-              "type": "string"
-            },
-            "termType": {
-              "type": "string"
-            },
-            "termNumber": {
-              "type": "string"
-            },
-            "issuedAt": {
-              "type": "string"
-            },
-            "withdrawalDeadlineAt": {
-              "type": ["string", "null"]
-            },
-            "ctbDeadlineAt": {
-              "type": ["string", "null"]
-            },
-            "contentHash": {
-              "type": "string"
-            }
-          }
-        }
-      ]
- }
- }
  +}
  diff --git a/docs/framework/schemas/teat-bootstrap.schema.json b/docs/framework/schemas/teat-bootstrap.schema.json
  new file mode 100644
  index 0000000..074d0e9
  --- /dev/null
  +++ b/docs/framework/schemas/teat-bootstrap.schema.json
  @@ -0,0 +1,400 @@
  +{
- "$schema": "https://json-schema.org/draft/2020-12/schema",
- "$id": "https://detran.example.invalid/schemas/teat-bootstrap.schema.json",
- "title": "TEAT Mobile Bootstrap",
- "description": "Resposta de GET /v1/ops/mobile-bootstrap (M9), campo a campo como CTG-0002 §6.",
- "type": "object",
- "additionalProperties": false,
- "required": [
- "protocolVersion",
- "requestedProtocolVersion",
- "snapshot",
- "context",
- "catalog",
- "normativePackage",
- "numberingReservations",
- "readiness",
- "capabilities"
- ],
- "properties": {
- "protocolVersion": {
-      "type": "string",
-      "const": "teat-mobile-bootstrap.v1"
- },
- "requestedProtocolVersion": {
-      "type": "string"
- },
- "snapshot": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": ["capturedAt", "authority"],
-      "properties": {
-        "capturedAt": {
-          "type": "string",
-          "format": "date-time"
-        },
-        "validUntil": {
-          "type": ["string", "null"],
-          "format": "date-time",
-          "description": "source_pending (OD-T14)."
-        },
-        "maxAgeSeconds": {
-          "type": ["integer", "null"],
-          "description": "source_pending (OD-T14)."
-        },
-        "authority": {
-          "type": "string",
-          "const": "server-snapshot"
-        }
-      }
- },
- "context": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": ["tenantId", "trafficAgencyId", "agent", "device", "session"],
-      "properties": {
-        "tenantId": {
-          "type": "string",
-          "format": "uuid"
-        },
-        "trafficAgencyId": {
-          "type": "string",
-          "format": "uuid"
-        },
-        "agent": {
-          "type": "object",
-          "additionalProperties": false,
-          "required": ["id", "status"],
-          "properties": {
-            "id": {
-              "type": "string",
-              "format": "uuid"
-            },
-            "operationalUnitId": {
-              "type": ["string", "null"]
-            },
-            "status": {
-              "type": "string"
-            }
-          }
-        },
-        "device": {
-          "type": "object",
-          "additionalProperties": false,
-          "required": [
-            "id",
-            "status",
-            "homologated",
-            "tamperDetected",
-            "appVersion"
-          ],
-          "properties": {
-            "id": {
-              "type": "string",
-              "format": "uuid"
-            },
-            "status": {
-              "type": "string"
-            },
-            "homologated": {
-              "type": "boolean"
-            },
-            "tamperDetected": {
-              "type": "boolean"
-            },
-            "appVersion": {
-              "type": "string"
-            }
-          }
-        },
-        "activeShift": {
-          "type": ["object", "null"],
-          "additionalProperties": false,
-          "properties": {
-            "id": {
-              "type": "string",
-              "format": "uuid"
-            },
-            "operationalUnitId": {
-              "type": "string",
-              "format": "uuid"
-            },
-            "teamId": {
-              "type": ["string", "null"],
-              "format": "uuid"
-            },
-            "patrolVehicleId": {
-              "type": ["string", "null"],
-              "format": "uuid"
-            },
-            "operationId": {
-              "type": ["string", "null"],
-              "format": "uuid"
-            },
-            "startedAt": {
-              "type": "string",
-              "format": "date-time"
-            },
-            "status": {
-              "type": "string"
-            }
-          }
-        },
-        "session": {
-          "type": "object",
-          "additionalProperties": false,
-          "required": ["id", "startedAt", "exclusive"],
-          "properties": {
-            "id": {
-              "type": "string",
-              "format": "uuid"
-            },
-            "startedAt": {
-              "type": "string",
-              "format": "date-time"
-            },
-            "exclusive": {
-              "type": "boolean"
-            }
-          }
-        }
-      }
- },
- "catalog": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": [
-        "operationalUnits",
-        "teams",
-        "patrolVehicles",
-        "operations",
-        "measurementInstruments"
-      ],
-      "properties": {
-        "operationalUnits": {
-          "type": "array",
-          "items": {
-            "type": "object",
-            "additionalProperties": false,
-            "properties": {
-              "id": {
-                "type": "string",
-                "format": "uuid"
-              },
-              "label": {
-                "type": "string"
-              }
-            }
-          }
-        },
-        "teams": {
-          "type": "array",
-          "items": {
-            "type": "object",
-            "additionalProperties": false,
-            "properties": {
-              "id": {
-                "type": "string",
-                "format": "uuid"
-              },
-              "label": {
-                "type": "string"
-              }
-            }
-          }
-        },
-        "patrolVehicles": {
-          "type": "array",
-          "items": {
-            "type": "object",
-            "additionalProperties": false,
-            "properties": {
-              "id": {
-                "type": "string",
-                "format": "uuid"
-              },
-              "label": {
-                "type": "string"
-              }
-            }
-          }
-        },
-        "operations": {
-          "type": "array",
-          "items": {
-            "type": "object",
-            "additionalProperties": false,
-            "properties": {
-              "id": {
-                "type": "string",
-                "format": "uuid"
-              },
-              "label": {
-                "type": "string"
-              }
-            }
-          }
-        },
-        "measurementInstruments": {
-          "type": "array",
-          "items": {
-            "type": "object",
-            "additionalProperties": false,
-            "properties": {
-              "id": {
-                "type": "string",
-                "format": "uuid"
-              },
-              "instrumentType": {
-                "type": "string"
-              },
-              "serialNumber": {
-                "type": "string"
-              },
-              "brand": {
-                "type": "string"
-              },
-              "model": {
-                "type": "string"
-              },
-              "inmetroModelApproval": {
-                "type": "string"
-              },
-              "verificationValidUntil": {
-                "type": "string",
-                "format": "date"
-              },
-              "verificationValid": {
-                "type": "boolean"
-              },
-              "status": {
-                "type": "string"
-              }
-            }
-          }
-        }
-      }
- },
- "normativePackage": {
-      "type": ["object", "null"],
-      "additionalProperties": false,
-      "properties": {
-        "id": {
-          "type": "string",
-          "format": "uuid"
-        },
-        "catalogId": {
-          "type": "string",
-          "format": "uuid"
-        },
-        "version": {
-          "type": "string"
-        },
-        "manifestHash": {
-          "type": "string"
-        },
-        "status": {
-          "type": "string"
-        },
-        "publishedAt": {
-          "type": "string",
-          "format": "date-time"
-        },
-        "validUntil": {
-          "type": ["string", "null"],
-          "format": "date"
-        },
-        "contentPath": {
-          "type": "string"
-        }
-      }
- },
- "numberingReservations": {
-      "type": "array",
-      "items": {
-        "type": "object",
-        "additionalProperties": false,
-        "properties": {
-          "id": {
-            "type": "string",
-            "format": "uuid"
-          },
-          "rangeId": {
-            "type": "string",
-            "format": "uuid"
-          },
-          "startNumber": {
-            "type": "integer"
-          },
-          "endNumber": {
-            "type": "integer"
-          },
-          "validUntil": {
-            "type": ["string", "null"],
-            "format": "date-time"
-          },
-          "status": {
-            "type": "string"
-          }
-        }
-      }
- },
- "readiness": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": ["preShiftReady", "offlineReady", "blockers", "warnings"],
-      "properties": {
-        "preShiftReady": {
-          "type": "boolean"
-        },
-        "offlineReady": {
-          "type": "boolean"
-        },
-        "blockers": {
-          "type": "array",
-          "items": {
-            "type": "string",
-            "enum": [
-              "SESSION_NOT_EXCLUSIVE",
-              "DEVICE_NOT_AUTHORIZED",
-              "DEVICE_TAMPER_DETECTED",
-              "DEVICE_NOT_HOMOLOGATED",
-              "APP_VERSION_NOT_ALLOWED",
-              "NORMATIVE_PACKAGE_MISSING",
-              "NORMATIVE_PACKAGE_EXPIRED",
-              "NUMBERING_RESERVATION_REQUIRED",
-              "AGENT_NOT_ACTIVE",
-              "AGENT_NOT_IN_UNIT",
-              "SHIFT_ALREADY_OPEN_ELSEWHERE"
-            ]
-          },
-          "description": "Ordem fixa do route contract §4.1 (CTG-0002 §5.3)."
-        },
-        "warnings": {
-          "type": "array",
-          "items": {
-            "type": "string",
-            "enum": ["NORMATIVE_PACKAGE_EXPIRED", "HOMOLOGATION_RENEWAL_DUE"]
-          },
-          "description": "CTG-0002 §5.3 — nunca bloqueiam."
-        }
-      }
- },
- "capabilities": {
-      "type": "object",
-      "additionalProperties": false,
-      "required": ["canOpenShift", "canOperateOffline", "canReserveNumbering"],
-      "properties": {
-        "canOpenShift": {
-          "type": "boolean"
-        },
-        "canOperateOffline": {
-          "type": "boolean"
-        },
-        "canReserveNumbering": {
-          "type": "boolean"
-        }
-      }
- }
- }
  +}
  diff --git a/docs/framework/schemas/teat-offline-sync-batch.schema.json b/docs/framework/schemas/teat-offline-sync-batch.schema.json
  new file mode 100644
  index 0000000..cb5059e
  --- /dev/null
  +++ b/docs/framework/schemas/teat-offline-sync-batch.schema.json
  @@ -0,0 +1,101 @@
  +{
- "$schema": "https://json-schema.org/draft/2020-12/schema",
- "$id": "https://detran.example.invalid/schemas/teat-offline-sync-batch.schema.json",
- "title": "TEAT Offline Sync Batch",
- "description": "Lote do protocolo de sincronização offline (teat-route-contract.md §4.3; CTG-0002 §4 e §5.13). Reconciliado com submitSyncBatchSchema de backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts (CTG-0002 §14d, declared_keys) — não é o arquivo da origem (../teat), cujas chaves de item (local_id, content_hash, payload) o comando montado não lê (OD-T67).",
- "type": "object",
- "additionalProperties": false,
- "required": [
- "traffic_agency_id",
- "device_id",
- "agent_id",
- "device_batch_id",
- "items"
- ],
- "properties": {
- "traffic_agency_id": {
-      "type": "string",
-      "format": "uuid"
- },
- "device_id": {
-      "type": "string",
-      "format": "uuid"
- },
- "agent_id": {
-      "type": "string",
-      "format": "uuid"
- },
- "device_batch_id": {
-      "type": "string",
-      "minLength": 1,
-      "maxLength": 160
- },
- "batch_sequence": {
-      "type": ["integer", "null"],
-      "minimum": 1
- },
- "items": {
-      "type": "array",
-      "minItems": 1,
-      "items": {
-        "type": "object",
-        "additionalProperties": false,
-        "required": ["entity_type", "local_entity_id", "payload_hash"],
-        "properties": {
-          "entity_type": {
-            "type": "string",
-            "minLength": 1,
-            "maxLength": 60,
-            "enum": [
-              "ait",
-              "administrative-measure",
-              "alcohol-signs-term",
-              "ait-cancel-request",
-              "ait-cancel-posfinal-request"
-            ],
-            "description": "route contract §4.3; crash-record é do BOAT e não é aceito aqui."
-          },
-          "local_entity_id": {
-            "type": "string",
-            "format": "uuid"
-          },
-          "server_entity_id": {
-            "type": ["string", "null"],
-            "format": "uuid"
-          },
-          "idempotency_key": {
-            "type": ["string", "null"],
-            "minLength": 1,
-            "maxLength": 160,
-            "description": "A ausência é o caminho legado, que nunca é aplicado — TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED."
-          },
-          "payload_hash": {
-            "type": "string",
-            "minLength": 1,
-            "maxLength": 128
-          },
-          "created_locally_at": {
-            "type": ["string", "null"],
-            "format": "date-time"
-          },
-          "payload_json": {
-            "type": ["object", "null"],
-            "additionalProperties": true
-          }
-        }
-      }
- },
- "tenant_id": {
-      "type": "string",
-      "format": "uuid",
-      "deprecated": true,
-      "description": "ignorado; tenant vem do contexto"
- },
- "normative_package_id": {
-      "type": "string",
-      "format": "uuid",
-      "deprecated": true,
-      "description": "campo do schema de origem; não é lido pelo comando"
- }
- }
  +}
  diff --git a/package.json b/package.json
  index e0bdd42..85f4629 100644
  --- a/package.json
  +++ b/package.json
  @@ -12,7 +12,7 @@
  },
  "packageManager": "pnpm@9.15.0",
  "scripts": {

* "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm verify:parameter-catalogue && pnpm typecheck && pnpm --filter @detran/ui test && pnpm --filter @detran/ui build && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset",

- "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm contracts:test && pnpm verify:parameter-catalogue && pnpm typecheck && pnpm --filter @detran/ui test && pnpm --filter @detran/ui build && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset",
  "format:check": "prettier --check .",
  "format": "prettier --write .",
  "typecheck": "pnpm -r --if-present run typecheck",
  @@ -42,7 +42,9 @@
  "verify:parameter-catalogue": "node tools/parameters/verify.mjs --check-generated --check-usage",
  "blueprints:check": "node tools/blueprints/check.mjs",
  "contracts:openapi": "node tools/contracts/generate-openapi.mjs",

* "contracts:check": "node tools/contracts/generate-openapi.mjs --check",

- "contracts:check": "node tools/contracts/generate-openapi.mjs --check && node tools/contracts/check-commands.mjs",
- "contracts:test": "node --test tools/contracts/tests/*.test.mjs",
- "contracts:clients": "node tools/contracts/generate-clients.mjs",
  "docs:sync": "npm --prefix docs/site run sync-docs",
  "docs:typecheck": "npm --prefix docs/site run typecheck",
  "docs:build": "npm --prefix docs/site run build",
  @@ -57,6 +59,7 @@
  "@aarusso-nyx/devai": "1.4.5",
  "@types/node": "^24.10.1",
  "@types/pg": "^8.15.4",
- "openapi-typescript": "7.13.0",
  "pg": "^8.20.0",
  "prettier": "^3.5.3",
  "tsx": "^4.23.13",
  diff --git a/packages/api-clients/package.json b/packages/api-clients/package.json
  new file mode 100644
  index 0000000..d916b6b
  --- /dev/null
  +++ b/packages/api-clients/package.json
  @@ -0,0 +1,20 @@
  +{
- "name": "@detran/api-clients",
- "version": "0.0.1",
- "private": true,
- "description": "Tipos TypeScript dos contratos OpenAPI do monorepo, gerados por tools/contracts/generate-clients.mjs.",
- "type": "module",
- "types": "./src/index.ts",
- "exports": {
- ".": {
-      "types": "./src/index.ts"
- }
- },
- "scripts": {
- "typecheck": "tsc --noEmit"
- },
- "devDependencies": {
- "@types/node": "^24.10.1",
- "typescript": "^6.0.3"
- }
  +}
  diff --git a/packages/api-clients/src/index.ts b/packages/api-clients/src/index.ts
  new file mode 100644
  index 0000000..1e8cff3
  --- /dev/null
  +++ b/packages/api-clients/src/index.ts
  @@ -0,0 +1,51 @@
  +// Manuscrito: um export type * por contrato OpenAPI de docs/framework/contracts/.
  +// A saída de tools/contracts/generate-clients.mjs (src/generated/**) é commitada;
  +// este arquivo nunca é tocado pelo gerador (CTG-0005 §6.1).
-

+export type * as BpChBilling001 from './generated/BP-CH-BILLING-001.js';
+export type * as BpChBiometrics001 from './generated/BP-CH-BIOMETRICS-001.js';
+export type * as BpChClinicalControls001 from './generated/BP-CH-CLINICAL-CONTROLS-001.js';
+export type * as BpChClinicalNetwork001 from './generated/BP-CH-CLINICAL-NETWORK-001.js';
+export type * as BpChEncounters001 from './generated/BP-CH-ENCOUNTERS-001.js';
+export type * as BpChExams001 from './generated/BP-CH-EXAMS-001.js';
+export type * as BpChInconsistencies001 from './generated/BP-CH-INCONSISTENCIES-001.js';
+export type * as BpChJuntas001 from './generated/BP-CH-JUNTAS-001.js';
+export type * as BpChOperationalControls001 from './generated/BP-CH-OPERATIONAL-CONTROLS-001.js';
+export type * as BpChPatients001 from './generated/BP-CH-PATIENTS-001.js';
+export type * as BpChProcessBlocks001 from './generated/BP-CH-PROCESS-BLOCKS-001.js';
+export type * as BpChReports001 from './generated/BP-CH-REPORTS-001.js';
+export type * as BpChRestrictions001 from './generated/BP-CH-RESTRICTIONS-001.js';
+export type * as BpChRetention001 from './generated/BP-CH-RETENTION-001.js';
+export type * as BpChScheduling001 from './generated/BP-CH-SCHEDULING-001.js';
+export type * as BpChTelehealth001 from './generated/BP-CH-TELEHEALTH-001.js';
+export type * as BpChToxicology001 from './generated/BP-CH-TOXICOLOGY-001.js';
+export type * as BpInfAit001Commands from './generated/BP-INF-AIT-001.commands.js';
+export type * as BpInfAit001 from './generated/BP-INF-AIT-001.js';
+export type * as BpInfAlcohol001Commands from './generated/BP-INF-ALCOHOL-001.commands.js';
+export type * as BpInfAlcohol001 from './generated/BP-INF-ALCOHOL-001.js';
+export type * as BpInfCollection001 from './generated/BP-INF-COLLECTION-001.js';
+export type * as BpInfInfraction001 from './generated/BP-INF-INFRACTION-001.js';
+export type * as BpInfMeasures001Commands from './generated/BP-INF-MEASURES-001.commands.js';
+export type * as BpInfMeasures001 from './generated/BP-INF-MEASURES-001.js';
+export type * as BpInfNormative001Commands from './generated/BP-INF-NORMATIVE-001.commands.js';
+export type * as BpInfNormative001 from './generated/BP-INF-NORMATIVE-001.js';
+export type * as BpInfNotification001 from './generated/BP-INF-NOTIFICATION-001.js';
+export type * as BpInfRaitCase001 from './generated/BP-INF-RAIT-CASE-001.js';
+export type * as BpInfRaitIntegration001 from './generated/BP-INF-RAIT-INTEGRATION-001.js';
+export type * as BpInfRaitOrg001 from './generated/BP-INF-RAIT-ORG-001.js';
+export type * as BpInfRaitSession001 from './generated/BP-INF-RAIT-SESSION-001.js';
+export type * as BpInfRaitWorklist001 from './generated/BP-INF-RAIT-WORKLIST-001.js';
+export type * as BpInfSpeed001 from './generated/BP-INF-SPEED-001.js';
+export type * as BpOpsAgency001 from './generated/BP-OPS-AGENCY-001.js';
+export type * as BpOpsBootstrap001Commands from './generated/BP-OPS-BOOTSTRAP-001.commands.js';
+export type * as BpOpsEvidence001Commands from './generated/BP-OPS-EVIDENCE-001.commands.js';
+export type * as BpOpsEvidence001 from './generated/BP-OPS-EVIDENCE-001.js';
+export type * as BpOpsExample001 from './generated/BP-OPS-EXAMPLE-001.js';
+export type * as BpOpsField001Commands from './generated/BP-OPS-FIELD-001.commands.js';
+export type * as BpOpsField001 from './generated/BP-OPS-FIELD-001.js';
+export type * as BpOpsOfflineSync001Commands from './generated/BP-OPS-OFFLINE-SYNC-001.commands.js';
+export type * as BpOpsOfflineSync001 from './generated/BP-OPS-OFFLINE-SYNC-001.js';
+export type * as BpOpsParameter001 from './generated/BP-OPS-PARAMETER-001.js';
+export type * as BpOpsSnapshots001Commands from './generated/BP-OPS-SNAPSHOTS-001.commands.js';
+export type * as BpOpsSnapshots001 from './generated/BP-OPS-SNAPSHOTS-001.js';
+export type * as BpPortalComplaints001 from './generated/BP-PORTAL-COMPLAINTS-001.js';
diff --git a/tools/contracts/check-commands.mjs b/tools/contracts/check-commands.mjs
new file mode 100644
index 0000000..900ca8b
--- /dev/null
+++ b/tools/contracts/check-commands.mjs
@@ -0,0 +1,496 @@
+#!/usr/bin/env node
+// Gate for the nine hand-written `*.commands.openapi.json` command contracts
+// (WP-T3, CTG-0005 §3). Checks each contract file for shape (§3.3 rule 1),
+// resolves `x-blueprint` against `docs/framework/blueprints/` (rule 2), and
+// cross-checks the routes it documents against the handwritten controllers
+// that are actually mounted (rules 5/6), the error codes it enumerates
+// against `teat-error-catalog.md` (rule 3), and `operationId` uniqueness
+// (rule 4). Molde: `tools/parameters/verify.mjs` (CLI shape) and
+// `tools/verify-controller-decorators.ts` (AST scan technique).
+import fs from 'node:fs';
+import path from 'node:path';
+import ts from 'typescript';
+import { fileURLToPath } from 'node:url'; +
+const root = process.cwd(); +
+export const CONTROLLER_ROOTS = [

- 'backend/domains/inf/ait/src',
- 'backend/domains/inf/normative/src',
- 'backend/domains/inf/measures/src',
- 'backend/domains/inf/alcohol/src',
- 'backend/domains/ops/field/src/handwritten',
- 'backend/domains/ops/offline-sync/src/handwritten',
- 'backend/domains/ops/evidence/src/handwritten',
- 'backend/domains/ops/snapshots/src/handwritten',
- 'backend/app/src',
  +];
-

+// Único e nomeado (CTG-0005 §2.6, §3.2): `SpeedModule` só monta atrás da
+// flag `teat.speed_meters` (default false, seed 05); a rota não está
+// montada e por isso fica fora da varredura. Retirar quando a flag virar
+// `true` (mesmo PR que cria BP-INF-SPEED-001.commands.openapi.json).
+export const FLAG_GATED_CONTROLLERS = [

- 'backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts',
  +];
-

+const ROUTE_DECORATORS = new Set([

- 'Get',
- 'Post',
- 'Put',
- 'Patch',
- 'Delete',
- 'All',
- 'Head',
- 'Options',
  +]);
-

+function toPosix(value) {

- return value.split(path.sep).join('/');
  +}
-

+function relFromRoot(absolute) {

- return toPosix(path.relative(root, absolute));
  +}
-

+function normalizeRoute(base, sub) {

- const joined = [base, sub]
- .map((segment) => segment.replace(/^\/+|\/+$/gu, ''))
- .filter((segment) => segment.length > 0)
- .join('/');
- return `/${joined}`.replace(/:([A-Za-z0-9_]+)/gu, '{$1}');
  +}
-

+function decoratorsOf(node) {

- return ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
  +}
-

+function decoratorInfo(decorator) {

- const expression = decorator.expression;
- const isCall = ts.isCallExpression(expression);
- const callee = isCall ? expression.expression : expression;
- const name = ts.isIdentifier(callee)
- ? callee.text
- : ts.isPropertyAccessExpression(callee)
-      ? callee.name.text
-      : undefined;
- const args = isCall ? expression.arguments : [];
- return { name, args };
  +}
-

+function findFilesBelow(directory) {

- if (!fs.existsSync(directory)) return [];
- const results = [];
- for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
- if (entry.isDirectory()) {
-      if (
-        entry.name === 'controllers' ||
-        entry.name === 'generated' ||
-        entry.name === 'tests'
-      )
-        continue;
-      results.push(...findFilesBelow(path.join(directory, entry.name)));
-      continue;
- }
- if (!entry.isFile()) continue;
- if (!entry.name.endsWith('.controller.ts')) continue;
- if (entry.name.includes('.spec.')) continue;
- results.push(path.join(directory, entry.name));
- }
- return results;
  +}
-

+/**

- - Scans `controllerRoots` (repo-relative or absolute) for `@Controller`
- - classes and route-decorated methods, returning the normalized route
- - surface (CTG-0005 §3.2). A route whose decorator argument is present but
- - not a string literal is reported as a `problems` entry with kind
- - `invalid-json` (fail-closed: the surface is not derivable from source).
- */
  +export function scanControllers(controllerRoots) {
- const routes = [];
- const problems = [];
- const flagGated = new Set(
- FLAG_GATED_CONTROLLERS.map((entry) => toPosix(path.resolve(root, entry))),
- );
- for (const rawRoot of controllerRoots) {
- const absoluteRoot = path.isAbsolute(rawRoot)
-      ? rawRoot
-      : path.resolve(root, rawRoot);
- const isAppSrc =
-      toPosix(absoluteRoot) === toPosix(path.resolve(root, 'backend/app/src'));
- for (const file of findFilesBelow(absoluteRoot)) {
-      if (isAppSrc && !path.basename(file).startsWith('teat-')) continue;
-      if (flagGated.has(toPosix(file))) continue;
-      const source = ts.createSourceFile(
-        file,
-        fs.readFileSync(file, 'utf8'),
-        ts.ScriptTarget.Latest,
-        true,
-      );
-      source.forEachChild((node) => {
-        if (!ts.isClassDeclaration(node)) return;
-        const classDecorators = decoratorsOf(node);
-        const controllerDecorator = classDecorators.find(
-          (decorator) => decoratorInfo(decorator).name === 'Controller',
-        );
-        if (!controllerDecorator) return;
-        const { args: controllerArgs } = decoratorInfo(controllerDecorator);
-        let base = '';
-        if (controllerArgs.length > 0) {
-          if (!ts.isStringLiteralLike(controllerArgs[0])) {
-            problems.push({
-              kind: 'invalid-json',
-              file: relFromRoot(file),
-              detail: `rota não estática em ${node.name?.text ?? '<anonymous>'} (decorador @Controller); a superfície não é derivável do código-fonte`,
-            });
-            return;
-          }
-          base = controllerArgs[0].text;
-        }
-        const className = node.name?.text ?? '<anonymous>';
-        for (const member of node.members) {
-          if (!ts.isMethodDeclaration(member)) continue;
-          const methodDecorators = decoratorsOf(member);
-          const routeDecorator = methodDecorators.find((decorator) =>
-            ROUTE_DECORATORS.has(decoratorInfo(decorator).name ?? ''),
-          );
-          if (!routeDecorator) continue;
-          const { name: decoratorName, args: routeArgs } =
-            decoratorInfo(routeDecorator);
-          const methodName = member.name.getText(source);
-          const line =
-            source.getLineAndCharacterOfPosition(member.name.getStart(source))
-              .line + 1;
-          let sub = '';
-          if (routeArgs.length > 0) {
-            if (!ts.isStringLiteralLike(routeArgs[0])) {
-              problems.push({
-                kind: 'invalid-json',
-                file: relFromRoot(file),
-                detail: `rota não estática em ${className}.${methodName}; a superfície não é derivável do código-fonte`,
-              });
-              continue;
-            }
-            sub = routeArgs[0].text;
-          }
-          routes.push({
-            method: (decoratorName ?? '').toUpperCase(),
-            path: normalizeRoute(base, sub),
-            file: relFromRoot(file),
-            line,
-          });
-        }
-      });
- }
- }
- return { routes, problems };
  +}
-

+/** Todo `TEAT.*` citado em `catalogPath` (crases ou prosa), como um Set. */
+export function parseErrorCatalog(catalogPath) {

- const text = fs.readFileSync(catalogPath, 'utf8');
- const codes = new Set();
- for (const match of text.matchAll(/TEAT\.[A-Z0-9_]+/gu)) codes.add(match[0]);
- return codes;
  +}
-

+function errorSchemaEnumsIn(document) {

- // Toda resposta 4xx/5xx com schema de erro inline (§1.2 item 8), e todo
- // `enum` de uma propriedade `error_code` em qualquer schema do documento
- // (recibos de sincronização por item, §2.2/§3.3 regra 3b).
- const found = [];
- const visitSchemaForErrorCode = (schema, pathLabel) => {
- if (!schema || typeof schema !== 'object') return;
- if (
-      schema.properties &&
-      typeof schema.properties === 'object' &&
-      schema.properties.error_code &&
-      Array.isArray(schema.properties.error_code.enum)
- ) {
-      found.push({
-        enum: schema.properties.error_code.enum,
-        label: `${pathLabel} propriedade error_code`,
-        exempt: false,
-      });
- }
- for (const [key, value] of Object.entries(schema.properties ?? {})) {
-      visitSchemaForErrorCode(value, `${pathLabel}.${key}`);
- }
- if (schema.items) visitSchemaForErrorCode(schema.items, `${pathLabel}[]`);
- };
- for (const [routePath, methods] of Object.entries(document.paths ?? {})) {
- if (!methods || typeof methods !== 'object') continue;
- for (const [method, operation] of Object.entries(methods)) {
-      if (!operation || typeof operation !== 'object' || !operation.operationId)
-        continue;
-      for (const [status, response] of Object.entries(
-        operation.responses ?? {},
-      )) {
-        const numericStatus = Number(status);
-        const schema =
-          response?.content?.['application/json']?.schema ?? undefined;
-        if (numericStatus >= 400) {
-          const enumValues = schema?.properties?.code?.enum;
-          const isIdempotencyKernel = response?.['x-kernel'] === 'idempotency';
-          if (!Array.isArray(enumValues)) {
-            if (!isIdempotencyKernel) {
-              found.push({
-                enum: [],
-                missing: true,
-                label: `${operation.operationId} resposta ${status}`,
-              });
-            }
-            continue;
-          }
-          found.push({
-            enum: enumValues,
-            label: `${operation.operationId} resposta ${status}`,
-          });
-        }
-        if (schema) visitSchemaForErrorCode(schema, `${routePath} ${method}`);
-      }
-      for (const [name, schema] of Object.entries(
-        document.components?.schemas ?? {},
-      )) {
-        visitSchemaForErrorCode(schema, `components.schemas.${name}`);
-      }
- }
- }
- return found;
  +}
-

+/**

- - Lê todo `*.commands.openapi.json` de `contractsDir` (arquivos sem o
- - sufixo `.commands` são ignorados — são saída do gerador, §0). Valida a
- - forma mínima (regra 1) e o `x-blueprint` (regra 2), e devolve as
- - operações válidas junto com os problemas encontrados nesse primeiro
- - passo.
- */
  +export function collectOperations(contractsDir, blueprintsDir) {
- const problems = [];
- const operations = [];
- if (!fs.existsSync(contractsDir)) return { operations, problems };
- const files = fs
- .readdirSync(contractsDir)
- .filter((name) => name.endsWith('.commands.openapi.json'))
- .sort();
- const blueprintIds = new Set(
- fs.existsSync(blueprintsDir)
-      ? fs
-          .readdirSync(blueprintsDir)
-          .filter((name) => name.endsWith('.json'))
-          .map((name) => name.slice(0, -'.json'.length))
-      : [],
- );
- for (const name of files) {
- const filePath = path.join(contractsDir, name);
- const relFile = relFromRoot(filePath);
- const raw = fs.readFileSync(filePath, 'utf8');
- let document;
- try {
-      document = JSON.parse(raw);
- } catch {
-      problems.push({
-        kind: 'invalid-json',
-        file: relFile,
-        detail: `${name} não é JSON válido`,
-      });
-      continue;
- }
- const info = document.info;
- const shapeProblem = (() => {
-      if (!info) return 'documento sem info';
-      if (!info['x-blueprint']) return 'info.x-blueprint ausente';
-      if (info['x-commands'] !== true) return 'info.x-commands !== true';
-      if (info['x-generated'] !== undefined)
-        return 'info.x-generated presente (marcador de arquivo gerado)';
-      if (typeof info.version !== 'string' || info.version.length === 0)
-        return 'info.version ausente ou vazia';
-      if (!document.paths || typeof document.paths !== 'object')
-        return 'documento sem paths, ou paths não é objeto';
-      return null;
- })();
- if (shapeProblem) {
-      problems.push({
-        kind: 'invalid-json',
-        file: relFile,
-        detail: shapeProblem,
-      });
-      continue;
- }
- if (!blueprintIds.has(info['x-blueprint'])) {
-      problems.push({
-        kind: 'unknown-blueprint',
-        file: relFile,
-        detail: `x-blueprint ${info['x-blueprint']} não existe em docs/framework/blueprints`,
-      });
-      continue;
- }
- for (const [routePath, methods] of Object.entries(document.paths)) {
-      if (!methods || typeof methods !== 'object') continue;
-      for (const [method, operation] of Object.entries(methods)) {
-        if (!operation || typeof operation !== 'object') continue;
-        if (!operation.operationId) continue;
-        operations.push({
-          operationId: operation.operationId,
-          method: method.toUpperCase(),
-          path: routePath,
-          file: relFile,
-          document,
-          operation,
-        });
-      }
- }
- }
- return { operations, problems };
  +}
-

+/**

- - Confere os nove `*.commands.openapi.json` contra os controladores
- - manuscritos montados e o catálogo de erros (CTG-0005 §3).
- */
  +export function checkCommands({
- contractsDir = path.resolve(root, 'docs/framework/contracts'),
- controllerRoots = CONTROLLER_ROOTS,
- catalogPath = path.resolve(root, 'docs/framework/arch/teat-error-catalog.md'),
- blueprintsDir = path.resolve(root, 'docs/framework/blueprints'),
  +} = {}) {
- const problems = [];
-
- // 1 + 2: forma e x-blueprint, por arquivo.
- const { operations, problems: shapeProblems } = collectOperations(
- contractsDir,
- blueprintsDir,
- );
- problems.push(...shapeProblems);
-
- // 3: códigos de erro fora do catálogo.
- const catalog = fs.existsSync(catalogPath)
- ? parseErrorCatalog(catalogPath)
- : new Set();
- const seenUnknown = new Set();
- for (const entry of operations) {
- for (const found of errorSchemaEnumsIn(entry.document)) {
-      if (found.missing) {
-        const key = `missing:${found.label}`;
-        if (seenUnknown.has(key)) continue;
-        seenUnknown.add(key);
-        problems.push({
-          kind: 'unknown-error-code',
-          file: entry.file,
-          detail: `${found.label}: resposta sem properties.code.enum`,
-        });
-        continue;
-      }
-      for (const code of found.enum) {
-        if (catalog.has(code)) continue;
-        const key = `${entry.file}:${found.label}:${code}`;
-        if (seenUnknown.has(key)) continue;
-        seenUnknown.add(key);
-        problems.push({
-          kind: 'unknown-error-code',
-          file: entry.file,
-          detail: `${found.label}: código ${code} não está em teat-error-catalog.md`,
-        });
-      }
- }
- }
-
- // 4: operationId duplicado.
- const byOperationId = new Map();
- for (const entry of operations) {
- if (!byOperationId.has(entry.operationId))
-      byOperationId.set(entry.operationId, []);
- byOperationId.get(entry.operationId).push(entry);
- }
- for (const [operationId, entries] of byOperationId) {
- const files = [...new Set(entries.map((entry) => entry.file))];
- if (entries.length <= 1) continue;
- const [fileA, fileB] = files.length > 1 ? files : [files[0], files[0]];
- problems.push({
-      kind: 'duplicate-operation-id',
-      file: fileA,
-      detail: `${operationId} aparece em ${fileA} e ${fileB}`,
- });
- }
-
- // Varredura dos controladores manuscritos montados.
- const { routes: scannedRoutes, problems: scanProblems } =
- scanControllers(controllerRoots);
- problems.push(...scanProblems);
-
- const routeKey = (method, routePath) => `${method} ${routePath}`;
- const scannedKeys = new Map();
- for (const route of scannedRoutes) {
- const key = routeKey(route.method, route.path);
- if (!scannedKeys.has(key)) scannedKeys.set(key, []);
- scannedKeys.get(key).push(route);
- }
- const operationKeys = new Set(
- operations.map((entry) => routeKey(entry.method, entry.path)),
- );
-
- // 5: contrato → código.
- const seenMissingRoute = new Set();
- for (const entry of operations) {
- const key = routeKey(entry.method, entry.path);
- if (scannedKeys.has(key)) continue;
- if (seenMissingRoute.has(key)) continue;
- seenMissingRoute.add(key);
- problems.push({
-      kind: 'missing-route',
-      file: entry.file,
-      detail: `${entry.operationId} (${entry.method} ${entry.path}) não tem controlador manuscrito montado`,
- });
- }
-
- // 6: código → contrato.
- for (const route of scannedRoutes) {
- const key = routeKey(route.method, route.path);
- if (operationKeys.has(key)) continue;
- problems.push({
-      kind: 'missing-operation',
-      file: route.file,
-      detail: `${route.method} ${route.path} (${route.file}:${route.line}) não tem operação em nenhum *.commands.openapi.json`,
- });
- }
-
- return { ok: problems.length === 0, operations: operations.length, problems };
  +}
-

+function parseCliArgs(argv) {

- const options = {};
- const controllerRoots = [];
- for (let i = 0; i < argv.length; i += 1) {
- const arg = argv[i];
- if (arg === '--contracts-dir') options.contractsDir = argv[++i];
- else if (arg === '--controllers') controllerRoots.push(argv[++i]);
- else if (arg === '--catalog') options.catalogPath = argv[++i];
- else if (arg === '--blueprints') options.blueprintsDir = argv[++i];
- }
- if (controllerRoots.length > 0) options.controllerRoots = controllerRoots;
- return options;
  +}
-

+function runCli() {

- const options = parseCliArgs(process.argv.slice(2));
- const result = checkCommands(options);
- if (result.ok) {
- process.stdout.write(
-      `commands contracts: OK (${result.operations} operations)\n`,
- );
- process.exit(0);
- }
- for (const problem of result.problems) {
- process.stderr.write(
-      `${problem.kind}: ${problem.file} — ${problem.detail}\n`,
- );
- }
- process.exit(1);
  +}
-

+const isMain =

- process.argv[1] !== undefined &&
- path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  +if (isMain) runCli();
  diff --git a/tools/contracts/generate-clients.mjs b/tools/contracts/generate-clients.mjs
  new file mode 100644
  index 0000000..43fd3bb
  --- /dev/null
  +++ b/tools/contracts/generate-clients.mjs
  @@ -0,0 +1,76 @@
  +#!/usr/bin/env node
  +// Generates TypeScript types for every `docs/framework/contracts/*.openapi.json`
  +// contract — generated CRUD and hand-written `.commands` alike — into
  +// `packages/api-clients/src/generated/` (CTG-0005 §4). Molde:
  +// `packages/senatran-adapter/scripts/generate-contracts.ts`.
  +import { readFile, readdir, mkdir, rm, writeFile } from 'node:fs/promises';
  +import { dirname, join, resolve } from 'node:path';
  +import { fileURLToPath, pathToFileURL } from 'node:url';
-

+import openapiTS, { astToString } from 'openapi-typescript';
+import { format } from 'prettier'; +
+const root = process.cwd(); +
+/**

- - @param {{ contractsDir?: string, outDir?: string }} [options]
- - @returns {Promise<{ written: string[] }>}
- */
  +export async function generateClients({
- contractsDir = resolve(root, 'docs/framework/contracts'),
- outDir = resolve(root, 'packages/api-clients/src/generated'),
  +} = {}) {
- const names = (await readdir(contractsDir))
- .filter((name) => name.endsWith('.openapi.json'))
- .sort();
-
- await mkdir(outDir, { recursive: true });
-
- const written = [];
- const expectedBasenames = new Set();
- for (const name of names) {
- const inputPath = join(contractsDir, name);
- const outputName = `${name.slice(0, -'.openapi.json'.length)}.ts`;
- expectedBasenames.add(outputName);
- const outputPath = join(outDir, outputName);
-
- const generated = astToString(await openapiTS(pathToFileURL(inputPath)));
- const relativeInput = `docs/framework/contracts/${name}`;
- const content = await format(
-      `// Generated from ${relativeInput}. Do not edit.\n${generated}`,
-      { parser: 'typescript', singleQuote: true },
- );
-
- const existing = await readFile(outputPath, 'utf8').catch(() => null);
- if (existing !== content) {
-      await writeFile(outputPath, content, 'utf8');
- }
- written.push(join(outDir, outputName).split('\\').join('/'));
- }
-
- const existingFiles = await readdir(outDir).catch(() => []);
- for (const name of existingFiles) {
- if (!name.endsWith('.ts')) continue;
- if (expectedBasenames.has(name)) continue;
- await rm(join(outDir, name));
- }
-
- return { written: written.sort() };
  +}
-

+async function runCli() {

- try {
- const result = await generateClients({});
- process.stdout.write(`clients written: ${result.written.length}\n`);
- } catch (error) {
- process.stderr.write(
-      `${error instanceof Error ? error.message : String(error)}\n`,
- );
- process.exitCode = 1;
- }
  +}
-

+const isMain =

- process.argv[1] !== undefined &&
- resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  +if (isMain) await runCli();
  diff --git a/tools/contracts/generate-openapi.mjs b/tools/contracts/generate-openapi.mjs
  index 97f4cf0..de77ef1 100644
  --- a/tools/contracts/generate-openapi.mjs
  +++ b/tools/contracts/generate-openapi.mjs
  @@ -235,7 +235,11 @@ for (const name of files) {
  }
  for (const name of fs
  .readdirSync(outputDir)

* .filter((n) => n.endsWith('.openapi.json')))

- // `*.commands.openapi.json` is hand-written and has its own gate
- // (tools/contracts/check-commands.mjs) — it is never generated here.
- .filter(
- (n) => n.endsWith('.openapi.json') && !n.endsWith('.commands.openapi.json'),
- ))
  if (!expected.has(name)) {
  drift = true;
  process.stderr.write(`orphan contract: ${name}\n`);
  diff --git a/tools/contracts/tests/check-commands.test.mjs b/tools/contracts/tests/check-commands.test.mjs
  new file mode 100644
  index 0000000..f55946a
  --- /dev/null
  +++ b/tools/contracts/tests/check-commands.test.mjs
  @@ -0,0 +1,352 @@
  +// Testes de `tools/contracts/check-commands.mjs` (TASK-0012, WP-T3, CTG-0005 §3 e §7).
  +//
  +// O módulo ainda não existe — TASK-0010 (Engineer) o implementa. Por isso este arquivo
  +// falha hoje inteiro por `ERR_MODULE_NOT_FOUND` na importação estática abaixo; é o
  +// vermelho esperado (CTG-0005 §7 C-5-01…C-5-16, prompt TASK-0012 item 4). Qualquer outra
  +// falha, depois que `check-commands.mjs` existir, é defeito do gate ou do teste.
  +//
  +// Fixtures em tools/contracts/tests/fixtures/check-commands/ (nunca os contratos reais,
  +// docs/meta/agents/inspector-tests.md e CTG-0005 §7). Cada caso monta um diretório
  +// temporário mínimo — um contrato de uma operação e um controlador de uma rota — e aponta
  +// o gate para ele via as opções de diretório da assinatura (CTG-0005 §3.1).
  +import assert from 'node:assert/strict';
  +import { execFile } from 'node:child_process';
  +import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
  +import { dirname, join, resolve } from 'node:path';
  +import { fileURLToPath } from 'node:url';
  +import { tmpdir } from 'node:os';
  +import { promisify } from 'node:util';
  +import test from 'node:test';
  +import { checkCommands } from '../check-commands.mjs';
-

+const exec = promisify(execFile);
+const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
+const fixturesDir = join(root, 'tools/contracts/tests/fixtures/check-commands');
+const gate = join(root, 'tools/contracts/check-commands.mjs'); +
+async function readFixture(name) {

- return readFile(join(fixturesDir, name), 'utf8');
  +}
-

+async function run(args) {

- try {
- const result = await exec(process.execPath, [gate, ...args], {
-      cwd: root,
- });
- return { status: 0, stdout: result.stdout, stderr: result.stderr };
- } catch (error) {
- return {
-      status: typeof error.code === 'number' ? error.code : 1,
-      stdout: error.stdout ?? '',
-      stderr: error.stderr ?? String(error),
- };
- }
  +}
-

+// Monta um diretório temporário com contractsDir/controllerRoots/catalogPath/blueprintsDir
+// mínimos. `contracts` e `controllers` são mapas nome de arquivo → conteúdo; por padrão
+// cada diretório recebe só a fixture base (uma operação, uma rota, ambas casando).
+async function scenario({

- contracts = { 'contract.commands.openapi.json': null },
- controllers = { 'demo-items.controller.ts': null },
- catalog = null,
- blueprint = null,
  +} = {}) {
- const dir = await mkdtemp(join(tmpdir(), 'detran-check-commands-'));
- const contractsDir = join(dir, 'contracts');
- const controllersDir = join(dir, 'controllers');
- const blueprintsDir = join(dir, 'blueprints');
- const catalogPath = join(dir, 'catalog.md');
- await mkdir(contractsDir, { recursive: true });
- await mkdir(controllersDir, { recursive: true });
- await mkdir(blueprintsDir, { recursive: true });
- for (const [name, content] of Object.entries(contracts)) {
- const text = content ?? (await readFixture(name));
- const target = join(contractsDir, name);
- await mkdir(dirname(target), { recursive: true });
- await writeFile(target, text, 'utf8');
- }
- for (const [name, content] of Object.entries(controllers)) {
- const text = content ?? (await readFixture(name));
- const target = join(controllersDir, name);
- await mkdir(dirname(target), { recursive: true });
- await writeFile(target, text, 'utf8');
- }
- await writeFile(
- catalogPath,
- catalog ?? (await readFixture('catalog.md')),
- 'utf8',
- );
- await writeFile(
- join(blueprintsDir, 'BP-DEMO-001.json'),
- blueprint ?? (await readFixture('blueprints/BP-DEMO-001.json')),
- 'utf8',
- );
- return {
- dir,
- contractsDir,
- controllerRoots: [controllersDir],
- catalogPath,
- blueprintsDir,
- };
  +}
-

+async function cleanup(s) {

- await rm(s.dir, { recursive: true, force: true });
  +}
-

+// (a) contrato válido + controlador com as mesmas rotas → ok: true, operations = n
+test('dado contrato válido e controlador com a mesma rota quando checkCommands então ok=true, operations=1 e problems=[]', async () => {

- const s = await scenario();
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, true);
- assert.equal(result.operations, 1);
- assert.deepEqual(result.problems, []);
- } finally {
- await cleanup(s);
- }
  +});
-

+// (b) rota no contrato sem controlador → missing-route
+test('dado rota no contrato sem controlador correspondente quando checkCommands então exatamente um missing-route', async () => {

- const s = await scenario({
- controllers: { 'demo-items-empty.controller.ts': null },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, false);
- assert.equal(result.problems.length, 1);
- assert.equal(result.problems[0].kind, 'missing-route');
- assert.match(result.problems[0].detail, /teatDemoItemFinalize/);
- assert.match(
-      result.problems[0].detail,
-      /POST.*\/v1\/demo\/items\/\{id\}\/finalize/,
- );
- } finally {
- await cleanup(s);
- }
  +});
-

+// (c) rota no controlador sem contrato → missing-operation
+test('dado rota no controlador sem operação correspondente quando checkCommands então exatamente um missing-operation', async () => {

- const s = await scenario({
- contracts: { 'empty-paths-contract.commands.openapi.json': null },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, false);
- assert.equal(result.operations, 0);
- assert.equal(result.problems.length, 1);
- assert.equal(result.problems[0].kind, 'missing-operation');
- assert.match(
-      result.problems[0].detail,
-      /POST.*\/v1\/demo\/items\/\{id\}\/finalize/,
- );
- assert.match(result.problems[0].file, /controller\.ts/);
- } finally {
- await cleanup(s);
- }
  +});
-

+// (d) `code` 4xx fora do catálogo → unknown-error-code
+test('dado código 4xx fora do catálogo quando checkCommands então exatamente um unknown-error-code citando o código', async () => {

- const baseline = JSON.parse(
- await readFixture('contract.commands.openapi.json'),
- );
- baseline.paths['/v1/demo/items/{id}/finalize'].post.responses['409'].content[
- 'application/json'
- ].schema.properties.code.enum = ['TEAT.GHOST_CODE'];
- const s = await scenario({
- contracts: {
-      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
- },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, false);
- assert.equal(result.problems.length, 1);
- assert.equal(result.problems[0].kind, 'unknown-error-code');
- assert.match(result.problems[0].detail, /TEAT\.GHOST_CODE/);
- } finally {
- await cleanup(s);
- }
  +});
-

+// (e) `operationId` duplicado → duplicate-operation-id
+test('dado o mesmo operationId em dois arquivos quando checkCommands então exatamente um duplicate-operation-id citando os dois arquivos', async () => {

- const s = await scenario({
- contracts: {
-      'contract.commands.openapi.json': null,
-      'contract-duplicate.commands.openapi.json': null,
- },
- controllers: { 'demo-items-two-routes.controller.ts': null },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, false);
- assert.equal(result.operations, 2);
- assert.equal(result.problems.length, 1);
- assert.equal(result.problems[0].kind, 'duplicate-operation-id');
- assert.match(result.problems[0].detail, /teatDemoItemFinalize/);
- assert.match(
-      result.problems[0].detail,
-      /contract\.commands\.openapi\.json/,
- );
- assert.match(
-      result.problems[0].detail,
-      /contract-duplicate\.commands\.openapi\.json/,
- );
- } finally {
- await cleanup(s);
- }
  +});
-

+// (f) `x-blueprint` inexistente → unknown-blueprint
+test('dado x-blueprint que não existe em blueprintsDir quando checkCommands então há um unknown-blueprint', async () => {

- const baseline = JSON.parse(
- await readFixture('contract.commands.openapi.json'),
- );
- baseline.info['x-blueprint'] = 'BP-GHOST-001';
- const s = await scenario({
- contracts: {
-      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
- },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, false);
- const unknownBlueprint = result.problems.filter(
-      (problem) => problem.kind === 'unknown-blueprint',
- );
- assert.equal(unknownBlueprint.length, 1);
- assert.match(unknownBlueprint[0].detail, /BP-GHOST-001/);
- } finally {
- await cleanup(s);
- }
  +});
-

+// (g) JSON inválido → invalid-json
+test('dado contrato com JSON quebrado quando checkCommands então exatamente um invalid-json no arquivo quebrado', async () => {

- const broken = (await readFixture('contract.commands.openapi.json')).slice(
- 0,
- -30,
- );
- const s = await scenario({
- contracts: { 'contract.commands.openapi.json': broken },
- controllers: { 'demo-items-empty.controller.ts': null },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, false);
- assert.equal(result.operations, 0);
- assert.equal(result.problems.length, 1);
- assert.equal(result.problems[0].kind, 'invalid-json');
- assert.match(result.problems[0].file, /contract\.commands\.openapi\.json/);
- } finally {
- await cleanup(s);
- }
  +});
-

+// (h) arquivo sem sufixo `.commands` é ignorado
+test('dado arquivo *.openapi.json sem sufixo .commands quando checkCommands então é ignorado (mesmo se ilegível como JSON)', async () => {

- const s = await scenario({
- contracts: {
-      'contract.commands.openapi.json': null,
-      'BP-DEMO-001.openapi.json': 'isto não é JSON válido nem deveria ser lido',
- },
- });
- try {
- const result = await checkCommands({
-      contractsDir: s.contractsDir,
-      controllerRoots: s.controllerRoots,
-      catalogPath: s.catalogPath,
-      blueprintsDir: s.blueprintsDir,
- });
- assert.equal(result.ok, true);
- assert.equal(result.operations, 1);
- assert.deepEqual(result.problems, []);
- } finally {
- await cleanup(s);
- }
  +});
-

+// (i) execução como CLI: sucesso e falha
+test('dado o repositório fixture sem problemas quando rodar a CLI então exit 0 e "commands contracts: OK (1 operations)"', async () => {

- const s = await scenario();
- try {
- const result = await run([
-      '--contracts-dir',
-      s.contractsDir,
-      '--controllers',
-      s.controllerRoots[0],
-      '--catalog',
-      s.catalogPath,
-      '--blueprints',
-      s.blueprintsDir,
- ]);
- assert.equal(result.status, 0, result.stderr);
- assert.equal(result.stdout, 'commands contracts: OK (1 operations)\n');
- } finally {
- await cleanup(s);
- }
  +});
-

+test('dado o repositório fixture com uma rota órfã quando rodar a CLI então exit 1 com a lista de problemas em stderr e stdout vazio', async () => {

- const s = await scenario({
- controllers: { 'demo-items-empty.controller.ts': null },
- });
- try {
- const result = await run([
-      '--contracts-dir',
-      s.contractsDir,
-      '--controllers',
-      s.controllerRoots[0],
-      '--catalog',
-      s.catalogPath,
-      '--blueprints',
-      s.blueprintsDir,
- ]);
- assert.equal(result.status, 1);
- assert.equal(result.stdout, '');
- assert.match(result.stderr, /^missing-route: /);
- assert.match(result.stderr, /teatDemoItemFinalize/);
- } finally {
- await cleanup(s);
- }
  +});
  diff --git a/tools/contracts/tests/fixtures/check-commands/blueprints/BP-DEMO-001.json b/tools/contracts/tests/fixtures/check-commands/blueprints/BP-DEMO-001.json
  new file mode 100644
  index 0000000..f129b45
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/blueprints/BP-DEMO-001.json
  @@ -0,0 +1,5 @@
  +{
- "id": "BP-DEMO-001",
- "module": { "name": "Demo", "version": "0.0.1" },
- "description": "Blueprint fixture do Inspector (TASK-0012, tools/contracts/tests); nunca é um blueprint real."
  +}
  diff --git a/tools/contracts/tests/fixtures/check-commands/catalog.md b/tools/contracts/tests/fixtures/check-commands/catalog.md
  new file mode 100644
  index 0000000..6d46293
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/catalog.md
  @@ -0,0 +1,14 @@
  +# Fixture error catalog (Inspector, TASK-0012, `tools/contracts/tests`)
-

+Molde reduzido de `docs/framework/arch/teat-error-catalog.md` — só os códigos usados pelas
+fixtures de `tools/contracts/tests/fixtures/check-commands/`. Nunca é lido pelo gate real. +
+| Código | Status | Quando |
+| ------------------------------ | ------ | ------------------------------------ |
+| `TEAT.DEMO_ITEM_STATE_INVALID` | 409 | fixture: estado do item incompatível | +
+## Genéricos (copiados de `teat-error-catalog.md` §9) + +`TEAT.AUTH_REQUIRED` 401, `TEAT.FORBIDDEN_ACTION` 403, `TEAT.TENANT_MISMATCH` 404, +`TEAT.VALIDATION_FAILED` 400, `TEAT.ENUM_INVALID` 400, `TEAT.IF_MATCH_REQUIRED` 428, +`TEAT.VERSION_CONFLICT` 412, `TEAT.IDEMPOTENCY_REPLAY` 409, `TEAT.INTERNAL` 500.
diff --git a/tools/contracts/tests/fixtures/check-commands/contract-duplicate.commands.openapi.json b/tools/contracts/tests/fixtures/check-commands/contract-duplicate.commands.openapi.json
new file mode 100644
index 0000000..50fbbff
--- /dev/null
+++ b/tools/contracts/tests/fixtures/check-commands/contract-duplicate.commands.openapi.json
@@ -0,0 +1,42 @@
+{

- "openapi": "3.1.0",
- "info": {
- "title": "Demo (rota B) — comandos manuscritos (BP-DEMO-001)",
- "version": "1.0.0",
- "description": "Fixture com o mesmo operationId de contract.commands.openapi.json, de propósito (tools/contracts/tests, caso duplicate-operation-id).",
- "x-blueprint": "BP-DEMO-001",
- "x-commands": true,
- "x-source": "fixture"
- },
- "paths": {
- "/v1/demo/items/{id}/other": {
-      "post": {
-        "tags": ["demo-item"],
-        "operationId": "teatDemoItemFinalize",
-        "summary": "Outra rota de exemplo (fixture; operationId duplicado de propósito).",
-        "parameters": [
-          {
-            "name": "id",
-            "in": "path",
-            "required": true,
-            "schema": { "type": "string", "format": "uuid" }
-          }
-        ],
-        "responses": {
-          "200": {
-            "description": "ok.",
-            "content": {
-              "application/json": {
-                "schema": {
-                  "type": "object",
-                  "properties": { "id": { "type": "string" } }
-                }
-              }
-            }
-          }
-        }
-      }
- }
- },
- "components": { "schemas": {} }
  +}
  diff --git a/tools/contracts/tests/fixtures/check-commands/contract.commands.openapi.json b/tools/contracts/tests/fixtures/check-commands/contract.commands.openapi.json
  new file mode 100644
  index 0000000..19ad4ac
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/contract.commands.openapi.json
  @@ -0,0 +1,70 @@
  +{
- "openapi": "3.1.0",
- "info": {
- "title": "Demo — comandos manuscritos (BP-DEMO-001)",
- "version": "1.0.0",
- "description": "Fixture mínima do Inspector (TASK-0012) para tools/contracts/check-commands.mjs.",
- "x-blueprint": "BP-DEMO-001",
- "x-commands": true,
- "x-source": "fixture"
- },
- "paths": {
- "/v1/demo/items/{id}/finalize": {
-      "post": {
-        "tags": ["demo-item"],
-        "operationId": "teatDemoItemFinalize",
-        "summary": "Finaliza o item de demonstração (fixture).",
-        "parameters": [
-          {
-            "name": "id",
-            "in": "path",
-            "required": true,
-            "schema": { "type": "string", "format": "uuid" }
-          }
-        ],
-        "responses": {
-          "200": {
-            "description": "Item finalizado.",
-            "content": {
-              "application/json": {
-                "schema": {
-                  "type": "object",
-                  "required": ["id"],
-                  "properties": { "id": { "type": "string" } }
-                },
-                "example": { "id": "00000000-0000-7000-8000-0000f0000001" }
-              }
-            }
-          },
-          "409": {
-            "description": "Estado do item incompatível.",
-            "content": {
-              "application/json": {
-                "schema": {
-                  "type": "object",
-                  "required": ["code", "status", "message"],
-                  "additionalProperties": false,
-                  "properties": {
-                    "code": {
-                      "type": "string",
-                      "enum": ["TEAT.DEMO_ITEM_STATE_INVALID"]
-                    },
-                    "status": { "type": "integer", "const": 409 },
-                    "message": { "type": "string" },
-                    "messageKey": { "type": "string" },
-                    "requestId": { "type": "string" },
-                    "context": {
-                      "type": "object",
-                      "additionalProperties": true
-                    }
-                  }
-                }
-              }
-            }
-          }
-        }
-      }
- }
- },
- "components": { "schemas": {} }
  +}
  diff --git a/tools/contracts/tests/fixtures/check-commands/demo-items-empty.controller.ts b/tools/contracts/tests/fixtures/check-commands/demo-items-empty.controller.ts
  new file mode 100644
  index 0000000..94204de
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/demo-items-empty.controller.ts
  @@ -0,0 +1,9 @@
  +import { Controller } from '@nestjs/common';
-

+/**

- - Fixture controller with no route handlers, for
- - `tools/contracts/tests/check-commands.test.mjs` (cases that must isolate a
- - single problem kind by contributing zero scanned routes).
- */
  +@Controller('v1/demo/items')
  +export class DemoItemsEmptyController {}
  diff --git a/tools/contracts/tests/fixtures/check-commands/demo-items-two-routes.controller.ts b/tools/contracts/tests/fixtures/check-commands/demo-items-two-routes.controller.ts
  new file mode 100644
  index 0000000..394aa99
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/demo-items-two-routes.controller.ts
  @@ -0,0 +1,19 @@
  +import { Controller, Post } from '@nestjs/common';
-

+/**

- - Fixture controller with two route handlers, for
- - `tools/contracts/tests/check-commands.test.mjs` (duplicate-operation-id
- - case: both routes must resolve so the only problem left is the id clash).
- */
  +@Controller('v1/demo/items')
  +export class DemoItemsTwoRoutesController {
- @Post(':id/finalize')
- finalize(): { id: string } {
- return { id: 'fixture' };
- }
-
- @Post(':id/other')
- other(): { id: string } {
- return { id: 'fixture' };
- }
  +}
  diff --git a/tools/contracts/tests/fixtures/check-commands/demo-items.controller.ts b/tools/contracts/tests/fixtures/check-commands/demo-items.controller.ts
  new file mode 100644
  index 0000000..edcab96
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/demo-items.controller.ts
  @@ -0,0 +1,16 @@
  +import { Controller, Post } from '@nestjs/common';
-

+/**

- - Fixture controller for `tools/contracts/tests/check-commands.test.mjs`.
- - Mirrors the shape of a real handwritten commands controller (one
- - `@Controller` base plus one `@Post` route) but is never imported at
- - runtime — `check-commands.mjs` only parses it as TypeScript source, the
- - same technique as `tools/verify-controller-decorators.ts`.
- */
  +@Controller('v1/demo/items')
  +export class DemoItemsCommandsController {
- @Post(':id/finalize')
- finalize(): { id: string } {
- return { id: 'fixture' };
- }
  +}
  diff --git a/tools/contracts/tests/fixtures/check-commands/empty-paths-contract.commands.openapi.json b/tools/contracts/tests/fixtures/check-commands/empty-paths-contract.commands.openapi.json
  new file mode 100644
  index 0000000..232db9d
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/check-commands/empty-paths-contract.commands.openapi.json
  @@ -0,0 +1,13 @@
  +{
- "openapi": "3.1.0",
- "info": {
- "title": "Demo — comandos manuscritos (BP-DEMO-001)",
- "version": "1.0.0",
- "description": "Fixture com paths vazio (tools/contracts/tests, check-commands.mjs); usada para o caso missing-operation.",
- "x-blueprint": "BP-DEMO-001",
- "x-commands": true,
- "x-source": "fixture"
- },
- "paths": {},
- "components": { "schemas": {} }
  +}
  diff --git a/tools/contracts/tests/fixtures/generate-clients/BP-DEMO-001.commands.openapi.json b/tools/contracts/tests/fixtures/generate-clients/BP-DEMO-001.commands.openapi.json
  new file mode 100644
  index 0000000..7e59775
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/generate-clients/BP-DEMO-001.commands.openapi.json
  @@ -0,0 +1,42 @@
  +{
- "openapi": "3.1.0",
- "info": {
- "title": "Demo — comandos manuscritos (BP-DEMO-001)",
- "version": "1.0.0",
- "description": "Fixture mínima do Inspector (TASK-0012) para tools/contracts/generate-clients.mjs — imita um contrato de comando.",
- "x-blueprint": "BP-DEMO-001",
- "x-commands": true,
- "x-source": "fixture"
- },
- "paths": {
- "/v1/demo/items/{id}/finalize": {
-      "post": {
-        "tags": ["demo-item"],
-        "operationId": "teatDemoItemFinalize",
-        "summary": "Finaliza o item de demonstração (fixture).",
-        "parameters": [
-          {
-            "name": "id",
-            "in": "path",
-            "required": true,
-            "schema": { "type": "string", "format": "uuid" }
-          }
-        ],
-        "responses": {
-          "200": {
-            "description": "ok",
-            "content": {
-              "application/json": {
-                "schema": {
-                  "type": "object",
-                  "properties": { "id": { "type": "string" } }
-                }
-              }
-            }
-          }
-        }
-      }
- }
- },
- "components": { "schemas": {} }
  +}
  diff --git a/tools/contracts/tests/fixtures/generate-clients/BP-DEMO-001.openapi.json b/tools/contracts/tests/fixtures/generate-clients/BP-DEMO-001.openapi.json
  new file mode 100644
  index 0000000..99c9a23
  --- /dev/null
  +++ b/tools/contracts/tests/fixtures/generate-clients/BP-DEMO-001.openapi.json
  @@ -0,0 +1,29 @@
  +{
- "openapi": "3.1.0",
- "info": {
- "title": "Demo — BP-DEMO-001",
- "version": "0.0.1",
- "description": "Fixture mínima do Inspector (TASK-0012) para tools/contracts/generate-clients.mjs — imita um contrato gerado.",
- "x-blueprint": "BP-DEMO-001",
- "x-generated": "tools/contracts/generate-openapi.mjs — do not hand-edit"
- },
- "paths": {
- "/v1/demo/items": {
-      "get": {
-        "tags": ["demo-item"],
-        "operationId": "listDemoItem",
-        "responses": {
-          "200": {
-            "description": "ok",
-            "content": {
-              "application/json": {
-                "schema": { "type": "array", "items": { "type": "object" } }
-              }
-            }
-          }
-        }
-      }
- }
- },
- "components": { "schemas": {} }
  +}
  diff --git a/tools/contracts/tests/generate-clients.test.mjs b/tools/contracts/tests/generate-clients.test.mjs
  new file mode 100644
  index 0000000..690dd0b
  --- /dev/null
  +++ b/tools/contracts/tests/generate-clients.test.mjs
  @@ -0,0 +1,249 @@
  +// Testes de `tools/contracts/generate-clients.mjs` (TASK-0012, WP-T3, CTG-0005 §4 e §7).
  +//
  +// O módulo ainda não existe — TASK-0010 (Engineer) o implementa. Por isso este arquivo
  +// falha hoje inteiro por `ERR_MODULE_NOT_FOUND` na importação estática abaixo; é o
  +// vermelho esperado (CTG-0005 §7 C-5-17…C-5-21, prompt TASK-0012 item 4). Qualquer outra
  +// falha, depois que `generate-clients.mjs` existir, é defeito do gerador ou do teste.
  +//
  +// Fixtures em tools/contracts/tests/fixtures/generate-clients/ (nunca os contratos reais):
  +// um `*.openapi.json` (imita o gerado) e um `*.commands.openapi.json` (imita o manuscrito),
  +// ambos mínimos e válidos para `openapi-typescript` (já presente no workspace, 7.13.0 — a
  +// instalação é ato do maestro, nunca deste teste).
  +import assert from 'node:assert/strict';
  +import { execFile } from 'node:child_process';
  +import {
- mkdir,
- mkdtemp,
- readFile,
- readdir,
- rm,
- writeFile,
  +} from 'node:fs/promises';
  +import { dirname, join, resolve } from 'node:path';
  +import { fileURLToPath } from 'node:url';
  +import { tmpdir } from 'node:os';
  +import { promisify } from 'node:util';
  +import test from 'node:test';
  +import { generateClients } from '../generate-clients.mjs';
-

+const exec = promisify(execFile);
+const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
+const fixturesDir = join(

- root,
- 'tools/contracts/tests/fixtures/generate-clients',
  +);
  +const cli = join(root, 'tools/contracts/generate-clients.mjs');
-

+async function readFixture(name) {

- return readFile(join(fixturesDir, name), 'utf8');
  +}
-

+async function scenario(files = {}) {

- const dir = await mkdtemp(join(tmpdir(), 'detran-generate-clients-'));
- const contractsDir = join(dir, 'contracts');
- const outDir = join(dir, 'generated');
- await mkdir(contractsDir, { recursive: true });
- for (const [name, content] of Object.entries(files)) {
- await writeFile(
-      join(contractsDir, name),
-      content ?? (await readFixture(name)),
-      'utf8',
- );
- }
- return { dir, contractsDir, outDir };
  +}
-

+async function cleanup(s) {

- await rm(s.dir, { recursive: true, force: true });
  +}
-

+// A CLI de generate-clients.mjs não tem opções de diretório (CTG-0005 §4.2, diferente de
+// check-commands.mjs em §3.4): contractsDir/outDir só têm default relativo a `process.cwd()`
+// (mesma convenção de tools/contracts/generate-openapi.mjs, `const root = process.cwd()`).
+// Por isso a fixture de CLI monta uma raiz temporária própria — nunca `--contracts-dir`
+// nem `--out-dir`, que o contrato não define — e roda o processo com `cwd` nela, para nunca
+// tocar docs/framework/contracts/ nem packages/api-clients/src/generated/ reais.
+async function cliScenario(files = {}) {

- const fakeRoot = await mkdtemp(
- join(tmpdir(), 'detran-generate-clients-cli-'),
- );
- const contractsDir = join(fakeRoot, 'docs/framework/contracts');
- const outDir = join(fakeRoot, 'packages/api-clients/src/generated');
- await mkdir(contractsDir, { recursive: true });
- for (const [name, content] of Object.entries(files)) {
- await writeFile(
-      join(contractsDir, name),
-      content ?? (await readFixture(name)),
-      'utf8',
- );
- }
- return { fakeRoot, contractsDir, outDir };
  +}
-

+async function cleanupCli(s) {

- await rm(s.fakeRoot, { recursive: true, force: true });
  +}
-

+async function runCli(fakeRoot) {

- try {
- const result = await exec(process.execPath, [cli], { cwd: fakeRoot });
- return { status: 0, stdout: result.stdout, stderr: result.stderr };
- } catch (error) {
- return {
-      status: typeof error.code === 'number' ? error.code : 1,
-      stdout: error.stdout ?? '',
-      stderr: error.stderr ?? String(error),
- };
- }
  +}
-

+test('dado um contrato gerado e um contrato de comando quando generateClients então escreve um .ts por arquivo com export interface paths', async () => {

- const s = await scenario({
- 'BP-DEMO-001.openapi.json': null,
- 'BP-DEMO-001.commands.openapi.json': null,
- });
- try {
- const result = await generateClients({
-      contractsDir: s.contractsDir,
-      outDir: s.outDir,
- });
- assert.equal(result.written.length, 2);
- const generated = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
- const commands = await readFile(
-      join(s.outDir, 'BP-DEMO-001.commands.ts'),
-      'utf8',
- );
- // CTG-0005 §4.2: "cabeçalho primeira linha de todo arquivo gerado: `// Generated
- // from docs/framework/contracts/<arquivo>. Do not edit.`" — o `<arquivo>` aqui é o
- // nome real dentro do contractsDir da fixture, não o caminho canônico do repositório
- // (que só existe quando contractsDir é o default); por isso o teste casa o nome do
- // arquivo de origem e o sufixo fixo, sem fixar o diretório.
- assert.match(
-      generated,
-      /^\/\/ Generated from .*BP-DEMO-001\.openapi\.json\. Do not edit\.\n/,
- );
- assert.match(generated, /export interface paths/);
- assert.match(commands, /export interface paths/);
- } finally {
- await cleanup(s);
- }
  +});
-

+// `X.commands.openapi.json` → `X.commands.ts`: o sufixo `.commands` sobrevive no nome do
+// módulo (CTG-0005 §4.2), nunca é confundido com o `.openapi.json` gerado homônimo.
+test('dado BP-DEMO-001.commands.openapi.json quando generateClients então a saída é BP-DEMO-001.commands.ts', async () => {

- const s = await scenario({ 'BP-DEMO-001.commands.openapi.json': null });
- try {
- const result = await generateClients({
-      contractsDir: s.contractsDir,
-      outDir: s.outDir,
- });
- assert.deepEqual(
-      result.written.map((entry) => entry.split('/').pop()),
-      ['BP-DEMO-001.commands.ts'],
- );
- await assert.doesNotReject(
-      readFile(join(s.outDir, 'BP-DEMO-001.commands.ts'), 'utf8'),
- );
- } finally {
- await cleanup(s);
- }
  +});
-

+test('dada a mesma entrada quando gerar duas vezes então os bytes de saída são idênticos (idempotência)', async () => {

- const s = await scenario({
- 'BP-DEMO-001.openapi.json': null,
- 'BP-DEMO-001.commands.openapi.json': null,
- });
- try {
- const first = await generateClients({
-      contractsDir: s.contractsDir,
-      outDir: s.outDir,
- });
- const beforeGenerated = await readFile(
-      join(s.outDir, 'BP-DEMO-001.ts'),
-      'utf8',
- );
- const beforeCommands = await readFile(
-      join(s.outDir, 'BP-DEMO-001.commands.ts'),
-      'utf8',
- );
- const second = await generateClients({
-      contractsDir: s.contractsDir,
-      outDir: s.outDir,
- });
- const afterGenerated = await readFile(
-      join(s.outDir, 'BP-DEMO-001.ts'),
-      'utf8',
- );
- const afterCommands = await readFile(
-      join(s.outDir, 'BP-DEMO-001.commands.ts'),
-      'utf8',
- );
- assert.equal(afterGenerated, beforeGenerated);
- assert.equal(afterCommands, beforeCommands);
- assert.deepEqual(
-      first.written.slice().sort(),
-      second.written.slice().sort(),
- );
- } finally {
- await cleanup(s);
- }
  +});
-

+test('dado um .ts órfão em outDir quando generateClients então é removido e não aparece em written', async () => {

- const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
- try {
- await mkdir(s.outDir, { recursive: true });
- const orphan = join(s.outDir, 'BP-GHOST-001.ts');
- await writeFile(orphan, '// órfão de propósito\n', 'utf8');
- const result = await generateClients({
-      contractsDir: s.contractsDir,
-      outDir: s.outDir,
- });
- await assert.rejects(readFile(orphan, 'utf8'));
- assert.ok(!result.written.some((entry) => entry.includes('BP-GHOST-001')));
- const remaining = await readdir(s.outDir);
- assert.deepEqual(remaining, ['BP-DEMO-001.ts']);
- } finally {
- await cleanup(s);
- }
  +});
-

+test('dado contrato com JSON inválido quando rodar a CLI então exit 1 e o arquivo de saída anterior não é truncado', async () => {

- const s = await cliScenario({ 'BP-DEMO-001.openapi.json': null });
- try {
- const first = await runCli(s.fakeRoot);
- assert.equal(first.status, 0, first.stderr);
- const before = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
- assert.ok(before.length > 0);
-
- await writeFile(
-      join(s.contractsDir, 'BP-BROKEN-001.openapi.json'),
-      '{ "openapi": "3.1.0", "info": { ',
-      'utf8',
- );
- const second = await runCli(s.fakeRoot);
- assert.equal(second.status, 1);
- assert.match(second.stderr, /BP-BROKEN-001\.openapi\.json/);
-
- const after = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
- assert.equal(after, before);
- } finally {
- await cleanupCli(s);
- }
  +});
-

+test('dado o conjunto fixture sem erros quando rodar a CLI então stdout "clients written: 2"', async () => {

- const s = await cliScenario({
- 'BP-DEMO-001.openapi.json': null,
- 'BP-DEMO-001.commands.openapi.json': null,
- });
- try {
- const result = await runCli(s.fakeRoot);
- assert.equal(result.status, 0, result.stderr);
- assert.equal(result.stdout, 'clients written: 2\n');
- } finally {
- await cleanupCli(s);
- }
  +});

```

```
