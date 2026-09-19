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

**Décimo primeiro ciclo — restrito aos onze achados de `prompt-review-10`** (orchestra/README.md §5).
Avalie somente estas correções:

1. (high 3) `TASK-0018.md` §Pode tocar: `src/app/app.routes.ts` **só o mapa `CORE_PAGES`**; `TASK-0021.md` §1 e §9 citam a exceção; manifesto segue intocável.
2. (high 2) `TASK-0021.md` §Leitura: `CTG-0003a.md` §11 e `CTG-0003b.md` §10 incluídos.
3. (high 2) `TASK-0021.md` §Leitura: `RN-PORTAL-128.md`, `RN-RAIT-131.md`, `WF-PORTAL-001.md` §Catálogo/§Carta, `JRN-PORTAL-001.md`, `JRN-PORTAL-004.md` incluídos.
4. (high 5) `TASK-0021.md` §2: origem do `If-Match` de `PUT preferences` → `source_pending`/OD a partir de OD-P83, com o 428 antes do 422 registrado.
5. (low 8) os três prompts: "`data-screen` = `screen` da entrada do manifesto (`""` quando `null`, como M8)".
6. (low 2) `TASK-0021.md` §6: `/carta-servicos/:serviceKey` enumerada.
7. (low 10) `TASK-0021.md` §5: `[DIVERGE-n]` explícita para ciência ficta (spec §5.2 "calculada" × contrato §6 do servidor).
8. (low 10) `TASK-0021.md` §4: `[DIVERGE-n]` explícita `@stynx-nyx/notifications` × `SwPush` (pacote ausente de M2).
9. (low 2) `TASK-0021.md` §7: semântica do slot único do `OfflineDocumentStore` para T-17 por veículo (fixar ou OD).
10. (low 2) `TASK-0017.md` §Leitura: `src/app/core/pages/*.ts` e `src/app/a11y/public-routes.a11y.spec.ts`.
11. (low 4) `TASK-0017.md` §Critérios: placeholders `{{ARQUIVOS_ANTERIORES}}`/`{{TESTES_ANTERIORES}}` que o maestro preenche no disparo (após o merge do PR 3b), em vez de baseline indeterminado.
12. (low 6) `TASK-0021.md` §10: lista fechada das chaves i18n faltantes (padrão OD-P58/OD-P70).

`compositions.json` recalculado.

### Veredito anterior (prompt-review-10.json)

```json
{
  "mode": "prompt-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 3,
      "file": "work/rounds/R-0014/prompts/TASK-0018.md",
      "line": 59,
      "claim": "a fronteira proíbe `src/app/app.routes.ts`, mas é o único ponto de injeção das páginas reais do `core` exigidas por TASK-0021 §1/§3: `apps/portal/web/src/app/app.routes.ts:21-38` define `CORE_PAGES` e `:150` chama `moduleRoutes('core', CORE_PAGES)`; as entradas `acessibilidade` (l. 23), `inicio` (l. 28) e `conta` (l. 29) estão sem `component` (placeholder). Com essa fronteira as três páginas nunca são roteadas: os specs de rota de `core/pages/*.spec.ts` (TASK-0017 item 3/5) e o gate `axe` nas 38 rotas não passam e o Engineer só pode abrir bloqueio",
      "fix": "acrescentar a `Pode tocar` de TASK-0018 `src/app/app.routes.ts` **restrito ao mapa `CORE_PAGES`** (nunca `FEATURE_MOUNTS` nem o manifesto), citar essa exceção em TASK-0021 §1 e §9, e manter `src/app/app.route-manifest.ts` fora"
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 47,
      "claim": "a leitura fecha `CTG-0003a.md` em §1–§7 e `CTG-0003b.md` em §1–§5, mas o próprio prompt manda honrar OD-P65 (l. 41, 112) e OD-P75 (l. 41) e resolver `[DIVERGE-1]` (l. 107), definidos fora desse recorte: `contracts/CTG-0003a.md:1365` §11 (OD-P65 em :1449, [DIVERGE-1] em :1367) e `contracts/CTG-0003b.md:1359` §10 (OD-P75 em :1446); a numeração 'a partir de OD-P83' também só é verificável ali (plan.md §Adendas só cita 'OD-P57…P67'/'OD-P69…P82' por número). TASK-0020 (PASS em prompt-review-9) lia `CTG-0003a.md` inteiro",
      "fix": "incluir `contracts/CTG-0003a.md` §11 e `contracts/CTG-0003b.md` §10 (ou os dois contratos inteiros, como em TASK-0020) na leitura obrigatória"
    },
    {
      "severity": "high",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 54,
      "claim": "a lista fechada omite fontes canônicas que as próprias fichas do par declaram e sem as quais os critérios de conteúdo do §6 não têm base: [RN-PORTAL-128] (fonte de `IU-PORTAL-T09.md:14`; faixa de 40 % e a declaração pelo SNE — base de 'T-09 separada da decisão de pagar'), [WF-PORTAL-001] §Catálogo (fonte de `IU-PORTAL-T25.md:16`, dos onze campos e da adenda A4), [JRN-PORTAL-004] + [RN-RAIT-131] (únicas fontes de T-15 — `IU-PORTAL-T15.md:16,49`), [JRN-PORTAL-001] (fonte de `IU-PORTAL-T27.md:15`). TASK-0020 carregava RN-PORTAL-128, JRN-PORTAL-001 e RN-RAIT-131",
      "fix": "acrescentar `rules/RN-PORTAL-128.md`, `workflows/WF-PORTAL-001.md` (§Catálogo), `journeys/JRN-PORTAL-004.md`, `journeys/JRN-PORTAL-001.md` e `domains/inf/rait/rules/RN-RAIT-131.md` à leitura"
    },
    {
      "severity": "high",
      "item": 5,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 89,
      "claim": "o prompt prescreve a origem do `If-Match` do `PUT preferences` como `portal.subject.version` — valor sem fonte visível ao cliente: `portal-route-contract.md:55` exige `If-Match`, mas `GET me` (:50) não devolve `version` nem `ETag` (o contrato não menciona `ETag` e `backend/domains/portal/identity/src/handwritten/me.controller.ts` não emite o cabeçalho); `portal.subject.version` é coluna de DDL (`61-portal-identity.sql:15`). A regra do par 1 é 'If-Match sempre do `ETag` lido (nunca inventado)' (`apps/portal/web/src/app/data/portal.client.ts:6`)",
      "fix": "trocar por `source_pending`/OD (a partir de OD-P83) para a origem do `If-Match` de `PUT preferences` e registrar que a rota responde 428 `PORTAL.IF_MATCH_REQUIRED` (catálogo §7) **antes** do 422 `PORTAL.SERVICE_UNAVAILABLE { unavailableReason: 'preferences_substrato_pendente' }` (OD-P38), incluindo o 428 nos negativos do §8 e no item 1 de TASK-0017"
    },
    {
      "severity": "low",
      "item": 8,
      "file": "work/rounds/R-0014/prompts/TASK-0018.md",
      "line": 68,
      "claim": "'host binding `data-screen=\"T-nn\"` em toda página' (idem TASK-0021 l. 80 e l. 128) não vale para 7 rotas do par, que têm `screen: null` no manifesto (`/`, `/inicio`, `/conta`, `/acessibilidade`, `/veiculos`, `/notificacoes/preferencias`, `/exames/:examId/junta/nova`) — M8 fixa `data-screen=\"\"` nesses casos; redigido assim, convida a inventar um `T-nn`",
      "fix": "redigir como '`data-screen` = `screen` da entrada do manifesto (`\"\"` quando `null`)' nos três prompts"
    },
    {
      "severity": "low",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 114,
      "claim": "a lista de rotas do §6 (14 telas + 7 acréscimos) deixa `/carta-servicos/:serviceKey` de fora: T-25 tem duas entradas no manifesto (`app.route-manifest.ts` paths `carta-servicos` e `carta-servicos/:serviceKey`), e a segunda tem estado próprio na ficha (`IU-PORTAL-T25.md:60,95`: `serviceKey` inexistente → `PORTAL.NOT_FOUND`); sem ela uma das 38 rotas fica sem especificação para o gate `axe`",
      "fix": "acrescentar `/carta-servicos/:serviceKey` à enumeração do §6"
    },
    {
      "severity": "low",
      "item": 10,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 104,
      "claim": "o prompt resolve em silêncio uma contradição com a fonte que ele mesmo declara como contrato: `portal-frontends.md:161` (spec §5.2, citada na l. 139) diz `NotificationList` com 'ciência ficta **calculada**', enquanto o prompt (l. 104-105) e TASK-0017 (item 4) exigem 'recebida — `fictitiousAcknowledgementOn`, nunca calculada' (contrato de rotas §6 :105; plan.md l. 142)",
      "fix": "instruir explicitamente o registro de `[DIVERGE-n]` no §10 (spec §5.2 × contrato de rotas §6 + 'ciência ficta vem do servidor'), em vez de resolução tácita"
    },
    {
      "severity": "low",
      "item": 10,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 98,
      "claim": "§4 manda usar `SwPush.requestSubscription` (M14), mas a l. 139 cita como definição a spec §8 'push web via `@stynx-nyx/notifications`'; o pacote não está em M2 nem em `apps/portal/web/node_modules/@stynx-nyx/` (só `angular`, `angular-auth`, `angular-i18n`, `angular-tenancy`, `angular-ui`) e instalar é proibido (l. 5) — a escolha é forçada, não livre",
      "fix": "pedir `[DIVERGE-n]` no §10 (spec §8 `@stynx-nyx/notifications` × M14 `SwPush`, pacote ausente das dependências), mantendo a chave VAPID como `source_pending`"
    },
    {
      "severity": "low",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 122,
      "claim": "§7 manda usar o `OfflineDocumentStore` do par 1 em T-16/T-17, mas o store guarda **um** slot por `kind` (`apps/portal/web/src/app/core/offline-document.store.ts:135` `storageKey(kind)`), enquanto T-17 é por `:vehicleId`; o Engineer não pode alterar `core/**` (TASK-0018 l. 57), então uma chave por veículo viraria bloqueio no meio da tríade",
      "fix": "exigir que o §7 fixe a semântica do slot único (ex.: guarda o último CRLV-e consultado; outro veículo offline → `portal.states.offline`) ou proponha OD a partir de OD-P83, antes de o Inspector codificar"
    },
    {
      "severity": "low",
      "item": 2,
      "file": "work/rounds/R-0014/prompts/TASK-0017.md",
      "line": 43,
      "claim": "leitura insuficiente para dois artefatos que o próprio prompt pede: `src/app/core/*.ts` não cobre `src/app/core/pages/*.ts` (item 3 exige specs de `/inicio`, `/conta`, `/acessibilidade`, `/`, cujo padrão está em `core/pages/home.page.ts`), e `src/app/a11y/public-routes.a11y.spec.ts` — o spec de `axe` por rota já existente, que usa `PORTAL_ROUTES` + `substituteRouteParams` e é o precedente direto de `all-routes.a11y.spec.ts` (item 6) — está fora da lista fechada",
      "fix": "acrescentar `src/app/core/pages/*.ts` (só assinaturas) e `src/app/a11y/public-routes.a11y.spec.ts` à leitura obrigatória"
    },
    {
      "severity": "low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0017.md",
      "line": 99,
      "claim": "o critério de regressão fica sem resultado esperado explícito ('todos os testes anteriores verdes … informe a contagem inicial'), enquanto TASK-0015 l. 98-99 fixava '711 testes (+3 todo)' e 'Test Files N failed | 50 passed'; baseline indeterminado foi achado `high` no ciclo 3 desta rodada (plan.md §Bloqueios B0 e budget prompt-review-3)",
      "fix": "preencher o número no disparo (depois do merge do PR 3b): 'os N testes (+ M todo) anteriores verdes; Test Files X failed | Y passed'"
    },
    {
      "severity": "low",
      "item": 6,
      "file": "work/rounds/R-0014/prompts/TASK-0021.md",
      "line": 117,
      "claim": "o §6 só pede 'chaves i18n (existentes; faltantes → OD)', sem lista fechada; nos pares 1 e 2 a lacuna de chaves virou dependência obrigatória entre Architect e Inspector (A6(d)/OD-P58, 26 chaves; A8(a)/OD-P70, 46 chaves), porque o catálogo é imutável para Inspector e Engineer e chave faltante é bloqueio (TASK-0018 l. 25) — sem lista fechada o checkpoint do §4.18 não pode ser preparado",
      "fix": "exigir no §10 a lista fechada das chaves faltantes (como `CTG-0003a.md` §11 e `CTG-0003b.md` §10), para o maestro rodar a iteração do transcriber (TASK-0006 it. 7) antes de TASK-0017"
    }
  ],
  "notes": [
    "Formal: os sha256 de `prompts/TASK-0021|0017|0018.md` conferem com `compositions.json` e os `pc_id` com os três `tasks/*.json`; tríade e ordem corretas (0021 → 0017 → 0018, `upstream_task_id` 0016 → 0021 → 0017, mesmo `coupled_task_group` CTG-0003c); `target_modules` idênticos às linhas de `plan.md` §Tarefas; nenhum prompt autoriza `git`; todos os `acceptance_commands` existem (`pnpm check` já inclui `format:check` e `verify:parameter-catalogue`).",
    "Modelo/esforço condizem com `model-ladder.md` (Architect opus/alto; Inspector sonnet/médio por 'matriz grande'; Engineer opus/médio) e com o precedente do par 2.",
    "Contagem conferida: 38 rotas no manifesto (7 `core` + 31 de feature; 18 do par 3) — o valor citado nos três prompts está correto; as 14 fichas existem e todas as subárvores `portal.screens.t09|12|15|16|17|18|19|20|21|22|24|25|26|27.*` já estão no catálogo, com `portal.legal.efeitos_sne.v1.{ciencia_ficta,substituicao,responsabilidade,cancelamento}` (A5) e `portal.evaluations.publicIndicator`.",
    "Nada inventado nos tokens verificados: `payment.confirmed` como 4º evento SSE é canônico (`portal-route-contract.md` §9 e `backend/app/src/portal-stream.service.ts:58-61`), assim como `fictitiousAcknowledgementOn`, `suspendedEnforceability`/`blocking`, `CRLV_BLOCKED_BY_DEBT|_RESTRICTION`, `NATIONAL_READ_UNAVAILABLE` com `cachedAt`/`retryAfter`, `PORTAL.RATE_LIMITED` 429, `resumeToken`, `documentBytes` e o veto a `CONDICIONADO` (RN-PEC-105); `lgpd_declaracao` é de fato `partially_available` na fixture e `junta_medica` está ausente dela (A4).",
    "Todos os caminhos das três listas de leitura existem na worktree, exceto `src/app/data/portal-read.models.ts`, que o par 2 ainda não entregou — TASK-0021 já o marca como '(se já existir do par 2)' e TASK-0018 o trata como acréscimo; sem impacto se a tríade só disparar após o merge do PR 3b, como o §4.18 exige.",
    "`max_iterations: 2` nos três JSONs: o par 1 precisou de 3 iterações do Inspector e do Engineer e este é o maior lote da rodada (14 telas + 7 compartilhados + realtime/push + `axe` nas 38 rotas) — considerar 3 para 0017/0018.",
    "`src/app/core/clock.ts` (`PortalClock`, usado pelo `OfflineDocumentStore`) está fora da leitura do Architect, embora o §4 fixe o timer de 60 s; incluir evitaria um relógio próprio no `RealtimeService`.",
    "Item 13 (negativas exaustivas) está coberto para o vocabulário do portal: níveis de assinatura (`/exames/:examId/junta/nova` = `avancada`, `/ouvidoria/nova` = `nenhum_ou_simples`), vínculo e disponibilidade seguem a matriz do CTG-0001, e o par 3 acrescenta titular × terceiro (TASK-0021 §6, ux-notes §h)."
  ]
}
```
