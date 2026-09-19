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

**Segundo ciclo — restrito aos doze achados de `delivery-review-CTG-0003c`** (orchestra/README.md
§5). Adenda **A12** (`plan.md` §Adendas) e iterações TASK-0018 it. 2 (`reports/TASK-0018-iteration-2.md`)
e TASK-0017 it. 4 (`reports/TASK-0017-iteration-4.md`):

1. (high 7, `presentRead` × §3.1) **A11(b) revogada**: as oito cópias saíram (`presentError` direto
   nas seis facades, `InicioFacade` e `home.page.ts`); os casos de offline do par 3 simulam
   `navigator.onLine === false` com `vi.spyOn(window.navigator, 'onLine', 'get')`, como os pares 1/2.
   OD-P102 fica só como unificação futura.
2. (high 7, C-3c-33/45/58 e C-3c-112) metade DOM provada nas páginas T-17 (`crlv.page.spec.ts`),
   T-21 (`manifestation-new.page.spec.ts`), T-27 (`elevation.page.spec.ts`); C-3c-112 estendido a um
   estado de erro/indisponibilidade em `sne`, `cnh`, `crlv`, `manifestation-new`,
   `manifestation-detail`, `own-data`, `elevation`, `junta-medica` (`portal-alternative-channel-note`).
3. (high 13, C-3c-52) exaustivo nos quatro escopos LGPD, dois cenários de `actRequirements`
   (`privacidade.facade.spec.ts`).
4. (high 8, T-19 chave crua) `crash-detail.page.ts`: entradas sem rótulo rendem só `<dd>` no grupo
   `data-key`; spec com `pending_complement` provando ausência do texto.
5. (high 11, home × §3.9) `core/functional-route.ts` (`functionalRouteFor`, puro) consumido por
   `CatalogoFacade` e `HomePage`; `directRouteFor` saiu; `home.page.spec.ts` afirma `defesa_previa`/
   `pagamento` → `/autos`.
6. (high 5, `evaluate()` entitlement) `kind: body.subjectKind`; caso 404 `NOT_FOUND{kind:'manifestation'}`
   em `atendimento.facade.spec.ts` (`recurso=manifestation`).
7. (low 5, §3.8 `access`) registrado em A12(j) para o CTG-0005 (contrato a corrigir; entrega certa).
8. (low 8, título de débitos) **OD-P89 estendida e aplicada** (A12(i)): `portal.documents.clearance.debts`
   = "Débitos a pagar" (ficha T-17 §Estados) no catálogo; `ClearanceStatus` a usa.
9. (low 4, C-3c-78) `POLLING_INTERVAL_SECONDS = POLLING_INTERVAL_MS / MS_PER_SECOND`
   (`MS_PER_SECOND = 1000`, unidade); o spec exclui a constante de unidade e mantém `60_000` como
   único intervalo.
10. (low 7, `as any`) tipo real `PrivacidadeFacade`.
11. (low 4, `catch` silenciosos) removidos em `static-analysis.pair3.spec.ts` e
    `realtime.service.spec.ts`, com `expect(files.length).toBeGreaterThan(0)`.
12. (low 11, T-12 `read=true` / rótulos LGPD) sem ação nesta entrega; A11(e)/A12(j) para TASK-0012.

Nota do reviewer sobre `assurance_qualified_never_required` sem critério → A12(j) (CTG-0005).

Gates re-executados pelo maestro sobre a árvore staged: `pnpm check` completo **EXIT 0**; `pnpm
--filter @detran/portal-web test` → **Test Files 118 passed, Tests 1314 passed | 14 todo (1328)**;
typecheck 0, lint 0, build OK (inicial 542,3 kB), `verify:parameter-catalogue` OK, `format:check` OK.

### Veredito anterior (delivery-review-CTG-0003c.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/features/documentos/documentos.facade.ts",
      "line": 80,
      "claim": "`presentRead` reclassifica `status 0` como `portal.states.offline` FORA do `ErrorBoundary`, contra §3.1 (\"Erros só pelo `ErrorBoundary`\"), duplicado em 8 lugares (`documentos`, `notificacoes`, `sinistros`, `exames`, `atendimento`, `catalogo`, `core/pages/inicio.facade.ts:45` e inline em `core/pages/home.page.ts:198`). O motivo declarado em A11(b) é que os specs do par 3 simulam offline SÓ com `status 0`, sem `vi.spyOn(navigator,'onLine')` — ao contrário dos pares 1/2 (`request-detail.page.spec.ts:255`, `decisao.page.spec.ts:332`, …) e do próprio `portal.client.pair3.spec.ts:465`, que o fazem. A produção foi escrita para um spec mais fraco do que §7.1/C-3c-16 (\"status 0 **e** navigator.onLine false\"): `documentos.facade.spec.ts:87` (C-3c-27), `:108` (C-3c-28) e `:252` (C-3c-35) nunca declaram o browser desconectado. Consequência: o MESMO 0 (CORS, DNS, TLS, abort) com a rede ativa vira \"Você está sem conexão\" nos oito módulos do par 3 e `portal.states.error` nos pares 1/2 — duas respostas para a mesma condição dentro de um app, contra a tabela transversal §7.2, e `error-boundary.spec.ts:242` continua a provar o contrário.",
      "fix": "Remover as oito cópias de `presentRead` (usar `presentError` direto) e acrescentar `vi.spyOn(window.navigator,'onLine','get').mockReturnValue(false)` nos casos offline dos specs do par 3 (`documentos.facade.spec.ts` C-3c-27/28/35 e os casos `dado offline` de `cnh`, `crlv`, `vehicles`, `crash-list`, `crash-detail`, `exam-list`, `service-charter`, `home`, `inicio`, `conta`), como já fazem `inbox.page.spec.ts:164` e os pares 1/2. Manter OD-P102 apenas para a unificação futura; não deixar a duplicação entrar no PR."
    },
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/features/documentos/documentos.facade.spec.ts",
      "line": 210,
      "claim": "C-3c-33, C-3c-45 e C-3c-58 foram implementados só no nível da facade e perderam a metade de DOM que o critério fixa. C-3c-33 exige \"`crlvStatus 'unavailable'`, **data-reason no banner**, **AlternativeChannelNote presente** e nenhum card\" — o spec (`documentos.facade.spec.ts:210`) prova só `crlvStatus`/`crlv()`; C-3c-45 exige \"`portal.screens.t21.state.indisponivel` **+ AlternativeChannelNote**\" — `atendimento.facade.spec.ts:117` prova só que `messageKey` não casa `/recusad/`; C-3c-58 exige \"`portal.screens.t27.state.indisponivel` **+ AlternativeChannelNote** e nenhuma navegação\" — `assinatura.facade.spec.ts:94` prova só `phase`/`started()`. E C-3c-112 exige `<portal-alternative-channel-note>` **em todos os estados** das telas de ato: `grep -c alternative-channel-note` = 0 em `sne.page.spec.ts`, `cnh.page.spec.ts`, `crlv.page.spec.ts`, `manifestation-new.page.spec.ts`, `manifestation-detail.page.spec.ts`, `own-data.page.spec.ts`, `elevation.page.spec.ts` e `junta-medica.page.spec.ts`; a única prova é `a11y/all-routes.a11y.spec.ts:137`, no estado inicial (carregando). A garantia de [RN-PORTAL-105] (o canal presencial nunca fecha) não está provada em nenhum estado de indisponibilidade.",
      "fix": "Acrescentar às páginas T-17, T-21 e T-27 os casos de estado `unavailable` que asseguram `root.querySelector('portal-alternative-channel-note')`, o texto de `portal.screens.t<nn>.state.indisponivel` e o `data-reason` do banner; estender C-3c-112 a um estado de erro/indisponibilidade por tela de ato, além do inicial."
    },
    {
      "severity": "high",
      "item": 13,
      "file": "apps/portal/web/src/app/features/privacidade/privacidade.facade.spec.ts",
      "line": 57,
      "claim": "A matriz de autorização por escopo LGPD é testada com um grant positivo e uma única negativa: `canRequest('correcao') === false` e `canRequest('declaracao_completa') === true`. Os dois escopos canônicos omitidos — `eliminacao` e, sobretudo, `confirmacao` — não têm teste, e `confirmacao` percorre um ramo DIFERENTE do código (`privacidade.facade.ts:72-75`: `scope === BASE_SCOPE` consulta `canPerform('lgpd_declaracao')`, sem sufixo), que fica inteiramente sem cobertura positiva ou negativa. `LGPD_SCOPES` (`components/lgpd-request-form.component.ts`) oferece os quatro ao cidadão e `own-data.page.ts:requestScope` aceita qualquer um, de modo que o fail-closed prometido em §3.7 só está provado para metade da matriz — exatamente a ampliação por analogia que a regra §4.8 de `orchestra/README.md` proíbe.",
      "fix": "Estender C-3c-52 para os quatro escopos: com `actRequirements` contendo só `lgpd_declaracao:declaracao_completa`, assertar `true` para `declaracao_completa` e `false` para `confirmacao`, `correcao` e `eliminacao`; e um segundo caso com `{ act: 'lgpd_declaracao', allowed: true }` provando que só `confirmacao` passa a `true`."
    },
    {
      "severity": "high",
      "item": 8,
      "file": "apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts",
      "line": 125,
      "claim": "O contrato §6 T-19 fixa `<dl data-summary>` \"só com os valores … de `summary` (**chaves cruas em `data-key`, SEM rótulo** — forma livre OD-P91; nada de texto inventado)\", e T-18 proíbe \"vocabulário interno (RENAEST, pending_complement, RECEBIDO) em texto\". A implementação renderiza a chave crua como o texto visível do `<dt>` (`<dt [attr.data-raw-key]=\"entry.key\">{{ entry.key }}</dt>`) sempre que a chave não é `gravidade`/`dinamica` (`LABELLED_SUMMARY_KEYS`, linha 33): qualquer campo novo de `summary` do BOAT (`pending_complement`, `renaest_id`, …) vira rótulo de tela para o cidadão. O ramo nunca é exercitado porque `CRASH_DETAIL_FIXTURE` (`src/testing/http-fixtures-pair3.ts:204`) só tem `dinamica` e `gravidade` — as duas chaves com rótulo —, de modo que nem o spec nem C-3c-113 o pegam.",
      "fix": "Manter a chave crua apenas em `data-key` (como o contrato fixa): omitir o par `<dt>/<dd>` sem rótulo conhecido, ou dar-lhe um rótulo genérico do catálogo; e acrescentar ao `crash-detail.page.spec.ts` um caso com `summary` contendo uma chave fora de `gravidade|dinamica`, provando que ela não aparece como texto."
    },
    {
      "severity": "high",
      "item": 11,
      "file": "apps/portal/web/src/app/core/pages/home.page.ts",
      "line": 45,
      "claim": "§3.10 manda a home linkar `functionalRoute(serviceKey)` para `available`/`partially_available`. A home não usa a regra do §3.9 (`functionalRouteFor`, `features/catalogo/catalogo.facade.ts:57`): reimplementa um `directRouteFor` mais estreito, que só aceita entrada do manifesto SEM parâmetro e descarta o recuo à lista de origem (`/autos`). Resultado: serviços disponíveis cuja única rota do manifesto carrega `:aitId` — `pagamento` (`partially_available` na fixture `http-fixtures-pair3.ts:404`), `indicacao_condutor` e `defesa_previa` — perdem o link funcional na home e caem em `/carta-servicos/<key>` (linhas 232-243), enquanto a T-25 os manda a `/autos`: duas respostas para a mesma pergunta no mesmo app. A A11(f) ratificou apenas o `null` do catálogo para parâmetros ≠ `:aitId`; esta divergência da home não está registrada em nenhum relatório nem adenda.",
      "fix": "Extrair a regra do §3.9 para um helper compartilhado (ou mover `functionalRouteFor` para `core/`) e usá-la na home; se a intenção for mesmo a regra estreita, registrá-la como adenda e corrigir §3.10 no CTG-0005."
    },
    {
      "severity": "high",
      "item": 5,
      "file": "apps/portal/web/src/app/features/atendimento/atendimento.facade.ts",
      "line": 192,
      "claim": "`evaluate()` passa sempre `entitlement: { kind: 'request', id: body.subjectId }`, mesmo quando `body.subjectKind === 'manifestation'` — o caso do convite inline de T-22 ([DIVERGE-18], §3.6). O §2.5 registra que o 404 de `POST /v1/portal/evaluations` é `NOT_FOUND{kind:'manifestation'}`; com o valor fixo, o banner leva o cidadão a `/vinculo/por-que-nao-vejo?recurso=request&id=<manifestationId>`, um par recurso/id que não existe. O `kind` é inventado pelo cliente em vez de vir de `body.subjectKind`, e §2.6 sequer lista `createEvaluation` entre as chamadas com `entitlement`.",
      "fix": "Usar `entitlement: { kind: body.subjectKind, id: body.subjectId }` (ou omitir o `entitlement` neste comando, como §2.6 sugere) e cobrir o 404 de avaliação de manifestação em `atendimento.facade.spec.ts`."
    },
    {
      "severity": "low",
      "item": 5,
      "file": "apps/portal/web/src/app/features/assinatura/assinatura.facade.ts",
      "line": 103,
      "claim": "§3.8 define `required` como \"`requirementFor(actKey)?.level` quando é nível; **senão o `access` da entrada do manifesto ('avancada'|'simples')**; senão 'avancada'\". A implementação salta o degrau do meio e vai direto ao teto (`ASSURANCE_CEILING`). O comentário cita C-3c-56 e [RN-PORTAL-101] c (uma rota `simples` nunca é motivo de elevação), e de fato o critério exige `required 'avancada'` para `/inicio` (rota `simples`): é o §3.8 que está internamente inconsistente, não a entrega.",
      "fix": "Corrigir o texto de §3.8 no CTG-0005 (retirar o degrau `access`), registrando a resolução como adenda desta rodada."
    },
    {
      "severity": "low",
      "item": 8,
      "file": "apps/portal/web/src/app/shared/clearance-status.component.ts",
      "line": 75,
      "claim": "O `<h3>` da seção de débitos usa `portal.services.pagamento` = \"Pagamento de multas\" sobre uma lista que inclui `tributo` (IPVA), `encargo` (licenciamento) e `dpvat`: o título nomeia como multa o que não é. Registrado em A11(e) como chave pendente (`portal.documents.clearance.debts`, a acrescentar em TASK-0012), mas o texto errado entra em produção neste PR.",
      "fix": "Até a chave existir, usar um rótulo neutro já no catálogo (p. ex. `portal.documents.clearance.blocking` não serve; considerar `portal.screens.t17.title`) ou antecipar a chave na adenda de i18n do CTG-0003c."
    },
    {
      "severity": "low",
      "item": 4,
      "file": "apps/portal/web/src/app/core/realtime.service.spec.ts",
      "line": 245,
      "claim": "C-3c-78 exige que `core/realtime.service.ts` \"não contenha outro número além de 60_000 para intervalo\" e §4.1 declara `POLLING_INTERVAL_MS` o \"único valor numérico deste serviço\". O spec filtra os literais por `>= 1000`, o que deixa passar `POLLING_INTERVAL_SECONDS = 60` (`realtime.service.ts:57`), o segundo valor de intervalo introduzido pela entrega.",
      "fix": "Ou aceitar explicitamente os dois valores no contrato (60_000 ms e 60 s derivado), ou derivar os segundos de `POLLING_INTERVAL_MS / 1000` e manter o filtro do spec sem exceções."
    },
    {
      "severity": "low",
      "item": 7,
      "file": "apps/portal/web/src/app/features/privacidade/privacidade.facade.spec.ts",
      "line": 35,
      "claim": "`facade: TestBed.inject(PrivacidadeFacade) as any` foi escrito quando a produção ainda não existia (§9) e permaneceu depois da entrega: o `typecheck` (C-3c-115) deixa de provar a superfície pública desta facade neste arquivo.",
      "fix": "Trocar o `as any` pelo tipo real agora que `privacidade.facade.ts` existe."
    },
    {
      "severity": "low",
      "item": 4,
      "file": "apps/portal/web/src/app/features/notificacoes/static-analysis.pair3.spec.ts",
      "line": 74,
      "claim": "O `catch { continue }` por arquivo (e o `catch { return }` equivalente em `realtime.service.spec.ts:240`) era a acomodação de §9 para arquivos ainda inexistentes; com a produção entregue, ele passa a ser uma porta de saída silenciosa — apagar um arquivo de produção faz a análise estática passar em verde.",
      "fix": "Substituir o `catch` por uma falha explícita (`expect(files.length).toBeGreaterThan(0)` + leitura sem `try`) agora que todos os arquivos do §1 existem."
    },
    {
      "severity": "low",
      "item": 11,
      "file": "apps/portal/web/src/app/features/notificacoes/pages/inbox.page.ts",
      "line": 21,
      "claim": "§6 T-12 fixa `<select name=\"read\">` com as opções `'true'|'false'`; a entrega oferece só \"todas\" e \"não lidas\" por falta de rótulo (`portal.screens.t12.cmd.*` não tem a opção \"só lidas\"). Igualmente, os rótulos dos escopos LGPD reaproveitam `portal.screens.t24.cmd.*` e `portal.common.action.remove` (\"Remover\") para `eliminacao`. Ambos estão registrados em A11(e) como extensão de OD-P89 para TASK-0012 — atende ao item 11, mas a tela entra incompleta.",
      "fix": "Nenhuma ação nesta entrega; garantir que TASK-0012 acrescente as quatro chaves de A11(e) e que o CTG-0005 feche a opção `read=true` de T-12."
    }
  ],
  "notes": [
    "Gates verificados de forma independente nesta worktree: `pnpm --filter @detran/portal-web test` → `Test Files 118 passed (118)` / `Tests 1309 passed | 14 todo (1323)`, exit 0. Os 14 `todo` citam OD (OD-P54, OD-P65, OD-P87, OD-P88, OD-P15, OD-P92, OD-P91, OD-P59, OD-P60, OD-P76); nenhum `it.skip` em todo o app.",
    "Item 5 (i18n): varri o catálogo contra todas as chaves fixas e compostas do par (9 estados de manifestação, 5 tipos, 4 efeitos SNE, 4 kinds de quitação, 4 status de CNH, 3 disponibilidades, 4 níveis de assinatura, 3 canais, 7 estados de push, 13 `nextAction`, 13 `situation.request`, caminhos de elevação) — nenhuma chave ausente. `i18n-keys.spec.ts` cobre os literais, mas os prefixos compostos usam template literal (crase) e escapam do seu regex: a conferência acima foi manual.",
    "Item 5 (vocabulário): todos os 22 códigos de erro novos do par existem em `docs/framework/arch/portal-error-catalog.md`; `CONCLUIDO`/`RESULTADO_DISPONIVEL`/`AVALIACAO_OFERECIDA` de `EVALUABLE_STATES` são estados canônicos (13 chaves `portal.situation.request.*`), e §6 T-26 autoriza explicitamente a leitura informativa do estado.",
    "Item 9 (fronteira nacional): nenhum `fetch(`, `XMLHttpRequest` ou URL absoluta no código novo; `PORTAL_STREAM_URL` = `PORTAL_API_PREFIX + '/stream'`; nenhuma menção a SENATRAN fora de `packages/senatran-adapter`. `PushService` só assina no gesto (`subscribe()` chamado apenas pelo clique de `preferences.page.ts`).",
    "Fronteira de escrita respeitada: os 101 arquivos staged fora de `work/` estão todos sob `apps/portal/web/**`; o Engineer não tocou specs, `src/testing/**`, `a11y/**`, `i18n/**`, `app.route-manifest.ts`, `ngsw-config.json`, `package.json` nem `packages/**`; o Inspector só `*.spec.ts` e `src/testing/**`. `app.routes.ts` mudou só no mapa `CORE_PAGES`.",
    "Item 7 (iteração 3 do Inspector): confirmei que as sete correções são de mecânica (stub de `ServiceCatalogFacade`, um `it` por cenário, prefixo antes do placeholder, `vi.waitFor`, `sessionStorage.clear()`, `advanceTimersByTimeAsync`, `no-unused-vars`). A única troca de asserção (`sne.page.spec.ts:224`, 403 → `portal-assurance-explainer`) é correta: o núcleo de C-3c-21 (`nextStep 'elevation'` e `nextStepRoute '/assinatura/elevacao?retomar=%2Fsne'`) continua provado em `notificacoes.facade.spec.ts:183-186`.",
    "Item 7 (matriz `axe`): as 22 páginas do par usam `expectA11yStateInvariants` (2 a 9 chamadas por spec, praticamente uma por `it`) e `all-routes.a11y.spec.ts` itera as 38 rotas provando que nenhuma rende `PlaceholderPageComponent` — C-3c-110/111 cobertos apesar de C-3c-110 não citar o id literalmente.",
    "§3.8 prevê o banner `portal.errors.assurance_qualified_never_required` para `required === 'qualificada'` e a implementação o traz (`elevation.page.ts`), mas nenhum critério C-3c o exercita — lacuna do contrato, não da entrega; vale um critério no CTG-0005."
  ]
}
```

### Diff das correções de produção (árvore do ciclo 1 → staged; specs tocados listados acima — leia-os na worktree)

```diff
diff --git a/apps/portal/web/README.md b/apps/portal/web/README.md
index bbf3654a..07f19532 100644
--- a/apps/portal/web/README.md
+++ b/apps/portal/web/README.md
@@ -229,7 +229,7 @@ src/testing/              stubs e harness dos specs (Inspector)
   `assinatura` (T-27; navegação ao `redirectUrl` é da página) e `catalogo` (T-25 lista/detalhe;
   T-15 estática — OD-P90). Nenhuma rota do manifesto usa `PlaceholderPageComponent`.
 - Regras transversais mantidas: nenhum prazo, ciência ficta, validade ou fila calculados no cliente;
-  tokens só em `data-*`; resposta sem status HTTP (0) apresentada como `portal.states.offline` nas
-  facades do par (o `ErrorBoundary` só o faz com o browser declarado desconectado, cuja leitura
-  C-3c-113 veda nas features); indisponibilidades do backend (M15) mostradas com motivo e canal,
-  nunca simuladas.
+  tokens só em `data-*`; offline é classificado SÓ pelo `ErrorBoundary` (status 0 e browser
+  desconectado — A12(a)); nenhuma facade lê `navigator`; indisponibilidades do backend (M15)
+  mostradas com motivo e canal, nunca simuladas. A regra §3.9 da rota funcional vive em
+  `core/functional-route.ts` (`functionalRouteFor`), usada pela Carta de Serviços e pela home.
diff --git a/apps/portal/web/src/app/core/functional-route.ts b/apps/portal/web/src/app/core/functional-route.ts
new file mode 100644
index 00000000..fe6d327e
--- /dev/null
+++ b/apps/portal/web/src/app/core/functional-route.ts
@@ -0,0 +1,23 @@
+// Rota funcional de um serviço (contrato CTG-0003c §3.9, válida também para a home — A12(e)):
+// pelo `serviceKey`, a primeira entrada do `PORTAL_ROUTE_MANIFEST` com esse serviço e sem
+// parâmetro `:` no caminho → a própria rota; só entradas com parâmetro sobre um AIT
+// (`defesa_previa`, `indicacao_condutor`, `pagamento`…) → a lista de origem `/autos`; outro
+// parâmetro ou nenhuma entrada → `null` (sem botão/link funcional). Nunca `item.route` do catálogo
+// (é caminho de fixture, `/servicos/…`). Função pura, sem injeção.
+import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
+
+/** Lista de origem dos atos sobre um AIT (rotas com `:aitId`). */
+const AUTOS_ROUTE = '/autos';
+const AIT_PARAM = ':aitId';
+
+export function functionalRouteFor(serviceKey: string): string | null {
+  const entries = PORTAL_ROUTE_MANIFEST.filter(
+    (entry) => entry.serviceKey === serviceKey,
+  );
+  if (entries.length === 0) return null;
+  const direct = entries.find((entry) => !entry.path.includes(':'));
+  if (direct) return `/${direct.path}`;
+  return entries.some((entry) => entry.path.includes(AIT_PARAM))
+    ? AUTOS_ROUTE
+    : null;
+}
diff --git a/apps/portal/web/src/app/core/pages/home.page.ts b/apps/portal/web/src/app/core/pages/home.page.ts
index 5c85c41e..5716ed78 100644
--- a/apps/portal/web/src/app/core/pages/home.page.ts
+++ b/apps/portal/web/src/app/core/pages/home.page.ts
@@ -4,10 +4,10 @@
 // catálogo real (`GET /v1/portal/services` pelo cache do par 1) em lista semântica — nome do
 // serviço pela chave `portal.services.<serviceKey>` (ausente → só `data-service-key`),
 // disponibilidade como `data-availability` + rótulo, nota do canal alternativo quando indisponível,
-// link à rota funcional DIRETA do manifesto (entrada com o `serviceKey` e sem parâmetro) só para
-// `available`/`partially_available`; indisponível ou ato sobre um recurso (`:aitId`…) → o detalhe
-// na Carta de Serviços (C-3c-69). A falha do catálogo mostra `portal.states.error` + tentar de novo
-// sem esconder a entrada gov.br.
+// link à rota funcional (`core/functional-route.ts`, regra §3.9 — A12(e)) só para
+// `available`/`partially_available`; indisponível ou sem rota funcional → o detalhe na Carta de
+// Serviços. A falha do catálogo mostra `portal.states.error` + tentar de novo sem esconder a
+// entrada gov.br.
 import {
   ChangeDetectionStrategy,
   Component,
@@ -22,10 +22,10 @@ import {
   StynxTranslatePipe,
 } from '@detran/ui';
 import { map } from 'rxjs';
-import { PORTAL_ROUTE_MANIFEST } from '../../app.route-manifest';
 import type { ServiceCatalogItem } from '../../data/portal.client';
 import { readStatusFor, type ReadStatus } from '../../data/read-status';
 import { AuthFlowService } from '../auth-flow.service';
+import { functionalRouteFor } from '../functional-route';
 import { PortalErrorBannerComponent } from '../error-banner.component';
 import {
   GENERIC_ERROR_KEY,
@@ -41,15 +41,6 @@ const CHARTER_ROUTE = '/carta-servicos';
 const SERVICES_KEY_PREFIX = `portal.services.`;
 const AVAILABILITY_KEY_PREFIX = `portal.situation.availability.`;

-/** Rota funcional DIRETA (sem parâmetro) do serviço no manifesto; atos sobre um recurso → `null`. */
-function directRouteFor(serviceKey: string): string | null {
-  const entry = PORTAL_ROUTE_MANIFEST.find(
-    (candidate) =>
-      candidate.serviceKey === serviceKey && !candidate.path.includes(':'),
-  );
-  return entry ? `/${entry.path}` : null;
-}
-
 @Component({
   selector: 'portal-home-page',
   imports: [
@@ -192,13 +183,8 @@ export class HomePageComponent {
     } catch (error: unknown) {
       if (sequence !== this.sequence) return;
       const presentation = presentError(error);
-      // Resposta sem status HTTP (0) = sem rede (contrato §2.6): apresentada como offline.
-      this.errorState.set(
-        presentation.status === 0 && presentation.code === null
-          ? { ...presentation, messageKey: OFFLINE_KEY }
-          : presentation,
-      );
-      this.statusState.set(readStatusFor(this.errorState() ?? presentation));
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
     }
   }

@@ -228,18 +214,18 @@ export class HomePageComponent {
     return `${AVAILABILITY_KEY_PREFIX}${availability}`;
   }

-  /** Rota funcional direta para `available`/`partially_available`; senão → Carta de Serviços. */
+  /** Rota funcional (§3.9) para `available`/`partially_available`; senão → Carta de Serviços. */
   isFunctional(item: ServiceCatalogItem): boolean {
     return (
       item.availability !== 'unavailable' &&
       !!item.serviceKey &&
-      directRouteFor(item.serviceKey) !== null
+      functionalRouteFor(item.serviceKey) !== null
     );
   }

   routeFor(item: ServiceCatalogItem): string {
     const serviceKey = item.serviceKey ?? '';
-    if (this.isFunctional(item)) return directRouteFor(serviceKey) ?? '';
+    if (this.isFunctional(item)) return functionalRouteFor(serviceKey) ?? '';
     return `${CHARTER_ROUTE}/${serviceKey}`;
   }
 }
diff --git a/apps/portal/web/src/app/core/pages/inicio.facade.ts b/apps/portal/web/src/app/core/pages/inicio.facade.ts
index f0ca966f..425f6fde 100644
--- a/apps/portal/web/src/app/core/pages/inicio.facade.ts
+++ b/apps/portal/web/src/app/core/pages/inicio.facade.ts
@@ -13,11 +13,7 @@ import type {
   RequestSummary,
 } from '../../data/portal-read.models';
 import { readStatusFor, type ReadStatus } from '../../data/read-status';
-import {
-  OFFLINE_KEY,
-  presentError,
-  type ErrorPresentation,
-} from '../error-boundary';
+import { presentError, type ErrorPresentation } from '../error-boundary';
 import { ResumeService, type ResumePoint } from '../resume.service';
 import { SessionFacade } from '../session.facade';

@@ -41,14 +37,6 @@ const RESUME_LABEL_KEY = 'portal.shell.inicio.resume';
 const RESUME_ID = 'resume';
 const NEXT_ACTION_KEY_PREFIX = `portal.requests.nextAction.`;

-/** Resposta sem status HTTP (0) = sem rede (contrato §2.6/§7.1; sem `navigator` fora do `ErrorBoundary`). */
-function presentRead(error: unknown): ErrorPresentation {
-  const presentation = presentError(error);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
 function compareText(a: string, b: string): number {
   return a < b ? -1 : a > b ? 1 : 0;
 }
@@ -209,7 +197,7 @@ export class InicioFacade {
       this.inboxStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.sequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.inboxErrorState.set(presentation);
       this.inboxStatusState.set(readStatusFor(presentation));
     }
@@ -225,7 +213,7 @@ export class InicioFacade {
       this.aitsStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.sequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.aitsErrorState.set(presentation);
       this.aitsStatusState.set(readStatusFor(presentation));
     }
@@ -241,7 +229,7 @@ export class InicioFacade {
       this.requestsStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.sequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.requestsErrorState.set(presentation);
       this.requestsStatusState.set(readStatusFor(presentation));
     }
diff --git a/apps/portal/web/src/app/core/realtime.service.ts b/apps/portal/web/src/app/core/realtime.service.ts
index 68ca2916..ce3038c7 100644
--- a/apps/portal/web/src/app/core/realtime.service.ts
+++ b/apps/portal/web/src/app/core/realtime.service.ts
@@ -55,8 +55,10 @@ export type PortalStreamType = (typeof PORTAL_STREAM_TYPES)[number];
 /** Spec §8 / contrato §9: "fallback de polling de 60 s". Único intervalo deste serviço. */
 export const POLLING_INTERVAL_MS = 60_000;

-/** O mesmo intervalo em segundos (spec §8 "60 s") — converte `retryAfter` (segundos) em ticks. */
-const POLLING_INTERVAL_SECONDS = 60;
+/** Milissegundos por segundo (unidade, não intervalo): `retryAfter` chega em segundos. */
+const MS_PER_SECOND = 1000;
+/** O mesmo intervalo em segundos, derivado — um único literal de intervalo (C-3c-78). */
+const POLLING_INTERVAL_SECONDS = POLLING_INTERVAL_MS / MS_PER_SECOND;

 /** `data` por tipo (`portal-stream.service.ts` `reshape`): só ids, o token cidadão e o nextAction. */
 export interface PortalStreamData {
diff --git a/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts b/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts
index c87d37ee..abb0dec0 100644
--- a/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts
+++ b/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts
@@ -7,10 +7,8 @@
 // mais o pedido avaliado em T-26 (`GET requests/{id}`, par 2). Erros só pelo `ErrorBoundary`.
 import { Injectable, inject, signal } from '@angular/core';
 import {
-  OFFLINE_KEY,
   presentError,
   type ErrorPresentation,
-  type PresentErrorOptions,
 } from '../../core/error-boundary';
 import { SessionFacade } from '../../core/session.facade';
 import { PortalClient } from '../../data/portal.client';
@@ -33,21 +31,6 @@ const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
 const KIND_INVALID_CODE = 'PORTAL.MANIFESTATION_KIND_INVALID';
 const KIND_FIELD = 'kind';

-/**
- * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
- * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
- * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
- */
-function presentRead(
-  error: unknown,
-  options?: PresentErrorOptions,
-): ErrorPresentation {
-  const presentation = presentError(error, options);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
 function commandStatusOf(presentation: ErrorPresentation): CommandStatus {
   if (presentation.code === SERVICE_UNAVAILABLE_CODE) return 'unavailable';
   const status = readStatusFor(presentation);
@@ -119,7 +102,7 @@ export class AtendimentoFacade {
       this.createStatusState.set('done');
       return result.body;
     } catch (error: unknown) {
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.createErrorState.set(
         presentation.code === KIND_INVALID_CODE
           ? { ...presentation, fields: [KIND_FIELD] }
@@ -142,7 +125,7 @@ export class AtendimentoFacade {
       this.detailStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.detailSequence) return;
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'manifestation', id: manifestationId },
       });
       this.detailState.set(null);
@@ -165,7 +148,7 @@ export class AtendimentoFacade {
       void this.loadDetail(manifestationId);
       return result.body;
     } catch (error: unknown) {
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'manifestation', id: manifestationId },
       });
       this.ackErrorState.set(presentation);
@@ -188,8 +171,8 @@ export class AtendimentoFacade {
       this.evaluationStatusState.set('done');
       return result.body;
     } catch (error: unknown) {
-      const presentation = presentRead(error, {
-        entitlement: { kind: 'request', id: body.subjectId },
+      const presentation = presentError(error, {
+        entitlement: { kind: body.subjectKind, id: body.subjectId },
       });
       this.evaluationErrorState.set(presentation);
       this.evaluationStatusState.set(commandStatusOf(presentation));
@@ -209,7 +192,7 @@ export class AtendimentoFacade {
       this.requestStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.requestSequence) return;
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'request', id: requestId },
       });
       this.requestState.set(null);
diff --git a/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts b/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts
index 33eb9379..0724d15e 100644
--- a/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts
+++ b/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts
@@ -1,18 +1,16 @@
 // CatalogoFacade (contrato CTG-0003c §3.9; T-25/T-15; [RN-PORTAL-108]; [DIVERGE-22/23]): a Carta de
 // Serviços — a lista vem do cache do par 1 (`PortalServiceCatalogFacade.items()`, `GET services`,
 // ordem do servidor) e o detalhe de `GET services/{serviceKey}` (404 = fora do catálogo →
-// `not_found`, sem vínculo). `functionalRoute` resolve a rota FUNCIONAL do serviço pelo manifesto
-// (nunca `item.route`, caminho de fixture): primeira entrada com o `serviceKey` sem parâmetro `:`;
-// só com parâmetro (defesa_previa…) → a lista de origem `/autos`; sem entrada → `null`. T-15 é
+// `not_found`, sem vínculo). `functionalRoute` delega a `core/functional-route.ts` (regra §3.9,
+// compartilhada com a home — A12(e)): entrada do manifesto sem parâmetro → rota; só `:aitId` →
+// `/autos`; outro parâmetro ou nenhuma entrada → `null`; nunca `item.route`. T-15 é
 // estática (sem operação gerada, OD-P90): sem leitura aqui.
 import { Injectable, inject, signal } from '@angular/core';
-import { PORTAL_ROUTE_MANIFEST } from '../../app.route-manifest';
 import {
-  OFFLINE_KEY,
   presentError,
   type ErrorPresentation,
-  type PresentErrorOptions,
 } from '../../core/error-boundary';
+import { functionalRouteFor } from '../../core/functional-route';
 import { PortalServiceCatalogFacade } from '../../core/service-catalog.facade';
 import {
   PortalClient,
@@ -20,38 +18,6 @@ import {
 } from '../../data/portal.client';
 import { readStatusFor, type ReadStatus } from '../../data/read-status';

-/** Lista de origem dos atos sobre um AIT (rotas com `:aitId`). */
-const AUTOS_ROUTE = '/autos';
-const AIT_PARAM = ':aitId';
-
-/**
- * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
- * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
- * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
- */
-function presentRead(
-  error: unknown,
-  options?: PresentErrorOptions,
-): ErrorPresentation {
-  const presentation = presentError(error, options);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
-/** Rota funcional de um `serviceKey` pelo manifesto (spec §4 "Ir para o serviço"). */
-export function functionalRouteFor(serviceKey: string): string | null {
-  const entries = PORTAL_ROUTE_MANIFEST.filter(
-    (entry) => entry.serviceKey === serviceKey,
-  );
-  if (entries.length === 0) return null;
-  const direct = entries.find((entry) => !entry.path.includes(':'));
-  if (direct) return `/${direct.path}`;
-  return entries.some((entry) => entry.path.includes(AIT_PARAM))
-    ? AUTOS_ROUTE
-    : null;
-}
-
 @Injectable()
 export class CatalogoFacade {
   private readonly client = inject(PortalClient);
@@ -82,7 +48,7 @@ export class CatalogoFacade {
       this.statusState.set(items.length === 0 ? 'empty' : 'ready');
     } catch (error: unknown) {
       if (sequence !== this.sequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.errorState.set(presentation);
       this.statusState.set(readStatusFor(presentation));
     }
@@ -100,7 +66,7 @@ export class CatalogoFacade {
       this.statusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.sequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.selectedState.set(null);
       this.errorState.set(presentation);
       this.statusState.set(readStatusFor(presentation));
diff --git a/apps/portal/web/src/app/features/documentos/documentos.facade.ts b/apps/portal/web/src/app/features/documentos/documentos.facade.ts
index 60dca335..23986bfa 100644
--- a/apps/portal/web/src/app/features/documentos/documentos.facade.ts
+++ b/apps/portal/web/src/app/features/documentos/documentos.facade.ts
@@ -10,10 +10,8 @@
 // O store é resolvido na primeira necessidade (como o `HttpClient` no `PortalClient`).
 import { Injectable, Injector, computed, inject, signal } from '@angular/core';
 import {
-  OFFLINE_KEY,
   presentError,
   type ErrorPresentation,
-  type PresentErrorOptions,
 } from '../../core/error-boundary';
 import { OfflineDocumentStore } from '../../core/offline-document.store';
 import { PortalClient } from '../../data/portal.client';
@@ -72,21 +70,6 @@ function toLicense(license: unknown): CnhLicense {
   };
 }

-/**
- * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
- * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
- * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
- */
-function presentRead(
-  error: unknown,
-  options?: PresentErrorOptions,
-): ErrorPresentation {
-  const presentation = presentError(error, options);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
 function commandStatusOf(presentation: ErrorPresentation): CommandStatus {
   if (presentation.code === SERVICE_UNAVAILABLE_CODE) return 'unavailable';
   const status = readStatusFor(presentation);
@@ -166,7 +149,7 @@ export class DocumentosFacade {
       }
     } catch (error: unknown) {
       if (sequence !== this.cnhSequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       const status = readStatusFor(presentation);
       if (status === 'offline') {
         const cached = await this.offlineStore.get<CnhRead>('cnh-e');
@@ -204,7 +187,7 @@ export class DocumentosFacade {
       this.cnhDocumentStatusState.set('done');
       return blob;
     } catch (error: unknown) {
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.cnhDocumentErrorState.set(presentation);
       this.cnhDocumentStatusState.set(commandStatusOf(presentation));
       return null;
@@ -226,7 +209,7 @@ export class DocumentosFacade {
       );
     } catch (error: unknown) {
       if (sequence !== this.vehiclesSequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.vehiclesErrorState.set(presentation);
       this.vehiclesStatusState.set(readStatusFor(presentation));
     }
@@ -244,7 +227,7 @@ export class DocumentosFacade {
       this.clearanceStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.clearanceSequence) return;
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'vehicle', id: vehicleId },
       });
       const status = readStatusFor(presentation);
@@ -271,7 +254,7 @@ export class DocumentosFacade {
         await this.offlineStore.put('crlv-e', issued, issued.validUntil);
       }
     } catch (error: unknown) {
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'vehicle', id: vehicleId },
       });
       this.crlvErrorState.set(presentation);
diff --git a/apps/portal/web/src/app/features/exames/exames.facade.ts b/apps/portal/web/src/app/features/exames/exames.facade.ts
index cdc32a70..6c964fbf 100644
--- a/apps/portal/web/src/app/features/exames/exames.facade.ts
+++ b/apps/portal/web/src/app/features/exames/exames.facade.ts
@@ -7,10 +7,8 @@
 // o detalhe só acrescenta o prazo (`DeadlineCard`). Nenhum cálculo de prazo aqui.
 import { Injectable, computed, inject, signal } from '@angular/core';
 import {
-  OFFLINE_KEY,
   presentError,
   type ErrorPresentation,
-  type PresentErrorOptions,
 } from '../../core/error-boundary';
 import { ResumeService } from '../../core/resume.service';
 import {
@@ -35,21 +33,6 @@ export interface BoardDeadline {

 const SERVICE_KEY = 'junta_medica';

-/**
- * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
- * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
- * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
- */
-function presentRead(
-  error: unknown,
-  options?: PresentErrorOptions,
-): ErrorPresentation {
-  const presentation = presentError(error, options);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
 @Injectable()
 export class ExamesFacade {
   private readonly client = inject(PortalClient);
@@ -101,7 +84,7 @@ export class ExamesFacade {
       this.statusState.set(items.length === 0 ? 'empty' : 'ready');
     } catch (error: unknown) {
       if (sequence !== this.listSequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.errorState.set(presentation);
       this.statusState.set(readStatusFor(presentation));
     }
@@ -119,7 +102,7 @@ export class ExamesFacade {
       this.detailStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.detailSequence) return;
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'exam', id: examId },
       });
       this.detailState.set(null);
diff --git a/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts b/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts
index 98f35c1d..a5ceb1dd 100644
--- a/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts
+++ b/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts
@@ -18,10 +18,8 @@ import {
 } from '@angular/core';
 import { merge } from 'rxjs';
 import {
-  OFFLINE_KEY,
   presentError,
   type ErrorPresentation,
-  type PresentErrorOptions,
 } from '../../core/error-boundary';
 import {
   RealtimeService,
@@ -61,21 +59,6 @@ const SNE_RELOAD_CODES: ReadonlySet<string> = new Set([
   'PORTAL.SNE_NOT_ENROLLED',
 ]);

-/**
- * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
- * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
- * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
- */
-function presentRead(
-  error: unknown,
-  options?: PresentErrorOptions,
-): ErrorPresentation {
-  const presentation = presentError(error, options);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
 /** 201/200 de adesão/cancelamento têm a mesma forma de `GET sne/enrollment` (canal como string no gerado). */
 function asEnrollment(body: SneEnrolled | SneCancelled): SneEnrollment {
   return body as unknown as SneEnrollment;
@@ -167,7 +150,7 @@ export class NotificacoesFacade {
       this.statusState.set(page.total === 0 ? 'empty' : 'ready');
     } catch (error: unknown) {
       if (sequence !== this.listSequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.errorState.set(presentation);
       this.statusState.set(readStatusFor(presentation));
     }
@@ -210,7 +193,7 @@ export class NotificacoesFacade {
       void this.loadList();
       return result.body;
     } catch (error: unknown) {
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.readErrorState.set(presentation);
       this.readStatusState.set(commandStatusOf(presentation));
       // Item desapareceu da caixa: a lista é relida (§6 T-12).
@@ -239,7 +222,7 @@ export class NotificacoesFacade {
       this.preferencesStatusState.set('done');
       return result.body;
     } catch (error: unknown) {
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.preferencesErrorState.set(presentation);
       this.preferencesStatusState.set(
         presentation.code !== null &&
@@ -263,7 +246,7 @@ export class NotificacoesFacade {
       this.enrollmentStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.enrollmentSequence) return;
-      const presentation = presentRead(error, { resumeRoute: SNE_ROUTE });
+      const presentation = presentError(error, { resumeRoute: SNE_ROUTE });
       this.enrollmentErrorState.set(presentation);
       this.enrollmentStatusState.set(readStatusFor(presentation));
     }
@@ -302,7 +285,7 @@ export class NotificacoesFacade {
   }

   private failSne(error: unknown): void {
-    const presentation = presentRead(error, { resumeRoute: SNE_ROUTE });
+    const presentation = presentError(error, { resumeRoute: SNE_ROUTE });
     this.sneCommandErrorState.set(presentation);
     this.sneCommandStatusState.set(commandStatusOf(presentation));
     if (presentation.code !== null && SNE_RELOAD_CODES.has(presentation.code)) {
diff --git a/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts b/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts
index 4578ba70..f2252aa9 100644
--- a/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts
+++ b/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts
@@ -1,7 +1,7 @@
 // T-19 Detalhe do sinistro (contrato CTG-0003c §6; ficha IU-PORTAL-T19; [RN-PORTAL-118];
 // [JRN-PORTAL-007]; OD-P19/OD-P91): resumo primeiro — o rótulo de estado do servidor (`data-token`),
-// o id como protocolo e um `<dl>` só com os valores primitivos de `summary` (chaves cruas em
-// `data-key`, sem rótulo inventado; `gravidade`/`dinamica` ganham rótulo quando existem); a supressão
+// o id como protocolo e um `<dl>` só com os valores primitivos de `summary` (a chave crua vai SÓ em
+// `data-key`, nunca como texto; `gravidade`/`dinamica` ganham rótulo quando existem); a supressão
 // de dado de terceiro é anunciada em `role="status"` (o servidor já suprimiu; o titular vê o próprio
 // dado sem máscara). "Baixar boletim" não tem rota ([DIVERGE-15]) → `aria-disabled` + indisponível
 // nesta versão. `CRASH_NOT_FINAL` é erro recuperável sem prazo; 404 → vínculo; 5xx → indisponível.
@@ -121,8 +121,6 @@ function isPrimitive(
               <div [attr.data-key]="entry.key">
                 @if (entry.labelKey; as labelKey) {
                   <dt>{{ labelKey | stynxTranslate }}</dt>
-                } @else {
-                  <dt [attr.data-raw-key]="entry.key">{{ entry.key }}</dt>
                 }
                 <dd>{{ entry.value }}</dd>
               </div>
diff --git a/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts b/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts
index 034e5c87..08be2581 100644
--- a/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts
+++ b/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts
@@ -6,30 +6,13 @@
 // o servidor já suprimiu os dados de terceiro. Nenhum download de boletim ([DIVERGE-15]).
 import { Injectable, computed, inject, signal } from '@angular/core';
 import {
-  OFFLINE_KEY,
   presentError,
   type ErrorPresentation,
-  type PresentErrorOptions,
 } from '../../core/error-boundary';
 import { PortalClient } from '../../data/portal.client';
 import type { CrashDetail, CrashSummary } from '../../data/portal-read.models';
 import { readStatusFor, type ReadStatus } from '../../data/read-status';

-/**
- * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
- * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
- * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
- */
-function presentRead(
-  error: unknown,
-  options?: PresentErrorOptions,
-): ErrorPresentation {
-  const presentation = presentError(error, options);
-  return presentation.status === 0 && presentation.code === null
-    ? { ...presentation, messageKey: OFFLINE_KEY }
-    : presentation;
-}
-
 /** Texto pesquisável de um item: `stateLabel` + valores string de `summary` (forma livre, OD-P91). */
 function searchableText(item: CrashSummary): string {
   const values = Object.values(item.summary ?? {}).filter(
@@ -81,7 +64,7 @@ export class SinistrosFacade {
       this.statusState.set(items.length === 0 ? 'empty' : 'ready');
     } catch (error: unknown) {
       if (sequence !== this.listSequence) return;
-      const presentation = presentRead(error);
+      const presentation = presentError(error);
       this.errorState.set(presentation);
       this.statusState.set(readStatusFor(presentation));
     }
@@ -103,7 +86,7 @@ export class SinistrosFacade {
       this.detailStatusState.set('ready');
     } catch (error: unknown) {
       if (sequence !== this.detailSequence) return;
-      const presentation = presentRead(error, {
+      const presentation = presentError(error, {
         entitlement: { kind: 'crash', id: crashId },
       });
       this.detailState.set(null);
diff --git a/apps/portal/web/src/app/i18n/portal.pt-BR.json b/apps/portal/web/src/app/i18n/portal.pt-BR.json
index f81626ed..bfe588ea 100644
--- a/apps/portal/web/src/app/i18n/portal.pt-BR.json
+++ b/apps/portal/web/src/app/i18n/portal.pt-BR.json
@@ -631,6 +631,7 @@
   "portal.documents.clearance.restrictions": "Restrições",
   "portal.documents.clearance.suspended": "Sob recurso",
   "portal.documents.clearance.can_issue": "Pode emitir o CRLV-e",
+  "portal.documents.clearance.debts": "Débitos a pagar",
   "portal.documents.category.documento": "Documento oficial",
   "portal.documents.category.copia": "Cópia",
   "portal.screens.t18.field.busca": "O que você lembra do ocorrido",
diff --git a/apps/portal/web/src/app/shared/clearance-status.component.ts b/apps/portal/web/src/app/shared/clearance-status.component.ts
index 31b9efe2..f5ca2393 100644
--- a/apps/portal/web/src/app/shared/clearance-status.component.ts
+++ b/apps/portal/web/src/app/shared/clearance-status.component.ts
@@ -69,10 +69,8 @@ export type IssueDisabledReason = 'debt' | 'restriction' | 'server';
           </p>
         }

-        <!-- Título da seção de débitos: o catálogo não tem chave própria (OD-P89 não a lista);
-             usa-se o nome do serviço que os resolve até a chave existir (relatado). -->
         <section data-debts>
-          <h3>{{ 'portal.services.pagamento' | stynxTranslate }}</h3>
+          <h3>{{ 'portal.documents.clearance.debts' | stynxTranslate }}</h3>
           @if (clearance.items.length > 0) {
             <ul>
               @for (item of clearance.items; track $index) {
```
