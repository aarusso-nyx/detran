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

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0003c (par 3 — greenfield + PWA;
fecha o WP-P5)** — tríade TASK-0021 (Architect: `work/rounds/R-0014/contracts/CTG-0003c.md`, 115
critérios C-3c-nn, `[DIVERGE-n]`, OD-P87…P100; chaves i18n OD-P89 já commitadas no PR #63),
TASK-0017 (Inspector, Sonnet/médio: 42 specs + 4 stubs; iteração 2 = matriz `axe` por estado
integral sobre 22 páginas + 7 compartilhados e `axe` nas 38 rotas; iteração 3 = correção de
mecânica de 26 specs após a implementação — adenda A11(g), sem redução de asserção), TASK-0018
(Engineer, Opus: 23 métodos do `PortalClient` + tipos, `RealtimeService` (SSE + polling 60 s),
`PushService` (`SwPush`), `InicioFacade` + oito facades de módulo, sete compartilhados
`NotificationList`/`SneConsent`/`DigitalDocumentCard`/`ClearanceStatus`/`OwnDataPanel`/
`ManifestationForm`/`EvaluationForm`, 22 páginas reais — T-12, T-09, preferências, T-16, T-17,
`/veiculos`, T-18, T-19, T-20, junta, T-21, T-22, T-26, T-24, T-27, T-25, T-15, `/inicio`, `/conta`,
`/acessibilidade`, `/` — no lugar dos placeholders; `CORE_PAGES` e oito `*.routes.ts`).
Adenda do maestro **A11** (ratificações do Engineer: `load()` resolve com o resultado nos signals;
`status 0` → `portal.states.offline` nas facades do par 3 com **OD-P102** para absorver no
`ErrorBoundary` no CTG-0005; T-27 explicador + botões `data-method`; junta médica sem `start()`
automático; OD-P89 estendida com quatro chaves pedidas; iteração 3 restrita do Inspector).
Relatórios em `work/rounds/R-0014/reports/` (`TASK-0021.md`, `TASK-0017.md`,
`TASK-0017-iteration-2.md`, `TASK-0017-iteration-3.md`, `TASK-0018.md`). Reviewer desta rodada:
Claude/Opus por desvio do Owner (`AUTHORIZATION.md` amendment 1; Codex no limite de uso) — julgue
com o mesmo rigor. A entrega está **staged, não commitada** (`git diff --cached`), no branch
publicado `orchestra/portal-pwa` (= `origin/main` `d2412558` + observação `29a1f06d` + contrato/
prompts `6476339b`).

Gates executados pelo maestro sobre a árvore staged (log `pnpm-check-ctg3c.log`):
`pnpm check` completo → **EXIT 0**; `pnpm --filter @detran/portal-web test` → **Test Files 118
passed, Tests 1309 passed | 14 todo (1323)**, 0 erros não tratados; typecheck/lint/build OK (bundle
inicial 542,2 kB < 600 kB, A9g); `verify:parameter-catalogue` OK (87 entradas, 14 namespaces);
`format:check` OK. Os 14 `todo` citam OD-P15/P54/P59/P60/P65/P76/P87/P88/P92 (nunca `todo` sem OD).

Itens a julgar com atenção: (5) nada inventado — chaves i18n só as do catálogo (OD-P89) ou
reaproveitadas com registro (A11(e)); `elevationId`/`resumeToken` (OD-P15), VAPID (OD-P88),
`If-Match` de `PUT preferences` (OD-P87), polling 60 s (contrato §4.1), `maxAge` offline (OD-P51);
delegações → `delegacao_indisponivel_r0007` (M15), nunca simuladas; (7) nenhum spec enfraquecido —
a iteração 3 do Inspector é de mecânica (stub de `ServiceCatalogFacade`, `it` por cenário,
prefixo antes do placeholder, `vi.waitFor`, limpeza de `sessionStorage`, fake timers) e a única
mudança de asserção (`sne.page.spec` 403 → `portal-assurance-explainer`) segue [DIVERGE-6]/C-3c-21;
os 14 `todo` citam OD (nunca `todo` sem OD); (8) tokens só em `data-token`/`data-reason`; ciência
ficta **recebida, nunca calculada** (`static-analysis.pair3.spec.ts` varre `Date`/`sort`/`navigator`
nas features — C-3c-113); (9) browser só fala com `/v1/portal/*`; `PushService` só assina com
opt-in; (11) o relatório do Engineer lista as decisões aditivas (A11(a)…(f)) — verifique se alguma
contradiz o contrato ou a spec; (13) presença/ausência: 503 `NATIONAL_READ_UNAVAILABLE` com
`cachedAt`/`retryAfter`, `CRLV_BLOCKED_*`, 404, `RATE_LIMITED` no SSE, `SERVICE_UNAVAILABLE`
(OD-P38/P17), `ASSURANCE_INSUFFICIENT` → explicador.

### git diff --cached --stat (sem `work/`)

```
 apps/portal/web/README.md                                             |  48 ++++
 apps/portal/web/src/app/a11y/all-routes.a11y.spec.ts                  | 152 ++++++++++
 apps/portal/web/src/app/app.routes.ts                                 |  17 +-
 apps/portal/web/src/app/core/pages/acessibilidade.page.spec.ts        |  58 ++++
 apps/portal/web/src/app/core/pages/acessibilidade.page.ts             |  68 +++++
 apps/portal/web/src/app/core/pages/conta.page.spec.ts                 | 129 +++++++++
 apps/portal/web/src/app/core/pages/conta.page.ts                      | 184 ++++++++++++
 apps/portal/web/src/app/core/pages/home.page.spec.ts                  | 168 +++++++++++
 apps/portal/web/src/app/core/pages/home.page.ts                       | 215 +++++++++++++-
 apps/portal/web/src/app/core/pages/inicio.facade.spec.ts              | 183 ++++++++++++
 apps/portal/web/src/app/core/pages/inicio.facade.ts                   | 249 ++++++++++++++++
 apps/portal/web/src/app/core/pages/inicio.page.spec.ts                | 133 +++++++++
 apps/portal/web/src/app/core/pages/inicio.page.ts                     | 216 ++++++++++++++
 apps/portal/web/src/app/core/push.service.spec.ts                     | 145 ++++++++++
 apps/portal/web/src/app/core/push.service.ts                          | 140 +++++++++
 apps/portal/web/src/app/core/realtime.service.spec.ts                 | 249 ++++++++++++++++
 apps/portal/web/src/app/core/realtime.service.ts                      | 422 +++++++++++++++++++++++++++
 apps/portal/web/src/app/data/portal-read.models.ts                    | 282 +++++++++++++++++++
 apps/portal/web/src/app/data/portal.client.pair3.spec.ts              | 485 ++++++++++++++++++++++++++++++++
 apps/portal/web/src/app/data/portal.client.ts                         | 284 +++++++++++++++++++
 apps/portal/web/src/app/features/assinatura/assinatura.facade.spec.ts | 194 +++++++++++++
 apps/portal/web/src/app/features/assinatura/assinatura.facade.ts      | 175 ++++++++++++
 apps/portal/web/src/app/features/assinatura/assinatura.routes.ts      |  14 +-
 .../web/src/app/features/assinatura/pages/elevation.page.spec.ts      | 207 ++++++++++++++
 apps/portal/web/src/app/features/assinatura/pages/elevation.page.ts   | 223 +++++++++++++++
 .../web/src/app/features/atendimento/atendimento.facade.spec.ts       | 304 ++++++++++++++++++++
 apps/portal/web/src/app/features/atendimento/atendimento.facade.ts    | 220 +++++++++++++++
 apps/portal/web/src/app/features/atendimento/atendimento.routes.ts    |  24 +-
 .../web/src/app/features/atendimento/pages/evaluation.page.spec.ts    | 271 ++++++++++++++++++
 apps/portal/web/src/app/features/atendimento/pages/evaluation.page.ts | 201 +++++++++++++
 .../app/features/atendimento/pages/manifestation-detail.page.spec.ts  | 165 +++++++++++
 .../src/app/features/atendimento/pages/manifestation-detail.page.ts   | 278 ++++++++++++++++++
 .../src/app/features/atendimento/pages/manifestation-new.page.spec.ts | 182 ++++++++++++
 .../web/src/app/features/atendimento/pages/manifestation-new.page.ts  | 134 +++++++++
 apps/portal/web/src/app/features/catalogo/catalogo.facade.spec.ts     |  88 ++++++
 apps/portal/web/src/app/features/catalogo/catalogo.facade.ts          | 113 ++++++++
 apps/portal/web/src/app/features/catalogo/catalogo.routes.ts          |  23 +-
 .../web/src/app/features/catalogo/pages/points-explainer.page.spec.ts |  60 ++++
 .../web/src/app/features/catalogo/pages/points-explainer.page.ts      |  47 ++++
 .../web/src/app/features/catalogo/pages/service-charter.page.spec.ts  | 221 +++++++++++++++
 .../web/src/app/features/catalogo/pages/service-charter.page.ts       | 406 ++++++++++++++++++++++++++
 apps/portal/web/src/app/features/documentos/documentos.facade.spec.ts | 272 ++++++++++++++++++
 apps/portal/web/src/app/features/documentos/documentos.facade.ts      | 308 ++++++++++++++++++++
 apps/portal/web/src/app/features/documentos/documentos.routes.ts      |  24 +-
 apps/portal/web/src/app/features/documentos/pages/cnh.page.spec.ts    | 239 ++++++++++++++++
 apps/portal/web/src/app/features/documentos/pages/cnh.page.ts         | 259 +++++++++++++++++
 apps/portal/web/src/app/features/documentos/pages/crlv.page.spec.ts   | 228 +++++++++++++++
 apps/portal/web/src/app/features/documentos/pages/crlv.page.ts        | 211 ++++++++++++++
 .../web/src/app/features/documentos/pages/vehicles.page.spec.ts       | 159 +++++++++++
 apps/portal/web/src/app/features/documentos/pages/vehicles.page.ts    | 140 +++++++++
 .../features/exames/components/junta-medica-form.component.spec.ts    | 112 ++++++++
 .../src/app/features/exames/components/junta-medica-form.component.ts | 107 +++++++
 apps/portal/web/src/app/features/exames/exames.facade.spec.ts         | 126 +++++++++
 apps/portal/web/src/app/features/exames/exames.facade.ts              | 153 ++++++++++
 apps/portal/web/src/app/features/exames/exames.routes.ts              |  19 +-
 apps/portal/web/src/app/features/exames/pages/exam-list.page.spec.ts  | 219 ++++++++++++++
 apps/portal/web/src/app/features/exames/pages/exam-list.page.ts       | 216 ++++++++++++++
 .../web/src/app/features/exames/pages/junta-medica.page.spec.ts       | 108 +++++++
 apps/portal/web/src/app/features/exames/pages/junta-medica.page.ts    | 187 ++++++++++++
 .../web/src/app/features/notificacoes/notificacoes.facade.spec.ts     | 271 ++++++++++++++++++
 apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts  | 322 +++++++++++++++++++++
 apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts  |  21 +-
 .../portal/web/src/app/features/notificacoes/pages/inbox.page.spec.ts | 184 ++++++++++++
 apps/portal/web/src/app/features/notificacoes/pages/inbox.page.ts     | 218 ++++++++++++++
 .../web/src/app/features/notificacoes/pages/preferences.page.spec.ts  | 147 ++++++++++
 .../web/src/app/features/notificacoes/pages/preferences.page.ts       | 198 +++++++++++++
 apps/portal/web/src/app/features/notificacoes/pages/sne.page.spec.ts  | 228 +++++++++++++++
 apps/portal/web/src/app/features/notificacoes/pages/sne.page.ts       | 202 +++++++++++++
 .../web/src/app/features/notificacoes/static-analysis.pair3.spec.ts   |  99 +++++++
 .../privacidade/components/lgpd-request-form.component.spec.ts        | 110 ++++++++
 .../features/privacidade/components/lgpd-request-form.component.ts    | 120 ++++++++
 .../web/src/app/features/privacidade/pages/own-data.page.spec.ts      | 209 ++++++++++++++
 apps/portal/web/src/app/features/privacidade/pages/own-data.page.ts   | 347 +++++++++++++++++++++++
 .../web/src/app/features/privacidade/privacidade.facade.spec.ts       |  61 ++++
 apps/portal/web/src/app/features/privacidade/privacidade.facade.ts    |  97 +++++++
 apps/portal/web/src/app/features/privacidade/privacidade.routes.ts    |  14 +-
 .../web/src/app/features/sinistros/pages/crash-detail.page.spec.ts    | 202 +++++++++++++
 apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts | 210 ++++++++++++++
 .../web/src/app/features/sinistros/pages/crash-list.page.spec.ts      | 134 +++++++++
 apps/portal/web/src/app/features/sinistros/pages/crash-list.page.ts   | 171 +++++++++++
 apps/portal/web/src/app/features/sinistros/sinistros.facade.spec.ts   | 110 ++++++++
 apps/portal/web/src/app/features/sinistros/sinistros.facade.ts        | 114 ++++++++
 apps/portal/web/src/app/features/sinistros/sinistros.routes.ts        |  19 +-
 apps/portal/web/src/app/shared/clearance-status.component.spec.ts     | 144 ++++++++++
 apps/portal/web/src/app/shared/clearance-status.component.ts          | 242 ++++++++++++++++
 .../portal/web/src/app/shared/digital-document-card.component.spec.ts | 177 ++++++++++++
 apps/portal/web/src/app/shared/digital-document-card.component.ts     | 192 +++++++++++++
 apps/portal/web/src/app/shared/evaluation-form.component.spec.ts      | 140 +++++++++
 apps/portal/web/src/app/shared/evaluation-form.component.ts           | 227 +++++++++++++++
 apps/portal/web/src/app/shared/manifestation-form.component.spec.ts   | 123 ++++++++
 apps/portal/web/src/app/shared/manifestation-form.component.ts        | 271 ++++++++++++++++++
 apps/portal/web/src/app/shared/notification-list.component.spec.ts    | 120 ++++++++
 apps/portal/web/src/app/shared/notification-list.component.ts         | 168 +++++++++++
 apps/portal/web/src/app/shared/own-data-panel.component.spec.ts       | 120 ++++++++
 apps/portal/web/src/app/shared/own-data-panel.component.ts            | 149 ++++++++++
 apps/portal/web/src/app/shared/sne-consent.component.spec.ts          | 211 ++++++++++++++
 apps/portal/web/src/app/shared/sne-consent.component.ts               | 292 +++++++++++++++++++
 apps/portal/web/src/testing/contract-types-pair3.ts                   | 349 +++++++++++++++++++++++
 apps/portal/web/src/testing/http-fixtures-pair3.ts                    | 441 +++++++++++++++++++++++++++++
 apps/portal/web/src/testing/portal-stream-transport.stub.ts           |  73 +++++
 apps/portal/web/src/testing/sw-push.stub.ts                           |  74 +++++
 101 files changed, 17741 insertions(+), 44 deletions(-)
```

### git diff --cached — produção e configuração (sem `work/`, specs e `src/testing/**`; specs e

stubs leia na worktree — 48 specs + `src/testing/{contract-types-pair3,http-fixtures-pair3,portal-stream-transport.stub,sw-push.stub}.ts`)

```diff
diff --git a/apps/portal/web/README.md b/apps/portal/web/README.md
index 16225671..bbf3654a 100644
--- a/apps/portal/web/README.md
+++ b/apps/portal/web/README.md
@@ -185,3 +185,51 @@ src/testing/              stubs e harness dos specs (Inspector)
   do servidor; delegações reais (`422 SERVICE_UNAVAILABLE { delegacao_indisponivel_r0007 }`)
   aparecem como indisponíveis com motivo e canal, nunca simuladas (M15). Sem `canDeactivate`
   neste par (OD-P79); polling/SSE, `/sne` e "formato acessível" persistente ficam para o par 3.
+
+## Par 3 do app funcional (CTG-0003c): greenfield + PWA
+
+- `data/portal.client.ts`: leituras e comandos do par 3 (`getService`, `listInbox`,
+  `markInboxRead`, `getSneEnrollment`, `enrollSne`, `cancelSne`, `createPushSubscription`,
+  `updatePreferences`, `getCnh`, `downloadCnhDocument`, `listVehicles`, `getVehicleClearance`,
+  `issueCrlv`, `listCrashes`, `getCrash`, `listExams`, `getExam`, `listManifestations`,
+  `getManifestation`, `createManifestation`, `acknowledgeManifestation`, `createEvaluation`,
+  `getServiceCharterDeadline`) — `Idempotency-Key` sempre nos comandos (`<ato>:<alvo|none>:<fp>`),
+  `If-Match` só em `PUT preferences` (valor do chamador; `null` omite e o servidor responde 428 —
+  OD-P87), `cancelSne` sem corpo envia `{}`, `downloadCnhDocument` em blob com o erro decodificado.
+  Tipos em `data/portal-read.models.ts` (só `import type` do gerado; formas livres transcritas do
+  contrato de rotas e marcadas `source_pending` — OD-P91).
+- `core/realtime.service.ts` (`RealtimeService`, `providedIn: 'root'`): `GET /v1/portal/stream`
+  por um transporte injetável (`PortalStreamTransport`; implementação padrão pelo `HttpClient`
+  STYNX com `observe: 'events'` + `partialText` — o `EventSource` nativo não envia o bearer,
+  [DIVERGE-1]/OD-P96), parser incremental do `text/event-stream`, `on(type)`, `events`, `tick`;
+  queda → `polling` a cada `POLLING_INTERVAL_MS` (60 s, único intervalo) com reabertura no mesmo
+  compasso; `429 RATE_LIMITED { retryAfter }` adia a reabertura; `401`/`403` param; sessão
+  inativa → `stop()`; reabertura sem frame = `204` → próxima abertura sem `Last-Event-ID`.
+  `core/push.service.ts` (`PushService`): `SwPush` (opcional fora de `provideServiceWorker`) +
+  `POST push-subscriptions`, só por gesto explícito; `PUSH_SERVER_PUBLIC_KEY` é `null` (OD-P88) →
+  push `unavailable`.
+- Páginas reais do `core` (`app.routes.ts` só mudou no mapa `CORE_PAGES`): `/inicio`
+  (`core/pages/inicio.page.ts` + `inicio.facade.ts`: três leituras em paralelo, cada uma com o seu
+  estado; pendências ordenadas SÓ pelo `dueOn` recebido; "Falta 1 passo" pelo `ResumeService`),
+  `/conta` (titular sem máscara; representações em lista sem seleção — OD-P48; "sair" =
+  `StynxSessionService.logout()`, [DIVERGE-29] resolvido), `/acessibilidade` (declaração estática)
+  e `/` (catálogo real pelo cache do par 1; falha não esconde a entrada gov.br — OD-P50).
+- Sete compartilhados novos em `shared/`: `notification-list` (ciência ficta TAL COMO recebida,
+  [DIVERGE-4]), `sne-consent` (quatro efeitos antes do botão; `effectsAck` com o enum do fio,
+  OD-P61; sem faixa de pagamento), `digital-document-card` (categoria A exige QR; senão C),
+  `clearance-status` (três seções; multa sob recurso nunca bloqueia; nenhuma soma), `own-data-panel`
+  (sem máscara; correção ao lado do dado), `manifestation-form` (recebimento irrecusável; sem anexos,
+  [DIVERGE-19]) e `evaluation-form` (escala pendente — OD-P65 — numérica sem min/max).
+- Oito módulos com facades providas na página e 14 páginas: `notificacoes` (T-12, preferências,
+  T-09), `documentos` (T-16, `/veiculos`, T-17 — `OfflineDocumentStore` só com validade do servidor
+  e categoria A; documento offline só do MESMO veículo, [DIVERGE-13]), `sinistros` (T-18 com busca
+  LOCAL, [DIVERGE-14]; T-19), `exames` (T-20 com `legalLabel` tal qual; junta pelo ciclo comum com
+  início por ato do cidadão), `atendimento` (T-21/T-22/T-26; `POST evaluations` para pedido e
+  manifestação, [DIVERGE-18]), `privacidade` (T-24 pelo ciclo comum `lgpd_declaracao`),
+  `assinatura` (T-27; navegação ao `redirectUrl` é da página) e `catalogo` (T-25 lista/detalhe;
+  T-15 estática — OD-P90). Nenhuma rota do manifesto usa `PlaceholderPageComponent`.
+- Regras transversais mantidas: nenhum prazo, ciência ficta, validade ou fila calculados no cliente;
+  tokens só em `data-*`; resposta sem status HTTP (0) apresentada como `portal.states.offline` nas
+  facades do par (o `ErrorBoundary` só o faz com o browser declarado desconectado, cuja leitura
+  C-3c-113 veda nas features); indisponibilidades do backend (M15) mostradas com motivo e canal,
+  nunca simuladas.
diff --git a/apps/portal/web/src/app/app.routes.ts b/apps/portal/web/src/app/app.routes.ts
index eba3f50d..f3d08f6d 100644
--- a/apps/portal/web/src/app/app.routes.ts
+++ b/apps/portal/web/src/app/app.routes.ts
@@ -11,22 +11,31 @@ import {
   ownsFirstSegment,
   type ManifestRouteOptions,
 } from './core/manifest-routes';
+import { AcessibilidadePageComponent } from './core/pages/acessibilidade.page';
 import { AuthCallbackPageComponent } from './core/pages/auth-callback.page';
+import { ContaPageComponent } from './core/pages/conta.page';
 import { EntitlementMissingPageComponent } from './core/pages/entitlement-missing.page';
 import { HomePageComponent } from './core/pages/home.page';
+import { InicioPageComponent } from './core/pages/inicio.page';
 import { NotFoundPageComponent } from './core/pages/not-found.page';
 import { ServiceUnavailablePageComponent } from './core/pages/service-unavailable.page';

-/** Páginas do `core` por caminho do manifesto; as demais rotas do `core` são placeholder. */
+/** Páginas do `core` por caminho do manifesto (todas reais desde o CTG-0003c). */
 const CORE_PAGES: Readonly<Record<string, ManifestRouteOptions>> = {
   '': { component: HomePageComponent, title: 'portal.shell.title.home' },
-  acessibilidade: { title: 'portal.shell.title.acessibilidade' },
+  acessibilidade: {
+    component: AcessibilidadePageComponent,
+    title: 'portal.shell.title.acessibilidade',
+  },
   'auth/callback': {
     component: AuthCallbackPageComponent,
     title: 'portal.shell.title.auth_callback',
   },
-  inicio: { title: 'portal.shell.title.inicio' },
-  conta: { title: 'portal.shell.title.conta' },
+  inicio: {
+    component: InicioPageComponent,
+    title: 'portal.shell.title.inicio',
+  },
+  conta: { component: ContaPageComponent, title: 'portal.shell.title.conta' },
   'vinculo/por-que-nao-vejo': {
     component: EntitlementMissingPageComponent,
     title: 'portal.shell.title.vinculo',
diff --git a/apps/portal/web/src/app/core/pages/acessibilidade.page.ts b/apps/portal/web/src/app/core/pages/acessibilidade.page.ts
new file mode 100644
index 00000000..009633e8
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/acessibilidade.page.ts
@@ -0,0 +1,68 @@
+// /acessibilidade (contrato CTG-0003c §6/§3.10; [RN-PORTAL-113] "Padrão técnico adotado"; A1):
+// declaração estática do padrão adotado — WCAG 2.1 AA + eMAG 3.1 (textos do catálogo, OD-P89) —
+// com o link externo `accessibilityUrl` da marca quando disponível e os caminhos para relatar
+// uma barreira (ouvidoria) e para a Carta de Serviços. Sem leitura própria.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+import { BrandService } from '../brand.service';
+
+const OUVIDORIA_ROUTE = '/ouvidoria/nova';
+const CHARTER_ROUTE = '/carta-servicos';
+
+@Component({
+  selector: 'portal-acessibilidade-page',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { 'data-screen': '' },
+  template: `
+    <h1 tabindex="-1">
+      {{ 'portal.shell.title.acessibilidade' | stynxTranslate }}
+    </h1>
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    ></div>
+    <p data-intro>{{ 'portal.shell.acessibilidade.intro' | stynxTranslate }}</p>
+    <p data-standard>
+      {{ 'portal.shell.acessibilidade.standard' | stynxTranslate }}
+    </p>
+    @if (accessibilityUrl(); as url) {
+      <p>
+        <a [attr.href]="url" rel="noopener" data-accessibility-url>{{
+          'portal.shell.footer.acessibilidade' | stynxTranslate
+        }}</a>
+      </p>
+    }
+    <p data-contact>
+      {{ 'portal.shell.acessibilidade.contact' | stynxTranslate }}
+      <a [routerLink]="ouvidoriaRoute" [attr.routerLink]="ouvidoriaRoute">{{
+        'portal.common.link.ouvidoria' | stynxTranslate
+      }}</a>
+    </p>
+    <p>
+      <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
+        'portal.common.link.carta' | stynxTranslate
+      }}</a>
+    </p>
+  `,
+})
+export class AcessibilidadePageComponent {
+  private readonly brand = inject(BrandService);
+
+  readonly ouvidoriaRoute = OUVIDORIA_ROUTE;
+  readonly charterRoute = CHARTER_ROUTE;
+
+  readonly accessibilityUrl = computed<string | null>(() => {
+    const brand = this.brand.state();
+    return brand.status === 'available'
+      ? (brand.accessibilityUrl ?? null)
+      : null;
+  });
+}
diff --git a/apps/portal/web/src/app/core/pages/conta.page.ts b/apps/portal/web/src/app/core/pages/conta.page.ts
new file mode 100644
index 00000000..98e9ca1b
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/conta.page.ts
@@ -0,0 +1,184 @@
+// /conta (contrato CTG-0003c §6/§3.10; [RN-PORTAL-118]; OD-P48; [DIVERGE-29]): a conta do cidadão
+// pelo `SessionFacade` — nome e CPF SEM máscara (titular), nível de identidade traduzido
+// (`portal.situation.assurance.<nível>`), data da verificação gov.br e as representações em lista
+// (sem seleção nem `POST representations` até OD-P48: `representation()` é `null`). Links de
+// privacidade, preferências e SNE; "sair" encerra a sessão STYNX (`StynxSessionService.logout()`)
+// e o `effect` da `PortalSessionFacade` limpa conta e cache offline. Sem facade própria.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { StynxSessionService } from '@stynx-nyx/angular-auth';
+import { PortalErrorBannerComponent } from '../error-banner.component';
+import { presentError, type ErrorPresentation } from '../error-boundary';
+import { SessionFacade } from '../session.facade';
+
+const PRIVACY_ROUTE = '/privacidade/meus-dados';
+const PREFERENCES_ROUTE = '/notificacoes/preferencias';
+const SNE_ROUTE = '/sne';
+const ASSURANCE_KEY_PREFIX = `portal.situation.assurance.`;
+
+@Component({
+  selector: 'portal-conta-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.aria-busy]': 'session.loading() ? "true" : null',
+  },
+  template: `
+    <h1 tabindex="-1">{{ 'portal.shell.title.conta' | stynxTranslate }}</h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (session.loading()) {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (loadError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (session.account(); as account) {
+      <dl data-account>
+        <dt>{{ 'portal.shell.conta.name' | stynxTranslate }}</dt>
+        <dd data-name>{{ account.name ?? '' }}</dd>
+        <dt>{{ 'portal.shell.conta.cpf' | stynxTranslate }}</dt>
+        <dd data-cpf>{{ account.cpf }}</dd>
+        <dt>{{ 'portal.shell.conta.level' | stynxTranslate }}</dt>
+        <dd data-level [attr.data-token]="session.assuranceLevel()">
+          @if (session.assuranceLevel(); as level) {
+            {{ assuranceKey(level) | stynxTranslate }}
+          }
+          @if (account.govbrLevelObservedAt; as observedAt) {
+            <time [attr.datetime]="observedAt">{{
+              'portal.shell.conta.observed_at'
+                | stynxTranslate
+                  : { observedAt: (observedAt | stynxIntlDate: dateTimeFormat) }
+            }}</time>
+          }
+        </dd>
+      </dl>
+    }
+
+    <section aria-labelledby="portal-conta-representations-title">
+      <h2 id="portal-conta-representations-title">
+        {{ 'portal.shell.conta.representations' | stynxTranslate }}
+      </h2>
+      @if (session.representations().length > 0) {
+        <ul data-representations>
+          @for (representation of session.representations(); track $index) {
+            <li
+              [attr.data-id]="representation.id ?? null"
+              [attr.data-token]="representation.scope ?? null"
+            >
+              <span data-label>{{ representation.label }}</span>
+              @if (representation.validUntil; as validUntil) {
+                <time [attr.datetime]="validUntil">{{
+                  validUntil | stynxIntlDate
+                }}</time>
+              }
+            </li>
+          }
+        </ul>
+      } @else {
+        <p data-no-representations>
+          {{ 'portal.shell.conta.no_representations' | stynxTranslate }}
+        </p>
+      }
+    </section>
+
+    <nav [attr.aria-label]="'portal.shell.conta.links' | stynxTranslate">
+      <ul>
+        <li>
+          <a [routerLink]="privacyRoute" [attr.routerLink]="privacyRoute">{{
+            'portal.screens.t24.title' | stynxTranslate
+          }}</a>
+        </li>
+        <li>
+          <a
+            [routerLink]="preferencesRoute"
+            [attr.routerLink]="preferencesRoute"
+            >{{ 'portal.notifications.preferences.title' | stynxTranslate }}</a
+          >
+        </li>
+        <li>
+          <a [routerLink]="sneRoute" [attr.routerLink]="sneRoute">{{
+            'portal.screens.t09.title' | stynxTranslate
+          }}</a>
+        </li>
+      </ul>
+    </nav>
+
+    <p>
+      <button type="button" data-logout (click)="logout()">
+        {{ 'portal.common.action.logout' | stynxTranslate }}
+      </button>
+    </p>
+  `,
+})
+export class ContaPageComponent {
+  readonly session = inject(SessionFacade);
+  /** Opcional: fora de `provideDetranAuthenticatedApp` (harness de rotas) não há sessão STYNX. */
+  private readonly stynx = inject(StynxSessionService, { optional: true });
+
+  readonly privacyRoute = PRIVACY_ROUTE;
+  readonly preferencesRoute = PREFERENCES_ROUTE;
+  readonly sneRoute = SNE_ROUTE;
+  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  /** `SessionFacade.loadError()` (classificado) → apresentação do banner. */
+  readonly loadError = computed<ErrorPresentation | null>(() => {
+    const classified = this.session.loadError();
+    if (!classified) return null;
+    return presentError({
+      status: classified.status,
+      error: classified.code
+        ? {
+            code: classified.code,
+            status: classified.status,
+            message: classified.code,
+            context: classified.context,
+          }
+        : undefined,
+    });
+  });
+
+  assuranceKey(level: string): string {
+    return `${ASSURANCE_KEY_PREFIX}${level}`;
+  }
+
+  /** Encerramento da sessão STYNX ([DIVERGE-29]: `StynxSessionService.logout()`). */
+  logout(): void {
+    void this.stynx?.logout();
+  }
+
+  reload(): void {
+    void this.session.load();
+  }
+}
diff --git a/apps/portal/web/src/app/core/pages/home.page.ts b/apps/portal/web/src/app/core/pages/home.page.ts
index ab329c37..5c85c41e 100644
--- a/apps/portal/web/src/app/core/pages/home.page.ts
+++ b/apps/portal/web/src/app/core/pages/home.page.ts
@@ -1,20 +1,65 @@
 // Home pública `/` (portal-frontends.md §4: "home pública → catálogo + entrada gov.br"; §3
-// anônimo). Nesta entrega: entrada gov.br (retomando `?retomar=<rota>` do `portalAuthGuard`)
-// e atalho para a Carta de Serviços; o catálogo (`GET /v1/portal/services`) chega com o módulo
-// `catalogo` (CTG-0003).
-import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
+// anônimo; contrato CTG-0003c §3.10/§6; [RN-PORTAL-113] 3; OD-P50): entrada gov.br (retomando
+// `?retomar=<rota>` do `portalAuthGuard`), o símbolo/link de acessibilidade em destaque e o
+// catálogo real (`GET /v1/portal/services` pelo cache do par 1) em lista semântica — nome do
+// serviço pela chave `portal.services.<serviceKey>` (ausente → só `data-service-key`),
+// disponibilidade como `data-availability` + rótulo, nota do canal alternativo quando indisponível,
+// link à rota funcional DIRETA do manifesto (entrada com o `serviceKey` e sem parâmetro) só para
+// `available`/`partially_available`; indisponível ou ato sobre um recurso (`:aitId`…) → o detalhe
+// na Carta de Serviços (C-3c-69). A falha do catálogo mostra `portal.states.error` + tentar de novo
+// sem esconder a entrada gov.br.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  inject,
+  signal,
+} from '@angular/core';
 import { toSignal } from '@angular/core/rxjs-interop';
 import { ActivatedRoute, RouterLink } from '@angular/router';
-import { StynxTranslatePipe } from '@detran/ui';
+import {
+  DetranLoadingStateComponent,
+  StynxI18nService,
+  StynxTranslatePipe,
+} from '@detran/ui';
 import { map } from 'rxjs';
+import { PORTAL_ROUTE_MANIFEST } from '../../app.route-manifest';
+import type { ServiceCatalogItem } from '../../data/portal.client';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
 import { AuthFlowService } from '../auth-flow.service';
+import { PortalErrorBannerComponent } from '../error-banner.component';
+import {
+  GENERIC_ERROR_KEY,
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+} from '../error-boundary';
 import { RESUME_QUERY_PARAM } from '../guards/auth.guard';
+import { PortalServiceCatalogFacade } from '../service-catalog.facade';
+
+const ACCESSIBILITY_ROUTE = '/acessibilidade';
+const CHARTER_ROUTE = '/carta-servicos';
+const SERVICES_KEY_PREFIX = `portal.services.`;
+const AVAILABILITY_KEY_PREFIX = `portal.situation.availability.`;
+
+/** Rota funcional DIRETA (sem parâmetro) do serviço no manifesto; atos sobre um recurso → `null`. */
+function directRouteFor(serviceKey: string): string | null {
+  const entry = PORTAL_ROUTE_MANIFEST.find(
+    (candidate) =>
+      candidate.serviceKey === serviceKey && !candidate.path.includes(':'),
+  );
+  return entry ? `/${entry.path}` : null;
+}

 @Component({
   selector: 'portal-home-page',
-  imports: [RouterLink, StynxTranslatePipe],
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+  ],
   changeDetection: ChangeDetectionStrategy.OnPush,
-  host: { 'data-screen': '' },
+  host: { 'data-screen': '', '[attr.data-status]': 'status()' },
   template: `
     <h1>{{ 'portal.shell.title.home' | stynxTranslate }}</h1>
     <p>
@@ -23,15 +68,101 @@ import { RESUME_QUERY_PARAM } from '../guards/auth.guard';
       </button>
     </p>
     <p>
-      <a routerLink="/carta-servicos">{{
+      <a
+        [routerLink]="accessibilityRoute"
+        [attr.routerLink]="accessibilityRoute"
+        [attr.aria-label]="
+          'portal.shell.footer.acessibilidade' | stynxTranslate
+        "
+        data-accessibility
+      >
+        <span aria-hidden="true">♿</span>
+        {{ 'portal.shell.footer.acessibilidade' | stynxTranslate }}
+      </a>
+    </p>
+    <p>
+      <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
         'portal.common.link.carta' | stynxTranslate
       }}</a>
     </p>
+
+    <section aria-labelledby="portal-home-catalog-title">
+      <h2 id="portal-home-catalog-title">
+        {{ 'portal.screens.t25.title' | stynxTranslate }}
+      </h2>
+      <div
+        role="status"
+        class="portal-status-region"
+        [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+      >
+        @if (status() === 'loading') {
+          <detran-loading-state
+            [label]="'portal.states.loading' | stynxTranslate"
+          />
+        }
+      </div>
+      <div role="alert" class="portal-alert-region">
+        @if (stateTextKey(); as key) {
+          <p data-state-text>{{ key | stynxTranslate }}</p>
+        }
+        @if (error(); as error) {
+          <portal-error-banner [error]="error" (retry)="loadCatalog()" />
+        }
+      </div>
+      @if (items().length > 0) {
+        <ol data-catalog class="portal-catalog">
+          @for (item of items(); track item.serviceKey) {
+            <li
+              [attr.data-service-key]="item.serviceKey"
+              [attr.data-availability]="item.availability ?? null"
+              [attr.data-token]="item.unavailableReason ?? null"
+            >
+              <a
+                [routerLink]="routeFor(item)"
+                [attr.routerLink]="routeFor(item)"
+                [attr.data-functional]="isFunctional(item) ? 'true' : 'false'"
+              >
+                @if (serviceLabelKey(item); as key) {
+                  {{ key | stynxTranslate }}
+                } @else {
+                  {{ 'portal.screens.t25.title' | stynxTranslate }}
+                }
+              </a>
+              @if (item.availability; as availability) {
+                <span data-availability-label>{{
+                  availabilityKey(availability) | stynxTranslate
+                }}</span>
+              }
+              @if (
+                item.availability === 'unavailable' &&
+                  item.alternativeChannelNote;
+                as note
+              ) {
+                <p data-note>{{ note }}</p>
+              }
+            </li>
+          }
+        </ol>
+      }
+    </section>
   `,
 })
 export class HomePageComponent {
   private readonly auth = inject(AuthFlowService);
   private readonly route = inject(ActivatedRoute);
+  private readonly catalog = inject(PortalServiceCatalogFacade);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly itemsState = signal<readonly ServiceCatalogItem[]>([]);
+  private sequence = 0;
+
+  readonly accessibilityRoute = ACCESSIBILITY_ROUTE;
+  readonly charterRoute = CHARTER_ROUTE;
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  /** Ordem do servidor (cache do par 1). */
+  readonly items = this.itemsState.asReadonly();

   readonly retomar = toSignal(
     this.route.queryParamMap.pipe(
@@ -40,7 +171,75 @@ export class HomePageComponent {
     { initialValue: null },
   );

+  constructor() {
+    void this.loadCatalog();
+  }
+
   login(): void {
     this.auth.login(this.retomar());
   }
+
+  /** `GET services` (cache); a falha nunca esconde a entrada gov.br (OD-P50). */
+  async loadCatalog(): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    const sequence = ++this.sequence;
+    try {
+      const items = Array.from((await this.catalog.items()).values());
+      if (sequence !== this.sequence) return;
+      this.itemsState.set(items);
+      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.sequence) return;
+      const presentation = presentError(error);
+      // Resposta sem status HTTP (0) = sem rede (contrato §2.6): apresentada como offline.
+      this.errorState.set(
+        presentation.status === 0 && presentation.code === null
+          ? { ...presentation, messageKey: OFFLINE_KEY }
+          : presentation,
+      );
+      this.statusState.set(readStatusFor(this.errorState() ?? presentation));
+    }
+  }
+
+  /** Falha do catálogo: `portal.states.error` (ou offline) + tentar de novo (OD-P50). */
+  stateTextKey(): string | null {
+    switch (this.statusState()) {
+      case 'offline':
+        return OFFLINE_KEY;
+      case 'error':
+      case 'unavailable':
+      case 'not_found':
+        return GENERIC_ERROR_KEY;
+      default:
+        return null;
+    }
+  }
+
+  /** `portal.services.<key>` quando existe no catálogo; ausente → só `data-service-key`. */
+  serviceLabelKey(item: ServiceCatalogItem): string | null {
+    const key = item.serviceKey
+      ? `${SERVICES_KEY_PREFIX}${item.serviceKey}`
+      : null;
+    return key && key in this.i18n.catalog() ? key : null;
+  }
+
+  availabilityKey(availability: string): string {
+    return `${AVAILABILITY_KEY_PREFIX}${availability}`;
+  }
+
+  /** Rota funcional direta para `available`/`partially_available`; senão → Carta de Serviços. */
+  isFunctional(item: ServiceCatalogItem): boolean {
+    return (
+      item.availability !== 'unavailable' &&
+      !!item.serviceKey &&
+      directRouteFor(item.serviceKey) !== null
+    );
+  }
+
+  routeFor(item: ServiceCatalogItem): string {
+    const serviceKey = item.serviceKey ?? '';
+    if (this.isFunctional(item)) return directRouteFor(serviceKey) ?? '';
+    return `${CHARTER_ROUTE}/${serviceKey}`;
+  }
 }
diff --git a/apps/portal/web/src/app/core/pages/inicio.facade.ts b/apps/portal/web/src/app/core/pages/inicio.facade.ts
new file mode 100644
index 00000000..f0ca966f
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/inicio.facade.ts
@@ -0,0 +1,249 @@
+// InicioFacade (contrato CTG-0003c §3.10; spec §4 "/inicio: resolver me, notificações não lidas,
+// autos com ação"; [UC-PORTAL-019] 3a; OD-P99): três leituras em paralelo — `GET inbox?read=false`,
+// `GET aits` e `GET requests` — cada uma com o seu estado (a falha de uma não derruba as outras)
+// e o ponto de retomada do `ResumeService` ("Falta 1 passo"). A união de pendências usa SÓ os
+// critérios que os contratos expõem (`actions[].available`, `nextAction.by === 'citizen'`,
+// `kind === 'acao_necessaria'`/`readOn === null`, `ResumePoint`) e é ordenada SÓ pelo `dueOn`
+// recebido (texto ISO; sem prazo por último) — nenhum "N dias", nenhum limite inventado.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  AitSummary,
+  InboxItem,
+  RequestSummary,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+} from '../error-boundary';
+import { ResumeService, type ResumePoint } from '../resume.service';
+import { SessionFacade } from '../session.facade';
+
+export interface PendingAction {
+  readonly kind: 'ait' | 'request' | 'inbox' | 'resume';
+  readonly id: string;
+  /** `/autos/<aitId>` | `/processos/<requestId>` | `/notificacoes` | `ResumePoint.route`. */
+  readonly route: string;
+  /** `portal.requests.nextAction.<STATE>` | `portal.notifications.kind.acao_necessaria` | `portal.shell.inicio.resume`. */
+  readonly labelKey: string;
+  /** `deadlines[].dueOn` | `nextAction.dueOn` | `deadline.dueOn` — do servidor. */
+  readonly dueOn: string | null;
+  readonly ownedBy: 'citizen' | 'agency' | null;
+}
+
+const AIT_ROUTE_PREFIX = '/autos/';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const INBOX_ROUTE = '/notificacoes';
+const UNREAD_LABEL_KEY = 'portal.notifications.kind.acao_necessaria';
+const RESUME_LABEL_KEY = 'portal.shell.inicio.resume';
+const RESUME_ID = 'resume';
+const NEXT_ACTION_KEY_PREFIX = `portal.requests.nextAction.`;
+
+/** Resposta sem status HTTP (0) = sem rede (contrato §2.6/§7.1; sem `navigator` fora do `ErrorBoundary`). */
+function presentRead(error: unknown): ErrorPresentation {
+  const presentation = presentError(error);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+function compareText(a: string, b: string): number {
+  return a < b ? -1 : a > b ? 1 : 0;
+}
+
+/** `dueOn` crescente como texto; sem prazo por último (como `ProcessosFacade.byUrgency`). */
+function byDueOn(a: PendingAction, b: PendingAction): number {
+  if (a.dueOn !== null && b.dueOn !== null)
+    return compareText(a.dueOn, b.dueOn);
+  if (a.dueOn !== null) return -1;
+  if (b.dueOn !== null) return 1;
+  return 0;
+}
+
+/** `portal.requests.nextAction.<STATE>` quando o servidor envia essa chave; senão a do estado. */
+function nextActionLabelKey(request: RequestSummary): string {
+  const label = request.nextAction?.label;
+  if (typeof label === 'string' && label.startsWith(NEXT_ACTION_KEY_PREFIX)) {
+    return label;
+  }
+  return `${NEXT_ACTION_KEY_PREFIX}${request.situation}`;
+}
+
+@Injectable()
+export class InicioFacade {
+  private readonly client = inject(PortalClient);
+  private readonly session = inject(SessionFacade);
+  private readonly resumeService = inject(ResumeService);
+
+  private readonly aitsStatusState = signal<ReadStatus>('idle');
+  private readonly requestsStatusState = signal<ReadStatus>('idle');
+  private readonly inboxStatusState = signal<ReadStatus>('idle');
+  private readonly aitsErrorState = signal<ErrorPresentation | null>(null);
+  private readonly requestsErrorState = signal<ErrorPresentation | null>(null);
+  private readonly inboxErrorState = signal<ErrorPresentation | null>(null);
+  private readonly unreadState = signal<readonly InboxItem[]>([]);
+  private readonly aitsState = signal<readonly AitSummary[]>([]);
+  private readonly requestsState = signal<readonly RequestSummary[]>([]);
+  private readonly resumePointState = signal<ResumePoint | null>(null);
+  private sequence = 0;
+
+  readonly account = computed(() => this.session.account());
+  readonly aitsStatus = this.aitsStatusState.asReadonly();
+  readonly requestsStatus = this.requestsStatusState.asReadonly();
+  readonly inboxStatus = this.inboxStatusState.asReadonly();
+  /** Agregado: `loading` enquanto alguma leitura corre; `ready` quando as três terminaram. */
+  readonly status = computed<ReadStatus>(() => {
+    const statuses = [
+      this.aitsStatusState(),
+      this.requestsStatusState(),
+      this.inboxStatusState(),
+    ];
+    if (statuses.every((status) => status === 'idle')) return 'idle';
+    if (statuses.some((status) => status === 'loading')) return 'loading';
+    return 'ready';
+  });
+  /** Uma apresentação por falha distinta (código + chave): três fontes offline → um só aviso. */
+  readonly errors = computed<readonly ErrorPresentation[]>(() => {
+    const seen = new Set<string>();
+    return [
+      this.inboxErrorState(),
+      this.aitsErrorState(),
+      this.requestsErrorState(),
+    ].filter((error): error is ErrorPresentation => {
+      if (error === null) return false;
+      const key = `${error.code ?? ''}:${error.messageKey}`;
+      if (seen.has(key)) return false;
+      seen.add(key);
+      return true;
+    });
+  });
+  /** `GET inbox?read=false` (primeira página; pageSize do servidor). */
+  readonly unread = this.unreadState.asReadonly();
+  /** `GET aits`: itens com algum `actions[].available === true`. */
+  readonly aitsWithAction = computed<readonly AitSummary[]>(() =>
+    this.aitsState().filter((ait) =>
+      (ait.actions ?? []).some((action) => action.available === true),
+    ),
+  );
+  /** `GET requests`: `nextAction.by === 'citizen'`. */
+  readonly pendingRequests = computed<readonly RequestSummary[]>(() =>
+    this.requestsState().filter(
+      (request) => request.nextAction?.by === 'citizen',
+    ),
+  );
+  /** `ResumeService.peek()` — "Falta 1 passo" ([UC-PORTAL-019] 3a). */
+  readonly resumePoint = this.resumePointState.asReadonly();
+  /** União ordenada SÓ pelo `dueOn` recebido; sem prazo por último. */
+  readonly pending = computed<readonly PendingAction[]>(() => {
+    const actions: PendingAction[] = [
+      ...this.aitsWithAction().map((ait): PendingAction => {
+        const deadline = ait.deadlines?.[0] ?? null;
+        return {
+          kind: 'ait',
+          id: ait.aitId ?? '',
+          route: `${AIT_ROUTE_PREFIX}${ait.aitId ?? ''}`,
+          labelKey: UNREAD_LABEL_KEY,
+          dueOn: deadline?.dueOn ?? null,
+          ownedBy: deadline?.ownedBy ?? null,
+        };
+      }),
+      ...this.pendingRequests().map((request): PendingAction => ({
+        kind: 'request',
+        id: request.requestId ?? '',
+        route: `${PROCESS_ROUTE_PREFIX}${request.requestId ?? ''}`,
+        labelKey: nextActionLabelKey(request),
+        dueOn: request.nextAction?.dueOn ?? null,
+        ownedBy: 'citizen',
+      })),
+      ...this.unreadState().map((item): PendingAction => ({
+        kind: 'inbox',
+        id: item.id,
+        route: INBOX_ROUTE,
+        labelKey: UNREAD_LABEL_KEY,
+        dueOn: item.deadline?.dueOn ?? null,
+        ownedBy: item.deadline?.ownedBy ?? null,
+      })),
+    ];
+    const resume = this.resumePointState();
+    if (resume) {
+      actions.push({
+        kind: 'resume',
+        id: RESUME_ID,
+        route: resume.route,
+        labelKey: RESUME_LABEL_KEY,
+        dueOn: null,
+        ownedBy: 'citizen',
+      });
+    }
+    return actions.sort(byDueOn);
+  });
+
+  /** As três leituras em paralelo; resolve quando todas terminaram (cada uma com o seu estado). */
+  async load(): Promise<void> {
+    const sequence = ++this.sequence;
+    this.resumePointState.set(this.resumeService.peek());
+    this.inboxStatusState.set('loading');
+    this.aitsStatusState.set('loading');
+    this.requestsStatusState.set('loading');
+    this.inboxErrorState.set(null);
+    this.aitsErrorState.set(null);
+    this.requestsErrorState.set(null);
+    await Promise.all([
+      this.loadInbox(sequence),
+      this.loadAits(sequence),
+      this.loadRequests(sequence),
+    ]);
+  }
+
+  private async loadInbox(sequence: number): Promise<void> {
+    try {
+      const page = await this.client.listInbox({ read: 'false' });
+      if (sequence !== this.sequence) return;
+      this.unreadState.set(
+        ((page.items as readonly InboxItem[] | undefined) ?? []).filter(
+          (item) => item.readOn === null,
+        ),
+      );
+      this.inboxStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.sequence) return;
+      const presentation = presentRead(error);
+      this.inboxErrorState.set(presentation);
+      this.inboxStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async loadAits(sequence: number): Promise<void> {
+    try {
+      const page = await this.client.listAits();
+      if (sequence !== this.sequence) return;
+      this.aitsState.set(
+        (page.items as unknown as readonly AitSummary[] | undefined) ?? [],
+      );
+      this.aitsStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.sequence) return;
+      const presentation = presentRead(error);
+      this.aitsErrorState.set(presentation);
+      this.aitsStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async loadRequests(sequence: number): Promise<void> {
+    try {
+      const page = await this.client.listRequests();
+      if (sequence !== this.sequence) return;
+      this.requestsState.set(
+        (page.items as readonly RequestSummary[] | undefined) ?? [],
+      );
+      this.requestsStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.sequence) return;
+      const presentation = presentRead(error);
+      this.requestsErrorState.set(presentation);
+      this.requestsStatusState.set(readStatusFor(presentation));
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/core/pages/inicio.page.ts b/apps/portal/web/src/app/core/pages/inicio.page.ts
new file mode 100644
index 00000000..925a8765
--- /dev/null
+++ b/apps/portal/web/src/app/core/pages/inicio.page.ts
@@ -0,0 +1,216 @@
+// /inicio (contrato CTG-0003c §6; spec §4; [UC-PORTAL-019] 3a; OD-P99): a entrada do cidadão
+// autenticado — saudação, o lembrete "Falta 1 passo" (ponto de retomada do `ResumeService`), a
+// lista semântica de pendências (`InicioFacade.pending`, ordenada SÓ pelo `dueOn` recebido, com
+// `DeadlineCard` quando há prazo), os contadores (não lidas, autos com ação, pedidos com você)
+// com links às telas e os atalhos aos documentos. Cada leitura tem o seu banner de erro — a falha
+// de uma não esconde as outras. O tempo real (`RealtimeService`) é iniciado aqui e qualquer
+// evento do fio releitura tudo. Nenhum "N dias", nenhuma medida grave inventada.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { DeadlineCardComponent } from '../../shared/deadline-card.component';
+import { PortalErrorBannerComponent } from '../error-banner.component';
+import { RealtimeService } from '../realtime.service';
+import { InicioFacade, type PendingAction } from './inicio.facade';
+
+const INBOX_ROUTE = '/notificacoes';
+const AUTOS_ROUTE = '/autos';
+const PROCESSES_ROUTE = '/processos';
+const CNH_ROUTE = '/documentos/cnh-digital';
+const VEHICLES_ROUTE = '/veiculos';
+
+@Component({
+  selector: 'portal-inicio-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    DeadlineCardComponent,
+  ],
+  providers: [InicioFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      @if (facade.account()?.name; as name) {
+        {{ 'portal.shell.inicio.greeting' | stynxTranslate: { name } }}
+      } @else {
+        {{ 'portal.shell.title.inicio' | stynxTranslate }}
+      }
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+      @if (facade.resumePoint(); as resumePoint) {
+        <div data-resume [attr.data-resume-route]="resumePoint.route">
+          <stynx-banner
+            tone="info"
+            [message]="'portal.shell.inicio.resume' | stynxTranslate"
+          />
+          <a
+            [routerLink]="resumePoint.route"
+            [attr.routerLink]="resumePoint.route"
+            >{{ 'portal.common.action.continue' | stynxTranslate }}</a
+          >
+        </div>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @for (error of facade.errors(); track $index) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    <section aria-labelledby="portal-inicio-pending-title">
+      <h2 id="portal-inicio-pending-title">
+        {{ 'portal.shell.inicio.title_pending' | stynxTranslate }}
+      </h2>
+      @if (facade.status() === 'ready' && facade.pending().length === 0) {
+        <p data-empty-pending>
+          {{ 'portal.shell.inicio.empty_pending' | stynxTranslate }}
+        </p>
+      }
+      @if (facade.pending().length > 0) {
+        <ol data-pending class="portal-pending-list">
+          @for (action of facade.pending(); track trackAction(action)) {
+            <li
+              [attr.data-kind]="action.kind"
+              [attr.data-id]="action.id"
+              [attr.data-owned-by]="action.ownedBy"
+            >
+              <a [routerLink]="action.route" [attr.routerLink]="action.route">{{
+                action.labelKey | stynxTranslate
+              }}</a>
+              @if (action.dueOn; as dueOn) {
+                <portal-deadline-card
+                  [dueOn]="dueOn"
+                  [ownedBy]="action.ownedBy ?? 'citizen'"
+                  [labelKey]="action.labelKey"
+                />
+              }
+            </li>
+          }
+        </ol>
+      }
+    </section>
+
+    <section aria-labelledby="portal-inicio-counters-title">
+      <h2 id="portal-inicio-counters-title">
+        {{ 'portal.shell.nav.atualizacoes' | stynxTranslate }}
+      </h2>
+      <ul class="portal-counters" data-counters>
+        <li data-counter="unread" [attr.data-count]="facade.unread().length">
+          <a [routerLink]="inboxRoute" [attr.routerLink]="inboxRoute">
+            {{ 'portal.shell.inicio.unread' | stynxTranslate }}
+            <span data-count>{{ facade.unread().length }}</span>
+          </a>
+        </li>
+        <li
+          data-counter="aits"
+          [attr.data-count]="facade.aitsWithAction().length"
+        >
+          <a [routerLink]="autosRoute" [attr.routerLink]="autosRoute">
+            {{ 'portal.shell.inicio.aits_with_action' | stynxTranslate }}
+            <span data-count>{{ facade.aitsWithAction().length }}</span>
+          </a>
+        </li>
+        <li
+          data-counter="requests"
+          [attr.data-count]="facade.pendingRequests().length"
+        >
+          <a [routerLink]="processesRoute" [attr.routerLink]="processesRoute">
+            {{ 'portal.shell.inicio.requests_with_you' | stynxTranslate }}
+            <span data-count>{{ facade.pendingRequests().length }}</span>
+          </a>
+        </li>
+      </ul>
+    </section>
+
+    <section aria-labelledby="portal-inicio-documents-title">
+      <h2 id="portal-inicio-documents-title">
+        {{ 'portal.shell.nav.documentos' | stynxTranslate }}
+      </h2>
+      <ul class="portal-document-links">
+        <li>
+          <a [routerLink]="cnhRoute" [attr.routerLink]="cnhRoute">{{
+            'portal.documents.cnh.title' | stynxTranslate
+          }}</a>
+        </li>
+        <li>
+          <a [routerLink]="vehiclesRoute" [attr.routerLink]="vehiclesRoute">{{
+            'portal.documents.vehicles.title' | stynxTranslate
+          }}</a>
+        </li>
+      </ul>
+    </section>
+  `,
+})
+export class InicioPageComponent {
+  readonly facade = inject(InicioFacade);
+  private readonly realtime = inject(RealtimeService);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly inboxRoute = INBOX_ROUTE;
+  readonly autosRoute = AUTOS_ROUTE;
+  readonly processesRoute = PROCESSES_ROUTE;
+  readonly cnhRoute = CNH_ROUTE;
+  readonly vehiclesRoute = VEHICLES_ROUTE;
+
+  constructor() {
+    void this.facade.load();
+    // Qualquer evento do fio (caixa, pedido, decisão, pagamento) → releitura (§3.10).
+    const subscription = this.realtime.events.subscribe(() => {
+      void this.facade.load();
+    });
+    this.destroyRef.onDestroy(() => subscription.unsubscribe());
+    this.realtime.start();
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && status === 'ready') {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  trackAction(action: PendingAction): string {
+    return `${action.kind}:${action.id}`;
+  }
+
+  reload(): void {
+    void this.facade.load();
+  }
+}
diff --git a/apps/portal/web/src/app/core/push.service.ts b/apps/portal/web/src/app/core/push.service.ts
new file mode 100644
index 00000000..a42d6a8a
--- /dev/null
+++ b/apps/portal/web/src/app/core/push.service.ts
@@ -0,0 +1,140 @@
+// PushService (contrato CTG-0003c §4.2; spec §8; M14): `SwPush` de `@angular/service-worker`
+// (provido por `provideServiceWorker`, `src/main.ts`) + `POST /v1/portal/push-subscriptions`.
+// A assinatura só acontece por gesto explícito do cidadão (`subscribe()` chamado pelo botão de
+// opt-in da página de preferências) — nunca no bootstrap, em `effect`, no construtor nem ao abrir a
+// página. A chave pública VAPID (`applicationServerKey`) não tem origem fixada (não está entre as
+// três chaves de `runtime-config.js` — M4 — nem em `GET brand`): `PUSH_SERVER_PUBLIC_KEY` é um
+// `InjectionToken` com padrão `null` → push `unavailable` (OD-P88). `messages`/`notificationClicks`
+// não são consumidos neste par (o produtor de push é do servidor — OD-P40); `SwUpdate` não é tocado.
+import {
+  Injectable,
+  InjectionToken,
+  computed,
+  inject,
+  signal,
+} from '@angular/core';
+import { toSignal } from '@angular/core/rxjs-interop';
+import { SwPush } from '@angular/service-worker';
+import { of } from 'rxjs';
+import { PortalClient } from '../data/portal.client';
+import type {
+  PreferencesUpdateBody,
+  PushSubscriptionCreateBody,
+} from '../data/portal-read.models';
+import { presentError, type ErrorPresentation } from './error-boundary';
+
+/**
+ * Chave pública VAPID (`applicationServerKey`): origem `source_pending` (OD-P88). Padrão `null`
+ * → push indisponível. Nunca uma constante no código.
+ */
+export const PUSH_SERVER_PUBLIC_KEY = new InjectionToken<string | null>(
+  'PUSH_SERVER_PUBLIC_KEY',
+  { providedIn: 'root', factory: () => null },
+);
+
+export type PushStatus =
+  | 'unsupported' // !SwPush.isEnabled (browser sem SW, dev mode ou sem provider)
+  | 'unavailable' // sem PUSH_SERVER_PUBLIC_KEY (OD-P88)
+  | 'idle' // pode assinar; aguarda opt-in explícito
+  | 'subscribing'
+  | 'subscribed' // assinatura no SW e POST 201 feito nesta sessão (ou assinatura já existente no SW)
+  | 'denied' // requestSubscription rejeitou (permissão negada)
+  | 'error'; // POST push-subscriptions falhou (assinatura local desfeita: unsubscribe())
+
+type PushPhase = 'idle' | 'subscribing' | 'subscribed' | 'denied' | 'error';
+
+/** `PushSubscription.toJSON()` no formato do fio (`PushSubscriptionCreateDto`), ou `null` se incompleto. */
+function toWireSubscription(
+  subscription: PushSubscription,
+): PushSubscriptionCreateBody | null {
+  const json = subscription.toJSON();
+  const endpoint = json.endpoint;
+  const keys = json.keys;
+  const p256dh = keys?.['p256dh'];
+  const auth = keys?.['auth'];
+  if (
+    typeof endpoint !== 'string' ||
+    endpoint.length === 0 ||
+    typeof p256dh !== 'string' ||
+    typeof auth !== 'string'
+  ) {
+    return null;
+  }
+  return { endpoint, keys: { p256dh, auth } };
+}
+
+@Injectable({ providedIn: 'root' })
+export class PushService {
+  /** Opcional: fora de `provideServiceWorker` (harness de rotas) o push é `unsupported`. */
+  private readonly swPush = inject(SwPush, { optional: true });
+  private readonly client = inject(PortalClient);
+  private readonly serverPublicKey = inject(PUSH_SERVER_PUBLIC_KEY);
+  private readonly phase = signal<PushPhase>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+
+  /** `toSignal(SwPush.subscription)`. */
+  readonly subscription = toSignal(
+    this.swPush?.subscription ?? of<PushSubscription | null>(null),
+    { initialValue: null },
+  );
+  readonly error = this.errorState.asReadonly();
+  readonly status = computed<PushStatus>(() => {
+    if (!this.swPush?.isEnabled) return 'unsupported';
+    if (this.serverPublicKey === null) return 'unavailable';
+    const phase = this.phase();
+    if (phase === 'idle' && this.subscription() !== null) return 'subscribed';
+    return phase;
+  });
+
+  /**
+   * SÓ por gesto explícito do cidadão. `requestSubscription({ serverPublicKey })` →
+   * `PortalClient.createPushSubscription(toJSON())`; `toJSON()` incompleto → `error` sem requisição.
+   */
+  async subscribe(): Promise<void> {
+    const swPush = this.swPush;
+    const serverPublicKey = this.serverPublicKey;
+    if (!swPush?.isEnabled || serverPublicKey === null) return;
+    this.errorState.set(null);
+    this.phase.set('subscribing');
+    let subscription: PushSubscription;
+    try {
+      subscription = await swPush.requestSubscription({ serverPublicKey });
+    } catch {
+      this.phase.set('denied');
+      return;
+    }
+    const body = toWireSubscription(subscription);
+    if (body === null) {
+      this.phase.set('error');
+      return;
+    }
+    try {
+      await this.client.createPushSubscription(body);
+      this.phase.set('subscribed');
+    } catch (error: unknown) {
+      this.errorState.set(presentError(error));
+      this.phase.set('error');
+      await this.unsubscribeQuietly();
+    }
+  }
+
+  /** `SwPush.unsubscribe()`; não há DELETE no OpenAPI (`source_pending`). */
+  async unsubscribe(): Promise<void> {
+    await this.unsubscribeQuietly();
+    this.phase.set('idle');
+  }
+
+  /** Corpo da assinatura para `PUT preferences { channel: 'push', pushSubscription }` (OD-P87). */
+  preferencesPayload(): PreferencesUpdateBody['pushSubscription'] | null {
+    const subscription = this.subscription();
+    return subscription ? toWireSubscription(subscription) : null;
+  }
+
+  private async unsubscribeQuietly(): Promise<void> {
+    try {
+      await this.swPush?.unsubscribe();
+    } catch {
+      // Sem assinatura local para desfazer: nada a fazer.
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/core/realtime.service.ts b/apps/portal/web/src/app/core/realtime.service.ts
new file mode 100644
index 00000000..68ca2916
--- /dev/null
+++ b/apps/portal/web/src/app/core/realtime.service.ts
@@ -0,0 +1,422 @@
+// RealtimeService (contrato CTG-0003c §4.1; spec §8; contrato de rotas §9; M14): consome
+// `GET /v1/portal/stream` (text/event-stream) por um transporte injetável — `PortalStreamTransport`
+// — cuja implementação padrão usa o `HttpClient` de `provideStynxDefaults` (`observe: 'events'`,
+// `reportProgress`, `responseType: 'text'`, lendo `partialText`), porque o `EventSource` nativo
+// não envia o bearer da sessão STYNX ([DIVERGE-1]; OD-P96). Parser incremental do formato SSE
+// (`id:`/`event:`/`data:`; comentários `: heartbeat` mantêm `live` sem emitir; `retry:` ignorado).
+// Queda do transporte → `polling`: um `tick` a cada `POLLING_INTERVAL_MS` (os consumidores
+// releem o que assinam) e uma nova tentativa de abertura no mesmo compasso — sem backoff próprio
+// (OD-P96); `429 RATE_LIMITED { retryAfter }` adia a reabertura para `max(60 s, retryAfter)`;
+// `401`/`403` param o serviço (a sessão não vale). `Last-Event-ID` = último `id` recebido; uma
+// reabertura que completa sem nenhum frame modela o `204` (cursor fora da janela de 24 h) e a
+// próxima abertura vai sem cursor — o cliente nunca sintetiza eventos nem reconstrói o replay.
+// Nenhum campo do envelope vira texto de tela.
+import {
+  HttpClient,
+  HttpEventType,
+  type HttpDownloadProgressEvent,
+  type HttpEvent,
+} from '@angular/common/http';
+import {
+  DestroyRef,
+  Injectable,
+  Injector,
+  effect,
+  inject,
+  signal,
+} from '@angular/core';
+import { Observable, Subject, filter, type Subscription } from 'rxjs';
+import { PORTAL_API_PREFIX } from '../data/portal.client';
+import type { InboxKind } from '../data/portal-read.models';
+import type {
+  RequestNextAction,
+  RequestState,
+} from '../data/portal-read.models';
+import {
+  classifyError,
+  presentError,
+  type ErrorPresentation,
+} from './error-boundary';
+import { SessionFacade } from './session.facade';
+
+/** Contrato de rotas §9: `PORTAL_API_PREFIX + '/stream'`. */
+export const PORTAL_STREAM_URL = `${PORTAL_API_PREFIX}/stream`;
+
+/** `backend/app/src/portal-stream.service.ts` PORTAL_STREAM_TYPES; OpenAPI `portalStreamRead.topics`. */
+export const PORTAL_STREAM_TYPES = [
+  'inbox.item',
+  'request.changed',
+  'decision.published',
+  'payment.confirmed',
+] as const;
+
+export type PortalStreamType = (typeof PORTAL_STREAM_TYPES)[number];
+
+/** Spec §8 / contrato §9: "fallback de polling de 60 s". Único intervalo deste serviço. */
+export const POLLING_INTERVAL_MS = 60_000;
+
+/** O mesmo intervalo em segundos (spec §8 "60 s") — converte `retryAfter` (segundos) em ticks. */
+const POLLING_INTERVAL_SECONDS = 60;
+
+/** `data` por tipo (`portal-stream.service.ts` `reshape`): só ids, o token cidadão e o nextAction. */
+export interface PortalStreamData {
+  'inbox.item': { readonly id: string | null; readonly kind: InboxKind | null };
+  'request.changed': {
+    readonly requestId: string | null;
+    readonly situation: RequestState | null;
+    readonly nextAction: RequestNextAction | null;
+  };
+  'decision.published': { readonly requestId: string | null };
+  'payment.confirmed': { readonly aitId: string | null };
+}
+
+export interface PortalStreamEvent<
+  T extends PortalStreamType = PortalStreamType,
+> {
+  readonly type: T;
+  /** `id:` do frame = cursor `Last-Event-ID` (id do outbox). */
+  readonly id: string;
+  /** Envelope §1 `occurredAt`, quando presente. */
+  readonly occurredAt: string | null;
+  readonly data: PortalStreamData[T];
+}
+
+export interface StreamFrame {
+  readonly id: string | null;
+  readonly event: string | null;
+  /** JSON cru do envelope (`rait-events-sse-contract.md` §1); comentários nunca chegam aqui. */
+  readonly data: string;
+}
+
+export interface StreamOpenOptions {
+  readonly lastEventId: string | null;
+  readonly topics: readonly PortalStreamType[];
+}
+
+/**
+ * Transporte do SSE: abstração injetável (`providedIn: 'root'` com a implementação padrão pelo
+ * `HttpClient`), substituível por `useValue` nos testes. Completa quando o servidor fecha; erra
+ * com `HttpErrorResponse` (401/403/429/5xx/0).
+ */
+@Injectable({
+  providedIn: 'root',
+  useFactory: () => new HttpPortalStreamTransport(inject(Injector)),
+})
+export abstract class PortalStreamTransport {
+  abstract open(
+    url: string,
+    options: StreamOpenOptions,
+  ): Observable<StreamFrame>;
+}
+
+const LAST_EVENT_ID_HEADER = 'Last-Event-ID';
+const TOPICS_PARAM = 'topics';
+
+/** Parser incremental de `text/event-stream` (§4.1 a): blocos separados por linha vazia. */
+export class StreamFrameParser {
+  private buffer = '';
+  private pending = '';
+  private id: string | null = null;
+  private event: string | null = null;
+  private data: string[] = [];
+
+  /** Consome o texto acumulado até aqui (`partialText`) e devolve os frames completos novos. */
+  push(partialText: string): readonly StreamFrame[] {
+    const chunk = partialText.slice(this.buffer.length);
+    this.buffer = partialText;
+    const frames: StreamFrame[] = [];
+    let text = this.pending + chunk;
+    let newline = text.indexOf('\n');
+    while (newline >= 0) {
+      const line = text.slice(0, newline).replace(/\r$/, '');
+      text = text.slice(newline + 1);
+      const frame = this.line(line);
+      if (frame) frames.push(frame);
+      newline = text.indexOf('\n');
+    }
+    this.pending = text;
+    return frames;
+  }
+
+  private line(line: string): StreamFrame | null {
+    if (line === '') return this.flush();
+    // Comentário (`: connected`, `: heartbeat`): nunca vira frame.
+    if (line.startsWith(':')) return null;
+    const colon = line.indexOf(':');
+    const field = colon >= 0 ? line.slice(0, colon) : line;
+    let value = colon >= 0 ? line.slice(colon + 1) : '';
+    if (value.startsWith(' ')) value = value.slice(1);
+    switch (field) {
+      case 'id':
+        this.id = value;
+        return null;
+      case 'event':
+        this.event = value;
+        return null;
+      case 'data':
+        this.data.push(value);
+        return null;
+      default:
+        // `retry:` e campos desconhecidos: ignorados (a política de reconexão é a do contrato).
+        return null;
+    }
+  }
+
+  private flush(): StreamFrame | null {
+    if (this.id === null && this.event === null && this.data.length === 0) {
+      return null;
+    }
+    const frame: StreamFrame = {
+      id: this.id,
+      event: this.event,
+      data: this.data.join('\n'),
+    };
+    this.id = null;
+    this.event = null;
+    this.data = [];
+    return frame;
+  }
+}
+
+/** Implementação padrão: `HttpClient` STYNX com `observe: 'events'` + `partialText` ([DIVERGE-1]). */
+export class HttpPortalStreamTransport extends PortalStreamTransport {
+  private httpClient: HttpClient | null = null;
+
+  constructor(private readonly injector: Injector) {
+    super();
+  }
+
+  private get http(): HttpClient {
+    this.httpClient ??= this.injector.get(HttpClient);
+    return this.httpClient;
+  }
+
+  open(url: string, options: StreamOpenOptions): Observable<StreamFrame> {
+    return new Observable<StreamFrame>((subscriber) => {
+      const parser = new StreamFrameParser();
+      const headers: Record<string, string> = { Accept: 'text/event-stream' };
+      if (options.lastEventId !== null) {
+        headers[LAST_EVENT_ID_HEADER] = options.lastEventId;
+      }
+      const subscription = this.http
+        .get(url, {
+          headers,
+          params: { [TOPICS_PARAM]: options.topics.join(',') },
+          observe: 'events',
+          reportProgress: true,
+          responseType: 'text',
+        })
+        .subscribe({
+          next: (event: HttpEvent<string>) => {
+            if (event.type === HttpEventType.DownloadProgress) {
+              const partial =
+                (event as HttpDownloadProgressEvent).partialText ?? '';
+              for (const frame of parser.push(partial)) subscriber.next(frame);
+              return;
+            }
+            if (event.type === HttpEventType.Response) {
+              const body = event.body ?? '';
+              for (const frame of parser.push(`${body}\n\n`)) {
+                subscriber.next(frame);
+              }
+              subscriber.complete();
+            }
+          },
+          error: (error: unknown) => subscriber.error(error),
+          complete: () => subscriber.complete(),
+        });
+      return () => subscription.unsubscribe();
+    });
+  }
+}
+
+export type RealtimeStatus =
+  | 'idle' // nunca iniciado ou parado
+  | 'connecting'
+  | 'live' // frames chegando (ou heartbeat)
+  | 'polling' // SSE caiu; ticks a cada POLLING_INTERVAL_MS
+  | 'stopped'; // sessão inativa
+
+const RATE_LIMITED_CODE = 'PORTAL.RATE_LIMITED';
+const UNAUTHORIZED_STATUSES: ReadonlySet<number> = new Set([401, 403]);
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+function isStreamType(value: unknown): value is PortalStreamType {
+  return (PORTAL_STREAM_TYPES as readonly unknown[]).includes(value);
+}
+
+@Injectable({ providedIn: 'root' })
+export class RealtimeService {
+  private readonly transport = inject(PortalStreamTransport);
+  private readonly session = inject(SessionFacade);
+  private readonly destroyRef = inject(DestroyRef);
+
+  private readonly statusState = signal<RealtimeStatus>('idle');
+  private readonly lastEventIdState = signal<string | null>(null);
+  private readonly lastErrorState = signal<ErrorPresentation | null>(null);
+  private readonly eventsSubject = new Subject<PortalStreamEvent>();
+  private readonly tickSubject = new Subject<void>();
+  private subscribers = 0;
+  private connection: Subscription | null = null;
+  private pollingTimer: ReturnType<typeof setInterval> | null = null;
+  /** Ticks a esperar antes da próxima abertura (`max(60 s, retryAfter)` em compassos de 60 s). */
+  private ticksUntilReopen = 0;
+  /** Frames recebidos na conexão corrente (modela o `204` na reabertura, §4.1 d). */
+  private framesReceived = 0;
+
+  readonly status = this.statusState.asReadonly();
+  /** Cursor; só do servidor (nunca gerado no cliente). */
+  readonly lastEventId = this.lastEventIdState.asReadonly();
+  readonly lastError = this.lastErrorState.asReadonly();
+
+  /** Eventos do fio; contado por assinante (sem assinantes, a sessão não reabre nada — §4.1 g). */
+  readonly events: Observable<PortalStreamEvent> = new Observable(
+    (subscriber) => {
+      this.subscribers += 1;
+      const subscription = this.eventsSubject.subscribe(subscriber);
+      return () => {
+        this.subscribers -= 1;
+        subscription.unsubscribe();
+      };
+    },
+  );
+
+  /** Emite a cada POLLING_INTERVAL_MS enquanto `status === 'polling'`. */
+  readonly tick: Observable<void> = this.tickSubject.asObservable();
+
+  constructor() {
+    effect(() => {
+      const active = this.session.active();
+      if (!active) {
+        this.stop();
+      } else if (this.subscribers > 0) {
+        this.start();
+      }
+    });
+    this.destroyRef.onDestroy(() => this.stop());
+  }
+
+  on<T extends PortalStreamType>(type: T): Observable<PortalStreamEvent<T>> {
+    return this.events.pipe(
+      filter((event): event is PortalStreamEvent<T> => event.type === type),
+    );
+  }
+
+  /** Idempotente; só com `SessionFacade.active()`; `idle`/`stopped` → `connecting`. */
+  start(): void {
+    const status = this.statusState();
+    if (status !== 'idle' && status !== 'stopped') return;
+    if (!this.session.active()) return;
+    this.lastErrorState.set(null);
+    this.open();
+  }
+
+  /** Fecha o transporte, cancela ticks → `stopped`. */
+  stop(): void {
+    this.closeConnection();
+    this.clearPolling();
+    this.statusState.set('stopped');
+  }
+
+  private open(): void {
+    this.closeConnection();
+    this.framesReceived = 0;
+    this.statusState.set('connecting');
+    const lastEventId = this.lastEventIdState();
+    this.connection = this.transport
+      .open(PORTAL_STREAM_URL, {
+        lastEventId,
+        topics: PORTAL_STREAM_TYPES,
+      })
+      .subscribe({
+        next: (frame) => this.onFrame(frame),
+        error: (error: unknown) => this.onFailure(error),
+        complete: () => this.onComplete(lastEventId),
+      });
+  }
+
+  private onFrame(frame: StreamFrame): void {
+    this.framesReceived += 1;
+    this.statusState.set('live');
+    if (frame.id !== null && frame.id.length > 0) {
+      this.lastEventIdState.set(frame.id);
+    }
+    if (!isStreamType(frame.event)) return;
+    let envelope: unknown;
+    try {
+      envelope = JSON.parse(frame.data);
+    } catch {
+      return; // `data` que não seja JSON → descartado (nunca lança).
+    }
+    if (!isRecord(envelope)) return;
+    const data = isRecord(envelope['data']) ? envelope['data'] : {};
+    const occurredAt = envelope['occurredAt'];
+    this.eventsSubject.next({
+      type: frame.event,
+      id: frame.id ?? '',
+      occurredAt: typeof occurredAt === 'string' ? occurredAt : null,
+      data: data as PortalStreamData[typeof frame.event],
+    } as PortalStreamEvent);
+  }
+
+  /** Servidor fechou: reabertura sem frame algum = `204` (cursor rejeitado) → sem `Last-Event-ID`. */
+  private onComplete(openedWith: string | null): void {
+    this.connection = null;
+    if (openedWith !== null && this.framesReceived === 0) {
+      this.lastEventIdState.set(null);
+    }
+    this.enterPolling(1);
+  }
+
+  private onFailure(error: unknown): void {
+    this.connection = null;
+    const classified = classifyError(error);
+    if (UNAUTHORIZED_STATUSES.has(classified.status)) {
+      this.stop();
+      return;
+    }
+    const presentation = presentError(error);
+    this.lastErrorState.set(presentation);
+    const retryAfter = classified.retryAfter;
+    const waitTicks =
+      classified.code === RATE_LIMITED_CODE && typeof retryAfter === 'number'
+        ? Math.max(1, Math.ceil(retryAfter / POLLING_INTERVAL_SECONDS))
+        : 1;
+    this.enterPolling(waitTicks);
+  }
+
+  private enterPolling(waitTicks: number): void {
+    this.statusState.set('polling');
+    this.ticksUntilReopen = waitTicks;
+    if (this.pollingTimer !== null) return;
+    this.pollingTimer = setInterval(() => this.onTick(), POLLING_INTERVAL_MS);
+  }
+
+  private onTick(): void {
+    if (this.statusState() !== 'polling') {
+      this.clearPolling();
+      return;
+    }
+    this.tickSubject.next();
+    this.ticksUntilReopen -= 1;
+    if (this.ticksUntilReopen <= 0 && this.session.active()) {
+      this.clearPolling();
+      this.open();
+    }
+  }
+
+  private closeConnection(): void {
+    this.connection?.unsubscribe();
+    this.connection = null;
+  }
+
+  private clearPolling(): void {
+    if (this.pollingTimer !== null) {
+      clearInterval(this.pollingTimer);
+      this.pollingTimer = null;
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/data/portal-read.models.ts b/apps/portal/web/src/app/data/portal-read.models.ts
index 55e28b99..a6e0af4d 100644
--- a/apps/portal/web/src/app/data/portal-read.models.ts
+++ b/apps/portal/web/src/app/data/portal-read.models.ts
@@ -7,6 +7,9 @@
 // `source_pending` não têm forma fechada (OD-P72/OD-P74): a UI só os renderiza quando presentes e
 // nunca simula o que falta (M15).
 import type {
+  BpPortalCitizenService001Commands,
+  BpPortalIdentity001Commands,
+  BpPortalInbox001Commands,
   BpPortalProjections001Commands,
   BpPortalRequests001Commands,
 } from '@detran/api-clients';
@@ -292,3 +295,282 @@ export interface RequestDetail {
   readonly decision: Decision | null;
   readonly actions: RequestActions;
 }
+
+// —— par 3 (contrato CTG-0003c §2.1): caixa, SNE, push/preferências, documentos, veículos,
+// sinistros, exames e atendimento. Mesma regra do par 2: o que o OpenAPI fixa é derivado; o
+// que ele deixa livre (`{ [key]: unknown }`) é transcrito de `portal-route-contract.md` §6/§7/§8
+// como forma proposta, marcada `source_pending` (OD-P91), sem validação em tempo de execução —
+// a UI só renderiza o campo quando presente e nunca simula o que falta (M15).
+
+type InboxOps = BpPortalInbox001Commands.operations;
+type InboxSchemas = BpPortalInbox001Commands.components['schemas'];
+type CitizenOps = BpPortalCitizenService001Commands.operations;
+type CitizenSchemas = BpPortalCitizenService001Commands.components['schemas'];
+type IdentitySchemas = BpPortalIdentity001Commands.components['schemas'];
+
+// —— caixa do cidadão (contrato §6; BP-PORTAL-INBOX-001) ——
+
+/** `{ kind?: 'acao_necessaria' | 'informativo'; read?: 'true' | 'false'; page?; pageSize? }`. */
+export type InboxListQuery = NonNullable<
+  InboxOps['portalInboxList']['parameters']['query']
+>;
+
+/** `{ items: InboxItemRaw[]; total; page; pageSize }` — itens com campos opcionais no gerado. */
+export type InboxListPage = ResponseJson<InboxOps['portalInboxList'], 200>;
+
+export type InboxKind = 'acao_necessaria' | 'informativo';
+export type InboxSource = 'sne' | 'portal';
+/** Token → `data-category` (rótulo: `portal.notifications.category.<token>`, OD-P89). */
+export type InboxCategory = 'SNE' | 'PROCESSO' | 'OUVIDORIA' | 'SISTEMA';
+
+export interface InboxDeadline {
+  /** ISO date do servidor. */
+  readonly dueOn: string;
+  readonly ownedBy: 'citizen' | 'agency';
+}
+
+export type InboxItem = Omit<
+  InboxListPage['items'][number],
+  'kind' | 'source' | 'category' | 'deadline'
+> & {
+  readonly id: string;
+  readonly kind: InboxKind;
+  readonly source: InboxSource;
+  readonly category: InboxCategory;
+  readonly deadline: InboxDeadline | null;
+  /** SÓ para `source: 'sne'`; data calculada pelo servidor — nunca derivada de `availableOn` ([DIVERGE-4]). */
+  readonly fictitiousAcknowledgementOn: string | null;
+};
+
+/** `{ id; readOn; acknowledgementEvidence: { acknowledgedAt?; displayedSha256? } | null }`. */
+export type InboxReadResult = ResponseJson<
+  InboxOps['portalInboxItemRead'],
+  200
+>;
+
+// —— SNE (contrato §5.1/§6) ——
+
+/** `{ email?; phone?; channel?: 'push'|'email'|'sne'; consent: { textVersion; effectsAck: WireSneEffect[] } }`. */
+export type SneEnrollmentCreateBody = InboxSchemas['SneEnrollmentCreateDto'];
+/** `{ reason? }`. */
+export type SneEnrollmentCancelBody = InboxSchemas['SneEnrollmentCancelDto'];
+/** Enum do fio (OpenAPI/schema; OD-P61): ciencia_ficta|canal_exclusivo|desconto_60|cancelamento. */
+export type WireSneEffect =
+  SneEnrollmentCreateBody['consent']['effectsAck'][number];
+export type SneChannel = NonNullable<SneEnrollmentCreateBody['channel']>;
+/** `{ enrolled: boolean; since: string | null; channel: SneChannel | null; cancelable: boolean }`. */
+export type SneEnrollment = ResponseJson<
+  InboxOps['portalSneEnrollmentGet'],
+  200
+>;
+export type SneEnrolled = ResponseJson<
+  InboxOps['portalSneEnrollmentCreate'],
+  201
+>;
+/** `{ enrolled: false; since: null; channel; cancelable: false; cancelledAt }`. */
+export type SneCancelled = ResponseJson<
+  InboxOps['portalSneEnrollmentDelete'],
+  200
+>;
+
+// —— push e preferências ——
+
+/** `{ endpoint; keys: { p256dh; auth } }`. */
+export type PushSubscriptionCreateBody =
+  InboxSchemas['PushSubscriptionCreateDto'];
+/** `{ id; endpoint; createdAt }`. */
+export type PushSubscriptionCreated = ResponseJson<
+  InboxOps['portalPushSubscriptionCreate'],
+  201
+>;
+/** `{ channel; pushSubscription? }`. */
+export type PreferencesUpdateBody = IdentitySchemas['PreferencesUpdateDto'];
+/** Forma PROPOSTA: `PUT preferences` não declara 2xx (OD-P87/OD-P59) — ambos os campos `source_pending`. */
+export interface PreferencesUpdated {
+  readonly channel: PreferencesUpdateBody['channel'];
+  readonly version: number | null;
+}
+
+// —— documentos e veículos (contrato §7; BP-PORTAL-PROJECTIONS-001) ——
+
+/** `{ license: { [key]: unknown }; qrVerification: null; documentBytes: null; category: 'C'; cachedAt }`. */
+export type CnhRead = ResponseJson<ProjectionsOps['portalDocumentCnhGet'], 200>;
+
+/** Forma PROPOSTA de `license` (contrato §7; OD-P35/OD-P91): todos os campos `source_pending`. */
+export interface CnhLicense {
+  readonly status: 'valida' | 'vencida' | 'suspensa' | 'cassada' | null;
+  readonly validUntil: string | null;
+  readonly categories: readonly string[];
+  readonly restrictions: readonly string[];
+}
+
+/** `{ items: { [key]: unknown }[]; cachedAt: string | null }` (OD-P36). */
+export type VehicleListPage = ResponseJson<
+  ProjectionsOps['portalVehicleList'],
+  200
+>;
+
+/** Forma PROPOSTA do item (contrato §7 `[{ vehicleId, plate, renavamMasked: never, model }]`; OD-P36/OD-P91). */
+export interface Vehicle {
+  readonly vehicleId: string;
+  readonly plate: string;
+  readonly model: string | null;
+}
+
+/** contrato §7; vocabulário de `status`/`reason` `source_pending` (tokens → `data-*`). */
+export interface ClearanceItem {
+  readonly kind: 'tributo' | 'encargo' | 'multa' | 'dpvat';
+  readonly amount: number | null;
+  readonly status: string;
+  readonly blocking: boolean;
+  readonly reason: string | null;
+}
+
+export interface ClearanceRestriction {
+  /** Token → `data-token`; vocabulário `source_pending`. */
+  readonly kind: string;
+  readonly blocking: boolean;
+}
+
+/** Catálogo §5 `CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING { aitIds[] }`; forma do item `source_pending`. */
+export interface ClearanceSuspended {
+  readonly aitId: string;
+}
+
+/** Gerado: `{ …, canIssue: boolean; cachedAt: string }`; itens transcritos do contrato §7 (OD-P21/OD-P91). */
+export type VehicleClearance = Omit<
+  ResponseJson<ProjectionsOps['portalVehicleClearanceGet'], 200>,
+  'items' | 'restrictions' | 'suspendedEnforceability'
+> & {
+  readonly items: readonly ClearanceItem[];
+  readonly restrictions: readonly ClearanceRestriction[];
+  readonly suspendedEnforceability: readonly ClearanceSuspended[];
+};
+
+/** Forma PROPOSTA (`POST crlv-e` sem 2xx no OpenAPI — [DIVERGE-9]/[DIVERGE-10]; OD-P91). */
+export interface CrlvIssued {
+  readonly documentBytes: string | null;
+  readonly qrVerification: string | null;
+  readonly issuedAt: string;
+  /** `source_pending` — necessário ao `OfflineDocumentStore.put` (M14). */
+  readonly validUntil: string | null;
+  /** Preenchido pelo cliente a partir do parâmetro da rota (§7.1; [DIVERGE-13]). */
+  readonly vehicleId: string;
+}
+
+// —— sinistros e exames (contrato §7; OD-P19) ——
+
+export type CrashListPage = ResponseJson<
+  ProjectionsOps['portalCrashList'],
+  200
+>;
+
+/** `summary` livre (OD-P19/OD-P91). */
+export type CrashSummary = Required<
+  Pick<
+    CrashListPage['items'][number],
+    'crashId' | 'stateLabel' | 'thirdPartyFieldsSuppressed'
+  >
+> & { readonly summary: Readonly<Record<string, unknown>> };
+
+/** `{ crashId; stateLabel (já traduzido pelo servidor); summary: { [key]: unknown }; thirdPartyFieldsSuppressed }`. */
+export type CrashDetail = ResponseJson<ProjectionsOps['portalCrashGet'], 200>;
+
+export type ExamListPage = ResponseJson<ProjectionsOps['portalExamList'], 200>;
+
+export type ExamSummary = Required<
+  Pick<ExamListPage['items'][number], 'examId' | 'legalLabel'>
+> & { readonly validUntil: string | null; readonly boardDueOn: string | null };
+
+/** `{ examId; legalLabel: string; validUntil: string | null; boardDueOn: string | null }`. */
+export type ExamDetail = ResponseJson<ProjectionsOps['portalExamGet'], 200>;
+
+// —— atendimento (contrato §8; BP-PORTAL-CITIZEN-SERVICE-001) ——
+
+/** `{ kind; text?; confidential?; attachmentIds?; anonymous? }`. */
+export type ManifestationCreateBody = CitizenSchemas['ManifestationCreateDto'];
+/** `{ subjectKind: 'request'|'manifestation'; subjectId; scores{…}; comment? }`. */
+export type EvaluationCreateBody = CitizenSchemas['EvaluationCreateDto'];
+/** `{ page?; pageSize? }`. */
+export type ManifestationListQuery = NonNullable<
+  CitizenOps['portalManifestationList']['parameters']['query']
+>;
+export type ManifestationListPage = ResponseJson<
+  CitizenOps['portalManifestationList'],
+  200
+>;
+
+/** [WF-PORTAL-004] §Estados (9); chaves `portal.situation.manifestation.<STATE>` (OD-P89). */
+export type ManifestationState =
+  | 'MANIFESTACAO_REGISTRADA'
+  | 'COMPROVANTE_EMITIDO'
+  | 'EM_ANALISE'
+  | 'INFORMACAO_SOLICITADA_AO_AGENTE'
+  | 'DECISAO_FINAL_ELABORADA'
+  | 'CIENCIA_AO_USUARIO'
+  | 'ENCERRADA'
+  | 'AVALIACAO_OFERECIDA'
+  | 'AVALIADA';
+
+/** 5 tipos (`ManifestationCreateDto.kind`). */
+export type ManifestationKind = ManifestationCreateBody['kind'];
+
+/** contrato §8 `extended?{ justification, on }`; fixture `manifestation_extension`. */
+export interface ManifestationExtension {
+  readonly justification: string;
+  readonly on: string;
+  /** Fixture `new_due_on`; `source_pending` no contrato. */
+  readonly newDueOn: string | null;
+}
+
+export interface ManifestationDeadlines {
+  /** ÚNICO relógio exibido ([RN-PORTAL-109] 4/5); `info_due_on` nunca chega. */
+  readonly agencyDueOn: string;
+  readonly extended: ManifestationExtension | null;
+}
+
+/** `@example` `{ text, decidedAt }`. */
+export interface ManifestationDecision {
+  readonly text: string | null;
+  readonly decidedAt: string | null;
+}
+
+/** Itens de `portalManifestationList` (gerado com campos opcionais; `@example` fixa os nomes). */
+export interface ManifestationSummary {
+  readonly manifestationId: string;
+  readonly state: ManifestationState;
+  readonly protocol: string;
+  readonly kind: ManifestationKind;
+  readonly receivedAt: string;
+  readonly deadlines: ManifestationDeadlines;
+  readonly decision: ManifestationDecision | null;
+  readonly evaluationOffered: boolean;
+  readonly evaluated: boolean;
+}
+
+/** OpenAPI: `{ [key]: unknown }` (OD-P91); `@example`: "item da lista + text/confidential". */
+export interface ManifestationDetail extends ManifestationSummary {
+  readonly text: string | null;
+  readonly confidential: boolean;
+}
+
+/** `{ manifestationId; protocol; receivedAt; state: 'COMPROVANTE_EMITIDO'; agencyDueOn; anonymous }`. */
+export type ManifestationCreated = ResponseJson<
+  CitizenOps['portalManifestationCreate'],
+  201
+>;
+/** `{ manifestationId; state: 'AVALIACAO_OFERECIDA'; acknowledgedAt; evaluationOffered: true; version }` (ETag "<version>"). */
+export type ManifestationAcknowledged = ResponseJson<
+  CitizenOps['portalManifestationAcknowledge'],
+  200
+>;
+/** `{ evaluationId; subjectKind; subjectId; state; submittedAt; publicNotice }`. */
+export type EvaluationCreated = ResponseJson<
+  CitizenOps['portalEvaluationCreate'],
+  201
+>;
+/** `{ serviceKey; legalDeadline; normativeReference; availability }` (fixture: "source_pending (OD-P26)"). */
+export type ServiceCharterDeadline = ResponseJson<
+  CitizenOps['portalServiceCharterDeadlineGet'],
+  200
+>;
diff --git a/apps/portal/web/src/app/data/portal.client.ts b/apps/portal/web/src/app/data/portal.client.ts
index 1e8cf467..f2335cd9 100644
--- a/apps/portal/web/src/app/data/portal.client.ts
+++ b/apps/portal/web/src/app/data/portal.client.ts
@@ -11,6 +11,9 @@
 // (números por `String()`), nenhuma envia `Idempotency-Key` nem `If-Match`; `getRequest` observa a
 // resposta para devolver o `ETag` (`If-Match` do `withdraw`, §2.2). Corpos tipados `{ [key]: unknown }`
 // no OpenAPI ([DIVERGE-1]) são entregues por asserção de tipo, sem transformação de dados.
+// Leituras e comandos do par 3 (contrato CTG-0003c §2): mesmas regras; `If-Match` só em
+// `PUT preferences` (valor do chamador — `null` omite e o servidor responde 428, OD-P87);
+// `cancelSne` sem corpo envia `{}`; `downloadCnhDocument` reutiliza `decodeBlobError`.
 import {
   HttpClient,
   HttpErrorResponse,
@@ -38,11 +41,44 @@ import type {
   AitListPage,
   AitListQuery,
   AitPoints,
+  CnhRead,
+  CrashDetail,
+  CrashListPage,
+  CrashSummary,
+  CrlvIssued,
   Decision,
+  EvaluationCreateBody,
+  EvaluationCreated,
+  ExamDetail,
+  ExamListPage,
+  ExamSummary,
+  InboxListPage,
+  InboxListQuery,
+  InboxReadResult,
+  ManifestationAcknowledged,
+  ManifestationCreateBody,
+  ManifestationCreated,
+  ManifestationDetail,
+  ManifestationListPage,
+  ManifestationListQuery,
+  ManifestationSummary,
   PointsSummary,
+  PreferencesUpdateBody,
+  PreferencesUpdated,
+  PushSubscriptionCreateBody,
+  PushSubscriptionCreated,
   RequestDetail,
   RequestListPage,
   RequestListQuery,
+  ServiceCharterDeadline,
+  SneCancelled,
+  SneEnrolled,
+  SneEnrollment,
+  SneEnrollmentCancelBody,
+  SneEnrollmentCreateBody,
+  Vehicle,
+  VehicleClearance,
+  VehicleListPage,
 } from './portal-read.models';

 type IdentityPaths = BpPortalIdentity001Commands.paths;
@@ -477,6 +513,254 @@ export class PortalClient {
     );
   }

+  // —— par 3 (contrato CTG-0003c §2.4) ——
+
+  /** GET /v1/portal/services/{serviceKey} — 404 NOT_FOUND{kind:'service'} = fora do catálogo. */
+  getService(serviceKey: string): Promise<ServiceCatalogItem> {
+    return this.get<ServiceCatalogItem>(
+      `/services/${encodeURIComponent(serviceKey)}`,
+    );
+  }
+
+  /** GET /v1/portal/inbox?kind&read&page&pageSize — `undefined` omitido; `read` como 'true'|'false'. */
+  listInbox(query: InboxListQuery = {}): Promise<InboxListPage> {
+    return firstValueFrom(
+      this.http.get<InboxListPage>(this.url('/inbox'), {
+        params: queryParams(query),
+      }),
+    );
+  }
+
+  /** POST /v1/portal/inbox/{id}/read — `inbox_read:<id>:<fp({})>`; registra ciência (SNE). */
+  async markInboxRead(
+    inboxItemId: string,
+  ): Promise<CommandResult<InboxReadResult>> {
+    const body = {};
+    const key = await idempotencyKey('inbox_read', inboxItemId, body);
+    return this.command<InboxReadResult>((headers) =>
+      this.http.post<InboxReadResult>(
+        this.url(`/inbox/${encodeURIComponent(inboxItemId)}/read`),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** GET /v1/portal/sne/enrollment — `enrolled=false` com nulos quando sem linha (nunca 404). */
+  getSneEnrollment(): Promise<SneEnrollment> {
+    return this.get<SneEnrollment>('/sne/enrollment');
+  }
+
+  /** POST /v1/portal/sne/enrollment — `adesao_sne:none:<fp>`; 403 ASSURANCE_INSUFFICIENT abaixo de 'avancada'. */
+  async enrollSne(
+    body: SneEnrollmentCreateBody,
+  ): Promise<CommandResult<SneEnrolled>> {
+    const key = await idempotencyKey('adesao_sne', NO_TARGET, body);
+    return this.command<SneEnrolled>((headers) =>
+      this.http.post<SneEnrolled>(this.url('/sne/enrollment'), body, {
+        headers,
+        observe: 'response',
+      }),
+    )(key, null);
+  }
+
+  /** DELETE /v1/portal/sne/enrollment — corpo opcional { reason? } (`{}` quando ausente); `cancelamento_sne:none:<fp>`. */
+  async cancelSne(
+    body: SneEnrollmentCancelBody = {},
+  ): Promise<CommandResult<SneCancelled>> {
+    const key = await idempotencyKey('cancelamento_sne', NO_TARGET, body);
+    return this.command<SneCancelled>((headers) =>
+      this.http.delete<SneCancelled>(this.url('/sne/enrollment'), {
+        headers,
+        body,
+        observe: 'response',
+      }),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/push-subscriptions — `push_subscription:none:<fp>`; 201 upsert por endpoint. */
+  async createPushSubscription(
+    body: PushSubscriptionCreateBody,
+  ): Promise<CommandResult<PushSubscriptionCreated>> {
+    const key = await idempotencyKey('push_subscription', NO_TARGET, body);
+    return this.command<PushSubscriptionCreated>((headers) =>
+      this.http.post<PushSubscriptionCreated>(
+        this.url('/push-subscriptions'),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** PUT /v1/portal/identity/preferences — If-Match (null omite → 428) + `update_preferences:none:<fp>`; 2xx source_pending. */
+  async updatePreferences(
+    body: PreferencesUpdateBody,
+    ifMatch: string | null,
+  ): Promise<CommandResult<PreferencesUpdated>> {
+    const key = await idempotencyKey('update_preferences', NO_TARGET, body);
+    return this.command<PreferencesUpdated>((headers) =>
+      this.http.put<PreferencesUpdated>(
+        this.url('/identity/preferences'),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, ifMatch);
+  }
+
+  /** GET /v1/portal/documents/cnh — consulta informativa (categoria C; RN-PORTAL-117). */
+  getCnh(): Promise<CnhRead> {
+    return this.get<CnhRead>('/documents/cnh');
+  }
+
+  /**
+   * GET /v1/portal/documents/cnh?documentBytes=true — `responseType: 'blob'`; erro JSON
+   * decodificado como `downloadReceipt`. Nesta rodada responde 422 SERVICE_UNAVAILABLE
+   * { unavailableReason: 'documento_assinado_pendente_r0014' } ([DIVERGE-9]).
+   */
+  async downloadCnhDocument(): Promise<Blob> {
+    try {
+      return await firstValueFrom(
+        this.http.get(this.url('/documents/cnh'), {
+          params: queryParams({ documentBytes: 'true' }),
+          responseType: 'blob',
+        }),
+      );
+    } catch (error: unknown) {
+      throw await decodeBlobError(error);
+    }
+  }
+
+  /** GET /v1/portal/vehicles — itens livres (OD-P36) entregues como Vehicle[] por asserção. */
+  listVehicles(): Promise<
+    VehicleListPage & { readonly items: readonly Vehicle[] }
+  > {
+    return this.get<VehicleListPage & { readonly items: readonly Vehicle[] }>(
+      '/vehicles',
+    );
+  }
+
+  /** GET /v1/portal/vehicles/{id}/clearance — 404 NOT_FOUND{kind:'vehicle'}; 503 sem cache (OD-P21). */
+  getVehicleClearance(vehicleId: string): Promise<VehicleClearance> {
+    return this.get<VehicleClearance>(
+      `/vehicles/${encodeURIComponent(vehicleId)}/clearance`,
+    );
+  }
+
+  /** POST /v1/portal/vehicles/{id}/crlv-e — `emissao_crlv:<vehicleId>:<fp({})>`; sem 2xx no OpenAPI ([DIVERGE-10]). */
+  async issueCrlv(vehicleId: string): Promise<CommandResult<CrlvIssued>> {
+    const body = {};
+    const key = await idempotencyKey('emissao_crlv', vehicleId, body);
+    return this.command<CrlvIssued>((headers) =>
+      this.http.post<CrlvIssued>(
+        this.url(`/vehicles/${encodeURIComponent(vehicleId)}/crlv-e`),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** GET /v1/portal/crashes — sem parâmetros de busca no OpenAPI ([DIVERGE-14]). */
+  listCrashes(): Promise<
+    CrashListPage & { readonly items: readonly CrashSummary[] }
+  > {
+    return this.get<
+      CrashListPage & { readonly items: readonly CrashSummary[] }
+    >('/crashes');
+  }
+
+  /** GET /v1/portal/crashes/{id} — 404 NOT_FOUND{kind:'crash'}. */
+  getCrash(crashId: string): Promise<CrashDetail> {
+    return this.get<CrashDetail>(`/crashes/${encodeURIComponent(crashId)}`);
+  }
+
+  /** GET /v1/portal/exams. */
+  listExams(): Promise<
+    ExamListPage & { readonly items: readonly ExamSummary[] }
+  > {
+    return this.get<ExamListPage & { readonly items: readonly ExamSummary[] }>(
+      '/exams',
+    );
+  }
+
+  /** GET /v1/portal/exams/{id} — 404 NOT_FOUND{kind:'exam'}. */
+  getExam(examId: string): Promise<ExamDetail> {
+    return this.get<ExamDetail>(`/exams/${encodeURIComponent(examId)}`);
+  }
+
+  /** GET /v1/portal/manifestations?page&pageSize — anônimas não são listáveis. */
+  listManifestations(
+    query: ManifestationListQuery = {},
+  ): Promise<
+    ManifestationListPage & { readonly items: readonly ManifestationSummary[] }
+  > {
+    return firstValueFrom(
+      this.http.get<
+        ManifestationListPage & {
+          readonly items: readonly ManifestationSummary[];
+        }
+      >(this.url('/manifestations'), { params: queryParams(query) }),
+    );
+  }
+
+  /** GET /v1/portal/manifestations/{id} — 404 NOT_FOUND{kind:'manifestation'}; corpo livre no OpenAPI (OD-P91). */
+  getManifestation(manifestationId: string): Promise<ManifestationDetail> {
+    return this.get<ManifestationDetail>(
+      `/manifestations/${encodeURIComponent(manifestationId)}`,
+    );
+  }
+
+  /** POST /v1/portal/manifestations — `manifestar:none:<fp>`; sem 401 no OpenAPI (anônimo admitido, H.51). */
+  async createManifestation(
+    body: ManifestationCreateBody,
+  ): Promise<CommandResult<ManifestationCreated>> {
+    const key = await idempotencyKey('manifestar', NO_TARGET, body);
+    return this.command<ManifestationCreated>((headers) =>
+      this.http.post<ManifestationCreated>(this.url('/manifestations'), body, {
+        headers,
+        observe: 'response',
+      }),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/manifestations/{id}/acknowledge — `acknowledge:<id>:<fp({})>`; ETag "<version>". */
+  async acknowledgeManifestation(
+    manifestationId: string,
+  ): Promise<CommandResult<ManifestationAcknowledged>> {
+    const body = {};
+    const key = await idempotencyKey('acknowledge', manifestationId, body);
+    return this.command<ManifestationAcknowledged>((headers) =>
+      this.http.post<ManifestationAcknowledged>(
+        this.url(
+          `/manifestations/${encodeURIComponent(manifestationId)}/acknowledge`,
+        ),
+        body,
+        { headers, observe: 'response' },
+      ),
+    )(key, null);
+  }
+
+  /** POST /v1/portal/evaluations — `avaliar:<subjectId>:<fp>` ([DIVERGE-18]: uma rota para request e manifestation). */
+  async createEvaluation(
+    body: EvaluationCreateBody,
+  ): Promise<CommandResult<EvaluationCreated>> {
+    const key = await idempotencyKey('avaliar', body.subjectId, body);
+    return this.command<EvaluationCreated>((headers) =>
+      this.http.post<EvaluationCreated>(this.url('/evaluations'), body, {
+        headers,
+        observe: 'response',
+      }),
+    )(key, null);
+  }
+
+  /** GET /v1/portal/service-charter/{serviceKey}/deadline — 404 NOT_FOUND{kind:'service'}. */
+  getServiceCharterDeadline(
+    serviceKey: string,
+  ): Promise<ServiceCharterDeadline> {
+    return this.get<ServiceCharterDeadline>(
+      `/service-charter/${encodeURIComponent(serviceKey)}/deadline`,
+    );
+  }
+
   private url(path: string): string {
     return `${PORTAL_API_PREFIX}${path}`;
   }
diff --git a/apps/portal/web/src/app/features/assinatura/assinatura.facade.ts b/apps/portal/web/src/app/features/assinatura/assinatura.facade.ts
new file mode 100644
index 00000000..18f950c5
--- /dev/null
+++ b/apps/portal/web/src/app/features/assinatura/assinatura.facade.ts
@@ -0,0 +1,175 @@
+// AssinaturaFacade (contrato CTG-0003c §3.8; T-27; [RN-PORTAL-101/102]; [UC-PORTAL-019]; M8):
+// resolve o contexto da elevação — a rota a retomar (`?retomar`, senão o `ResumeService`, senão
+// `/inicio`), o ato dessa rota no manifesto, o nível exigido (matriz `me.actRequirements` do
+// servidor; senão o `access` da rota; senão o teto `avancada`) e o nível atual — e conduz as
+// fases: `start` (`SessionFacade.requestElevation`, que grava o ponto de retomada ANTES do POST) e
+// `complete` (retorno do gov.br → `SessionFacade.completeElevation` → `load()`), sem consumir o
+// `ResumePoint`. A facade não toca em `window`: a navegação para o `redirectUrl` é da página.
+// Nunca "acesso negado"; `422 SERVICE_UNAVAILABLE` (elevacao_govbr_pendente_r0014) → `unavailable`.
+import { Injectable, inject, signal } from '@angular/core';
+import type { ParamMap } from '@angular/router';
+import {
+  PORTAL_ROUTE_MANIFEST,
+  type RouteManifestEntry,
+} from '../../app.route-manifest';
+import {
+  presentError,
+  type ErrorPresentation,
+} from '../../core/error-boundary';
+import { ResumeService } from '../../core/resume.service';
+import {
+  ASSURANCE_ORDER,
+  SessionFacade,
+  isAssuranceLevel,
+  type AssuranceLevel,
+  type ElevationMethod,
+} from '../../core/session.facade';
+import type { ElevationStarted } from '../../data/portal-command.models';
+
+export type ElevationPhase =
+  | 'idle' // aguardando escolha do caminho
+  | 'starting' // POST elevations em curso
+  | 'redirecting' // redirectUrl recebido; navegação externa em curso
+  | 'completing' // retorno do gov.br: POST …/complete em curso
+  | 'done' // nível elevado; retomada em curso
+  | 'unavailable' // 422 SERVICE_UNAVAILABLE{elevacao_govbr_pendente_r0014} (OD-P15)
+  | 'error'; // qualquer outro erro (inclui resumeToken inválido: 400 VALIDATION_FAILED)
+
+export interface ElevationContext {
+  /** `?retomar` ou `ResumeService.peek()?.route`; sem ambos → '/inicio'. */
+  readonly resumeRoute: string;
+  /** `serviceKey` da entrada do manifesto cujo `path` casa com `resumeRoute`, senão `null`. */
+  readonly actKey: string | null;
+  /** Nível exigido: matriz do servidor (`requirementFor(actKey).level`) → teto `avancada` (RN-101). */
+  readonly required: AssuranceLevel;
+  readonly current: AssuranceLevel | null;
+  readonly sufficient: boolean;
+}
+
+/** = `RESUME_QUERY_PARAM` de `core/guards/auth.guard.ts` (C-3c-113 veda importar `core/guards`). */
+const RESUME_QUERY_PARAM = 'retomar';
+/** = `DEFAULT_LANDING_ROUTE` de `core/auth-flow.service.ts`. */
+const DEFAULT_RESUME_ROUTE = '/inicio';
+/** Teto exigível ([RN-PORTAL-101]). */
+const ASSURANCE_CEILING: AssuranceLevel = 'avancada';
+const TARGET_LEVEL = 'avancada';
+const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
+
+/** Segmentos de `path` casam com a URL (`:param` casa qualquer segmento). */
+function matchesPath(entry: RouteManifestEntry, route: string): boolean {
+  const url = route.split('?')[0].replace(/^\//, '');
+  const routeSegments = url.length > 0 ? url.split('/') : [];
+  const pathSegments = entry.path.length > 0 ? entry.path.split('/') : [];
+  if (routeSegments.length !== pathSegments.length) return false;
+  return pathSegments.every(
+    (segment, index) =>
+      segment.startsWith(':') || segment === routeSegments[index],
+  );
+}
+
+function entryFor(route: string): RouteManifestEntry | null {
+  return (
+    PORTAL_ROUTE_MANIFEST.find((entry) => matchesPath(entry, route)) ?? null
+  );
+}
+
+@Injectable()
+export class AssinaturaFacade {
+  private readonly session = inject(SessionFacade);
+  private readonly resumeService = inject(ResumeService);
+
+  private readonly phaseState = signal<ElevationPhase>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly contextState = signal<ElevationContext | null>(null);
+  private readonly startedState = signal<ElevationStarted | null>(null);
+
+  readonly phase = this.phaseState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly context = this.contextState.asReadonly();
+  /** `{ redirectUrl, resumeToken, elevationId }` (OD-P59); o `resumeToken` nunca é exibido. */
+  readonly started = this.startedState.asReadonly();
+
+  resolveContext(queryParams: ParamMap): void {
+    const resumeRoute =
+      queryParams.get(RESUME_QUERY_PARAM) ??
+      this.resumeService.peek()?.route ??
+      DEFAULT_RESUME_ROUTE;
+    const entry = entryFor(resumeRoute);
+    const actKey = entry?.serviceKey ?? null;
+    const requirement =
+      actKey !== null ? this.session.requirementFor(actKey) : null;
+    // Matriz do servidor quando é um nível; senão o teto — a elevação só existe para `avancada`
+    // ([RN-PORTAL-101]; uma rota `simples` nunca é motivo de elevação, C-3c-56).
+    const required: AssuranceLevel = isAssuranceLevel(requirement?.level)
+      ? requirement.level
+      : ASSURANCE_CEILING;
+    const current = this.session.assuranceLevel();
+    this.contextState.set({
+      resumeRoute,
+      actKey,
+      required,
+      current,
+      sufficient:
+        current !== null &&
+        ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required],
+    });
+  }
+
+  /** `SessionFacade.requestElevation` (grava a retomada ANTES do POST); sucesso → `redirecting`. */
+  async start(method: ElevationMethod): Promise<ElevationStarted | null> {
+    const context = this.contextState();
+    const resumeRoute = context?.resumeRoute ?? DEFAULT_RESUME_ROUTE;
+    this.phaseState.set('starting');
+    this.errorState.set(null);
+    this.startedState.set(null);
+    try {
+      const started = await this.session.requestElevation({
+        targetLevel: TARGET_LEVEL,
+        method,
+        resumeRoute,
+        draft: this.resumeService.peek()?.draft ?? null,
+      });
+      this.startedState.set(started);
+      this.phaseState.set('redirecting');
+      return started;
+    } catch (error: unknown) {
+      this.fail(error, resumeRoute);
+      return null;
+    }
+  }
+
+  /** Retorno do gov.br (parâmetros `source_pending`, OD-P15) → `completeElevation` → `done`. */
+  async complete(elevationId: string, resumeToken: string): Promise<boolean> {
+    const resumeRoute =
+      this.contextState()?.resumeRoute ?? DEFAULT_RESUME_ROUTE;
+    this.phaseState.set('completing');
+    this.errorState.set(null);
+    try {
+      await this.session.completeElevation(elevationId, resumeToken);
+      // Matriz ato → nível relida do servidor antes da retomada (§6 T-27; M8).
+      await this.session.load();
+      this.phaseState.set('done');
+      return true;
+    } catch (error: unknown) {
+      this.fail(error, resumeRoute);
+      return false;
+    }
+  }
+
+  /** Rota de retomada após `done`: `ResumeService.peek()?.route ?? context.resumeRoute` (não consome). */
+  resumeTarget(): string {
+    return (
+      this.resumeService.peek()?.route ??
+      this.contextState()?.resumeRoute ??
+      DEFAULT_RESUME_ROUTE
+    );
+  }
+
+  private fail(error: unknown, resumeRoute: string): void {
+    const presentation = presentError(error, { resumeRoute });
+    this.errorState.set(presentation);
+    this.phaseState.set(
+      presentation.code === SERVICE_UNAVAILABLE_CODE ? 'unavailable' : 'error',
+    );
+  }
+}
diff --git a/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts b/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts
index 4fa60847..af466577 100644
--- a/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts
+++ b/apps/portal/web/src/app/features/assinatura/assinatura.routes.ts
@@ -1,7 +1,13 @@
-// Módulo `assinatura` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('assinatura', { '<path>': { component, title } })`.
+// Módulo `assinatura` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rota
+// derivada do manifesto — guardas e `data.screen` vêm da fábrica (`moduleRoutes`), a página e o
+// título são fixados aqui (T-27).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { ElevationPageComponent } from './pages/elevation.page';

-export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura');
+export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura', {
+  'assinatura/elevacao': {
+    component: ElevationPageComponent,
+    title: 'portal.screens.t27.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/assinatura/pages/elevation.page.ts b/apps/portal/web/src/app/features/assinatura/pages/elevation.page.ts
new file mode 100644
index 00000000..81df224c
--- /dev/null
+++ b/apps/portal/web/src/app/features/assinatura/pages/elevation.page.ts
@@ -0,0 +1,223 @@
+// T-27 Elevação de nível (contrato CTG-0003c §6; ficha IU-PORTAL-T27; [RN-PORTAL-101/102/105];
+// [UC-PORTAL-019]): explica qual nível falta e por quê (`AssuranceExplainer`, níveis como tokens
+// traduzidos — nunca a cor do selo como condição), oferece os caminhos de verificação e leva ao
+// gov.br (`window.location.assign(redirectUrl)` — a facade não toca em `window`). O ato retoma onde
+// parou: o lembrete de retomada mostra a rota (`data-resume-route`); com nível já suficiente a
+// página retoma de imediato. Retorno do gov.br: os nomes dos parâmetros são `source_pending`
+// (OD-P15) — a página só chama `complete()` quando ambos existirem. Toda falha vira banner com os
+// caminhos restantes (nunca beco sem saída); `422 SERVICE_UNAVAILABLE` (elevação pendente nesta
+// rodada, OD-P15) → indisponível com canal, nunca elevação simulada. `resumeToken` nunca em tela.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, Router } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { ElevationMethod } from '../../../core/session.facade';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import {
+  AssuranceExplainerComponent,
+  ELEVATION_METHODS,
+} from '../../../shared/assurance-explainer.component';
+import { AssinaturaFacade } from '../assinatura.facade';
+
+/** Parâmetros da URL de retorno do gov.br: nomes `source_pending` (OD-P15) — forma provisória. */
+const RETURN_ELEVATION_ID_PARAM = 'elevationId';
+const RETURN_RESUME_TOKEN_PARAM = 'resumeToken';
+/** Nível que nunca é exigido ([RN-PORTAL-101] c). */
+const NEVER_REQUIRED_LEVEL = 'qualificada';
+const METHOD_KEY_PREFIX = `portal.forms.elevacao.caminho.`;
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t27.state.carregando',
+  recoverable: 'portal.screens.t27.state.erro_recuperavel',
+  unavailable: 'portal.screens.t27.state.indisponivel',
+} as const;
+
+@Component({
+  selector: 'portal-elevation-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    AssuranceExplainerComponent,
+  ],
+  providers: [AssinaturaFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-27',
+    '[attr.data-phase]': 'facade.phase()',
+    '[attr.aria-busy]': 'busy() ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t27.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t27.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (busy()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.context(); as context) {
+        <div data-resume-hint [attr.data-resume-route]="context.resumeRoute">
+          <stynx-banner
+            tone="info"
+            [message]="'portal.screens.t27.resume_hint' | stynxTranslate"
+          />
+        </div>
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text [attr.data-reason]="unavailableReason()">
+          {{ key | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (qualifiedNeverRequired()) {
+        <stynx-banner
+          tone="error"
+          [message]="
+            'portal.errors.assurance_qualified_never_required' | stynxTranslate
+          "
+        />
+      }
+      @if (facade.error(); as error) {
+        <portal-error-banner [error]="error" />
+      }
+    </div>
+
+    @if (facade.context(); as context) {
+      @if (!context.sufficient && !qualifiedNeverRequired()) {
+        <portal-assurance-explainer
+          [required]="context.required"
+          [current]="context.current"
+          [actKey]="context.actKey ?? ''"
+          (methodSelected)="start($event)"
+        />
+        <div class="portal-elevation-methods" role="group">
+          @for (method of methods; track method) {
+            <button
+              type="button"
+              class="portal-primary"
+              [attr.data-method]="method"
+              [disabled]="busy()"
+              (click)="start(method)"
+            >
+              {{ 'portal.screens.t27.cmd.elevar' | stynxTranslate }}
+              — {{ methodKey(method) | stynxTranslate }}
+            </button>
+          }
+        </div>
+      }
+    }
+
+    <portal-alternative-channel-note />
+  `,
+})
+export class ElevationPageComponent {
+  readonly facade = inject(AssinaturaFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+  private completing = false;
+
+  readonly methods = ELEVATION_METHODS;
+  readonly stateKeys = STATE_KEYS;
+
+  readonly busy = computed(() => {
+    const phase = this.facade.phase();
+    return (
+      phase === 'starting' || phase === 'redirecting' || phase === 'completing'
+    );
+  });
+  readonly qualifiedNeverRequired = computed(
+    () => this.facade.context()?.required === NEVER_REQUIRED_LEVEL,
+  );
+  readonly unavailableReason = computed<string | null>(() => {
+    const reason = this.facade.error()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : null;
+  });
+
+  constructor() {
+    this.route.queryParamMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        this.facade.resolveContext(params);
+        const elevationId = params.get(RETURN_ELEVATION_ID_PARAM);
+        const resumeToken = params.get(RETURN_RESUME_TOKEN_PARAM);
+        if (elevationId && resumeToken && !this.completing) {
+          this.completing = true;
+          void this.complete(elevationId, resumeToken);
+          return;
+        }
+        // Nível já suficiente (link antigo): retoma de imediato, sem oferecer elevação.
+        if (this.facade.context()?.sufficient) {
+          void this.router.navigateByUrl(this.facade.resumeTarget());
+        }
+      });
+    afterRenderEffect(() => {
+      const context = this.facade.context();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && context) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  methodKey(method: ElevationMethod): string {
+    return `${METHOD_KEY_PREFIX}${method}`;
+  }
+
+  stateTextKey(): string | null {
+    switch (this.facade.phase()) {
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.recoverable;
+      default:
+        return null;
+    }
+  }
+
+  /** Caminho escolhido → `requestElevation` → navegação externa ao `redirectUrl`. */
+  async start(method: ElevationMethod): Promise<void> {
+    if (this.busy()) return;
+    const started = await this.facade.start(method);
+    if (started) window.location.assign(started.redirectUrl);
+  }
+
+  private async complete(
+    elevationId: string,
+    resumeToken: string,
+  ): Promise<void> {
+    const done = await this.facade.complete(elevationId, resumeToken);
+    this.completing = false;
+    if (done) await this.router.navigateByUrl(this.facade.resumeTarget());
+  }
+}
diff --git a/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts b/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts
new file mode 100644
index 00000000..c87d37ee
--- /dev/null
+++ b/apps/portal/web/src/app/features/atendimento/atendimento.facade.ts
@@ -0,0 +1,220 @@
+// AtendimentoFacade (contrato CTG-0003c §3.6; T-21/T-22/T-26; [RN-PORTAL-109/110]; [UC-PORTAL-016/017];
+// H.51; [DIVERGE-18/19/20]): registro da manifestação (`POST manifestations` — sem sessão o corpo
+// leva `anonymous: true`; `attachmentIds` sempre `[]`; recebimento irrecusável: a única falha de
+// forma é `MANIFESTATION_KIND_INVALID` → campo `kind`), acompanhamento (`GET manifestations/{id}`,
+// vínculo `manifestation`; o ÚNICO relógio exibido é `deadlines.agencyDueOn`), ciência (`POST
+// …/acknowledge`, `ETag` guardado) e avaliação (`POST evaluations` para pedido ou manifestação),
+// mais o pedido avaliado em T-26 (`GET requests/{id}`, par 2). Erros só pelo `ErrorBoundary`.
+import { Injectable, inject, signal } from '@angular/core';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+  type PresentErrorOptions,
+} from '../../core/error-boundary';
+import { SessionFacade } from '../../core/session.facade';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  EvaluationCreateBody,
+  EvaluationCreated,
+  ManifestationAcknowledged,
+  ManifestationCreateBody,
+  ManifestationCreated,
+  ManifestationDetail,
+  RequestDetail,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type { CommandStatus } from '../processos/processos.facade';
+
+export type { CommandStatus } from '../processos/processos.facade';
+
+const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
+/** A única falha de forma admitida ([RN-PORTAL-109] 1): `{ allowed[] }` → campo `kind` marcado. */
+const KIND_INVALID_CODE = 'PORTAL.MANIFESTATION_KIND_INVALID';
+const KIND_FIELD = 'kind';
+
+/**
+ * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
+ * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
+ * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
+ */
+function presentRead(
+  error: unknown,
+  options?: PresentErrorOptions,
+): ErrorPresentation {
+  const presentation = presentError(error, options);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+function commandStatusOf(presentation: ErrorPresentation): CommandStatus {
+  if (presentation.code === SERVICE_UNAVAILABLE_CODE) return 'unavailable';
+  const status = readStatusFor(presentation);
+  if (status === 'unavailable') return 'unavailable';
+  return status === 'offline' ? 'offline' : 'error';
+}
+
+@Injectable()
+export class AtendimentoFacade {
+  private readonly client = inject(PortalClient);
+  private readonly session = inject(SessionFacade);
+
+  // T-21
+  private readonly createStatusState = signal<CommandStatus>('idle');
+  private readonly createErrorState = signal<ErrorPresentation | null>(null);
+  private readonly createdState = signal<ManifestationCreated | null>(null);
+  // T-22
+  private readonly detailStatusState = signal<ReadStatus>('idle');
+  private readonly detailState = signal<ManifestationDetail | null>(null);
+  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
+  private readonly etagState = signal<string | null>(null);
+  private readonly ackStatusState = signal<CommandStatus>('idle');
+  private readonly ackErrorState = signal<ErrorPresentation | null>(null);
+  // T-26 (e convite inline em T-22)
+  private readonly evaluationStatusState = signal<CommandStatus>('idle');
+  private readonly evaluationErrorState = signal<ErrorPresentation | null>(
+    null,
+  );
+  private readonly evaluationState = signal<EvaluationCreated | null>(null);
+  private readonly requestStatusState = signal<ReadStatus>('idle');
+  private readonly requestState = signal<RequestDetail | null>(null);
+  private readonly requestErrorState = signal<ErrorPresentation | null>(null);
+  private detailSequence = 0;
+  private requestSequence = 0;
+
+  readonly createStatus = this.createStatusState.asReadonly();
+  readonly createError = this.createErrorState.asReadonly();
+  /** Comprovante imediato. */
+  readonly created = this.createdState.asReadonly();
+  readonly detailStatus = this.detailStatusState.asReadonly();
+  readonly detail = this.detailState.asReadonly();
+  readonly detailError = this.detailErrorState.asReadonly();
+  /** `ETag` do acknowledge (§2.3); só guardado. */
+  readonly etag = this.etagState.asReadonly();
+  readonly ackStatus = this.ackStatusState.asReadonly();
+  readonly ackError = this.ackErrorState.asReadonly();
+  readonly evaluationStatus = this.evaluationStatusState.asReadonly();
+  readonly evaluationError = this.evaluationErrorState.asReadonly();
+  readonly evaluation = this.evaluationState.asReadonly();
+  readonly requestStatus = this.requestStatusState.asReadonly();
+  /** `PortalClient.getRequest` (par 2) — o pedido avaliado em T-26. */
+  readonly request = this.requestState.asReadonly();
+  readonly requestError = this.requestErrorState.asReadonly();
+
+  /** POST manifestations; sem sessão `anonymous: true` (H.51); `attachmentIds` sempre `[]`. */
+  async create(
+    body: ManifestationCreateBody,
+  ): Promise<ManifestationCreated | null> {
+    this.createStatusState.set('submitting');
+    this.createErrorState.set(null);
+    const anonymous = this.session.active() ? body.anonymous === true : true;
+    try {
+      const result = await this.client.createManifestation({
+        ...body,
+        attachmentIds: [],
+        anonymous,
+      });
+      this.createdState.set(result.body);
+      this.createStatusState.set('done');
+      return result.body;
+    } catch (error: unknown) {
+      const presentation = presentRead(error);
+      this.createErrorState.set(
+        presentation.code === KIND_INVALID_CODE
+          ? { ...presentation, fields: [KIND_FIELD] }
+          : presentation,
+      );
+      this.createStatusState.set(commandStatusOf(presentation));
+      return null;
+    }
+  }
+
+  /** GET manifestations/{id}; entitlement { kind: 'manifestation', id }. */
+  async loadDetail(manifestationId: string): Promise<void> {
+    this.detailStatusState.set('loading');
+    this.detailErrorState.set(null);
+    const sequence = ++this.detailSequence;
+    try {
+      const detail = await this.client.getManifestation(manifestationId);
+      if (sequence !== this.detailSequence) return;
+      this.detailState.set(detail);
+      this.detailStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.detailSequence) return;
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'manifestation', id: manifestationId },
+      });
+      this.detailState.set(null);
+      this.detailErrorState.set(presentation);
+      this.detailStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /** POST …/acknowledge; 200 → `etag` guardado + `loadDetail()`; 409 → 'error' (reload) + releitura. */
+  async acknowledge(
+    manifestationId: string,
+  ): Promise<ManifestationAcknowledged | null> {
+    this.ackStatusState.set('submitting');
+    this.ackErrorState.set(null);
+    try {
+      const result =
+        await this.client.acknowledgeManifestation(manifestationId);
+      this.etagState.set(result.etag);
+      this.ackStatusState.set('done');
+      void this.loadDetail(manifestationId);
+      return result.body;
+    } catch (error: unknown) {
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'manifestation', id: manifestationId },
+      });
+      this.ackErrorState.set(presentation);
+      this.ackStatusState.set(commandStatusOf(presentation));
+      if (presentation.nextStep === 'reload')
+        void this.loadDetail(manifestationId);
+      return null;
+    }
+  }
+
+  /** POST evaluations ([DIVERGE-18]: pedido ou manifestação). */
+  async evaluate(
+    body: EvaluationCreateBody,
+  ): Promise<EvaluationCreated | null> {
+    this.evaluationStatusState.set('submitting');
+    this.evaluationErrorState.set(null);
+    try {
+      const result = await this.client.createEvaluation(body);
+      this.evaluationState.set(result.body);
+      this.evaluationStatusState.set('done');
+      return result.body;
+    } catch (error: unknown) {
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'request', id: body.subjectId },
+      });
+      this.evaluationErrorState.set(presentation);
+      this.evaluationStatusState.set(commandStatusOf(presentation));
+      return null;
+    }
+  }
+
+  /** GET requests/{id} (par 2) — contexto de T-26. */
+  async loadRequest(requestId: string): Promise<void> {
+    this.requestStatusState.set('loading');
+    this.requestErrorState.set(null);
+    const sequence = ++this.requestSequence;
+    try {
+      const result = await this.client.getRequest(requestId);
+      if (sequence !== this.requestSequence) return;
+      this.requestState.set(result.body);
+      this.requestStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.requestSequence) return;
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'request', id: requestId },
+      });
+      this.requestState.set(null);
+      this.requestErrorState.set(presentation);
+      this.requestStatusState.set(readStatusFor(presentation));
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts b/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts
index c191192b..40b83ee6 100644
--- a/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts
+++ b/apps/portal/web/src/app/features/atendimento/atendimento.routes.ts
@@ -1,7 +1,23 @@
-// Módulo `atendimento` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('atendimento', { '<path>': { component, title } })`.
+// Módulo `atendimento` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-21, T-22, T-26).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { EvaluationPageComponent } from './pages/evaluation.page';
+import { ManifestationDetailPageComponent } from './pages/manifestation-detail.page';
+import { ManifestationNewPageComponent } from './pages/manifestation-new.page';

-export const ATENDIMENTO_ROUTES: Routes = moduleRoutes('atendimento');
+export const ATENDIMENTO_ROUTES: Routes = moduleRoutes('atendimento', {
+  'ouvidoria/nova': {
+    component: ManifestationNewPageComponent,
+    title: 'portal.screens.t21.title',
+  },
+  'ouvidoria/:manifestationId': {
+    component: ManifestationDetailPageComponent,
+    title: 'portal.screens.t22.title',
+  },
+  'avaliacao/:requestId': {
+    component: EvaluationPageComponent,
+    title: 'portal.screens.t26.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/atendimento/pages/evaluation.page.ts b/apps/portal/web/src/app/features/atendimento/pages/evaluation.page.ts
new file mode 100644
index 00000000..d6f5d78a
--- /dev/null
+++ b/apps/portal/web/src/app/features/atendimento/pages/evaluation.page.ts
@@ -0,0 +1,201 @@
+// T-26 Avaliar o serviço (contrato CTG-0003c §6; ficha IU-PORTAL-T26; [RN-PORTAL-110];
+// [UC-PORTAL-017]; [DIVERGE-18]): o pedido avaliado (`GET requests/{id}`, par 2 — o servidor decide
+// a elegibilidade; a página só a espelha em texto) e o `EvaluationForm` com `subjectKind:
+// 'request'` e escala pendente (OD-P65). `POST evaluations` (nunca `requests/{id}/evaluation`);
+// 409 já avaliado → recuperável; 409 não oferecido → sem elegibilidade; sucesso → aviso de
+// publicação em `role="status"`. Avaliar nunca é condição para ver o resultado: link de volta ao
+// processo ("pular").
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, Router, RouterLink } from '@angular/router';
+import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { EvaluationCreateBody } from '../../../data/portal-read.models';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { EvaluationFormComponent } from '../../../shared/evaluation-form.component';
+import { AtendimentoFacade } from '../atendimento.facade';
+
+const REQUEST_PARAM = 'requestId';
+const SERVICE_KEY = 'avaliar';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const OUVIDORIA_ROUTE = '/ouvidoria/nova';
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+const ALREADY_SUBMITTED_CODE = 'PORTAL.EVALUATION_ALREADY_SUBMITTED';
+/** 409 que o servidor devolve quando a avaliação não está oferecida (§3.6). */
+const NOT_ELIGIBLE_CODES: ReadonlySet<string> = new Set([
+  'PORTAL.EVALUATION_NOT_OFFERED',
+  'PORTAL.REQUEST_STATE_INVALID',
+]);
+/** Estados do pedido em que a avaliação é esperada (texto só; o servidor decide). */
+const EVALUABLE_STATES: ReadonlySet<string> = new Set([
+  'RESULTADO_DISPONIVEL',
+  'AVALIACAO_OFERECIDA',
+  'CONCLUIDO',
+]);
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t26.state.carregando',
+  notEligible: 'portal.screens.t26.state.sem_elegibilidade',
+  recoverable: 'portal.screens.t26.state.erro_recuperavel',
+  notFound: 'portal.screens.t26.state.sem_permissao',
+  unavailable: 'portal.screens.t26.state.indisponivel',
+} as const;
+
+@Component({
+  selector: 'portal-evaluation-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    EvaluationFormComponent,
+  ],
+  providers: [AtendimentoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-26',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-status]': 'facade.requestStatus()',
+    '[attr.data-evaluation-status]': 'facade.evaluationStatus()',
+    '[attr.aria-busy]': 'facade.requestStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t26.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t26.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.requestStatus() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.requestError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.evaluationError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.request(); as request) {
+      <p data-request-state [attr.data-token]="request.request.state">
+        {{ requestStateKey(request.request.state) | stynxTranslate }}
+      </p>
+    }
+    <!-- Avaliar nunca é condição de nada ([RN-PORTAL-110]): o formulário não espera o pedido —
+         a elegibilidade é do servidor (409), o contexto do pedido é só informativo. -->
+    <portal-evaluation-form
+      subjectKind="request"
+      [subjectId]="requestId()"
+      [scale]="null"
+      [status]="facade.evaluationStatus()"
+      [fields]="facade.evaluationError()?.fields ?? []"
+      [result]="facade.evaluation()"
+      [skipRoute]="processRoute()"
+      (submitted)="evaluate($event)"
+      (manifestationRequested)="openManifestation()"
+    />
+
+    <p>
+      <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
+        'portal.screens.t07.title' | stynxTranslate
+      }}</a>
+    </p>
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class EvaluationPageComponent {
+  readonly facade = inject(AtendimentoFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly requestId = signal('');
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly processRoute = computed(
+    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}`,
+  );
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const requestId = params.get(REQUEST_PARAM) ?? '';
+        this.requestId.set(requestId);
+        this.focused = false;
+        void this.facade.loadRequest(requestId);
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.requestStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && status === 'ready') {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  requestStateKey(state: string): string {
+    return `portal.situation.request.${state}`;
+  }
+
+  stateTextKey(): string | null {
+    const evaluationCode = this.facade.evaluationError()?.code ?? null;
+    if (evaluationCode === ALREADY_SUBMITTED_CODE)
+      return STATE_KEYS.recoverable;
+    if (evaluationCode !== null && NOT_ELIGIBLE_CODES.has(evaluationCode)) {
+      return STATE_KEYS.notEligible;
+    }
+    const requestCode = this.facade.requestError()?.code ?? null;
+    if (requestCode === NOT_FOUND_CODE) return STATE_KEYS.notFound;
+    const requestStatus = this.facade.requestStatus();
+    if (requestStatus === 'error' || requestStatus === 'unavailable') {
+      return STATE_KEYS.unavailable;
+    }
+    const state = this.facade.request()?.request?.state;
+    if (state !== undefined && !EVALUABLE_STATES.has(state)) {
+      return STATE_KEYS.notEligible;
+    }
+    return null;
+  }
+
+  evaluate(body: EvaluationCreateBody): void {
+    void this.facade.evaluate(body);
+  }
+
+  openManifestation(): void {
+    void this.router.navigateByUrl(OUVIDORIA_ROUTE);
+  }
+
+  reload(): void {
+    void this.facade.loadRequest(this.requestId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/atendimento/pages/manifestation-detail.page.ts b/apps/portal/web/src/app/features/atendimento/pages/manifestation-detail.page.ts
new file mode 100644
index 00000000..7334c165
--- /dev/null
+++ b/apps/portal/web/src/app/features/atendimento/pages/manifestation-detail.page.ts
@@ -0,0 +1,278 @@
+// T-22 Acompanhar manifestação (contrato CTG-0003c §6; ficha IU-PORTAL-T22; [RN-PORTAL-109];
+// [UC-PORTAL-016/017]; [DIVERGE-18]): estado traduzido (`portal.situation.manifestation.<STATE>`,
+// token em `data-token`), protocolo, recebimento, tipo, o ÚNICO relógio visível — `agencyDueOn`
+// como `DeadlineCard` do órgão —, a prorrogação com justificativa (nunca silenciosa), a decisão
+// quando houver, o botão de ciência SÓ em `CIENCIA_AO_USUARIO` e, após a ciência/quando oferecida,
+// a avaliação inline (`EvaluationForm` com `subjectKind: 'manifestation'`). Nenhum relógio interno
+// (`info_due_on`) existe no tipo. 404 → vínculo; `EM_ANALISE`/informação solicitada → status, não
+// erro; 409 na ciência → banner + releitura. Foco ao topo após atualização.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, Router } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { EvaluationCreateBody } from '../../../data/portal-read.models';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { EvaluationFormComponent } from '../../../shared/evaluation-form.component';
+import { AtendimentoFacade } from '../atendimento.facade';
+
+const MANIFESTATION_PARAM = 'manifestationId';
+const OUVIDORIA_ROUTE = '/ouvidoria/nova';
+const STATE_KEY_PREFIX = `portal.situation.manifestation.`;
+const KIND_KEY_PREFIX = `portal.forms.manifestacao.tipo.`;
+const CIENCIA_STATE = 'CIENCIA_AO_USUARIO';
+/** Estados em que a manifestação está com a ouvidoria (status informativo, não erro). */
+const IN_ANALYSIS_STATES: ReadonlySet<string> = new Set([
+  'EM_ANALISE',
+  'INFORMACAO_SOLICITADA_AO_AGENTE',
+]);
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t22.state.carregando',
+  notFound: 'portal.screens.t22.state.sem_permissao',
+  inAnalysis: 'portal.screens.t22.state.erro_recuperavel',
+  unavailable: 'portal.screens.t22.state.indisponivel',
+} as const;
+
+@Component({
+  selector: 'portal-manifestation-detail-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    EvaluationFormComponent,
+  ],
+  providers: [AtendimentoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-22',
+    '[attr.data-manifestation-id]': 'manifestationId()',
+    '[attr.data-status]': 'facade.detailStatus()',
+    '[attr.data-token]': 'facade.detail()?.state ?? null',
+    '[attr.aria-busy]': 'busy() ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t22.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t22.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (busy()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (inAnalysis()) {
+        <p data-in-analysis>{{ stateKeys.inAnalysis | stynxTranslate }}</p>
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.detailError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.ackError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.evaluationError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.detail(); as detail) {
+      <section data-manifestation>
+        <p data-state [attr.data-token]="detail.state">
+          {{ stateKey(detail.state) | stynxTranslate }}
+        </p>
+        <dl>
+          <dt>{{ 'portal.common.receipt.number' | stynxTranslate }}</dt>
+          <dd data-protocol>{{ detail.protocol }}</dd>
+          <dt>{{ 'portal.forms.manifestacao.tipo' | stynxTranslate }}</dt>
+          <dd data-kind [attr.data-token]="detail.kind">
+            {{ kindKey(detail.kind) | stynxTranslate }}
+          </dd>
+          <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
+          <dd>
+            <time [attr.datetime]="detail.receivedAt">{{
+              'portal.screens.t22.field.recebida_em'
+                | stynxTranslate
+                  : {
+                      receivedAt:
+                        (detail.receivedAt | stynxIntlDate: dateTimeFormat),
+                    }
+            }}</time>
+          </dd>
+          @if (detail.text; as text) {
+            <dt>
+              {{ 'portal.forms.manifestacao.descricao' | stynxTranslate }}
+            </dt>
+            <dd data-text>{{ text }}</dd>
+          }
+        </dl>
+
+        <portal-deadline-card
+          [dueOn]="detail.deadlines.agencyDueOn"
+          ownedBy="agency"
+          labelKey="portal.screens.t22.field.prazo_orgao"
+        />
+        @if (detail.deadlines.extended; as extended) {
+          <p data-extended>
+            {{
+              'portal.screens.t22.field.prorrogacao'
+                | stynxTranslate
+                  : {
+                      on: (extended.on | stynxIntlDate),
+                      justification: extended.justification,
+                    }
+            }}
+          </p>
+        }
+
+        @if (detail.decision?.text; as decisionText) {
+          <section data-decision>
+            <h2>{{ 'portal.screens.t22.field.decisao' | stynxTranslate }}</h2>
+            <p>{{ decisionText }}</p>
+          </section>
+        }
+
+        @if (detail.state === cienciaState) {
+          <button
+            type="button"
+            class="portal-primary"
+            data-acknowledge
+            [disabled]="busy()"
+            (click)="acknowledge()"
+          >
+            {{ 'portal.screens.t22.cmd.confirmar_ciencia' | stynxTranslate }}
+          </button>
+        }
+
+        @if (detail.evaluationOffered && !detail.evaluated) {
+          <portal-evaluation-form
+            subjectKind="manifestation"
+            [subjectId]="detail.manifestationId"
+            [scale]="null"
+            [status]="facade.evaluationStatus()"
+            [fields]="facade.evaluationError()?.fields ?? []"
+            [result]="facade.evaluation()"
+            (submitted)="evaluate($event)"
+            (manifestationRequested)="openManifestation()"
+          />
+        }
+      </section>
+    }
+
+    <portal-alternative-channel-note />
+  `,
+})
+export class ManifestationDetailPageComponent {
+  readonly facade = inject(AtendimentoFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focusPending = true;
+
+  readonly manifestationId = signal('');
+  readonly stateKeys = STATE_KEYS;
+  readonly cienciaState = CIENCIA_STATE;
+  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  readonly busy = computed(
+    () =>
+      this.facade.detailStatus() === 'loading' ||
+      this.facade.ackStatus() === 'submitting',
+  );
+  /** `EM_ANALISE`/informação solicitada → status informativo ([RN-PORTAL-109]). */
+  readonly inAnalysis = computed(() => {
+    const state = this.facade.detail()?.state;
+    return state !== undefined && IN_ANALYSIS_STATES.has(state);
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const manifestationId = params.get(MANIFESTATION_PARAM) ?? '';
+        this.manifestationId.set(manifestationId);
+        this.focusPending = true;
+        void this.facade.loadDetail(manifestationId);
+      });
+    // Foco ao topo após cada atualização concluída (§7.3).
+    afterRenderEffect(() => {
+      const status = this.facade.detailStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (status === 'ready' && this.focusPending) {
+          this.focusPending = false;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  stateKey(state: string): string {
+    return `${STATE_KEY_PREFIX}${state}`;
+  }
+
+  kindKey(kind: string): string {
+    return `${KIND_KEY_PREFIX}${kind}`;
+  }
+
+  stateTextKey(): string | null {
+    const code = this.facade.detailError()?.code ?? null;
+    if (code === NOT_FOUND_CODE) return STATE_KEYS.notFound;
+    const status = this.facade.detailStatus();
+    if (status === 'unavailable' || status === 'error') {
+      return STATE_KEYS.unavailable;
+    }
+    return null;
+  }
+
+  acknowledge(): void {
+    this.focusPending = true;
+    void this.facade.acknowledge(this.manifestationId());
+  }
+
+  evaluate(body: EvaluationCreateBody): void {
+    void this.facade.evaluate(body);
+  }
+
+  openManifestation(): void {
+    void this.router.navigateByUrl(OUVIDORIA_ROUTE);
+  }
+
+  reload(): void {
+    this.focusPending = true;
+    void this.facade.loadDetail(this.manifestationId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/atendimento/pages/manifestation-new.page.ts b/apps/portal/web/src/app/features/atendimento/pages/manifestation-new.page.ts
new file mode 100644
index 00000000..a7e51a51
--- /dev/null
+++ b/apps/portal/web/src/app/features/atendimento/pages/manifestation-new.page.ts
@@ -0,0 +1,134 @@
+// T-21 Nova manifestação (contrato CTG-0003c §6; ficha IU-PORTAL-T21; [RN-PORTAL-109]; H.51):
+// sem leitura prévia e sem guarda — anônimo admitido (a sessão é opcional). O `ManifestationForm`
+// envia pela facade; o comprovante imediato aparece na mesma tela (`role="status"`) com o link ao
+// acompanhamento só quando não anônima. Recebimento irrecusável: nenhuma combinação é bloqueada no
+// cliente; `400 MANIFESTATION_KIND_INVALID` marca o campo; qualquer 5xx/offline é "indisponível"
+// com o canal alternativo — nunca um texto que sugira recusa.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { SessionFacade } from '../../../core/session.facade';
+import type { ManifestationCreateBody } from '../../../data/portal-read.models';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { ManifestationFormComponent } from '../../../shared/manifestation-form.component';
+import { AtendimentoFacade } from '../atendimento.facade';
+
+const SERVICE_KEY = 'manifestar';
+const KIND_INVALID_CODE = 'PORTAL.MANIFESTATION_KIND_INVALID';
+
+const STATE_KEYS = {
+  submitting: 'portal.screens.t21.state.carregando',
+  recoverable: 'portal.screens.t21.state.erro_recuperavel',
+  unavailable: 'portal.screens.t21.state.indisponivel',
+} as const;
+
+@Component({
+  selector: 'portal-manifestation-new-page',
+  imports: [
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    ManifestationFormComponent,
+  ],
+  providers: [AtendimentoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-21',
+    '[attr.data-status]': 'facade.createStatus()',
+    '[attr.aria-busy]':
+      'facade.createStatus() === "submitting" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t21.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t21.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.createStatus() === 'submitting') {
+        <detran-loading-state [label]="stateKeys.submitting | stynxTranslate" />
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.createError(); as error) {
+        <portal-error-banner [error]="error" (retry)="retry()" />
+      }
+    </div>
+
+    <portal-manifestation-form
+      [sessionActive]="session.active()"
+      [status]="facade.createStatus()"
+      [fields]="facade.createError()?.fields ?? []"
+      [receipt]="facade.created()"
+      (submitted)="onSubmitted($event)"
+    />
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class ManifestationNewPageComponent {
+  readonly facade = inject(AtendimentoFacade);
+  readonly session = inject(SessionFacade);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private lastBody: ManifestationCreateBody | null = null;
+  private focused = false;
+
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+
+  readonly stateTextKey = computed<string | null>(() => {
+    const status = this.facade.createStatus();
+    const code = this.facade.createError()?.code ?? null;
+    if (code === KIND_INVALID_CODE) return STATE_KEYS.recoverable;
+    if (
+      status === 'error' ||
+      status === 'unavailable' ||
+      status === 'offline'
+    ) {
+      return STATE_KEYS.unavailable;
+    }
+    return null;
+  });
+
+  constructor() {
+    // Confirmação de envio anunciada (§7.3): o comprovante é `role="status"`; o foco vai ao título.
+    afterRenderEffect(() => {
+      const created = this.facade.created();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (created && !this.focused) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  onSubmitted(body: ManifestationCreateBody): void {
+    this.lastBody = body;
+    this.focused = false;
+    void this.facade.create(body);
+  }
+
+  retry(): void {
+    if (this.lastBody) void this.facade.create(this.lastBody);
+  }
+}
diff --git a/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts b/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts
new file mode 100644
index 00000000..33eb9379
--- /dev/null
+++ b/apps/portal/web/src/app/features/catalogo/catalogo.facade.ts
@@ -0,0 +1,113 @@
+// CatalogoFacade (contrato CTG-0003c §3.9; T-25/T-15; [RN-PORTAL-108]; [DIVERGE-22/23]): a Carta de
+// Serviços — a lista vem do cache do par 1 (`PortalServiceCatalogFacade.items()`, `GET services`,
+// ordem do servidor) e o detalhe de `GET services/{serviceKey}` (404 = fora do catálogo →
+// `not_found`, sem vínculo). `functionalRoute` resolve a rota FUNCIONAL do serviço pelo manifesto
+// (nunca `item.route`, caminho de fixture): primeira entrada com o `serviceKey` sem parâmetro `:`;
+// só com parâmetro (defesa_previa…) → a lista de origem `/autos`; sem entrada → `null`. T-15 é
+// estática (sem operação gerada, OD-P90): sem leitura aqui.
+import { Injectable, inject, signal } from '@angular/core';
+import { PORTAL_ROUTE_MANIFEST } from '../../app.route-manifest';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+  type PresentErrorOptions,
+} from '../../core/error-boundary';
+import { PortalServiceCatalogFacade } from '../../core/service-catalog.facade';
+import {
+  PortalClient,
+  type ServiceCatalogItem,
+} from '../../data/portal.client';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+
+/** Lista de origem dos atos sobre um AIT (rotas com `:aitId`). */
+const AUTOS_ROUTE = '/autos';
+const AIT_PARAM = ':aitId';
+
+/**
+ * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
+ * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
+ * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
+ */
+function presentRead(
+  error: unknown,
+  options?: PresentErrorOptions,
+): ErrorPresentation {
+  const presentation = presentError(error, options);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+/** Rota funcional de um `serviceKey` pelo manifesto (spec §4 "Ir para o serviço"). */
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
+
+@Injectable()
+export class CatalogoFacade {
+  private readonly client = inject(PortalClient);
+  private readonly catalog = inject(PortalServiceCatalogFacade);
+
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly itemsState = signal<readonly ServiceCatalogItem[]>([]);
+  private readonly selectedState = signal<ServiceCatalogItem | null>(null);
+  private sequence = 0;
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  /** Cache do par 1 (`GET services`), ordem do servidor. */
+  readonly items = this.itemsState.asReadonly();
+  /** `GET services/{serviceKey}` quando `:serviceKey` presente. */
+  readonly selected = this.selectedState.asReadonly();
+
+  async loadList(): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    this.selectedState.set(null);
+    const sequence = ++this.sequence;
+    try {
+      const items = Array.from((await this.catalog.items()).values());
+      if (sequence !== this.sequence) return;
+      this.itemsState.set(items);
+      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.sequence) return;
+      const presentation = presentRead(error);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /** 404 NOT_FOUND{kind:'service'} → `not_found` (não é vínculo: `portal.screens.t25.state.sem_permissao`). */
+  async loadService(serviceKey: string): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    const sequence = ++this.sequence;
+    try {
+      const item = await this.client.getService(serviceKey);
+      if (sequence !== this.sequence) return;
+      this.selectedState.set(item);
+      this.statusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.sequence) return;
+      const presentation = presentRead(error);
+      this.selectedState.set(null);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  functionalRoute(serviceKey: string): string | null {
+    return functionalRouteFor(serviceKey);
+  }
+}
diff --git a/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts b/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts
index a62a3eab..2ba04df5 100644
--- a/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts
+++ b/apps/portal/web/src/app/features/catalogo/catalogo.routes.ts
@@ -1,7 +1,22 @@
-// Módulo `catalogo` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('catalogo', { '<path>': { component, title } })`.
+// Módulo `catalogo` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-25 lista/detalhe, T-15).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { PointsExplainerPageComponent } from './pages/points-explainer.page';
+import { ServiceCharterPageComponent } from './pages/service-charter.page';

-export const CATALOGO_ROUTES: Routes = moduleRoutes('catalogo');
+export const CATALOGO_ROUTES: Routes = moduleRoutes('catalogo', {
+  'carta-servicos': {
+    component: ServiceCharterPageComponent,
+    title: 'portal.screens.t25.title',
+  },
+  'carta-servicos/:serviceKey': {
+    component: ServiceCharterPageComponent,
+    title: 'portal.screens.t25.title',
+  },
+  'pontuacao/como-funciona': {
+    component: PointsExplainerPageComponent,
+    title: 'portal.screens.t15.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/catalogo/pages/points-explainer.page.ts b/apps/portal/web/src/app/features/catalogo/pages/points-explainer.page.ts
new file mode 100644
index 00000000..efecc8f2
--- /dev/null
+++ b/apps/portal/web/src/app/features/catalogo/pages/points-explainer.page.ts
@@ -0,0 +1,47 @@
+// T-15 Como funciona a pontuação (contrato CTG-0003c §6; ficha IU-PORTAL-T15; [JRN-PORTAL-004];
+// [RN-RAIT-131]; [DIVERGE-22]/OD-P90): página estática — o conteúdo versionado
+// (`GET content/points-explainer`) não tem operação gerada nesta rodada: título e introdução do
+// catálogo, aviso `role="status"` de indisponibilidade nesta versão e os links a `/autos` e à
+// Carta de Serviços. Nenhuma leitura, nenhum cálculo de pontos.
+import { ChangeDetectionStrategy, Component } from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+
+const AUTOS_ROUTE = '/autos';
+const CHARTER_ROUTE = '/carta-servicos';
+
+@Component({
+  selector: 'portal-points-explainer-page',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { 'data-screen': 'T-15' },
+  template: `
+    <h1 tabindex="-1">{{ 'portal.screens.t15.title' | stynxTranslate }}</h1>
+    <p>{{ 'portal.screens.t15.intro' | stynxTranslate }}</p>
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      <p data-versioned-content>
+        {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+      </p>
+    </div>
+    <ul class="portal-points-links">
+      <li>
+        <a [routerLink]="autosRoute" [attr.routerLink]="autosRoute">{{
+          'portal.shell.nav.autos' | stynxTranslate
+        }}</a>
+      </li>
+      <li>
+        <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
+          'portal.common.link.carta' | stynxTranslate
+        }}</a>
+      </li>
+    </ul>
+  `,
+})
+export class PointsExplainerPageComponent {
+  readonly autosRoute = AUTOS_ROUTE;
+  readonly charterRoute = CHARTER_ROUTE;
+}
diff --git a/apps/portal/web/src/app/features/catalogo/pages/service-charter.page.ts b/apps/portal/web/src/app/features/catalogo/pages/service-charter.page.ts
new file mode 100644
index 00000000..92d14b08
--- /dev/null
+++ b/apps/portal/web/src/app/features/catalogo/pages/service-charter.page.ts
@@ -0,0 +1,406 @@
+// T-25 Carta de Serviços (contrato CTG-0003c §6; ficha IU-PORTAL-T25; [RN-PORTAL-102/108];
+// [DIVERGE-23]): uma página para as duas rotas — lista (`GET services`, ordem do servidor, filtro
+// local por texto) quando `:serviceKey` está ausente; detalhe (`GET services/{serviceKey}`) com os
+// campos que o item tem (rótulos OD-P89; valores tal como o servidor manda, inclusive
+// "source_pending (OD-P26)" — nunca "não se aplica" inventado). O nível é o do ATO
+// (`portal.situation.assurance.<nível>`), nunca a cor do selo. "Ir para este serviço" só com
+// `availability !== 'unavailable'` e rota funcional no manifesto; indisponível → motivo em
+// `data-token` + nota do canal alternativo. 404 → fora do catálogo (não é vínculo).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, RouterLink } from '@angular/router';
+import {
+  DetranEmptyStateComponent,
+  DetranLoadingStateComponent,
+  StynxI18nService,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { ServiceCatalogItem } from '../../../data/portal.client';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { CatalogoFacade } from '../catalogo.facade';
+
+const SERVICE_KEY_PARAM = 'serviceKey';
+const CHARTER_ROUTE = '/carta-servicos';
+const SERVICES_KEY_PREFIX = `portal.services.`;
+const AVAILABILITY_KEY_PREFIX = `portal.situation.availability.`;
+const ASSURANCE_KEY_PREFIX = `portal.situation.assurance.`;
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t25.state.carregando',
+  notFound: 'portal.screens.t25.state.sem_permissao',
+  recoverable: 'portal.screens.t25.state.erro_recuperavel',
+  unavailable: 'portal.screens.t25.state.indisponivel',
+} as const;
+
+/** Campos do detalhe (rótulo → valor do item), na ordem da ficha. */
+interface CharterField {
+  readonly key: string;
+  readonly labelKey: string;
+  readonly value: string | null;
+}
+
+@Component({
+  selector: 'portal-service-charter-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+  ],
+  providers: [CatalogoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-25',
+    '[attr.data-service-key]': 'serviceKey()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t25.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t25.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (serviceKey() === null) {
+      <form class="portal-charter-filter" (submit)="$event.preventDefault()">
+        <label>
+          <span>{{ 'portal.screens.t25.field.filtrar' | stynxTranslate }}</span>
+          <input
+            type="search"
+            name="filter"
+            [value]="filter()"
+            (input)="onFilterInput($event)"
+          />
+        </label>
+      </form>
+
+      @if (facade.status() === 'empty') {
+        <detran-empty-state
+          [title]="'portal.states.empty' | stynxTranslate"
+          [message]="'portal.states.empty' | stynxTranslate"
+        />
+      }
+
+      @if (filteredItems().length > 0) {
+        <ol data-service-list class="portal-service-list" aria-live="polite">
+          @for (item of filteredItems(); track item.serviceKey) {
+            <li
+              [attr.data-service-key]="item.serviceKey"
+              [attr.data-availability]="item.availability ?? null"
+              [attr.data-token]="item.unavailableReason ?? null"
+            >
+              <h2>
+                @if (serviceLabelKey(item); as key) {
+                  {{ key | stynxTranslate }}
+                }
+              </h2>
+              @if (item.availability; as availability) {
+                <p data-availability-label>
+                  {{ availabilityKey(availability) | stynxTranslate }}
+                </p>
+              }
+              <p
+                data-assurance
+                [attr.data-token]="item.minimumAssurance ?? null"
+              >
+                <span>{{
+                  'portal.screens.t25.field.nivel_assinatura' | stynxTranslate
+                }}</span>
+                <span>{{
+                  assuranceKey(item.minimumAssurance) | stynxTranslate
+                }}</span>
+              </p>
+              @if (item.alternativeChannelNote; as note) {
+                <p data-note>{{ note }}</p>
+              }
+              <a
+                [routerLink]="detailRoute(item)"
+                [attr.routerLink]="detailRoute(item)"
+                data-detail-link
+                >{{ 'portal.screens.t25.title' | stynxTranslate }}</a
+              >
+            </li>
+          }
+        </ol>
+      }
+    }
+
+    @if (facade.selected(); as item) {
+      <article
+        data-service-detail
+        [attr.data-service-key]="item.serviceKey"
+        [attr.data-availability]="item.availability ?? null"
+      >
+        <h2>
+          @if (serviceLabelKey(item); as key) {
+            {{ key | stynxTranslate }}
+          }
+        </h2>
+        <dl>
+          @for (field of detailFields(); track field.key) {
+            <div [attr.data-field]="field.key">
+              <dt>{{ field.labelKey | stynxTranslate }}</dt>
+              <dd>{{ field.value }}</dd>
+            </div>
+          }
+          @if (item.requirements?.length) {
+            <div data-field="requirements">
+              <dt>
+                {{ 'portal.screens.t25.field.requisitos' | stynxTranslate }}
+              </dt>
+              <dd>
+                <ul>
+                  @for (requirement of item.requirements; track $index) {
+                    <li>{{ requirement }}</li>
+                  }
+                </ul>
+              </dd>
+            </div>
+          }
+          @if (item.availability; as availability) {
+            <div
+              data-field="availability"
+              [attr.data-token]="item.unavailableReason ?? null"
+            >
+              <dt>
+                {{
+                  'portal.screens.t25.field.disponibilidade' | stynxTranslate
+                }}
+              </dt>
+              <dd>{{ availabilityKey(availability) | stynxTranslate }}</dd>
+            </div>
+          }
+          <div
+            data-field="minimumAssurance"
+            [attr.data-token]="item.minimumAssurance ?? null"
+          >
+            <dt>
+              {{ 'portal.screens.t25.field.nivel_assinatura' | stynxTranslate }}
+            </dt>
+            <dd>{{ assuranceKey(item.minimumAssurance) | stynxTranslate }}</dd>
+          </div>
+          @if (item.effectiveFrom; as effectiveFrom) {
+            <div data-field="effectiveFrom">
+              <dt>{{ 'portal.screens.t25.field.versao' | stynxTranslate }}</dt>
+              <dd>
+                @if (item.version !== undefined) {
+                  <span data-version>{{ item.version }}</span>
+                }
+                <time [attr.datetime]="effectiveFrom">{{
+                  'portal.screens.t25.field.vigencia'
+                    | stynxTranslate
+                      : { effectiveFrom: (effectiveFrom | stynxIntlDate) }
+                }}</time>
+              </dd>
+            </div>
+          }
+        </dl>
+        @if (functionalRoute(item); as route) {
+          <p>
+            <a [routerLink]="route" [attr.routerLink]="route" data-cmd-ir>{{
+              'portal.screens.t25.cmd.ir' | stynxTranslate
+            }}</a>
+          </p>
+        }
+        <portal-alternative-channel-note
+          [serviceKey]="item.serviceKey ?? null"
+          [note]="item.alternativeChannelNote ?? null"
+        />
+      </article>
+    }
+
+    @if (serviceKey() !== null) {
+      <p>
+        <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
+          'portal.common.link.carta' | stynxTranslate
+        }}</a>
+      </p>
+    }
+  `,
+})
+export class ServiceCharterPageComponent {
+  readonly facade = inject(CatalogoFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly serviceKey = signal<string | null>(null);
+  readonly filter = signal('');
+  readonly stateKeys = STATE_KEYS;
+  readonly charterRoute = CHARTER_ROUTE;
+
+  /** Filtro LOCAL por texto (rótulo traduzido, chave e resumo). */
+  readonly filteredItems = computed<readonly ServiceCatalogItem[]>(() => {
+    const needle = this.filter().trim().toLocaleLowerCase();
+    const items = this.facade.items();
+    if (needle.length === 0) return items;
+    return items.filter((item) => {
+      const labelKey = this.serviceLabelKey(item);
+      const label = labelKey ? this.i18n.translate(labelKey) : '';
+      return [label, item.serviceKey ?? '', item.summary ?? '']
+        .join('\n')
+        .toLocaleLowerCase()
+        .includes(needle);
+    });
+  });
+
+  /** Campos do detalhe presentes no item (valores do servidor, tal como chegam). */
+  readonly detailFields = computed<readonly CharterField[]>(() => {
+    const item = this.facade.selected();
+    if (!item) return [];
+    const candidates: readonly CharterField[] = [
+      {
+        key: 'summary',
+        labelKey: 'portal.screens.t25.field.resumo',
+        value: item.summary ?? null,
+      },
+      {
+        key: 'deliveryChannel',
+        labelKey: 'portal.screens.t25.field.canal',
+        value: item.deliveryChannel ?? null,
+      },
+      {
+        key: 'legalDeadline',
+        labelKey: 'portal.screens.t25.field.prazo_maximo',
+        value: item.legalDeadline ?? null,
+      },
+      {
+        key: 'cost',
+        labelKey: 'portal.screens.t25.field.custo',
+        value: item.cost ?? null,
+      },
+      {
+        key: 'accessibilityNote',
+        labelKey: 'portal.screens.t25.field.acessibilidade',
+        value: item.accessibilityNote ?? null,
+      },
+      {
+        key: 'responsibleParty',
+        labelKey: 'portal.screens.t25.field.responsavel',
+        value: item.responsibleParty ?? null,
+      },
+      {
+        key: 'normativeReference',
+        labelKey: 'portal.screens.t25.field.base_normativa',
+        value: item.normativeReference ?? null,
+      },
+    ];
+    return candidates.filter((field) => field.value !== null);
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const serviceKey = params.get(SERVICE_KEY_PARAM);
+        this.serviceKey.set(serviceKey);
+        this.focused = false;
+        this.load();
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'empty')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  /** `portal.services.<key>` quando existe no catálogo; ausente → só `data-service-key`. */
+  serviceLabelKey(item: ServiceCatalogItem): string | null {
+    const key = item.serviceKey
+      ? `${SERVICES_KEY_PREFIX}${item.serviceKey}`
+      : null;
+    return key && key in this.i18n.catalog() ? key : null;
+  }
+
+  availabilityKey(availability: string): string {
+    return `${AVAILABILITY_KEY_PREFIX}${availability}`;
+  }
+
+  /** Nível do ATO ('none' → "nenhum nível exigido"); nunca cor de selo. */
+  assuranceKey(level: string | undefined): string {
+    return `${ASSURANCE_KEY_PREFIX}${level ?? 'none'}`;
+  }
+
+  detailRoute(item: ServiceCatalogItem): string {
+    return `${CHARTER_ROUTE}/${item.serviceKey ?? ''}`;
+  }
+
+  /** "Ir para este serviço" só quando disponível (ao menos parcialmente) e com rota funcional. */
+  functionalRoute(item: ServiceCatalogItem): string | null {
+    if (!item.serviceKey || item.availability === 'unavailable') return null;
+    return this.facade.functionalRoute(item.serviceKey);
+  }
+
+  stateTextKey(): string | null {
+    const code = this.facade.error()?.code ?? null;
+    if (code === NOT_FOUND_CODE) return STATE_KEYS.notFound;
+    switch (this.facade.status()) {
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.recoverable;
+      default:
+        return null;
+    }
+  }
+
+  onFilterInput(event: Event): void {
+    this.filter.set((event.target as HTMLInputElement).value);
+  }
+
+  reload(): void {
+    this.load();
+  }
+
+  private load(): void {
+    const serviceKey = this.serviceKey();
+    if (serviceKey === null) {
+      void this.facade.loadList();
+    } else {
+      void this.facade.loadService(serviceKey);
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/features/documentos/documentos.facade.ts b/apps/portal/web/src/app/features/documentos/documentos.facade.ts
new file mode 100644
index 00000000..60dca335
--- /dev/null
+++ b/apps/portal/web/src/app/features/documentos/documentos.facade.ts
@@ -0,0 +1,308 @@
+// DocumentosFacade (contrato CTG-0003c §3.3; T-16, /veiculos, T-17; [RN-PORTAL-115/116/117];
+// [UC-PORTAL-011/012]; M14): a CNH (consulta informativa, categoria C nesta rodada — [DIVERGE-8]),
+// os veículos (forma OD-P36) e a quitação + emissão do CRLV-e. Offline (status 0 sem rede,
+// classificado pelo `ErrorBoundary`): T-16 tenta `OfflineDocumentStore.get('cnh-e')` e T-17
+// `get('crlv-e')` do MESMO `vehicleId` ([DIVERGE-13]) antes de mostrar `portal.states.offline`.
+// `put` só com `validUntil` DO SERVIDOR e categoria A (documento com QR) — nunca calculado.
+// `canIssue` do servidor decide o botão; o cliente não soma `blocking`, não trata multa sob
+// recurso como débito (DT-027) e reconsulta a quitação após qualquer resposta da emissão
+// ([UC-PORTAL-012] 3a). `503 NATIONAL_READ_UNAVAILABLE` mantém o último dado com `cachedAt`.
+// O store é resolvido na primeira necessidade (como o `HttpClient` no `PortalClient`).
+import { Injectable, Injector, computed, inject, signal } from '@angular/core';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+  type PresentErrorOptions,
+} from '../../core/error-boundary';
+import { OfflineDocumentStore } from '../../core/offline-document.store';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  CnhLicense,
+  CnhRead,
+  CrlvIssued,
+  Vehicle,
+  VehicleClearance,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type { CommandStatus } from '../processos/processos.facade';
+
+export type { CommandStatus } from '../processos/processos.facade';
+
+/** De onde veio o documento exibido. */
+export type DocumentSource = 'network' | 'offline';
+
+const CNH_NOT_FOUND_CODE = 'PORTAL.CNH_NOT_FOUND';
+const CNH_CLEARANCE_PENDING_CODE = 'PORTAL.CNH_CLEARANCE_PENDING';
+const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
+/** T-16 pendência: o passo "pagar" leva à lista de autos do app — a rota do servidor é ignorada. */
+const AUTOS_ROUTE = '/autos';
+/** Categoria de documento (RN-117 A): só ela vai ao cache offline. */
+const DOCUMENT_CATEGORY = 'A';
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+function stringOrNull(value: unknown): string | null {
+  return typeof value === 'string' ? value : null;
+}
+
+function stringList(value: unknown): readonly string[] {
+  return Array.isArray(value)
+    ? value.filter((item): item is string => typeof item === 'string')
+    : [];
+}
+
+/** `license` livre (OD-P35) → `CnhLicense` por asserção; campos ausentes → `null`/`[]`. */
+function toLicense(license: unknown): CnhLicense {
+  const record = isRecord(license) ? license : {};
+  const status = record['status'];
+  return {
+    status:
+      status === 'valida' ||
+      status === 'vencida' ||
+      status === 'suspensa' ||
+      status === 'cassada'
+        ? status
+        : null,
+    validUntil: stringOrNull(record['validUntil']),
+    categories: stringList(record['categories']),
+    restrictions: stringList(record['restrictions']),
+  };
+}
+
+/**
+ * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
+ * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
+ * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
+ */
+function presentRead(
+  error: unknown,
+  options?: PresentErrorOptions,
+): ErrorPresentation {
+  const presentation = presentError(error, options);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+function commandStatusOf(presentation: ErrorPresentation): CommandStatus {
+  if (presentation.code === SERVICE_UNAVAILABLE_CODE) return 'unavailable';
+  const status = readStatusFor(presentation);
+  if (status === 'unavailable') return 'unavailable';
+  return status === 'offline' ? 'offline' : 'error';
+}
+
+@Injectable()
+export class DocumentosFacade {
+  private readonly client = inject(PortalClient);
+  private readonly injector = inject(Injector);
+  private store: OfflineDocumentStore | null = null;
+
+  // T-16
+  private readonly cnhStatusState = signal<ReadStatus>('idle');
+  private readonly cnhState = signal<CnhRead | null>(null);
+  private readonly cnhErrorState = signal<ErrorPresentation | null>(null);
+  private readonly cnhSourceState = signal<DocumentSource | null>(null);
+  private readonly cnhDocumentStatusState = signal<CommandStatus>('idle');
+  private readonly cnhDocumentErrorState = signal<ErrorPresentation | null>(
+    null,
+  );
+  // /veiculos
+  private readonly vehiclesStatusState = signal<ReadStatus>('idle');
+  private readonly vehiclesState = signal<readonly Vehicle[]>([]);
+  private readonly vehiclesCachedAtState = signal<string | null>(null);
+  private readonly vehiclesErrorState = signal<ErrorPresentation | null>(null);
+  // T-17
+  private readonly clearanceStatusState = signal<ReadStatus>('idle');
+  private readonly clearanceState = signal<VehicleClearance | null>(null);
+  private readonly clearanceErrorState = signal<ErrorPresentation | null>(null);
+  private readonly crlvStatusState = signal<CommandStatus>('idle');
+  private readonly crlvState = signal<CrlvIssued | null>(null);
+  private readonly crlvSourceState = signal<DocumentSource | null>(null);
+  private readonly crlvErrorState = signal<ErrorPresentation | null>(null);
+  private cnhSequence = 0;
+  private vehiclesSequence = 0;
+  private clearanceSequence = 0;
+
+  readonly cnhStatus = this.cnhStatusState.asReadonly();
+  readonly cnh = this.cnhState.asReadonly();
+  /** `cnh()?.license` por asserção (OD-P35). */
+  readonly cnhLicense = computed<CnhLicense | null>(() => {
+    const cnh = this.cnhState();
+    return cnh ? toLicense(cnh.license) : null;
+  });
+  readonly cnhError = this.cnhErrorState.asReadonly();
+  readonly cnhSource = this.cnhSourceState.asReadonly();
+  readonly cnhDocumentStatus = this.cnhDocumentStatusState.asReadonly();
+  readonly cnhDocumentError = this.cnhDocumentErrorState.asReadonly();
+  readonly vehiclesStatus = this.vehiclesStatusState.asReadonly();
+  readonly vehicles = this.vehiclesState.asReadonly();
+  readonly vehiclesCachedAt = this.vehiclesCachedAtState.asReadonly();
+  readonly vehiclesError = this.vehiclesErrorState.asReadonly();
+  readonly clearanceStatus = this.clearanceStatusState.asReadonly();
+  readonly clearance = this.clearanceState.asReadonly();
+  readonly clearanceError = this.clearanceErrorState.asReadonly();
+  readonly crlvStatus = this.crlvStatusState.asReadonly();
+  readonly crlv = this.crlvState.asReadonly();
+  readonly crlvSource = this.crlvSourceState.asReadonly();
+  readonly crlvError = this.crlvErrorState.asReadonly();
+
+  /** GET documents/cnh; categoria A com validade → `put('cnh-e')` (nesta rodada nunca); offline → `get('cnh-e')`. */
+  async loadCnh(): Promise<void> {
+    this.cnhStatusState.set('loading');
+    this.cnhErrorState.set(null);
+    const sequence = ++this.cnhSequence;
+    try {
+      const cnh = await this.client.getCnh();
+      if (sequence !== this.cnhSequence) return;
+      this.cnhState.set(cnh);
+      this.cnhSourceState.set('network');
+      this.cnhStatusState.set('ready');
+      const validUntil = toLicense(cnh.license).validUntil;
+      if ((cnh.category as string) === DOCUMENT_CATEGORY && validUntil) {
+        await this.offlineStore.put('cnh-e', cnh, validUntil);
+      }
+    } catch (error: unknown) {
+      if (sequence !== this.cnhSequence) return;
+      const presentation = presentRead(error);
+      const status = readStatusFor(presentation);
+      if (status === 'offline') {
+        const cached = await this.offlineStore.get<CnhRead>('cnh-e');
+        if (sequence !== this.cnhSequence) return;
+        if (cached) {
+          this.cnhState.set(cached.document);
+          this.cnhSourceState.set('offline');
+          this.cnhErrorState.set(presentation);
+          this.cnhStatusState.set('ready');
+          return;
+        }
+      }
+      this.cnhErrorState.set(
+        presentation.code === CNH_CLEARANCE_PENDING_CODE
+          ? { ...presentation, nextStepRoute: AUTOS_ROUTE }
+          : presentation,
+      );
+      if (presentation.code === CNH_NOT_FOUND_CODE) {
+        this.cnhState.set(null);
+        this.cnhStatusState.set('empty');
+        return;
+      }
+      // 503 nacional mantém o último dado lido (RN-117 C); os demais limpam.
+      if (status !== 'unavailable') this.cnhState.set(null);
+      this.cnhStatusState.set(status);
+    }
+  }
+
+  /** GET documents/cnh?documentBytes=true → Blob; 422 → 'unavailable' (documento_assinado_pendente_r0014). */
+  async downloadCnh(): Promise<Blob | null> {
+    this.cnhDocumentStatusState.set('submitting');
+    this.cnhDocumentErrorState.set(null);
+    try {
+      const blob = await this.client.downloadCnhDocument();
+      this.cnhDocumentStatusState.set('done');
+      return blob;
+    } catch (error: unknown) {
+      const presentation = presentRead(error);
+      this.cnhDocumentErrorState.set(presentation);
+      this.cnhDocumentStatusState.set(commandStatusOf(presentation));
+      return null;
+    }
+  }
+
+  /** GET vehicles; `empty` quando `items.length === 0`. */
+  async loadVehicles(): Promise<void> {
+    this.vehiclesStatusState.set('loading');
+    this.vehiclesErrorState.set(null);
+    const sequence = ++this.vehiclesSequence;
+    try {
+      const page = await this.client.listVehicles();
+      if (sequence !== this.vehiclesSequence) return;
+      this.vehiclesState.set(page.items ?? []);
+      this.vehiclesCachedAtState.set(page.cachedAt ?? null);
+      this.vehiclesStatusState.set(
+        (page.items ?? []).length === 0 ? 'empty' : 'ready',
+      );
+    } catch (error: unknown) {
+      if (sequence !== this.vehiclesSequence) return;
+      const presentation = presentRead(error);
+      this.vehiclesErrorState.set(presentation);
+      this.vehiclesStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /** GET vehicles/{id}/clearance (quitação ANTES da tentativa); depois `get('crlv-e')` do mesmo veículo. */
+  async loadClearance(vehicleId: string): Promise<void> {
+    this.clearanceStatusState.set('loading');
+    this.clearanceErrorState.set(null);
+    const sequence = ++this.clearanceSequence;
+    try {
+      const clearance = await this.client.getVehicleClearance(vehicleId);
+      if (sequence !== this.clearanceSequence) return;
+      this.clearanceState.set(clearance);
+      this.clearanceStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.clearanceSequence) return;
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'vehicle', id: vehicleId },
+      });
+      const status = readStatusFor(presentation);
+      this.clearanceErrorState.set(presentation);
+      // 503 nacional mantém a última quitação lida com `cachedAt` (RN-117 C).
+      if (status !== 'unavailable') this.clearanceState.set(null);
+      this.clearanceStatusState.set(status);
+    }
+    await this.restoreOfflineCrlv(vehicleId, sequence);
+  }
+
+  /** POST vehicles/{id}/crlv-e; 2xx com validade → `put('crlv-e')`; reconsulta a quitação depois. */
+  async issueCrlv(vehicleId: string): Promise<CrlvIssued | null> {
+    this.crlvStatusState.set('submitting');
+    this.crlvErrorState.set(null);
+    let issued: CrlvIssued | null = null;
+    try {
+      const result = await this.client.issueCrlv(vehicleId);
+      issued = { ...(result.body ?? {}), vehicleId } as CrlvIssued;
+      this.crlvState.set(issued);
+      this.crlvSourceState.set('network');
+      this.crlvStatusState.set('done');
+      if (issued.qrVerification !== null && issued.validUntil) {
+        await this.offlineStore.put('crlv-e', issued, issued.validUntil);
+      }
+    } catch (error: unknown) {
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'vehicle', id: vehicleId },
+      });
+      this.crlvErrorState.set(presentation);
+      this.crlvStatusState.set(commandStatusOf(presentation));
+    }
+    void this.loadClearance(vehicleId);
+    return issued;
+  }
+
+  /** `get('crlv-e')` só vale para o MESMO `vehicleId` ([DIVERGE-13]); outro veículo ou nada → sem documento. */
+  private async restoreOfflineCrlv(
+    vehicleId: string,
+    sequence: number,
+  ): Promise<void> {
+    const cached = await this.offlineStore.get<CrlvIssued>('crlv-e');
+    if (sequence !== this.clearanceSequence) return;
+    if (cached && cached.document.vehicleId === vehicleId) {
+      if (this.crlvState() === null) {
+        this.crlvState.set(cached.document);
+        this.crlvSourceState.set('offline');
+      }
+      return;
+    }
+    if (this.crlvSourceState() === 'offline') {
+      this.crlvState.set(null);
+      this.crlvSourceState.set(null);
+    }
+  }
+
+  private get offlineStore(): OfflineDocumentStore {
+    this.store ??= this.injector.get(OfflineDocumentStore);
+    return this.store;
+  }
+}
diff --git a/apps/portal/web/src/app/features/documentos/documentos.routes.ts b/apps/portal/web/src/app/features/documentos/documentos.routes.ts
index a0367ae5..28df28cb 100644
--- a/apps/portal/web/src/app/features/documentos/documentos.routes.ts
+++ b/apps/portal/web/src/app/features/documentos/documentos.routes.ts
@@ -1,7 +1,23 @@
-// Módulo `documentos` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('documentos', { '<path>': { component, title } })`.
+// Módulo `documentos` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-16, /veiculos, T-17).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { CnhPageComponent } from './pages/cnh.page';
+import { CrlvPageComponent } from './pages/crlv.page';
+import { VehiclesPageComponent } from './pages/vehicles.page';

-export const DOCUMENTOS_ROUTES: Routes = moduleRoutes('documentos');
+export const DOCUMENTOS_ROUTES: Routes = moduleRoutes('documentos', {
+  'documentos/cnh-digital': {
+    component: CnhPageComponent,
+    title: 'portal.screens.t16.title',
+  },
+  veiculos: {
+    component: VehiclesPageComponent,
+    title: 'portal.documents.vehicles.title',
+  },
+  'veiculos/:vehicleId/crlv-e': {
+    component: CrlvPageComponent,
+    title: 'portal.screens.t17.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/documentos/pages/cnh.page.ts b/apps/portal/web/src/app/features/documentos/pages/cnh.page.ts
new file mode 100644
index 00000000..12333a2b
--- /dev/null
+++ b/apps/portal/web/src/app/features/documentos/pages/cnh.page.ts
@@ -0,0 +1,259 @@
+// T-16 Minha CNH digital (contrato CTG-0003c §6; ficha IU-PORTAL-T16; [RN-PORTAL-115/117];
+// [UC-PORTAL-011]): `GET documents/cnh` é consulta informativa (categoria C, OD-P35 —
+// [DIVERGE-8]) renderizada pelo `DigitalDocumentCard`; a validade é a data do servidor; o QR só
+// existe com `qrVerification`. Avisos legais (porte obrigatório; quitação antes de renovar) ANTES
+// de qualquer ação. "Baixar" pede o documento assinado — nesta rodada 422 → indisponível com o
+// motivo, nunca um PDF simulado (M15). Estados: vazio (404), não válida (422), pendência (422 →
+// link /autos, rota do servidor ignorada), indisponível (503 mantém o último dado com a data da
+// consulta) e offline (documento do `OfflineDocumentStore` se houver; senão `portal.states.offline`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import {
+  DetranEmptyStateComponent,
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import {
+  DigitalDocumentCardComponent,
+  type DigitalDocumentField,
+  type DocumentCategory,
+} from '../../../shared/digital-document-card.component';
+import { DocumentosFacade } from '../documentos.facade';
+
+const SERVICE_KEY = 'consulta_cnh';
+const CNH_NOT_VALID_CODE = 'PORTAL.CNH_NOT_VALID_FOR_DIGITAL';
+const CNH_CLEARANCE_PENDING_CODE = 'PORTAL.CNH_CLEARANCE_PENDING';
+const STATUS_KEY_PREFIX = `portal.documents.cnh.status.`;
+const DOWNLOAD_FILE_NAME = 'cnh-e.pdf';
+
+const STATE_KEYS = {
+  empty: 'portal.screens.t16.empty',
+  naoValida: 'portal.screens.t16.state.nao_valida',
+  pendencia: 'portal.screens.t16.state.pendencia',
+} as const;
+
+@Component({
+  selector: 'portal-cnh-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DigitalDocumentCardComponent,
+  ],
+  providers: [DocumentosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-16',
+    '[attr.data-status]': 'facade.cnhStatus()',
+    '[attr.data-source]': 'facade.cnhSource()',
+    '[attr.aria-busy]': 'facade.cnhStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t16.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.cnhStatus() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+      @if (offlineWithDocument()) {
+        <stynx-banner
+          tone="info"
+          [message]="'portal.states.offline' | stynxTranslate"
+        />
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text [attr.data-token]="stateToken()">
+          {{ key | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <ul class="portal-cnh-notices" data-notices>
+      <li>{{ 'portal.documents.cnh.porte_obrigatorio' | stynxTranslate }}</li>
+      <li>
+        {{ 'portal.documents.cnh.quitacao_antes_renovar' | stynxTranslate }}
+      </li>
+    </ul>
+
+    <p>
+      <button
+        type="button"
+        data-reload
+        [disabled]="facade.cnhStatus() === 'loading'"
+        (click)="reload()"
+      >
+        {{ 'portal.common.action.retry' | stynxTranslate }}
+      </button>
+    </p>
+
+    <div role="alert" class="portal-alert-region">
+      @if (!offlineWithDocument() && facade.cnhError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.cnhDocumentError(); as error) {
+        <portal-error-banner [error]="error" (retry)="download()" />
+      }
+    </div>
+
+    @if (facade.cnhStatus() === 'empty') {
+      <detran-empty-state
+        [title]="stateKeys.empty | stynxTranslate"
+        [message]="stateKeys.empty | stynxTranslate"
+      />
+    }
+
+    @if (facade.cnh(); as cnh) {
+      @if (facade.cnhLicense()?.status; as status) {
+        <p data-cnh-status [attr.data-token]="status">
+          {{ statusLabelKey(status) | stynxTranslate }}
+        </p>
+      }
+      <portal-digital-document-card
+        kind="cnh-e"
+        [category]="category()"
+        [fields]="fields()"
+        [validUntil]="facade.cnhLicense()?.validUntil ?? null"
+        [qrVerification]="cnh.qrVerification"
+        [documentBytes]="cnh.documentBytes"
+        [cachedAt]="cnh.cachedAt"
+        [offline]="facade.cnhSource() === 'offline'"
+        downloadLabelKey="portal.screens.t16.cmd.baixar"
+        (download)="download()"
+        (share)="share()"
+        (print)="print()"
+      />
+    }
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class CnhPageComponent {
+  readonly facade = inject(DocumentosFacade);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+  private objectUrl: string | null = null;
+
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+
+  /** Documento vindo do cache offline: aviso em `role="status"`, nunca banner de erro. */
+  readonly offlineWithDocument = computed(
+    () => this.facade.cnhSource() === 'offline' && this.facade.cnh() !== null,
+  );
+
+  /** `CnhRead.category` do servidor ('C' nesta rodada) — o card rebaixa 'A' sem QR. */
+  readonly category = computed<DocumentCategory>(() => {
+    const category = this.facade.cnh()?.category as string | undefined;
+    return category === 'A' ? 'A' : 'C';
+  });
+
+  /** `license` livre (OD-P35): categorias e restrições (o status vai acima do card, com `data-token`). */
+  readonly fields = computed<readonly DigitalDocumentField[]>(() => {
+    const license = this.facade.cnhLicense();
+    if (!license) return [];
+    const fields: DigitalDocumentField[] = [];
+    if (license.categories.length > 0) {
+      fields.push({
+        labelKey: 'portal.documents.cnh.categories',
+        value: license.categories.join(', '),
+      });
+    }
+    if (license.restrictions.length > 0) {
+      fields.push({
+        labelKey: 'portal.documents.cnh.restrictions',
+        value: license.restrictions.join(', '),
+      });
+    }
+    return fields;
+  });
+
+  constructor() {
+    void this.facade.loadCnh();
+    afterRenderEffect(() => {
+      const status = this.facade.cnhStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'empty')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+    this.destroyRef.onDestroy(() => this.revokeObjectUrl());
+  }
+
+  stateTextKey(): string | null {
+    const code = this.facade.cnhError()?.code;
+    if (code === CNH_NOT_VALID_CODE) return STATE_KEYS.naoValida;
+    if (code === CNH_CLEARANCE_PENDING_CODE) return STATE_KEYS.pendencia;
+    return null;
+  }
+
+  /** `CNH_NOT_VALID_FOR_DIGITAL { status }` → `data-token`. */
+  stateToken(): string | null {
+    const status = this.facade.cnhError()?.context['status'];
+    return typeof status === 'string' ? status : null;
+  }
+
+  statusLabelKey(status: string): string {
+    return `${STATUS_KEY_PREFIX}${status}`;
+  }
+
+  /** `GET …?documentBytes=true` → `<a download>` por object URL; 422 → indisponível (banner). */
+  async download(): Promise<void> {
+    const blob = await this.facade.downloadCnh();
+    if (!blob || typeof URL.createObjectURL !== 'function') return;
+    this.revokeObjectUrl();
+    this.objectUrl = URL.createObjectURL(blob);
+    const anchor = document.createElement('a');
+    anchor.href = this.objectUrl;
+    anchor.download = DOWNLOAD_FILE_NAME;
+    anchor.click();
+  }
+
+  /** `navigator.share` quando existir; senão nada (a impressão é opção, nunca requisito). */
+  share(): void {
+    const share = navigator.share?.bind(navigator);
+    if (!share) return;
+    void share({ title: DOWNLOAD_FILE_NAME }).catch(() => undefined);
+  }
+
+  print(): void {
+    window.print();
+  }
+
+  reload(): void {
+    void this.facade.loadCnh();
+  }
+
+  private revokeObjectUrl(): void {
+    if (this.objectUrl && typeof URL.revokeObjectURL === 'function') {
+      URL.revokeObjectURL(this.objectUrl);
+    }
+    this.objectUrl = null;
+  }
+}
diff --git a/apps/portal/web/src/app/features/documentos/pages/crlv.page.ts b/apps/portal/web/src/app/features/documentos/pages/crlv.page.ts
new file mode 100644
index 00000000..085d6231
--- /dev/null
+++ b/apps/portal/web/src/app/features/documentos/pages/crlv.page.ts
@@ -0,0 +1,211 @@
+// T-17 Meu veículo — CRLV-e (contrato CTG-0003c §6; ficha IU-PORTAL-T17; [RN-PORTAL-116];
+// [UC-PORTAL-012]; OD-P04/DT-027): a quitação (`ClearanceStatus`) ANTES da tentativa de emitir;
+// `POST crlv-e` responde 422 nesta rodada (documento assinado pendente) → indisponível com motivo
+// e canal, nunca simulado (M15); um 2xx (OD-P59 ext.) vira `DigitalDocumentCard` categoria A só
+// com `qrVerification` (senão C) e vai ao cache offline com a validade do servidor. Débito ×
+// restrição têm mensagens distintas (a `ClearanceStatus` as mostra, sem link de pagamento na
+// restrição); multa sob recurso nunca bloqueia. Offline: só o documento do MESMO veículo
+// ([DIVERGE-13]); senão `portal.states.offline`. Impressão é opção (botão), nunca requisito.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { ErrorPresentation } from '../../../core/error-boundary';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { ClearanceStatusComponent } from '../../../shared/clearance-status.component';
+import {
+  DigitalDocumentCardComponent,
+  type DocumentCategory,
+} from '../../../shared/digital-document-card.component';
+import { DocumentosFacade } from '../documentos.facade';
+
+const VEHICLE_PARAM = 'vehicleId';
+const SERVICE_KEY = 'emissao_crlv';
+const BLOCKED_CODES: ReadonlySet<string> = new Set([
+  'PORTAL.CRLV_BLOCKED_BY_DEBT',
+  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION',
+]);
+
+@Component({
+  selector: 'portal-crlv-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    ClearanceStatusComponent,
+    DigitalDocumentCardComponent,
+  ],
+  providers: [DocumentosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-17',
+    '[attr.data-vehicle-id]': 'vehicleId()',
+    '[attr.data-status]': 'facade.clearanceStatus()',
+    '[attr.data-crlv-status]': 'facade.crlvStatus()',
+    '[attr.aria-busy]': 'busy() ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t17.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (busy()) {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+      @if (offlineWithDocument()) {
+        <stynx-banner
+          tone="info"
+          [message]="'portal.states.offline' | stynxTranslate"
+        />
+      }
+      @if (facade.crlvStatus() === 'unavailable') {
+        <p data-unavailable [attr.data-reason]="unavailableReason()">
+          {{ 'portal.states.service_unavailable' | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (!offlineWithDocument() && facade.clearanceError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.crlvError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    <portal-clearance-status
+      [clearance]="facade.clearance()"
+      [blocked]="blocked()"
+      [cachedAt]="facade.clearance()?.cachedAt ?? null"
+      [canIssue]="facade.clearance()?.canIssue === true"
+      [busy]="busy()"
+      (issue)="issue()"
+    />
+
+    @if (facade.crlv(); as crlv) {
+      <portal-digital-document-card
+        kind="crlv-e"
+        [category]="category()"
+        [validUntil]="crlv.validUntil"
+        [qrVerification]="crlv.qrVerification"
+        [documentBytes]="crlv.documentBytes"
+        [cachedAt]="crlv.issuedAt"
+        [offline]="facade.crlvSource() === 'offline'"
+        (share)="share()"
+        (print)="print()"
+      />
+    }
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class CrlvPageComponent {
+  readonly facade = inject(DocumentosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly vehicleId = signal('');
+  readonly serviceKey = SERVICE_KEY;
+
+  readonly busy = computed(
+    () =>
+      this.facade.clearanceStatus() === 'loading' ||
+      this.facade.crlvStatus() === 'submitting',
+  );
+
+  /** `CRLV_BLOCKED_*` da emissão → contexto da `ClearanceStatus`. */
+  readonly blocked = computed<ErrorPresentation | null>(() => {
+    const error = this.facade.crlvError();
+    return error?.code !== null &&
+      error?.code !== undefined &&
+      BLOCKED_CODES.has(error.code)
+      ? error
+      : null;
+  });
+
+  /** Documento emitido: categoria A só com `qrVerification` (§5.3 b); senão C. */
+  readonly category = computed<DocumentCategory>(() =>
+    this.facade.crlv()?.qrVerification ? 'A' : 'C',
+  );
+
+  readonly offlineWithDocument = computed(
+    () =>
+      this.facade.clearanceStatus() === 'offline' &&
+      this.facade.crlvSource() === 'offline' &&
+      this.facade.crlv() !== null,
+  );
+
+  readonly unavailableReason = computed<string | null>(() => {
+    const reason = this.facade.crlvError()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : null;
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const vehicleId = params.get(VEHICLE_PARAM) ?? '';
+        this.vehicleId.set(vehicleId);
+        this.focused = false;
+        void this.facade.loadClearance(vehicleId);
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.clearanceStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && status === 'ready') {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  /** Sem duplo envio: enquanto a emissão corre, o clique é ignorado. */
+  issue(): void {
+    if (this.facade.crlvStatus() === 'submitting') return;
+    void this.facade.issueCrlv(this.vehicleId());
+  }
+
+  share(): void {
+    const share = navigator.share?.bind(navigator);
+    if (!share) return;
+    void share({ title: SERVICE_KEY }).catch(() => undefined);
+  }
+
+  print(): void {
+    window.print();
+  }
+
+  reload(): void {
+    void this.facade.loadClearance(this.vehicleId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/documentos/pages/vehicles.page.ts b/apps/portal/web/src/app/features/documentos/pages/vehicles.page.ts
new file mode 100644
index 00000000..a0e83680
--- /dev/null
+++ b/apps/portal/web/src/app/features/documentos/pages/vehicles.page.ts
@@ -0,0 +1,140 @@
+// /veiculos (contrato CTG-0003c §6; OD-P36): os veículos do cidadão (`GET vehicles`, forma livre
+// transcrita como `{ vehicleId, plate, model }`) em lista semântica (A9(b)), cada um com o link
+// ao seu CRLV-e (T-17); `cachedAt` como "consultado em". Estados: carregando, vazio, erro,
+// indisponível (503 nacional, com a data da consulta) e offline — sem cache próprio desta rota.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranEmptyStateComponent,
+  DetranLoadingStateComponent,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { Vehicle } from '../../../data/portal-read.models';
+import { DocumentosFacade } from '../documentos.facade';
+
+const VEHICLES_ROUTE_PREFIX = '/veiculos/';
+const CRLV_ROUTE_SUFFIX = '/crlv-e';
+
+@Component({
+  selector: 'portal-vehicles-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+  ],
+  providers: [DocumentosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.data-status]': 'facade.vehiclesStatus()',
+    '[attr.aria-busy]': 'facade.vehiclesStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.documents.vehicles.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.vehiclesStatus() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+      @if (facade.vehiclesCachedAt(); as cachedAt) {
+        <p data-consulted-at>
+          {{
+            'portal.documents.consulta.consultedAt'
+              | stynxTranslate
+                : { consultedAt: (cachedAt | stynxIntlDate: dateTimeFormat) }
+          }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.vehiclesError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.vehiclesStatus() === 'empty') {
+      <detran-empty-state
+        [title]="'portal.documents.vehicles.empty' | stynxTranslate"
+        [message]="'portal.documents.vehicles.empty' | stynxTranslate"
+      />
+    }
+
+    @if (facade.vehicles().length > 0) {
+      <ol data-vehicle-list class="portal-vehicle-list">
+        @for (vehicle of facade.vehicles(); track vehicle.vehicleId) {
+          <li [attr.data-vehicle-id]="vehicle.vehicleId">
+            <dl>
+              <dt>{{ 'portal.documents.vehicles.plate' | stynxTranslate }}</dt>
+              <dd data-plate>{{ vehicle.plate }}</dd>
+              @if (vehicle.model; as model) {
+                <dt>
+                  {{ 'portal.documents.vehicles.model' | stynxTranslate }}
+                </dt>
+                <dd data-model>{{ model }}</dd>
+              }
+            </dl>
+            <a
+              [routerLink]="crlvRoute(vehicle)"
+              [attr.routerLink]="crlvRoute(vehicle)"
+              >{{ 'portal.documents.crlv.title' | stynxTranslate }}</a
+            >
+          </li>
+        }
+      </ol>
+    }
+  `,
+})
+export class VehiclesPageComponent {
+  readonly facade = inject(DocumentosFacade);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  constructor() {
+    void this.facade.loadVehicles();
+    afterRenderEffect(() => {
+      const status = this.facade.vehiclesStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'empty')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  crlvRoute(vehicle: Vehicle): string {
+    return `${VEHICLES_ROUTE_PREFIX}${vehicle.vehicleId}${CRLV_ROUTE_SUFFIX}`;
+  }
+
+  reload(): void {
+    void this.facade.loadVehicles();
+  }
+}
diff --git a/apps/portal/web/src/app/features/exames/components/junta-medica-form.component.ts b/apps/portal/web/src/app/features/exames/components/junta-medica-form.component.ts
new file mode 100644
index 00000000..57406915
--- /dev/null
+++ b/apps/portal/web/src/app/features/exames/components/junta-medica-form.component.ts
@@ -0,0 +1,107 @@
+// JuntaMedicaForm (contrato CTG-0003c §6 junta; [UC-PORTAL-014]): o passo 2 projetado no
+// `ServiceWizard` — motivo do pedido (com o hint da ficha) e os anexos que o sustentam
+// (`AttachmentUploader` com o checklist `requirements[]` do servidor). Os valores sobem pelo
+// `model` `values` (forma de `JuntaMedicaSchema`: `examId`, `reason`, `attachmentIds`); erros de
+// campo (`fields[]`) marcam os controles pela diretiva. Nenhum prazo é calculado aqui — a janela é
+// do servidor (`BOARD_REQUEST_WINDOW_CLOSED`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  model,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import {
+  ATTACHMENT_ACCEPT,
+  ATTACHMENT_MAX_BYTES,
+} from '../../../forms/attachments';
+import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
+
+export interface JuntaMedicaValues {
+  readonly examId?: string;
+  readonly reason: string;
+  readonly attachmentIds: readonly string[];
+}
+
+@Component({
+  selector: 'portal-junta-medica-form',
+  imports: [
+    StynxTranslatePipe,
+    PortalFieldErrorsDirective,
+    AttachmentUploaderComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <form
+      class="portal-junta-form"
+      [portalFieldErrors]="fields()"
+      (submit)="$event.preventDefault()"
+    >
+      <label>
+        <span>{{ 'portal.forms.junta_medica.motivo' | stynxTranslate }}</span>
+        <textarea
+          name="reason"
+          rows="6"
+          [value]="current().reason"
+          [disabled]="disabled()"
+          (input)="patchReason($event)"
+        ></textarea>
+      </label>
+      <p data-hint>{{ 'portal.forms.junta_medica.hint' | stynxTranslate }}</p>
+      <p id="reason-error" data-field-error>
+        @if (fields().includes('reason')) {
+          {{ 'portal.errors.validation_failed' | stynxTranslate }}
+        }
+      </p>
+      @if (requestId(); as requestId) {
+        <portal-attachment-uploader
+          [requestId]="requestId"
+          [accept]="accept"
+          [maxBytes]="maxBytes"
+          [checklist]="requirements()"
+          hintKey="portal.forms.junta_medica.anexos"
+          [disabled]="disabled()"
+          [attachmentIds]="current().attachmentIds"
+          (attachmentIdsChange)="setAttachments($event)"
+        />
+      }
+    </form>
+  `,
+})
+export class JuntaMedicaFormComponent {
+  /** `targetId` do alvo (`examId`), fixado pela página; entra nos valores quando presente. */
+  readonly examId = input<string | null>(null);
+  /** `ServiceWizardStore.requirements()` → checklist do uploader. */
+  readonly requirements = input<readonly string[]>([]);
+  /** `ServiceWizardStore.requestId()` (anexos só com pedido criado). */
+  readonly requestId = input<string | null>(null);
+  /** `fields[]` do erro 400/422 → diretiva. */
+  readonly fields = input<readonly string[]>([]);
+  readonly disabled = input(false);
+  /** `ServiceWizardComponent.values` (duas vias). */
+  readonly values = model<Record<string, unknown> | null>(null);
+
+  readonly accept = ATTACHMENT_ACCEPT;
+  readonly maxBytes = ATTACHMENT_MAX_BYTES;
+  readonly current = computed<JuntaMedicaValues>(() => {
+    const examId = this.examId();
+    return {
+      ...(examId ? { examId } : {}),
+      reason: '',
+      attachmentIds: [],
+      ...(this.values() ?? {}),
+    };
+  });
+
+  patchReason(event: Event): void {
+    const reason = (event.target as HTMLTextAreaElement).value;
+    this.values.set({ ...this.current(), reason });
+  }
+
+  setAttachments(attachmentIds: readonly string[]): void {
+    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
+  }
+}
diff --git a/apps/portal/web/src/app/features/exames/exames.facade.ts b/apps/portal/web/src/app/features/exames/exames.facade.ts
new file mode 100644
index 00000000..cdc32a70
--- /dev/null
+++ b/apps/portal/web/src/app/features/exames/exames.facade.ts
@@ -0,0 +1,153 @@
+// ExamesFacade (contrato CTG-0003c §3.5; T-20, junta; [RN-PEC-105]; [UC-PORTAL-014]; OD-P19):
+// os exames de aptidão (`GET exams`) e o detalhe (`GET exams/{id}`, vínculo `exam`). O
+// `legalLabel` é exibido TAL COMO o servidor manda — o cliente não mapeia, não renomeia e não
+// contém os rótulos legais em código; a janela da junta é decidida pelo servidor (`boardDueOn`
+// presente → ação disponível; ausente → nenhuma). O contexto da página de junta segue o padrão do
+// par 2 (`WizardTarget` + retomada + disponibilidade do serviço), com o alvo fixado ao entrar —
+// o detalhe só acrescenta o prazo (`DeadlineCard`). Nenhum cálculo de prazo aqui.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+  type PresentErrorOptions,
+} from '../../core/error-boundary';
+import { ResumeService } from '../../core/resume.service';
+import {
+  ServiceCatalogFacade,
+  type ServiceAvailability,
+} from '../../core/service-catalog.facade';
+import { PortalClient } from '../../data/portal.client';
+import type { ExamDetail, ExamSummary } from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type {
+  WizardResumeDraft,
+  WizardTarget,
+} from '../../shared/service-wizard.store';
+import { resumePointFor } from '../../shared/wizard-resume';
+
+/** Prazo da junta como o `DeadlineCard` o recebe (data do servidor; `kind` = token do prazo). */
+export interface BoardDeadline {
+  readonly kind: 'junta';
+  readonly dueOn: string;
+  readonly ownedBy: 'citizen';
+}
+
+const SERVICE_KEY = 'junta_medica';
+
+/**
+ * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
+ * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
+ * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
+ */
+function presentRead(
+  error: unknown,
+  options?: PresentErrorOptions,
+): ErrorPresentation {
+  const presentation = presentError(error, options);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+@Injectable()
+export class ExamesFacade {
+  private readonly client = inject(PortalClient);
+  private readonly resumeService = inject(ResumeService);
+  private readonly catalog = inject(ServiceCatalogFacade);
+
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly itemsState = signal<readonly ExamSummary[]>([]);
+  private readonly detailStatusState = signal<ReadStatus>('idle');
+  private readonly detailState = signal<ExamDetail | null>(null);
+  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
+  private readonly targetState = signal<WizardTarget | null>(null);
+  private readonly resumeState = signal<WizardResumeDraft | null>(null);
+  private readonly availabilityState = signal<ServiceAvailability | null>(null);
+  private listSequence = 0;
+  private detailSequence = 0;
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly items = this.itemsState.asReadonly();
+  readonly detailStatus = this.detailStatusState.asReadonly();
+  readonly detail = this.detailState.asReadonly();
+  readonly detailError = this.detailErrorState.asReadonly();
+  /** `{ serviceKey: 'junta_medica', targetKind: 'exam', targetId: examId }`. */
+  readonly target = this.targetState.asReadonly();
+  /** `resumePointFor(...)` do par 2. */
+  readonly resume = this.resumeState.asReadonly();
+  /** `ServiceCatalogFacade.availability('junta_medica')`. */
+  readonly availability = this.availabilityState.asReadonly();
+  /** `boardDueOn` do servidor → `[{ kind: 'junta', dueOn, ownedBy: 'citizen' }]`; ausente → `[]`. */
+  readonly deadlines = computed<readonly BoardDeadline[]>(() => {
+    const boardDueOn = this.detailState()?.boardDueOn ?? null;
+    return boardDueOn
+      ? [{ kind: 'junta', dueOn: boardDueOn, ownedBy: 'citizen' }]
+      : [];
+  });
+
+  /** GET exams; `empty` → `portal.screens.t20.state.vazio`. */
+  async loadList(): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    const sequence = ++this.listSequence;
+    try {
+      const page = await this.client.listExams();
+      if (sequence !== this.listSequence) return;
+      const items = page.items ?? [];
+      this.itemsState.set(items);
+      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.listSequence) return;
+      const presentation = presentRead(error);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /** GET exams/{id}; entitlement { kind: 'exam', id }. */
+  async loadDetail(examId: string): Promise<void> {
+    this.detailStatusState.set('loading');
+    this.detailErrorState.set(null);
+    const sequence = ++this.detailSequence;
+    try {
+      const detail = await this.client.getExam(examId);
+      if (sequence !== this.detailSequence) return;
+      this.detailState.set(detail);
+      this.detailStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.detailSequence) return;
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'exam', id: examId },
+      });
+      this.detailState.set(null);
+      this.detailErrorState.set(presentation);
+      this.detailStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /**
+   * Contexto da página de junta (padrão `ActFacadeState`, CTG-0003b §3.4): o alvo é fixado de
+   * imediato a partir do `examId`; a disponibilidade e o detalhe (prazo) chegam em seguida.
+   */
+  async loadBoardContext(examId: string, resumeRoute: string): Promise<void> {
+    const target: WizardTarget = {
+      serviceKey: SERVICE_KEY,
+      targetKind: 'exam',
+      targetId: examId,
+    };
+    this.targetState.set(target);
+    this.resumeState.set(
+      resumePointFor(this.resumeService, resumeRoute, target),
+    );
+    const detail = this.loadDetail(examId);
+    try {
+      this.availabilityState.set(await this.catalog.availability(SERVICE_KEY));
+    } catch {
+      this.availabilityState.set(null);
+    }
+    await detail;
+  }
+}
diff --git a/apps/portal/web/src/app/features/exames/exames.routes.ts b/apps/portal/web/src/app/features/exames/exames.routes.ts
index d422d084..81a39268 100644
--- a/apps/portal/web/src/app/features/exames/exames.routes.ts
+++ b/apps/portal/web/src/app/features/exames/exames.routes.ts
@@ -1,7 +1,18 @@
-// Módulo `exames` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('exames', { '<path>': { component, title } })`.
+// Módulo `exames` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-20, junta).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { ExamListPageComponent } from './pages/exam-list.page';
+import { JuntaMedicaPageComponent } from './pages/junta-medica.page';

-export const EXAMES_ROUTES: Routes = moduleRoutes('exames');
+export const EXAMES_ROUTES: Routes = moduleRoutes('exames', {
+  exames: {
+    component: ExamListPageComponent,
+    title: 'portal.screens.t20.title',
+  },
+  'exames/:examId/junta/nova': {
+    component: JuntaMedicaPageComponent,
+    title: 'portal.services.junta_medica',
+  },
+});
diff --git a/apps/portal/web/src/app/features/exames/pages/exam-list.page.ts b/apps/portal/web/src/app/features/exames/pages/exam-list.page.ts
new file mode 100644
index 00000000..e00cebf0
--- /dev/null
+++ b/apps/portal/web/src/app/features/exames/pages/exam-list.page.ts
@@ -0,0 +1,216 @@
+// T-20 Meu resultado de exame de aptidão (contrato CTG-0003c §6; ficha IU-PORTAL-T20;
+// [RN-PEC-105]; [UC-PORTAL-014]; [JRN-PORTAL-008]): cada exame mostra o rótulo legal TAL COMO o
+// servidor manda (`legalLabel`, também em `data-token`), a explicação cidadã SÓ quando o catálogo
+// tem `portal.screens.t20.result.<legalLabel>` (nunca inventada), a validade como data, e — só
+// quando o servidor envia `boardDueOn` — o prazo (`DeadlineCard`) e o link para requerer a junta.
+// "Entrevista devolutiva" não tem comando ([DIVERGE-16]) → `aria-disabled` + indisponível nesta
+// versão. `EXAM_PROCESSING` é informativo (`role="status"`) com a data esperada do servidor.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranEmptyStateComponent,
+  DetranLoadingStateComponent,
+  StynxI18nService,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ExamesFacade } from '../exames.facade';
+
+const SERVICE_KEY = 'consulta_exame';
+const CHARTER_ROUTE = '/carta-servicos';
+const EXAM_ROUTE_PREFIX = '/exames/';
+const BOARD_ROUTE_SUFFIX = '/junta/nova';
+const RESULT_KEY_PREFIX = `portal.screens.t20.result.`;
+const EXAM_PROCESSING_CODE = 'PORTAL.EXAM_PROCESSING';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t20.state.carregando',
+  empty: 'portal.screens.t20.state.vazio',
+  recoverable: 'portal.screens.t20.state.erro_recuperavel',
+  unavailable: 'portal.screens.t20.state.indisponivel',
+} as const;
+
+@Component({
+  selector: 'portal-exam-list-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+  ],
+  providers: [ExamesFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-20',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t20.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t20.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (processing(); as processing) {
+        <p data-processing>
+          {{ stateKeys.recoverable | stynxTranslate }}
+          @if (processing.expectedBy; as expectedBy) {
+            <time [attr.datetime]="expectedBy">{{
+              expectedBy | stynxIntlDate
+            }}</time>
+          }
+        </p>
+      }
+      @if (facade.status() === 'unavailable') {
+        <p data-state-text>{{ stateKeys.unavailable | stynxTranslate }}</p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (!processing() && facade.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.status() === 'empty') {
+      <detran-empty-state
+        [title]="stateKeys.empty | stynxTranslate"
+        [message]="stateKeys.empty | stynxTranslate"
+      />
+      <p>
+        <a [routerLink]="charterRoute" [attr.routerLink]="charterRoute">{{
+          'portal.common.link.carta' | stynxTranslate
+        }}</a>
+      </p>
+    }
+
+    @if (facade.items().length > 0) {
+      <ol data-exam-list class="portal-exam-list" aria-live="polite">
+        @for (exam of facade.items(); track exam.examId) {
+          <li
+            [attr.data-exam-id]="exam.examId"
+            [attr.data-token]="exam.legalLabel"
+          >
+            <p data-legal-label>{{ exam.legalLabel }}</p>
+            @if (resultKey(exam.legalLabel); as key) {
+              <p data-result-explanation>{{ key | stynxTranslate }}</p>
+            }
+            @if (exam.validUntil; as validUntil) {
+              <p data-valid-until>
+                <span>{{
+                  'portal.screens.t20.field.validade' | stynxTranslate
+                }}</span>
+                <time [attr.datetime]="validUntil">{{
+                  validUntil | stynxIntlDate
+                }}</time>
+              </p>
+            }
+            @if (exam.boardDueOn; as boardDueOn) {
+              <portal-deadline-card
+                [dueOn]="boardDueOn"
+                ownedBy="citizen"
+                kind="junta"
+                labelKey="portal.screens.t20.field.prazo_junta"
+              />
+              <a
+                [routerLink]="boardRoute(exam.examId)"
+                [attr.routerLink]="boardRoute(exam.examId)"
+                data-board-request
+                >{{
+                  'portal.screens.t20.cmd.requerer_junta' | stynxTranslate
+                }}</a
+              >
+            }
+            <button
+              type="button"
+              data-interview
+              aria-disabled="true"
+              [attr.title]="
+                'portal.states.unavailable_in_version' | stynxTranslate
+              "
+            >
+              {{ 'portal.screens.t20.cmd.entrevista' | stynxTranslate }}
+            </button>
+            <span data-interview-unavailable>
+              {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+            </span>
+          </li>
+        }
+      </ol>
+    }
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class ExamListPageComponent {
+  readonly facade = inject(ExamesFacade);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly charterRoute = CHARTER_ROUTE;
+
+  /** `EXAM_PROCESSING { expectedBy }` (info): estado, não erro. */
+  readonly processing = computed<{ readonly expectedBy: string | null } | null>(
+    () => {
+      const error = this.facade.error();
+      if (error?.code !== EXAM_PROCESSING_CODE) return null;
+      const expectedBy = error.context['expectedBy'];
+      return { expectedBy: typeof expectedBy === 'string' ? expectedBy : null };
+    },
+  );
+
+  constructor() {
+    void this.facade.loadList();
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'empty')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  /** Explicação SÓ se o catálogo tiver a chave para este rótulo legal — nunca mapeado nem inventado. */
+  resultKey(legalLabel: string): string | null {
+    const key = `${RESULT_KEY_PREFIX}${legalLabel}`;
+    return key in this.i18n.catalog() ? key : null;
+  }
+
+  boardRoute(examId: string): string {
+    return `${EXAM_ROUTE_PREFIX}${examId}${BOARD_ROUTE_SUFFIX}`;
+  }
+
+  reload(): void {
+    void this.facade.loadList();
+  }
+}
diff --git a/apps/portal/web/src/app/features/exames/pages/junta-medica.page.ts b/apps/portal/web/src/app/features/exames/pages/junta-medica.page.ts
new file mode 100644
index 00000000..3cccea82
--- /dev/null
+++ b/apps/portal/web/src/app/features/exames/pages/junta-medica.page.ts
@@ -0,0 +1,187 @@
+// /exames/:examId/junta/nova (contrato CTG-0003c §6; [UC-PORTAL-014]; [DIVERGE-17]): o pedido de
+// junta médica ou psicológica pelo ciclo comum — `ServiceWizard` com `JuntaMedicaSchema` /
+// `JUNTA_MEDICA_GATE` e o `JuntaMedicaForm` projetado no passo 2 — sobre o exame da rota
+// (`ExamesFacade.loadBoardContext`: alvo fixado ao entrar; prazo `boardDueOn` como `DeadlineCard`
+// quando o servidor o envia). O pedido só nasce por ato do cidadão (botão de início; a retomada
+// do `ResumeService` restaura sem novo `POST`); `422 BOARD_REQUEST_WINDOW_CLOSED { dueOn }` é o
+// servidor decidindo a janela — banner, nunca cálculo local. Canal alternativo em todos os passos.
+// Nesta rodada o serviço está ausente do catálogo (OD-P19/A4): o guarda redireciona antes.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute, Router } from '@angular/router';
+import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import {
+  JUNTA_MEDICA_GATE,
+  JuntaMedicaSchema,
+} from '../../../forms/junta-medica.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { JuntaMedicaFormComponent } from '../components/junta-medica-form.component';
+import { ExamesFacade } from '../exames.facade';
+
+const EXAM_PARAM = 'examId';
+const SERVICE_KEY = 'junta_medica';
+
+@Component({
+  selector: 'portal-junta-medica-page',
+  imports: [
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    JuntaMedicaFormComponent,
+  ],
+  providers: [ExamesFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.data-exam-id]': 'examId()',
+    '[attr.data-status]': 'facade.detailStatus()',
+    '[attr.aria-busy]': 'facade.detailStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.services.junta_medica' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.detailStatus() === 'loading' || wizardLoading()) {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.detailError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @for (deadline of facade.deadlines(); track deadline.kind) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        labelKey="portal.screens.t20.field.prazo_junta"
+      />
+    }
+
+    @if (facade.target(); as target) {
+      @if (
+        wizard.store.step() === 'elegibilidade' &&
+        wizard.store.status() === 'idle'
+      ) {
+        <p>
+          <button
+            type="button"
+            class="portal-primary"
+            data-cmd="submit"
+            (click)="start()"
+          >
+            {{ 'portal.screens.t20.cmd.requerer_junta' | stynxTranslate }}
+          </button>
+        </p>
+      }
+      <portal-service-wizard
+        #wizard
+        [target]="target"
+        [schema]="schema"
+        [gate]="gate"
+        [resumeRoute]="resumeRoute()"
+      >
+        <portal-junta-medica-form
+          [examId]="examId()"
+          [requirements]="wizard.store.requirements()"
+          [requestId]="wizard.store.requestId()"
+          [fields]="wizard.store.error()?.fields ?? []"
+          [disabled]="wizard.store.busy()"
+          [values]="wizard.values()"
+          (valuesChange)="wizard.values.set($event)"
+        />
+      </portal-service-wizard>
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class JuntaMedicaPageComponent {
+  readonly facade = inject(ExamesFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private resumed = false;
+  private focused = false;
+
+  readonly examId = signal('');
+  readonly schema = JuntaMedicaSchema;
+  readonly gate = JUNTA_MEDICA_GATE;
+  readonly serviceKey = SERVICE_KEY;
+  readonly resumeRoute = computed(() => this.router.url);
+
+  readonly wizardLoading = computed(
+    () => this.wizard()?.store.status() === 'loading',
+  );
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const examId = params.get(EXAM_PARAM) ?? '';
+        this.examId.set(examId);
+        this.resumed = false;
+        this.focused = false;
+        void this.facade.loadBoardContext(examId, this.router.url);
+      });
+    // Ponto de retomada ([UC-PORTAL-019] AC-4): restaura sem novo POST, uma única vez.
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const resume = this.facade.resume();
+      untracked(() => {
+        if (!wizard || this.resumed || !resume) return;
+        this.resumed = true;
+        wizard.resumeFrom(resume);
+      });
+    });
+    afterRenderEffect(() => {
+      const target = this.facade.target();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && target) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  /** Início do pedido só por ato do cidadão (o passo 1 do wizard também o oferece). */
+  start(): void {
+    void this.wizard()?.store.start();
+  }
+
+  reload(): void {
+    void this.facade.loadBoardContext(this.examId(), this.router.url);
+  }
+}
diff --git a/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts b/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts
new file mode 100644
index 00000000..98f35c1d
--- /dev/null
+++ b/apps/portal/web/src/app/features/notificacoes/notificacoes.facade.ts
@@ -0,0 +1,322 @@
+// NotificacoesFacade (contrato CTG-0003c §3.2; T-12, preferências, T-09): a caixa do cidadão
+// (`GET inbox`, ordem do servidor — nunca reordenada nem filtrada por prazo; a ciência ficta de
+// cada item é exibida TAL COMO VEIO, [DIVERGE-4]), a ciência (`POST inbox/{id}/read`), as
+// preferências (`PUT preferences` com `If-Match` sem origem nesta rodada → 428 e 422 apresentados
+// como "indisponível", OD-P87/OD-P38) e a adesão ao SNE (`GET/POST/DELETE sne/enrollment`). O tempo
+// real (`RealtimeService.on('inbox.item')` e `tick`) só dispara releituras — a falha do tempo real
+// nunca derruba a lista. Erros só pelo `ErrorBoundary`; nenhum relógio nem armazenamento local aqui.
+//
+// Semântica: as leituras resolvem quando a resposta chegou aos signals (número de sequência
+// descarta respostas fora de ordem); os comandos resolvem com a resposta e só então despacham a
+// releitura. `CommandStatus` é o do par 2, reexportado (§3.1).
+import {
+  DestroyRef,
+  Injectable,
+  computed,
+  inject,
+  signal,
+} from '@angular/core';
+import { merge } from 'rxjs';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+  type PresentErrorOptions,
+} from '../../core/error-boundary';
+import {
+  RealtimeService,
+  type RealtimeStatus,
+} from '../../core/realtime.service';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  InboxItem,
+  InboxListPage,
+  InboxListQuery,
+  InboxReadResult,
+  PreferencesUpdateBody,
+  PreferencesUpdated,
+  SneCancelled,
+  SneEnrolled,
+  SneEnrollment,
+  SneEnrollmentCancelBody,
+  SneEnrollmentCreateBody,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type { CommandStatus } from '../processos/processos.facade';
+
+export type { CommandStatus } from '../processos/processos.facade';
+
+const FIRST_PAGE = 1;
+const SNE_ROUTE = '/sne';
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+const INBOX_ITEM_KIND = 'inbox_item';
+/** §2.3/§3.2: 428 e 422 de `PUT preferences` são "indisponível", nunca "recarregue". */
+const PREFERENCES_UNAVAILABLE_CODES: ReadonlySet<string> = new Set([
+  'PORTAL.SERVICE_UNAVAILABLE',
+  'PORTAL.IF_MATCH_REQUIRED',
+]);
+/** §3.2 (e): estado incompatível → releitura da adesão + banner. */
+const SNE_RELOAD_CODES: ReadonlySet<string> = new Set([
+  'PORTAL.SNE_ALREADY_ENROLLED',
+  'PORTAL.SNE_NOT_ENROLLED',
+]);
+
+/**
+ * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
+ * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
+ * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
+ */
+function presentRead(
+  error: unknown,
+  options?: PresentErrorOptions,
+): ErrorPresentation {
+  const presentation = presentError(error, options);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+/** 201/200 de adesão/cancelamento têm a mesma forma de `GET sne/enrollment` (canal como string no gerado). */
+function asEnrollment(body: SneEnrolled | SneCancelled): SneEnrollment {
+  return body as unknown as SneEnrollment;
+}
+
+@Injectable()
+export class NotificacoesFacade {
+  private readonly client = inject(PortalClient);
+  private readonly realtimeService = inject(RealtimeService);
+  private readonly destroyRef = inject(DestroyRef);
+
+  // T-12
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly queryState = signal<InboxListQuery>({});
+  private readonly pageState = signal<InboxListPage | null>(null);
+  private readonly readStatusState = signal<CommandStatus>('idle');
+  private readonly readErrorState = signal<ErrorPresentation | null>(null);
+  // preferências
+  private readonly preferencesStatusState = signal<CommandStatus>('idle');
+  private readonly preferencesErrorState = signal<ErrorPresentation | null>(
+    null,
+  );
+  private readonly ifMatchState = signal<string | null>(null);
+  // T-09
+  private readonly enrollmentStatusState = signal<ReadStatus>('idle');
+  private readonly enrollmentState = signal<SneEnrollment | null>(null);
+  private readonly enrollmentErrorState = signal<ErrorPresentation | null>(
+    null,
+  );
+  private readonly sneCommandStatusState = signal<CommandStatus>('idle');
+  private readonly sneCommandErrorState = signal<ErrorPresentation | null>(
+    null,
+  );
+  private listSequence = 0;
+  private enrollmentSequence = 0;
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly query = this.queryState.asReadonly();
+  readonly page = this.pageState.asReadonly();
+  /** `page()?.items ?? []` (asserção); ordem do servidor. */
+  readonly items = computed<readonly InboxItem[]>(
+    () => (this.pageState()?.items as readonly InboxItem[] | undefined) ?? [],
+  );
+  /** SÓ da página lida — o servidor não dá "total não lidas" ([DIVERGE-25]). */
+  readonly unreadCount = computed(
+    () => this.items().filter((item) => item.readOn === null).length,
+  );
+  /** `RealtimeService.status()`. */
+  readonly realtime = computed<RealtimeStatus>(() =>
+    this.realtimeService.status(),
+  );
+  readonly realtimeError = computed(() => this.realtimeService.lastError());
+  readonly readStatus = this.readStatusState.asReadonly();
+  readonly readError = this.readErrorState.asReadonly();
+  readonly preferencesStatus = this.preferencesStatusState.asReadonly();
+  readonly preferencesError = this.preferencesErrorState.asReadonly();
+  /** Sempre `null` nesta rodada (OD-P87). */
+  readonly ifMatch = this.ifMatchState.asReadonly();
+  readonly enrollmentStatus = this.enrollmentStatusState.asReadonly();
+  readonly enrollment = this.enrollmentState.asReadonly();
+  readonly enrollmentError = this.enrollmentErrorState.asReadonly();
+  readonly sneCommandStatus = this.sneCommandStatusState.asReadonly();
+  readonly sneCommandError = this.sneCommandErrorState.asReadonly();
+
+  constructor() {
+    // SSE `inbox.item` e `tick` do polling → releitura da caixa (§3.2 d). A assinatura conta
+    // como consumidor do tempo real; encerra com a página.
+    const subscription = merge(
+      this.realtimeService.on('inbox.item'),
+      this.realtimeService.tick,
+    ).subscribe(() => {
+      if (this.statusState() !== 'idle') void this.loadList();
+    });
+    this.destroyRef.onDestroy(() => subscription.unsubscribe());
+  }
+
+  /** GET inbox; `empty` quando `total === 0`. */
+  async loadList(query: InboxListQuery = this.queryState()): Promise<void> {
+    this.queryState.set(query);
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    const sequence = ++this.listSequence;
+    try {
+      const page = await this.client.listInbox(query);
+      if (sequence !== this.listSequence) return;
+      this.pageState.set(page);
+      this.statusState.set(page.total === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.listSequence) return;
+      const presentation = presentRead(error);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /** `page` volta a 1 quando `kind`/`read` mudam. */
+  setQuery(patch: Partial<InboxListQuery>): Promise<void> {
+    const filterChanged = 'kind' in patch || 'read' in patch;
+    const next: InboxListQuery = {
+      ...this.queryState(),
+      ...patch,
+      ...(filterChanged && patch.page === undefined
+        ? { page: FIRST_PAGE }
+        : {}),
+    };
+    for (const key of Object.keys(next) as (keyof InboxListQuery)[]) {
+      if (next[key] === undefined) delete next[key];
+    }
+    return this.loadList(next);
+  }
+
+  /** POST inbox/{id}/read; 200 → item substituído localmente e `loadList()` despachado. */
+  async markRead(inboxItemId: string): Promise<InboxReadResult | null> {
+    this.readStatusState.set('submitting');
+    this.readErrorState.set(null);
+    try {
+      const result = await this.client.markInboxRead(inboxItemId);
+      const page = this.pageState();
+      if (page) {
+        this.pageState.set({
+          ...page,
+          items: page.items.map((item) =>
+            item.id === inboxItemId
+              ? { ...item, readOn: result.body.readOn }
+              : item,
+          ),
+        });
+      }
+      this.readStatusState.set('done');
+      void this.loadList();
+      return result.body;
+    } catch (error: unknown) {
+      const presentation = presentRead(error);
+      this.readErrorState.set(presentation);
+      this.readStatusState.set(commandStatusOf(presentation));
+      // Item desapareceu da caixa: a lista é relida (§6 T-12).
+      if (
+        presentation.code === NOT_FOUND_CODE &&
+        presentation.context['kind'] === INBOX_ITEM_KIND
+      ) {
+        void this.loadList();
+      }
+      return null;
+    }
+  }
+
+  /** PUT preferences com `If-Match = ifMatch()`; 428 e 422 SERVICE_UNAVAILABLE → 'unavailable'. */
+  async savePreferences(
+    body: PreferencesUpdateBody,
+  ): Promise<PreferencesUpdated | null> {
+    this.preferencesStatusState.set('submitting');
+    this.preferencesErrorState.set(null);
+    try {
+      const result = await this.client.updatePreferences(
+        body,
+        this.ifMatchState(),
+      );
+      if (result.etag !== null) this.ifMatchState.set(result.etag);
+      this.preferencesStatusState.set('done');
+      return result.body;
+    } catch (error: unknown) {
+      const presentation = presentRead(error);
+      this.preferencesErrorState.set(presentation);
+      this.preferencesStatusState.set(
+        presentation.code !== null &&
+          PREFERENCES_UNAVAILABLE_CODES.has(presentation.code)
+          ? 'unavailable'
+          : commandStatusOf(presentation),
+      );
+      return null;
+    }
+  }
+
+  /** GET sne/enrollment (200 sempre; `enrolled=false` sem linha). */
+  async loadEnrollment(): Promise<void> {
+    this.enrollmentStatusState.set('loading');
+    this.enrollmentErrorState.set(null);
+    const sequence = ++this.enrollmentSequence;
+    try {
+      const enrollment = await this.client.getSneEnrollment();
+      if (sequence !== this.enrollmentSequence) return;
+      this.enrollmentState.set(enrollment);
+      this.enrollmentStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.enrollmentSequence) return;
+      const presentation = presentRead(error, { resumeRoute: SNE_ROUTE });
+      this.enrollmentErrorState.set(presentation);
+      this.enrollmentStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  /** POST sne/enrollment; 201 → adesão atualizada; 403 ASSURANCE_INSUFFICIENT → `elevation` com retomar=/sne. */
+  async enroll(body: SneEnrollmentCreateBody): Promise<SneEnrolled | null> {
+    this.sneCommandStatusState.set('submitting');
+    this.sneCommandErrorState.set(null);
+    try {
+      const result = await this.client.enrollSne(body);
+      this.enrollmentState.set(asEnrollment(result.body));
+      this.enrollmentStatusState.set('ready');
+      this.sneCommandStatusState.set('done');
+      return result.body;
+    } catch (error: unknown) {
+      this.failSne(error);
+      return null;
+    }
+  }
+
+  /** DELETE sne/enrollment; 200 → adesão atualizada (`enrolled=false`, `cancelledAt`). */
+  async cancel(body?: SneEnrollmentCancelBody): Promise<SneCancelled | null> {
+    this.sneCommandStatusState.set('submitting');
+    this.sneCommandErrorState.set(null);
+    try {
+      const result = await this.client.cancelSne(body);
+      this.enrollmentState.set(asEnrollment(result.body));
+      this.enrollmentStatusState.set('ready');
+      this.sneCommandStatusState.set('done');
+      return result.body;
+    } catch (error: unknown) {
+      this.failSne(error);
+      return null;
+    }
+  }
+
+  private failSne(error: unknown): void {
+    const presentation = presentRead(error, { resumeRoute: SNE_ROUTE });
+    this.sneCommandErrorState.set(presentation);
+    this.sneCommandStatusState.set(commandStatusOf(presentation));
+    if (presentation.code !== null && SNE_RELOAD_CODES.has(presentation.code)) {
+      void this.loadEnrollment();
+    }
+  }
+}
+
+/** `CommandStatus` de uma apresentação (§3.1): `unavailable` | `offline` | `error`. */
+export function commandStatusOf(
+  presentation: ErrorPresentation,
+): CommandStatus {
+  const status = readStatusFor(presentation);
+  if (status === 'unavailable') return 'unavailable';
+  if (status === 'offline') return 'offline';
+  return 'error';
+}
diff --git a/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts b/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts
index 07769e50..e4225d27 100644
--- a/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts
+++ b/apps/portal/web/src/app/features/notificacoes/notificacoes.routes.ts
@@ -1,7 +1,20 @@
-// Módulo `notificacoes` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('notificacoes', { '<path>': { component, title } })`.
+// Módulo `notificacoes` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-12, preferências, T-09).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { InboxPageComponent } from './pages/inbox.page';
+import { PreferencesPageComponent } from './pages/preferences.page';
+import { SnePageComponent } from './pages/sne.page';

-export const NOTIFICACOES_ROUTES: Routes = moduleRoutes('notificacoes');
+export const NOTIFICACOES_ROUTES: Routes = moduleRoutes('notificacoes', {
+  notificacoes: {
+    component: InboxPageComponent,
+    title: 'portal.screens.t12.title',
+  },
+  'notificacoes/preferencias': {
+    component: PreferencesPageComponent,
+    title: 'portal.notifications.preferences.title',
+  },
+  sne: { component: SnePageComponent, title: 'portal.screens.t09.title' },
+});
diff --git a/apps/portal/web/src/app/features/notificacoes/pages/inbox.page.ts b/apps/portal/web/src/app/features/notificacoes/pages/inbox.page.ts
new file mode 100644
index 00000000..e94f782e
--- /dev/null
+++ b/apps/portal/web/src/app/features/notificacoes/pages/inbox.page.ts
@@ -0,0 +1,218 @@
+// T-12 Suas notificações (contrato CTG-0003c §6; ficha IU-PORTAL-T12; [RN-PORTAL-124]): a caixa do
+// cidadão com filtros por tipo e leitura (vão ao servidor), a lista semântica
+// (`NotificationList`), paginação do kit (0-based ↔ 1-based, A9(b)) e a contagem de não lidas da
+// página em `aria-live`. O tempo real (`RealtimeService`) é iniciado ao montar; degradado
+// (`polling`/erro) vira um aviso `role="status"` na região de estado e a lista permanece — nunca
+// um erro bloqueante. Ciência (`markRead`) para itens SNE é a mesma ação; nada distingue além do
+// `data-source`. Prazos são `DeadlineCard`; a ciência ficta é a data recebida; tokens só em `data-*`.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import {
+  DetranEmptyStateComponent,
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxPaginationComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { RealtimeService } from '../../../core/realtime.service';
+import type { InboxKind } from '../../../data/portal-read.models';
+import { NotificationListComponent } from '../../../shared/notification-list.component';
+import { NotificacoesFacade } from '../notificacoes.facade';
+
+const KINDS: readonly InboxKind[] = ['acao_necessaria', 'informativo'];
+/** Filtro de leitura: "todas" ou só as não lidas (`read=false`). O rótulo da opção `read=true`
+ *  ("só as lidas") não consta do catálogo nem de OD-P89 — a opção fica fora até a chave existir. */
+const UNREAD_FILTER = 'false';
+const KIND_KEY_PREFIX = `portal.notifications.kind.`;
+const ALL_OPTION = '';
+
+@Component({
+  selector: 'portal-inbox-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    StynxPaginationComponent,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    NotificationListComponent,
+  ],
+  providers: [NotificacoesFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-12',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.data-realtime]': 'facade.realtime()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t12.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (realtimeDegraded()) {
+        <stynx-banner
+          tone="warning"
+          [message]="'portal.screens.t12.state.sem_tempo_real' | stynxTranslate"
+        />
+      }
+      @if (facade.status() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+    </div>
+
+    <form class="portal-inbox-filters" (submit)="$event.preventDefault()">
+      <label>
+        <span>{{
+          'portal.screens.t12.cmd.filtrar_tipo' | stynxTranslate
+        }}</span>
+        <select name="kind" (change)="onKindChange($event)">
+          <option [value]="allOption" [selected]="!facade.query().kind">
+            {{ 'portal.screens.t12.cmd.todos' | stynxTranslate }}
+          </option>
+          @for (kind of kinds; track kind) {
+            <option [value]="kind" [selected]="facade.query().kind === kind">
+              {{ kindKey(kind) | stynxTranslate }}
+            </option>
+          }
+        </select>
+      </label>
+      <label>
+        <span>{{
+          'portal.screens.t12.cmd.filtrar_lidas' | stynxTranslate
+        }}</span>
+        <select name="read" (change)="onReadChange($event)">
+          <option [value]="allOption" [selected]="!facade.query().read">
+            {{ 'portal.screens.t12.cmd.todos' | stynxTranslate }}
+          </option>
+          <option
+            [value]="unreadFilter"
+            [selected]="facade.query().read === unreadFilter"
+          >
+            {{
+              'portal.screens.t12.field.nao_lidas'
+                | stynxTranslate: { count: facade.unreadCount() }
+            }}
+          </option>
+        </select>
+      </label>
+    </form>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.readError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    <p aria-live="polite" data-unread>
+      {{
+        'portal.screens.t12.field.nao_lidas'
+          | stynxTranslate: { count: facade.unreadCount() }
+      }}
+    </p>
+
+    @if (facade.status() === 'empty') {
+      <detran-empty-state
+        [title]="'portal.screens.t12.empty' | stynxTranslate"
+        [message]="'portal.screens.t12.empty' | stynxTranslate"
+      />
+    }
+
+    @if (facade.items().length > 0) {
+      <portal-notification-list
+        [items]="facade.items()"
+        [busy]="facade.readStatus() === 'submitting'"
+        (read)="onRead($event)"
+      />
+      @if (facade.page(); as page) {
+        <stynx-pagination
+          [totalItems]="page.total"
+          [page]="page.page - 1"
+          [pageSizeInput]="page.pageSize"
+          (pageChange)="onPageChange($event.pageIndex + 1)"
+        />
+      }
+    }
+  `,
+})
+export class InboxPageComponent {
+  readonly facade = inject(NotificacoesFacade);
+  private readonly realtime = inject(RealtimeService);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly kinds = KINDS;
+  readonly unreadFilter = UNREAD_FILTER;
+  readonly allOption = ALL_OPTION;
+
+  /** Tempo real degradado (`polling`) ou com erro classificado: aviso, nunca bloqueio. */
+  readonly realtimeDegraded = computed(
+    () =>
+      this.facade.realtime() === 'polling' ||
+      this.facade.realtimeError() !== null,
+  );
+
+  constructor() {
+    void this.facade.loadList();
+    this.realtime.start();
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'empty')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  kindKey(kind: string): string {
+    return `${KIND_KEY_PREFIX}${kind}`;
+  }
+
+  onKindChange(event: Event): void {
+    const value = (event.target as HTMLSelectElement).value;
+    void this.facade.setQuery({
+      kind: value.length > 0 ? (value as InboxKind) : undefined,
+    });
+  }
+
+  onReadChange(event: Event): void {
+    const value = (event.target as HTMLSelectElement).value;
+    void this.facade.setQuery({
+      read: value === UNREAD_FILTER ? UNREAD_FILTER : undefined,
+    });
+  }
+
+  onRead(inboxItemId: string): void {
+    void this.facade.markRead(inboxItemId);
+  }
+
+  onPageChange(page: number): void {
+    void this.facade.setQuery({ page });
+  }
+
+  reload(): void {
+    void this.facade.loadList();
+  }
+}
diff --git a/apps/portal/web/src/app/features/notificacoes/pages/preferences.page.ts b/apps/portal/web/src/app/features/notificacoes/pages/preferences.page.ts
new file mode 100644
index 00000000..559aee44
--- /dev/null
+++ b/apps/portal/web/src/app/features/notificacoes/pages/preferences.page.ts
@@ -0,0 +1,198 @@
+// /notificacoes/preferencias (contrato CTG-0003c §6; OD-P38/OD-P87/OD-P88): canal preferencial
+// de notificação (rádios sem valor pré-selecionado — `me.preferences` é `null`) e o opt-in de
+// push por gesto explícito (`PushService.subscribe()` só no clique). O salvamento (`PUT
+// preferences`) não tem `If-Match` de origem nesta rodada (OD-P87): a página abre já com o aviso
+// "indisponível nesta versão" em `role="status"`, o formulário continua editável e o botão salvar
+// ativo — o 428/422 do servidor é apresentado como indisponível (nunca "recarregue"), com o canal
+// alternativo. Push `unsupported`/`unavailable` → texto + botão `aria-disabled`; `denied`/`error`
+// → texto/banner; nunca assinatura sem clique.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  inject,
+  signal,
+} from '@angular/core';
+import { StynxBannerComponent, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import { PushService } from '../../../core/push.service';
+import { SessionFacade } from '../../../core/session.facade';
+import type { SneChannel } from '../../../data/portal-read.models';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { NotificacoesFacade } from '../notificacoes.facade';
+
+const CHANNELS: readonly SneChannel[] = ['push', 'email', 'sne'];
+const CHANNEL_KEY_PREFIX = `portal.forms.preferencias.canal.`;
+const PUSH_STATUS_KEY_PREFIX = `portal.notifications.preferences.push_`;
+
+@Component({
+  selector: 'portal-preferences-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    PortalErrorBannerComponent,
+    PortalFieldErrorsDirective,
+    AlternativeChannelNoteComponent,
+  ],
+  providers: [NotificacoesFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': '',
+    '[attr.data-preferences-status]': 'facade.preferencesStatus()',
+    '[attr.data-push-status]': 'push.status()',
+    '[attr.data-server-preferences]':
+      'serverPreferences() === null ? "null" : "present"',
+  },
+  template: `
+    <h1 tabindex="-1">
+      {{ 'portal.notifications.preferences.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      <stynx-banner
+        tone="info"
+        [message]="'portal.states.unavailable_in_version' | stynxTranslate"
+      />
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.preferencesError(); as error) {
+        <portal-error-banner [error]="error" (retry)="save()" />
+      }
+      @if (push.status() === 'error' && push.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="subscribePush()" />
+      }
+    </div>
+
+    <form
+      class="portal-preferences-form"
+      [portalFieldErrors]="facade.preferencesError()?.fields ?? []"
+      (submit)="onSubmit($event)"
+    >
+      <fieldset>
+        <legend>
+          {{ 'portal.forms.preferencias.canal' | stynxTranslate }}
+        </legend>
+        @for (option of channels; track option) {
+          <label>
+            <input
+              type="radio"
+              name="channel"
+              [value]="option"
+              [checked]="channel() === option"
+              [disabled]="saving()"
+              (change)="channel.set(option)"
+            />
+            <span>{{ channelKey(option) | stynxTranslate }}</span>
+          </label>
+        }
+      </fieldset>
+      <p id="channel-error" data-field-error></p>
+
+      <section class="portal-push" data-push [attr.data-status]="push.status()">
+        @if (pushStatusKey(); as key) {
+          <p data-push-status>{{ key | stynxTranslate }}</p>
+        }
+        @if (push.status() === 'subscribed') {
+          <button
+            type="button"
+            data-push-unsubscribe
+            (click)="unsubscribePush()"
+          >
+            {{
+              'portal.notifications.preferences.push_unsubscribe'
+                | stynxTranslate
+            }}
+          </button>
+        } @else {
+          <button
+            type="button"
+            data-push-opt-in
+            [attr.aria-disabled]="pushOptInEnabled() ? null : 'true'"
+            (click)="subscribePush()"
+          >
+            {{
+              'portal.notifications.preferences.push_opt_in' | stynxTranslate
+            }}
+          </button>
+        }
+      </section>
+
+      <button
+        type="submit"
+        class="portal-primary"
+        data-save
+        [disabled]="saving()"
+      >
+        {{ 'portal.common.action.save' | stynxTranslate }}
+      </button>
+    </form>
+
+    <portal-alternative-channel-note />
+  `,
+})
+export class PreferencesPageComponent {
+  readonly facade = inject(NotificacoesFacade);
+  readonly push = inject(PushService);
+  private readonly session = inject(SessionFacade);
+
+  readonly channels = CHANNELS;
+  /** Nenhum valor pré-selecionado: `me.preferences` é `null` nesta rodada (OD-P38). */
+  readonly channel = signal<SneChannel | null>(null);
+  /** `me.preferences` tal como chega (`null`, OD-P38) — exposto para o dia em que existir. */
+  readonly serverPreferences = computed<unknown>(
+    () => this.session.account()?.preferences ?? null,
+  );
+  readonly saving = computed(
+    () => this.facade.preferencesStatus() === 'submitting',
+  );
+  readonly pushOptInEnabled = computed(() => {
+    const status = this.push.status();
+    return status === 'idle' || status === 'denied' || status === 'error';
+  });
+
+  channelKey(channel: string): string {
+    return `${CHANNEL_KEY_PREFIX}${channel}`;
+  }
+
+  /** `portal.notifications.preferences.push_<status>` (OD-P89); `idle`/`subscribing` → só o botão; `error` → banner. */
+  pushStatusKey(): string | null {
+    const status = this.push.status();
+    if (status === 'idle' || status === 'subscribing' || status === 'error') {
+      return null;
+    }
+    return `${PUSH_STATUS_KEY_PREFIX}${status}`;
+  }
+
+  /** SÓ pelo clique do cidadão (§4.2). */
+  subscribePush(): void {
+    if (!this.pushOptInEnabled()) return;
+    void this.push.subscribe();
+  }
+
+  unsubscribePush(): void {
+    void this.push.unsubscribe();
+  }
+
+  onSubmit(event: Event): void {
+    event.preventDefault();
+    this.save();
+  }
+
+  /** `PUT preferences { channel, pushSubscription? }` — sem canal escolhido nada é enviado. */
+  save(): void {
+    const channel = this.channel();
+    if (channel === null || this.saving()) return;
+    const pushSubscription =
+      channel === 'push' ? this.push.preferencesPayload() : null;
+    void this.facade.savePreferences({
+      channel,
+      ...(pushSubscription ? { pushSubscription } : {}),
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/notificacoes/pages/sne.page.ts b/apps/portal/web/src/app/features/notificacoes/pages/sne.page.ts
new file mode 100644
index 00000000..fd05f3f9
--- /dev/null
+++ b/apps/portal/web/src/app/features/notificacoes/pages/sne.page.ts
@@ -0,0 +1,202 @@
+// T-09 Adesão ao SNE (contrato CTG-0003c §6; ficha IU-PORTAL-T09; [RN-PORTAL-123]; [DIVERGE-6]):
+// tela SEPARADA da decisão de pagar — só a adesão (`SneConsent`) e o seu cancelamento, sobre
+// `GET sne/enrollment`. Estados por `ReadStatus`/`CommandStatus`: `SNE_CONTACT_REQUIRED` marca os
+// campos; `SNE_UPSTREAM_UNAVAILABLE` → "indisponível, seus prazos não mudam"; `ASSURANCE_INSUFFICIENT`
+// (403, nível abaixo de `avancada` — a rota é `simples`, OD-P100) → banner com o passo de elevação
+// (retomar=/sne) e o `AssuranceExplainer` — nunca "acesso negado"; `SNE_ALREADY_ENROLLED`/
+// `SNE_NOT_ENROLLED` → releitura + banner. Saída: `/notificacoes`. Canal alternativo sempre.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import {
+  SessionFacade,
+  isAssuranceLevel,
+  type AssuranceLevel,
+} from '../../../core/session.facade';
+import type {
+  SneEnrollmentCancelBody,
+  SneEnrollmentCreateBody,
+} from '../../../data/portal-read.models';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { AssuranceExplainerComponent } from '../../../shared/assurance-explainer.component';
+import { SneConsentComponent } from '../../../shared/sne-consent.component';
+import { NotificacoesFacade } from '../notificacoes.facade';
+
+const SERVICE_KEY = 'adesao_sne';
+const INBOX_ROUTE = '/notificacoes';
+const ASSURANCE_INSUFFICIENT_CODE = 'PORTAL.ASSURANCE_INSUFFICIENT';
+const SNE_UPSTREAM_UNAVAILABLE_CODE = 'PORTAL.SNE_UPSTREAM_UNAVAILABLE';
+const SNE_CONTACT_REQUIRED_CODE = 'PORTAL.SNE_CONTACT_REQUIRED';
+/** Teto de [RN-PORTAL-101] quando o 403 não traz `required`. */
+const DEFAULT_REQUIRED_LEVEL: AssuranceLevel = 'avancada';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t09.state.loading',
+  ineligible: 'portal.screens.t09.state.ineligible',
+  errorRecoverable: 'portal.screens.t09.state.error_recoverable',
+  unavailable: 'portal.screens.t09.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-sne-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    AssuranceExplainerComponent,
+    SneConsentComponent,
+  ],
+  providers: [NotificacoesFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-09',
+    '[attr.data-status]': 'facade.enrollmentStatus()',
+    '[attr.data-command-status]': 'facade.sneCommandStatus()',
+    '[attr.aria-busy]':
+      'facade.enrollmentStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t09.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t09.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.enrollmentStatus() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text [attr.data-reason]="unavailableReason()">
+          {{ key | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.enrollmentError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.sneCommandError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (insufficient(); as insufficient) {
+      <portal-assurance-explainer
+        [required]="insufficient.required"
+        [current]="insufficient.current"
+        [actKey]="serviceKey"
+      />
+    }
+
+    @if (facade.enrollment(); as enrollment) {
+      <portal-sne-consent
+        [enrollment]="enrollment"
+        [status]="facade.sneCommandStatus()"
+        [fields]="contactFields()"
+        (enroll)="onEnroll($event)"
+        (cancel)="onCancel($event)"
+      />
+    }
+
+    <p>
+      <a [routerLink]="inboxRoute" [attr.routerLink]="inboxRoute">{{
+        'portal.screens.t12.title' | stynxTranslate
+      }}</a>
+    </p>
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class SnePageComponent {
+  readonly facade = inject(NotificacoesFacade);
+  private readonly session = inject(SessionFacade);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly inboxRoute = INBOX_ROUTE;
+
+  /** `missing[]` de SNE_CONTACT_REQUIRED (1:1 com `name` email/phone). */
+  readonly contactFields = computed<readonly string[]>(() => {
+    const error = this.facade.sneCommandError();
+    return error?.code === SNE_CONTACT_REQUIRED_CODE ? error.fields : [];
+  });
+
+  /** 403 ASSURANCE_INSUFFICIENT { required, current } → explicador (nunca "acesso negado"). */
+  readonly insufficient = computed<{
+    readonly required: AssuranceLevel;
+    readonly current: AssuranceLevel | null;
+  } | null>(() => {
+    const error = this.facade.sneCommandError();
+    if (error?.code !== ASSURANCE_INSUFFICIENT_CODE) return null;
+    const required = error.context['required'];
+    const current = error.context['current'];
+    return {
+      required: isAssuranceLevel(required) ? required : DEFAULT_REQUIRED_LEVEL,
+      current: isAssuranceLevel(current)
+        ? current
+        : this.session.assuranceLevel(),
+    };
+  });
+
+  readonly unavailableReason = computed<string | null>(() => {
+    const reason = this.facade.sneCommandError()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : null;
+  });
+
+  constructor() {
+    void this.facade.loadEnrollment();
+    afterRenderEffect(() => {
+      const status = this.facade.enrollmentStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && status === 'ready') {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  stateTextKey(): string | null {
+    const error = this.facade.sneCommandError();
+    if (error?.code === SNE_CONTACT_REQUIRED_CODE) return STATE_KEYS.ineligible;
+    if (error?.code === SNE_UPSTREAM_UNAVAILABLE_CODE) {
+      return STATE_KEYS.errorRecoverable;
+    }
+    if (this.facade.sneCommandStatus() === 'unavailable') {
+      return STATE_KEYS.unavailable;
+    }
+    return null;
+  }
+
+  onEnroll(body: SneEnrollmentCreateBody): void {
+    void this.facade.enroll(body);
+  }
+
+  onCancel(body: SneEnrollmentCancelBody): void {
+    void this.facade.cancel(body);
+  }
+
+  reload(): void {
+    void this.facade.loadEnrollment();
+  }
+}
diff --git a/apps/portal/web/src/app/features/privacidade/components/lgpd-request-form.component.ts b/apps/portal/web/src/app/features/privacidade/components/lgpd-request-form.component.ts
new file mode 100644
index 00000000..80e7fb02
--- /dev/null
+++ b/apps/portal/web/src/app/features/privacidade/components/lgpd-request-form.component.ts
@@ -0,0 +1,120 @@
+// LgpdRequestForm (contrato CTG-0003c §6 T-24; [RN-PORTAL-120/121]): o passo 2 projetado no
+// `ServiceWizard` — o escopo do pedido (rádios de `MeusDadosSchema.scope`) e os campos a corrigir
+// (`fields[]`, preenchidos pela página a partir do botão "corrigir" ao lado do dado). Os valores
+// sobem pelo `model` `values`; erros de campo (`fields[]`) marcam os controles pela diretiva.
+// Nenhum prazo é exibido aqui: o que o servidor devolver é o único prazo (RN-120).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  model,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import type { MeusDadosBody } from '../../../forms/meus-dados.schema';
+
+export type LgpdScope = MeusDadosBody['scope'];
+
+/** `MeusDadosSchema.scope`, na ordem do schema. */
+export const LGPD_SCOPES: readonly LgpdScope[] = [
+  'confirmacao',
+  'declaracao_completa',
+  'correcao',
+  'eliminacao',
+];
+
+/** Rótulos por escopo: chaves existentes da ficha T-24 (`cmd.*`) e do formulário. */
+const SCOPE_LABEL_KEY: Readonly<Record<LgpdScope, string>> = {
+  confirmacao: 'portal.screens.t24.cmd.confirmar',
+  declaracao_completa: 'portal.screens.t24.cmd.declaracao_completa',
+  correcao: 'portal.screens.t24.cmd.corrigir',
+  eliminacao: 'portal.common.action.remove',
+};
+
+interface LgpdValues {
+  readonly scope: LgpdScope | null;
+  readonly fields: readonly string[];
+}
+
+@Component({
+  selector: 'portal-lgpd-request-form',
+  imports: [StynxTranslatePipe, PortalFieldErrorsDirective],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-scope]': 'current().scope' },
+  template: `
+    <form
+      class="portal-lgpd-form"
+      [portalFieldErrors]="fields()"
+      (submit)="$event.preventDefault()"
+    >
+      <fieldset>
+        <legend>{{ 'portal.forms.meus_dados.escopo' | stynxTranslate }}</legend>
+        @for (scope of scopes; track scope) {
+          <label>
+            <input
+              type="radio"
+              name="scope"
+              [value]="scope"
+              [checked]="current().scope === scope"
+              [disabled]="disabled()"
+              (change)="setScope(scope)"
+            />
+            <span>{{ scopeLabelKey(scope) | stynxTranslate }}</span>
+          </label>
+        }
+      </fieldset>
+      <p data-hint>
+        {{
+          'portal.forms.meus_dados.hint_declaracao_completa' | stynxTranslate
+        }}
+      </p>
+      <p id="scope-error" data-field-error>
+        @if (fields().includes('scope')) {
+          {{ 'portal.errors.validation_failed' | stynxTranslate }}
+        }
+      </p>
+      @if (current().fields.length > 0) {
+        <ul data-correction-fields>
+          @for (field of current().fields; track field) {
+            <li [attr.data-field]="field">{{ field }}</li>
+          }
+        </ul>
+      }
+    </form>
+  `,
+})
+export class LgpdRequestFormComponent {
+  /** `fields[]` do erro 400/422 → diretiva. */
+  readonly fields = input<readonly string[]>([]);
+  readonly disabled = input(false);
+  /** `ServiceWizardComponent.values` (duas vias): `{ scope, fields? }`. */
+  readonly values = model<Record<string, unknown> | null>(null);
+
+  readonly scopes = LGPD_SCOPES;
+  readonly current = computed<LgpdValues>(() => {
+    const values = this.values() ?? {};
+    const scope = values['scope'];
+    const fields = values['fields'];
+    return {
+      scope: (LGPD_SCOPES as readonly unknown[]).includes(scope)
+        ? (scope as LgpdScope)
+        : null,
+      fields: Array.isArray(fields)
+        ? fields.filter((item): item is string => typeof item === 'string')
+        : [],
+    };
+  });
+
+  scopeLabelKey(scope: LgpdScope): string {
+    return SCOPE_LABEL_KEY[scope];
+  }
+
+  setScope(scope: LgpdScope): void {
+    const current = this.current();
+    this.values.set({
+      scope,
+      ...(current.fields.length > 0 ? { fields: [...current.fields] } : {}),
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/privacidade/pages/own-data.page.ts b/apps/portal/web/src/app/features/privacidade/pages/own-data.page.ts
new file mode 100644
index 00000000..69131005
--- /dev/null
+++ b/apps/portal/web/src/app/features/privacidade/pages/own-data.page.ts
@@ -0,0 +1,347 @@
+// T-24 Meus dados (LGPD) (contrato CTG-0003c §6; ficha IU-PORTAL-T24; [RN-PORTAL-118/120/121/122];
+// [UC-PORTAL-018]; [JRN-PORTAL-011]; [DIVERGE-21]): confirmação imediata de tratamento em
+// `role="status"` (temos/não temos dados seus), o `OwnDataPanel` com o cadastro do titular SEM
+// máscara (cpf, nome — origem `source_pending`) e as seções que linkam às telas funcionais, e o ato
+// `lgpd_declaracao` pelo ciclo comum (`ServiceWizard` + `LgpdRequestForm`): declaração completa,
+// correção ao lado do dado (escopo `correcao` + campo) — o pedido nasce por ato do cidadão.
+// `403 PRIVACY_SCOPE_REQUIRES_ASSURANCE` → elevação com retomada para esta rota;
+// `422 PRIVACY_CORRECTION_NOT_ALLOWED { howToCorrect }` → sem permissão + como corrigir. Serviço
+// `partially_available` → aviso + nota (OD-P17). "Exportar" não tem rota → indisponível nesta
+// versão. Transparência: finalidade + Encarregado (`privacyUrl` da marca). Nenhum prazo no cliente.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { Router, RouterLink } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { BrandService } from '../../../core/brand.service';
+import type { ErrorPresentation } from '../../../core/error-boundary';
+import {
+  MEUS_DADOS_GATE,
+  MeusDadosSchema,
+} from '../../../forms/meus-dados.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import {
+  OwnDataPanelComponent,
+  type CorrectRequest,
+  type OwnDataSection,
+} from '../../../shared/own-data-panel.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { LgpdRequestFormComponent } from '../components/lgpd-request-form.component';
+import { PrivacidadeFacade, type LgpdScope } from '../privacidade.facade';
+
+const SERVICE_KEY = 'lgpd_declaracao';
+/** = `RESUME_QUERY_PARAM` de `core/guards/auth.guard.ts` (C-3c-113 veda importar `core/guards`). */
+const RESUME_QUERY_PARAM = 'retomar';
+const CORRECTION_NOT_ALLOWED_CODE = 'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED';
+const CADASTRO_SECTION = 'cadastro';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t24.state.carregando',
+  hasData: 'portal.screens.t24.state.tem_dados',
+  noData: 'portal.screens.t24.empty',
+  notEligible: 'portal.screens.t24.state.sem_elegibilidade',
+  notAllowed: 'portal.screens.t24.state.sem_permissao',
+  unavailable: 'portal.screens.t24.state.indisponivel',
+} as const;
+
+/** Seções que só apontam para a tela funcional ([JRN-PORTAL-011] 2), na ordem da ficha. */
+const LINKED_SECTIONS: readonly OwnDataSection[] = [
+  {
+    key: 'infracoes',
+    titleKey: 'portal.shell.nav.autos',
+    route: '/autos',
+    fields: [],
+  },
+  {
+    key: 'sinistros',
+    titleKey: 'portal.screens.t18.title',
+    route: '/sinistros',
+    fields: [],
+  },
+  {
+    key: 'exames',
+    titleKey: 'portal.screens.t20.title',
+    route: '/exames',
+    fields: [],
+  },
+];
+
+@Component({
+  selector: 'portal-own-data-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranLoadingStateComponent,
+    AlternativeChannelNoteComponent,
+    OwnDataPanelComponent,
+    ServiceWizardComponent,
+    LgpdRequestFormComponent,
+  ],
+  providers: [PrivacidadeFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-24',
+    '[attr.data-confirmation]': 'facade.confirmation()',
+    '[attr.aria-busy]': 'facade.loading() ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t24.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t24.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (partial(); as partial) {
+        <stynx-banner
+          tone="warning"
+          [message]="
+            'portal.errors.service_partially_available' | stynxTranslate
+          "
+        />
+        @if (partial.alternativeChannelNote; as note) {
+          <p data-partial-note>{{ note }}</p>
+        }
+      }
+      @if (facade.loading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.confirmation() === 'has_data') {
+        <p data-confirmation="has_data">
+          {{ stateKeys.hasData | stynxTranslate }}
+        </p>
+      } @else if (facade.confirmation() === 'no_data') {
+        <p data-confirmation="no_data">
+          {{ stateKeys.noData | stynxTranslate }}
+        </p>
+      }
+      @if (correctionNotAllowed(); as howToCorrect) {
+        <p data-correction-not-allowed>
+          {{ stateKeys.notAllowed | stynxTranslate }}
+          <span data-how-to-correct>{{ howToCorrect }}</span>
+        </p>
+      }
+      @if (!facade.canRequest('declaracao_completa')) {
+        <p data-not-eligible="declaracao_completa">
+          {{ stateKeys.notEligible | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (accountUnavailable()) {
+        <p data-account-unavailable>
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <portal-own-data-panel
+      [sections]="sections()"
+      (correctRequested)="requestCorrection($event)"
+    />
+
+    <p data-purpose>
+      {{ 'portal.forms.meus_dados.campo.finalidade' | stynxTranslate }}
+      @if (privacyUrl(); as url) {
+        <a [attr.href]="url" rel="noopener" data-privacy-officer>{{
+          'portal.shell.footer.privacidade' | stynxTranslate
+        }}</a>
+      }
+    </p>
+
+    <div class="portal-own-data-actions" role="group">
+      <button
+        type="button"
+        class="portal-primary"
+        data-cmd="declaracao_completa"
+        [attr.aria-disabled]="
+          facade.canRequest('declaracao_completa') ? null : 'true'
+        "
+        (click)="requestScope('declaracao_completa')"
+      >
+        {{ 'portal.screens.t24.cmd.declaracao_completa' | stynxTranslate }}
+      </button>
+      <button
+        type="button"
+        data-export
+        aria-disabled="true"
+        [attr.title]="'portal.states.unavailable_in_version' | stynxTranslate"
+      >
+        {{ 'portal.screens.t24.cmd.exportar' | stynxTranslate }}
+      </button>
+      <span data-export-unavailable>
+        {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+      </span>
+    </div>
+
+    @if (elevationRequired()) {
+      <p data-elevation>
+        <a
+          routerLink="/assinatura/elevacao"
+          [queryParams]="resumeQuery()"
+          data-elevation-link
+          >{{ 'portal.screens.t27.cmd.elevar' | stynxTranslate }}</a
+        >
+      </p>
+    }
+
+    <portal-service-wizard
+      #wizard
+      [target]="facade.target()"
+      [schema]="schema"
+      [gate]="gate"
+      [resumeRoute]="resumeRoute()"
+      (failed)="onFailed($event)"
+      (created)="lastFailure.set(null)"
+    >
+      <portal-lgpd-request-form
+        [fields]="wizard.store.error()?.fields ?? []"
+        [disabled]="wizard.store.busy()"
+        [values]="wizard.values()"
+        (valuesChange)="wizard.values.set($event)"
+      />
+    </portal-service-wizard>
+
+    <portal-alternative-channel-note
+      [serviceKey]="serviceKey"
+      [note]="partial()?.alternativeChannelNote ?? null"
+    />
+  `,
+})
+export class OwnDataPageComponent {
+  readonly facade = inject(PrivacidadeFacade);
+  private readonly router = inject(Router);
+  private readonly brand = inject(BrandService);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private resumed = false;
+  private focused = false;
+
+  readonly schema = MeusDadosSchema;
+  readonly gate = MEUS_DADOS_GATE;
+  readonly serviceKey = SERVICE_KEY;
+  readonly stateKeys = STATE_KEYS;
+  readonly lastFailure = signal<ErrorPresentation | null>(null);
+  readonly resumeRoute = computed(() => this.router.url);
+  readonly resumeQuery = computed(() => ({
+    [RESUME_QUERY_PARAM]: this.resumeRoute(),
+  }));
+
+  /** `partially_available` (OD-P17) → aviso `role="status"` + nota do catálogo. */
+  readonly partial = computed(() => {
+    const availability = this.facade.availability();
+    return availability?.status === 'partially_available' ? availability : null;
+  });
+  readonly privacyUrl = computed<string | null>(() => {
+    const brand = this.brand.state();
+    return brand.status === 'available' ? (brand.privacyUrl ?? null) : null;
+  });
+  /** Falha de `me` não esconde as demais seções: só o cadastro fica indisponível. */
+  readonly accountUnavailable = computed(
+    () => this.facade.account() === null && this.facade.loadError() !== null,
+  );
+  readonly elevationRequired = computed(
+    () => this.lastFailure()?.nextStep === 'elevation',
+  );
+  readonly correctionNotAllowed = computed<string | null>(() => {
+    const failure = this.lastFailure();
+    if (failure?.code !== CORRECTION_NOT_ALLOWED_CODE) return null;
+    const howToCorrect = failure.context['howToCorrect'];
+    return typeof howToCorrect === 'string' ? howToCorrect : '';
+  });
+
+  /** Cadastro do titular (cpf, nome — sem máscara; origem `source_pending`) + seções funcionais. */
+  readonly sections = computed<readonly OwnDataSection[]>(() => {
+    const account = this.facade.account();
+    const cadastro: OwnDataSection = {
+      key: CADASTRO_SECTION,
+      titleKey: 'portal.screens.t24.title',
+      route: null,
+      fields: account
+        ? [
+            {
+              name: 'cpf',
+              labelKey: 'portal.forms.meus_dados.campo.cpf',
+              value: account.cpf ?? null,
+              category: 'consulta',
+              source: null,
+              correctable: true,
+            },
+            {
+              name: 'name',
+              labelKey: 'portal.forms.meus_dados.campo.nome',
+              value: account.name ?? null,
+              category: 'consulta',
+              source: null,
+              correctable: true,
+            },
+          ]
+        : [],
+    };
+    return [cadastro, ...LINKED_SECTIONS];
+  });
+
+  constructor() {
+    void this.facade.load(this.router.url);
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const resume = this.facade.resume();
+      untracked(() => {
+        if (!wizard || this.resumed || !resume) return;
+        this.resumed = true;
+        wizard.resumeFrom(resume);
+      });
+    });
+    afterRenderEffect(() => {
+      const loading = this.facade.loading();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && !loading) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  /** Abre o pedido com o escopo (o servidor decide a permissão; `canRequest` só orienta). */
+  requestScope(scope: LgpdScope, fields: readonly string[] = []): void {
+    const wizard = this.wizard();
+    if (!wizard) return;
+    this.lastFailure.set(null);
+    wizard.values.set({
+      scope,
+      ...(fields.length > 0 ? { fields: [...fields] } : {}),
+    });
+    if (wizard.store.requestId() === null) {
+      void wizard.store.start();
+    }
+  }
+
+  /** Correção AO LADO do dado ([RN-PORTAL-121] 1): escopo `correcao` + campo. */
+  requestCorrection(request: CorrectRequest): void {
+    this.requestScope('correcao', [request.field]);
+  }
+
+  /** `403 PRIVACY_SCOPE_REQUIRES_ASSURANCE` → elevação; `422 PRIVACY_CORRECTION_NOT_ALLOWED` → como corrigir. */
+  onFailed(presentation: ErrorPresentation): void {
+    this.lastFailure.set(presentation);
+  }
+}
diff --git a/apps/portal/web/src/app/features/privacidade/privacidade.facade.ts b/apps/portal/web/src/app/features/privacidade/privacidade.facade.ts
new file mode 100644
index 00000000..dc5d96bb
--- /dev/null
+++ b/apps/portal/web/src/app/features/privacidade/privacidade.facade.ts
@@ -0,0 +1,97 @@
+// PrivacidadeFacade (contrato CTG-0003c §3.7; T-24; [RN-PORTAL-118/120/121]; [UC-PORTAL-018];
+// [DIVERGE-21]; OD-P17/OD-P95): os dados do titular vêm do `me` (`SessionFacade.account()`, sem
+// máscara) e do `heldDataSummary[]` (forma livre); a confirmação de tratamento é imediata
+// (`has_data`/`no_data`/`unknown`); o ato `lgpd_declaracao` é o ciclo comum (`ServiceWizard` com
+// `MeusDadosSchema`), com alvo sem recurso; a permissão por escopo é fail-closed pela matriz do
+// servidor (`canPerform('lgpd_declaracao:<scope>')`); a disponibilidade vem do catálogo
+// (`partially_available` nesta rodada). Nenhum prazo (15 dias) é conhecido pelo cliente.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import { ResumeService } from '../../core/resume.service';
+import {
+  ServiceCatalogFacade,
+  type ServiceAvailability,
+} from '../../core/service-catalog.facade';
+import { SessionFacade } from '../../core/session.facade';
+import type { CitizenAccount } from '../../data/portal.client';
+import type { MeusDadosBody } from '../../forms/meus-dados.schema';
+import type {
+  WizardResumeDraft,
+  WizardTarget,
+} from '../../shared/service-wizard.store';
+import { resumePointFor } from '../../shared/wizard-resume';
+
+/** confirmacao | declaracao_completa | correcao | eliminacao. */
+export type LgpdScope = MeusDadosBody['scope'];
+export type DataConfirmation = 'has_data' | 'no_data' | 'unknown';
+
+const SERVICE_KEY = 'lgpd_declaracao';
+/** O escopo básico usa o ato-base; os demais têm `actKey` próprio (`lgpd_declaracao:<scope>`). */
+const BASE_SCOPE: LgpdScope = 'confirmacao';
+
+const TARGET: WizardTarget = {
+  serviceKey: SERVICE_KEY,
+  targetKind: 'none',
+  targetId: null,
+};
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+@Injectable()
+export class PrivacidadeFacade {
+  private readonly session = inject(SessionFacade);
+  private readonly catalog = inject(ServiceCatalogFacade);
+  private readonly resumeService = inject(ResumeService);
+
+  private readonly availabilityState = signal<ServiceAvailability | null>(null);
+  private readonly resumeState = signal<WizardResumeDraft | null>(null);
+  private readonly loadingState = signal(false);
+
+  /** `SessionFacade.account()` — titular sem máscara. */
+  readonly account = computed<CitizenAccount | null>(() =>
+    this.session.account(),
+  );
+  /** `me.heldDataSummary` (forma livre; OD-P95). */
+  readonly heldData = computed<readonly Record<string, unknown>[]>(() => {
+    const summary = this.session.account()?.heldDataSummary;
+    return Array.isArray(summary) ? summary.filter(isRecord) : [];
+  });
+  readonly confirmation = computed<DataConfirmation>(() => {
+    if (!this.account()) return 'unknown';
+    return this.heldData().length > 0 ? 'has_data' : 'no_data';
+  });
+  /** `ServiceCatalogFacade.availability('lgpd_declaracao')`. */
+  readonly availability = this.availabilityState.asReadonly();
+  readonly target = signal<WizardTarget>(TARGET).asReadonly();
+  readonly resume = this.resumeState.asReadonly();
+  readonly loading = this.loadingState.asReadonly();
+  readonly loadError = computed(() => this.session.loadError());
+
+  /** Fail-closed: `canPerform('lgpd_declaracao:<scope>')`; `confirmacao` → `canPerform('lgpd_declaracao')`. */
+  canRequest(scope: LgpdScope): boolean {
+    const actKey =
+      scope === BASE_SCOPE ? SERVICE_KEY : `${SERVICE_KEY}:${scope}`;
+    return this.session.canPerform(actKey);
+  }
+
+  /** `SessionFacade.load()` se ainda sem conta; disponibilidade do serviço; ponto de retomada. */
+  async load(resumeRoute: string): Promise<void> {
+    this.loadingState.set(true);
+    try {
+      if (!this.session.account()) await this.session.load();
+      this.resumeState.set(
+        resumePointFor(this.resumeService, resumeRoute, TARGET),
+      );
+      try {
+        this.availabilityState.set(
+          await this.catalog.availability(SERVICE_KEY),
+        );
+      } catch {
+        this.availabilityState.set(null);
+      }
+    } finally {
+      this.loadingState.set(false);
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts b/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts
index 1a6f40f8..b4e9a259 100644
--- a/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts
+++ b/apps/portal/web/src/app/features/privacidade/privacidade.routes.ts
@@ -1,7 +1,13 @@
-// Módulo `privacidade` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('privacidade', { '<path>': { component, title } })`.
+// Módulo `privacidade` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rota
+// derivada do manifesto — guardas e `data.screen` vêm da fábrica (`moduleRoutes`), a página e o
+// título são fixados aqui (T-24).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { OwnDataPageComponent } from './pages/own-data.page';

-export const PRIVACIDADE_ROUTES: Routes = moduleRoutes('privacidade');
+export const PRIVACIDADE_ROUTES: Routes = moduleRoutes('privacidade', {
+  'privacidade/meus-dados': {
+    component: OwnDataPageComponent,
+    title: 'portal.screens.t24.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts b/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts
new file mode 100644
index 00000000..4578ba70
--- /dev/null
+++ b/apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.ts
@@ -0,0 +1,210 @@
+// T-19 Detalhe do sinistro (contrato CTG-0003c §6; ficha IU-PORTAL-T19; [RN-PORTAL-118];
+// [JRN-PORTAL-007]; OD-P19/OD-P91): resumo primeiro — o rótulo de estado do servidor (`data-token`),
+// o id como protocolo e um `<dl>` só com os valores primitivos de `summary` (chaves cruas em
+// `data-key`, sem rótulo inventado; `gravidade`/`dinamica` ganham rótulo quando existem); a supressão
+// de dado de terceiro é anunciada em `role="status"` (o servidor já suprimiu; o titular vê o próprio
+// dado sem máscara). "Baixar boletim" não tem rota ([DIVERGE-15]) → `aria-disabled` + indisponível
+// nesta versão. `CRASH_NOT_FINAL` é erro recuperável sem prazo; 404 → vínculo; 5xx → indisponível.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  DestroyRef,
+  ElementRef,
+  afterRenderEffect,
+  computed,
+  inject,
+  signal,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
+import { ActivatedRoute } from '@angular/router';
+import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { SinistrosFacade } from '../sinistros.facade';
+
+const CRASH_PARAM = 'crashId';
+const SERVICE_KEY = 'consulta_bat';
+const CRASH_NOT_FINAL_CODE = 'PORTAL.CRASH_NOT_FINAL';
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+
+/** Chaves de `summary` com rótulo na ficha (nomes `source_pending`, OD-P97). */
+const LABELLED_SUMMARY_KEYS: Readonly<Record<string, string>> = {
+  gravidade: 'portal.screens.t19.field.gravidade',
+  dinamica: 'portal.screens.t19.field.dinamica',
+};
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t19.state.carregando',
+  notFound: 'portal.screens.t19.state.sem_permissao',
+  recoverable: 'portal.screens.t19.state.erro_recuperavel',
+  unavailable: 'portal.screens.t19.state.indisponivel',
+} as const;
+
+interface SummaryEntry {
+  readonly key: string;
+  readonly labelKey: string | null;
+  readonly value: string;
+}
+
+function isPrimitive(
+  value: unknown,
+): value is string | number | boolean | null {
+  return (
+    value === null ||
+    typeof value === 'string' ||
+    typeof value === 'number' ||
+    typeof value === 'boolean'
+  );
+}
+
+@Component({
+  selector: 'portal-crash-detail-page',
+  imports: [
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+  ],
+  providers: [SinistrosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-19',
+    '[attr.data-crash-id]': 'crashId()',
+    '[attr.data-status]': 'facade.detailStatus()',
+    '[attr.aria-busy]': 'facade.detailStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t19.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.detailStatus() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.detail()?.thirdPartyFieldsSuppressed) {
+        <p data-suppressed>
+          {{
+            'portal.errors.crash_third_party_data_restricted' | stynxTranslate
+          }}
+        </p>
+      }
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.detailError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.detail(); as detail) {
+      <section #summary tabindex="-1" data-crash-summary>
+        <p data-state-label [attr.data-token]="detail.stateLabel">
+          {{ detail.stateLabel }}
+        </p>
+        <p>
+          <span>{{ 'portal.common.receipt.number' | stynxTranslate }}</span>
+          <span data-protocol>{{ detail.crashId }}</span>
+        </p>
+        @if (summaryEntries().length > 0) {
+          <dl data-summary>
+            @for (entry of summaryEntries(); track entry.key) {
+              <div [attr.data-key]="entry.key">
+                @if (entry.labelKey; as labelKey) {
+                  <dt>{{ labelKey | stynxTranslate }}</dt>
+                } @else {
+                  <dt [attr.data-raw-key]="entry.key">{{ entry.key }}</dt>
+                }
+                <dd>{{ entry.value }}</dd>
+              </div>
+            }
+          </dl>
+        }
+        <button
+          type="button"
+          data-download
+          aria-disabled="true"
+          [attr.title]="'portal.states.unavailable_in_version' | stynxTranslate"
+        >
+          {{ 'portal.screens.t19.cmd.baixar' | stynxTranslate }}
+        </button>
+        <p data-download-unavailable>
+          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+        </p>
+      </section>
+    }
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class CrashDetailPageComponent {
+  readonly facade = inject(SinistrosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
+  private focused = false;
+
+  readonly crashId = signal('');
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+
+  /** Só os valores primitivos de `summary` (forma livre, OD-P91); nada de texto inventado. */
+  readonly summaryEntries = computed<readonly SummaryEntry[]>(() => {
+    const summary = this.facade.detail()?.summary ?? {};
+    return Object.entries(summary)
+      .filter((entry): entry is [string, string | number | boolean | null] =>
+        isPrimitive(entry[1]),
+      )
+      .map(([key, value]) => ({
+        key,
+        labelKey: LABELLED_SUMMARY_KEYS[key] ?? null,
+        value: value === null ? '' : String(value),
+      }));
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const crashId = params.get(CRASH_PARAM) ?? '';
+        this.crashId.set(crashId);
+        this.focused = false;
+        void this.facade.loadDetail(crashId);
+      });
+    // Foco no resumo ao carregar ([JRN-PORTAL-007] 4); erro → o banner já recebe o foco.
+    afterRenderEffect(() => {
+      const status = this.facade.detailStatus();
+      const summary = this.summary()?.nativeElement;
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (this.focused || status !== 'ready') return;
+        this.focused = true;
+        (summary ?? heading)?.focus();
+      });
+    });
+  }
+
+  stateTextKey(): string | null {
+    const code = this.facade.detailError()?.code ?? null;
+    if (code === CRASH_NOT_FINAL_CODE) return STATE_KEYS.recoverable;
+    if (code === NOT_FOUND_CODE) return STATE_KEYS.notFound;
+    if (this.facade.detailStatus() === 'unavailable') {
+      return STATE_KEYS.unavailable;
+    }
+    return null;
+  }
+
+  reload(): void {
+    void this.facade.loadDetail(this.crashId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/sinistros/pages/crash-list.page.ts b/apps/portal/web/src/app/features/sinistros/pages/crash-list.page.ts
new file mode 100644
index 00000000..96099a65
--- /dev/null
+++ b/apps/portal/web/src/app/features/sinistros/pages/crash-list.page.ts
@@ -0,0 +1,171 @@
+// T-18 Buscar meu boletim de sinistro (contrato CTG-0003c §6; ficha IU-PORTAL-T18; [JRN-PORTAL-007];
+// [DIVERGE-14]): a lista de sinistros do cidadão (`GET crashes`) com busca LOCAL por vocabulário
+// livre sobre o `stateLabel` e o resumo (o OpenAPI não tem parâmetros de busca), resultado
+// anunciado em `aria-live="polite"`. Cada item mostra só o rótulo de estado que o servidor manda
+// (nenhum vocabulário interno em texto), o aviso de supressão de dado de terceiro quando houver e
+// o link ao detalhe. Vazio → caminho pela ouvidoria; filtro sem resultado → texto próprio.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  ElementRef,
+  afterRenderEffect,
+  inject,
+  untracked,
+  viewChild,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranEmptyStateComponent,
+  DetranLoadingStateComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { SinistrosFacade } from '../sinistros.facade';
+
+const CRASH_ROUTE_PREFIX = '/sinistros/';
+const OUVIDORIA_ROUTE = '/ouvidoria/nova';
+
+@Component({
+  selector: 'portal-crash-list-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+  ],
+  providers: [SinistrosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-18',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t18.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+    </div>
+
+    <form class="portal-crash-search" (submit)="onSubmit($event)">
+      <label>
+        <span>{{ 'portal.screens.t18.field.busca' | stynxTranslate }}</span>
+        <input
+          #searchInput
+          type="search"
+          name="search"
+          [placeholder]="'portal.screens.t18.intro' | stynxTranslate"
+          [value]="facade.search()"
+          (input)="onSearchInput($event)"
+        />
+      </label>
+      <button type="submit" data-search>
+        {{ 'portal.screens.t18.cmd.buscar' | stynxTranslate }}
+      </button>
+    </form>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.status() === 'empty') {
+      <detran-empty-state
+        [title]="'portal.screens.t18.empty' | stynxTranslate"
+        [message]="'portal.screens.t18.empty' | stynxTranslate"
+      />
+      <p>
+        <a [routerLink]="ouvidoriaRoute" [attr.routerLink]="ouvidoriaRoute">{{
+          'portal.common.link.ouvidoria' | stynxTranslate
+        }}</a>
+      </p>
+    }
+
+    <section aria-live="polite" data-crash-results>
+      @if (facade.status() === 'ready' && facade.filtered().length === 0) {
+        <p data-no-match>{{ 'portal.screens.t19.empty' | stynxTranslate }}</p>
+      }
+      @if (facade.filtered().length > 0) {
+        <ol data-crash-list class="portal-crash-list">
+          @for (item of facade.filtered(); track item.crashId) {
+            <li
+              [attr.data-crash-id]="item.crashId"
+              [attr.data-token]="item.stateLabel"
+              [attr.data-third-party-suppressed]="
+                item.thirdPartyFieldsSuppressed ? 'true' : 'false'
+              "
+            >
+              <p data-state-label>{{ item.stateLabel }}</p>
+              @if (item.thirdPartyFieldsSuppressed) {
+                <span role="status" data-suppressed>
+                  {{
+                    'portal.errors.crash_third_party_data_restricted'
+                      | stynxTranslate
+                  }}
+                </span>
+              }
+              <a
+                [routerLink]="crashRoute(item.crashId)"
+                [attr.routerLink]="crashRoute(item.crashId)"
+                >{{ 'portal.screens.t19.title' | stynxTranslate }}</a
+              >
+            </li>
+          }
+        </ol>
+      }
+    </section>
+  `,
+})
+export class CrashListPageComponent {
+  readonly facade = inject(SinistrosFacade);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly searchInput =
+    viewChild<ElementRef<HTMLInputElement>>('searchInput');
+  private focused = false;
+
+  readonly ouvidoriaRoute = OUVIDORIA_ROUTE;
+
+  constructor() {
+    void this.facade.loadList();
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'empty')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  crashRoute(crashId: string): string {
+    return `${CRASH_ROUTE_PREFIX}${crashId}`;
+  }
+
+  onSearchInput(event: Event): void {
+    this.facade.setSearch((event.target as HTMLInputElement).value);
+  }
+
+  /** Busca local ([DIVERGE-14]): nunca uma requisição nova. */
+  onSubmit(event: Event): void {
+    event.preventDefault();
+    this.facade.setSearch(this.searchInput()?.nativeElement.value ?? '');
+  }
+
+  reload(): void {
+    void this.facade.loadList();
+  }
+}
diff --git a/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts b/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts
new file mode 100644
index 00000000..034e5c87
--- /dev/null
+++ b/apps/portal/web/src/app/features/sinistros/sinistros.facade.ts
@@ -0,0 +1,114 @@
+// SinistrosFacade (contrato CTG-0003c §3.4; T-18/T-19; [RN-PORTAL-118]; [JRN-PORTAL-007]; OD-P19):
+// a lista de sinistros (`GET crashes`, sem parâmetros de busca no OpenAPI — [DIVERGE-14]: o filtro
+// de T-18 é LOCAL, case-insensitive, sobre `stateLabel` e os valores string de `summary`; nunca uma
+// consulta inventada) e o detalhe (`GET crashes/{id}`, vínculo `crash`). `CRASH_NOT_FINAL` é erro
+// recuperável sem prazo; `thirdPartyFieldsSuppressed` é aviso informativo que não muda o status —
+// o servidor já suprimiu os dados de terceiro. Nenhum download de boletim ([DIVERGE-15]).
+import { Injectable, computed, inject, signal } from '@angular/core';
+import {
+  OFFLINE_KEY,
+  presentError,
+  type ErrorPresentation,
+  type PresentErrorOptions,
+} from '../../core/error-boundary';
+import { PortalClient } from '../../data/portal.client';
+import type { CrashDetail, CrashSummary } from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+
+/**
+ * Resposta sem status HTTP (0 = a requisição não chegou ao servidor) é apresentada como sem
+ * conexão (`portal.states.offline`, contrato §2.6/§7.1). O `ErrorBoundary` só o faz quando o
+ * browser se declara desconectado, e C-3c-113 veda essa leitura nas features: aqui vale o status.
+ */
+function presentRead(
+  error: unknown,
+  options?: PresentErrorOptions,
+): ErrorPresentation {
+  const presentation = presentError(error, options);
+  return presentation.status === 0 && presentation.code === null
+    ? { ...presentation, messageKey: OFFLINE_KEY }
+    : presentation;
+}
+
+/** Texto pesquisável de um item: `stateLabel` + valores string de `summary` (forma livre, OD-P91). */
+function searchableText(item: CrashSummary): string {
+  const values = Object.values(item.summary ?? {}).filter(
+    (value): value is string => typeof value === 'string',
+  );
+  return [item.stateLabel, ...values].join('\n').toLocaleLowerCase();
+}
+
+@Injectable()
+export class SinistrosFacade {
+  private readonly client = inject(PortalClient);
+
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly itemsState = signal<readonly CrashSummary[]>([]);
+  private readonly searchState = signal('');
+  private readonly detailStatusState = signal<ReadStatus>('idle');
+  private readonly detailState = signal<CrashDetail | null>(null);
+  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
+  private listSequence = 0;
+  private detailSequence = 0;
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly items = this.itemsState.asReadonly();
+  /** Texto do campo de busca (T-18). */
+  readonly search = this.searchState.asReadonly();
+  /** Filtro LOCAL; vazio → todos. Nunca consulta o servidor por texto. */
+  readonly filtered = computed<readonly CrashSummary[]>(() => {
+    const needle = this.searchState().trim().toLocaleLowerCase();
+    const items = this.itemsState();
+    if (needle.length === 0) return items;
+    return items.filter((item) => searchableText(item).includes(needle));
+  });
+  readonly detailStatus = this.detailStatusState.asReadonly();
+  readonly detail = this.detailState.asReadonly();
+  readonly detailError = this.detailErrorState.asReadonly();
+
+  /** GET crashes; `empty` quando `items.length === 0`. */
+  async loadList(): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    const sequence = ++this.listSequence;
+    try {
+      const page = await this.client.listCrashes();
+      if (sequence !== this.listSequence) return;
+      const items = page.items ?? [];
+      this.itemsState.set(items);
+      this.statusState.set(items.length === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.listSequence) return;
+      const presentation = presentRead(error);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  setSearch(text: string): void {
+    this.searchState.set(text);
+  }
+
+  /** GET crashes/{id}; entitlement { kind: 'crash', id }. */
+  async loadDetail(crashId: string): Promise<void> {
+    this.detailStatusState.set('loading');
+    this.detailErrorState.set(null);
+    const sequence = ++this.detailSequence;
+    try {
+      const detail = await this.client.getCrash(crashId);
+      if (sequence !== this.detailSequence) return;
+      this.detailState.set(detail);
+      this.detailStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.detailSequence) return;
+      const presentation = presentRead(error, {
+        entitlement: { kind: 'crash', id: crashId },
+      });
+      this.detailState.set(null);
+      this.detailErrorState.set(presentation);
+      this.detailStatusState.set(readStatusFor(presentation));
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts b/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts
index 569bd2ab..3c7ab358 100644
--- a/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts
+++ b/apps/portal/web/src/app/features/sinistros/sinistros.routes.ts
@@ -1,7 +1,18 @@
-// Módulo `sinistros` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('sinistros', { '<path>': { component, title } })`.
+// Módulo `sinistros` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-18, T-19).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { CrashDetailPageComponent } from './pages/crash-detail.page';
+import { CrashListPageComponent } from './pages/crash-list.page';

-export const SINISTROS_ROUTES: Routes = moduleRoutes('sinistros');
+export const SINISTROS_ROUTES: Routes = moduleRoutes('sinistros', {
+  sinistros: {
+    component: CrashListPageComponent,
+    title: 'portal.screens.t18.title',
+  },
+  'sinistros/:crashId': {
+    component: CrashDetailPageComponent,
+    title: 'portal.screens.t19.title',
+  },
+});
diff --git a/apps/portal/web/src/app/shared/clearance-status.component.ts b/apps/portal/web/src/app/shared/clearance-status.component.ts
new file mode 100644
index 00000000..31b9efe2
--- /dev/null
+++ b/apps/portal/web/src/app/shared/clearance-status.component.ts
@@ -0,0 +1,242 @@
+// ClearanceStatus (contrato CTG-0003c §5.4; [RN-PORTAL-116]; [UC-PORTAL-012]; OD-P04/DT-027): a
+// quitação do veículo ANTES da tentativa de emitir o CRLV-e — três seções distintas: débitos
+// (`items[]`), restrições (`restrictions[]`) e multas sob recurso (`suspendedEnforceability[]`,
+// que NUNCA bloqueiam nem aparecem entre os débitos). "Há débito a pagar" ≠ "há restrição":
+// mensagens diferentes (`crlv_blocked_by_debt` com link de pagamento × `crlv_blocked_by_restriction`
+// sem ele). O botão "emitir" só está habilitado com `canIssue` DO SERVIDOR e sem bloqueio; o
+// cliente NÃO soma valores, não julga `blocking` nem calcula nada — cada `amount` é formatado
+// tal como chegou (`Intl.NumberFormat` BRL via pipe do kit).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  StynxIntlCurrencyPipe,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import type { ErrorPresentation } from '../core/error-boundary';
+import type { VehicleClearance } from '../data/portal-read.models';
+
+const AUTOS_ROUTE = '/autos';
+const AIT_ROUTE_PREFIX = '/autos/';
+const KIND_KEY_PREFIX = `portal.documents.clearance.kind.`;
+const DEBT_CODE = 'PORTAL.CRLV_BLOCKED_BY_DEBT';
+const RESTRICTION_CODE = 'PORTAL.CRLV_BLOCKED_BY_RESTRICTION';
+
+export type IssueDisabledReason = 'debt' | 'restriction' | 'server';
+
+@Component({
+  selector: 'portal-clearance-status',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlCurrencyPipe,
+    StynxIntlDatePipe,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-can-issue]': 'canIssue() ? "true" : "false"',
+    '[attr.data-blocked]': 'blockedReason() ?? null',
+  },
+  template: `
+    @if (clearance(); as clearance) {
+      <section class="portal-clearance" data-clearance>
+        @if (cachedAt(); as cachedAt) {
+          <p data-consulted-at>
+            {{
+              'portal.documents.consulta.consultedAt'
+                | stynxTranslate
+                  : { consultedAt: (cachedAt | stynxIntlDate: dateTimeFormat) }
+            }}
+          </p>
+        }
+
+        @if (blockedReason() === 'debt') {
+          <p role="status" data-blocked-by-debt>
+            {{ 'portal.errors.crlv_blocked_by_debt' | stynxTranslate }}
+            <a [routerLink]="payRoute" [attr.routerLink]="payRoute" data-pay>{{
+              'portal.services.pagamento' | stynxTranslate
+            }}</a>
+          </p>
+        } @else if (blockedReason() === 'restriction') {
+          <p role="status" data-blocked-by-restriction>
+            {{ 'portal.errors.crlv_blocked_by_restriction' | stynxTranslate }}
+          </p>
+        }
+
+        <!-- Título da seção de débitos: o catálogo não tem chave própria (OD-P89 não a lista);
+             usa-se o nome do serviço que os resolve até a chave existir (relatado). -->
+        <section data-debts>
+          <h3>{{ 'portal.services.pagamento' | stynxTranslate }}</h3>
+          @if (clearance.items.length > 0) {
+            <ul>
+              @for (item of clearance.items; track $index) {
+                <li
+                  data-debt-item
+                  [attr.data-token]="item.kind"
+                  [attr.data-status]="item.status"
+                  [attr.data-reason]="item.reason ?? null"
+                  [attr.data-blocking]="item.blocking ? 'true' : 'false'"
+                >
+                  <span>{{ kindKey(item.kind) | stynxTranslate }}</span>
+                  @if (item.amount !== null) {
+                    <span data-amount>{{
+                      item.amount | stynxIntlCurrency: currency
+                    }}</span>
+                  }
+                  <span data-blocking-label>
+                    <span aria-hidden="true">{{
+                      item.blocking ? '⚠' : '✓'
+                    }}</span>
+                    {{ blockingKey(item.blocking) | stynxTranslate }}
+                  </span>
+                </li>
+              }
+            </ul>
+          } @else {
+            <p data-no-debts>
+              {{ 'portal.documents.clearance.not_blocking' | stynxTranslate }}
+            </p>
+          }
+        </section>
+
+        <section data-restrictions>
+          <h3>
+            {{ 'portal.documents.clearance.restrictions' | stynxTranslate }}
+          </h3>
+          @if (clearance.restrictions.length > 0) {
+            <ul>
+              @for (restriction of clearance.restrictions; track $index) {
+                <li
+                  data-restriction
+                  [attr.data-token]="restriction.kind"
+                  [attr.data-blocking]="restriction.blocking ? 'true' : 'false'"
+                >
+                  <span aria-hidden="true">{{
+                    restriction.blocking ? '⚠' : '✓'
+                  }}</span>
+                  {{ blockingKey(restriction.blocking) | stynxTranslate }}
+                </li>
+              }
+            </ul>
+          } @else {
+            <p data-no-restrictions>
+              {{ 'portal.documents.clearance.not_blocking' | stynxTranslate }}
+            </p>
+          }
+        </section>
+
+        <section data-suspended-section>
+          <h3>{{ 'portal.documents.clearance.suspended' | stynxTranslate }}</h3>
+          @if (clearance.suspendedEnforceability.length > 0) {
+            <p role="status" data-suspended-notice>
+              {{
+                'portal.errors.crlv_suspended_enforceability_not_blocking'
+                  | stynxTranslate
+              }}
+            </p>
+            <ul>
+              @for (
+                suspended of clearance.suspendedEnforceability;
+                track suspended.aitId
+              ) {
+                <li data-suspended [attr.data-ait-id]="suspended.aitId">
+                  <a
+                    [routerLink]="aitRoute(suspended.aitId)"
+                    [attr.routerLink]="aitRoute(suspended.aitId)"
+                    >{{
+                      'portal.screens.t17.state.suspenso' | stynxTranslate
+                    }}</a
+                  >
+                </li>
+              }
+            </ul>
+          } @else {
+            <p data-no-suspended>
+              {{ 'portal.documents.clearance.not_blocking' | stynxTranslate }}
+            </p>
+          }
+        </section>
+
+        <p data-can-issue-label>{{ canIssueLabelKey() | stynxTranslate }}</p>
+      </section>
+    }
+    <!-- O botão existe desde o início (aria-disabled, motivo 'server') e só fica habilitado com a
+         quitação lida e canIssue do servidor: a quitação sempre precede a tentativa (§5.4 a). -->
+    <button
+      type="button"
+      class="portal-clearance-issue"
+      data-issue
+      [attr.aria-disabled]="issueEnabled() ? null : 'true'"
+      [attr.data-reason]="issueEnabled() ? null : (blockedReason() ?? 'server')"
+      (click)="onIssue()"
+    >
+      {{ issueLabelKey() | stynxTranslate }}
+    </button>
+  `,
+})
+export class ClearanceStatusComponent {
+  readonly clearance = input.required<VehicleClearance | null>();
+  /** `CRLV_BLOCKED_BY_DEBT` | `CRLV_BLOCKED_BY_RESTRICTION` (context.items[] / restrictions[]). */
+  readonly blocked = input<ErrorPresentation | null>(null);
+  readonly cachedAt = input<string | null>(null);
+  /** `clearance.canIssue` do servidor. */
+  readonly canIssue = input<boolean>(false);
+  readonly issueLabelKey = input<string>('portal.screens.t17.cmd.emitir');
+  readonly busy = input(false);
+  readonly issue = output<void>();
+  /** `context.paymentRoute` (só informativo: a rota do app é `/autos`, `source_pending` por multa). */
+  readonly payRequested = output<string | null>();
+
+  readonly payRoute = AUTOS_ROUTE;
+  readonly currency = 'BRL';
+  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  readonly blockedReason = computed<IssueDisabledReason | null>(() => {
+    const code = this.blocked()?.code ?? null;
+    if (code === DEBT_CODE) return 'debt';
+    if (code === RESTRICTION_CODE) return 'restriction';
+    return null;
+  });
+  readonly issueEnabled = computed(
+    () =>
+      this.clearance() !== null &&
+      this.canIssue() &&
+      this.blockedReason() === null &&
+      !this.busy(),
+  );
+
+  /** `canIssue` do servidor decide o rótulo (nunca calculado dos itens). */
+  readonly canIssueLabelKey = computed(() =>
+    this.canIssue()
+      ? 'portal.documents.clearance.can_issue'
+      : 'portal.documents.clearance.blocking',
+  );
+
+  kindKey(kind: string): string {
+    return `${KIND_KEY_PREFIX}${kind}`;
+  }
+
+  blockingKey(blocking: boolean): string {
+    return blocking
+      ? 'portal.documents.clearance.blocking'
+      : 'portal.documents.clearance.not_blocking';
+  }
+
+  aitRoute(aitId: string): string {
+    return `${AIT_ROUTE_PREFIX}${aitId}`;
+  }
+
+  /** `aria-disabled` orienta; o servidor decide (M15) — o clique sempre emite (a página filtra o duplo envio). */
+  onIssue(): void {
+    this.issue.emit();
+  }
+}
diff --git a/apps/portal/web/src/app/shared/digital-document-card.component.ts b/apps/portal/web/src/app/shared/digital-document-card.component.ts
new file mode 100644
index 00000000..7aecc326
--- /dev/null
+++ b/apps/portal/web/src/app/shared/digital-document-card.component.ts
@@ -0,0 +1,192 @@
+// DigitalDocumentCard (contrato CTG-0003c §5.3; [RN-PORTAL-115]; [RN-PORTAL-117]; [UC-PORTAL-011]):
+// cartão da CNH-e/CRLV-e. Categoria `'A'` (documento) EXIGE `qrVerification` — sem QR o cartão
+// renderiza como `'C'` (consulta informativa): nunca rotula documento um artefato sem verificação
+// (verificação d de RN-117). `'A'`: QR verificável, aviso "não é cópia", disponibilidade offline
+// e os botões baixar/compartilhar/imprimir (só emitem; `navigator.share`/`window.print` são da
+// página). `'C'`: "consulta informativa", "consultado em" e a fonte — sem botões. A validade é a
+// data do servidor em `<time>` (nunca uma duração); campos extras em `<dl>` com `data-token`.
+// Bateria crítica / autenticação local: nenhuma API (OD-P54, `source_pending`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+} from '@angular/core';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import type { OfflineDocumentKind } from '../core/offline-document.store';
+
+export type DigitalDocumentKind = OfflineDocumentKind; // 'cnh-e' | 'crlv-e'
+/** RN-PORTAL-117 (B não passa por aqui). */
+export type DocumentCategory = 'A' | 'C';
+
+export interface DigitalDocumentField {
+  readonly labelKey: string;
+  readonly value: string | null;
+  readonly token?: string;
+}
+
+const TITLE_KEY: Readonly<Record<DigitalDocumentKind, string>> = {
+  'cnh-e': 'portal.documents.cnh.title',
+  'crlv-e': 'portal.documents.crlv.title',
+};
+
+const DOCUMENT_KEY_PREFIX: Readonly<Record<DigitalDocumentKind, string>> = {
+  'cnh-e': `portal.documents.cnh.`,
+  'crlv-e': `portal.documents.crlv.`,
+};
+
+/** Só `data:`/`http(s)` viram `<img>`; qualquer outro formato é texto (formato `source_pending`). */
+const IMAGE_SOURCE = /^(data:image\/|https?:\/\/)/i;
+
+@Component({
+  selector: 'portal-digital-document-card',
+  imports: [StynxTranslatePipe, StynxIntlDatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-kind]': 'kind()',
+    '[attr.data-category]': 'effectiveCategory()',
+    '[attr.data-offline]': 'offline() ? "true" : "false"',
+  },
+  template: `
+    <article class="portal-document-card" [attr.aria-labelledby]="titleId()">
+      <h2 [id]="titleId()">{{ titleKey() | stynxTranslate }}</h2>
+
+      @if (isDocument()) {
+        <p data-qr-verifiable>
+          {{ documentKey('qrVerifiable') | stynxTranslate }}
+        </p>
+        @if (qrImage(); as src) {
+          <img
+            data-qr
+            [src]="src"
+            [alt]="documentKey('qrVerifiable') | stynxTranslate"
+          />
+        } @else if (qrVerification(); as qr) {
+          <p data-qr class="portal-document-qr-text">{{ qr }}</p>
+        }
+        @if (offline()) {
+          <p role="status" data-offline-available>
+            {{ documentKey('offlineAvailable') | stynxTranslate }}
+          </p>
+        }
+      } @else {
+        <p data-not-document>
+          {{ 'portal.documents.consulta.notDocument' | stynxTranslate }}
+        </p>
+        @if (cachedAt(); as cachedAt) {
+          <p data-consulted-at>
+            {{
+              'portal.documents.consulta.consultedAt'
+                | stynxTranslate
+                  : { consultedAt: (cachedAt | stynxIntlDate: dateTimeFormat) }
+            }}
+          </p>
+        }
+        @if (source(); as source) {
+          <p data-source>
+            {{
+              'portal.documents.consulta.source' | stynxTranslate: { source }
+            }}
+          </p>
+        }
+      }
+
+      @if (validUntil(); as validUntil) {
+        <p data-valid-until>
+          <time [attr.datetime]="validUntil">{{
+            'portal.documents.cnh.validity'
+              | stynxTranslate: { validUntil: (validUntil | stynxIntlDate) }
+          }}</time>
+        </p>
+      }
+
+      @if (fields().length > 0) {
+        <dl class="portal-document-fields">
+          @for (field of fields(); track field.labelKey) {
+            <dt>{{ field.labelKey | stynxTranslate }}</dt>
+            <dd [attr.data-token]="field.token ?? null">
+              {{ field.value ?? '' }}
+            </dd>
+          }
+        </dl>
+      }
+
+      @if (isDocument()) {
+        <p data-not-copy>{{ documentKey('notCopy') | stynxTranslate }}</p>
+        <div class="portal-document-actions" role="group">
+          <button
+            type="button"
+            class="portal-document-action"
+            data-download
+            [attr.data-has-bytes]="documentBytes() !== null ? 'true' : 'false'"
+            (click)="download.emit()"
+          >
+            {{ downloadLabelKey() | stynxTranslate }}
+          </button>
+          <button
+            type="button"
+            class="portal-document-action"
+            data-share
+            (click)="share.emit()"
+          >
+            {{ 'portal.common.action.share' | stynxTranslate }}
+          </button>
+          <button
+            type="button"
+            class="portal-document-action"
+            data-print
+            (click)="print.emit()"
+          >
+            {{ 'portal.common.action.print' | stynxTranslate }}
+          </button>
+        </div>
+      }
+    </article>
+  `,
+})
+export class DigitalDocumentCardComponent {
+  readonly kind = input.required<DigitalDocumentKind>();
+  /** Servidor: `CnhRead.category` ('C' nesta rodada); CRLV emitido → 'A' só com `qrVerification`. */
+  readonly category = input.required<DocumentCategory>();
+  readonly fields = input<readonly DigitalDocumentField[]>([]);
+  /** Data do servidor; nunca duração. */
+  readonly validUntil = input<string | null>(null);
+  /** Conteúdo do QR (formato `source_pending`); `null` → sem QR. */
+  readonly qrVerification = input<string | null>(null);
+  /** Blob ou base64 (OD-P91) já em mãos; `null` → a página busca ao clicar em "baixar" (T-16). */
+  readonly documentBytes = input<Blob | string | null>(null);
+  /** Categoria C: "Consultado em". */
+  readonly cachedAt = input<string | null>(null);
+  /** Categoria C: "Fonte: {source}" (texto do servidor; ausente → não renderiza). */
+  readonly source = input<string | null>(null);
+  /** Veio do `OfflineDocumentStore`. */
+  readonly offline = input(false);
+  readonly downloadLabelKey = input<string>('portal.common.action.download');
+  readonly download = output<void>();
+  readonly share = output<void>();
+  readonly print = output<void>();
+
+  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  /** `'A'` sem `qrVerification` renderiza como `'C'` (§5.3 b). */
+  readonly effectiveCategory = computed<DocumentCategory>(() =>
+    this.category() === 'A' && this.qrVerification() !== null ? 'A' : 'C',
+  );
+  readonly isDocument = computed(() => this.effectiveCategory() === 'A');
+  readonly titleKey = computed(() => TITLE_KEY[this.kind()]);
+  readonly titleId = computed(
+    () => `portal-document-card-${this.kind()}-title`,
+  );
+  readonly qrImage = computed<string | null>(() => {
+    const qr = this.qrVerification();
+    return qr !== null && IMAGE_SOURCE.test(qr) ? qr : null;
+  });
+
+  documentKey(suffix: 'qrVerifiable' | 'offlineAvailable' | 'notCopy'): string {
+    return `${DOCUMENT_KEY_PREFIX[this.kind()]}${suffix}`;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/evaluation-form.component.ts b/apps/portal/web/src/app/shared/evaluation-form.component.ts
new file mode 100644
index 00000000..abbe7735
--- /dev/null
+++ b/apps/portal/web/src/app/shared/evaluation-form.component.ts
@@ -0,0 +1,227 @@
+// EvaluationForm (contrato CTG-0003c §5.7; [RN-PORTAL-110]; [UC-PORTAL-017]): as cinco dimensões
+// de `EvaluationCreateDto.scores` com rótulo textual e controle `scores.<dim>`, comentário
+// opcional, o aviso de publicação (`portal.evaluations.publicIndicator`) ANTES do envio e na
+// confirmação — `result.publicNotice` só é traduzido se for exatamente essa chave; qualquer outra
+// não vira texto. A escala das notas é `source_pending` (OD-P65): `scale` null → `<input
+// type="number" step="1">` sem min/max (o servidor valida); lista → rádios por dimensão. Avaliar
+// nunca é condição de nada: "pular" volta; comentário não vazio oferece abrir uma manifestação.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+  signal,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../core/field-errors.directive';
+import type {
+  EvaluationCreateBody,
+  EvaluationCreated,
+} from '../data/portal-read.models';
+import type { CommandStatus } from '../features/processos/processos.facade';
+
+/** `EvaluationCreateDto.scores` (5). */
+export const EVALUATION_DIMENSIONS = [
+  'satisfaction',
+  'quality',
+  'deadline',
+  'clarity',
+  'channel',
+] as const;
+
+export type EvaluationDimension = (typeof EVALUATION_DIMENSIONS)[number];
+
+/** A única chave admitida como texto de confirmação (§5.7). */
+const PUBLIC_INDICATOR_KEY = 'portal.evaluations.publicIndicator';
+
+const DIMENSION_LABEL_KEY: Readonly<Record<EvaluationDimension, string>> = {
+  satisfaction: 'portal.forms.avaliacao.satisfacao',
+  quality: 'portal.forms.avaliacao.qualidade',
+  deadline: 'portal.forms.avaliacao.prazo_cumprido',
+  clarity: 'portal.forms.avaliacao.clareza',
+  channel: 'portal.forms.avaliacao.canal',
+};
+
+type Scores = Readonly<Record<EvaluationDimension, number | null>>;
+
+const EMPTY_SCORES: Scores = {
+  satisfaction: null,
+  quality: null,
+  deadline: null,
+  clarity: null,
+  channel: null,
+};
+
+@Component({
+  selector: 'portal-evaluation-form',
+  imports: [RouterLink, StynxTranslatePipe, PortalFieldErrorsDirective],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-subject-kind]': 'subjectKind()',
+    '[attr.data-subject-id]': 'subjectId()',
+    '[attr.data-status]': 'status()',
+  },
+  template: `
+    <p data-public-indicator>{{ publicIndicatorKey | stynxTranslate }}</p>
+
+    <form
+      class="portal-evaluation-form"
+      [portalFieldErrors]="fields()"
+      (submit)="onSubmit($event)"
+    >
+      @for (dimension of dimensions; track dimension) {
+        @if (scale(); as scale) {
+          <fieldset [attr.data-dimension]="dimension">
+            <legend>{{ labelKey(dimension) | stynxTranslate }}</legend>
+            @for (value of scale; track value) {
+              <label>
+                <input
+                  type="radio"
+                  [name]="controlName(dimension)"
+                  [value]="value"
+                  [checked]="scores()[dimension] === value"
+                  [disabled]="busy()"
+                  (change)="setScore(dimension, value)"
+                />
+                <span>{{ value }}</span>
+              </label>
+            }
+          </fieldset>
+        } @else {
+          <label [attr.data-dimension]="dimension">
+            <span>{{ labelKey(dimension) | stynxTranslate }}</span>
+            <input
+              type="number"
+              inputmode="numeric"
+              step="1"
+              [name]="controlName(dimension)"
+              [value]="scores()[dimension] ?? ''"
+              [disabled]="busy()"
+              (input)="onScoreInput(dimension, $event)"
+            />
+          </label>
+        }
+        <p [id]="errorId(dimension)" data-field-error>
+          @if (fields().includes(controlName(dimension))) {
+            {{ 'portal.errors.validation_failed' | stynxTranslate }}
+          }
+        </p>
+      }
+
+      <label>
+        <span>{{ 'portal.forms.avaliacao.comentario' | stynxTranslate }}</span>
+        <textarea
+          name="comment"
+          rows="4"
+          [value]="comment()"
+          [disabled]="busy()"
+          (input)="onCommentInput($event)"
+        ></textarea>
+      </label>
+
+      @if (comment().trim().length > 0) {
+        <p>
+          <button
+            type="button"
+            data-open-manifestation
+            (click)="manifestationRequested.emit()"
+          >
+            {{ 'portal.screens.t26.cmd.abrir_manifestacao' | stynxTranslate }}
+          </button>
+        </p>
+      }
+
+      <div class="portal-evaluation-actions" role="group">
+        <button
+          type="submit"
+          class="portal-primary"
+          data-submit
+          [disabled]="busy()"
+        >
+          {{ 'portal.screens.t26.cmd.enviar' | stynxTranslate }}
+        </button>
+        @if (skipRoute(); as route) {
+          <a [routerLink]="route" [attr.routerLink]="route" data-skip>{{
+            'portal.forms.avaliacao.pular' | stynxTranslate
+          }}</a>
+        }
+      </div>
+    </form>
+
+    @if (result(); as result) {
+      <section role="status" data-result [attr.data-state]="result.state">
+        @if (result.publicNotice === publicIndicatorKey) {
+          <p data-public-notice>{{ publicIndicatorKey | stynxTranslate }}</p>
+        }
+      </section>
+    }
+  `,
+})
+export class EvaluationFormComponent {
+  readonly subjectKind = input.required<'request' | 'manifestation'>();
+  readonly subjectId = input.required<string>();
+  /** Escala das notas: `source_pending` (OD-P65). `null` → numérico sem min/max. */
+  readonly scale = input<readonly number[] | null>(null);
+  readonly status = input<CommandStatus>('idle');
+  readonly fields = input<readonly string[]>([]);
+  readonly result = input<EvaluationCreated | null>(null);
+  /** Rota de "pular" (volta à tela de origem); `null` → sem link. */
+  readonly skipRoute = input<string | null>(null);
+  readonly submitted = output<EvaluationCreateBody>();
+  /** [UC-PORTAL-017] 2a → `/ouvidoria/nova`. */
+  readonly manifestationRequested = output<void>();
+
+  readonly dimensions = EVALUATION_DIMENSIONS;
+  readonly publicIndicatorKey = PUBLIC_INDICATOR_KEY;
+  readonly scores = signal<Scores>(EMPTY_SCORES);
+  readonly comment = signal('');
+  readonly busy = computed(() => this.status() === 'submitting');
+
+  labelKey(dimension: EvaluationDimension): string {
+    return DIMENSION_LABEL_KEY[dimension];
+  }
+
+  controlName(dimension: EvaluationDimension): string {
+    return `scores.${dimension}`;
+  }
+
+  errorId(dimension: EvaluationDimension): string {
+    return `${this.controlName(dimension)}-error`;
+  }
+
+  setScore(dimension: EvaluationDimension, value: number | null): void {
+    this.scores.set({ ...this.scores(), [dimension]: value });
+  }
+
+  onScoreInput(dimension: EvaluationDimension, event: Event): void {
+    const raw = (event.target as HTMLInputElement).value;
+    const parsed = raw.trim().length > 0 ? Number(raw) : Number.NaN;
+    this.setScore(dimension, Number.isFinite(parsed) ? parsed : null);
+  }
+
+  onCommentInput(event: Event): void {
+    this.comment.set((event.target as HTMLTextAreaElement).value);
+  }
+
+  /** `{ subjectKind, subjectId, scores, comment? }` — validação (`AvaliacaoSchema`) só no servidor. */
+  onSubmit(event: Event): void {
+    event.preventDefault();
+    if (this.busy()) return;
+    const scores = this.scores();
+    const comment = this.comment().trim();
+    this.submitted.emit({
+      subjectKind: this.subjectKind(),
+      subjectId: this.subjectId(),
+      scores: {
+        satisfaction: scores.satisfaction ?? Number.NaN,
+        quality: scores.quality ?? Number.NaN,
+        deadline: scores.deadline ?? Number.NaN,
+        clarity: scores.clarity ?? Number.NaN,
+        channel: scores.channel ?? Number.NaN,
+      },
+      ...(comment.length > 0 ? { comment } : {}),
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/shared/manifestation-form.component.ts b/apps/portal/web/src/app/shared/manifestation-form.component.ts
new file mode 100644
index 00000000..da4251e0
--- /dev/null
+++ b/apps/portal/web/src/app/shared/manifestation-form.component.ts
@@ -0,0 +1,271 @@
+// ManifestationForm (contrato CTG-0003c §5.6; [RN-PORTAL-109]; [RN-PORTAL-122]; [UC-PORTAL-016];
+// H.51): tipo (5 rádios), descrição com o hint "sem motivo determinante", sigilo, anonimato (só
+// com sessão; sem sessão o envio é anônimo e a tela avisa que não haverá acompanhamento) e a
+// finalidade da coleta com link à tela de dados. Recebimento irrecusável: o botão de enviar
+// nunca é desabilitado por conteúdo (só durante `submitting`); `ManifestacaoSchema` só orienta —
+// o corpo sobe como está e o servidor decide. Sem `AttachmentUploader` ([DIVERGE-19]:
+// `attachmentIds: []`). O comprovante imediato (`receipt`) aparece em `role="status"` com protocolo,
+// recebimento e o prazo do órgão (`agencyDueOn`, do servidor) e — só quando não anônima — o link
+// de acompanhamento ([DIVERGE-20]).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+  signal,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../core/field-errors.directive';
+import type {
+  ManifestationCreateBody,
+  ManifestationCreated,
+  ManifestationKind,
+} from '../data/portal-read.models';
+import type { CommandStatus } from '../features/processos/processos.facade';
+import { ManifestacaoSchema } from '../forms/manifestacao.schema';
+import { DeadlineCardComponent } from './deadline-card.component';
+
+/** `ManifestationCreateDto.kind`; WF-PORTAL-004. */
+export const MANIFESTATION_KINDS: readonly ManifestationKind[] = [
+  'reclamacao',
+  'denuncia',
+  'sugestao',
+  'elogio',
+  'solicitacao',
+];
+
+const KIND_KEY_PREFIX = `portal.forms.manifestacao.tipo.`;
+const OWN_DATA_ROUTE = '/privacidade/meus-dados';
+const MANIFESTATION_ROUTE_PREFIX = '/ouvidoria/';
+
+@Component({
+  selector: 'portal-manifestation-form',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    PortalFieldErrorsDirective,
+    DeadlineCardComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-status]': 'status()',
+    '[attr.data-anonymous]': 'anonymous() ? "true" : "false"',
+  },
+  template: `
+    <form
+      class="portal-manifestation-form"
+      [portalFieldErrors]="fields()"
+      (submit)="onSubmit($event)"
+    >
+      <fieldset>
+        <legend>{{ 'portal.forms.manifestacao.tipo' | stynxTranslate }}</legend>
+        @for (option of kinds; track option) {
+          <label>
+            <input
+              type="radio"
+              name="kind"
+              [value]="option"
+              [checked]="kind() === option"
+              [disabled]="busy()"
+              (change)="kind.set(option)"
+            />
+            <span>{{ kindKey(option) | stynxTranslate }}</span>
+          </label>
+        }
+      </fieldset>
+      <p id="kind-error" data-field-error>
+        @if (fields().includes('kind')) {
+          {{ 'portal.errors.manifestation_kind_invalid' | stynxTranslate }}
+        }
+      </p>
+
+      <label>
+        <span>{{
+          'portal.forms.manifestacao.descricao' | stynxTranslate
+        }}</span>
+        <textarea
+          name="text"
+          rows="6"
+          [value]="text()"
+          [disabled]="busy()"
+          (input)="text.set(textOf($event))"
+        ></textarea>
+      </label>
+      <p id="portal-manifestation-hint" data-hint>
+        {{ 'portal.forms.manifestacao.hint' | stynxTranslate }}
+      </p>
+      <p id="text-error" data-field-error>
+        @if (fields().includes('text')) {
+          {{ 'portal.errors.validation_failed' | stynxTranslate }}
+        }
+      </p>
+
+      <label>
+        <input
+          type="checkbox"
+          name="confidential"
+          [checked]="confidential()"
+          [disabled]="busy()"
+          (change)="confidential.set(checkedOf($event))"
+        />
+        <span>{{ 'portal.forms.manifestacao.sigilo' | stynxTranslate }}</span>
+      </label>
+
+      @if (sessionActive()) {
+        <label>
+          <input
+            type="checkbox"
+            name="anonymous"
+            [checked]="anonymousChoice()"
+            [disabled]="busy()"
+            (change)="anonymousChoice.set(checkedOf($event))"
+          />
+          <span>{{
+            'portal.forms.manifestacao.anonimo' | stynxTranslate
+          }}</span>
+        </label>
+      }
+      @if (anonymous()) {
+        <p role="status" data-anonymous-notice>
+          {{
+            'portal.forms.manifestacao.anonimo_sem_acompanhamento'
+              | stynxTranslate
+          }}
+        </p>
+      }
+
+      <p data-purpose>
+        {{ 'portal.forms.manifestacao.finalidade' | stynxTranslate }}
+        <a [routerLink]="ownDataRoute" [attr.routerLink]="ownDataRoute">{{
+          'portal.screens.t24.title' | stynxTranslate
+        }}</a>
+      </p>
+
+      @if (localHint(); as hint) {
+        <p role="status" data-local-hint>{{ hint | stynxTranslate }}</p>
+      }
+
+      <button
+        type="submit"
+        class="portal-primary"
+        data-submit
+        [disabled]="busy()"
+      >
+        {{ 'portal.screens.t21.cmd.enviar' | stynxTranslate }}
+      </button>
+    </form>
+
+    @if (receipt(); as receipt) {
+      <section role="status" data-receipt class="portal-manifestation-receipt">
+        <dl>
+          <dt>{{ 'portal.common.receipt.number' | stynxTranslate }}</dt>
+          <dd data-protocol>{{ receipt.protocol }}</dd>
+          <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
+          <dd>
+            <time [attr.datetime]="receipt.receivedAt">{{
+              receipt.receivedAt | stynxIntlDate: dateTimeFormat
+            }}</time>
+          </dd>
+        </dl>
+        <portal-deadline-card
+          [dueOn]="receipt.agencyDueOn"
+          ownedBy="agency"
+          labelKey="portal.screens.t22.field.prazo_orgao"
+        />
+        @if (!receipt.anonymous) {
+          <p>
+            <a
+              [routerLink]="manifestationRoute(receipt.manifestationId)"
+              [attr.routerLink]="manifestationRoute(receipt.manifestationId)"
+              data-follow-up
+              >{{ 'portal.screens.t22.title' | stynxTranslate }}</a
+            >
+          </p>
+        } @else {
+          <p data-anonymous-receipt>
+            {{
+              'portal.forms.manifestacao.anonimo_sem_acompanhamento'
+                | stynxTranslate
+            }}
+          </p>
+        }
+      </section>
+    }
+  `,
+})
+export class ManifestationFormComponent {
+  /** `SessionFacade.active()`: `false` → `anonymous` forçado `true`. */
+  readonly sessionActive = input.required<boolean>();
+  readonly status = input<CommandStatus>('idle');
+  /** `['kind']` de MANIFESTATION_KIND_INVALID. */
+  readonly fields = input<readonly string[]>([]);
+  /** Comprovante imediato. */
+  readonly receipt = input<ManifestationCreated | null>(null);
+  readonly submitted = output<ManifestationCreateBody>();
+
+  readonly kinds = MANIFESTATION_KINDS;
+  readonly ownDataRoute = OWN_DATA_ROUTE;
+  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+  readonly kind = signal<ManifestationKind | null>(null);
+  readonly text = signal('');
+  readonly confidential = signal(false);
+  readonly anonymousChoice = signal(false);
+
+  readonly busy = computed(() => this.status() === 'submitting');
+  /** Sem sessão: anônimo fixo (H.51; OD-P44). */
+  readonly anonymous = computed(
+    () => !this.sessionActive() || this.anonymousChoice(),
+  );
+  /** Orientação local (`ManifestacaoSchema`); nunca impede o envio. */
+  readonly localHint = computed<string | null>(() => {
+    const kind = this.kind();
+    if (kind === null && this.text().length === 0) return null;
+    const parsed = ManifestacaoSchema.safeParse({
+      kind,
+      text: this.text(),
+      attachmentIds: [],
+    });
+    return parsed.success ? null : 'portal.screens.t21.state.erro_recuperavel';
+  });
+
+  kindKey(kind: string): string {
+    return `${KIND_KEY_PREFIX}${kind}`;
+  }
+
+  manifestationRoute(manifestationId: string): string {
+    return `${MANIFESTATION_ROUTE_PREFIX}${manifestationId}`;
+  }
+
+  textOf(event: Event): string {
+    return (event.target as HTMLTextAreaElement).value;
+  }
+
+  checkedOf(event: Event): boolean {
+    return (event.target as HTMLInputElement).checked;
+  }
+
+  /**
+   * Emite o corpo TAL COMO ESTÁ (recebimento irrecusável; o servidor decide): sem tipo escolhido
+   * o campo vai ausente e o servidor responde `400 MANIFESTATION_KIND_INVALID` — nunca um tipo
+   * escolhido pelo cliente.
+   */
+  onSubmit(event: Event): void {
+    event.preventDefault();
+    if (this.busy()) return;
+    const kind = this.kind();
+    const body: Partial<ManifestationCreateBody> = {
+      ...(kind !== null ? { kind } : {}),
+      text: this.text(),
+      confidential: this.confidential(),
+      attachmentIds: [],
+      anonymous: this.anonymous(),
+    };
+    this.submitted.emit(body as ManifestationCreateBody);
+  }
+}
diff --git a/apps/portal/web/src/app/shared/notification-list.component.ts b/apps/portal/web/src/app/shared/notification-list.component.ts
new file mode 100644
index 00000000..9961c542
--- /dev/null
+++ b/apps/portal/web/src/app/shared/notification-list.component.ts
@@ -0,0 +1,168 @@
+// NotificationList (contrato CTG-0003c §5.1; ficha T12; [RN-PORTAL-124]; [WF-PORTAL-003]): lista
+// semântica das notificações da caixa (A9(b)). Por item: tipo (ícone + texto, nunca só cor), canal
+// de origem traduzido, assunto/resumo do servidor, datas, prazo como `DeadlineCard` e — SÓ para a
+// origem SNE — a data de ciência ficta TAL COMO RECEBIDA do servidor (`fictitiousAcknowledgementOn`;
+// nunca derivada de `availableOn`, [DIVERGE-4]). Tokens (`kind`, `source`, `category`) ficam em
+// `data-*` e só os rótulos do catálogo viram texto. O link do assunto vai ao AIT ou ao processo,
+// nunca à home. "Marcar como lida" só com `readOn === null`; a navegação é da página.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  input,
+  output,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import type { InboxItem } from '../data/portal-read.models';
+import { DeadlineCardComponent } from './deadline-card.component';
+
+const AIT_ROUTE_PREFIX = '/autos/';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const INBOX_ROUTE = '/notificacoes';
+const KIND_KEY_PREFIX = `portal.notifications.kind.`;
+const ORIGIN_KEY_PREFIX = `portal.notifications.origin.`;
+const NEXT_ACTION_KEY_PREFIX = `portal.situation.next_action.`;
+
+/** Ícone por tipo (texto sempre ao lado — ux-notes §f; T12 §9). */
+const KIND_ICON: Readonly<Record<InboxItem['kind'], string>> = {
+  acao_necessaria: '⚠',
+  informativo: 'ℹ',
+};
+
+@Component({
+  selector: 'portal-notification-list',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DeadlineCardComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { 'aria-live': 'polite', '[attr.data-count]': 'items().length' },
+  template: `
+    <ol data-notification-list class="portal-notification-list">
+      @for (item of items(); track item.id) {
+        <li
+          class="portal-notification"
+          [attr.data-id]="item.id"
+          [attr.data-kind]="item.kind"
+          [attr.data-source]="item.source"
+          [attr.data-category]="item.category"
+          [attr.data-read]="item.readOn ? 'true' : 'false'"
+        >
+          <p class="portal-notification-kind">
+            <span aria-hidden="true">{{ iconFor(item.kind) }}</span>
+            <span>{{ kindKey(item.kind) | stynxTranslate }}</span>
+          </p>
+          <h3>
+            <a
+              [routerLink]="subjectRoute(item)"
+              [attr.routerLink]="subjectRoute(item)"
+              >{{
+                subjectText(item) ?? (kindKey(item.kind) | stynxTranslate)
+              }}</a
+            >
+          </h3>
+          @if (item.subject && item.summary) {
+            <p data-summary>{{ item.summary }}</p>
+          }
+          <p data-source-label>
+            {{
+              'portal.screens.t12.field.canal'
+                | stynxTranslate
+                  : { source: (originKey(item.source) | stynxTranslate) }
+            }}
+          </p>
+          @if (item.availableOn; as availableOn) {
+            <p data-available-on>
+              <time [attr.datetime]="availableOn">{{
+                'portal.screens.t12.field.disponibilizada_em'
+                  | stynxTranslate
+                    : { availableOn: (availableOn | stynxIntlDate) }
+              }}</time>
+            </p>
+          }
+          @if (item.readOn; as readOn) {
+            <p data-read-on>
+              <time [attr.datetime]="readOn">{{
+                'portal.screens.t12.field.lida_em'
+                  | stynxTranslate: { readOn: (readOn | stynxIntlDate) }
+              }}</time>
+            </p>
+          }
+          @if (
+            item.source === 'sne' && item.fictitiousAcknowledgementOn;
+            as on
+          ) {
+            <p data-fictitious-acknowledgement>
+              <span>{{
+                'portal.notifications.ciencia_ficta' | stynxTranslate
+              }}</span>
+              <time [attr.datetime]="on">{{
+                'portal.screens.t12.field.ciencia_ficta_em'
+                  | stynxTranslate: { date: (on | stynxIntlDate) }
+              }}</time>
+            </p>
+          }
+          @if (item.deadline; as deadline) {
+            <portal-deadline-card
+              [dueOn]="deadline.dueOn"
+              [ownedBy]="deadline.ownedBy"
+              [labelKey]="nextActionKey(deadline.ownedBy)"
+            />
+          }
+          @if (!item.readOn) {
+            <button
+              type="button"
+              data-mark-read
+              [disabled]="busy()"
+              (click)="read.emit(item.id)"
+            >
+              {{ markReadLabelKey() | stynxTranslate }}
+            </button>
+          }
+        </li>
+      }
+    </ol>
+  `,
+})
+export class NotificationListComponent {
+  readonly items = input.required<readonly InboxItem[]>();
+  /** Desabilita "marcar como lida". */
+  readonly busy = input(false);
+  readonly markReadLabelKey = input<string>(
+    'portal.screens.t12.cmd.marcar_lida',
+  );
+  /** `inboxItemId`. */
+  readonly read = output<string>();
+  /** Reservado à página (contrato §5.1): a navegação do assunto é o `routerLink` do item. */
+  readonly opened = output<InboxItem>();
+
+  /** `subject`, senão `summary` (texto do servidor); ausentes → rótulo do tipo. */
+  subjectText(item: InboxItem): string | null {
+    return item.subject ?? item.summary ?? null;
+  }
+
+  iconFor(kind: InboxItem['kind']): string {
+    return KIND_ICON[kind];
+  }
+
+  kindKey(kind: string): string {
+    return `${KIND_KEY_PREFIX}${kind}`;
+  }
+
+  originKey(source: string): string {
+    return `${ORIGIN_KEY_PREFIX}${source}`;
+  }
+
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `${NEXT_ACTION_KEY_PREFIX}${ownedBy}`;
+  }
+
+  /** `aitId` → `/autos/<aitId>`; `requestId` → `/processos/<requestId>`; nenhum → `/notificacoes` (T12 §6). */
+  subjectRoute(item: InboxItem): string {
+    if (item.aitId) return `${AIT_ROUTE_PREFIX}${item.aitId}`;
+    if (item.requestId) return `${PROCESS_ROUTE_PREFIX}${item.requestId}`;
+    return INBOX_ROUTE;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/own-data-panel.component.ts b/apps/portal/web/src/app/shared/own-data-panel.component.ts
new file mode 100644
index 00000000..88ceba1d
--- /dev/null
+++ b/apps/portal/web/src/app/shared/own-data-panel.component.ts
@@ -0,0 +1,149 @@
+// OwnDataPanel (contrato CTG-0003c §5.5; [RN-PORTAL-118]; [RN-PORTAL-121]; [RN-PORTAL-117]):
+// os dados que o órgão tem sobre o titular, por seção (cadastro, infrações, sinistros, exames),
+// cada valor exibido POR INTEIRO em `<dd>` — o titular vê o próprio dado sem máscara; máscara é
+// decisão de quem olha × de quem é o dado, feita no servidor, e este componente não contém
+// lógica alguma de ocultação. Categoria documental (A/B/C) e origem como rótulos; botão de
+// correção AO LADO de cada dado `correctable` (emite `correctRequested`); supressão de dado de
+// terceiro anunciada com motivo visível; cada seção linka a tela funcional em vez de duplicar.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  input,
+  output,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+
+/** spec §5.2; RN-PORTAL-117 A/B/C. */
+export type OwnDataCategory = 'documento' | 'copia' | 'consulta';
+
+export interface OwnDataField {
+  /** ex.: 'cpf', 'name'. */
+  readonly name: string;
+  /** OD-P89: `portal.forms.meus_dados.campo.cpf` | `.nome`. */
+  readonly labelKey: string;
+  /** SEM máscara (titular). */
+  readonly value: string | null;
+  readonly category: OwnDataCategory;
+  /** Origem (texto do servidor; ex.: 'RENACH'); `null` → não renderiza. */
+  readonly source: string | null;
+  readonly correctable: boolean;
+  /** Padrão `portal.screens.t24.cmd.corrigir`. */
+  readonly correctLabelKey?: string;
+}
+
+export interface OwnDataSection {
+  /** 'cadastro' | 'infracoes' | 'sinistros' | 'exames' → `data-section`. */
+  readonly key: string;
+  readonly titleKey: string;
+  /** Tela funcional ([JRN-PORTAL-011] 2). */
+  readonly route: string | null;
+  readonly fields: readonly OwnDataField[];
+  /** `portal.errors.crash_third_party_data_restricted` quando houver supressão anunciada. */
+  readonly suppressedNoticeKey?: string;
+}
+
+export interface CorrectRequest {
+  readonly section: string;
+  readonly field: string;
+}
+
+const DEFAULT_CORRECT_LABEL_KEY = 'portal.screens.t24.cmd.corrigir';
+
+const CATEGORY_LABEL_KEY: Readonly<Record<OwnDataCategory, string>> = {
+  documento: 'portal.documents.category.documento',
+  copia: 'portal.documents.category.copia',
+  consulta: 'portal.documents.consulta.notDocument',
+};
+
+@Component({
+  selector: 'portal-own-data-panel',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-sections]': 'sections().length' },
+  template: `
+    @for (section of sections(); track section.key) {
+      <section
+        class="portal-own-data-section"
+        [attr.data-section]="section.key"
+        [attr.aria-labelledby]="sectionTitleId(section)"
+      >
+        <h3 [id]="sectionTitleId(section)">
+          {{ section.titleKey | stynxTranslate }}
+        </h3>
+        @if (section.suppressedNoticeKey; as noticeKey) {
+          <p role="status" data-suppressed-notice>
+            {{ noticeKey | stynxTranslate }}
+          </p>
+        }
+        @if (section.fields.length > 0) {
+          <dl class="portal-own-data-fields">
+            @for (field of section.fields; track field.name) {
+              <div
+                class="portal-own-data-field"
+                [attr.data-name]="field.name"
+                [attr.data-category]="field.category"
+              >
+                <dt>{{ field.labelKey | stynxTranslate }}</dt>
+                <dd [attr.data-field]="field.name">{{ field.value ?? '' }}</dd>
+                <dd class="portal-own-data-meta">
+                  <span data-category-label>{{
+                    categoryKey(field.category) | stynxTranslate
+                  }}</span>
+                  @if (field.source; as source) {
+                    <span data-source>{{
+                      'portal.documents.consulta.source'
+                        | stynxTranslate: { source }
+                    }}</span>
+                  }
+                  @if (field.correctable) {
+                    <button
+                      type="button"
+                      data-correct
+                      [attr.data-field]="field.name"
+                      (click)="
+                        correctRequested.emit({
+                          section: section.key,
+                          field: field.name,
+                        })
+                      "
+                    >
+                      {{
+                        field.correctLabelKey ?? defaultCorrectLabelKey
+                          | stynxTranslate
+                      }}
+                    </button>
+                  }
+                </dd>
+              </div>
+            }
+          </dl>
+        }
+        @if (section.route; as route) {
+          <p>
+            <a
+              [routerLink]="route"
+              [attr.routerLink]="route"
+              data-section-link
+              >{{ section.titleKey | stynxTranslate }}</a
+            >
+          </p>
+        }
+      </section>
+    }
+  `,
+})
+export class OwnDataPanelComponent {
+  readonly sections = input.required<readonly OwnDataSection[]>();
+  readonly correctRequested = output<CorrectRequest>();
+
+  readonly defaultCorrectLabelKey = DEFAULT_CORRECT_LABEL_KEY;
+
+  categoryKey(category: OwnDataCategory): string {
+    return CATEGORY_LABEL_KEY[category];
+  }
+
+  sectionTitleId(section: OwnDataSection): string {
+    return `portal-own-data-${section.key}-title`;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/sne-consent.component.ts b/apps/portal/web/src/app/shared/sne-consent.component.ts
new file mode 100644
index 00000000..f953a1d8
--- /dev/null
+++ b/apps/portal/web/src/app/shared/sne-consent.component.ts
@@ -0,0 +1,292 @@
+// SneConsent (contrato CTG-0003c §5.2; [RN-PORTAL-123]; A5; ficha T09): os QUATRO efeitos da
+// adesão ao SNE (`portal.legal.efeitos_sne.v1.<efeito>`, nomes de A5) lado a lado, um por linha,
+// ANTES do botão; formulário com e-mail, celular, canal e o checkbox único de aceite (não
+// pré-marcado; botão desabilitado até marcá-lo); `enroll` emite o corpo do fio — `effectsAck` com
+// o enum do OpenAPI (`SNE_WIRE_EFFECTS`, OD-P61) e `textVersion` = `LEGAL_TEXT_VERSION`. Estado
+// "aderido": `since`/canal e o botão de cancelar SEMPRE visível, precedido do aviso do efeito
+// `cancelamento` e de um motivo opcional. NENHUMA faixa de pagamento, "60%/40%" nem link a
+// pagamento aqui: adesão e decisão de pagar são telas distintas ([RN-PORTAL-123] trava 1). A
+// validação de forma (`AdesaoSneSchema`) só orienta — o servidor decide (`SNE_CONTACT_REQUIRED`).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+  signal,
+} from '@angular/core';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../core/field-errors.directive';
+import type {
+  SneChannel,
+  SneEnrollment,
+  SneEnrollmentCancelBody,
+  SneEnrollmentCreateBody,
+  WireSneEffect,
+} from '../data/portal-read.models';
+import type { CommandStatus } from '../features/processos/processos.facade';
+import { AdesaoSneSchema } from '../forms/adesao-sne.schema';
+import {
+  LEGAL_TEXT_VERSION,
+  SNE_EFFECTS,
+} from './consequence-dialog.component';
+
+/** Enum do fio (`SneEnrollmentCreateDto.consent.effectsAck`; OD-P61) — a tela mostra os nomes de A5. */
+export const SNE_WIRE_EFFECTS: readonly WireSneEffect[] = [
+  'ciencia_ficta',
+  'canal_exclusivo',
+  'desconto_60',
+  'cancelamento',
+];
+
+const DEFAULT_CHANNELS: readonly SneChannel[] = ['email', 'sne', 'push'];
+const EFFECT_KEY_PREFIX = `portal.legal.efeitos_sne.v1.`;
+const CHANNEL_KEY_PREFIX = `portal.forms.preferencias.canal.`;
+
+@Component({
+  selector: 'portal-sne-consent',
+  imports: [StynxTranslatePipe, StynxIntlDatePipe, PortalFieldErrorsDirective],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-text-version': LEGAL_TEXT_VERSION,
+    '[attr.data-enrolled]': 'enrolled() ? "true" : "false"',
+    '[attr.data-status]': 'status()',
+  },
+  template: `
+    <section
+      class="portal-sne-effects"
+      aria-labelledby="portal-sne-effects-title"
+    >
+      <p id="portal-sne-effects-title">
+        {{ 'portal.legal.efeitos_sne.v1' | stynxTranslate }}
+      </p>
+      <ol>
+        @for (effect of effects; track effect) {
+          <li [attr.data-effect]="effect">
+            {{ effectKey(effect) | stynxTranslate }}
+          </li>
+        }
+      </ol>
+    </section>
+
+    @if (enrollment(); as enrollment) {
+      @if (enrollment.enrolled) {
+        <section class="portal-sne-enrolled" data-enrolled-state>
+          <p role="status">
+            {{ 'portal.screens.t09.state.aderido' | stynxTranslate }}
+          </p>
+          <dl>
+            @if (enrollment.since; as since) {
+              <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
+              <dd>
+                <time [attr.datetime]="since">{{ since | stynxIntlDate }}</time>
+              </dd>
+            }
+            @if (enrollment.channel; as channel) {
+              <dt>{{ 'portal.forms.preferencias.canal' | stynxTranslate }}</dt>
+              <dd [attr.data-token]="channel">
+                {{ channelKey(channel) | stynxTranslate }}
+              </dd>
+            }
+          </dl>
+          <form
+            class="portal-sne-cancel"
+            [portalFieldErrors]="fields()"
+            (submit)="onCancel($event)"
+          >
+            <p data-cancel-effect>
+              {{ effectKey('cancelamento') | stynxTranslate }}
+            </p>
+            <label>
+              <span>{{
+                'portal.forms.cancelamento_sne.motivo' | stynxTranslate
+              }}</span>
+              <textarea
+                name="reason"
+                rows="3"
+                [value]="reason()"
+                [disabled]="busy()"
+                (input)="reason.set(textOf($event))"
+              ></textarea>
+            </label>
+            <button
+              type="submit"
+              data-cancel
+              class="portal-sne-confirm"
+              [attr.aria-disabled]="
+                !enrollment.cancelable || busy() ? 'true' : null
+              "
+              [disabled]="busy()"
+            >
+              {{ 'portal.screens.t09.cmd.cancel' | stynxTranslate }}
+            </button>
+          </form>
+        </section>
+      } @else {
+        <form
+          class="portal-sne-form"
+          [portalFieldErrors]="fields()"
+          (submit)="onEnroll($event)"
+        >
+          <p role="status">
+            {{ 'portal.screens.t09.state.nao_aderido' | stynxTranslate }}
+          </p>
+          <label>
+            <span>{{ 'portal.forms.adesao_sne.email' | stynxTranslate }}</span>
+            <input
+              type="email"
+              name="email"
+              autocomplete="email"
+              [value]="email()"
+              [disabled]="busy()"
+              (input)="email.set(textOf($event))"
+            />
+          </label>
+          <p id="email-error" data-field-error>
+            @if (fields().includes('email')) {
+              {{ 'portal.errors.sne_contact_required' | stynxTranslate }}
+            }
+          </p>
+          <label>
+            <span>{{
+              'portal.forms.adesao_sne.celular' | stynxTranslate
+            }}</span>
+            <input
+              type="tel"
+              name="phone"
+              autocomplete="tel-national"
+              inputmode="numeric"
+              [value]="phone()"
+              [disabled]="busy()"
+              (input)="phone.set(textOf($event))"
+            />
+          </label>
+          <p id="phone-error" data-field-error>
+            @if (fields().includes('phone')) {
+              {{ 'portal.errors.sne_contact_required' | stynxTranslate }}
+            }
+          </p>
+          <label>
+            <span>{{
+              'portal.forms.preferencias.canal' | stynxTranslate
+            }}</span>
+            <select
+              name="channel"
+              [value]="channel()"
+              [disabled]="busy()"
+              (change)="channel.set(channelOf($event))"
+            >
+              @for (option of channels(); track option) {
+                <option [value]="option" [selected]="option === channel()">
+                  {{ channelKey(option) | stynxTranslate }}
+                </option>
+              }
+            </select>
+          </label>
+          @if (localHint(); as hint) {
+            <p role="status" data-local-hint>{{ hint | stynxTranslate }}</p>
+          }
+          <label class="portal-sne-ack">
+            <input
+              type="checkbox"
+              name="aceite"
+              [checked]="accepted()"
+              [disabled]="busy()"
+              (change)="accepted.set(checkedOf($event))"
+            />
+            <span>{{ 'portal.forms.adesao_sne.aceite' | stynxTranslate }}</span>
+          </label>
+          <button
+            type="submit"
+            class="portal-sne-confirm"
+            data-enroll
+            [disabled]="!accepted() || busy()"
+          >
+            {{ 'portal.screens.t09.cmd.enroll' | stynxTranslate }}
+          </button>
+        </form>
+      }
+    } @else {
+      <p role="status">
+        {{ 'portal.screens.t09.state.loading' | stynxTranslate }}
+      </p>
+    }
+  `,
+})
+export class SneConsentComponent {
+  /** `null` enquanto carrega. */
+  readonly enrollment = input.required<SneEnrollment | null>();
+  readonly status = input<CommandStatus>('idle');
+  /** `missing[]` de SNE_CONTACT_REQUIRED → `PortalFieldErrorsDirective`. */
+  readonly fields = input<readonly string[]>([]);
+  /** `SneEnrollmentCreateDto.channel?`; rótulos `portal.forms.preferencias.canal.<canal>`. */
+  readonly channels = input<readonly SneChannel[]>(DEFAULT_CHANNELS);
+  readonly enroll = output<SneEnrollmentCreateBody>();
+  // eslint-disable-next-line @angular-eslint/no-output-native -- nome fixado pelo contrato CTG-0003c §5.2
+  readonly cancel = output<SneEnrollmentCancelBody>();
+
+  readonly effects = SNE_EFFECTS;
+  readonly email = signal('');
+  readonly phone = signal('');
+  readonly channel = signal<SneChannel>(DEFAULT_CHANNELS[0]);
+  readonly accepted = signal(false);
+  readonly reason = signal('');
+
+  readonly enrolled = computed(() => this.enrollment()?.enrolled === true);
+  readonly busy = computed(() => this.status() === 'submitting');
+  /** Orientação local de forma (`AdesaoSneSchema`); nunca bloqueia o envio. */
+  readonly localHint = computed<string | null>(() => {
+    if (this.email().length === 0 && this.phone().length === 0) return null;
+    const parsed = AdesaoSneSchema.safeParse({
+      email: this.email(),
+      phone: this.phone(),
+      consent: {
+        textVersion: LEGAL_TEXT_VERSION,
+        effectsAck: [...SNE_WIRE_EFFECTS],
+      },
+    });
+    return parsed.success ? null : 'portal.screens.t09.state.ineligible';
+  });
+
+  effectKey(effect: string): string {
+    return `${EFFECT_KEY_PREFIX}${effect}`;
+  }
+
+  channelKey(channel: string): string {
+    return `${CHANNEL_KEY_PREFIX}${channel}`;
+  }
+
+  textOf(event: Event): string {
+    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
+  }
+
+  checkedOf(event: Event): boolean {
+    return (event.target as HTMLInputElement).checked;
+  }
+
+  channelOf(event: Event): SneChannel {
+    const value = (event.target as HTMLSelectElement).value;
+    return this.channels().find((option) => option === value) ?? this.channel();
+  }
+
+  onEnroll(event: Event): void {
+    event.preventDefault();
+    if (!this.accepted() || this.busy()) return;
+    this.enroll.emit({
+      email: this.email(),
+      phone: this.phone(),
+      channel: this.channel(),
+      consent: {
+        textVersion: LEGAL_TEXT_VERSION,
+        effectsAck: [...SNE_WIRE_EFFECTS],
+      },
+    });
+  }
+
+  onCancel(event: Event): void {
+    event.preventDefault();
+    if (this.busy() || this.enrollment()?.cancelable === false) return;
+    const reason = this.reason().trim();
+    this.cancel.emit(reason.length > 0 ? { reason } : {});
+  }
+}
```
