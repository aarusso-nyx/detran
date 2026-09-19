# Prompt do reviewer — modo `prompt-review` (`prompt-review` | `delivery-review`)

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
  "mode": "prompt-review",
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

**Nono ciclo — restrito aos nove achados de `prompt-review-8`** (orchestra/README.md §5). Avalie
somente estas correções:

1. (high 5, `TASK-0015.md`) critério de `test` → "Test Files N failed | **50** passed".
2. (high 2, `TASK-0020.md`) `infraction-view.projection.ts` linhas **1–160** (cobre `ACTION_PHASE_MATRIX` 98–150).
3. (high 2, `TASK-0015.md`) fixtures: `70-fixtures-portal.sql` linhas 55–160 **e 281–303** (`infraction_view`, `points_view`).
4. (high 4, `TASK-0020.md` §6 e `TASK-0016.md` §Tarefa) invariante de toda página real: host binding `data-screen="T-nn"`.
5. (high 3, `TASK-0015.md` §Pode tocar e `TASK-0020.md` §9) o Inspector estende `router-harness.ts` com `provideHttpClient()`/`provideHttpClientTesting()`.
6. (high 2, `TASK-0020.md` §Leitura) `RN-PORTAL-114.md` acrescentada.
7. (low 12) Sonnet/médio mantido; `plan.md` §Retomada manda TASK-0012 registrar o ajuste da escada em `waves.md` §Histórico citando TASK-0008.
8. (low 3) locks de TASK-0016 alinhados no plano e no JSON: `MOD-portal-web-features-appeal`, `MOD-portal-web-shared-3b`, `MOD-portal-web-data-3b`.
9. (low 5, `TASK-0020.md` §4) "juros após vencimento" citado, com `source_pending`/OD se a projeção não devolver.

`compositions.json` recalculado.

### Veredito anterior (prompt-review-8.json)

```json
{
  "mode": "prompt-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 5,
      "file": "work/rounds/R-0014/prompts/TASK-0015.md",
      "line": 100,
      "claim": "critério manda registrar `Test Files N failed | 17 passed` — valor copiado do prompt do par 1 (TASK-0008.md, quando a suíte tinha 17 arquivos). A linha de base atual é 50 arquivos de teste (`reports/TASK-0009-iteration-3.md`: `Test Files 50 passed (50)`, `Tests 711 passed | 3 todo (714)`; `find apps/portal/web/src -name '*.spec.ts'` = 50). O formato pedido é inalcançável e, no par 1, forçou o worker a justificar a aderência literal no relatório",
      "fix": "trocar por `Test Files N failed | 50 passed` (ou remover o número fixo e exigir só \"nenhum dos 50 arquivos anteriores falha\")"
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0020.md",
      "line": 74,
      "claim": "a leitura fechada limita `infraction-view.projection.ts` às linhas 1–120, mas `ACTION_PHASE_MATRIX` vai de 98 a 150 (`export` na 98, fecha na 150): o Architect vê 3 das 7 situações. É a fonte do critério §6 \"T-01: três ações sempre juntas\" e de `actions[].available/reason`; com o corte ele teria de inferir o resto (regra 1 do próprio prompt proíbe)",
      "fix": "`infraction-view.projection.ts` linhas 1–160 (cobre `INFRACTION_SITUATION_MAP` 52, `POINTS_STATUS_BY_SITUATION` 73 e `ACTION_PHASE_MATRIX` 98–150)"
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0015.md",
      "line": 45,
      "claim": "\"ids em `backend/database/seed/70-fixtures-portal.sql` linhas 55–160\" não contém as fixtures de AIT: `insert into portal.infraction_view` está na linha 281 e `portal.points_view` na 301 (a faixa 55–160 cobre subject/representation/entitlement/act_level_policy/request/request_draft). O par 2 é justamente `GET aits`/`aits/{id}`/`points-summary` — o Inspector ficaria sem id canônico de AIT e inventaria um (viola a regra 5 do próprio prompt)",
      "fix": "citar `70-fixtures-portal.sql` linhas 55–160 **e** 281–303 (ou 55–303)"
    },
    {
      "severity": "high",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0016.md",
      "line": 66,
      "claim": "as 13 páginas reais substituem `PlaceholderPageComponent`, que expõe `data-screen` por host binding (`shared/placeholder-page.component.ts:19`). `app.guards-matrix.spec.ts` (linhas 70, 87, 97, 106, 133, 162) exige `screenElement(harness) !== null` para todas as 38 rotas × personas, e `screenElement` procura `[data-screen]` no fragmento da rota (`src/testing/router-harness.ts:52-58`). Nem TASK-0020 §6 nem a tarefa de TASK-0016 (que só cita `data-token`/`data-reason`) pedem `data-screen=\"T-nn\"` nas páginas — sem isso o critério \"711 anteriores verdes / 0 failed\" é inalcançável e o Engineer não pode editar o spec",
      "fix": "acrescentar `data-screen=\"T-nn\"` (host binding, como no placeholder) à lista de invariantes das páginas em TASK-0020 §6 e na tarefa de TASK-0016"
    },
    {
      "severity": "high",
      "item": 3,
      "file": "work/rounds/R-0014/prompts/TASK-0016.md",
      "line": 55,
      "claim": "`createPortalRouterHarness` só provê `provideRouter` + `provideLocationMocks` (`src/testing/router-harness.ts:21-35`). Quando as 13 rotas passarem a renderizar páginas reais que injetam facade → `PortalClient` → `HttpClient` (`data/portal.client.ts:11,16`), `app.guards-matrix.spec.ts` quebra com `NullInjectorError: No provider for HttpClient`. TASK-0016 não pode tocar `src/testing/**` nem specs, e TASK-0015 — que pode (linha 51) — não recebe instrução alguma sobre o harness: a correção fica sem dono",
      "fix": "instruir TASK-0015 a estender `router-harness.ts` com `provideHttpClient()`/`provideHttpClientTesting()` (não quebra os specs do par 1) e registrar o ponto em TASK-0020 §9 (fronteira/gates)"
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0020.md",
      "line": 117,
      "claim": "§4 exige \"guia/boleto acessível mediante solicitação ([RN-PORTAL-114])\", mas `RN-PORTAL-114.md` não está na lista de leitura fechada (só 103, 106, 112, 125…128) e a regra não é transcrita em §Definições — o prompt manda \"não leia além dela\"",
      "fix": "acrescentar `docs/framework/product/transversal/portal/rules/RN-PORTAL-114.md` à leitura obrigatória ou transcrever a regra em §Definições que valem como contrato"
    },
    {
      "severity": "low",
      "item": 12,
      "file": "work/rounds/R-0014/tasks/TASK-0015.json",
      "line": 34,
      "claim": "`model-ladder.md` §Escolha por tipo de tarefa fixa para o Inspector \"nível pequeno (**médio** para matrizes grandes)\"; TASK-0015 (13 telas + 2 compartilhados + 5 facades) roda `sonnet`/médio, isto é, nível pequeno. O resultado do par 1 foi registrado em `plan.md` §Retomada (lição 4), mas a escada exige registrar o ajuste em `waves.md` §Histórico",
      "fix": "manter Sonnet/médio (precedente medido) e registrar o ajuste da heurística em `docs/meta/agents/orchestra/waves.md` §Histórico, citando TASK-0008"
    },
    {
      "severity": "low",
      "item": 3,
      "file": "work/rounds/R-0014/plan.md",
      "line": 217,
      "claim": "a linha de TASK-0016 no plano declara só `MOD-portal-web-features-appeal`, enquanto `tasks/TASK-0016.json:12-13` declara também `MOD-portal-web-shared-3b`; e nenhum dos dois cobre `src/app/data/**` (`portal.client.ts`, `portal-read.models.ts`), que a fronteira do prompt autoriza (TASK-0016.md:50). Sem conflito real nesta janela (nenhuma outra tarefa escreve nesses caminhos), mas o lock não descreve a escrita",
      "fix": "alinhar a linha do plano ao JSON e cobrir `src/app/data/**` (estender `MOD-portal-web-shared-3b` ou criar `MOD-portal-web-data-3b`)"
    },
    {
      "severity": "low",
      "item": 5,
      "file": "work/rounds/R-0014/prompts/TASK-0020.md",
      "line": 110,
      "claim": "a enumeração de `PaymentComparison` em §4 omite \"juros após vencimento\", que consta da definição canônica citada logo abaixo (`portal-frontends.md:158`: \"80 · 60 (SNE) · 40 (renúncia) lado a lado; juros após vencimento; parcelamento\"); o risco é o contrato sair sem o item e o Inspector não ter critério para ele",
      "fix": "citar \"juros após vencimento\" em §4 (com fonte no AIT `payment`) ou marcá-lo `source_pending`/OD a partir de OD-P69 se a projeção não o devolver"
    }
  ],
  "notes": [
    "Primeiro ciclo dos três prompts (CTG-0003b): achados exaustivos, conforme §5 do método.",
    "Itens 1, 6, 8, 9, 10 conformes: papéis (Architect/Inspector/Engineer) batem com `discipline` e com Art. 10 (quem define não atua); ordem 0020 → 0015 → 0016 coerente com `upstream_task_id` e com testes antes da implementação; vocabulário canônico (`delegacao_indisponivel_r0007` = `service-catalog-facade.stub.ts`, situações de `INFRACTION_SITUATION_MAP`); ADR-0003 e ADR-0007 nas regras dos três; H.53 conferida em `docs/meta/knowledge-base/steering.md:208-209` (`collection.discount_40_outside_sne=false`) e OD-P05 em `portal-build-pack.md:171` — a faixa de 40 % e cartão/parcelamento como \"indisponíveis com motivo\" respeitam a decisão, não a reabrem.",
    "Escopo conferido contra `route-manifest.md`: os módulos `autos|defesa|indicacao|pagamento|processos` são exatamente as entradas 8–20 (13 rotas, 13 telas T-01…T-08, T-10, T-11, T-13, T-14, T-23); os 8 módulos restantes ficam com o par 3 — fronteira de TASK-0016 (linha 57) enumera os 8 corretamente.",
    "Fronteiras de escrita disjuntas entre 0015 (`**/*.spec.ts` + `src/testing/**`) e 0016 (produção, exceto `core/`, compartilhados do par 1, `forms/`, specs, i18n, manifesto); nenhum worker executa `git`; todos os caminhos das listas de leitura existem (verificados um a um), inclusive as 13 fichas, RN/UC/JRN citados e `process-timeline.projection.ts` (`TimelineEntry` 39, `TimelineDeadline` 47, `TimelineDecision` 53 — dentro das linhas 20–60).",
    "Critérios são comandos reais: `format:check` (= `prettier --check .`, que alcança `work/rounds/**/*.md`), `typecheck|lint|test|build` do `@detran/portal-web` e `verify:parameter-catalogue`/`check` na raiz.",
    "Item 13: a matriz de autorização por rota (presença × ausência para anônimo/simples/avançada/qualificada nas 38 rotas) já está coberta e verde em `app.guards-matrix.spec.ts`; o par 2 acrescenta negativos de ação (`available=false` com `reason`, `WITHDRAWAL_AFTER_JUDGMENT`, `DILIGENCE_NOT_OPEN`, delegação indisponível), exigidos em TASK-0015 §5 e no contrato §8 — nada por analogia.",
    "`app.routes.spec.ts` só assume placeholder na rota coringa (`data-screen=\"\"`), então a ressalva do §6 de TASK-0015 não gera conflito; o risco real das rotas do par é o do achado sobre `data-screen`/harness."
  ]
}
```
