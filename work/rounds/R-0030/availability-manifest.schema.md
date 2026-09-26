# Anexo de R-0030 — esquema do manifesto de disponibilidade (versão 1.0.0)

**Autoridade:** Architect (Constitution Art. 6), 2026-09-26, campanha C-0002 rev. 2 §3.5–§3.6.
**Status:** **normativo para R-0025…R-0029 e R-0031** a partir da autorização do Owner da campanha.
Este anexo **antecipa** o esquema que R-0030 fixa: as rodadas da fase D rodam antes de R-0030, e
cada uma entrega o delta do manifesto das suas rotas (um arquivo) já nesta forma. R-0030 transcreve
o bloco JSON Schema do §4 sem alteração semântica para
`docs/framework/schemas/availability-manifest.schema.json` e entrega o gate que o executa (§6).
Mudança no esquema depois da autorização só por adenda numerada neste anexo, com decisão do Owner.

## 1. Caminhos canônicos

| Artefato                                     | Caminho                                                                                                   | Dono                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Esquema (JSON Schema 2020-12)                | `docs/framework/schemas/availability-manifest.schema.json`                                                | a **primeira** rodada da fase D a mesclar transcreve o §4 literalmente; as demais reutilizam; R-0030 o confirma |
| Manifesto por superfície                     | `docs/framework/arch/availability/<surface>.availability.json`                                            | a rodada da tabela §2                                                                                           |
| Convenção de manuais que consome o manifesto | `docs/framework/arch/user-docs-convention.md`                                                             | R-0030 (TASK-0001)                                                                                              |
| Gate                                         | `tools/docs/user-docs/check.mjs` (scripts `docs:availability:check`, `docs:user:check`, `docs:user:test`) | R-0030                                                                                                          |

Nenhum outro caminho é aceito (nem `work/rounds/*/route-manifest.md`, que continua sendo
artefato de trabalho da rodada). O manifesto descreve **o código mesclado**, não a intenção.

## 2. Superfícies e donos

| `surface`       | App hospedeiro (`hostApp`)                                    | Fonte de rotas no código (`routeSources`)                                                                                                       | Rodada dona                                                     |
| --------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `rait-web`      | `apps/rait/web`                                               | `apps/rait/web/src/app/app.route-manifest.ts`                                                                                                   | R-0025                                                          |
| `dashboard-web` | `apps/dashboard/web`                                          | `apps/dashboard/web/src/app/app.route-manifest.ts`                                                                                              | R-0026                                                          |
| `portal-web`    | `apps/portal/web`                                             | `apps/portal/web/src/app/app.route-manifest.ts`                                                                                                 | R-0027 (R-0031 acrescenta as rotas PEC P-01…P-07)               |
| `boat`          | `apps/teat/mobile` e `apps/teat/web` (por rota, campo `host`) | páginas `boat-crash-*` montadas nas rotas `crash-*` do TEAT mobile; `apps/teat/web/src/app/features/sinistros/sinistros.routes.ts`              | R-0028                                                          |
| `teat-web`      | `apps/teat/web`                                               | `apps/teat/web/src/app/app.routes.ts`, `app.homologation.routes.ts`, `features/*/*.routes.ts` (exceto `sinistros`, que é de `boat`)             | R-0029                                                          |
| `teat-mobile`   | `apps/teat/mobile`                                            | `apps/teat/mobile/src/app/app.routes.ts`, `app.homologation.routes.ts`, `features/*/*.routes.ts` (exceto as rotas `crash-*`, que são de `boat`) | R-0030 (nenhuma rodada da fase D liga o TEAT mobile; C-0002 §6) |
| `pec-web`       | `apps/pec/web`                                                | `apps/pec/web/src/app/app.route-manifest.ts` (a criar)                                                                                          | R-0031                                                          |

Regras de posse:

1. Cada rota do código aparece em **exatamente um** arquivo. A rota pertence à superfície da
   rodada que a ligou; `host` registra o app que a monta quando difere de `hostApp`.
2. Se `app.route-manifest.ts` mudar de forma ou de lugar por R-0024 (kit de app único), a rodada
   aponta `routeSources` para o novo arquivo; o gate lê o que está listado.
3. Uma rodada posterior só altera o arquivo de outra superfície pelo próprio lock declarado no
   `plan.md` e acrescenta uma linha em `history`. R-0030 pode alterar apenas `help` e completar
   `profiles`/`evidence` faltantes (triagem `reference-gap`, nunca reabre a rodada dona).

## 3. Forma do arquivo

```json
{
  "$schema": "../../schemas/availability-manifest.schema.json",
  "schemaVersion": "1.0.0",
  "surface": "rait-web",
  "hostApp": "apps/rait/web",
  "package": "@detran/rait-web",
  "measuredAt": "<sha-40 do main integrado em que o código foi medido>",
  "routeSources": ["apps/rait/web/src/app/app.route-manifest.ts"],
  "routes": [
    {
      "id": "rait-web:painel",
      "path": "painel",
      "kind": "tela",
      "screen": "IU-RAIT-T01",
      "module": "painel",
      "audience": "interno",
      "roles": ["rait-analyst", "rait-coordinator"],
      "profiles": ["colegiado-secretaria"],
      "level": "L2",
      "seal": "disponivel",
      "decision": null,
      "actions": [
        {
          "id": "claim-next",
          "operationId": "<operationId do contrato>",
          "seal": "disponivel",
          "decision": null
        }
      ],
      "help": { "entry": "atalhos", "key": null },
      "evidence": {
        "files": ["apps/rait/web/src/app/features/painel/pages/<pagina>.ts"],
        "tests": [
          "apps/rait/web/src/app/features/painel/pages/<pagina>.spec.ts"
        ]
      }
    }
  ],
  "history": [
    { "round": "R-0025", "date": "AAAA-MM-DD", "note": "arquivo criado" }
  ]
}
```

Os valores entre `<…>` do exemplo são marcadores deste anexo, não valores a copiar.

- `id` = `<surface>:<path>`; `path` exatamente como no roteador, sem barra inicial (`""` = raiz).
- `kind`: `tela` (exige manual) ou `auxiliar` (callback, sem permissão, não encontrado,
  indisponível genérico; aparece no manifesto e fica fora da cobertura de manual).
- `screen`: id da ficha `IU-*` ou `null`; `module`: pasta de feature ou `core`.
- `audience`: `publico` (sem login), `cidadao` (login gov.br) ou `interno`. `roles` são códigos
  exatos de `backend/domains/shared/src/roles.ts` (`DETRAN_ROLES`) que **abrem** a rota pelas
  guardas vigentes; vazio só para `publico`.
- `profiles`: perfis de manual, **derivados** de `roles` pela tabela do §5 (o gate recalcula e
  compara). Para `publico`/`cidadao` o perfil é `cidadao`.
- `level`: nível do código (`L0` página "indisponível nesta versão", `L1` leitura sem ação,
  `L2` ligada). Superfícies sem campo de nível no manifesto de código declaram o nível medido.
- `actions`: comandos que a tela expõe (opcional para telas só de leitura); `operationId` do
  contrato `docs/framework/contracts/*.commands.openapi.json`.
- `help.entry`: `nenhum` | `atalhos` | `pagina` | `link`; `help.key`: chave i18n do rótulo ou
  `null`. As rodadas D declaram o que existe; R-0030 atualiza ao ligar a ajuda contextual.
- `evidence.files`: componentes/páginas/clientes que implementam a rota (existem no repositório);
  `evidence.tests`: specs que provam o nível e o selo.

## 4. JSON Schema (transcrever literalmente)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://detran.example.invalid/schemas/availability-manifest.schema.json",
  "title": "Availability Manifest",
  "description": "Manifesto de disponibilidade por superfície (C-0002; work/rounds/R-0030/availability-manifest.schema.md). Descreve o código mesclado; o gate tools/docs/user-docs/check.mjs confere rota × código × selo × manual.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "surface",
    "hostApp",
    "package",
    "measuredAt",
    "routeSources",
    "routes",
    "history"
  ],
  "properties": {
    "$schema": { "type": "string" },
    "schemaVersion": { "const": "1.0.0" },
    "surface": {
      "enum": [
        "rait-web",
        "dashboard-web",
        "portal-web",
        "boat",
        "teat-web",
        "teat-mobile",
        "pec-web"
      ]
    },
    "hostApp": { "type": "string", "pattern": "^apps/[a-z]+/(web|mobile)$" },
    "package": { "type": "string", "pattern": "^@detran/[a-z-]+$" },
    "measuredAt": { "type": "string", "pattern": "^[0-9a-f]{40}$" },
    "routeSources": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string" }
    },
    "routes": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/route" }
    },
    "history": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["round", "date", "note"],
        "properties": {
          "round": { "type": "string", "pattern": "^R-[0-9]{4}$" },
          "date": { "type": "string", "format": "date" },
          "note": { "type": "string", "minLength": 1 }
        }
      }
    }
  },
  "$defs": {
    "seal": {
      "enum": [
        "disponivel",
        "parcial",
        "homologacao",
        "indisponivel_nesta_versao",
        "bloqueado_por_decisao"
      ]
    },
    "decision": {
      "type": ["string", "null"],
      "pattern": "^(OD|DT|ADR)-[A-Za-z0-9-]+$"
    },
    "profile": {
      "enum": [
        "cidadao",
        "agente-transito",
        "colegiado-secretaria",
        "operador",
        "gestor",
        "auditor-dpo",
        "administrador",
        "clinico",
        "regulatorio"
      ]
    },
    "route": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "path",
        "kind",
        "screen",
        "module",
        "audience",
        "roles",
        "profiles",
        "level",
        "seal",
        "decision",
        "help",
        "evidence"
      ],
      "properties": {
        "id": { "type": "string", "pattern": "^[a-z-]+:.*$" },
        "path": { "type": "string" },
        "host": { "type": "string", "pattern": "^apps/[a-z]+/(web|mobile)$" },
        "kind": { "enum": ["tela", "auxiliar"] },
        "screen": { "type": ["string", "null"], "pattern": "^IU-[A-Z0-9-]+$" },
        "module": { "type": "string", "minLength": 1 },
        "audience": { "enum": ["publico", "cidadao", "interno"] },
        "roles": {
          "type": "array",
          "uniqueItems": true,
          "items": { "type": "string" }
        },
        "profiles": {
          "type": "array",
          "uniqueItems": true,
          "items": { "$ref": "#/$defs/profile" }
        },
        "level": { "enum": ["L0", "L1", "L2"] },
        "seal": { "$ref": "#/$defs/seal" },
        "decision": { "$ref": "#/$defs/decision" },
        "actions": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["id", "operationId", "seal", "decision"],
            "properties": {
              "id": { "type": "string", "minLength": 1 },
              "operationId": { "type": ["string", "null"] },
              "seal": { "$ref": "#/$defs/seal" },
              "decision": { "$ref": "#/$defs/decision" }
            }
          }
        },
        "help": {
          "type": "object",
          "additionalProperties": false,
          "required": ["entry", "key"],
          "properties": {
            "entry": { "enum": ["nenhum", "atalhos", "pagina", "link"] },
            "key": { "type": ["string", "null"] }
          }
        },
        "evidence": {
          "type": "object",
          "additionalProperties": false,
          "required": ["files", "tests"],
          "properties": {
            "files": {
              "type": "array",
              "minItems": 1,
              "items": { "type": "string" }
            },
            "tests": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    }
  }
}
```

## 5. Perfis de manual × papéis (derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

## 6. Selos e coerência selo × código (regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### 6.1 Marcadores de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

## 7. Obrigações das rodadas da fase D (até o gate existir)

1. Entregar o arquivo da sua superfície no CTG de documentação, medido sobre o `main` integrado
   (`measuredAt`), com `history` iniciado.
2. O Inspector da rodada prova R1 e R3 por teste do próprio app (rotas do código × arquivo) e o
   maestro valida o JSON (`node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <arquivo>`)
   e confere manualmente os enums deste anexo; divergência encontrada depois por R-0030 é
   `reference-gap` corrigido por R-0030, nunca motivo para reabrir a rodada dona.
3. Não escrever manual de usuário (C-0002 §3.5); `help.entry` descreve só o que o código já tem.
4. Se a rodada for a primeira a mesclar, transcrever o §4 para
   `docs/framework/schemas/availability-manifest.schema.json` e acrescentar a linha na tabela de
   `docs/framework/schemas/README.md`.
