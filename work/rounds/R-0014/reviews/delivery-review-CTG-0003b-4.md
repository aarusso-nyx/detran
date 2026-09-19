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

**Quarto ciclo — restrito aos dois achados de `delivery-review-CTG-0003b-3`** (orchestra/README.md §5):

1. (high 11, C-3b-103 em T-03/T-04/T-05) TASK-0015 it. 5 (`reports/TASK-0015-iteration-5.md`):
   caso `unavailable` (422 `SERVICE_UNAVAILABLE` no `POST requests`, moldes de C-3b-71/T-02)
   acrescentado aos três blocos "a11y por estado", com `expectA11yStateInvariants`
   (`errorBannerFocused` omitido de propósito: nessas telas o motivo de indisponibilidade é
   renderizado inline por `unavailableReason()`, não pelo `portal-error-banner` — verificado nos
   três `*.page.ts`).
2. (low 5, OD-P101) errata acrescentada ao fim de `reports/TASK-0016-iteration-2.md` (sem reescrever
   o histórico) e OD-P101 listada com enunciado próprio em `plan.md` A9(h).

Gates re-executados: `pnpm --filter @detran/portal-web test` → **972 passed | 7 todo (979)**, 0
failed; typecheck/lint OK; `format:check` OK.

### Veredito anterior (delivery-review-CTG-0003b-3.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 11,
      "file": "apps/portal/web/src/app/features/defesa/pages/recurso-jari.page.spec.ts",
      "line": 140,
      "claim": "A correção do achado 1 (C-3b-103) ficou incompleta em três das 13 telas, e a lacuna é declarada como o contrário do que é. O helper `expectA11yStateInvariants` está aplicado em 88 chamadas nos 13 specs, com `loading` e `offline` em todos e `partial` em T-13/T-23 — mas os blocos `a11y por estado` de T-03 (`recurso-jari.page.spec.ts:140`), T-04 (`recurso-cetran.page.spec.ts:169`) e T-05 (`indicacao-condutor.page.spec.ts:358`) cobrem apenas loading, ready/composicao, ineligible, not_found, error e offline: falta o estado `unavailable`, que existe nessas três telas (`recurso-jari.page.ts:97-99`, `recurso-cetran.page.ts:102-104`, `indicacao-condutor.page.ts:121-123` renderizam `data-unavailable` com `portal.screens.t0{3,4,5}.state.unavailable`, chaves presentes em `i18n/portal.pt-BR.json:243,253,264` e ficha de T-03 no contrato l. 950). C-3b-103 (contrato l. 1313) pede `cada estado da tabela §7`, e `empty` é o único condicionado a 'quando aplicável'. Os três títulos de `describe` afirmam 'cobertura integral' e `plan.md:448` (A10(j)) afirma 'cobertura integral, sem redução' — declaração de completude contrária ao que a árvore entrega, que é justamente o que o item 11 proíbe (T-02, que tem o mesmo mecanismo 422 SERVICE_UNAVAILABLE, cobre `unavailable` em `defesa-previa.page.spec.ts:358`, o que mostra que o caso é alcançável).",
      "fix": "Iteração restrita do Inspector (TASK-0015): acrescentar um caso de `unavailable` (422 SERVICE_UNAVAILABLE no `POST requests`, nos moldes de C-3b-71 e do caso de T-02) aos três blocos `a11y por estado` de T-03/T-04/T-05, chamando `expectA11yStateInvariants` com `errorBannerFocused` conforme o estado renderize ou não o `portal-error-banner`; OU, se a redução for decidida, corrigir os três títulos e A10(j) (que hoje dizem 'cobertura integral, sem redução') e registrá-la em `plan.md` §Pendências de cobertura com a adenda/OD que a autoriza."
    },
    {
      "severity": "low",
      "item": 5,
      "file": "work/rounds/R-0014/reports/TASK-0016-iteration-2.md",
      "line": 30,
      "claim": "A correção do achado 5 foi feita só na primeira das três partes. `payment-comparison.component.ts:9` agora cita `OD-P101` (parte a, OK) e `reports/TASK-0016-iteration-3.md` l. 4/14 registram a decisão; mas (b) `reports/TASK-0016-iteration-2.md` l. 30-31 continua atribuindo a origem do `locale` a 'OD-P87', número que `contracts/CTG-0003c.md:451,2011` usa para o `If-Match` de `PUT preferences` — os registros da rodada seguem com duas decisões sob o mesmo número; e (c) OD-P101 não foi listada com enunciado próprio junto das OD propostas do par 2 (A9(h), `plan.md:428-430`, lista OD-P84/P85/P86), existindo apenas dentro do texto corrido de A10(i).",
      "fix": "Acrescentar uma linha de errata ao fim de `TASK-0016-iteration-2.md` apontando a renumeração (sem reescrever o histórico) e incluir `OD-P101 — origem do locale para Intl` na lista de OD propostas por TASK-0016 em A9(h), do mesmo modo que OD-P84…P86."
    }
  ],
  "notes": [
    "Terceiro ciclo: avaliei somente as correções dos cinco achados de `delivery-review-CTG-0003b-2.json`; nenhum achado novo sobre texto não alterado foi levantado.",
    "Achado 2 (C-3b-84) corrigido e verificado: `pagamento.page.spec.ts:256-264` traz o `expectOne` do `submit` obrigatório, sem `.catch(() => null)` e sem `if`; as três asserções de M15/OD-P74 (`portal-protocol-receipt`, `portal.states.unavailable_in_version`, `not.toMatch(/pixCopyPaste|barcode|\\d{44,}/)`) estão no corpo do `it` (l. 279-286). Nenhum `.catch(() => null)` restou no arquivo.",
    "Achado 3 (C-3b-104) corrigido e verificado: `static-analysis.appeal.spec.ts:52-58` tem o `expectOne` obrigatório de `/v1/portal/aits/{id}`, sem `if (!req) return`; o comentário obsoleto sobre `PlaceholderPageComponent` foi removido; `portal.states.offline`, `role=\"alert\"` e o `expectNone` do retry permanecem (l. 63-71).",
    "Achado 4 corrigido: `plan.md:431` agora lê '6 high + 6 low' e nomeia os três `high` omitidos; (j)/(k)/(l) estão em `plan.md:448` — o texto de (j), porém, é o que o achado `high` acima contradiz.",
    "Achado 1 — o helper `src/testing/a11y-state.spec-helper.ts` faz o que promete (h1 único, `[role=\"status\"][aria-label]` de `portal.a11y.status_region`, foco no `.portal-error-banner[role=\"alert\"]` sob `errorBannerFocused`, axe delegado a `a11y/axe.spec-helper.ts`); as 13 telas o importam e `loading`/`offline` aparecem nas 13. A ressalva é exclusivamente o estado `unavailable` de T-03/T-04/T-05.",
    "Contei 88 chamadas de `expectA11yStateInvariants` nos 13 specs, não 74 — a mensagem do maestro subdeclara a cobertura (74 é o número de arquivos de teste); não é achado.",
    "OD-P101 não colide: as OD propostas pelo par 3 em `CTG-0003c.md` vão até OD-P100.",
    "Fronteira de escrita (itens 3/9) segue OK: 76 arquivos staged, todos em `apps/portal/web/**` ou `work/rounds/R-0014/**`; nenhum `packages/**`, nenhum arquivo gerado. Item 7: nenhum `it.skip`/`describe.skip`/`.only` na árvore; os `it.todo` são os três de C-3b-107 (`static-analysis.appeal.spec.ts:150`), cada um citando uma OD.",
    "Não reexecutei gates (o prompt fixa trabalho somente de leitura); julguei sobre a árvore staged e os números do maestro (typecheck/lint 0, 74 arquivos, 969 passed | 7 todo, build/`verify:parameter-catalogue`/`format:check` OK).",
    "As 119 chaves i18n do par 3 no catálogo staged e `contracts/CTG-0003c.md` não fazem parte desta entrega, conforme o maestro declarou; não os avaliei."
  ]
}
```

### Diff dos três specs

```diff
216:+  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
217:+    // C-3b-103 (T-04, unavailable; nos moldes de C-3b-71/T-02)
229:+        unavailableReason: 'delegacao_indisponivel_r0007',
236:+        catalog['portal.screens.t04.state.unavailable'],
239:+    // `unavailableReason()` compõe o texto de estado a partir de `lastFailure`/`onFailed`
540:+  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
541:+    // C-3b-103 (T-03, unavailable; nos moldes de C-3b-71/T-02)
567:+        unavailableReason: 'delegacao_indisponivel_r0007',
574:+        catalog['portal.screens.t03.state.unavailable'],
577:+    // `unavailableReason()` compõe o texto de estado a partir de `lastFailure`/`onFailed`
1104:+  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
1105:+    // C-3b-103 (T-05, unavailable; nos moldes de C-3b-71/T-02)
1123:+        unavailableReason: 'delegacao_indisponivel_r0007',
1130:+        catalog['portal.screens.t05.state.unavailable'],
1133:+    // `unavailableReason()` compõe o texto de estado a partir de `lastFailure`/`onFailed`
```
