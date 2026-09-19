# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-pwa` (rodada `R-0014`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P4…P6` e o "mapa entregável → definições"
4. `work/rounds/R-0014/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0014/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0014/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0014",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito ao achado único de `delivery-review-CTG-0005`** (orchestra/README.md §5).
TASK-0012 it. 3 (`reports/TASK-0012-iteration-3.md`, Codex Terra):

1. (high 11, `portal-frontends.md` §10) tabela reescrita para o **estado ao fim de R-0014**, uma
   linha por dependência com fonte: domínio `portal` e projeções entregues em R-0009 (PC-0006);
   comandos delegados pendentes de R-0007 (`delegacao_indisponivel_r0007`); gov.br pendente
   (OD-P15, IdP simulado); `SnePort`/`CdtPort` usados contra o `senatran-mock` (CTG-0004 §2–§4),
   homologação real pendente (OD-P16); BOAT/PEC pendentes (OD-P19, fixtures); Carta de Serviços
   como fixture (OD-P26); push M9 entregue, VAPID pendente (OD-P88); DT-026/031 respondidas por
   flags, DT-050/OD-P01 com a PN 001/2025; `status 0` só no `ErrorBoundary`, OD-P102 aberta como
   unificação futura. Parágrafo "Estado ao fim de R-0014" coerente com a tabela. O maestro
   alinhou a linha OD-P102 do build pack §4 (era "Fechada") ao mesmo texto (backlog e §10 a
   listam como aberta).

Gates: `node tools/docs/kb/check.mjs` OK (549/446); `pnpm docs:kb:publish-check` OK; `pnpm
verify:parameter-catalogue` OK (89); `pnpm format:check` OK.

### Veredito anterior (delivery-review-CTG-0005.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 11,
      "file": "docs/framework/arch/portal-frontends.md",
      "line": 244,
      "claim": "A tabela de pré-requisitos ainda declara domínio `portal`, projeções e dependências como `pendente (WP-P1/P2)`, mas o novo estado final da rodada afirma entregas de WP-P6 e fechamentos do CTG-0004; a seção §10 não foi consolidada para o estado ao fim de R-0014 exigido pela tarefa.",
      "fix": "Atualizar as linhas 244–251 para o estado canônico ao fim de R-0014, distinguindo o que foi entregue contra mock, o que permanece `source_pending`/R-0007 e os ODs pendentes; manter a síntese das linhas 256–260 coerente com a tabela."
    }
  ],
  "notes": [
    "A regeneração dos três artefatos de parâmetros está consistente com as entradas `portal.attachment.*`; a execução local do verificador foi impedida pelo sandbox ao criar diretório temporário."
  ]
}
```

### Diff de `portal-frontends.md` §10 e da linha OD-P102 do build pack

````diff
diff --git a/docs/framework/arch/portal-frontends.md b/docs/framework/arch/portal-frontends.md
index 634cc74b..7a294371 100644
--- a/docs/framework/arch/portal-frontends.md
+++ b/docs/framework/arch/portal-frontends.md
@@ -220,12 +220,17 @@ sempre com próximo passo e canal alternativo.
 ## 9. Estrutura de pastas

 ```text
-apps/portal/web/src/app/
-  core/       citizen-shell, brand.service, session.facade, resume.service, error-boundary, offline-document.store, guards/ (auth, assurance, entitlement, service-availability)
-  features/   catalogo/ autos/ defesa/ indicacao/ pagamento/ processos/ notificacoes/ documentos/ sinistros/ exames/ atendimento/ privacidade/ assinatura/
-  shared/     (§5.2)
-  data/       api/portal.client.ts (gerado), models/
-  i18n/       portal.pt-BR.json (inclui o mapa de tradução de estados)
+apps/portal/web/src/
+  app/core/        shell, sessão, marca, guardas, `ErrorBoundary`, offline e runtime
+  app/shared/      componentes reutilizáveis, wizard, diálogos, recibo e canal alternativo
+  app/forms/       14 schemas zod, `form-gate.ts` e anexos
+  app/data/        `portal.client.ts`, modelos de leitura/comando e idempotência
+  app/features/*/  módulos lazy: catálogo, autos, defesa, indicação, pagamento, processos,
+                    notificações, documentos, sinistros, exames, atendimento, privacidade e assinatura
+  app/i18n/        catálogo plano `portal.pt-BR.json` e fallback
+  app/a11y/        helper `axe` e invariantes de acessibilidade
+  app/screens/     páginas por tela e seus componentes de rota
+  testing/**       stubs, fixtures e harness HTTP/router dos specs
````

Caminho completo: `apps/portal/web/src/app/i18n/portal.pt-BR.json`; só os namespaces
@@ -234,16 +239,27 @@ verificador) são reconhecidos por `verify:parameter-catalogue --check-usage`.

## 10. Dependências de backend (pré-requisitos de release)

| -   | Dependência                                                                                            | Situação                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -   | Domínio `portal` (identity, requests, inbox, citizen-service) — ADR-0019                               | pendente (WP-P1/P2)                                                                                                                                                          |
| -   | Projeções `portal.*` — ADR-0020                                                                        | pendente (WP-P2)                                                                                                                                                             |
| -   | Comandos delegados no `inf` (`rait-case:protocol`, `infraction:indicate-driver`, `collection:issue`)   | pendentes (RAIT WP-B, ADR-0016/0015)                                                                                                                                         |
| -   | gov.br federado no Cognito + claim de nível assinada                                                   | pendente; hoje só pool Cognito e `custom:teat_assurance_level` na origem                                                                                                     |
| -   | Adapter: `SnePort`, `CdtPort` (multas, veículos, CNH, cotação, reconhecimento), RENACH/RENAVAM leitura | existem (mock-first)                                                                                                                                                         |
| -   | Projeções BOAT (BAT) e PEC (exames)                                                                    | pendentes nos respectivos domínios                                                                                                                                           |
| -   | Carta de Serviços como dados (`portal.service_catalog`, 11 campos)                                     | modelo de origem existe; migrar para blueprint                                                                                                                               |
| -   | Portaria estadual de níveis (DT-050), instrumento da renúncia (DT-026), cartão (DT-031)                | decisões abertas — telas ligadas por flag                                                                                                                                    |
| +   | Dependência                                                                                            | Situação ao fim de R-0014                                                                                                                                                    |
| +   | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| +   | Domínio `portal` (identity, requests, inbox, citizen-service) — ADR-0019                               | entregue em R-0009 (PC-0006) (`work/rounds/R-0009/plan.md` §Retomada; `portal-build-pack.md` §2, WP-P1)                                                                      |
| +   | Projeções `portal.*` — ADR-0020                                                                        | entregues em R-0009 (PC-0006) (`work/rounds/R-0009/plan.md` §Retomada; `portal-build-pack.md` §2, WP-P2)                                                                     |
| +   | Comandos delegados no `inf` (`rait-case:protocol`, `infraction:indicate-driver`, `collection:issue`)   | pendentes de R-0007; as rotas devolvem `delegacao_indisponivel_r0007` (`work/rounds/R-0014/plan.md` M15; `portal-build-pack.md` §2, WP-P2)                                   |
| +   | gov.br federado no Cognito + claim de nível assinada                                                   | pendente; somente IdP simulado nos perfis `test`/`local` (`portal-build-pack.md` §4, OD-P15)                                                                                 |
| +   | Adapter: `SnePort`, `CdtPort` (multas, veículos, CNH, cotação, reconhecimento), RENACH/RENAVAM leitura | usados pelo Portal contra o `senatran-mock`; homologação real permanece pendente (`work/rounds/R-0014/contracts/CTG-0004.md` §2–§4; `portal-build-pack.md` §4, OD-P16)       |
| +   | Projeções BOAT (BAT) e PEC (exames)                                                                    | pendentes; hoje há somente as fixtures `crash_view` e `exam_view` (`portal-build-pack.md` §4, OD-P19)                                                                        |
| +   | Carta de Serviços como dados (`portal.service_catalog`, 11 campos)                                     | dados em `portal.service_catalog` como fixture; carga institucional permanece pendente (`portal-build-pack.md` §4, OD-P26)                                                   |
| +   | Push                                                                                                   | inscrição M9 entregue; chave VAPID pendente (`work/rounds/R-0014/plan.md` M9; `portal-build-pack.md` §4, OD-P88)                                                             |
| +   | Portaria estadual de níveis (DT-050), instrumento da renúncia (DT-026), cartão (DT-031)                | DT-026 e DT-031 respondidas e mantidas por flags; OD-P01 tem a PN DETRAN-AM 001/2025, restando CETRAN-AM (`portal-build-pack.md` §4, OD-P01/OD-P03/OD-P05)                   |
| +   | Tratamento de `status 0`                                                                               | `status 0 → offline` vive só no `ErrorBoundary`; OD-P102 segue como unificação futura, sem duplicação a absorver (`work/rounds/R-0014/plan.md` A12(a); `backlog.md` OD-P102) |

Enquanto uma dependência não existe, o serviço aparece no catálogo como `unavailable` com motivo
e canal alternativo (constraint do catálogo), nunca como 404. +
+Estado ao fim de R-0014: domínio `portal` e projeções foram entregues em R-0009 (PC-0006), e
+WP-P4…P6 concluíram o Portal contra o `senatran-mock`. As delegações reais permanecem em R-0007
+com `delegacao_indisponivel_r0007`; OD-P15 (gov.br real), OD-P16 (homologação real do adapter),
+OD-P17 (privacy), OD-P19 (BOAT/PEC) e OD-P88 (VAPID) seguem pendentes. CTG-0004 cobre CNH-e,
+veículos e quitação contra o mock; `SnePort` e `CdtPort` são usados nesse caminho, e a inscrição
+push M9 foi entregue. Pela A12(a), a regra `status 0 → offline` fica exclusivamente no +`ErrorBoundary`; OD-P102 permanece como unificação futura, sem regra duplicada a absorver
+(`docs/meta/knowledge-base/backlog.md`, OD-P102).
117:+| OD-P102 | Status 0 central. | Aberta (unificação futura): a regra vive só no `ErrorBoundary` (A12(a)); nada a absorver hoje. | Architect | `plan.md` A12(a) |

```

```
