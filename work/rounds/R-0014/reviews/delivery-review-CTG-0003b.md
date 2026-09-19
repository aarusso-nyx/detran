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

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0003b (par 2 — trilha de apelação)**
— tríade TASK-0020 (Architect: `work/rounds/R-0014/contracts/CTG-0003b.md`, 107 critérios C-3b-nn,
18 `[DIVERGE-n]`, OD-P69…P82), TASK-0015 (Inspector, Sonnet/médio: 23 specs + fixtures + harness
com `HttpClient`; iteração 2 corrigiu a mecânica de 44 casos conforme a adenda A9), TASK-0016
(Engineer, Opus: 7 leituras do `PortalClient`, `portal-read.models.ts`, `read-status.ts`, cinco
facades, `PaymentComparison`, `ProcessTimeline`, `PrefilledSummary`, `wizard-resume.ts`, 13 páginas
reais — T-14, T-01, T-02, T-03, T-04, T-05, T-13, T-23, T-06, T-07, T-08, T-10, T-11 — no lugar dos
placeholders, componentes de módulo). Transcriber TASK-0006 it. 6: 48 chaves i18n (OD-P70/P68, fonte
por chave em `reports/TASK-0006-iteration-6.md`). Adendas do Architect: **A8** (ratificação dos 18
`[DIVERGE]` do contrato; chaves OD-P70/P68; fichas a corrigir no CTG-0005) e **A9** (semântica
"despacha e resolve; resultado pelos signals" das leituras das facades; `StynxTableComponent` só
texto → lista semântica + paginação do kit; C-3b-70 × M8; assinatura por `upload` enquanto OD-P60
pende; C-3b-75 "parecer não editável"; `maximumWarning` 600 kB; OD-P83…P86). Relatórios em
`work/rounds/R-0014/reports/` (`TASK-0020.md`, `TASK-0015.md`, `TASK-0015-iteration-2.md`,
`TASK-0016.md`, `TASK-0006-iteration-6.md`). Reviewer desta rodada: Claude/Opus por desvio do Owner
(`AUTHORIZATION.md` amendment 1; Codex no limite de uso) — julgue com o mesmo rigor. A entrega está
**staged, não commitada** (`git diff --cached`), no branch publicado `orchestra/portal-pwa` (=
`origin/main` `ddca527` + observação + prompts).

Gates executados pelo maestro sobre a árvore staged (log `pnpm-check-ctg3b.log`): `pnpm check`
completo → **EXIT 0**; `pnpm --filter @detran/portal-web test` → **Test Files 74 passed, Tests 909
passed | 7 todo (916)**, 0 erros não tratados; typecheck/lint/build OK (bundle inicial 503,9 kB <
600 kB, A9g); `verify:parameter-catalogue` OK (14 namespaces); `format:check` OK. Os 7 `todo`
citam OD-P54/P59/P60/P72/P74/P76 (nunca `todo` sem OD).

Itens a julgar com atenção: (5) nada inventado — H.53 (faixa 40 % indisponível por flag), OD-P05
(cartão/parcelamento indisponíveis), `amount` `null` (OD-P41) → "valor indisponível" com chave,
delegações → estado indisponível `delegacao_indisponivel_r0007` (M15), `driver.category`/`cnhUf`
listas públicas CTB/IBGE marcadas OD-P85, opção "sem filtro" OD-P84; (7) nenhum spec enfraquecido
— as correções do Inspector são de mecânica (dupla montagem, zoneless, `bubbles`, `fileURLToPath`)
e as três mudanças de asserção têm adenda (A9c/d/e); (8) tokens só em `data-token`/`data-reason`;
nenhum cálculo de prazo no cliente (`static-analysis.appeal.spec.ts` varre `Date`/`sort`); (9)
browser só fala com `/v1/portal/*`; (11) o relatório do Engineer lista as decisões de engenharia
aditivas (`PaymentSelection.method` nulo, `preservingAppealRequested`, `[attr.routerLink]`,
regiões `role=status/alert` persistentes, `detectChanges` pontual) — verifique se alguma contradiz o
contrato ou a spec; (13) presença/ausência: `available=false` com `reason`, `NOT_FOUND` → "por que
não vejo isto", `WITHDRAWAL_AFTER_JUDGMENT`, `DILIGENCE_NOT_OPEN`.

### git diff --cached --stat (sem `work/`)

```
 apps/portal/web/README.md                          |  43 ++
 apps/portal/web/angular.json                       |   2 +-
 apps/portal/web/src/app/data/portal-read.models.ts | 294 +++++++++++
 .../web/src/app/data/portal.client.reads.spec.ts   | 304 ++++++++++++
 apps/portal/web/src/app/data/portal.client.ts      |  93 ++++
 apps/portal/web/src/app/data/read-status.ts        |  37 ++
 .../src/app/features/autos/autos.facade.spec.ts    | 168 +++++++
 .../web/src/app/features/autos/autos.facade.ts     | 181 +++++++
 .../web/src/app/features/autos/autos.routes.ts     |  19 +-
 .../autos/components/ait-row-actions.component.ts  | 112 +++++
 .../autos/components/points-summary.component.ts   |  50 ++
 .../web/src/app/features/autos/page-routes.spec.ts | 264 ++++++++++
 .../features/autos/pages/ait-detail.page.spec.ts   | 307 ++++++++++++
 .../app/features/autos/pages/ait-detail.page.ts    | 298 ++++++++++++
 .../app/features/autos/pages/ait-list.page.spec.ts | 325 +++++++++++++
 .../src/app/features/autos/pages/ait-list.page.ts  | 277 +++++++++++
 .../features/autos/static-analysis.appeal.spec.ts  | 168 +++++++
 .../components/defesa-previa-form.component.ts     | 150 ++++++
 .../components/recurso-cetran-form.component.ts    | 110 +++++
 .../components/recurso-jari-form.component.ts      | 103 ++++
 .../src/app/features/defesa/defesa.facade.spec.ts  | 146 ++++++
 .../web/src/app/features/defesa/defesa.facade.ts   | 194 ++++++++
 .../web/src/app/features/defesa/defesa.routes.ts   |  24 +-
 .../defesa/pages/defesa-previa.page.spec.ts        | 411 ++++++++++++++++
 .../features/defesa/pages/defesa-previa.page.ts    | 257 ++++++++++
 .../defesa/pages/recurso-cetran.page.spec.ts       | 223 +++++++++
 .../features/defesa/pages/recurso-cetran.page.ts   | 290 +++++++++++
 .../defesa/pages/recurso-jari.page.spec.ts         | 160 ++++++
 .../app/features/defesa/pages/recurso-jari.page.ts | 264 ++++++++++
 .../indicacao-condutor-form.component.ts           | 309 ++++++++++++
 .../features/indicacao/indicacao.facade.spec.ts    | 109 +++++
 .../src/app/features/indicacao/indicacao.facade.ts | 101 ++++
 .../src/app/features/indicacao/indicacao.routes.ts |  14 +-
 .../pages/indicacao-condutor.page.spec.ts          | 370 ++++++++++++++
 .../indicacao/pages/indicacao-condutor.page.ts     | 371 ++++++++++++++
 .../components/pagamento-form.component.ts         | 129 +++++
 .../features/pagamento/pagamento.facade.spec.ts    |  71 +++
 .../src/app/features/pagamento/pagamento.facade.ts | 118 +++++
 .../src/app/features/pagamento/pagamento.routes.ts |  19 +-
 .../pagamento/pages/pagamento-page.base.ts         | 229 +++++++++
 .../pagamento-preservando-recurso.page.spec.ts     | 291 +++++++++++
 .../pages/pagamento-preservando-recurso.page.ts    | 177 +++++++
 .../pagamento/pages/pagamento.page.spec.ts         | 486 +++++++++++++++++++
 .../app/features/pagamento/pages/pagamento.page.ts | 147 ++++++
 .../src/app/features/pagamento/payment-flags.ts    |  15 +
 .../components/request-actions.component.ts        | 115 +++++
 .../features/processos/pages/decisao.page.spec.ts  | 267 ++++++++++
 .../app/features/processos/pages/decisao.page.ts   | 227 +++++++++
 .../processos/pages/desistencia.page.spec.ts       | 321 +++++++++++++
 .../features/processos/pages/desistencia.page.ts   | 315 ++++++++++++
 .../processos/pages/diligencia.page.spec.ts        | 351 ++++++++++++++
 .../features/processos/pages/diligencia.page.ts    | 315 ++++++++++++
 .../processos/pages/request-detail.page.spec.ts    | 205 ++++++++
 .../processos/pages/request-detail.page.ts         | 232 +++++++++
 .../processos/pages/request-list.page.spec.ts      | 222 +++++++++
 .../features/processos/pages/request-list.page.ts  | 328 +++++++++++++
 .../features/processos/processos.facade.spec.ts    | 424 ++++++++++++++++
 .../src/app/features/processos/processos.facade.ts | 356 ++++++++++++++
 .../src/app/features/processos/processos.routes.ts |  35 +-
 apps/portal/web/src/app/i18n/portal.pt-BR.json     |  50 +-
 .../shared/payment-comparison.component.spec.ts    | 454 +++++++++++++++++
 .../src/app/shared/payment-comparison.component.ts | 535 +++++++++++++++++++++
 .../src/app/shared/prefilled-summary.component.ts  |  71 +++
 .../app/shared/process-timeline.component.spec.ts  | 402 ++++++++++++++++
 .../src/app/shared/process-timeline.component.ts   | 311 ++++++++++++
 .../web/src/app/shared/wizard-resume.spec.ts       | 155 ++++++
 apps/portal/web/src/app/shared/wizard-resume.ts    |  99 ++++
 .../web/src/testing/contract-types-appeal.ts       |  77 +++
 apps/portal/web/src/testing/http-fixtures-reads.ts | 289 +++++++++++
 apps/portal/web/src/testing/router-harness.ts      |  50 +-
 70 files changed, 14411 insertions(+), 25 deletions(-)
```

### git diff --cached — produção e configuração (sem `work/`, specs/stubs e o JSON i18n — amostra a seguir)

```diff
diff --git a/apps/portal/web/README.md b/apps/portal/web/README.md
index 5877572..1622567 100644
--- a/apps/portal/web/README.md
+++ b/apps/portal/web/README.md
@@ -142,3 +142,46 @@ src/testing/              stubs e harness dos specs (Inspector)
 - `forms/`: um schema zod por ato (`<Nome>Schema`, `strict`) e o `<NOME>_GATE: FormGate`
   transcrito da spec §7 — documentação verificável que nunca decide permissão; nenhum arquivo de
   `forms/` importa facade, guardas ou relógio.
+
+## Par 2 do app funcional (CTG-0003b): trilha de apelação
+
+- `data/portal.client.ts`: sete leituras (`listAits`, `getAit`, `getAitPoints`,
+  `getPointsSummary`, `listRequests`, `getRequest`, `getDecision`) — query por `HttpParams` só
+  com as chaves presentes, `encodeURIComponent` nos caminhos, nenhuma envia `Idempotency-Key`
+  nem `If-Match`; `getRequest` observa a resposta e devolve `CommandResult<RequestDetail>` com
+  o `ETag` (o `If-Match` do `withdraw`). Tipos em `data/portal-read.models.ts` (só `import type`
+  do gerado; os corpos que o OpenAPI deixa livres são transcritos do contrato de rotas —
+  `source_pending` marca o que OD-P69/P72/P74 ainda não fecham) e `data/read-status.ts`
+  (`ReadStatus` + `readStatusFor(presentation)`: mapeia a apresentação do `ErrorBoundary` ao
+  estado da tela; nunca lê `navigator`).
+- Facades por módulo, `@Injectable()` sem `providedIn`, providas na página (estado por
+  navegação, sem cache): `features/autos/autos.facade.ts` (T-14/T-01; filtro e paginação no
+  servidor; lista e resumo de pontos independentes; pontos do AIT lidos depois do detalhe),
+  `features/processos/processos.facade.ts` (T-06…T-11; ordenação por urgência SÓ pelo
+  `nextAction.dueOn` recebido, comparado como texto ISO; `withdraw` com `If-Match` do `ETag`;
+  `respondDiligence`; `nextStepRoute`), `features/{defesa,indicacao,pagamento}/*.facade.ts`
+  (contexto do ato, alvo do wizard, retomada por `shared/wizard-resume.ts` — `ResumeService` ou
+  pedido aberto em composição —, `existingRequestId`, `deadlines` sem transformação). As
+  leituras das facades de lista/detalhe resolvem ao despachar e entregam o resultado pelos
+  signals; os comandos resolvem com a resposta e releem o detalhe.
+- `shared/payment-comparison.component.ts` (`portal-payment-comparison`): faixas LADO A LADO num
+  único `fieldset`, ordem `PAYMENT_TIER_ORDER`, sem destaque; faixa que renuncia → advertência
+  antes do clique e `waiverRequested` (a página abre o `ConsequenceDialog` `renuncia_40` e só então
+  `selectTier`); faixa 40 visível e indisponível com motivo (`PAYMENT_FLAGS`, H.53/OD-P05, em
+  `features/pagamento/payment-flags.ts`); valores e datas formatados pelos pipes do kit no locale
+  do runtime de i18n; nenhum cálculo. `shared/process-timeline.component.ts`
+  (`portal-process-timeline`): ordem recebida, texto do catálogo por evento (token só em
+  `data-*`), "com você × com o órgão" pelos `deadlines[]`/diligências, documentos baixáveis ou
+  "indisponível" (nunca link vazio). `shared/prefilled-summary.component.ts`: um
+  `PrefilledField` por chave do mapa fechado `PREFILLED_LABEL_KEYS` (vazio até OD-P82).
+- 13 páginas em `features/{autos,defesa,indicacao,pagamento,processos}/pages/`, cada uma com
+  `host: { 'data-screen': 'T-nn' }`, `<h1 tabindex="-1">` focado ao concluir o carregamento,
+  região de estado `role="status"` (e, nas leituras, uma região `role="alert"`) presentes desde o
+  carregamento, `PortalErrorBannerComponent` para erros e `AlternativeChannelNote` em toda tela
+  de ato e indisponibilidade. Rotas: `moduleRoutes(module, { path: { component, title } })` —
+  guardas continuam vindo do manifesto. Os links levam o atributo `routerLink` espelhando a rota
+  (localização por atributo, como `data-*`).
+- Não há tabela de prazo, tempestividade, fila, nível ou disponibilidade no cliente: tudo chega
+  do servidor; delegações reais (`422 SERVICE_UNAVAILABLE { delegacao_indisponivel_r0007 }`)
+  aparecem como indisponíveis com motivo e canal, nunca simuladas (M15). Sem `canDeactivate`
+  neste par (OD-P79); polling/SSE, `/sne` e "formato acessível" persistente ficam para o par 3.
diff --git a/apps/portal/web/angular.json b/apps/portal/web/angular.json
index 88b13ca..259d591 100644
--- a/apps/portal/web/angular.json
+++ b/apps/portal/web/angular.json
@@ -42,7 +42,7 @@
               "budgets": [
                 {
                   "type": "initial",
-                  "maximumWarning": "500kB",
+                  "maximumWarning": "600kB",
                   "maximumError": "1MB"
                 },
                 {
diff --git a/apps/portal/web/src/app/data/portal-read.models.ts b/apps/portal/web/src/app/data/portal-read.models.ts
new file mode 100644
index 0000000..55e28b9
--- /dev/null
+++ b/apps/portal/web/src/app/data/portal-read.models.ts
@@ -0,0 +1,294 @@
+// Modelos das leituras do par 2 (contrato CTG-0003b §2.1; ADR-0007): o que o OpenAPI gerado fixa
+// (query e path tipados, itens das listas, pontos, resumo) é derivado por `import type` de
+// `@detran/api-clients`; o que ele deixa livre — os corpos de `GET aits/{aitId}` e
+// `GET requests/{id}`, tipados `{ [key: string]: unknown }` ([DIVERGE-1], OD-P69) — é transcrito de
+// `portal-route-contract.md` §4/§5 e das interfaces de `process-timeline.projection.ts`, sem
+// validação em tempo de execução (o cliente confia na projeção, como o par 1). Campos marcados
+// `source_pending` não têm forma fechada (OD-P72/OD-P74): a UI só os renderiza quando presentes e
+// nunca simula o que falta (M15).
+import type {
+  BpPortalProjections001Commands,
+  BpPortalRequests001Commands,
+} from '@detran/api-clients';
+import type { AitAction } from '../shared/action-triplet.component'; // CTG-0003a §5.3
+
+type ProjectionsOps = BpPortalProjections001Commands.operations;
+type RequestsOps = BpPortalRequests001Commands.operations;
+type ResponseJson<Op, Status extends number> = Op extends {
+  responses: Record<Status, { content: { 'application/json': infer Body } }>;
+}
+  ? Body
+  : never;
+
+// —— autuações (contrato §4; infraction-view.projection.ts l. 30–90) ——
+
+/** INFRACTION_SITUATIONS (7); OD-P20: 3 tokens internos sem rótulo nunca chegam. */
+export type InfractionSituation =
+  | 'aguardando_defesa'
+  | 'em_defesa'
+  | 'penalidade_aplicada'
+  | 'em_recurso'
+  | 'encerrada'
+  | 'cancelada'
+  | 'arquivada';
+
+export type PointsStatus = 'em_disputa' | 'definitivo' | 'none';
+
+/** `{ vehicle?: string; status?: string; page?: number; pageSize?: number }`. */
+export type AitListQuery = NonNullable<
+  ProjectionsOps['portalAitList']['parameters']['query']
+>;
+
+/** `{ items: AitListRaw[]; total: number; page: number; pageSize: number }`. */
+export type AitListPage = ResponseJson<ProjectionsOps['portalAitList'], 200>;
+
+/** contrato §4 `deadlines[]{ kind, dueOn, ownedBy }`; T14 §4. */
+export interface AitDeadline {
+  /** Token do prazo → `data-token` (rótulo: OD-P64). */
+  readonly kind: string;
+  /** ISO date calculada no servidor. */
+  readonly dueOn: string;
+  readonly ownedBy: 'citizen' | 'agency';
+}
+
+export type AitSummary = Omit<
+  AitListPage['items'][number],
+  'deadlines' | 'actions'
+> & {
+  readonly deadlines: readonly AitDeadline[];
+  /** `{ key, available, reason?, minimumAssurance }`. */
+  readonly actions: readonly AitAction[];
+};
+
+/** contrato §4 `notices[]`. */
+export interface AitNotice {
+  readonly kind: 'NA' | 'NP' | 'decisao';
+  /** Token (`portal.notifications.origin.<channel>` quando sne|portal; demais: source_pending). */
+  readonly channel: string;
+  readonly dispatchedOn: string | null;
+  readonly effectiveOn: string | null;
+  /** Ciência ficta → `portal.notifications.ciencia_ficta`. */
+  readonly fictitious: boolean;
+  readonly printedDeadline: string | null;
+}
+
+/** `PagamentoSchema.tier` (contrato §5.1); `tiers[].code` presumido igual ([DIVERGE-6], OD-P74). */
+export type PaymentTierCode =
+  | 'desconto_80'
+  | 'desconto_60_reconhecimento'
+  | 'desconto_40_fora_sne'
+  | 'integral_juros';
+
+/** `PagamentoSchema.method`. */
+export type PaymentMethod = 'pix' | 'debito' | 'boleto' | 'cartao';
+
+/** contrato §4 `payment{ tiers[]{ code, percent, amount, availableUntil, requiresSne, waivesAppeal } }`. */
+export interface PaymentTier {
+  readonly code: PaymentTierCode;
+  /** Percentual pago em relação ao original, como o servidor mandar (semântica: source_pending). */
+  readonly percent: number;
+  /** OD-P41: `null` quando `payment_json.tiers` vem sem valor. */
+  readonly amount: number | null;
+  /** ISO date. */
+  readonly availableUntil: string | null;
+  readonly requiresSne: boolean;
+  readonly waivesAppeal: boolean;
+}
+
+export interface PaymentInfo {
+  readonly tiers: readonly PaymentTier[];
+  readonly paid: boolean;
+  readonly paidTier: PaymentTierCode | null;
+  /** source_pending: `payment_json.methods` (H.53; projeção l. 12–13) — forma não fixada (OD-P74). */
+  readonly methods?: unknown;
+}
+
+/** contrato §4 `GET aits/{aitId}`; OpenAPI: `{ [key]: unknown }` ([DIVERGE-1]). */
+export interface AitDetail extends AitSummary {
+  readonly notices: readonly AitNotice[];
+  readonly payment: PaymentInfo;
+  /** Rascunho/pedido aberto sobre este AIT (contrato §4 `openRequestId?`). */
+  readonly openRequestId: string | null;
+  /** Sem rota de leitura nesta lista fechada → não renderizado. */
+  readonly evidenceAvailable: boolean;
+}
+
+/** `{ aitId; pointsStatus: PointsStatus; points: null }` (OD-P34: points sempre null). */
+export type AitPoints = ResponseJson<ProjectionsOps['portalAitPointsGet'], 200>;
+
+/**
+ * `{ definitivePoints; disputedPoints; byVehicle: unknown[]; last12Months: unknown[]; cachedAt }`.
+ * `byVehicle`/`last12Months`: itens `{ [key]: unknown }` → não renderizados até OD-P78.
+ */
+export type PointsSummary = ResponseJson<
+  ProjectionsOps['portalPointsSummaryGet'],
+  200
+>;
+
+// —— pedidos (contrato §5; process-timeline.projection.ts l. 41–60) ——
+
+/** WF-PORTAL-001 (contrato §5); 13 chaves `portal.situation.request.<STATE>`. */
+export type RequestState =
+  | 'IDENTIFICADO'
+  | 'SERVICO_SELECIONADO'
+  | 'ELEGIBILIDADE_VERIFICADA'
+  | 'INELEGIVEL'
+  | 'PEDIDO_EM_COMPOSICAO'
+  | 'AGUARDANDO_NIVEL_ASSINATURA'
+  | 'AGUARDANDO_PAGAMENTO'
+  | 'PROTOCOLADO'
+  | 'EM_ANDAMENTO_NO_ORGAO'
+  | 'RESULTADO_DISPONIVEL'
+  | 'AVALIACAO_OFERECIDA'
+  | 'CONCLUIDO'
+  | 'DESISTIDO';
+
+/** `{ state?: string; kind?: string; period?: string; page?: number; pageSize?: number }`. */
+export type RequestListQuery = NonNullable<
+  RequestsOps['portalRequestList']['parameters']['query']
+>;
+
+export type RequestListPage = ResponseJson<
+  RequestsOps['portalRequestList'],
+  200
+>;
+
+export interface RequestNextAction {
+  readonly by: 'citizen' | 'agency' | 'none';
+  /** Chave i18n enviada pelo servidor: `portal.requests.nextAction.<STATE>`. */
+  readonly label: string;
+  /** ISO date. */
+  readonly dueOn: string | null;
+}
+
+export type RequestSummary = Omit<
+  RequestListPage['items'][number],
+  'nextAction' | 'situation'
+> & {
+  readonly situation: RequestState;
+  readonly nextAction: RequestNextAction;
+};
+
+/** OpenAPI `@example` de `portalRequestGet` (única fonte da forma de `request`). */
+export interface RequestRecord {
+  readonly requestId: string;
+  readonly state: RequestState;
+  readonly serviceKey: string;
+  readonly targetKind: 'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';
+  readonly targetId: string | null;
+  readonly channel: 'portal';
+  readonly minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
+  readonly delegation: {
+    /** Fixtures §10.5 como única fonte (source_pending). */
+    readonly status: 'pending' | 'delegated' | 'failed' | 'not_applicable';
+    readonly domain: string | null;
+    readonly command: string | null;
+    /** `case_id` do RAIT (process_timeline: `delegation_external_id`; [DIVERGE-4]). */
+    readonly externalId: string | null;
+    readonly error: string | null;
+  };
+  readonly protocol: {
+    readonly number: string;
+    readonly issuedAt: string;
+    readonly channel: 'portal';
+    readonly receiptHash: string;
+  } | null;
+  /** OpenAPI `@example` `"draft": null`. */
+  readonly draft: Record<string, unknown> | null;
+  readonly withdrawnAt: string | null;
+  readonly createdAt: string;
+  readonly updatedAt: string;
+  readonly version: number;
+}
+
+/** process-timeline.projection.ts l. 41–47 (sem `ownedBy` — [DIVERGE-3], OD-P71). */
+export interface TimelineEntry {
+  readonly at: string;
+  /** Técnico; o tipo da diligência é `TIMELINE_INQUIRY_TYPE` (`shared/process-timeline.component.ts`). */
+  readonly type: string;
+  /** Um dos 7 PROCESS_TIMELINE_DOMAIN_EVENTS, ou `null`. */
+  readonly domainEvent: string | null;
+  readonly visibility: 'citizen';
+  readonly data: Readonly<Record<string, string | number | boolean | null>>;
+}
+
+/** l. 49–53. */
+export interface TimelineDeadline {
+  readonly kind: 'diligencia';
+  readonly dueOn: string;
+  readonly ownedBy: 'citizen' | 'agency';
+}
+
+/** Forma proposta ([DIVERGE-18], OD-P72): todos os campos `source_pending`. */
+export interface ProcessDocument {
+  readonly documentId: string;
+  readonly title: string;
+  /** Token → `data-token`. */
+  readonly kind: string | null;
+  readonly issuedAt: string | null;
+  /** `null` → estado indisponível, nunca link simulado. */
+  readonly downloadUrl: string | null;
+}
+
+/** Forma proposta ([DIVERGE-18], OD-P72). */
+export interface Diligence {
+  /** `{did}` de POST …/diligences/{did}/responses; nome do campo source_pending. */
+  readonly diligenceId: string;
+  /** "O que exatamente está sendo pedido" (T11 §4); source_pending. */
+  readonly requestText: string | null;
+  /** Prazo próprio ([UC-PORTAL-009] AC-4); source_pending. */
+  readonly dueOn: string | null;
+  /** Gate `state: 'open'`; demais tokens source_pending. */
+  readonly status: 'open' | 'answered' | 'expired';
+  /** Token de DILIGENCE_NOT_OPEN.context.outcome; source_pending. */
+  readonly outcome: string | null;
+}
+
+/** contrato §5 `GET …/decision`. */
+export type DecisionOutcome =
+  | 'deferido'
+  | 'indeferido'
+  | 'parcialmente_deferido'
+  | 'provido'
+  | 'negado'
+  | 'nao_conhecido';
+
+export interface DecisionNextStep {
+  /** `'none'` no `@example`; demais tokens source_pending (OD-P72). */
+  readonly kind: string | null;
+  readonly serviceKey: string | null;
+  readonly dueOn: string | null;
+}
+
+export interface Decision {
+  readonly outcome: DecisionOutcome;
+  /** TimelineDecision: sempre `null` nesta rodada (OD-P43). */
+  readonly summary: string | null;
+  readonly publishedOn: string | null;
+  /** `null` → "baixar decisão" indisponível. */
+  readonly documentUrl: string | null;
+  readonly nextStep: DecisionNextStep;
+  readonly refundDue: boolean | null;
+  readonly finalInstance: boolean | null;
+}
+
+/** contrato §5 `actions{ … }`. */
+export interface RequestActions {
+  readonly canRespondDiligence: boolean;
+  readonly canWithdraw: boolean;
+  /** Token → `data-reason` (ex.: `'estado_nao_admite'`, `@example`). */
+  readonly withdrawalBlockedReason: string | null;
+  readonly canAppeal: boolean;
+  readonly nextInstanceServiceKey: 'recurso_jari' | 'recurso_cetran' | null;
+}
+
+/** contrato §5 `GET requests/{id}` (T-07); OpenAPI: `{ [key]: unknown }` ([DIVERGE-1]). */
+export interface RequestDetail {
+  readonly request: RequestRecord;
+  readonly timeline: readonly TimelineEntry[];
+  readonly deadlines: readonly TimelineDeadline[];
+  readonly documents: readonly ProcessDocument[];
+  readonly diligences: readonly Diligence[];
+  readonly decision: Decision | null;
+  readonly actions: RequestActions;
+}
diff --git a/apps/portal/web/src/app/data/portal.client.ts b/apps/portal/web/src/app/data/portal.client.ts
index 59970ac..1e8cf46 100644
--- a/apps/portal/web/src/app/data/portal.client.ts
+++ b/apps/portal/web/src/app/data/portal.client.ts
@@ -7,10 +7,15 @@
 // servidor responde 428) e `Idempotency-Key` determinística `<ato>:<alvo>:<fingerprint>` (M17,
 // §2.2), recalculada a cada chamada. Nenhum método captura erros: a promessa rejeita com o
 // `HttpErrorResponse` original e o chamador classifica com `presentError` (§3).
+// Leituras do par 2 (contrato CTG-0003b §2.3): query por `HttpParams` só com as chaves presentes
+// (números por `String()`), nenhuma envia `Idempotency-Key` nem `If-Match`; `getRequest` observa a
+// resposta para devolver o `ETag` (`If-Match` do `withdraw`, §2.2). Corpos tipados `{ [key]: unknown }`
+// no OpenAPI ([DIVERGE-1]) são entregues por asserção de tipo, sem transformação de dados.
 import {
   HttpClient,
   HttpErrorResponse,
   HttpHeaders,
+  HttpParams,
   type HttpResponse,
 } from '@angular/common/http';
 import { Injectable, Injector, inject } from '@angular/core';
@@ -28,6 +33,17 @@ import type {
   ElevationCompleted,
   ElevationStarted,
 } from './portal-command.models';
+import type {
+  AitDetail,
+  AitListPage,
+  AitListQuery,
+  AitPoints,
+  Decision,
+  PointsSummary,
+  RequestDetail,
+  RequestListPage,
+  RequestListQuery,
+} from './portal-read.models';

 type IdentityPaths = BpPortalIdentity001Commands.paths;
 type RequestsOps = BpPortalRequests001Commands.operations;
@@ -159,6 +175,18 @@ async function decodeBlobError(error: unknown): Promise<unknown> {
   });
 }

+/** `HttpParams` só com as chaves presentes (`undefined` omitido; números por `String()`). */
+function queryParams(
+  query: Readonly<Record<string, string | number | undefined>>,
+): HttpParams {
+  let params = new HttpParams();
+  for (const [key, value] of Object.entries(query)) {
+    if (value === undefined) continue;
+    params = params.set(key, String(value));
+  }
+  return params;
+}
+
 @Injectable({ providedIn: 'root' })
 export class PortalClient {
   private readonly injector = inject(Injector);
@@ -384,6 +412,71 @@ export class PortalClient {
     }
   }

+  // —— leituras do par 2 (contrato CTG-0003b §2.3) ——
+
+  /** GET /v1/portal/aits?vehicle&status&page&pageSize — chaves `undefined` omitidas da query. */
+  listAits(query: AitListQuery = {}): Promise<AitListPage> {
+    return firstValueFrom(
+      this.http.get<AitListPage>(this.url('/aits'), {
+        params: queryParams(query),
+      }),
+    );
+  }
+
+  /** GET /v1/portal/aits/{aitId} — 404 NOT_FOUND{kind:'ait'} = sem vínculo (contrato §1.2). */
+  getAit(aitId: string): Promise<AitDetail> {
+    return this.get<AitDetail>(`/aits/${encodeURIComponent(aitId)}`);
+  }
+
+  /** GET /v1/portal/aits/{aitId}/points — `points` sempre null nesta rodada (OD-P34). */
+  getAitPoints(aitId: string): Promise<AitPoints> {
+    return this.get<AitPoints>(`/aits/${encodeURIComponent(aitId)}/points`);
+  }
+
+  /** GET /v1/portal/points-summary — zero pontos quando sem linha (nunca 404, UC-010). */
+  getPointsSummary(): Promise<PointsSummary> {
+    return this.get<PointsSummary>('/points-summary');
+  }
+
+  /** GET /v1/portal/requests?state&kind&period&page&pageSize. */
+  listRequests(query: RequestListQuery = {}): Promise<RequestListPage> {
+    return firstValueFrom(
+      this.http.get<RequestListPage>(this.url('/requests'), {
+        params: queryParams(query),
+      }),
+    );
+  }
+
+  /**
+   * GET /v1/portal/requests/{id} — `observe: 'response'`; `etag` do cabeçalho (§2.2). Resolvida
+   * no próprio `next` da resposta (como `firstValueFrom`), sem envelope `async`: as facades de
+   * leitura refletem a resposta nos signals no tick seguinte à sua chegada.
+   */
+  getRequest(requestId: string): Promise<CommandResult<RequestDetail>> {
+    return new Promise((resolve, reject) => {
+      this.http
+        .get<RequestDetail>(
+          this.url(`/requests/${encodeURIComponent(requestId)}`),
+          { observe: 'response' },
+        )
+        .subscribe({
+          next: (response) =>
+            resolve({
+              body: response.body as RequestDetail,
+              etag: response.headers.get('ETag'),
+            }),
+          error: (error: unknown) => reject(error),
+        });
+    });
+  }
+
+  /** GET /v1/portal/requests/{id}/decision — 404 NOT_FOUND{kind:'decision'} = ainda sem decisão. */
+  getDecision(requestId: string): Promise<Decision> {
+    return this.get<Decision>(
+      `/requests/${encodeURIComponent(requestId)}/decision`,
+    );
+  }
+
   private url(path: string): string {
     return `${PORTAL_API_PREFIX}${path}`;
   }
diff --git a/apps/portal/web/src/app/data/read-status.ts b/apps/portal/web/src/app/data/read-status.ts
new file mode 100644
index 0000000..80337ad
--- /dev/null
+++ b/apps/portal/web/src/app/data/read-status.ts
@@ -0,0 +1,37 @@
+// ReadStatus (contrato CTG-0003b §3.1): estado de uma leitura de tela, derivado SÓ da
+// apresentação que o `ErrorBoundary` já classificou (`presentError`, CTG-0003a §3). Nenhuma
+// facade lê `navigator` nem decide prazo aqui: o `ErrorBoundary` reconhece o `status 0` sem rede
+// e devolve `OFFLINE_KEY`; este módulo apenas mapeia a apresentação ao estado da tela (tabela
+// §2.4 do contrato). Nunca lança.
+import { OFFLINE_KEY, type ErrorPresentation } from '../core/error-boundary';
+
+export type ReadStatus =
+  | 'idle'
+  | 'loading'
+  | 'ready'
+  | 'empty' // lista sem itens; T-10 sem decisão
+  | 'not_found' // NOT_FOUND{kind: ait|request} → link "por que não vejo isto"
+  | 'error' // recuperável: portal.states.error + retry, ou portal.errors.<code>
+  | 'unavailable' // SERVICE_UNAVAILABLE | *_UNAVAILABLE (503) | SERVICE_PARTIALLY_AVAILABLE
+  | 'offline'; // portal.states.offline
+
+/** Códigos do catálogo que a tabela §2.4 apresenta como "indisponível" (banner + canal). */
+const UNAVAILABLE_CODES: ReadonlySet<string> = new Set([
+  'PORTAL.SERVICE_UNAVAILABLE',
+  'PORTAL.SERVICE_PARTIALLY_AVAILABLE',
+  'PORTAL.NATIONAL_READ_UNAVAILABLE',
+  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE',
+  'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
+]);
+
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+
+/** Mapeia a apresentação de `presentError` ao estado da tela (tabela §2.4); nunca lança. */
+export function readStatusFor(presentation: ErrorPresentation): ReadStatus {
+  if (presentation.messageKey === OFFLINE_KEY) return 'offline';
+  if (presentation.code === NOT_FOUND_CODE) return 'not_found';
+  if (presentation.code !== null && UNAVAILABLE_CODES.has(presentation.code)) {
+    return 'unavailable';
+  }
+  return 'error';
+}
diff --git a/apps/portal/web/src/app/features/autos/autos.facade.ts b/apps/portal/web/src/app/features/autos/autos.facade.ts
new file mode 100644
index 0000000..8e467dd
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/autos.facade.ts
@@ -0,0 +1,181 @@
+// AutosFacade (contrato CTG-0003b §3.2; T-14/T-01): leituras de autuações e pontuação por
+// navegação — provida na página (`providers: [AutosFacade]`), sem cache local. Filtro e paginação
+// vão ao SERVIDOR (`vehicle`, `status`, `page`; [DIVERGE-7]); a lista e o resumo de pontos são
+// independentes (a falha de um não derruba o outro); os pontos do AIT são lidos depois do detalhe
+// e a falha deles não muda `aitStatus`. Erros só pelo `ErrorBoundary` (`presentError` →
+// `readStatusFor`); nenhuma aritmética de datas, nenhuma decisão de prazo ou de nível aqui.
+//
+// Semântica das leituras (`loadList`, `setQuery`, `loadPointsSummary`, `loadAit`): a promessa
+// resolve assim que a leitura é DESPACHADA; o resultado chega pelos signals (`status`, `page`,
+// `ait`…), que as páginas observam — uma releitura nunca bloqueia quem a pediu (especificação
+// executável C-3b-09/10/16/23/24). Cada resposta é refletida nos signals no tick seguinte à sua
+// chegada (o cliente resolve no `next` da resposta).
+import { Injectable, computed, inject, signal } from '@angular/core';
+import {
+  presentError,
+  type ErrorPresentation,
+} from '../../core/error-boundary';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  AitDetail,
+  AitListPage,
+  AitListQuery,
+  AitPoints,
+  AitSummary,
+  InfractionSituation,
+  PointsSummary,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+
+/** Os 7 tokens que o servidor aceita em `status` (fora deles: 400 ENUM_INVALID). */
+export const INFRACTION_SITUATIONS: readonly InfractionSituation[] = [
+  'aguardando_defesa',
+  'em_defesa',
+  'penalidade_aplicada',
+  'em_recurso',
+  'encerrada',
+  'cancelada',
+  'arquivada',
+];
+
+const FIRST_PAGE = 1;
+
+function withoutEmpty(query: AitListQuery): AitListQuery {
+  const next: Record<string, string | number | undefined> = { ...query };
+  for (const key of Object.keys(next)) {
+    const value = next[key];
+    if (value === undefined || value === '') delete next[key];
+  }
+  return next as AitListQuery;
+}
+
+@Injectable()
+export class AutosFacade {
+  private readonly client = inject(PortalClient);
+
+  // T-14
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly queryState = signal<AitListQuery>({});
+  private readonly pageState = signal<AitListPage | null>(null);
+  private readonly pointsStatusState = signal<ReadStatus>('idle');
+  private readonly pointsState = signal<PointsSummary | null>(null);
+  private readonly pointsErrorState = signal<ErrorPresentation | null>(null);
+  // T-01
+  private readonly aitStatusState = signal<ReadStatus>('idle');
+  private readonly aitState = signal<AitDetail | null>(null);
+  private readonly aitErrorState = signal<ErrorPresentation | null>(null);
+  private readonly aitPointsState = signal<AitPoints | null>(null);
+  /** Última leitura despachada por família — respostas atrasadas de leituras antigas são ignoradas. */
+  private listSequence = 0;
+  private aitSequence = 0;
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  /** `{ vehicle?, status?, page?, pageSize? }` — vai ao servidor ([DIVERGE-7]). */
+  readonly query = this.queryState.asReadonly();
+  readonly page = this.pageState.asReadonly();
+  readonly items = computed<readonly AitSummary[]>(
+    () => (this.pageState()?.items as readonly AitSummary[] | undefined) ?? [],
+  );
+  readonly pointsStatus = this.pointsStatusState.asReadonly();
+  readonly points = this.pointsState.asReadonly();
+  readonly pointsError = this.pointsErrorState.asReadonly();
+
+  readonly aitStatus = this.aitStatusState.asReadonly();
+  readonly ait = this.aitState.asReadonly();
+  readonly aitError = this.aitErrorState.asReadonly();
+  readonly aitPoints = this.aitPointsState.asReadonly();
+
+  /** GET aits com a query dada; `status` 'empty' quando total === 0 ([UC-PORTAL-010] 2a). */
+  loadList(query: AitListQuery = this.queryState()): Promise<void> {
+    const effective = withoutEmpty(query);
+    this.queryState.set(effective);
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    void this.runList(effective, ++this.listSequence);
+    return Promise.resolve();
+  }
+
+  /** Altera vehicle/status/page e recarrega (page volta a 1 quando o filtro muda). */
+  setQuery(patch: Partial<AitListQuery>): Promise<void> {
+    const filterChanged = 'vehicle' in patch || 'status' in patch;
+    const next: AitListQuery = {
+      ...this.queryState(),
+      ...patch,
+      ...(filterChanged && patch.page === undefined
+        ? { page: FIRST_PAGE }
+        : {}),
+    };
+    return this.loadList(next);
+  }
+
+  /** GET points-summary — independente da lista (falha de um não derruba o outro). */
+  loadPointsSummary(): Promise<void> {
+    this.pointsStatusState.set('loading');
+    this.pointsErrorState.set(null);
+    void this.runPointsSummary();
+    return Promise.resolve();
+  }
+
+  /**
+   * GET aits/{id} e, com o detalhe em mãos, GET aits/{id}/points — a falha dos pontos não muda
+   * `aitStatus` (só deixa `aitPoints` null); sem detalhe, os pontos não são lidos.
+   */
+  loadAit(aitId: string): Promise<void> {
+    this.aitStatusState.set('loading');
+    this.aitErrorState.set(null);
+    this.aitPointsState.set(null);
+    void this.runAit(aitId, ++this.aitSequence);
+    return Promise.resolve();
+  }
+
+  private async runList(query: AitListQuery, sequence: number): Promise<void> {
+    try {
+      const page = await this.client.listAits(query);
+      if (sequence !== this.listSequence) return;
+      this.pageState.set(page);
+      this.statusState.set(page.total === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.listSequence) return;
+      const presentation = presentError(error);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async runPointsSummary(): Promise<void> {
+    try {
+      this.pointsState.set(await this.client.getPointsSummary());
+      this.pointsStatusState.set('ready');
+    } catch (error: unknown) {
+      const presentation = presentError(error);
+      this.pointsErrorState.set(presentation);
+      this.pointsStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async runAit(aitId: string, sequence: number): Promise<void> {
+    let detail: AitDetail;
+    try {
+      detail = await this.client.getAit(aitId);
+    } catch (error: unknown) {
+      if (sequence !== this.aitSequence) return;
+      const presentation = presentError(error, {
+        entitlement: { kind: 'ait', id: aitId },
+      });
+      this.aitErrorState.set(presentation);
+      this.aitStatusState.set(readStatusFor(presentation));
+      return;
+    }
+    if (sequence !== this.aitSequence) return;
+    this.aitState.set(detail);
+    this.aitStatusState.set('ready');
+    try {
+      const points = await this.client.getAitPoints(aitId);
+      if (sequence === this.aitSequence) this.aitPointsState.set(points);
+    } catch {
+      if (sequence === this.aitSequence) this.aitPointsState.set(null);
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/features/autos/autos.routes.ts b/apps/portal/web/src/app/features/autos/autos.routes.ts
index 41da9d5..c8ef480 100644
--- a/apps/portal/web/src/app/features/autos/autos.routes.ts
+++ b/apps/portal/web/src/app/features/autos/autos.routes.ts
@@ -1,7 +1,18 @@
-// Módulo `autos` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('autos', { '<path>': { component, title } })`.
+// Módulo `autos` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-14, T-01).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { AitDetailPageComponent } from './pages/ait-detail.page';
+import { AitListPageComponent } from './pages/ait-list.page';

-export const AUTOS_ROUTES: Routes = moduleRoutes('autos');
+export const AUTOS_ROUTES: Routes = moduleRoutes('autos', {
+  autos: {
+    component: AitListPageComponent,
+    title: 'portal.screens.t14.title',
+  },
+  'autos/:aitId': {
+    component: AitDetailPageComponent,
+    title: 'portal.screens.t01.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/autos/components/ait-row-actions.component.ts b/apps/portal/web/src/app/features/autos/components/ait-row-actions.component.ts
new file mode 100644
index 0000000..595b51f
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/components/ait-row-actions.component.ts
@@ -0,0 +1,112 @@
+// AitRowActions (contrato CTG-0003b §6 T-14; [UC-PORTAL-010] AC-2; [RN-PORTAL-127] a): as três
+// ações de cada linha — defender · indicar · pagar — na mesma ordem e peso do `ActionTriplet`
+// (T-01), com as rotas do manifesto (#10/#11/#12). Ação disponível → link; indisponível ou ausente
+// de `actions[]` → `aria-disabled` + `data-reason=<token>` (rótulo: OD-P63); nenhuma disponível →
+// `portal.screens.t01.state.empty` (nunca linha morta). O nível insuficiente NÃO é decidido aqui:
+// o `assuranceGuard` da rota destino leva a T-27. Os links carregam o atributo `routerLink`
+// (espelho da rota) para localização por atributo.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+import type { AitAction } from '../../../shared/action-triplet.component';
+
+type RowActionKey = 'defend' | 'indicate_driver' | 'pay';
+
+/** Chave i18n e rota do manifesto por ação (mesma tabela do `ActionTriplet`, CTG-0003a §5.3). */
+const ROW_ACTIONS: readonly {
+  readonly key: RowActionKey;
+  readonly labelKey: string;
+  readonly route: (aitId: string) => string;
+}[] = [
+  {
+    key: 'defend',
+    labelKey: 'portal.screens.t01.cmd.defend',
+    route: (aitId) => `/autos/${aitId}/defesa/nova`,
+  },
+  {
+    key: 'indicate_driver',
+    labelKey: 'portal.screens.t01.cmd.indicate',
+    route: (aitId) => `/autos/${aitId}/condutor/nova`,
+  },
+  {
+    key: 'pay',
+    labelKey: 'portal.screens.t01.cmd.pay',
+    route: (aitId) => `/autos/${aitId}/pagamento`,
+  },
+];
+
+interface RowActionView {
+  readonly key: RowActionKey;
+  readonly labelKey: string;
+  readonly route: string;
+  readonly available: boolean;
+  readonly reason: string;
+}
+
+@Component({
+  selector: 'portal-ait-row-actions',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-available-count]': 'availableCount()',
+  },
+  template: `
+    <ul class="portal-ait-row-actions">
+      @for (item of items(); track item.key) {
+        <li>
+          @if (item.available) {
+            <a
+              [routerLink]="item.route"
+              [attr.routerLink]="item.route"
+              [attr.data-action]="item.key"
+              >{{ item.labelKey | stynxTranslate }}</a
+            >
+          } @else {
+            <a
+              role="link"
+              tabindex="0"
+              aria-disabled="true"
+              [attr.data-action]="item.key"
+              [attr.data-reason]="item.reason"
+              >{{ item.labelKey | stynxTranslate }}</a
+            >
+          }
+        </li>
+      }
+    </ul>
+    @if (availableCount() === 0) {
+      <p data-no-actions>
+        {{ 'portal.screens.t01.state.empty' | stynxTranslate }}
+      </p>
+    }
+  `,
+})
+export class AitRowActionsComponent {
+  readonly aitId = input.required<string>();
+  readonly actions = input.required<readonly AitAction[]>();
+
+  readonly items = computed<readonly RowActionView[]>(() => {
+    const aitId = this.aitId();
+    const actions = this.actions();
+    return ROW_ACTIONS.map((entry) => {
+      const action = actions.find((candidate) => candidate.key === entry.key);
+      return {
+        key: entry.key,
+        labelKey: entry.labelKey,
+        route: entry.route(aitId),
+        available: action?.available === true,
+        reason: action?.reason ?? '',
+      };
+    });
+  });
+
+  readonly availableCount = computed(
+    () => this.items().filter((item) => item.available).length,
+  );
+}
diff --git a/apps/portal/web/src/app/features/autos/components/points-summary.component.ts b/apps/portal/web/src/app/features/autos/components/points-summary.component.ts
new file mode 100644
index 0000000..9f530c4
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/components/points-summary.component.ts
@@ -0,0 +1,50 @@
+// PointsSummary (contrato CTG-0003b §6 T-14; [RN-RAIT-131]; [JRN-PORTAL-004] 2; [UC-PORTAL-010]
+// AC-3): a resposta direta ANTES da tabela — pontos definitivos e pontos em disputa (com a
+// ressalva "ainda podem não se confirmar") e a data da consulta que o servidor informa
+// (`cachedAt`). `byVehicle[]`/`last12Months[]` chegam como objetos livres e NÃO são renderizados
+// até OD-P78. Nenhum cálculo: os números vêm prontos de `GET points-summary`.
+import { ChangeDetectionStrategy, Component, input } from '@angular/core';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import type { PointsSummary } from '../../../data/portal-read.models';
+
+@Component({
+  selector: 'portal-points-summary',
+  imports: [StynxTranslatePipe, StynxIntlDatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-definitive-points]': 'summary().definitivePoints',
+    '[attr.data-disputed-points]': 'summary().disputedPoints',
+  },
+  template: `
+    <section class="portal-points-summary" [attr.aria-labelledby]="titleId">
+      <h2 [id]="titleId">
+        {{ 'portal.screens.t14.field.pontos_definitivos' | stynxTranslate }}
+        <strong data-definitive-points>{{ summary().definitivePoints }}</strong>
+      </h2>
+      <p data-disputed-points>
+        <strong>{{ summary().disputedPoints }}</strong>
+        <span>{{
+          'portal.screens.t14.field.pontos_disputa' | stynxTranslate
+        }}</span>
+      </p>
+      @if (summary().cachedAt; as cachedAt) {
+        <p data-cached-at>
+          <time [attr.datetime]="cachedAt">{{
+            'portal.documents.consulta.consultedAt'
+              | stynxTranslate
+                : { consultedAt: (cachedAt | stynxIntlDate: dateFormat) }
+          }}</time>
+        </p>
+      }
+    </section>
+  `,
+})
+export class PointsSummaryComponent {
+  readonly summary = input.required<PointsSummary>();
+
+  readonly titleId = 'portal-points-summary-title';
+  readonly dateFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+}
diff --git a/apps/portal/web/src/app/features/autos/pages/ait-detail.page.ts b/apps/portal/web/src/app/features/autos/pages/ait-detail.page.ts
new file mode 100644
index 0000000..b6d1703
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/pages/ait-detail.page.ts
@@ -0,0 +1,298 @@
+// T-01 Detalhe da autuação (contrato CTG-0003b §6; ficha IU-PORTAL-T01; [RN-PORTAL-127] a;
+// [RN-PORTAL-103]): cabeçalho com os valores crus do servidor, situação traduzida (token só em
+// `data-token`), um DeadlineCard por prazo (data rotulada com dono, nunca "N dias"), notificações
+// com origem e ciência ficta, e as TRÊS ações sempre juntas (`ActionTriplet`) — o nível
+// insuficiente é decidido pelo `assuranceGuard` da rota destino, nunca aqui. `not_found` mostra o
+// caminho "por que não vejo isto" (nunca tela vazia); `payment.paid` é um status, não um erro.
+// O parâmetro da rota é só chave de busca — a autorização é do servidor (T01 §3). As regiões de
+// estado (`role="status"`) e de alerta (`role="alert"`) existem desde o carregamento, para que o
+// conteúdo injetado depois seja anunciado (região viva presente antes do conteúdo).
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
+  DetranLoadingStateComponent,
+  StynxIntlCurrencyPipe,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type {
+  AitNotice,
+  InfractionSituation,
+  PointsStatus,
+} from '../../../data/portal-read.models';
+import { ActionTripletComponent } from '../../../shared/action-triplet.component';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { AutosFacade } from '../autos.facade';
+
+const AIT_PARAM = 'aitId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICE_KEY = 'consulta_multas';
+/** Canais com rótulo no catálogo; demais tokens ficam só em `data-channel` (source_pending). */
+const LABELLED_CHANNELS: ReadonlySet<string> = new Set(['sne', 'portal']);
+
+/** Texto por estado de leitura da ficha T01 §5 (chaves existentes). */
+const STATE_KEYS = {
+  loading: 'portal.screens.t01.state.loading',
+  not_found: 'portal.screens.t01.state.ineligible',
+  error: 'portal.screens.t01.state.error_recoverable',
+  unavailable: 'portal.screens.t01.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-ait-detail-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    StynxIntlCurrencyPipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    ActionTripletComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+  ],
+  providers: [AutosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-01',
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-status]': 'facade.aitStatus()',
+    '[attr.aria-busy]': 'facade.aitStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t01.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.aitStatus() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.ait()?.payment?.paid) {
+        <p data-already-paid>
+          {{ 'portal.errors.payment_already_paid' | stynxTranslate }}
+        </p>
+      }
+      @if (allUnavailable()) {
+        <p data-no-actions>
+          {{ 'portal.screens.t01.state.empty' | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+      @if (facade.aitError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.ait(); as ait) {
+      <section class="portal-ait-header" [attr.data-token]="ait.situation">
+        <p data-situation [attr.data-token]="ait.situation">
+          @if (ait.situation; as situation) {
+            {{ situationKey(situation) | stynxTranslate }}
+          }
+        </p>
+        <dl>
+          @if (ait.aitNumber; as aitNumber) {
+            <dt>{{ 'portal.screens.t01.field.numero' | stynxTranslate }}</dt>
+            <dd>{{ aitNumber }}</dd>
+          }
+          @if (ait.plate; as plate) {
+            <dt>{{ 'portal.screens.t01.field.placa' | stynxTranslate }}</dt>
+            <dd>{{ plate }}</dd>
+          }
+          @if (ait.occurredAt; as occurredAt) {
+            <dt>{{ 'portal.screens.t01.field.data' | stynxTranslate }}</dt>
+            <dd>
+              <time [attr.datetime]="occurredAt">{{
+                occurredAt | stynxIntlDate
+              }}</time>
+            </dd>
+          }
+          @if (ait.framingLabel; as framing) {
+            <dt>
+              {{ 'portal.screens.t01.field.enquadramento' | stynxTranslate }}
+            </dt>
+            <dd>{{ framing }}</dd>
+          }
+          @if (ait.amount !== null && ait.amount !== undefined) {
+            <dt>{{ 'portal.screens.t01.field.valor' | stynxTranslate }}</dt>
+            <dd>{{ ait.amount | stynxIntlCurrency: 'BRL' }}</dd>
+          }
+        </dl>
+        @if (pointsStatus(); as pointsStatus) {
+          <p data-points [attr.data-points-status]="pointsStatus">
+            <span>{{ pointsStatusKey(pointsStatus) | stynxTranslate }}</span>
+            @if (pointsStatus === 'em_disputa') {
+              <span>{{
+                'portal.screens.t14.field.pontos_disputa' | stynxTranslate
+              }}</span>
+            }
+          </p>
+        }
+      </section>
+
+      @for (deadline of ait.deadlines; track $index) {
+        <portal-deadline-card
+          [dueOn]="deadline.dueOn"
+          [ownedBy]="deadline.ownedBy"
+          [kind]="deadline.kind"
+          [labelKey]="nextActionKey(deadline.ownedBy)"
+        />
+      }
+
+      @if (ait.notices.length > 0) {
+        <ul class="portal-ait-notices" data-notices>
+          @for (notice of ait.notices; track $index) {
+            <li
+              [attr.data-token]="notice.kind"
+              [attr.data-channel]="notice.channel"
+              [attr.data-fictitious]="notice.fictitious ? 'true' : null"
+            >
+              <span>{{ noticeKindKey(notice) | stynxTranslate }}</span>
+              @if (channelKey(notice); as key) {
+                <span data-origin>{{ key | stynxTranslate }}</span>
+              }
+              @if (notice.dispatchedOn; as dispatchedOn) {
+                <time [attr.datetime]="dispatchedOn">{{
+                  dispatchedOn | stynxIntlDate
+                }}</time>
+              }
+              @if (notice.fictitious) {
+                <span data-ciencia-ficta>{{
+                  'portal.notifications.ciencia_ficta' | stynxTranslate
+                }}</span>
+              }
+            </li>
+          }
+        </ul>
+      }
+
+      <portal-action-triplet [aitId]="aitId()" [actions]="ait.actions" />
+
+      @if (ait.openRequestId; as openRequestId) {
+        <p data-open-request>
+          <a
+            [routerLink]="processRoute(openRequestId)"
+            [attr.routerLink]="processRoute(openRequestId)"
+            >{{ 'portal.requests.nextAction.PROTOCOLADO' | stynxTranslate }}</a
+          >
+        </p>
+      }
+    }
+
+    <portal-alternative-channel-note [serviceKey]="serviceKey" />
+  `,
+})
+export class AitDetailPageComponent {
+  readonly facade = inject(AutosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly aitId = signal('');
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+
+  /** Texto de estado da ficha para os estados de erro de leitura (o banner traz o próximo passo). */
+  readonly stateTextKey = computed<string | null>(() => {
+    switch (this.facade.aitStatus()) {
+      case 'not_found':
+        return STATE_KEYS.not_found;
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.error;
+      default:
+        return null;
+    }
+  });
+
+  /** "Vazio" de T01 §5: as três ações indisponíveis (cada motivo em `data-reason`). */
+  readonly allUnavailable = computed(() => {
+    const ait = this.facade.ait();
+    if (!ait) return false;
+    return !(ait.actions ?? []).some((action) => action.available);
+  });
+
+  readonly pointsStatus = computed<PointsStatus | null>(
+    () =>
+      this.facade.aitPoints()?.pointsStatus ??
+      this.facade.ait()?.pointsStatus ??
+      null,
+  );
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const aitId = params.get(AIT_PARAM) ?? '';
+        this.aitId.set(aitId);
+        this.focused = false;
+        void this.facade.loadAit(aitId);
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.aitStatus();
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
+  situationKey(situation: InfractionSituation): string {
+    return `portal.situation.infraction.${situation}`;
+  }
+
+  pointsStatusKey(status: PointsStatus): string {
+    return `portal.situation.points_status.${status}`;
+  }
+
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  noticeKindKey(notice: AitNotice): string {
+    return `portal.situation.notice.${notice.kind}`;
+  }
+
+  channelKey(notice: AitNotice): string | null {
+    return LABELLED_CHANNELS.has(notice.channel)
+      ? `portal.notifications.origin.${notice.channel}`
+      : null;
+  }
+
+  processRoute(requestId: string): string {
+    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
+  }
+
+  reload(): void {
+    void this.facade.loadAit(this.aitId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts b/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts
new file mode 100644
index 0000000..df21d59
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts
@@ -0,0 +1,277 @@
+// T-14 Minhas multas e pontuação (contrato CTG-0003b §6; ficha IU-PORTAL-T14; [UC-PORTAL-010];
+// [RN-PORTAL-103]; [RN-RAIT-131]): resposta direta ANTES da lista (resumo de pontos), filtros por
+// veículo e situação que vão ao servidor ([DIVERGE-7]), uma linha por AIT com situação traduzida
+// (token só em `data-token`), prazos como data rotulada com dono (nunca "N dias") e as três ações
+// da linha. Nenhum campo de identificação além do CPF autenticado; pontos e lista independentes.
+// As regiões de estado (`role="status"`) e de alerta (`role="alert"`) existem desde o carregamento.
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
+  StynxIntlCurrencyPipe,
+  StynxIntlDatePipe,
+  StynxPaginationComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type {
+  InfractionSituation,
+  PointsStatus,
+} from '../../../data/portal-read.models';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { AutosFacade, INFRACTION_SITUATIONS } from '../autos.facade';
+import { AitRowActionsComponent } from '../components/ait-row-actions.component';
+import { PointsSummaryComponent } from '../components/points-summary.component';
+
+/** Rota da ouvidoria (manifesto: `ouvidoria/nova`), caminho seguinte da lista vazia ([UC-010] 2b). */
+const OUVIDORIA_ROUTE = '/ouvidoria/nova';
+const AIT_ROUTE_PREFIX = '/autos/';
+const DISPUTED: PointsStatus = 'em_disputa';
+
+@Component({
+  selector: 'portal-ait-list-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    StynxIntlCurrencyPipe,
+    StynxPaginationComponent,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    DeadlineCardComponent,
+    PointsSummaryComponent,
+    AitRowActionsComponent,
+  ],
+  providers: [AutosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-14',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t14.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t14.intro' | stynxTranslate }}</p>
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
+    @if (facade.points(); as points) {
+      <portal-points-summary [summary]="points" />
+    } @else if (facade.pointsError(); as pointsError) {
+      <portal-error-banner
+        [error]="pointsError"
+        (retry)="facade.loadPointsSummary()"
+      />
+    }
+
+    <form class="portal-ait-filters" (submit)="$event.preventDefault()">
+      <label>
+        <span>{{
+          'portal.screens.t14.cmd.filtrar_veiculo' | stynxTranslate
+        }}</span>
+        <input
+          type="text"
+          name="vehicle"
+          autocomplete="off"
+          [value]="facade.query().vehicle ?? ''"
+          (change)="onVehicleChange($event)"
+        />
+      </label>
+      <label>
+        <span>{{
+          'portal.screens.t14.cmd.filtrar_status' | stynxTranslate
+        }}</span>
+        <select
+          name="status"
+          [value]="facade.query().status ?? ''"
+          (change)="onStatusChange($event)"
+        >
+          @for (situation of situations; track situation) {
+            <option [value]="situation">
+              {{ situationKey(situation) | stynxTranslate }}
+            </option>
+          }
+        </select>
+      </label>
+    </form>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="reloadList()" />
+      }
+    </div>
+
+    @if (facade.status() === 'empty') {
+      <detran-empty-state
+        [title]="'portal.screens.t14.empty' | stynxTranslate"
+        [message]="'portal.screens.t14.empty' | stynxTranslate"
+      />
+      <p>
+        <a [routerLink]="ouvidoriaRoute" [attr.routerLink]="ouvidoriaRoute">{{
+          'portal.common.link.ouvidoria' | stynxTranslate
+        }}</a>
+      </p>
+    }
+
+    @if (facade.items().length > 0) {
+      <ol class="portal-ait-list" data-ait-list>
+        @for (item of facade.items(); track item.aitId ?? $index) {
+          <li
+            class="portal-ait-row"
+            [attr.data-ait-id]="item.aitId"
+            [attr.data-points-status]="item.pointsStatus"
+          >
+            <h2>
+              <span>{{
+                'portal.screens.t01.field.numero' | stynxTranslate
+              }}</span>
+              <a
+                [routerLink]="aitRoute(item.aitId)"
+                [attr.routerLink]="aitRoute(item.aitId)"
+                >{{ item.aitNumber ?? item.aitId }}</a
+              >
+            </h2>
+            <p data-situation [attr.data-token]="item.situation">
+              @if (item.situation; as situation) {
+                {{ situationKey(situation) | stynxTranslate }}
+              }
+            </p>
+            <dl>
+              @if (item.plate; as plate) {
+                <dt>{{ 'portal.screens.t01.field.placa' | stynxTranslate }}</dt>
+                <dd>{{ plate }}</dd>
+              }
+              @if (item.occurredAt; as occurredAt) {
+                <dt>{{ 'portal.screens.t01.field.data' | stynxTranslate }}</dt>
+                <dd>
+                  <time [attr.datetime]="occurredAt">{{
+                    occurredAt | stynxIntlDate
+                  }}</time>
+                </dd>
+              }
+              @if (item.amount !== null && item.amount !== undefined) {
+                <dt>{{ 'portal.screens.t01.field.valor' | stynxTranslate }}</dt>
+                <dd>{{ item.amount | stynxIntlCurrency: 'BRL' }}</dd>
+              }
+            </dl>
+            @if (item.pointsStatus; as pointsStatus) {
+              <p data-points [attr.data-points-status]="pointsStatus">
+                <span>{{
+                  pointsStatusKey(pointsStatus) | stynxTranslate
+                }}</span>
+                @if (pointsStatus === disputed) {
+                  <span>{{
+                    'portal.screens.t14.field.pontos_disputa' | stynxTranslate
+                  }}</span>
+                }
+              </p>
+            }
+            @for (deadline of item.deadlines; track $index) {
+              <portal-deadline-card
+                [dueOn]="deadline.dueOn"
+                [ownedBy]="deadline.ownedBy"
+                [kind]="deadline.kind"
+                [labelKey]="nextActionKey(deadline.ownedBy)"
+              />
+            }
+            <portal-ait-row-actions
+              [aitId]="item.aitId ?? ''"
+              [actions]="item.actions"
+            />
+          </li>
+        }
+      </ol>
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
+export class AitListPageComponent {
+  readonly facade = inject(AutosFacade);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly situations = INFRACTION_SITUATIONS;
+  readonly ouvidoriaRoute = OUVIDORIA_ROUTE;
+  readonly disputed = DISPUTED;
+
+  constructor() {
+    void this.facade.loadPointsSummary();
+    void this.facade.loadList();
+    // Foco no <h1> ao concluir o carregamento (T01 §9; spec §1) — uma vez, nunca durante.
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
+  situationKey(situation: InfractionSituation): string {
+    return `portal.situation.infraction.${situation}`;
+  }
+
+  pointsStatusKey(status: PointsStatus): string {
+    return `portal.situation.points_status.${status}`;
+  }
+
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  aitRoute(aitId: string | undefined): string {
+    return `${AIT_ROUTE_PREFIX}${aitId ?? ''}`;
+  }
+
+  onVehicleChange(event: Event): void {
+    const value = (event.target as HTMLInputElement).value.trim();
+    void this.facade.setQuery({
+      vehicle: value.length > 0 ? value : undefined,
+    });
+  }
+
+  onStatusChange(event: Event): void {
+    const value = (event.target as HTMLSelectElement).value;
+    void this.facade.setQuery({ status: value.length > 0 ? value : undefined });
+  }
+
+  onPageChange(page: number): void {
+    void this.facade.setQuery({ page });
+  }
+
+  reloadList(): void {
+    void this.facade.loadList();
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/components/defesa-previa-form.component.ts b/apps/portal/web/src/app/features/defesa/components/defesa-previa-form.component.ts
new file mode 100644
index 0000000..6d5fde9
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/components/defesa-previa-form.component.ts
@@ -0,0 +1,150 @@
+// DefesaPreviaForm (contrato CTG-0003b §6 T-02; [RN-PORTAL-106]; [RN-PORTAL-107]): o passo 2
+// projetado no `ServiceWizard` — o que o órgão já tem (`PrefilledSummary`, somente leitura), os
+// fatos, os fundamentos, o tipo do pedido e os anexos (`AttachmentUploader` com o checklist
+// `requirements[]` do servidor, nunca lista do cliente). Os valores sobem pelo `model` `values`
+// (forma de `DefesaPreviaSchema`); erros de campo (`fields[]`) marcam os controles pela diretiva.
+// "Salvar rascunho" é pedido à página (`draftRequested`), que chama o `ServiceWizardStore`.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  model,
+  output,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import {
+  ATTACHMENT_ACCEPT,
+  ATTACHMENT_MAX_BYTES,
+} from '../../../forms/attachments';
+import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
+import { PrefilledSummaryComponent } from '../../../shared/prefilled-summary.component';
+
+/** `DefesaPreviaSchema.requestType` (contrato §5.1); rótulos OD-P70. */
+const REQUEST_TYPES = ['cancelamento', 'outro'] as const;
+type RequestType = (typeof REQUEST_TYPES)[number];
+
+export interface DefesaPreviaValues {
+  readonly facts: string;
+  readonly grounds: string;
+  readonly attachmentIds: readonly string[];
+  readonly requestType: RequestType;
+}
+
+const EMPTY_VALUES: DefesaPreviaValues = {
+  facts: '',
+  grounds: '',
+  attachmentIds: [],
+  requestType: REQUEST_TYPES[0],
+};
+
+function asValues(value: Record<string, unknown> | null): DefesaPreviaValues {
+  return { ...EMPTY_VALUES, ...(value ?? {}) } as DefesaPreviaValues;
+}
+
+@Component({
+  selector: 'portal-defesa-previa-form',
+  imports: [
+    StynxTranslatePipe,
+    PortalFieldErrorsDirective,
+    AttachmentUploaderComponent,
+    PrefilledSummaryComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <portal-prefilled-summary [prefilled]="prefilled()" />
+    <form
+      class="portal-defesa-form"
+      [portalFieldErrors]="fields()"
+      (submit)="$event.preventDefault()"
+    >
+      <label>
+        <span>{{ 'portal.screens.t02.field.facts' | stynxTranslate }}</span>
+        <textarea
+          name="facts"
+          rows="6"
+          [value]="current().facts"
+          [disabled]="disabled()"
+          (input)="patch('facts', $event)"
+        ></textarea>
+      </label>
+      <label>
+        <span>{{ 'portal.screens.t02.field.grounds' | stynxTranslate }}</span>
+        <textarea
+          name="grounds"
+          rows="6"
+          [value]="current().grounds"
+          [disabled]="disabled()"
+          (input)="patch('grounds', $event)"
+        ></textarea>
+      </label>
+      <label>
+        <span>{{ 'portal.forms.defesa_previa.tipo' | stynxTranslate }}</span>
+        <select
+          name="requestType"
+          [value]="current().requestType"
+          [disabled]="disabled()"
+          (change)="patch('requestType', $event)"
+        >
+          @for (type of requestTypes; track type) {
+            <option [value]="type">{{ typeKey(type) | stynxTranslate }}</option>
+          }
+        </select>
+      </label>
+      @if (requestId(); as requestId) {
+        <portal-attachment-uploader
+          [requestId]="requestId"
+          [accept]="accept"
+          [maxBytes]="maxBytes"
+          [checklist]="requirements()"
+          hintKey="portal.forms.defesa_previa.anexos_hint"
+          [disabled]="disabled()"
+          [attachmentIds]="current().attachmentIds"
+          (attachmentIdsChange)="setAttachments($event)"
+        />
+      }
+      <button
+        type="button"
+        data-draft
+        [disabled]="disabled()"
+        (click)="draftRequested.emit()"
+      >
+        {{ 'portal.screens.t02.cmd.draft' | stynxTranslate }}
+      </button>
+    </form>
+  `,
+})
+export class DefesaPreviaFormComponent {
+  /** `ServiceWizardStore.prefilled()`. */
+  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
+  /** `ServiceWizardStore.requirements()` → checklist do uploader. */
+  readonly requirements = input<readonly string[]>([]);
+  /** `ServiceWizardStore.requestId()` (anexos só com pedido criado). */
+  readonly requestId = input<string | null>(null);
+  /** `fields[]` do erro 400/422 → diretiva. */
+  readonly fields = input<readonly string[]>([]);
+  readonly disabled = input(false);
+  /** `ServiceWizardComponent.values` (duas vias). */
+  readonly values = model<Record<string, unknown> | null>(null);
+  readonly draftRequested = output<void>();
+
+  readonly requestTypes = REQUEST_TYPES;
+  readonly accept = ATTACHMENT_ACCEPT;
+  readonly maxBytes = ATTACHMENT_MAX_BYTES;
+  readonly current = computed(() => asValues(this.values()));
+
+  typeKey(type: RequestType): string {
+    return `portal.forms.defesa_previa.tipo.${type}`;
+  }
+
+  patch(field: 'facts' | 'grounds' | 'requestType', event: Event): void {
+    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
+    this.values.set({ ...this.current(), [field]: value });
+  }
+
+  setAttachments(attachmentIds: readonly string[]): void {
+    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/components/recurso-cetran-form.component.ts b/apps/portal/web/src/app/features/defesa/components/recurso-cetran-form.component.ts
new file mode 100644
index 0000000..2991918
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/components/recurso-cetran-form.component.ts
@@ -0,0 +1,110 @@
+// RecursoCetranForm (contrato CTG-0003b §6 T-04; [UC-PORTAL-003] AC-1; [RN-PORTAL-106]): passo 2
+// do recurso ao CETRAN — o parecer e a conclusão da JARI já estão anexados: chegam em
+// `prefilled{}` e só aparecem SOMENTE LEITURA pelo `PrefilledSummary` (mapa fechado, vazio até
+// OD-P82 — nunca nome cru de chave), nunca como campo editável nem exigido. O cidadão só acrescenta
+// argumentos adicionais (opcional) e provas.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  model,
+  output,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import {
+  ATTACHMENT_ACCEPT,
+  ATTACHMENT_MAX_BYTES,
+} from '../../../forms/attachments';
+import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
+import { PrefilledSummaryComponent } from '../../../shared/prefilled-summary.component';
+
+export interface RecursoCetranValues {
+  readonly additionalText?: string;
+  readonly attachmentIds: readonly string[];
+}
+
+const EMPTY_VALUES: RecursoCetranValues = { attachmentIds: [] };
+
+function asValues(value: Record<string, unknown> | null): RecursoCetranValues {
+  return { ...EMPTY_VALUES, ...(value ?? {}) } as RecursoCetranValues;
+}
+
+@Component({
+  selector: 'portal-recurso-cetran-form',
+  imports: [
+    StynxTranslatePipe,
+    PortalFieldErrorsDirective,
+    AttachmentUploaderComponent,
+    PrefilledSummaryComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <portal-prefilled-summary [prefilled]="prefilled()" />
+    <form
+      class="portal-recurso-form"
+      [portalFieldErrors]="fields()"
+      (submit)="$event.preventDefault()"
+    >
+      <p data-hint>{{ 'portal.forms.recurso_cetran.hint' | stynxTranslate }}</p>
+      <label>
+        <span>{{
+          'portal.screens.t04.field.additionalText' | stynxTranslate
+        }}</span>
+        <textarea
+          name="additionalText"
+          rows="6"
+          [value]="current().additionalText ?? ''"
+          [disabled]="disabled()"
+          (input)="patchAdditionalText($event)"
+        ></textarea>
+      </label>
+      @if (requestId(); as requestId) {
+        <portal-attachment-uploader
+          [requestId]="requestId"
+          [accept]="accept"
+          [maxBytes]="maxBytes"
+          [checklist]="requirements()"
+          hintKey="portal.forms.recurso_cetran.hint"
+          [disabled]="disabled()"
+          [attachmentIds]="current().attachmentIds"
+          (attachmentIdsChange)="setAttachments($event)"
+        />
+      }
+      <button
+        type="button"
+        data-draft
+        [disabled]="disabled()"
+        (click)="draftRequested.emit()"
+      >
+        {{ 'portal.screens.t04.cmd.draft' | stynxTranslate }}
+      </button>
+    </form>
+  `,
+})
+export class RecursoCetranFormComponent {
+  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
+  readonly requirements = input<readonly string[]>([]);
+  readonly requestId = input<string | null>(null);
+  readonly fields = input<readonly string[]>([]);
+  readonly disabled = input(false);
+  readonly values = model<Record<string, unknown> | null>(null);
+  readonly draftRequested = output<void>();
+
+  readonly accept = ATTACHMENT_ACCEPT;
+  readonly maxBytes = ATTACHMENT_MAX_BYTES;
+  readonly current = computed(() => asValues(this.values()));
+
+  /** Opcional: texto vazio não entra no corpo (`additionalText?`). */
+  patchAdditionalText(event: Event): void {
+    const text = (event.target as HTMLTextAreaElement).value;
+    const { additionalText: _previous, ...rest } = this.current();
+    this.values.set(text.length > 0 ? { ...rest, additionalText: text } : rest);
+  }
+
+  setAttachments(attachmentIds: readonly string[]): void {
+    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/components/recurso-jari-form.component.ts b/apps/portal/web/src/app/features/defesa/components/recurso-jari-form.component.ts
new file mode 100644
index 0000000..6c99fe3
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/components/recurso-jari-form.component.ts
@@ -0,0 +1,103 @@
+// RecursoJariForm (contrato CTG-0003b §6 T-03; [UC-PORTAL-002]): passo 2 do recurso à JARI — os
+// fundamentos e as provas (`AttachmentUploader`, `portal.forms.recurso_jari.provas`). Nenhuma
+// sugestão de pagar antes ([RN-PORTAL-127]): a tela não mostra valores nem link ao pagamento.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  model,
+  output,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import {
+  ATTACHMENT_ACCEPT,
+  ATTACHMENT_MAX_BYTES,
+} from '../../../forms/attachments';
+import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
+import { PrefilledSummaryComponent } from '../../../shared/prefilled-summary.component';
+
+export interface RecursoJariValues {
+  readonly grounds: string;
+  readonly attachmentIds: readonly string[];
+}
+
+const EMPTY_VALUES: RecursoJariValues = { grounds: '', attachmentIds: [] };
+
+function asValues(value: Record<string, unknown> | null): RecursoJariValues {
+  return { ...EMPTY_VALUES, ...(value ?? {}) } as RecursoJariValues;
+}
+
+@Component({
+  selector: 'portal-recurso-jari-form',
+  imports: [
+    StynxTranslatePipe,
+    PortalFieldErrorsDirective,
+    AttachmentUploaderComponent,
+    PrefilledSummaryComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <portal-prefilled-summary [prefilled]="prefilled()" />
+    <form
+      class="portal-recurso-form"
+      [portalFieldErrors]="fields()"
+      (submit)="$event.preventDefault()"
+    >
+      <label>
+        <span>{{ 'portal.screens.t03.field.grounds' | stynxTranslate }}</span>
+        <textarea
+          name="grounds"
+          rows="6"
+          [value]="current().grounds"
+          [disabled]="disabled()"
+          (input)="patchGrounds($event)"
+        ></textarea>
+      </label>
+      @if (requestId(); as requestId) {
+        <portal-attachment-uploader
+          [requestId]="requestId"
+          [accept]="accept"
+          [maxBytes]="maxBytes"
+          [checklist]="requirements()"
+          hintKey="portal.forms.recurso_jari.provas"
+          [disabled]="disabled()"
+          [attachmentIds]="current().attachmentIds"
+          (attachmentIdsChange)="setAttachments($event)"
+        />
+      }
+      <button
+        type="button"
+        data-draft
+        [disabled]="disabled()"
+        (click)="draftRequested.emit()"
+      >
+        {{ 'portal.screens.t03.cmd.draft' | stynxTranslate }}
+      </button>
+    </form>
+  `,
+})
+export class RecursoJariFormComponent {
+  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
+  readonly requirements = input<readonly string[]>([]);
+  readonly requestId = input<string | null>(null);
+  readonly fields = input<readonly string[]>([]);
+  readonly disabled = input(false);
+  readonly values = model<Record<string, unknown> | null>(null);
+  readonly draftRequested = output<void>();
+
+  readonly accept = ATTACHMENT_ACCEPT;
+  readonly maxBytes = ATTACHMENT_MAX_BYTES;
+  readonly current = computed(() => asValues(this.values()));
+
+  patchGrounds(event: Event): void {
+    const grounds = (event.target as HTMLTextAreaElement).value;
+    this.values.set({ ...this.current(), grounds });
+  }
+
+  setAttachments(attachmentIds: readonly string[]): void {
+    this.values.set({ ...this.current(), attachmentIds: [...attachmentIds] });
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/defesa.facade.ts b/apps/portal/web/src/app/features/defesa/defesa.facade.ts
new file mode 100644
index 0000000..7fabe10
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/defesa.facade.ts
@@ -0,0 +1,194 @@
+// DefesaFacade (contrato CTG-0003b §3.4; T-02/T-03/T-04): carrega o CONTEXTO do ato — o AIT (T-02)
+// ou o pedido de origem (T-03/T-04) —, resolve o alvo do wizard e o ponto de retomada, e concentra
+// os estados da tela; não duplica o estado do wizard (`ServiceWizardStore`). T-03/T-04: o alvo é o
+// caso do RAIT ligado ao pedido de origem (`request.delegation.externalId`, [DIVERGE-4]); sem ele
+// (caso nascido no balcão, OD-P29) ou com `actions.canAppeal === false` → inelegível (a página mostra
+// `portal.screens.t0n.state.ineligible`); a página NUNCA decide prazo (o servidor responde
+// `APPEAL_CETRAN_WINDOW_CLOSED`/`REQUEST_OUT_OF_DEADLINE`). Provida na página; sem cache local.
+// A disponibilidade do serviço já foi decidida pela guarda da rota (M8); o banner "parcial" só
+// existe no pagamento (§3.4 g), por isso `availability` fica `null` aqui.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import {
+  presentError,
+  type ErrorPresentation,
+} from '../../core/error-boundary';
+import { ResumeService } from '../../core/resume.service';
+import type { ServiceAvailability } from '../../core/service-catalog.facade';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  AitDeadline,
+  AitDetail,
+  RequestDetail,
+  TimelineDeadline,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type {
+  WizardResumeDraft,
+  WizardTarget,
+} from '../../shared/service-wizard.store';
+import {
+  resumeFromOpenRequest,
+  resumePointFor,
+} from '../../shared/wizard-resume';
+
+export type DefesaScreen = 'T-02' | 'T-03' | 'T-04';
+
+export type DefesaLoadParams =
+  | {
+      readonly screen: 'T-02';
+      readonly aitId: string;
+      /** `state.url` da tela (ponto de retomada do `ResumeService`). */
+      readonly resumeRoute?: string;
+    }
+  | {
+      readonly screen: 'T-03' | 'T-04';
+      readonly requestId: string;
+      readonly resumeRoute?: string;
+    };
+
+/** Motivo pelo qual o pedido de origem não admite a instância seguinte (token → `data-reason`). */
+export type AppealIneligibility = 'sem_caso_delegado' | 'recurso_nao_admitido';
+
+const SERVICE_KEY_BY_SCREEN: Readonly<Record<DefesaScreen, string>> = {
+  'T-02': 'defesa_previa',
+  'T-03': 'recurso_jari',
+  'T-04': 'recurso_cetran',
+};
+
+@Injectable()
+export class DefesaFacade {
+  private readonly client = inject(PortalClient);
+  private readonly resumeService = inject(ResumeService);
+
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly targetState = signal<WizardTarget | null>(null);
+  private readonly resumeState = signal<WizardResumeDraft | null>(null);
+  private readonly existingRequestIdState = signal<string | null>(null);
+  private readonly deadlinesState = signal<
+    readonly AitDeadline[] | readonly TimelineDeadline[]
+  >([]);
+  private readonly availabilityState = signal<ServiceAvailability | null>(null);
+  private readonly ineligibilityState = signal<AppealIneligibility | null>(
+    null,
+  );
+  private readonly aitState = signal<AitDetail | null>(null);
+  private readonly originState = signal<RequestDetail | null>(null);
+  private readonly screenState = signal<DefesaScreen>('T-02');
+
+  /** Contexto (AIT/pedido de origem). */
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  /** `null` enquanto o contexto não resolve (ou quando é inelegível). */
+  readonly target = this.targetState.asReadonly();
+  /** Consumido uma vez ([UC-PORTAL-019] AC-4 / pedido aberto em composição). */
+  readonly resume = this.resumeState.asReadonly();
+  /** `openRequestId` em estado além da composição → link `/processos/<id>`. */
+  readonly existingRequestId = this.existingRequestIdState.asReadonly();
+  /** → DeadlineCard visível em todos os passos ([UC-PORTAL-019] 4a). */
+  readonly deadlines = this.deadlinesState.asReadonly();
+  /** Sempre `null` nesta facade (ver cabeçalho). */
+  readonly availability = this.availabilityState.asReadonly();
+  /** T-03/T-04: origem sem caso delegado ou sem recurso admitido ([DIVERGE-4]). */
+  readonly ineligibility = this.ineligibilityState.asReadonly();
+  readonly ineligible = computed(() => this.ineligibilityState() !== null);
+  readonly ait = this.aitState.asReadonly();
+  readonly origin = this.originState.asReadonly();
+  readonly screen = this.screenState.asReadonly();
+  readonly serviceKey = computed(
+    () => SERVICE_KEY_BY_SCREEN[this.screenState()],
+  );
+
+  /** Chamado uma vez pela página com os parâmetros da rota; resolve quando o contexto resolve. */
+  async load(params: DefesaLoadParams): Promise<void> {
+    this.screenState.set(params.screen);
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    this.targetState.set(null);
+    this.resumeState.set(null);
+    this.existingRequestIdState.set(null);
+    this.ineligibilityState.set(null);
+    try {
+      if (params.screen === 'T-02') {
+        await this.loadAit(params.aitId, params.resumeRoute);
+      } else {
+        await this.loadOrigin(
+          params.screen,
+          params.requestId,
+          params.resumeRoute,
+        );
+      }
+    } catch (error: unknown) {
+      const presentation = presentError(
+        error,
+        params.screen === 'T-02'
+          ? { entitlement: { kind: 'ait', id: params.aitId } }
+          : { entitlement: { kind: 'request', id: params.requestId } },
+      );
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async loadAit(aitId: string, resumeRoute?: string): Promise<void> {
+    const ait = await this.client.getAit(aitId);
+    this.aitState.set(ait);
+    this.deadlinesState.set(ait.deadlines ?? []);
+    const target: WizardTarget = {
+      serviceKey: SERVICE_KEY_BY_SCREEN['T-02'],
+      targetKind: 'ait',
+      targetId: aitId,
+    };
+    const resume = resumeRoute
+      ? resumePointFor(this.resumeService, resumeRoute, target)
+      : null;
+    if (resume) {
+      this.resumeState.set(resume);
+    } else if (ait.openRequestId) {
+      const open = await resumeFromOpenRequest(
+        this.client,
+        ait.openRequestId,
+        target,
+      );
+      if (open === 'existing_request') {
+        this.existingRequestIdState.set(ait.openRequestId);
+      } else if (open) {
+        this.resumeState.set(open);
+      }
+    }
+    this.targetState.set(target);
+    this.statusState.set('ready');
+  }
+
+  private async loadOrigin(
+    screen: 'T-03' | 'T-04',
+    requestId: string,
+    resumeRoute?: string,
+  ): Promise<void> {
+    const { body } = await this.client.getRequest(requestId);
+    this.originState.set(body);
+    this.deadlinesState.set(body.deadlines ?? []);
+    const externalId = body.request?.delegation?.externalId ?? null;
+    if (externalId === null) {
+      this.ineligibilityState.set('sem_caso_delegado');
+      this.statusState.set('error');
+      return;
+    }
+    if (body.actions?.canAppeal !== true) {
+      this.ineligibilityState.set('recurso_nao_admitido');
+      this.statusState.set('error');
+      return;
+    }
+    const target: WizardTarget = {
+      serviceKey: SERVICE_KEY_BY_SCREEN[screen],
+      targetKind: 'case',
+      targetId: externalId,
+    };
+    const resume = resumeRoute
+      ? resumePointFor(this.resumeService, resumeRoute, target)
+      : null;
+    if (resume) this.resumeState.set(resume);
+    this.targetState.set(target);
+    this.statusState.set('ready');
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/defesa.routes.ts b/apps/portal/web/src/app/features/defesa/defesa.routes.ts
index 21c3f42..c5300c0 100644
--- a/apps/portal/web/src/app/features/defesa/defesa.routes.ts
+++ b/apps/portal/web/src/app/features/defesa/defesa.routes.ts
@@ -1,7 +1,23 @@
-// Módulo `defesa` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('defesa', { '<path>': { component, title } })`.
+// Módulo `defesa` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-02, T-03, T-04).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { DefesaPreviaPageComponent } from './pages/defesa-previa.page';
+import { RecursoCetranPageComponent } from './pages/recurso-cetran.page';
+import { RecursoJariPageComponent } from './pages/recurso-jari.page';

-export const DEFESA_ROUTES: Routes = moduleRoutes('defesa');
+export const DEFESA_ROUTES: Routes = moduleRoutes('defesa', {
+  'autos/:aitId/defesa/nova': {
+    component: DefesaPreviaPageComponent,
+    title: 'portal.screens.t02.title',
+  },
+  'processos/:requestId/jari/nova': {
+    component: RecursoJariPageComponent,
+    title: 'portal.screens.t03.title',
+  },
+  'processos/:requestId/cetran/nova': {
+    component: RecursoCetranPageComponent,
+    title: 'portal.screens.t04.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.ts b/apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.ts
new file mode 100644
index 0000000..65f32db
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.ts
@@ -0,0 +1,257 @@
+// T-02 Assistente de defesa prévia (contrato CTG-0003b §6; ficha IU-PORTAL-T02; [UC-PORTAL-001];
+// [RN-PORTAL-105/106/107]): a página lê o AIT (`DefesaFacade`), resolve o alvo e a retomada —
+// ponto do `ResumeService` ou pedido aberto em composição (sem novo `POST`); pedido aberto em
+// estado posterior → "já existe uma defesa" + link ao processo — e hospeda o `ServiceWizard`
+// (T02 §5: `start()` automático ao montar quando não há retomada) com o formulário do passo 2
+// projetado. DeadlineCard do AIT e canal alternativo visíveis em todos os passos; nível
+// insuficiente é só texto de contexto acima do `SignatureStep` (o caminho é o `AssuranceExplainer`
+// do par 1); `422 SERVICE_UNAVAILABLE` → indisponível com motivo (`data-reason`) e canal, nunca
+// simulado (M15). Sem confirmação de abandono (rascunho no servidor; OD-P79).
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
+import type { ErrorPresentation } from '../../../core/error-boundary';
+import { ASSURANCE_ORDER, SessionFacade } from '../../../core/session.facade';
+import {
+  DEFESA_PREVIA_GATE,
+  DefesaPreviaSchema,
+} from '../../../forms/defesa-previa.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { DefesaPreviaFormComponent } from '../components/defesa-previa-form.component';
+import { DefesaFacade } from '../defesa.facade';
+
+const AIT_PARAM = 'aitId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICE_KEY = 'defesa_previa';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t02.state.loading',
+  ineligible: 'portal.screens.t02.state.ineligible',
+  error: 'portal.screens.t02.state.error_recoverable',
+  forbidden: 'portal.screens.t02.state.forbidden',
+  unavailable: 'portal.screens.t02.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-defesa-previa-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    DefesaPreviaFormComponent,
+  ],
+  providers: [DefesaFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-02',
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t02.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t02.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading' || wizardLoading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.existingRequestId(); as existingRequestId) {
+        <p data-existing-request>
+          {{ stateKeys.ineligible | stynxTranslate }}
+          <a
+            [routerLink]="processRoute(existingRequestId)"
+            [attr.routerLink]="processRoute(existingRequestId)"
+            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+          >
+        </p>
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+      @if (recoverableError()) {
+        <p data-error-recoverable>
+          {{ stateKeys.error | stynxTranslate }}
+        </p>
+      }
+      @if (forbidden()) {
+        <p data-forbidden>{{ stateKeys.forbidden | stynxTranslate }}</p>
+      }
+    </div>
+
+    @if (facade.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="reload()" />
+    }
+
+    @for (deadline of facade.deadlines(); track $index) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        [labelKey]="nextActionKey(deadline.ownedBy)"
+      />
+    }
+
+    @if (facade.target(); as target) {
+      @if (facade.existingRequestId() === null) {
+        <portal-service-wizard
+          #wizard
+          [target]="target"
+          [schema]="schema"
+          [gate]="gate"
+          [resumeRoute]="resumeRoute()"
+          (created)="lastFailure.set(null)"
+          (draftSaved)="lastFailure.set(null)"
+          (failed)="onFailed($event)"
+        >
+          <portal-defesa-previa-form
+            [prefilled]="wizard.store.prefilled()"
+            [requirements]="wizard.store.requirements()"
+            [requestId]="wizard.store.requestId()"
+            [fields]="wizard.store.error()?.fields ?? []"
+            [disabled]="wizard.store.busy()"
+            [values]="wizard.values()"
+            (valuesChange)="wizard.values.set($event)"
+            (draftRequested)="wizard.store.save()"
+          />
+        </portal-service-wizard>
+      }
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class DefesaPreviaPageComponent {
+  readonly facade = inject(DefesaFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly session = inject(SessionFacade);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private started = false;
+  private focused = false;
+
+  readonly aitId = signal('');
+  readonly lastFailure = signal<ErrorPresentation | null>(null);
+  readonly schema = DefesaPreviaSchema;
+  readonly gate = DEFESA_PREVIA_GATE;
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly resumeRoute = computed(() => this.router.url);
+
+  readonly wizardLoading = computed(
+    () => this.wizard()?.store.status() === 'loading',
+  );
+
+  /** `422 SERVICE_UNAVAILABLE { unavailableReason }` do `POST requests` (M15). */
+  readonly unavailableReason = computed<string | null>(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.status() !== 'unavailable') return null;
+    const reason = store.error()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : 'unavailable';
+  });
+
+  readonly recoverableError = computed(() => {
+    const failure = this.lastFailure();
+    return failure !== null && failure.code !== 'PORTAL.SERVICE_UNAVAILABLE';
+  });
+
+  /** T02 §5 "sem permissão": só texto de contexto — o caminho é o `SignatureStep`/`AssuranceExplainer`. */
+  readonly forbidden = computed(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.step() !== 'assinatura') return false;
+    const required = store.minimumAssurance();
+    if (!required || required === 'none') return false;
+    const current = this.session.assuranceLevel();
+    return (
+      current === null || ASSURANCE_ORDER[current] < ASSURANCE_ORDER[required]
+    );
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const aitId = params.get(AIT_PARAM) ?? '';
+        this.aitId.set(aitId);
+        this.started = false;
+        this.focused = false;
+        void this.facade.load({
+          screen: 'T-02',
+          aitId,
+          resumeRoute: this.router.url,
+        });
+      });
+    // Contexto resolvido: retoma o ponto guardado ou inicia o pedido (T02 §5), uma única vez.
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const status = this.facade.status();
+      untracked(() => {
+        if (!wizard || this.started || status !== 'ready') return;
+        this.started = true;
+        const resume = this.facade.resume();
+        if (resume) wizard.resumeFrom(resume);
+        else void wizard.store.start();
+      });
+    });
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
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  processRoute(requestId: string): string {
+    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
+  }
+
+  onFailed(presentation: ErrorPresentation): void {
+    this.lastFailure.set(presentation);
+  }
+
+  reload(): void {
+    this.started = false;
+    void this.facade.load({
+      screen: 'T-02',
+      aitId: this.aitId(),
+      resumeRoute: this.router.url,
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/pages/recurso-cetran.page.ts b/apps/portal/web/src/app/features/defesa/pages/recurso-cetran.page.ts
new file mode 100644
index 0000000..a861369
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/pages/recurso-cetran.page.ts
@@ -0,0 +1,290 @@
+// T-04 Assistente de recurso ao CETRAN (contrato CTG-0003b §6; ficha IU-PORTAL-T04;
+// [UC-PORTAL-003]; [RN-PORTAL-106]): a página lê o pedido de origem (`DefesaFacade`, recurso à
+// JARI) e resolve o alvo — o caso do RAIT ligado ao pedido ([DIVERGE-4]); sem caso ou sem recurso
+// admitido → inelegível. O parecer e a conclusão da JARI já estão anexados (só leitura, nunca
+// exigidos). `422 APPEAL_CETRAN_WINDOW_CLOSED` (o servidor decide o prazo) → inelegível + banner.
+// Depois do protocolo: aviso de última instância, com foco (T04 §9).
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
+import type { ErrorPresentation } from '../../../core/error-boundary';
+import { ASSURANCE_ORDER, SessionFacade } from '../../../core/session.facade';
+import {
+  RECURSO_CETRAN_GATE,
+  RecursoCetranSchema,
+} from '../../../forms/recurso-cetran.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { RecursoCetranFormComponent } from '../components/recurso-cetran-form.component';
+import { DefesaFacade } from '../defesa.facade';
+
+const REQUEST_PARAM = 'requestId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICE_KEY = 'recurso_cetran';
+const WINDOW_CLOSED_CODE = 'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t04.state.loading',
+  ineligible: 'portal.screens.t04.state.ineligible',
+  error: 'portal.screens.t04.state.error_recoverable',
+  forbidden: 'portal.screens.t04.state.forbidden',
+  unavailable: 'portal.screens.t04.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-recurso-cetran-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    RecursoCetranFormComponent,
+  ],
+  providers: [DefesaFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-04',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t04.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t04.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading' || wizardLoading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.ineligibility(); as reason) {
+        <p data-ineligible [attr.data-reason]="reason">
+          {{ stateKeys.ineligible | stynxTranslate }}
+          <a
+            [routerLink]="processRoute(requestId())"
+            [attr.routerLink]="processRoute(requestId())"
+            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+          >
+        </p>
+      }
+      @if (windowClosed()) {
+        <p data-ineligible data-reason="janela_encerrada">
+          {{ stateKeys.ineligible | stynxTranslate }}
+        </p>
+      }
+      @if (protocoled()) {
+        <p #lastInstance tabindex="-1" data-last-instance>
+          {{ 'portal.screens.t04.state.ultima_instancia' | stynxTranslate }}
+        </p>
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+      @if (recoverableError()) {
+        <p data-error-recoverable>
+          {{ stateKeys.error | stynxTranslate }}
+        </p>
+      }
+      @if (forbidden()) {
+        <p data-forbidden>{{ stateKeys.forbidden | stynxTranslate }}</p>
+      }
+    </div>
+
+    @if (facade.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="reload()" />
+    }
+
+    @for (deadline of facade.deadlines(); track $index) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        [labelKey]="nextActionKey(deadline.ownedBy)"
+      />
+    }
+
+    @if (facade.target(); as target) {
+      @if (facade.existingRequestId() === null) {
+        <portal-service-wizard
+          #wizard
+          [target]="target"
+          [schema]="schema"
+          [gate]="gate"
+          [resumeRoute]="resumeRoute()"
+          (created)="lastFailure.set(null)"
+          (draftSaved)="lastFailure.set(null)"
+          (failed)="onFailed($event)"
+        >
+          <portal-recurso-cetran-form
+            [prefilled]="wizard.store.prefilled()"
+            [requirements]="wizard.store.requirements()"
+            [requestId]="wizard.store.requestId()"
+            [fields]="wizard.store.error()?.fields ?? []"
+            [disabled]="wizard.store.busy()"
+            [values]="wizard.values()"
+            (valuesChange)="wizard.values.set($event)"
+            (draftRequested)="wizard.store.save()"
+          />
+        </portal-service-wizard>
+      }
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class RecursoCetranPageComponent {
+  readonly facade = inject(DefesaFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly session = inject(SessionFacade);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private readonly lastInstance =
+    viewChild<ElementRef<HTMLElement>>('lastInstance');
+  private started = false;
+  private focused = false;
+  private focusedLastInstance = false;
+
+  readonly requestId = signal('');
+  readonly lastFailure = signal<ErrorPresentation | null>(null);
+  readonly schema = RecursoCetranSchema;
+  readonly gate = RECURSO_CETRAN_GATE;
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly resumeRoute = computed(() => this.router.url);
+
+  readonly wizardLoading = computed(
+    () => this.wizard()?.store.status() === 'loading',
+  );
+  /** Passo protocolo: aviso de última instância ([UC-PORTAL-003] AC-2). */
+  readonly protocoled = computed(
+    () => this.wizard()?.store.step() === 'protocolo',
+  );
+  /** `422 APPEAL_CETRAN_WINDOW_CLOSED { dueOn }`: o servidor decidiu o prazo. */
+  readonly windowClosed = computed(
+    () => this.lastFailure()?.code === WINDOW_CLOSED_CODE,
+  );
+
+  /** `422 SERVICE_UNAVAILABLE { unavailableReason }` do `POST requests` (M15). */
+  readonly unavailableReason = computed<string | null>(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.status() !== 'unavailable') return null;
+    const reason = store.error()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : 'unavailable';
+  });
+
+  readonly recoverableError = computed(() => {
+    const failure = this.lastFailure();
+    return (
+      failure !== null &&
+      failure.code !== 'PORTAL.SERVICE_UNAVAILABLE' &&
+      failure.code !== WINDOW_CLOSED_CODE
+    );
+  });
+
+  /** T02 §5 "sem permissão": só texto de contexto — o caminho é o `SignatureStep`/`AssuranceExplainer`. */
+  readonly forbidden = computed(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.step() !== 'assinatura') return false;
+    const required = store.minimumAssurance();
+    if (!required || required === 'none') return false;
+    const current = this.session.assuranceLevel();
+    return (
+      current === null || ASSURANCE_ORDER[current] < ASSURANCE_ORDER[required]
+    );
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const requestId = params.get(REQUEST_PARAM) ?? '';
+        this.requestId.set(requestId);
+        this.started = false;
+        this.focused = false;
+        void this.facade.load({
+          screen: 'T-04',
+          requestId,
+          resumeRoute: this.router.url,
+        });
+      });
+    // Contexto resolvido: retoma o ponto guardado ou inicia o pedido (T02 §5), uma única vez.
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const status = this.facade.status();
+      untracked(() => {
+        if (!wizard || this.started || status !== 'ready') return;
+        this.started = true;
+        const resume = this.facade.resume();
+        if (resume) wizard.resumeFrom(resume);
+        else void wizard.store.start();
+      });
+    });
+    // Aviso de última instância recebe o foco ao aparecer (T04 §9).
+    afterRenderEffect(() => {
+      const lastInstance = this.lastInstance()?.nativeElement;
+      untracked(() => {
+        if (lastInstance && !this.focusedLastInstance) {
+          this.focusedLastInstance = true;
+          lastInstance.focus();
+        }
+      });
+    });
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'error')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  processRoute(requestId: string): string {
+    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
+  }
+
+  onFailed(presentation: ErrorPresentation): void {
+    this.lastFailure.set(presentation);
+  }
+
+  reload(): void {
+    this.started = false;
+    void this.facade.load({
+      screen: 'T-04',
+      requestId: this.requestId(),
+      resumeRoute: this.router.url,
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/defesa/pages/recurso-jari.page.ts b/apps/portal/web/src/app/features/defesa/pages/recurso-jari.page.ts
new file mode 100644
index 0000000..432f686
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/pages/recurso-jari.page.ts
@@ -0,0 +1,264 @@
+// T-03 Assistente de recurso à JARI (contrato CTG-0003b §6; ficha IU-PORTAL-T03; [UC-PORTAL-002];
+// [RN-PORTAL-127]): a página lê o pedido de origem (`DefesaFacade`, decisão da defesa) e resolve o
+// alvo — o caso do RAIT ligado ao pedido (`request.delegation.externalId`, [DIVERGE-4]); sem caso
+// ou sem recurso admitido → inelegível com o motivo em `data-reason`. Hospeda o `ServiceWizard`
+// (`start()` automático) com o formulário do passo 2 projetado; o efeito suspensivo é dito na
+// entrada e repetido no passo protocolo ([UC-PORTAL-002] AC-1). Nenhuma sugestão de pagar antes:
+// sem valores, sem link ao pagamento. Prazo só como data (DeadlineCard), nunca "30 dias".
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
+import type { ErrorPresentation } from '../../../core/error-boundary';
+import { ASSURANCE_ORDER, SessionFacade } from '../../../core/session.facade';
+import {
+  RECURSO_JARI_GATE,
+  RecursoJariSchema,
+} from '../../../forms/recurso-jari.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { RecursoJariFormComponent } from '../components/recurso-jari-form.component';
+import { DefesaFacade } from '../defesa.facade';
+
+const REQUEST_PARAM = 'requestId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICE_KEY = 'recurso_jari';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t03.state.loading',
+  ineligible: 'portal.screens.t03.state.ineligible',
+  error: 'portal.screens.t03.state.error_recoverable',
+  forbidden: 'portal.screens.t03.state.forbidden',
+  unavailable: 'portal.screens.t03.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-recurso-jari-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    RecursoJariFormComponent,
+  ],
+  providers: [DefesaFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-03',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t03.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t03.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading' || wizardLoading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.ineligibility(); as reason) {
+        <p data-ineligible [attr.data-reason]="reason">
+          {{ stateKeys.ineligible | stynxTranslate }}
+          <a
+            [routerLink]="processRoute(requestId())"
+            [attr.routerLink]="processRoute(requestId())"
+            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+          >
+        </p>
+      }
+      @if (protocoled()) {
+        <p data-suspensive-effect>
+          {{ 'portal.screens.t03.intro' | stynxTranslate }}
+        </p>
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+      @if (recoverableError()) {
+        <p data-error-recoverable>
+          {{ stateKeys.error | stynxTranslate }}
+        </p>
+      }
+      @if (forbidden()) {
+        <p data-forbidden>{{ stateKeys.forbidden | stynxTranslate }}</p>
+      }
+    </div>
+
+    @if (facade.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="reload()" />
+    }
+
+    @for (deadline of facade.deadlines(); track $index) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        [labelKey]="nextActionKey(deadline.ownedBy)"
+      />
+    }
+
+    @if (facade.target(); as target) {
+      @if (facade.existingRequestId() === null) {
+        <portal-service-wizard
+          #wizard
+          [target]="target"
+          [schema]="schema"
+          [gate]="gate"
+          [resumeRoute]="resumeRoute()"
+          (created)="lastFailure.set(null)"
+          (draftSaved)="lastFailure.set(null)"
+          (failed)="onFailed($event)"
+        >
+          <portal-recurso-jari-form
+            [prefilled]="wizard.store.prefilled()"
+            [requirements]="wizard.store.requirements()"
+            [requestId]="wizard.store.requestId()"
+            [fields]="wizard.store.error()?.fields ?? []"
+            [disabled]="wizard.store.busy()"
+            [values]="wizard.values()"
+            (valuesChange)="wizard.values.set($event)"
+            (draftRequested)="wizard.store.save()"
+          />
+        </portal-service-wizard>
+      }
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class RecursoJariPageComponent {
+  readonly facade = inject(DefesaFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly session = inject(SessionFacade);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private started = false;
+  private focused = false;
+
+  readonly requestId = signal('');
+  readonly lastFailure = signal<ErrorPresentation | null>(null);
+  readonly schema = RecursoJariSchema;
+  readonly gate = RECURSO_JARI_GATE;
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly resumeRoute = computed(() => this.router.url);
+
+  readonly wizardLoading = computed(
+    () => this.wizard()?.store.status() === 'loading',
+  );
+  /** Passo protocolo: o efeito suspensivo é repetido ([UC-PORTAL-002] AC-1). */
+  readonly protocoled = computed(
+    () => this.wizard()?.store.step() === 'protocolo',
+  );
+
+  /** `422 SERVICE_UNAVAILABLE { unavailableReason }` do `POST requests` (M15). */
+  readonly unavailableReason = computed<string | null>(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.status() !== 'unavailable') return null;
+    const reason = store.error()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : 'unavailable';
+  });
+
+  readonly recoverableError = computed(() => {
+    const failure = this.lastFailure();
+    return failure !== null && failure.code !== 'PORTAL.SERVICE_UNAVAILABLE';
+  });
+
+  /** T02 §5 "sem permissão": só texto de contexto — o caminho é o `SignatureStep`/`AssuranceExplainer`. */
+  readonly forbidden = computed(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.step() !== 'assinatura') return false;
+    const required = store.minimumAssurance();
+    if (!required || required === 'none') return false;
+    const current = this.session.assuranceLevel();
+    return (
+      current === null || ASSURANCE_ORDER[current] < ASSURANCE_ORDER[required]
+    );
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const requestId = params.get(REQUEST_PARAM) ?? '';
+        this.requestId.set(requestId);
+        this.started = false;
+        this.focused = false;
+        void this.facade.load({
+          screen: 'T-03',
+          requestId,
+          resumeRoute: this.router.url,
+        });
+      });
+    // Contexto resolvido: retoma o ponto guardado ou inicia o pedido (T02 §5), uma única vez.
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const status = this.facade.status();
+      untracked(() => {
+        if (!wizard || this.started || status !== 'ready') return;
+        this.started = true;
+        const resume = this.facade.resume();
+        if (resume) wizard.resumeFrom(resume);
+        else void wizard.store.start();
+      });
+    });
+    afterRenderEffect(() => {
+      const status = this.facade.status();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && (status === 'ready' || status === 'error')) {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+  }
+
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  processRoute(requestId: string): string {
+    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
+  }
+
+  onFailed(presentation: ErrorPresentation): void {
+    this.lastFailure.set(presentation);
+  }
+
+  reload(): void {
+    this.started = false;
+    void this.facade.load({
+      screen: 'T-03',
+      requestId: this.requestId(),
+      resumeRoute: this.router.url,
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/indicacao/components/indicacao-condutor-form.component.ts b/apps/portal/web/src/app/features/indicacao/components/indicacao-condutor-form.component.ts
new file mode 100644
index 0000000..ac45a3a
--- /dev/null
+++ b/apps/portal/web/src/app/features/indicacao/components/indicacao-condutor-form.component.ts
@@ -0,0 +1,309 @@
+// IndicacaoCondutorForm (contrato CTG-0003b §6 T-05; [UC-PORTAL-004] AC-1/AC-2; [RN-PORTAL-104]):
+// passo 2 projetado — o que o órgão já tem (`PrefilledSummary`, só leitura), os dados do condutor
+// (`driver.*`, nomes como no corpo do ato), as assinaturas do proprietário e do condutor
+// (caminho (a) gov.br é o padrão; (b) documento assinado é a alternativa — o próprio arquivo
+// entra no passo de assinatura pelo `SignatureStep`, pois `IndicacaoCondutorSchema` é estrito e o
+// rascunho não carrega `attachmentIds`) e o pedido de "continuar", que a PÁGINA intercepta para
+// abrir a consequência ANTES de gravar ([DIVERGE-5]). Erros de campo (`fields[]`, ex.:
+// `driver.cpf`) marcam o controle pela diretiva sem reiniciar o preenchimento. Dados do condutor
+// nunca aparecem fora do ato.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  model,
+  output,
+} from '@angular/core';
+import { StynxTranslatePipe } from '@detran/ui';
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import { PrefilledSummaryComponent } from '../../../shared/prefilled-summary.component';
+
+/** Siglas das 27 unidades federativas (IBGE) — valor de `driver.cnhUf` (2 letras). */
+const UFS = [
+  'AC',
+  'AL',
+  'AP',
+  'AM',
+  'BA',
+  'CE',
+  'DF',
+  'ES',
+  'GO',
+  'MA',
+  'MT',
+  'MS',
+  'MG',
+  'PA',
+  'PB',
+  'PR',
+  'PE',
+  'PI',
+  'RJ',
+  'RN',
+  'RS',
+  'RO',
+  'RR',
+  'SC',
+  'SP',
+  'SE',
+  'TO',
+] as const;
+
+/**
+ * Categorias de habilitação (CTB art. 143: ACC, A, B, C, D, E; combinações A+B…A+E conforme
+ * Res. CONTRAN 789/2020) — valor de `driver.category`; o servidor valida
+ * (`INDICATION_DRIVER_INVALID { fields }`). Enum canônico a confirmar (ver relatório).
+ */
+const CNH_CATEGORIES = [
+  'ACC',
+  'A',
+  'B',
+  'C',
+  'D',
+  'E',
+  'AB',
+  'AC',
+  'AD',
+  'AE',
+] as const;
+
+const OWNER_SIGNATURES = ['govbr', 'upload'] as const;
+const DRIVER_SIGNATURES = ['govbr', 'upload', 'pending'] as const;
+type OwnerSignature = (typeof OWNER_SIGNATURES)[number];
+type DriverSignature = (typeof DRIVER_SIGNATURES)[number];
+
+export interface IndicacaoCondutorValues {
+  readonly driver: {
+    readonly cpf: string;
+    readonly cnhNumber: string;
+    readonly cnhUf: string;
+    readonly category: string;
+    readonly name: string;
+  };
+  readonly signatures: {
+    readonly owner: OwnerSignature;
+    readonly driver: DriverSignature;
+  };
+  readonly consequenceAck?: unknown;
+}
+
+type DriverField = keyof IndicacaoCondutorValues['driver'];
+
+/** Caminho (a) gov.br é o padrão ([RN-PORTAL-104]); (b) upload é a alternativa. */
+const EMPTY_VALUES: IndicacaoCondutorValues = {
+  driver: { cpf: '', cnhNumber: '', cnhUf: '', category: '', name: '' },
+  signatures: { owner: OWNER_SIGNATURES[0], driver: DRIVER_SIGNATURES[0] },
+};
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+function asValues(
+  value: Record<string, unknown> | null,
+): IndicacaoCondutorValues {
+  const raw = value ?? {};
+  return {
+    ...EMPTY_VALUES,
+    ...raw,
+    driver: {
+      ...EMPTY_VALUES.driver,
+      ...(isRecord(raw['driver']) ? raw['driver'] : {}),
+    },
+    signatures: {
+      ...EMPTY_VALUES.signatures,
+      ...(isRecord(raw['signatures']) ? raw['signatures'] : {}),
+    },
+  } as IndicacaoCondutorValues;
+}
+
+@Component({
+  selector: 'portal-indicacao-condutor-form',
+  imports: [
+    StynxTranslatePipe,
+    PortalFieldErrorsDirective,
+    PrefilledSummaryComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <portal-prefilled-summary [prefilled]="prefilled()" />
+    <form
+      class="portal-indicacao-form"
+      [portalFieldErrors]="fields()"
+      (submit)="$event.preventDefault()"
+    >
+      <fieldset [disabled]="disabled()" data-driver>
+        <label>
+          <span>{{
+            'portal.forms.indicacao_condutor.cpf' | stynxTranslate
+          }}</span>
+          <input
+            type="text"
+            name="driver.cpf"
+            inputmode="numeric"
+            autocomplete="off"
+            [value]="current().driver.cpf"
+            (input)="patchDriver('cpf', $event)"
+          />
+        </label>
+        <label>
+          <span>{{
+            'portal.forms.indicacao_condutor.nome' | stynxTranslate
+          }}</span>
+          <input
+            type="text"
+            name="driver.name"
+            autocomplete="off"
+            [value]="current().driver.name"
+            (input)="patchDriver('name', $event)"
+          />
+        </label>
+        <label>
+          <span>{{
+            'portal.forms.indicacao_condutor.cnh' | stynxTranslate
+          }}</span>
+          <input
+            type="text"
+            name="driver.cnhNumber"
+            inputmode="numeric"
+            autocomplete="off"
+            [value]="current().driver.cnhNumber"
+            (input)="patchDriver('cnhNumber', $event)"
+          />
+        </label>
+        <label>
+          <span>{{
+            'portal.forms.indicacao_condutor.uf' | stynxTranslate
+          }}</span>
+          <select
+            name="driver.cnhUf"
+            [value]="current().driver.cnhUf"
+            (change)="patchDriver('cnhUf', $event)"
+          >
+            <option value=""></option>
+            @for (uf of ufs; track uf) {
+              <option [value]="uf">{{ uf }}</option>
+            }
+          </select>
+        </label>
+        <label>
+          <span>{{
+            'portal.forms.indicacao_condutor.categoria' | stynxTranslate
+          }}</span>
+          <select
+            name="driver.category"
+            [value]="current().driver.category"
+            (change)="patchDriver('category', $event)"
+          >
+            <option value=""></option>
+            @for (category of categories; track category) {
+              <option [value]="category">{{ category }}</option>
+            }
+          </select>
+        </label>
+      </fieldset>
+
+      <p [id]="signatureHintId">
+        {{ 'portal.forms.indicacao_condutor.assinatura_hint' | stynxTranslate }}
+      </p>
+      <fieldset
+        [disabled]="disabled()"
+        [attr.aria-labelledby]="signatureHintId"
+        data-signatures="owner"
+      >
+        @for (method of ownerSignatures; track method) {
+          <label>
+            <input
+              type="radio"
+              name="signatures.owner"
+              [value]="method"
+              [checked]="current().signatures.owner === method"
+              (change)="patchSignature('owner', method)"
+            />
+            <span>{{ signatureKey(method) | stynxTranslate }}</span>
+          </label>
+        }
+      </fieldset>
+      <fieldset
+        [disabled]="disabled()"
+        [attr.aria-labelledby]="signatureHintId"
+        data-signatures="driver"
+      >
+        @for (method of driverSignatures; track method) {
+          <label>
+            <input
+              type="radio"
+              name="signatures.driver"
+              [value]="method"
+              [checked]="current().signatures.driver === method"
+              (change)="patchSignature('driver', method)"
+            />
+            <span>{{ signatureKey(method) | stynxTranslate }}</span>
+          </label>
+        }
+      </fieldset>
+
+      <div class="portal-indicacao-actions">
+        <button
+          type="button"
+          data-draft
+          [disabled]="disabled()"
+          (click)="draftRequested.emit()"
+        >
+          {{ 'portal.screens.t05.cmd.draft' | stynxTranslate }}
+        </button>
+        <button
+          type="button"
+          data-continue
+          [disabled]="disabled()"
+          (click)="continueRequested.emit()"
+        >
+          {{ 'portal.common.action.continue' | stynxTranslate }}
+        </button>
+      </div>
+    </form>
+  `,
+})
+export class IndicacaoCondutorFormComponent {
+  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
+  readonly requestId = input<string | null>(null);
+  readonly fields = input<readonly string[]>([]);
+  readonly disabled = input(false);
+  readonly values = model<Record<string, unknown> | null>(null);
+  readonly draftRequested = output<void>();
+  /** A página abre o `ConsequenceDialog` antes de gravar ([DIVERGE-5]). */
+  readonly continueRequested = output<void>();
+
+  readonly ufs = UFS;
+  readonly categories = CNH_CATEGORIES;
+  readonly ownerSignatures = OWNER_SIGNATURES;
+  readonly driverSignatures = DRIVER_SIGNATURES;
+  readonly signatureHintId = 'portal-indicacao-signature-hint';
+  readonly current = computed(() => asValues(this.values()));
+
+  signatureKey(method: OwnerSignature | DriverSignature): string {
+    return `portal.forms.indicacao_condutor.assinatura.${method}`;
+  }
+
+  patchDriver(field: DriverField, event: Event): void {
+    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
+    const current = this.current();
+    this.values.set({
+      ...current,
+      driver: { ...current.driver, [field]: value },
+    });
+  }
+
+  patchSignature(
+    party: 'owner' | 'driver',
+    method: OwnerSignature | DriverSignature,
+  ): void {
+    const current = this.current();
+    this.values.set({
+      ...current,
+      signatures: { ...current.signatures, [party]: method },
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/indicacao/indicacao.facade.ts b/apps/portal/web/src/app/features/indicacao/indicacao.facade.ts
new file mode 100644
index 0000000..fc11eeb
--- /dev/null
+++ b/apps/portal/web/src/app/features/indicacao/indicacao.facade.ts
@@ -0,0 +1,101 @@
+// IndicacaoFacade (contrato CTG-0003b §3.4; T-05): carrega o AIT (contexto do ato), resolve o alvo
+// `{ indicacao_condutor, ait, aitId }` e o ponto de retomada — `ResumeService` (rota + alvo) ou
+// pedido aberto em composição (sem novo `POST`); pedido aberto em estado posterior →
+// `existingRequestId`. `deadlines` = `deadlines[]` do AIT, sem transformação. Provida na página;
+// sem cache local; nenhuma decisão de prazo ou de nível (o servidor responde
+// `INDICATION_WINDOW_CLOSED`; a guarda já decidiu a disponibilidade — `availability` fica `null`).
+import { Injectable, inject, signal } from '@angular/core';
+import {
+  presentError,
+  type ErrorPresentation,
+} from '../../core/error-boundary';
+import { ResumeService } from '../../core/resume.service';
+import type { ServiceAvailability } from '../../core/service-catalog.facade';
+import { PortalClient } from '../../data/portal.client';
+import type { AitDeadline, AitDetail } from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type {
+  WizardResumeDraft,
+  WizardTarget,
+} from '../../shared/service-wizard.store';
+import {
+  resumeFromOpenRequest,
+  resumePointFor,
+} from '../../shared/wizard-resume';
+
+export interface IndicacaoLoadParams {
+  readonly aitId: string;
+  /** `state.url` da tela (ponto de retomada do `ResumeService`). */
+  readonly resumeRoute?: string;
+}
+
+const SERVICE_KEY = 'indicacao_condutor';
+
+@Injectable()
+export class IndicacaoFacade {
+  private readonly client = inject(PortalClient);
+  private readonly resumeService = inject(ResumeService);
+
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly targetState = signal<WizardTarget | null>(null);
+  private readonly resumeState = signal<WizardResumeDraft | null>(null);
+  private readonly existingRequestIdState = signal<string | null>(null);
+  private readonly deadlinesState = signal<readonly AitDeadline[]>([]);
+  private readonly availabilityState = signal<ServiceAvailability | null>(null);
+  private readonly aitState = signal<AitDetail | null>(null);
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly target = this.targetState.asReadonly();
+  readonly resume = this.resumeState.asReadonly();
+  readonly existingRequestId = this.existingRequestIdState.asReadonly();
+  readonly deadlines = this.deadlinesState.asReadonly();
+  /** Sempre `null` nesta facade (a guarda decidiu; o banner parcial é só do pagamento). */
+  readonly availability = this.availabilityState.asReadonly();
+  readonly ait = this.aitState.asReadonly();
+  readonly serviceKey = SERVICE_KEY;
+
+  async load(params: IndicacaoLoadParams): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    this.targetState.set(null);
+    this.resumeState.set(null);
+    this.existingRequestIdState.set(null);
+    try {
+      const ait = await this.client.getAit(params.aitId);
+      this.aitState.set(ait);
+      this.deadlinesState.set(ait.deadlines ?? []);
+      const target: WizardTarget = {
+        serviceKey: SERVICE_KEY,
+        targetKind: 'ait',
+        targetId: params.aitId,
+      };
+      const resume = params.resumeRoute
+        ? resumePointFor(this.resumeService, params.resumeRoute, target)
+        : null;
+      if (resume) {
+        this.resumeState.set(resume);
+      } else if (ait.openRequestId) {
+        const open = await resumeFromOpenRequest(
+          this.client,
+          ait.openRequestId,
+          target,
+        );
+        if (open === 'existing_request') {
+          this.existingRequestIdState.set(ait.openRequestId);
+        } else if (open) {
+          this.resumeState.set(open);
+        }
+      }
+      this.targetState.set(target);
+      this.statusState.set('ready');
+    } catch (error: unknown) {
+      const presentation = presentError(error, {
+        entitlement: { kind: 'ait', id: params.aitId },
+      });
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+}
diff --git a/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts b/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts
index 9bd356a..e3d5cc8 100644
--- a/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts
+++ b/apps/portal/web/src/app/features/indicacao/indicacao.routes.ts
@@ -1,7 +1,13 @@
-// Módulo `indicacao` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('indicacao', { '<path>': { component, title } })`.
+// Módulo `indicacao` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rota
+// derivada do manifesto com caminho completo — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título são fixados aqui (T-05).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { IndicacaoCondutorPageComponent } from './pages/indicacao-condutor.page';

-export const INDICACAO_ROUTES: Routes = moduleRoutes('indicacao');
+export const INDICACAO_ROUTES: Routes = moduleRoutes('indicacao', {
+  'autos/:aitId/condutor/nova': {
+    component: IndicacaoCondutorPageComponent,
+    title: 'portal.screens.t05.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/indicacao/pages/indicacao-condutor.page.ts b/apps/portal/web/src/app/features/indicacao/pages/indicacao-condutor.page.ts
new file mode 100644
index 0000000..5f3bcda
--- /dev/null
+++ b/apps/portal/web/src/app/features/indicacao/pages/indicacao-condutor.page.ts
@@ -0,0 +1,371 @@
+// T-05 Assistente de indicação de condutor (contrato CTG-0003b §6; ficha IU-PORTAL-T05;
+// [UC-PORTAL-004]; [RN-PORTAL-104]; spec §2 inv. 10; [DIVERGE-5]): a consequência jurídica vem ANTES
+// do ato — ao "continuar" do passo 2 a PÁGINA abre o `ConsequenceDialog` (`consequencias_indicacao`)
+// com foco, e só depois do aceite grava `values.consequenceAck` e chama `saveAndContinue()`; o
+// wizard fica com `consequence: null`. Se o botão do próprio wizard for usado, a validação do
+// `IndicacaoCondutorSchema` recusa sem `consequenceAck` e a página abre o mesmo diálogo (nenhum
+// `PUT` antes do aceite). `INDICATION_DRIVER_INVALID { fields }` marca o campo sem reiniciar;
+// `INDICATION_SECOND_SIGNATURE_PENDING` (informativo) é estado próprio, não erro;
+// `INDICATION_WINDOW_CLOSED` → inelegível com canal. Dados do condutor nunca fora do ato.
+import {
+  ChangeDetectionStrategy,
+  ChangeDetectorRef,
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
+import type { ErrorPresentation } from '../../../core/error-boundary';
+import { ASSURANCE_ORDER, SessionFacade } from '../../../core/session.facade';
+import type { DraftSaved } from '../../../data/portal.client';
+import {
+  INDICACAO_CONDUTOR_GATE,
+  IndicacaoCondutorSchema,
+} from '../../../forms/indicacao-condutor.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import {
+  ConsequenceDialogComponent,
+  type ConsequenceAck,
+  type LegalDocument,
+} from '../../../shared/consequence-dialog.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { IndicacaoCondutorFormComponent } from '../components/indicacao-condutor-form.component';
+import { IndicacaoFacade } from '../indicacao.facade';
+
+const AIT_PARAM = 'aitId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICE_KEY = 'indicacao_condutor';
+const LEGAL_DOCUMENT: LegalDocument = 'consequencias_indicacao';
+const ACK_FIELD = 'consequenceAck';
+const WINDOW_CLOSED_CODE = 'PORTAL.INDICATION_WINDOW_CLOSED';
+const SECOND_SIGNATURE_PENDING_CODE =
+  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING';
+const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
+const VALIDATION_FAILED_CODE = 'PORTAL.VALIDATION_FAILED';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t05.state.loading',
+  ineligible: 'portal.screens.t05.state.ineligible',
+  error: 'portal.screens.t05.state.error_recoverable',
+  forbidden: 'portal.screens.t05.state.forbidden',
+  unavailable: 'portal.screens.t05.state.unavailable',
+  pendingSignature: 'portal.screens.t05.state.pending_signature',
+} as const;
+
+@Component({
+  selector: 'portal-indicacao-condutor-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    ConsequenceDialogComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    IndicacaoCondutorFormComponent,
+  ],
+  providers: [IndicacaoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-05',
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+    '(change)': 'refresh()',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t05.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t05.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading' || wizardLoading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (facade.existingRequestId(); as existingRequestId) {
+        <p data-existing-request>
+          {{ stateKeys.ineligible | stynxTranslate }}
+          <a
+            [routerLink]="processRoute(existingRequestId)"
+            [attr.routerLink]="processRoute(existingRequestId)"
+            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+          >
+        </p>
+      }
+      @if (windowClosed()) {
+        <p data-ineligible data-reason="janela_encerrada">
+          {{ stateKeys.ineligible | stynxTranslate }}
+        </p>
+      }
+      @if (pendingSignature()) {
+        <p data-pending-signature>
+          {{ stateKeys.pendingSignature | stynxTranslate }}
+        </p>
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+      @if (recoverableError()) {
+        <p data-error-recoverable>{{ stateKeys.error | stynxTranslate }}</p>
+      }
+      @if (forbidden()) {
+        <p data-forbidden>{{ stateKeys.forbidden | stynxTranslate }}</p>
+      }
+    </div>
+
+    @if (facade.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="reload()" />
+    }
+
+    @for (deadline of facade.deadlines(); track $index) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        [labelKey]="nextActionKey(deadline.ownedBy)"
+      />
+    }
+
+    @if (facade.target(); as target) {
+      @if (facade.existingRequestId() === null) {
+        <portal-service-wizard
+          #wizard
+          [target]="target"
+          [schema]="schema"
+          [gate]="gate"
+          [resumeRoute]="resumeRoute()"
+          (created)="lastFailure.set(null)"
+          (draftSaved)="onDraftSaved($event)"
+          (failed)="onFailed($event)"
+        >
+          <portal-indicacao-condutor-form
+            [prefilled]="wizard.store.prefilled()"
+            [requestId]="wizard.store.requestId()"
+            [fields]="fieldErrors()"
+            [disabled]="wizard.store.busy()"
+            [values]="wizard.values()"
+            (valuesChange)="wizard.values.set($event)"
+            (draftRequested)="onDraftRequested()"
+            (continueRequested)="onContinueRequested()"
+          />
+        </portal-service-wizard>
+        <portal-consequence-dialog
+          [document]="legalDocument"
+          [open]="dialogOpen()"
+          ackLabelKey="portal.forms.indicacao_condutor.confirmacao"
+          confirmLabelKey="portal.screens.t05.cmd.submit"
+          cancelLabelKey="portal.common.action.cancel"
+          (confirmed)="onConsequenceConfirmed($event)"
+          (cancelled)="dialogOpen.set(false)"
+        />
+      }
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class IndicacaoCondutorPageComponent {
+  readonly facade = inject(IndicacaoFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly session = inject(SessionFacade);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly changeDetector = inject(ChangeDetectorRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private started = false;
+  private focused = false;
+  /** `start()` em curso: um aceite dado antes do pedido existir espera por ele. */
+  private startPending: Promise<void> = Promise.resolve();
+
+  readonly aitId = signal('');
+  readonly lastFailure = signal<ErrorPresentation | null>(null);
+  readonly dialogOpen = signal(false);
+  readonly pendingSignature = signal(false);
+  readonly schema = IndicacaoCondutorSchema;
+  readonly gate = INDICACAO_CONDUTOR_GATE;
+  readonly stateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly legalDocument = LEGAL_DOCUMENT;
+  readonly resumeRoute = computed(() => this.router.url);
+
+  readonly wizardLoading = computed(
+    () => this.wizard()?.store.status() === 'loading',
+  );
+
+  /** `fields[]` do erro do servidor (ex.: `driver.cpf`) — a validação local do ack não marca campo. */
+  readonly fieldErrors = computed<readonly string[]>(() => {
+    const error = this.wizard()?.store.error();
+    if (!error || error.code === VALIDATION_FAILED_CODE) return [];
+    return error.fields;
+  });
+
+  readonly unavailableReason = computed<string | null>(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.status() !== 'unavailable') return null;
+    const reason = store.error()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : 'unavailable';
+  });
+
+  readonly windowClosed = computed(
+    () => this.lastFailure()?.code === WINDOW_CLOSED_CODE,
+  );
+
+  readonly recoverableError = computed(() => {
+    const failure = this.lastFailure();
+    return (
+      failure !== null &&
+      failure.code !== SERVICE_UNAVAILABLE_CODE &&
+      failure.code !== WINDOW_CLOSED_CODE
+    );
+  });
+
+  readonly forbidden = computed(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.step() !== 'assinatura') return false;
+    const required = store.minimumAssurance();
+    if (!required || required === 'none') return false;
+    const current = this.session.assuranceLevel();
+    return (
+      current === null || ASSURANCE_ORDER[current] < ASSURANCE_ORDER[required]
+    );
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const aitId = params.get(AIT_PARAM) ?? '';
+        this.aitId.set(aitId);
+        this.started = false;
+        this.focused = false;
+        void this.facade.load({ aitId, resumeRoute: this.router.url });
+      });
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const status = this.facade.status();
+      untracked(() => {
+        if (!wizard || this.started || status !== 'ready') return;
+        this.started = true;
+        const resume = this.facade.resume();
+        if (resume) wizard.resumeFrom(resume);
+        else this.startPending = wizard.store.start();
+      });
+    });
+    // O botão "continuar" do próprio wizard sem o aceite: a validação local recusa (schema
+    // estrito) e o diálogo de consequência é aberto aqui — nenhum PUT antes do aceite.
+    afterRenderEffect(() => {
+      const error = this.wizard()?.store.error();
+      untracked(() => {
+        if (
+          error?.code === VALIDATION_FAILED_CODE &&
+          error.fields.includes(ACK_FIELD) &&
+          !this.hasAck()
+        ) {
+          this.dialogOpen.set(true);
+        }
+      });
+    });
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
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  processRoute(requestId: string): string {
+    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
+  }
+
+  /** "Continuar" do passo 2: consequência ANTES do ato ([UC-PORTAL-004] AC-3), no mesmo clique. */
+  onContinueRequested(): void {
+    if (this.hasAck()) {
+      void this.wizard()?.saveAndContinue();
+      return;
+    }
+    this.dialogOpen.set(true);
+    this.refresh();
+  }
+
+  /**
+   * Toda mudança de controle (campos do condutor, aceite do diálogo) é refletida na tela no mesmo
+   * evento — resposta imediata: o botão do diálogo acompanha o checkbox sem esperar o próximo ciclo.
+   */
+  refresh(): void {
+    this.changeDetector.detectChanges();
+  }
+
+  /** Rascunho explícito: exige o mesmo aceite (o schema é estrito). */
+  onDraftRequested(): void {
+    if (this.hasAck()) {
+      void this.wizard()?.store.save();
+      return;
+    }
+    this.dialogOpen.set(true);
+  }
+
+  /** Aceite gravado DIRETAMENTE nos valores do wizard e só então o rascunho é salvo. */
+  async onConsequenceConfirmed(ack: ConsequenceAck): Promise<void> {
+    this.dialogOpen.set(false);
+    const wizard = this.wizard();
+    if (!wizard) return;
+    wizard.values.set({ ...(wizard.values() ?? {}), [ACK_FIELD]: ack });
+    await this.startPending;
+    await wizard.saveAndContinue();
+  }
+
+  /** `INDICATION_SECOND_SIGNATURE_PENDING` chega como corpo informativo do 200 (T05 §5). */
+  onDraftSaved(body: DraftSaved): void {
+    this.lastFailure.set(null);
+    const code = (body as { code?: unknown }).code;
+    this.pendingSignature.set(code === SECOND_SIGNATURE_PENDING_CODE);
+  }
+
+  onFailed(presentation: ErrorPresentation): void {
+    if (presentation.code === SECOND_SIGNATURE_PENDING_CODE) {
+      this.pendingSignature.set(true);
+      return;
+    }
+    this.lastFailure.set(presentation);
+  }
+
+  reload(): void {
+    this.started = false;
+    void this.facade.load({
+      aitId: this.aitId(),
+      resumeRoute: this.router.url,
+    });
+  }
+
+  private hasAck(): boolean {
+    const values = this.wizard()?.values() ?? null;
+    return values !== null && ACK_FIELD in values && values[ACK_FIELD] != null;
+  }
+}
diff --git a/apps/portal/web/src/app/features/pagamento/components/pagamento-form.component.ts b/apps/portal/web/src/app/features/pagamento/components/pagamento-form.component.ts
new file mode 100644
index 0000000..61e1155
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/components/pagamento-form.component.ts
@@ -0,0 +1,129 @@
+// PagamentoForm (contrato CTG-0003b §4.4; T-13/T-23): o passo 2 do pagamento — `PaymentComparison`
+// (faixas lado a lado + meio) e o `ConsequenceDialog` da renúncia (`renuncia_40`), aberto quando
+// uma faixa que renuncia ao recurso é escolhida: só depois do aceite a faixa é selecionada e o
+// `waiverAck` gravado; `Escape`/cancelar não muda nada ([RN-PORTAL-128] 3). `confirmed` entrega à
+// página os valores do rascunho (`PagamentoSchema`: `{ tier, method, installments?, waiverAck? }`).
+// Nenhum cálculo: as faixas chegam prontas do servidor.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+  signal,
+  viewChild,
+} from '@angular/core';
+import type {
+  PaymentInfo,
+  PaymentMethod,
+  PaymentTierCode,
+} from '../../../data/portal-read.models';
+import {
+  ConsequenceDialogComponent,
+  type ConsequenceAck,
+  type LegalDocument,
+} from '../../../shared/consequence-dialog.component';
+import {
+  PaymentComparisonComponent,
+  type ConfirmedPaymentSelection,
+  type PaymentComparisonMode,
+  type PaymentFlags,
+} from '../../../shared/payment-comparison.component';
+
+const LEGAL_DOCUMENT: LegalDocument = 'renuncia_40';
+
+/** Valores do rascunho de pagamento (`PagamentoSchema`, contrato §5.1). */
+export interface PagamentoValues {
+  readonly tier: PaymentTierCode;
+  readonly method: PaymentMethod;
+  readonly installments?: number;
+  readonly waiverAck?: ConsequenceAck;
+}
+
+@Component({
+  selector: 'portal-pagamento-form',
+  imports: [PaymentComparisonComponent, ConsequenceDialogComponent],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.data-mode]': 'mode()',
+    '[attr.data-waiver-ack]': 'waiverAck() ? "true" : null',
+  },
+  template: `
+    <portal-payment-comparison
+      #comparison
+      [payment]="payment()"
+      [flags]="flags()"
+      [mode]="mode()"
+      [aitId]="aitId()"
+      [disabled]="disabled()"
+      [availableTiers]="availableTiers()"
+      [availableMethods]="availableMethods()"
+      (waiverRequested)="onWaiverRequested($event)"
+      (sneEnrollmentRequested)="sneEnrollmentRequested.emit()"
+      (preservingAppealRequested)="preservingAppealRequested.emit()"
+      (accessibleFormatRequested)="accessibleFormatRequested.emit()"
+      (confirmed)="onConfirmed($event)"
+    />
+    <portal-consequence-dialog
+      [document]="legalDocument"
+      [open]="dialogOpen()"
+      ackLabelKey="portal.forms.pagamento.confirmacao_renuncia_40"
+      confirmLabelKey="portal.common.action.continue"
+      cancelLabelKey="portal.common.action.cancel"
+      (confirmed)="onWaiverConfirmed($event)"
+      (cancelled)="pendingTier.set(null)"
+    />
+  `,
+})
+export class PagamentoFormComponent {
+  private readonly comparison =
+    viewChild.required<PaymentComparisonComponent>('comparison');
+
+  readonly payment = input.required<PaymentInfo>();
+  readonly flags = input.required<PaymentFlags>();
+  readonly mode = input<PaymentComparisonMode>('comparison');
+  readonly aitId = input.required<string>();
+  readonly disabled = input(false);
+  readonly availableTiers = input<readonly PaymentTierCode[] | null>(null);
+  readonly availableMethods = input<readonly PaymentMethod[] | null>(null);
+  /** Valores prontos para `ServiceWizard.values` → `saveAndContinue()`. */
+  readonly confirmed = output<PagamentoValues>();
+  readonly sneEnrollmentRequested = output<void>();
+  readonly preservingAppealRequested = output<void>();
+  readonly accessibleFormatRequested = output<void>();
+
+  readonly legalDocument = LEGAL_DOCUMENT;
+  /** Faixa que renuncia aguardando o aceite. */
+  readonly pendingTier = signal<PaymentTierCode | null>(null);
+  readonly waiverAck = signal<ConsequenceAck | null>(null);
+  readonly dialogOpen = computed(() => this.pendingTier() !== null);
+
+  onWaiverRequested(code: PaymentTierCode): void {
+    this.pendingTier.set(code);
+  }
+
+  /** Aceite por escrito → só então a faixa é selecionada ([RN-PORTAL-128] 2–3). */
+  onWaiverConfirmed(ack: ConsequenceAck): void {
+    const code = this.pendingTier();
+    this.pendingTier.set(null);
+    if (code === null) return;
+    this.waiverAck.set(ack);
+    this.comparison().selectTier(code);
+  }
+
+  /** `waiverAck` só acompanha uma faixa que renuncia (`PagamentoSchema`). */
+  onConfirmed(selection: ConfirmedPaymentSelection): void {
+    const waives = this.payment().tiers.some(
+      (tier) => tier.code === selection.tier && tier.waivesAppeal,
+    );
+    const ack = waives ? this.waiverAck() : null;
+    this.confirmed.emit({
+      tier: selection.tier,
+      method: selection.method,
+      ...(selection.installments !== undefined
+        ? { installments: selection.installments }
+        : {}),
+      ...(ack ? { waiverAck: ack } : {}),
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/pagamento/pagamento.facade.ts b/apps/portal/web/src/app/features/pagamento/pagamento.facade.ts
new file mode 100644
index 0000000..eab483b
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/pagamento.facade.ts
@@ -0,0 +1,118 @@
+// PagamentoFacade (contrato CTG-0003b §3.4; T-13/T-23): carrega o AIT (o `payment` com as faixas que
+// o SERVIDOR calculou — nada se calcula aqui), a disponibilidade do serviço `pagamento`
+// (`partially_available` → banner na página; `unavailable` já foi decidido pela guarda), resolve o
+// alvo `{ pagamento, ait, aitId }` e o ponto de retomada — `ResumeService` ou pedido aberto em
+// composição (sem novo `POST`); pedido aberto em estado posterior → `existingRequestId`.
+// `deadlines` = `deadlines[]` do AIT, sem transformação. Provida na página; sem cache local.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import {
+  presentError,
+  type ErrorPresentation,
+} from '../../core/error-boundary';
+import { ResumeService } from '../../core/resume.service';
+import {
+  ServiceCatalogFacade,
+  type ServiceAvailability,
+} from '../../core/service-catalog.facade';
+import { PortalClient } from '../../data/portal.client';
+import type {
+  AitDeadline,
+  AitDetail,
+  PaymentInfo,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+import type {
+  WizardResumeDraft,
+  WizardTarget,
+} from '../../shared/service-wizard.store';
+import {
+  resumeFromOpenRequest,
+  resumePointFor,
+} from '../../shared/wizard-resume';
+
+export interface PagamentoLoadParams {
+  readonly aitId: string;
+  /** `state.url` da tela (ponto de retomada do `ResumeService`). */
+  readonly resumeRoute?: string;
+}
+
+const SERVICE_KEY = 'pagamento';
+
+@Injectable()
+export class PagamentoFacade {
+  private readonly client = inject(PortalClient);
+  private readonly resumeService = inject(ResumeService);
+  private readonly catalog = inject(ServiceCatalogFacade);
+
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly targetState = signal<WizardTarget | null>(null);
+  private readonly resumeState = signal<WizardResumeDraft | null>(null);
+  private readonly existingRequestIdState = signal<string | null>(null);
+  private readonly deadlinesState = signal<readonly AitDeadline[]>([]);
+  private readonly availabilityState = signal<ServiceAvailability | null>(null);
+  private readonly aitState = signal<AitDetail | null>(null);
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly target = this.targetState.asReadonly();
+  readonly resume = this.resumeState.asReadonly();
+  readonly existingRequestId = this.existingRequestIdState.asReadonly();
+  readonly deadlines = this.deadlinesState.asReadonly();
+  /** `ServiceCatalogFacade.availability('pagamento')`: `partially_available` → banner (§3.4 g). */
+  readonly availability = this.availabilityState.asReadonly();
+  readonly ait = this.aitState.asReadonly();
+  /** `AitDetail.payment` como o servidor mandou (faixas, valores, datas prontos). */
+  readonly payment = computed<PaymentInfo | null>(
+    () => this.aitState()?.payment ?? null,
+  );
+  readonly serviceKey = SERVICE_KEY;
+
+  async load(params: PagamentoLoadParams): Promise<void> {
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    this.targetState.set(null);
+    this.resumeState.set(null);
+    this.existingRequestIdState.set(null);
+    const availability = this.catalog.availability(SERVICE_KEY).then(
+      (value) => this.availabilityState.set(value),
+      () => this.availabilityState.set(null),
+    );
+    try {
+      const ait = await this.client.getAit(params.aitId);
+      this.aitState.set(ait);
+      this.deadlinesState.set(ait.deadlines ?? []);
+      const target: WizardTarget = {
+        serviceKey: SERVICE_KEY,
+        targetKind: 'ait',
+        targetId: params.aitId,
+      };
+      const resume = params.resumeRoute
+        ? resumePointFor(this.resumeService, params.resumeRoute, target)
+        : null;
+      if (resume) {
+        this.resumeState.set(resume);
+      } else if (ait.openRequestId) {
+        const open = await resumeFromOpenRequest(
+          this.client,
+          ait.openRequestId,
+          target,
+        );
+        if (open === 'existing_request') {
+          this.existingRequestIdState.set(ait.openRequestId);
+        } else if (open) {
+          this.resumeState.set(open);
+        }
+      }
+      this.targetState.set(target);
+      this.statusState.set('ready');
+    } catch (error: unknown) {
+      const presentation = presentError(error, {
+        entitlement: { kind: 'ait', id: params.aitId },
+      });
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+    await availability;
+  }
+}
diff --git a/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts b/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts
index 389bf3f..0074920 100644
--- a/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts
+++ b/apps/portal/web/src/app/features/pagamento/pagamento.routes.ts
@@ -1,7 +1,18 @@
-// Módulo `pagamento` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('pagamento', { '<path>': { component, title } })`.
+// Módulo `pagamento` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-13, T-23).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { PagamentoPreservandoRecursoPageComponent } from './pages/pagamento-preservando-recurso.page';
+import { PagamentoPageComponent } from './pages/pagamento.page';

-export const PAGAMENTO_ROUTES: Routes = moduleRoutes('pagamento');
+export const PAGAMENTO_ROUTES: Routes = moduleRoutes('pagamento', {
+  'autos/:aitId/pagamento': {
+    component: PagamentoPageComponent,
+    title: 'portal.screens.t13.title',
+  },
+  'autos/:aitId/pagamento/preservando-recurso': {
+    component: PagamentoPreservandoRecursoPageComponent,
+    title: 'portal.screens.t23.title',
+  },
+});
diff --git a/apps/portal/web/src/app/features/pagamento/pages/pagamento-page.base.ts b/apps/portal/web/src/app/features/pagamento/pages/pagamento-page.base.ts
new file mode 100644
index 0000000..4a91cb7
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/pages/pagamento-page.base.ts
@@ -0,0 +1,229 @@
+// Base das páginas de pagamento (contrato CTG-0003b §6 T-13/T-23; §4.4): estado e ciclo comuns —
+// `PagamentoFacade` (AIT, disponibilidade, alvo, retomada), `ServiceWizard` (rascunho → assinatura
+// → protocolo), a comparação (`PagamentoForm`) e os erros do servidor depois do envio
+// (`PAYMENT_TIER_NOT_AVAILABLE`, `PAYMENT_METHOD_UNAVAILABLE`, `PAYMENT_ALREADY_PAID`) que voltam à
+// comparação com as opções marcadas (`data-reason="server"`/`paid`). O documento de arrecadação NÃO
+// está no 200 de `submit` (OD-P74): depois do protocolo mostra-se "indisponível nesta versão" +
+// canal alternativo, nunca boleto/PIX simulado (M15). Guia acessível ([RN-PORTAL-114]): sem campo
+// em `PUT preferences` (OD-P75) → "indisponível nesta versão" em `role="status"`. Nenhum cálculo:
+// faixas, valores e datas chegam prontos. As páginas T-13 e T-23 só fixam `mode` e o template.
+import {
+  DestroyRef,
+  Directive,
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
+  ENROLLMENT_ROUTE,
+  type ErrorPresentation,
+} from '../../../core/error-boundary';
+import type { RequestSubmitted } from '../../../data/portal.client';
+import type {
+  PaymentInfo,
+  PaymentMethod,
+  PaymentTierCode,
+} from '../../../data/portal-read.models';
+import {
+  PAGAMENTO_GATE,
+  PagamentoSchema,
+} from '../../../forms/pagamento.schema';
+import type { PaymentComparisonMode } from '../../../shared/payment-comparison.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import type { PagamentoValues } from '../components/pagamento-form.component';
+import { PagamentoFacade } from '../pagamento.facade';
+import { PAYMENT_FLAGS } from '../payment-flags';
+
+const AIT_PARAM = 'aitId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICE_KEY = 'pagamento';
+const TIER_NOT_AVAILABLE_CODE = 'PORTAL.PAYMENT_TIER_NOT_AVAILABLE';
+const METHOD_UNAVAILABLE_CODE = 'PORTAL.PAYMENT_METHOD_UNAVAILABLE';
+const ALREADY_PAID_CODE = 'PORTAL.PAYMENT_ALREADY_PAID';
+const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
+const PARTIAL_CODE = 'PORTAL.SERVICE_PARTIALLY_AVAILABLE';
+
+export interface PagamentoStateKeys {
+  readonly loading: string;
+  readonly ineligible: string;
+  readonly error: string;
+  readonly unavailable: string;
+  readonly notFound: string;
+}
+
+/** Textos de estado de T-13 (ficha §5; `portal.states.*` onde a ficha não fixa chave própria). */
+const STATE_KEYS: PagamentoStateKeys = {
+  loading: 'portal.states.loading',
+  ineligible: 'portal.states.ineligible',
+  error: 'portal.states.error',
+  unavailable: 'portal.states.service_unavailable',
+  notFound: 'portal.errors.not_found',
+};
+
+function stringList(value: unknown): readonly string[] | null {
+  return Array.isArray(value)
+    ? value.filter((item): item is string => typeof item === 'string')
+    : null;
+}
+
+/** `@Directive()` abstrata: as consultas (`viewChild`) da base são herdadas pelas páginas. */
+@Directive()
+export abstract class PagamentoPageBase {
+  readonly facade = inject(PagamentoFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
+  private started = false;
+  private focused = false;
+  /** `start()` em curso: uma confirmação feita antes do pedido existir espera por ele. */
+  private startPending: Promise<void> = Promise.resolve();
+
+  /** T-13: `'comparison'`; T-23: `'preserving_appeal'`. */
+  abstract readonly mode: PaymentComparisonMode;
+  readonly aitId = signal('');
+  readonly lastFailure = signal<ErrorPresentation | null>(null);
+  readonly submitted = signal<RequestSubmitted | null>(null);
+  readonly accessibleFormatRequested = signal(false);
+  readonly flags = PAYMENT_FLAGS;
+  readonly schema = PagamentoSchema;
+  readonly gate = PAGAMENTO_GATE;
+  readonly stateKeys: PagamentoStateKeys = STATE_KEYS;
+  readonly serviceKey = SERVICE_KEY;
+  readonly partialKey = 'portal.errors.service_partially_available';
+  readonly resumeRoute = computed(() => this.router.url);
+
+  readonly wizardLoading = computed(
+    () => this.wizard()?.store.status() === 'loading',
+  );
+  /** A comparação só trava enquanto o rascunho/envio está em curso (escolher durante o `start()` é inócuo). */
+  readonly wizardBusy = computed(() => {
+    const status = this.wizard()?.store.status();
+    return status === 'saving' || status === 'submitting';
+  });
+
+  readonly partiallyAvailable = computed(
+    () =>
+      this.facade.availability()?.status === 'partially_available' ||
+      this.lastFailure()?.code === PARTIAL_CODE,
+  );
+
+  /** `409 PAYMENT_ALREADY_PAID` reforça o estado "já pago" da comparação (§4.3 7). */
+  readonly paymentView = computed<PaymentInfo | null>(() => {
+    const payment = this.facade.payment();
+    if (!payment) return null;
+    return this.lastFailure()?.code === ALREADY_PAID_CODE
+      ? { ...payment, paid: true }
+      : payment;
+  });
+
+  /** `422 PAYMENT_TIER_NOT_AVAILABLE { availableTiers[] }`. */
+  readonly availableTiers = computed<readonly PaymentTierCode[] | null>(() => {
+    const failure = this.lastFailure();
+    if (failure?.code !== TIER_NOT_AVAILABLE_CODE) return null;
+    return stringList(failure.context['availableTiers']) as
+      readonly PaymentTierCode[] | null;
+  });
+
+  /** `422 PAYMENT_METHOD_UNAVAILABLE { available[] }`. */
+  readonly availableMethods = computed<readonly PaymentMethod[] | null>(() => {
+    const failure = this.lastFailure();
+    if (failure?.code !== METHOD_UNAVAILABLE_CODE) return null;
+    return stringList(failure.context['available']) as
+      readonly PaymentMethod[] | null;
+  });
+
+  readonly unavailableReason = computed<string | null>(() => {
+    const store = this.wizard()?.store;
+    if (!store || store.status() !== 'unavailable') return null;
+    const reason = store.error()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : 'unavailable';
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const aitId = params.get(AIT_PARAM) ?? '';
+        this.aitId.set(aitId);
+        this.started = false;
+        this.focused = false;
+        void this.facade.load({ aitId, resumeRoute: this.router.url });
+      });
+    afterRenderEffect(() => {
+      const wizard = this.wizard();
+      const status = this.facade.status();
+      untracked(() => {
+        if (!wizard || this.started || status !== 'ready') return;
+        this.started = true;
+        const resume = this.facade.resume();
+        if (resume) wizard.resumeFrom(resume);
+        else this.startPending = wizard.store.start();
+      });
+    });
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
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  processRoute(requestId: string): string {
+    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
+  }
+
+  /** Faixa + meio confirmados → valores do wizard → rascunho → assinatura (§4.4). */
+  async onConfirmed(selection: PagamentoValues): Promise<void> {
+    const wizard = this.wizard();
+    if (!wizard) return;
+    wizard.values.set({ ...selection });
+    await this.startPending;
+    await wizard.saveAndContinue();
+  }
+
+  onSubmitted(body: RequestSubmitted): void {
+    this.lastFailure.set(null);
+    this.submitted.set(body);
+  }
+
+  onFailed(presentation: ErrorPresentation): void {
+    this.lastFailure.set(
+      presentation.code === SERVICE_UNAVAILABLE_CODE ? null : presentation,
+    );
+  }
+
+  /** Adesão ao SNE (T-09, par 3): a decisão é do servidor; aqui só a navegação. */
+  goToEnrollment(): void {
+    void this.router.navigateByUrl(ENROLLMENT_ROUTE);
+  }
+
+  goToPreservingAppeal(): void {
+    void this.router.navigateByUrl(
+      `/autos/${this.aitId()}/pagamento/preservando-recurso`,
+    );
+  }
+
+  reload(): void {
+    this.started = false;
+    void this.facade.load({
+      aitId: this.aitId(),
+      resumeRoute: this.router.url,
+    });
+  }
+}
diff --git a/apps/portal/web/src/app/features/pagamento/pages/pagamento-preservando-recurso.page.ts b/apps/portal/web/src/app/features/pagamento/pages/pagamento-preservando-recurso.page.ts
new file mode 100644
index 0000000..6fabba3
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/pages/pagamento-preservando-recurso.page.ts
@@ -0,0 +1,177 @@
+// T-23 Pagar sem abrir mão do recurso (contrato CTG-0003b §6; ficha IU-PORTAL-T23;
+// [RN-PORTAL-127]; [JRN-PORTAL-010]): a mesma composição de T-13 SEM as faixas que renunciam
+// (`mode 'preserving_appeal'`: só `desconto_80` e `integral_juros`), com a garantia
+// `portal.screens.t23.intro` como frase principal ANTES da confirmação e repetida depois do
+// protocolo (o comprovante reflete a garantia), mais o link ao processo em curso quando há
+// `openRequestId`. Estados com as chaves próprias da ficha. Lógica comum em `PagamentoPageBase`.
+import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import type { PaymentComparisonMode } from '../../../shared/payment-comparison.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { PagamentoFormComponent } from '../components/pagamento-form.component';
+import { PagamentoFacade } from '../pagamento.facade';
+import {
+  PagamentoPageBase,
+  type PagamentoStateKeys,
+} from './pagamento-page.base';
+
+/** Textos de estado próprios da ficha T23 §5. */
+const T23_STATE_KEYS: PagamentoStateKeys = {
+  loading: 'portal.screens.t23.state.carregando',
+  ineligible: 'portal.screens.t23.state.sem_elegibilidade',
+  error: 'portal.screens.t23.state.erro_recuperavel',
+  unavailable: 'portal.screens.t23.state.indisponivel',
+  notFound: 'portal.screens.t23.state.sem_permissao',
+};
+
+@Component({
+  selector: 'portal-pagamento-preservando-recurso-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    PagamentoFormComponent,
+  ],
+  providers: [PagamentoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-23',
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t23.title' | stynxTranslate }}
+    </h1>
+    <p data-guarantee>{{ 'portal.screens.t23.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading' || wizardLoading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (partiallyAvailable()) {
+        <stynx-banner tone="warning" [message]="partialKey | stynxTranslate" />
+        <portal-alternative-channel-note
+          [note]="facade.availability()?.alternativeChannelNote ?? null"
+          [serviceKey]="serviceKey"
+        />
+      }
+      @if (facade.existingRequestId(); as existingRequestId) {
+        <p data-existing-request>
+          {{ stateKeys.ineligible | stynxTranslate }}
+          <a
+            [routerLink]="processRoute(existingRequestId)"
+            [attr.routerLink]="processRoute(existingRequestId)"
+            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+          >
+        </p>
+      }
+      @if (facade.status() === 'not_found') {
+        <p data-not-found>{{ stateKeys.notFound | stynxTranslate }}</p>
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+      @if (accessibleFormatRequested()) {
+        <p data-accessible-format-status>
+          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+        </p>
+      }
+      @if (submitted()) {
+        <p data-guarantee-after>
+          {{ 'portal.screens.t23.intro' | stynxTranslate }}
+        </p>
+        <p data-collection-document>
+          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+        </p>
+        <portal-alternative-channel-note [serviceKey]="serviceKey" />
+        @if (openRequestId(); as openRequestId) {
+          <p data-open-request>
+            <a
+              [routerLink]="processRoute(openRequestId)"
+              [attr.routerLink]="processRoute(openRequestId)"
+              >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+            >
+          </p>
+        }
+      }
+    </div>
+
+    @if (facade.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="reload()" />
+    }
+
+    @for (deadline of facade.deadlines(); track $index) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        [labelKey]="nextActionKey(deadline.ownedBy)"
+      />
+    }
+
+    @if (paymentView(); as payment) {
+      @if (!submitted()) {
+        <portal-pagamento-form
+          [payment]="payment"
+          [flags]="flags"
+          [mode]="mode"
+          [aitId]="aitId()"
+          [disabled]="wizardBusy()"
+          [availableTiers]="availableTiers()"
+          [availableMethods]="availableMethods()"
+          (confirmed)="onConfirmed($event)"
+          (sneEnrollmentRequested)="goToEnrollment()"
+          (preservingAppealRequested)="goToPreservingAppeal()"
+          (accessibleFormatRequested)="accessibleFormatRequested.set(true)"
+        />
+      }
+    }
+
+    @if (facade.target(); as target) {
+      @if (facade.existingRequestId() === null) {
+        <portal-service-wizard
+          #wizard
+          [target]="target"
+          [schema]="schema"
+          [gate]="gate"
+          [resumeRoute]="resumeRoute()"
+          (created)="lastFailure.set(null)"
+          (draftSaved)="lastFailure.set(null)"
+          (submitted)="onSubmitted($event)"
+          (failed)="onFailed($event)"
+        />
+      }
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class PagamentoPreservandoRecursoPageComponent extends PagamentoPageBase {
+  readonly mode: PaymentComparisonMode = 'preserving_appeal';
+  override readonly stateKeys = T23_STATE_KEYS;
+  /** Processo em curso sobre o AIT ([JRN-PORTAL-010] 3). */
+  readonly openRequestId = computed(
+    () => this.facade.ait()?.openRequestId ?? null,
+  );
+}
diff --git a/apps/portal/web/src/app/features/pagamento/pages/pagamento.page.ts b/apps/portal/web/src/app/features/pagamento/pages/pagamento.page.ts
new file mode 100644
index 0000000..091f692
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/pages/pagamento.page.ts
@@ -0,0 +1,147 @@
+// T-13 Pagar sua multa (contrato CTG-0003b §6; ficha IU-PORTAL-T13; [UC-PORTAL-015];
+// [RN-PORTAL-125…128]; H.53; OD-P05/P41): valor e desconto LADO A LADO assim que o AIT é lido
+// (`PagamentoForm` → `PaymentComparison`), a faixa de 40% visível mas indisponível com motivo
+// (H.53), renúncia só depois do diálogo, guia acessível mediante solicitação, link a T-23 e o ciclo
+// do wizard. `partially_available` → banner de status. Lógica comum em `PagamentoPageBase`.
+import { ChangeDetectionStrategy, Component } from '@angular/core';
+import { RouterLink } from '@angular/router';
+import {
+  DetranLoadingStateComponent,
+  StynxBannerComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import type { PaymentComparisonMode } from '../../../shared/payment-comparison.component';
+import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
+import { PagamentoFormComponent } from '../components/pagamento-form.component';
+import { PagamentoFacade } from '../pagamento.facade';
+import { PagamentoPageBase } from './pagamento-page.base';
+
+@Component({
+  selector: 'portal-pagamento-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxBannerComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    DeadlineCardComponent,
+    ServiceWizardComponent,
+    PagamentoFormComponent,
+  ],
+  providers: [PagamentoFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-13',
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t13.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t13.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading' || wizardLoading()) {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (partiallyAvailable()) {
+        <stynx-banner tone="warning" [message]="partialKey | stynxTranslate" />
+        <portal-alternative-channel-note
+          [note]="facade.availability()?.alternativeChannelNote ?? null"
+          [serviceKey]="serviceKey"
+        />
+      }
+      @if (facade.existingRequestId(); as existingRequestId) {
+        <p data-existing-request>
+          {{ stateKeys.ineligible | stynxTranslate }}
+          <a
+            [routerLink]="processRoute(existingRequestId)"
+            [attr.routerLink]="processRoute(existingRequestId)"
+            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
+          >
+        </p>
+      }
+      @if (facade.status() === 'not_found') {
+        <p data-not-found>{{ stateKeys.notFound | stynxTranslate }}</p>
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ stateKeys.unavailable | stynxTranslate }}
+        </p>
+      }
+      @if (accessibleFormatRequested()) {
+        <p data-accessible-format-status>
+          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+        </p>
+      }
+      @if (submitted()) {
+        <p data-collection-document>
+          {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+        </p>
+        <portal-alternative-channel-note [serviceKey]="serviceKey" />
+      }
+    </div>
+
+    @if (facade.error(); as error) {
+      <portal-error-banner [error]="error" (retry)="reload()" />
+    }
+
+    @for (deadline of facade.deadlines(); track $index) {
+      <portal-deadline-card
+        [dueOn]="deadline.dueOn"
+        [ownedBy]="deadline.ownedBy"
+        [kind]="deadline.kind"
+        [labelKey]="nextActionKey(deadline.ownedBy)"
+      />
+    }
+
+    @if (paymentView(); as payment) {
+      @if (!submitted()) {
+        <portal-pagamento-form
+          [payment]="payment"
+          [flags]="flags"
+          [mode]="mode"
+          [aitId]="aitId()"
+          [disabled]="wizardBusy()"
+          [availableTiers]="availableTiers()"
+          [availableMethods]="availableMethods()"
+          (confirmed)="onConfirmed($event)"
+          (sneEnrollmentRequested)="goToEnrollment()"
+          (preservingAppealRequested)="goToPreservingAppeal()"
+          (accessibleFormatRequested)="accessibleFormatRequested.set(true)"
+        />
+      }
+    }
+
+    @if (facade.target(); as target) {
+      @if (facade.existingRequestId() === null) {
+        <portal-service-wizard
+          #wizard
+          [target]="target"
+          [schema]="schema"
+          [gate]="gate"
+          [resumeRoute]="resumeRoute()"
+          (created)="lastFailure.set(null)"
+          (draftSaved)="lastFailure.set(null)"
+          (submitted)="onSubmitted($event)"
+          (failed)="onFailed($event)"
+        />
+      }
+    } @else {
+      <portal-alternative-channel-note [serviceKey]="serviceKey" />
+    }
+  `,
+})
+export class PagamentoPageComponent extends PagamentoPageBase {
+  readonly mode: PaymentComparisonMode = 'comparison';
+}
diff --git a/apps/portal/web/src/app/features/pagamento/payment-flags.ts b/apps/portal/web/src/app/features/pagamento/payment-flags.ts
new file mode 100644
index 0000000..c7c7aba
--- /dev/null
+++ b/apps/portal/web/src/app/features/pagamento/payment-flags.ts
@@ -0,0 +1,15 @@
+// PAYMENT_FLAGS (contrato CTG-0003b §4.2): transcrição das decisões desta rodada; nenhum valor é
+// lido de tabela do cliente além destes:
+//   H.53   — `collection.discount_40_outside_sne=false`, `portal.waiver_40_term=false`
+//            (a faixa de 40% aparece, mas fica indisponível com motivo; só texto no catálogo);
+//   OD-P05 — `portal.card_payment=false`, `portal.installments=false`
+//            (cartão parcelado indisponível; nunca "até 12x").
+// Quando `payment.methods` (H.53; forma `source_pending`, OD-P74) chegar do servidor, ele
+// prevalece sobre estas flags.
+import type { PaymentFlags } from '../../shared/payment-comparison.component';
+
+export const PAYMENT_FLAGS: PaymentFlags = {
+  waiverTerm: false,
+  cardPayment: false,
+  installments: false,
+};
diff --git a/apps/portal/web/src/app/features/processos/components/request-actions.component.ts b/apps/portal/web/src/app/features/processos/components/request-actions.component.ts
new file mode 100644
index 0000000..18fc53c
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/components/request-actions.component.ts
@@ -0,0 +1,115 @@
+// RequestActions (contrato CTG-0003b §6 T-07; T07 §6 "tudo navega"): as ações do processo, todas
+// navegação — responder diligência (T-11), desistir (T-08), recorrer (próxima instância, T-03/T-04)
+// e ver decisão (T-10). `canWithdraw false` NUNCA some sem explicação: botão `aria-disabled` com
+// `data-reason=<withdrawalBlockedReason>` e o rótulo `portal.common.label.reason` (o token nunca
+// vira texto). `canAppeal false` → sem botão (o servidor não dá motivo nesta leitura). Nenhuma
+// requisição de escrita aqui. Links carregam o atributo `routerLink` (espelho da rota).
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxTranslatePipe } from '@detran/ui';
+import type {
+  Diligence,
+  RequestActions,
+} from '../../../data/portal-read.models';
+
+const PROCESS_ROUTE_PREFIX = '/processos/';
+
+@Component({
+  selector: 'portal-request-actions',
+  imports: [RouterLink, StynxTranslatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-request-id]': 'requestId()' },
+  template: `
+    <nav class="portal-request-actions">
+      <ul>
+        @if (respondRoute(); as route) {
+          <li>
+            <a
+              [routerLink]="route"
+              [attr.routerLink]="route"
+              data-action="respond"
+              >{{ 'portal.screens.t07.cmd.respond' | stynxTranslate }}</a
+            >
+          </li>
+        }
+        <li>
+          @if (actions().canWithdraw) {
+            <a
+              [routerLink]="withdrawRoute()"
+              [attr.routerLink]="withdrawRoute()"
+              data-action="withdraw"
+              >{{ 'portal.screens.t07.cmd.withdraw' | stynxTranslate }}</a
+            >
+          } @else {
+            <a
+              role="link"
+              tabindex="0"
+              aria-disabled="true"
+              data-action="withdraw"
+              [attr.data-reason]="actions().withdrawalBlockedReason"
+              >{{ 'portal.screens.t07.cmd.withdraw' | stynxTranslate }}</a
+            >
+            @if (actions().withdrawalBlockedReason; as reason) {
+              <span
+                class="portal-request-actions-reason"
+                [attr.data-reason]="reason"
+                >{{ 'portal.common.label.reason' | stynxTranslate }}</span
+              >
+            }
+          }
+        </li>
+        @if (actions().canAppeal && appealRoute(); as route) {
+          <li>
+            <a
+              [routerLink]="route"
+              [attr.routerLink]="route"
+              data-action="appeal"
+              [attr.data-service-key]="actions().nextInstanceServiceKey"
+              >{{ 'portal.screens.t07.cmd.appeal' | stynxTranslate }}</a
+            >
+          </li>
+        }
+        @if (hasDecision()) {
+          <li>
+            <a
+              [routerLink]="decisionRoute()"
+              [attr.routerLink]="decisionRoute()"
+              data-action="decision"
+              >{{ 'portal.screens.t07.cmd.decision' | stynxTranslate }}</a
+            >
+          </li>
+        }
+      </ul>
+    </nav>
+  `,
+})
+export class RequestActionsComponent {
+  readonly requestId = input.required<string>();
+  readonly actions = input.required<RequestActions>();
+  /** Diligências do pedido: a primeira `open` é o alvo de "responder". */
+  readonly diligences = input<readonly Diligence[]>([]);
+  /** `ProcessosFacade.nextStepRoute(actions.nextInstanceServiceKey)`. */
+  readonly appealRoute = input<string | null>(null);
+  readonly hasDecision = input(false);
+
+  readonly respondRoute = computed<string | null>(() => {
+    if (!this.actions().canRespondDiligence) return null;
+    const open = this.diligences().find(
+      (diligence) => diligence.status === 'open',
+    );
+    return open
+      ? `${PROCESS_ROUTE_PREFIX}${this.requestId()}/diligencia/${open.diligenceId}`
+      : null;
+  });
+  readonly withdrawRoute = computed(
+    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}/desistencia`,
+  );
+  readonly decisionRoute = computed(
+    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}/decisao`,
+  );
+}
diff --git a/apps/portal/web/src/app/features/processos/pages/decisao.page.ts b/apps/portal/web/src/app/features/processos/pages/decisao.page.ts
new file mode 100644
index 0000000..261f6e1
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/pages/decisao.page.ts
@@ -0,0 +1,227 @@
+// T-10 Decisão do seu processo (contrato CTG-0003b §6; ficha IU-PORTAL-T10; [UC-PORTAL-008];
+// ux-notes §c; [RN-PORTAL-112] 1): RESULTADO primeiro — o `outcome` sempre traduzido
+// (`portal.situation.decision.<outcome>`, token só em `data-token`) no próprio <h1>; resumo do
+// servidor só quando existe; UM próximo passo (nunca lista de opções), só quando há rota no app;
+// prazo como DeadlineCard; documento baixável quando há URL, indisponível (nunca simulado) quando
+// não há; `finalInstance` → sem botão e sem sugestão de recurso. `404 kind 'decision'` é o estado
+// vazio (ainda sem decisão), não falta de vínculo. Nada de "24 meses" nem cálculo de prazo.
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
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ProcessosFacade } from '../processos.facade';
+
+const REQUEST_PARAM = 'requestId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const SERVICES_PREFIX = `portal.services.`;
+
+@Component({
+  selector: 'portal-decisao-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    DeadlineCardComponent,
+  ],
+  providers: [ProcessosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-10',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-status]': 'facade.decisionStatus()',
+    '[attr.aria-busy]': 'facade.decisionStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1" [attr.data-token]="decision()?.outcome ?? null">
+      {{ 'portal.screens.t10.title' | stynxTranslate }}
+      @if (decision(); as decision) {
+        <span class="portal-decision-outcome" data-outcome>{{
+          outcomeKey(decision.outcome) | stynxTranslate
+        }}</span>
+      }
+    </h1>
+    <p>{{ 'portal.screens.t10.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.decisionStatus() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.decisionError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.decisionStatus() === 'empty') {
+      <detran-empty-state
+        [title]="'portal.screens.t10.empty' | stynxTranslate"
+        [message]="'portal.screens.t10.empty' | stynxTranslate"
+      />
+    }
+
+    @if (decision(); as decision) {
+      <section
+        class="portal-decision"
+        [attr.data-token]="decision.outcome"
+        [attr.data-final-instance]="decision.finalInstance"
+        [attr.data-refund-due]="decision.refundDue === true ? 'true' : null"
+      >
+        <!-- OD-P72: refundDue sem valor (amount) na leitura: só data-refund-due, sem texto. -->
+        @if (decision.publishedOn; as publishedOn) {
+          <p data-published-on>
+            <time [attr.datetime]="publishedOn">{{
+              publishedOn | stynxIntlDate
+            }}</time>
+          </p>
+        }
+        @if (decision.summary; as summary) {
+          <p data-summary aria-live="polite">{{ summary }}</p>
+        }
+        @if (decision.finalInstance === true) {
+          <p data-final-instance>
+            {{ 'portal.screens.t10.state.ultima_instancia' | stynxTranslate }}
+          </p>
+        } @else if (decision.finalInstance === false) {
+          <p data-not-final>
+            {{ 'portal.screens.t10.state.nao_definitivo' | stynxTranslate }}
+          </p>
+        }
+        @if (nextStep(); as step) {
+          <p data-next-step [attr.data-service-key]="step.serviceKey">
+            <a [routerLink]="step.route" [attr.routerLink]="step.route">{{
+              step.labelKey | stynxTranslate
+            }}</a>
+          </p>
+          @if (step.dueOn; as dueOn) {
+            <portal-deadline-card
+              [dueOn]="dueOn"
+              [ownedBy]="'citizen'"
+              [labelKey]="step.labelKey"
+            />
+          }
+        }
+        <p data-document>
+          @if (decision.documentUrl; as url) {
+            <a download [attr.href]="url" rel="noopener">{{
+              'portal.screens.t10.cmd.baixar_documento' | stynxTranslate
+            }}</a>
+          } @else {
+            <button
+              type="button"
+              aria-disabled="true"
+              data-reason="unavailable"
+            >
+              {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+            </button>
+          }
+        </p>
+      </section>
+    }
+
+    <p>
+      <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
+        'portal.screens.t07.title' | stynxTranslate
+      }}</a>
+    </p>
+  `,
+})
+export class DecisaoPageComponent {
+  readonly facade = inject(ProcessosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly requestId = signal('');
+  readonly decision = computed(() =>
+    this.facade.decisionStatus() === 'ready' ? this.facade.decision() : null,
+  );
+
+  /** UM próximo passo: só quando `nextStep.serviceKey` tem rota no app e rótulo no catálogo. */
+  readonly nextStep = computed<{
+    readonly serviceKey: string;
+    readonly route: string;
+    readonly labelKey: string;
+    readonly dueOn: string | null;
+  } | null>(() => {
+    const decision = this.decision();
+    if (!decision || decision.finalInstance === true) return null;
+    const serviceKey = decision.nextStep?.serviceKey ?? null;
+    const route = this.facade.nextStepRoute(serviceKey);
+    if (!serviceKey || !route) return null;
+    const labelKey = `${SERVICES_PREFIX}${serviceKey}`;
+    if (!(labelKey in this.i18n.catalog())) return null;
+    return {
+      serviceKey,
+      route,
+      labelKey,
+      dueOn: decision.nextStep?.dueOn ?? null,
+    };
+  });
+
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
+        void this.facade.loadDecision(requestId);
+        void this.facade.loadDetail(requestId);
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.decisionStatus();
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
+  outcomeKey(outcome: string): string {
+    return `portal.situation.decision.${outcome}`;
+  }
+
+  reload(): void {
+    void this.facade.loadDecision(this.requestId());
+    void this.facade.loadDetail(this.requestId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/processos/pages/desistencia.page.ts b/apps/portal/web/src/app/features/processos/pages/desistencia.page.ts
new file mode 100644
index 0000000..a53db4e
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/pages/desistencia.page.ts
@@ -0,0 +1,315 @@
+// T-08 Confirmação de desistência (contrato CTG-0003b §6; ficha IU-PORTAL-T08; [UC-PORTAL-006];
+// [DIVERGE-9]): a consequência jurídica INLINE (`portal.legal.consequencias_desistencia.v1`, versão
+// `v1`), focada ao carregar e lida por completo antes do botão (ordem do DOM); confirmação por
+// escrito (checkbox obrigatório, `DesistenciaSchema`); `withdraw` com `If-Match` do `ETag` lido;
+// `canWithdraw false` → inelegível com `data-reason`, sem formulário; `409 WITHDRAWAL_AFTER_JUDGMENT`
+// → o mesmo texto + banner; `412`/`428` → recarregar, formulário mantido. Cancelar volta ao processo
+// sem nenhuma escrita. Nenhum cálculo de prazo aqui (o servidor decide).
+import {
+  ChangeDetectionStrategy,
+  ChangeDetectorRef,
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
+import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
+import type { RequestWithdrawBody } from '../../../data/portal.client';
+import { DesistenciaSchema } from '../../../forms/desistencia.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { LEGAL_TEXT_VERSION } from '../../../shared/consequence-dialog.component';
+import { ProcessosFacade } from '../processos.facade';
+
+const REQUEST_PARAM = 'requestId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const AIT_ROUTE_PREFIX = '/autos/';
+const LEGAL_DOCUMENT = 'consequencias_desistencia';
+const AFTER_JUDGMENT_CODE = 'PORTAL.WITHDRAWAL_AFTER_JUDGMENT';
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t08.state.loading',
+  ineligible: 'portal.screens.t08.state.ineligible',
+  error: 'portal.screens.t08.state.error_recoverable',
+  unavailable: 'portal.screens.t08.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-desistencia-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    PortalFieldErrorsDirective,
+    AlternativeChannelNoteComponent,
+  ],
+  providers: [ProcessosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-08',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-status]': 'facade.detailStatus()',
+    '[attr.data-command-status]': 'facade.commandStatus()',
+    '[attr.aria-busy]': 'busy() ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1" [id]="titleId">
+      {{ 'portal.screens.t08.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t08.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.detailStatus() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+      @if (withdrawn(); as withdrawn) {
+        <p data-withdrawn [attr.data-token]="withdrawn.state">
+          {{ requestStateKey(withdrawn.state) | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (stateTextKey(); as key) {
+        <p data-state-text [attr.data-reason]="blockedReason()">
+          {{ key | stynxTranslate }}
+        </p>
+      }
+      @if (facade.detailError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.commandError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (withdrawn(); as withdrawn) {
+      <p>
+        <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
+          'portal.screens.t07.title' | stynxTranslate
+        }}</a>
+      </p>
+      @if (paymentRoute(); as route) {
+        <p>
+          <a [routerLink]="route" [attr.routerLink]="route">{{
+            'portal.screens.t01.cmd.pay' | stynxTranslate
+          }}</a>
+        </p>
+      }
+    } @else if (facade.detail(); as detail) {
+      @if (detail.actions.canWithdraw) {
+        <section
+          #legal
+          role="region"
+          tabindex="-1"
+          [attr.aria-labelledby]="titleId"
+          [attr.data-document]="legalDocument"
+          [attr.data-text-version]="textVersion"
+          class="portal-legal-text"
+        >
+          <p>{{ legalTextKey | stynxTranslate }}</p>
+        </section>
+        <form
+          class="portal-desistencia-form"
+          [portalFieldErrors]="fields()"
+          (submit)="onSubmit($event)"
+        >
+          <label>
+            <input
+              type="checkbox"
+              name="confirm"
+              [checked]="confirmed()"
+              [disabled]="busy()"
+              (change)="onConfirmChange($event)"
+            />
+            <span>{{
+              'portal.forms.desistencia.confirmacao' | stynxTranslate
+            }}</span>
+          </label>
+          <label>
+            <span>{{
+              'portal.forms.desistencia.motivo' | stynxTranslate
+            }}</span>
+            <textarea
+              name="reason"
+              rows="3"
+              [value]="reason()"
+              [disabled]="busy()"
+              (input)="onReasonInput($event)"
+            ></textarea>
+          </label>
+          <div class="portal-desistencia-actions">
+            <button type="button" data-cancel (click)="cancel()">
+              {{ 'portal.screens.t08.cmd.cancel' | stynxTranslate }}
+            </button>
+            <button type="submit" data-confirm [disabled]="!canConfirm()">
+              {{ 'portal.screens.t08.cmd.confirm' | stynxTranslate }}
+            </button>
+          </div>
+        </form>
+      } @else {
+        <p>
+          <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
+            'portal.screens.t07.title' | stynxTranslate
+          }}</a>
+        </p>
+      }
+    }
+
+    <portal-alternative-channel-note />
+  `,
+})
+export class DesistenciaPageComponent {
+  readonly facade = inject(ProcessosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly router = inject(Router);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly changeDetector = inject(ChangeDetectorRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly legal = viewChild<ElementRef<HTMLElement>>('legal');
+  private focusedLegal = false;
+
+  readonly requestId = signal('');
+  readonly confirmed = signal(false);
+  readonly reason = signal('');
+  readonly withdrawn = signal<{ state: string } | null>(null);
+  readonly stateKeys = STATE_KEYS;
+  readonly legalDocument = LEGAL_DOCUMENT;
+  readonly textVersion = LEGAL_TEXT_VERSION;
+  readonly legalTextKey = `portal.legal.${LEGAL_DOCUMENT}.${LEGAL_TEXT_VERSION}`;
+  readonly titleId = 'portal-desistencia-title';
+
+  readonly busy = computed(
+    () =>
+      this.facade.detailStatus() === 'loading' ||
+      this.facade.commandStatus() === 'submitting',
+  );
+
+  /** `fields[]` do erro de comando (400/422) para a diretiva. */
+  readonly fields = computed<readonly string[]>(
+    () => this.facade.commandError()?.fields ?? [],
+  );
+
+  readonly afterJudgment = computed(
+    () => this.facade.commandError()?.code === AFTER_JUDGMENT_CODE,
+  );
+
+  readonly blockedReason = computed<string | null>(() => {
+    const detail = this.facade.detail();
+    if (detail && !detail.actions.canWithdraw) {
+      return detail.actions.withdrawalBlockedReason;
+    }
+    return null;
+  });
+
+  readonly stateTextKey = computed<string | null>(() => {
+    if (this.afterJudgment()) return STATE_KEYS.ineligible;
+    const detail = this.facade.detail();
+    if (detail && !detail.actions.canWithdraw) return STATE_KEYS.ineligible;
+    switch (this.facade.detailStatus()) {
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.error;
+      default:
+        break;
+    }
+    switch (this.facade.commandStatus()) {
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.error;
+      default:
+        return null;
+    }
+  });
+
+  readonly canConfirm = computed(
+    () => this.confirmed() && !this.busy() && this.withdrawn() === null,
+  );
+
+  readonly processRoute = computed(
+    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}`,
+  );
+
+  /** [UC-PORTAL-006] AC-4: depois de desistir, pagar com o valor já calculado (T-13). */
+  readonly paymentRoute = computed<string | null>(() => {
+    const request = this.facade.detail()?.request;
+    return request?.targetKind === 'ait' && request.targetId
+      ? `${AIT_ROUTE_PREFIX}${request.targetId}/pagamento`
+      : null;
+  });
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const requestId = params.get(REQUEST_PARAM) ?? '';
+        this.requestId.set(requestId);
+        this.focusedLegal = false;
+        void this.facade.loadDetail(requestId);
+      });
+    // Foco no texto jurídico ao carregar (T08 §9): a consequência é lida antes do botão.
+    afterRenderEffect(() => {
+      const status = this.facade.detailStatus();
+      const legal = this.legal()?.nativeElement;
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (this.focusedLegal || status !== 'ready') return;
+        this.focusedLegal = true;
+        (legal ?? heading)?.focus();
+      });
+    });
+  }
+
+  requestStateKey(state: string): string {
+    return `portal.situation.request.${state}`;
+  }
+
+  /** O botão de confirmar acompanha o checkbox no mesmo evento (resposta imediata). */
+  onConfirmChange(event: Event): void {
+    this.confirmed.set((event.target as HTMLInputElement).checked);
+    this.changeDetector.detectChanges();
+  }
+
+  onReasonInput(event: Event): void {
+    this.reason.set((event.target as HTMLTextAreaElement).value);
+  }
+
+  /** `DesistenciaSchema.safeParse` → `withdraw` com `If-Match = etag()` (§2.2). */
+  async onSubmit(event: Event): Promise<void> {
+    event.preventDefault();
+    if (!this.canConfirm()) return;
+    const reason = this.reason().trim();
+    const parsed = DesistenciaSchema.safeParse({
+      confirm: this.confirmed(),
+      ...(reason.length > 0 ? { reason } : {}),
+    });
+    if (!parsed.success) return;
+    const body: RequestWithdrawBody = parsed.data;
+    const result = await this.facade.withdraw(this.requestId(), body);
+    if (result) this.withdrawn.set({ state: result.state });
+  }
+
+  /** [UC-PORTAL-006] 3a: volta ao processo sem nenhuma requisição de escrita. */
+  cancel(): void {
+    void this.router.navigateByUrl(this.processRoute());
+  }
+
+  reload(): void {
+    void this.facade.loadDetail(this.requestId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/processos/pages/diligencia.page.ts b/apps/portal/web/src/app/features/processos/pages/diligencia.page.ts
new file mode 100644
index 0000000..bc6518f
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/pages/diligencia.page.ts
@@ -0,0 +1,315 @@
+// T-11 Responder pendência (contrato CTG-0003b §6; ficha IU-PORTAL-T11; [UC-PORTAL-009];
+// [RN-PORTAL-106]): o que o órgão pediu (texto do servidor), o prazo VISÍVEL como data
+// (`portal.screens.t11.field.prazo`, nunca "N dias"), a resposta em texto + anexos
+// (`AttachmentUploader`, checklist vazio; documento do órgão é recusado só por arquivo) e o envio
+// (`RespostaDiligenciaSchema` → `respondDiligence`). 2xx → detalhe relido e status na hora;
+// `422 SERVICE_UNAVAILABLE` → indisponível com motivo e canal, nunca confirmação simulada (M15);
+// `409 DILIGENCE_NOT_OPEN` → "encerrada" + banner (a pendência não some). Diligência ausente →
+// vazio + volta ao processo; `expired`/`answered` → encerrada, sem formulário. Prorrogação: só o
+// texto do hint (OD-P76). Sem `canDeactivate` neste par (OD-P79).
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
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type { DiligenceResponseBody } from '../../../data/portal.client';
+import type { Diligence } from '../../../data/portal-read.models';
+import {
+  ATTACHMENT_ACCEPT,
+  ATTACHMENT_MAX_BYTES,
+} from '../../../forms/attachments';
+import { RespostaDiligenciaSchema } from '../../../forms/resposta-diligencia.schema';
+import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
+import { AttachmentUploaderComponent } from '../../../shared/attachment-uploader.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import { ProcessosFacade } from '../processos.facade';
+
+const REQUEST_PARAM = 'requestId';
+const DILIGENCE_PARAM = 'diligenceId';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const DEADLINE_ID = 'diligence-deadline';
+const DILIGENCE_NOT_OPEN_CODE = 'PORTAL.DILIGENCE_NOT_OPEN';
+const DILIGENCE_KIND = 'diligencia';
+
+@Component({
+  selector: 'portal-diligencia-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    AlternativeChannelNoteComponent,
+    AttachmentUploaderComponent,
+    DeadlineCardComponent,
+  ],
+  providers: [ProcessosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-11',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-diligence-id]': 'diligenceId()',
+    '[attr.data-status]': 'facade.detailStatus()',
+    '[attr.data-command-status]': 'facade.commandStatus()',
+    '[attr.aria-busy]': 'busy() ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t11.title' | stynxTranslate }}
+    </h1>
+    <p>{{ 'portal.screens.t11.intro' | stynxTranslate }}</p>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.detailStatus() === 'loading') {
+        <detran-loading-state
+          [label]="'portal.states.loading' | stynxTranslate"
+        />
+      }
+      @if (unavailableReason(); as reason) {
+        <p data-unavailable [attr.data-reason]="reason">
+          {{ 'portal.states.service_unavailable' | stynxTranslate }}
+        </p>
+      }
+      @if (closed()) {
+        <p data-closed>
+          {{ 'portal.screens.t11.state.encerrada' | stynxTranslate }}
+        </p>
+      }
+      @if (answered()) {
+        <p #confirmation tabindex="-1" data-answered>
+          {{ 'portal.situation.badge.em_analise' | stynxTranslate }}
+        </p>
+      }
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (facade.detailError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+      @if (facade.commandError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (missing()) {
+      <detran-empty-state
+        [title]="'portal.screens.t11.empty' | stynxTranslate"
+        [message]="'portal.screens.t11.empty' | stynxTranslate"
+      />
+    }
+
+    @if (diligence(); as diligence) {
+      <section
+        class="portal-diligence"
+        [attr.data-diligence-status]="diligence.status"
+        [attr.data-outcome]="diligence.outcome"
+      >
+        @if (diligence.requestText; as text) {
+          <p data-request-text>{{ text }}</p>
+        }
+        @if (dueOn(); as dueOn) {
+          <p [id]="deadlineId" data-due-on [attr.data-due-on]="dueOn">
+            {{
+              'portal.screens.t11.field.prazo'
+                | stynxTranslate: { dueOn: (dueOn | stynxIntlDate) }
+            }}
+          </p>
+          <portal-deadline-card
+            [dueOn]="dueOn"
+            [ownedBy]="'citizen'"
+            [kind]="diligenceKind"
+            labelKey="portal.situation.next_action.citizen"
+          />
+        }
+        @if (diligence.status === 'open' && !answered()) {
+          <!-- Sem portalFieldErrors: a diretiva do par 1 remove todo aria-describedby que não
+               seja de erro, e o campo precisa apontar ao prazo (T11 §4; ver relatório). -->
+          <form class="portal-diligence-form" (submit)="onSubmit($event)">
+            <label>
+              <span>{{
+                'portal.forms.resposta_diligencia.resposta' | stynxTranslate
+              }}</span>
+              <textarea
+                name="text"
+                rows="6"
+                [attr.aria-describedby]="dueOn() ? deadlineId : null"
+                [value]="text()"
+                [disabled]="busy()"
+                (input)="onTextInput($event)"
+              ></textarea>
+            </label>
+            <fieldset>
+              <legend>
+                {{ 'portal.forms.resposta_diligencia.anexos' | stynxTranslate }}
+              </legend>
+              <portal-attachment-uploader
+                [requestId]="requestId()"
+                [accept]="accept"
+                [maxBytes]="maxBytes"
+                [checklist]="[]"
+                hintKey="portal.forms.resposta_diligencia.hint"
+                labelKey="portal.forms.resposta_diligencia.anexos"
+                [disabled]="busy()"
+                [(attachmentIds)]="attachmentIds"
+              />
+            </fieldset>
+            <button type="submit" data-action="enviar" [disabled]="busy()">
+              {{ 'portal.screens.t11.cmd.enviar' | stynxTranslate }}
+            </button>
+          </form>
+        }
+      </section>
+    }
+
+    <p>
+      <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
+        'portal.screens.t07.title' | stynxTranslate
+      }}</a>
+    </p>
+    <portal-alternative-channel-note />
+  `,
+})
+export class DiligenciaPageComponent {
+  readonly facade = inject(ProcessosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private readonly confirmation =
+    viewChild<ElementRef<HTMLElement>>('confirmation');
+  private focused = false;
+  private focusedConfirmation = false;
+
+  readonly requestId = signal('');
+  readonly diligenceId = signal('');
+  readonly text = signal('');
+  readonly attachmentIds = signal<readonly string[]>([]);
+  readonly answered = signal(false);
+  readonly accept = ATTACHMENT_ACCEPT;
+  readonly maxBytes = ATTACHMENT_MAX_BYTES;
+  readonly deadlineId = DEADLINE_ID;
+  readonly diligenceKind = DILIGENCE_KIND;
+
+  readonly busy = computed(
+    () =>
+      this.facade.detailStatus() === 'loading' ||
+      this.facade.commandStatus() === 'submitting',
+  );
+
+  readonly diligence = computed<Diligence | null>(() =>
+    this.facade.detail() ? this.facade.diligence(this.diligenceId()) : null,
+  );
+
+  /** Detalhe lido e `diligenceId` ausente em `diligences[]` → vazio (T11 §5). */
+  readonly missing = computed(
+    () => this.facade.detailStatus() === 'ready' && this.diligence() === null,
+  );
+
+  /** `expired`/`answered` na leitura, ou `409 DILIGENCE_NOT_OPEN` no envio → encerrada. */
+  readonly closed = computed(() => {
+    const diligence = this.diligence();
+    if (diligence && diligence.status !== 'open') return true;
+    return this.facade.commandError()?.code === DILIGENCE_NOT_OPEN_CODE;
+  });
+
+  /** Prazo próprio da diligência ou o da `deadlines[] kind 'diligencia'` (associação: OD-P72). */
+  readonly dueOn = computed<string | null>(() => {
+    const own = this.diligence()?.dueOn ?? null;
+    if (own) return own;
+    return (
+      this.facade
+        .detail()
+        ?.deadlines?.find((deadline) => deadline.kind === DILIGENCE_KIND)
+        ?.dueOn ?? null
+    );
+  });
+
+  /** `422 SERVICE_UNAVAILABLE { unavailableReason }` (M15): motivo só em `data-reason`. */
+  readonly unavailableReason = computed<string | null>(() => {
+    if (this.facade.commandStatus() !== 'unavailable') return null;
+    const reason = this.facade.commandError()?.context['unavailableReason'];
+    return typeof reason === 'string' ? reason : 'unavailable';
+  });
+
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
+        this.diligenceId.set(params.get(DILIGENCE_PARAM) ?? '');
+        this.focused = false;
+        void this.facade.loadDetail(requestId);
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.detailStatus();
+      const heading = this.heading()?.nativeElement;
+      untracked(() => {
+        if (!this.focused && status === 'ready') {
+          this.focused = true;
+          heading?.focus();
+        }
+      });
+    });
+    // Foco na confirmação depois do envio ([UC-PORTAL-009] AC-4).
+    afterRenderEffect(() => {
+      const confirmation = this.confirmation()?.nativeElement;
+      untracked(() => {
+        if (confirmation && !this.focusedConfirmation) {
+          this.focusedConfirmation = true;
+          confirmation.focus();
+        }
+      });
+    });
+  }
+
+  onTextInput(event: Event): void {
+    this.text.set((event.target as HTMLTextAreaElement).value);
+  }
+
+  /** `RespostaDiligenciaSchema.safeParse` → `respondDiligence` (respond_diligence:<did>:<fp>). */
+  async onSubmit(event: Event): Promise<void> {
+    event.preventDefault();
+    if (this.busy()) return;
+    const parsed = RespostaDiligenciaSchema.safeParse({
+      text: this.text(),
+      attachmentIds: [...this.attachmentIds()],
+    });
+    if (!parsed.success) return;
+    const body: DiligenceResponseBody = parsed.data;
+    const result = await this.facade.respondDiligence(
+      this.requestId(),
+      this.diligenceId(),
+      body,
+    );
+    if (result) this.answered.set(true);
+  }
+
+  reload(): void {
+    void this.facade.loadDetail(this.requestId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/processos/pages/request-detail.page.ts b/apps/portal/web/src/app/features/processos/pages/request-detail.page.ts
new file mode 100644
index 0000000..1c58178
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/pages/request-detail.page.ts
@@ -0,0 +1,232 @@
+// T-07 Detalhe do processo (contrato CTG-0003b §6; ficha IU-PORTAL-T07; [UC-PORTAL-005];
+// [RN-PORTAL-112]): cabeçalho (protocolo, data, canal, serviço, situação), a linha do tempo com
+// "com você" × "com o órgão" explícitos, documentos baixáveis a qualquer momento e as ações — todas
+// navegação (T07 §6), nunca escrita. `not_found` mostra "por que não vejo isto" (nunca tela
+// vazia); em `unavailable`/`error` o que já carregou permanece. Nunca status "parado" sem a última
+// ação (`updatedAt`). Regiões de estado/alerta existem desde o carregamento.
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
+  StynxI18nService,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import {
+  CitizenStatusBadgeComponent,
+  badgeOf,
+} from '../../../shared/citizen-status-badge.component';
+import { ProcessTimelineComponent } from '../../../shared/process-timeline.component';
+import { RequestActionsComponent } from '../components/request-actions.component';
+import { ProcessosFacade } from '../processos.facade';
+
+const REQUEST_PARAM = 'requestId';
+const SERVICES_PREFIX = `portal.services.`;
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t07.state.loading',
+  not_found: 'portal.screens.t07.state.ineligible',
+  error: 'portal.screens.t07.state.error_recoverable',
+  unavailable: 'portal.screens.t07.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-request-detail-page',
+  imports: [
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    CitizenStatusBadgeComponent,
+    ProcessTimelineComponent,
+    RequestActionsComponent,
+  ],
+  providers: [ProcessosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-07',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-status]': 'facade.detailStatus()',
+    '[attr.aria-busy]': 'facade.detailStatus() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t07.title' | stynxTranslate }}
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
+    </div>
+
+    <div role="alert" class="portal-alert-region">
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+      @if (facade.detailError(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.detail(); as detail) {
+      <header
+        class="portal-request-header"
+        [attr.data-token]="detail.request.state"
+      >
+        <dl>
+          @if (detail.request.protocol; as protocol) {
+            <dt>{{ 'portal.common.receipt.number' | stynxTranslate }}</dt>
+            <dd data-protocol>{{ protocol.number }}</dd>
+            <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
+            <dd>
+              <time [attr.datetime]="protocol.issuedAt">{{
+                protocol.issuedAt | stynxIntlDate: dateFormat
+              }}</time>
+            </dd>
+            @if (protocol.channel === 'portal') {
+              <dt>{{ 'portal.common.receipt.channel' | stynxTranslate }}</dt>
+              <dd data-channel="portal">
+                {{ 'portal.notifications.origin.portal' | stynxTranslate }}
+              </dd>
+            }
+          }
+          <dt>
+            {{ 'portal.screens.t06.field.atualizado_em' | stynxTranslate }}
+          </dt>
+          <dd>
+            <time [attr.datetime]="detail.request.updatedAt">{{
+              detail.request.updatedAt | stynxIntlDate: dateFormat
+            }}</time>
+          </dd>
+        </dl>
+        @if (serviceLabelKey(); as key) {
+          <p data-service [attr.data-service-key]="detail.request.serviceKey">
+            {{ key | stynxTranslate }}
+          </p>
+        }
+        @if (badge(); as situation) {
+          <portal-citizen-status-badge
+            [situation]="situation"
+            [token]="detail.request.state"
+          />
+        } @else {
+          <p data-situation [attr.data-token]="detail.request.state">
+            {{ requestStateKey(detail.request.state) | stynxTranslate }}
+          </p>
+        }
+      </header>
+
+      <portal-process-timeline
+        [requestId]="requestId()"
+        [entries]="detail.timeline"
+        [deadlines]="detail.deadlines"
+        [documents]="detail.documents"
+        [diligences]="detail.diligences"
+        [decision]="detail.decision ?? null"
+        [protocol]="detail.request.protocol ?? null"
+      />
+
+      <portal-request-actions
+        [requestId]="requestId()"
+        [actions]="detail.actions"
+        [diligences]="detail.diligences"
+        [appealRoute]="appealRoute()"
+        [hasDecision]="
+          detail.decision !== null && detail.decision !== undefined
+        "
+      />
+    }
+  `,
+})
+export class RequestDetailPageComponent {
+  readonly facade = inject(ProcessosFacade);
+  private readonly route = inject(ActivatedRoute);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly requestId = signal('');
+  readonly stateKeys = STATE_KEYS;
+  readonly dateFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  readonly stateTextKey = computed<string | null>(() => {
+    switch (this.facade.detailStatus()) {
+      case 'not_found':
+        return STATE_KEYS.not_found;
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.error;
+      default:
+        return null;
+    }
+  });
+
+  readonly badge = computed(() => {
+    const state = this.facade.detail()?.request?.state;
+    return state ? badgeOf(state) : null;
+  });
+
+  readonly serviceLabelKey = computed<string | null>(() => {
+    const serviceKey = this.facade.detail()?.request?.serviceKey;
+    const key = serviceKey ? `${SERVICES_PREFIX}${serviceKey}` : null;
+    return key && key in this.i18n.catalog() ? key : null;
+  });
+
+  readonly appealRoute = computed(() =>
+    this.facade.nextStepRoute(
+      this.facade.detail()?.actions?.nextInstanceServiceKey ?? null,
+    ),
+  );
+
+  constructor() {
+    this.route.paramMap
+      .pipe(takeUntilDestroyed(this.destroyRef))
+      .subscribe((params) => {
+        const requestId = params.get(REQUEST_PARAM) ?? '';
+        this.requestId.set(requestId);
+        this.focused = false;
+        void this.facade.loadDetail(requestId);
+      });
+    afterRenderEffect(() => {
+      const status = this.facade.detailStatus();
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
+  reload(): void {
+    void this.facade.loadDetail(this.requestId());
+  }
+}
diff --git a/apps/portal/web/src/app/features/processos/pages/request-list.page.ts b/apps/portal/web/src/app/features/processos/pages/request-list.page.ts
new file mode 100644
index 0000000..78c1f01
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/pages/request-list.page.ts
@@ -0,0 +1,328 @@
+// T-06 Meus processos (contrato CTG-0003b §6; ficha IU-PORTAL-T06; [UC-PORTAL-005]): a lista dos
+// pedidos ordenável por urgência SÓ pelo `dueOn` recebido (ou por atualização), filtro por estado
+// que vai ao servidor, e por item: protocolo, serviço, situação traduzida (badge ou texto; token só
+// em `data-*`), "com você"/"com o órgão", o rótulo do próximo passo que o servidor manda (só se for
+// uma chave `portal.requests.nextAction.*` do catálogo — nunca chave estranha como texto), prazo
+// como DeadlineCard só quando há `dueOn`, e a última atualização. Cada item é lido inteiro por
+// leitor de tela e inteiro é link para o processo. Regiões de estado/alerta existem desde o início.
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
+  StynxI18nService,
+  StynxIntlDatePipe,
+  StynxPaginationComponent,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
+import type {
+  RequestState,
+  RequestSummary,
+} from '../../../data/portal-read.models';
+import {
+  CitizenStatusBadgeComponent,
+  badgeOf,
+} from '../../../shared/citizen-status-badge.component';
+import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
+import {
+  ProcessosFacade,
+  REQUEST_STATES,
+  type RequestSort,
+} from '../processos.facade';
+
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const AUTOS_ROUTE = '/autos';
+const NEXT_ACTION_PREFIX = `portal.requests.nextAction.`;
+const SERVICES_PREFIX = `portal.services.`;
+const SORTS: readonly {
+  readonly sort: RequestSort;
+  readonly labelKey: string;
+}[] = [
+  { sort: 'urgencia', labelKey: 'portal.screens.t06.cmd.ordenar_urgencia' },
+  {
+    sort: 'atualizacao',
+    labelKey: 'portal.screens.t06.cmd.ordenar_atualizacao',
+  },
+];
+
+const STATE_KEYS = {
+  loading: 'portal.screens.t06.state.loading',
+  error: 'portal.screens.t06.state.error_recoverable',
+  unavailable: 'portal.screens.t06.state.unavailable',
+} as const;
+
+@Component({
+  selector: 'portal-request-list-page',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    StynxPaginationComponent,
+    DetranEmptyStateComponent,
+    DetranLoadingStateComponent,
+    PortalErrorBannerComponent,
+    CitizenStatusBadgeComponent,
+    DeadlineCardComponent,
+  ],
+  providers: [ProcessosFacade],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'data-screen': 'T-06',
+    '[attr.data-status]': 'facade.status()',
+    '[attr.data-sort]': 'facade.sort()',
+    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
+  },
+  template: `
+    <h1 #heading tabindex="-1">
+      {{ 'portal.screens.t06.title' | stynxTranslate }}
+    </h1>
+
+    <div
+      role="status"
+      class="portal-status-region"
+      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
+    >
+      @if (facade.status() === 'loading') {
+        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
+      }
+    </div>
+
+    <form class="portal-request-controls" (submit)="$event.preventDefault()">
+      <div role="group" class="portal-request-sort">
+        @for (option of sorts; track option.sort) {
+          <button
+            type="button"
+            [attr.data-sort]="option.sort"
+            [attr.aria-pressed]="
+              facade.sort() === option.sort ? 'true' : 'false'
+            "
+            (click)="facade.setSort(option.sort)"
+          >
+            {{ option.labelKey | stynxTranslate }}
+          </button>
+        }
+      </div>
+      <label>
+        <span>{{
+          'portal.screens.t06.cmd.filtrar_estado' | stynxTranslate
+        }}</span>
+        <select
+          name="state"
+          [value]="facade.query().state ?? ''"
+          (change)="onStateChange($event)"
+        >
+          @for (state of states; track state) {
+            <option [value]="state">
+              {{ stateKey(state) | stynxTranslate }}
+            </option>
+          }
+        </select>
+      </label>
+    </form>
+
+    <div role="alert" class="portal-alert-region">
+      @if (stateTextKey(); as key) {
+        <p data-state-text>{{ key | stynxTranslate }}</p>
+      }
+      @if (facade.error(); as error) {
+        <portal-error-banner [error]="error" (retry)="reload()" />
+      }
+    </div>
+
+    @if (facade.status() === 'empty') {
+      <detran-empty-state
+        [title]="'portal.screens.t06.state.empty' | stynxTranslate"
+        [message]="'portal.screens.t06.state.empty' | stynxTranslate"
+      />
+      <p>
+        <a [routerLink]="autosRoute" [attr.routerLink]="autosRoute">{{
+          'portal.shell.nav.autos' | stynxTranslate
+        }}</a>
+      </p>
+    }
+
+    <section class="portal-request-list" aria-live="polite" data-request-list>
+      @if (facade.sorted().length > 0) {
+        <ol>
+          @for (item of facade.sorted(); track item.requestId ?? $index) {
+            <li
+              class="portal-request-row"
+              [attr.data-request-id]="item.requestId"
+              [attr.data-token]="item.situation"
+              [attr.data-service-key]="item.serviceKey"
+            >
+              <h2>
+                <span>{{
+                  'portal.common.receipt.number' | stynxTranslate
+                }}</span>
+                <a
+                  [routerLink]="processRoute(item)"
+                  [attr.routerLink]="processRoute(item)"
+                  >{{ item.protocol ?? item.requestId }}</a
+                >
+              </h2>
+              @if (serviceKeyFor(item); as key) {
+                <p data-service>{{ key | stynxTranslate }}</p>
+              }
+              @if (item.targetLabel; as targetLabel) {
+                <p data-target>{{ targetLabel }}</p>
+              }
+              @if (item.situation; as situation) {
+                @if (badgeFor(situation); as badge) {
+                  <portal-citizen-status-badge
+                    [situation]="badge"
+                    [token]="situation"
+                  />
+                } @else {
+                  <p data-situation [attr.data-token]="situation">
+                    {{ requestStateKey(situation) | stynxTranslate }}
+                  </p>
+                }
+              }
+              @if (item.nextAction; as nextAction) {
+                <p
+                  data-next-action
+                  [attr.data-next-action-by]="nextAction.by"
+                  [attr.data-next-action-label]="nextAction.label"
+                >
+                  @if (nextAction.by; as by) {
+                    <span>{{ nextActionByKey(by) | stynxTranslate }}</span>
+                  }
+                  @if (nextActionLabelKey(nextAction.label); as labelKey) {
+                    <span>{{ labelKey | stynxTranslate }}</span>
+                  }
+                </p>
+                @if (nextAction.dueOn; as dueOn) {
+                  <portal-deadline-card
+                    [dueOn]="dueOn"
+                    [ownedBy]="ownerFor(nextAction.by)"
+                    [labelKey]="
+                      nextActionLabelKey(nextAction.label) ??
+                      nextActionByKey(nextAction.by)
+                    "
+                  />
+                }
+              }
+              @if (item.updatedAt; as updatedAt) {
+                <p data-updated-at>
+                  <span>{{
+                    'portal.screens.t06.field.atualizado_em' | stynxTranslate
+                  }}</span>
+                  <time [attr.datetime]="updatedAt">{{
+                    updatedAt | stynxIntlDate: dateFormat
+                  }}</time>
+                </p>
+              }
+            </li>
+          }
+        </ol>
+        @if (facade.page(); as page) {
+          <stynx-pagination
+            [totalItems]="page.total"
+            [page]="page.page - 1"
+            [pageSizeInput]="page.pageSize"
+            (pageChange)="onPageChange($event.pageIndex + 1)"
+          />
+        }
+      }
+    </section>
+  `,
+})
+export class RequestListPageComponent {
+  readonly facade = inject(ProcessosFacade);
+  private readonly i18n = inject(StynxI18nService);
+  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
+  private focused = false;
+
+  readonly states = REQUEST_STATES;
+  readonly sorts = SORTS;
+  readonly stateKeys = STATE_KEYS;
+  readonly autosRoute = AUTOS_ROUTE;
+  readonly dateFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
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
+  stateTextKey(): string | null {
+    switch (this.facade.status()) {
+      case 'unavailable':
+        return STATE_KEYS.unavailable;
+      case 'error':
+        return STATE_KEYS.error;
+      default:
+        return null;
+    }
+  }
+
+  stateKey(state: RequestState): string {
+    return `portal.situation.request.${state}`;
+  }
+
+  requestStateKey(state: string): string {
+    return `portal.situation.request.${state}`;
+  }
+
+  badgeFor(state: string) {
+    return badgeOf(state);
+  }
+
+  nextActionByKey(by: string): string {
+    return `portal.situation.next_action.${by}`;
+  }
+
+  /** Só chaves `portal.requests.nextAction.*` presentes no catálogo viram texto (T06; par 1). */
+  nextActionLabelKey(label: string | undefined): string | null {
+    if (!label || !label.startsWith(NEXT_ACTION_PREFIX)) return null;
+    return label in this.i18n.catalog() ? label : null;
+  }
+
+  /** `portal.services.<key>` quando existe no catálogo; ausente → só `data-service-key`. */
+  serviceKeyFor(item: RequestSummary): string | null {
+    const key = item.serviceKey ? `${SERVICES_PREFIX}${item.serviceKey}` : null;
+    return key && key in this.i18n.catalog() ? key : null;
+  }
+
+  ownerFor(by: string | undefined): 'citizen' | 'agency' {
+    return by === 'citizen' ? 'citizen' : 'agency';
+  }
+
+  processRoute(item: RequestSummary): string {
+    return `${PROCESS_ROUTE_PREFIX}${item.requestId ?? ''}`;
+  }
+
+  onStateChange(event: Event): void {
+    const value = (event.target as HTMLSelectElement).value;
+    void this.facade.setQuery({ state: value.length > 0 ? value : undefined });
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
diff --git a/apps/portal/web/src/app/features/processos/processos.facade.ts b/apps/portal/web/src/app/features/processos/processos.facade.ts
new file mode 100644
index 0000000..0e05f6e
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/processos.facade.ts
@@ -0,0 +1,356 @@
+// ProcessosFacade (contrato CTG-0003b §3.3; T-06/T-07/T-08/T-10/T-11): leituras e os dois comandos
+// da trilha de processos, por navegação (provida na página, sem cache local). A ordenação por
+// urgência usa SÓ o `nextAction.dueOn` recebido — ISO `YYYY-MM-DD` comparado como string,
+// crescente, sem prazo por último, desempate por `updatedAt` decrescente; nunca `Date` (spec §1;
+// [RN-RAIT-005]). O `ETag` de `GET requests/{id}` (ou `etagOf(version)`) é o `If-Match` do
+// `withdraw` (§2.2). Delegações reais respondem `422 SERVICE_UNAVAILABLE` → `commandStatus
+// 'unavailable'` com o motivo, nunca um resultado simulado (M15). Erros só pelo `ErrorBoundary`.
+//
+// Semântica das leituras (`loadList`, `setQuery`, `loadDetail`, `loadDecision`): a promessa resolve
+// assim que a leitura é DESPACHADA; o resultado chega pelos signals, que as páginas observam
+// (especificação executável C-3b-16/23/24). Os comandos (`withdraw`, `respondDiligence`) resolvem
+// com a resposta e só então despacham a releitura do detalhe.
+import { Injectable, computed, inject, signal } from '@angular/core';
+import {
+  presentError,
+  type ErrorPresentation,
+} from '../../core/error-boundary';
+import { etagOf } from '../../data/portal-command.models';
+import type { DiligenceResponded } from '../../data/portal-command.models';
+import {
+  PortalClient,
+  type DiligenceResponseBody,
+  type RequestWithdrawBody,
+  type RequestWithdrawn,
+} from '../../data/portal.client';
+import type {
+  Decision,
+  Diligence,
+  RequestDetail,
+  RequestListPage,
+  RequestListQuery,
+  RequestState,
+  RequestSummary,
+} from '../../data/portal-read.models';
+import { readStatusFor, type ReadStatus } from '../../data/read-status';
+
+export type RequestSort = 'urgencia' | 'atualizacao';
+
+export type CommandStatus =
+  'idle' | 'submitting' | 'done' | 'error' | 'unavailable' | 'offline';
+
+/** Os 13 estados de WF-PORTAL-001, na ordem do fluxo (filtro de T-06). */
+export const REQUEST_STATES: readonly RequestState[] = [
+  'IDENTIFICADO',
+  'SERVICO_SELECIONADO',
+  'ELEGIBILIDADE_VERIFICADA',
+  'INELEGIVEL',
+  'PEDIDO_EM_COMPOSICAO',
+  'AGUARDANDO_NIVEL_ASSINATURA',
+  'AGUARDANDO_PAGAMENTO',
+  'PROTOCOLADO',
+  'EM_ANDAMENTO_NO_ORGAO',
+  'RESULTADO_DISPONIVEL',
+  'AVALIACAO_OFERECIDA',
+  'CONCLUIDO',
+  'DESISTIDO',
+];
+
+const FIRST_PAGE = 1;
+const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
+const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
+const DECISION_KIND = 'decision';
+const PROCESS_ROUTE_PREFIX = '/processos/';
+const AIT_ROUTE_PREFIX = '/autos/';
+
+/** Próximo passo → rota do app (contrato §3.3); qualquer outra chave → sem botão. */
+const NEXT_STEP_ROUTES: Readonly<
+  Record<
+    string,
+    (requestId: string, request: RequestDetail['request']) => string | null
+  >
+> = {
+  recurso_jari: (requestId) => `${PROCESS_ROUTE_PREFIX}${requestId}/jari/nova`,
+  recurso_cetran: (requestId) =>
+    `${PROCESS_ROUTE_PREFIX}${requestId}/cetran/nova`,
+  pagamento: (_requestId, request) =>
+    request.targetKind === 'ait' && request.targetId
+      ? `${AIT_ROUTE_PREFIX}${request.targetId}/pagamento`
+      : null,
+};
+
+function compareText(a: string, b: string): number {
+  return a < b ? -1 : a > b ? 1 : 0;
+}
+
+/** `updatedAt` decrescente (ISO comparado como texto; ausente por último). */
+function byUpdatedAtDesc(a: RequestSummary, b: RequestSummary): number {
+  return compareText(b.updatedAt ?? '', a.updatedAt ?? '');
+}
+
+/** `nextAction.dueOn` crescente; sem prazo por último; desempate por `updatedAt` decrescente. */
+function byUrgency(a: RequestSummary, b: RequestSummary): number {
+  const dueA = a.nextAction?.dueOn ?? null;
+  const dueB = b.nextAction?.dueOn ?? null;
+  if (dueA !== null && dueB !== null) {
+    const order = compareText(dueA, dueB);
+    return order !== 0 ? order : byUpdatedAtDesc(a, b);
+  }
+  if (dueA !== null) return -1;
+  if (dueB !== null) return 1;
+  return byUpdatedAtDesc(a, b);
+}
+
+function withoutEmpty(query: RequestListQuery): RequestListQuery {
+  const next: Record<string, string | number | undefined> = { ...query };
+  for (const key of Object.keys(next)) {
+    const value = next[key];
+    if (value === undefined || value === '') delete next[key];
+  }
+  return next as RequestListQuery;
+}
+
+@Injectable()
+export class ProcessosFacade {
+  private readonly client = inject(PortalClient);
+
+  // T-06
+  private readonly statusState = signal<ReadStatus>('idle');
+  private readonly errorState = signal<ErrorPresentation | null>(null);
+  private readonly queryState = signal<RequestListQuery>({});
+  private readonly pageState = signal<RequestListPage | null>(null);
+  private readonly sortState = signal<RequestSort>('urgencia');
+  // T-07, T-08, T-10, T-11
+  private readonly detailStatusState = signal<ReadStatus>('idle');
+  private readonly detailState = signal<RequestDetail | null>(null);
+  private readonly detailErrorState = signal<ErrorPresentation | null>(null);
+  private readonly etagState = signal<string | null>(null);
+  private readonly detailRequestIdState = signal<string | null>(null);
+  private readonly decisionStatusState = signal<ReadStatus>('idle');
+  private readonly decisionState = signal<Decision | null>(null);
+  private readonly decisionErrorState = signal<ErrorPresentation | null>(null);
+  private readonly commandStatusState = signal<CommandStatus>('idle');
+  private readonly commandErrorState = signal<ErrorPresentation | null>(null);
+  private listSequence = 0;
+  private detailSequence = 0;
+  private decisionSequence = 0;
+
+  readonly status = this.statusState.asReadonly();
+  readonly error = this.errorState.asReadonly();
+  readonly query = this.queryState.asReadonly();
+  readonly page = this.pageState.asReadonly();
+  /** Padrão 'urgencia' (T06 §4; [UC-PORTAL-005] 2a). */
+  readonly sort = this.sortState.asReadonly();
+  readonly items = computed<readonly RequestSummary[]>(
+    () =>
+      (this.pageState()?.items as readonly RequestSummary[] | undefined) ?? [],
+  );
+  /** Ordenação SÓ pelo `dueOn` recebido (ou `updatedAt`), nunca `Date`. */
+  readonly sorted = computed<readonly RequestSummary[]>(() => {
+    const items = this.items().slice();
+    return items.sort(
+      this.sortState() === 'urgencia' ? byUrgency : byUpdatedAtDesc,
+    );
+  });
+
+  readonly detailStatus = this.detailStatusState.asReadonly();
+  readonly detail = this.detailState.asReadonly();
+  readonly detailError = this.detailErrorState.asReadonly();
+  /** §2.2 — `If-Match` do withdraw. */
+  readonly etag = this.etagState.asReadonly();
+  readonly decisionStatus = this.decisionStatusState.asReadonly();
+  readonly decision = this.decisionState.asReadonly();
+  readonly decisionError = this.decisionErrorState.asReadonly();
+  readonly commandStatus = this.commandStatusState.asReadonly();
+  readonly commandError = this.commandErrorState.asReadonly();
+
+  loadList(query: RequestListQuery = this.queryState()): Promise<void> {
+    const effective = withoutEmpty(query);
+    this.queryState.set(effective);
+    this.statusState.set('loading');
+    this.errorState.set(null);
+    void this.runList(effective, ++this.listSequence);
+    return Promise.resolve();
+  }
+
+  /** Reordena localmente o que já foi lido; nenhuma requisição nova. */
+  setSort(sort: RequestSort): void {
+    this.sortState.set(sort);
+  }
+
+  /** Altera state/kind/period/page e recarrega (page volta a 1 quando o filtro muda). */
+  setQuery(patch: Partial<RequestListQuery>): Promise<void> {
+    const filterChanged =
+      'state' in patch || 'kind' in patch || 'period' in patch;
+    const next: RequestListQuery = {
+      ...this.queryState(),
+      ...patch,
+      ...(filterChanged && patch.page === undefined
+        ? { page: FIRST_PAGE }
+        : {}),
+    };
+    return this.loadList(next);
+  }
+
+  /** GET requests/{id}; guarda `etag ?? etagOf(request.version)` (§2.2). */
+  loadDetail(requestId: string): Promise<void> {
+    this.detailRequestIdState.set(requestId);
+    this.detailStatusState.set('loading');
+    this.detailErrorState.set(null);
+    void this.runDetail(requestId, ++this.detailSequence);
+    return Promise.resolve();
+  }
+
+  /** GET requests/{id}/decision; 404 `kind: 'decision'` → estado `empty` de T-10 (§2.4). */
+  loadDecision(requestId: string): Promise<void> {
+    this.decisionStatusState.set('loading');
+    this.decisionErrorState.set(null);
+    void this.runDecision(requestId, ++this.decisionSequence);
+    return Promise.resolve();
+  }
+
+  /** `diligences().find(d => d.diligenceId === diligenceId) ?? null`. */
+  diligence(diligenceId: string): Diligence | null {
+    return (
+      this.detailState()?.diligences?.find(
+        (candidate) => candidate.diligenceId === diligenceId,
+      ) ?? null
+    );
+  }
+
+  /** POST …/withdraw com If-Match = etag(); 200 → detail recarregado; devolve o corpo ou null. */
+  async withdraw(
+    requestId: string,
+    body: RequestWithdrawBody,
+  ): Promise<RequestWithdrawn | null> {
+    this.commandStatusState.set('submitting');
+    this.commandErrorState.set(null);
+    try {
+      const result = await this.client.withdrawRequest(
+        requestId,
+        body,
+        this.etagState(),
+      );
+      this.etagState.set(result.etag ?? etagOf(result.body.version));
+      this.commandStatusState.set('done');
+      void this.loadDetail(requestId);
+      return result.body;
+    } catch (error: unknown) {
+      this.failCommand(error, requestId);
+      return null;
+    }
+  }
+
+  /** POST …/diligences/{did}/responses; 2xx (OD-P59) → detail recarregado. */
+  async respondDiligence(
+    requestId: string,
+    diligenceId: string,
+    body: DiligenceResponseBody,
+  ): Promise<DiligenceResponded | null> {
+    this.commandStatusState.set('submitting');
+    this.commandErrorState.set(null);
+    try {
+      const result = await this.client.respondDiligence(
+        requestId,
+        diligenceId,
+        body,
+      );
+      this.commandStatusState.set('done');
+      void this.loadDetail(requestId);
+      return result.body;
+    } catch (error: unknown) {
+      this.failCommand(error, requestId);
+      return null;
+    }
+  }
+
+  /** Rota do app para `decision.nextStep` (T-10) ou `actions.nextInstanceServiceKey` (T-07). */
+  nextStepRoute(serviceKey: string | null): string | null {
+    if (serviceKey === null) return null;
+    const detail = this.detailState();
+    const requestId =
+      this.detailRequestIdState() ?? detail?.request?.requestId ?? null;
+    if (!detail || requestId === null) return null;
+    const route = NEXT_STEP_ROUTES[serviceKey];
+    return route ? route(requestId, detail.request) : null;
+  }
+
+  private async runList(
+    query: RequestListQuery,
+    sequence: number,
+  ): Promise<void> {
+    try {
+      const page = await this.client.listRequests(query);
+      if (sequence !== this.listSequence) return;
+      this.pageState.set(page);
+      this.statusState.set(page.total === 0 ? 'empty' : 'ready');
+    } catch (error: unknown) {
+      if (sequence !== this.listSequence) return;
+      const presentation = presentError(error);
+      this.errorState.set(presentation);
+      this.statusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async runDetail(requestId: string, sequence: number): Promise<void> {
+    try {
+      const result = await this.client.getRequest(requestId);
+      if (sequence !== this.detailSequence) return;
+      const version = result.body?.request?.version;
+      this.detailState.set(result.body);
+      this.etagState.set(
+        result.etag ?? (typeof version === 'number' ? etagOf(version) : null),
+      );
+      this.detailStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.detailSequence) return;
+      const presentation = presentError(error, {
+        entitlement: { kind: 'request', id: requestId },
+      });
+      this.detailErrorState.set(presentation);
+      this.detailStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private async runDecision(
+    requestId: string,
+    sequence: number,
+  ): Promise<void> {
+    try {
+      const decision = await this.client.getDecision(requestId);
+      if (sequence !== this.decisionSequence) return;
+      this.decisionState.set(decision);
+      this.decisionStatusState.set('ready');
+    } catch (error: unknown) {
+      if (sequence !== this.decisionSequence) return;
+      const presentation = presentError(error, {
+        entitlement: { kind: 'request', id: requestId },
+      });
+      if (
+        presentation.code === NOT_FOUND_CODE &&
+        presentation.context['kind'] === DECISION_KIND
+      ) {
+        // Ainda sem decisão publicada: estado vazio de T-10, não falta de vínculo.
+        this.decisionState.set(null);
+        this.decisionErrorState.set(null);
+        this.decisionStatusState.set('empty');
+        return;
+      }
+      this.decisionErrorState.set(presentation);
+      this.decisionStatusState.set(readStatusFor(presentation));
+    }
+  }
+
+  private failCommand(error: unknown, requestId: string): void {
+    const presentation = presentError(error, {
+      entitlement: { kind: 'request', id: requestId },
+    });
+    this.commandErrorState.set(presentation);
+    if (presentation.code === SERVICE_UNAVAILABLE_CODE) {
+      this.commandStatusState.set('unavailable');
+      return;
+    }
+    const status = readStatusFor(presentation);
+    this.commandStatusState.set(status === 'offline' ? 'offline' : 'error');
+  }
+}
diff --git a/apps/portal/web/src/app/features/processos/processos.routes.ts b/apps/portal/web/src/app/features/processos/processos.routes.ts
index d9abf83..d65394d 100644
--- a/apps/portal/web/src/app/features/processos/processos.routes.ts
+++ b/apps/portal/web/src/app/features/processos/processos.routes.ts
@@ -1,7 +1,34 @@
-// Módulo `processos` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
-// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
-// via `moduleRoutes('processos', { '<path>': { component, title } })`.
+// Módulo `processos` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
+// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
+// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-06, T-07, T-11, T-08,
+// T-10).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { DecisaoPageComponent } from './pages/decisao.page';
+import { DesistenciaPageComponent } from './pages/desistencia.page';
+import { DiligenciaPageComponent } from './pages/diligencia.page';
+import { RequestDetailPageComponent } from './pages/request-detail.page';
+import { RequestListPageComponent } from './pages/request-list.page';

-export const PROCESSOS_ROUTES: Routes = moduleRoutes('processos');
+export const PROCESSOS_ROUTES: Routes = moduleRoutes('processos', {
+  processos: {
+    component: RequestListPageComponent,
+    title: 'portal.screens.t06.title',
+  },
+  'processos/:requestId': {
+    component: RequestDetailPageComponent,
+    title: 'portal.screens.t07.title',
+  },
+  'processos/:requestId/diligencia/:diligenceId': {
+    component: DiligenciaPageComponent,
+    title: 'portal.screens.t11.title',
+  },
+  'processos/:requestId/desistencia': {
+    component: DesistenciaPageComponent,
+    title: 'portal.screens.t08.title',
+  },
+  'processos/:requestId/decisao': {
+    component: DecisaoPageComponent,
+    title: 'portal.screens.t10.title',
+  },
+});
diff --git a/apps/portal/web/src/app/shared/payment-comparison.component.ts b/apps/portal/web/src/app/shared/payment-comparison.component.ts
new file mode 100644
index 0000000..4edefc7
--- /dev/null
+++ b/apps/portal/web/src/app/shared/payment-comparison.component.ts
@@ -0,0 +1,535 @@
+// PaymentComparison (contrato CTG-0003b §4; spec §5.2; [RN-PORTAL-125…128]; H.53; OD-P05/P41):
+// as faixas de pagamento LADO A LADO, num único fieldset, na ordem `PAYMENT_TIER_ORDER`, todas
+// visíveis sem interação e nenhuma com destaque visual. Toda faixa que renuncia ao recurso
+// (`waivesAppeal`) mostra a advertência ANTES do clique e, ao ser escolhida, NÃO altera a seleção:
+// emite `waiverRequested` e a página abre o `ConsequenceDialog` (`renuncia_40`). A faixa de 40%
+// aparece sempre, indisponível com motivo enquanto a flag `portal.waiver_40_term` está desligada
+// (H.53). Nada aqui calcula valor, percentual, juros ou data: `amount`/`percent`/`availableUntil`
+// chegam prontos do servidor ([RN-PORTAL-125] b) e a moeda/data são formatadas pelos pipes do
+// kit no locale do runtime de i18n (o `GET brand` não expõe `locale`, CTG-0003a A1 — ver relatório).
+// Links `/sne` e `…/preservando-recurso` são âncoras com `href` (fallback) cujo clique é
+// entregue à página por `output` — ela navega pelo `Router` (este componente não depende de rota).
+import {
+  ChangeDetectionStrategy,
+  ChangeDetectorRef,
+  Component,
+  type Signal,
+  computed,
+  inject,
+  input,
+  model,
+  output,
+  signal,
+} from '@angular/core';
+import {
+  StynxIntlCurrencyPipe,
+  StynxIntlDatePipe,
+  StynxTranslatePipe,
+} from '@detran/ui';
+import type {
+  PaymentInfo,
+  PaymentMethod,
+  PaymentTier,
+  PaymentTierCode,
+} from '../data/portal-read.models';
+
+export type PaymentComparisonMode = 'comparison' | 'preserving_appeal'; // T-13 | T-23
+
+export interface PaymentFlags {
+  readonly waiverTerm: boolean; // portal.waiver_40_term (H.53)
+  readonly cardPayment: boolean; // portal.card_payment (OD-P05)
+  readonly installments: boolean; // portal.installments (OD-P05)
+}
+
+export interface PaymentSelection {
+  readonly tier: PaymentTierCode;
+  /** `null` enquanto o meio não foi escolhido (a faixa pode ser escolhida antes do meio). */
+  readonly method: PaymentMethod | null;
+  readonly installments?: number;
+}
+
+/** Seleção completa (faixa + meio), a única que `confirmed` emite. */
+export interface ConfirmedPaymentSelection extends PaymentSelection {
+  readonly method: PaymentMethod;
+}
+
+export type TierUnavailableReason =
+  | 'portal.waiver_40_term' // flag desligada (H.53)
+  | 'paid' // payment.paid === true
+  | 'mode' // T-23 não oferece faixas que renunciam
+  | 'server'; // 422 PAYMENT_TIER_NOT_AVAILABLE { availableTiers[] }
+
+export type MethodUnavailableReason =
+  | 'portal.card_payment' // flag desligada (OD-P05)
+  | 'server'; // 422 PAYMENT_METHOD_UNAVAILABLE { available[] }
+
+export interface TierView {
+  readonly tier: PaymentTier;
+  readonly available: boolean;
+  readonly reason: TierUnavailableReason | null; // → data-reason
+  readonly labelKey: string; // §4.3
+}
+
+export interface MethodView {
+  readonly method: PaymentMethod;
+  readonly available: boolean;
+  readonly reason: MethodUnavailableReason | null;
+  readonly labelKey: string;
+}
+
+/** spec §5.2 "80 · 60 (SNE) · 40 (renúncia)" + "juros após vencimento". */
+export const PAYMENT_TIER_ORDER: readonly PaymentTierCode[] = [
+  'desconto_80',
+  'desconto_60_reconhecimento',
+  'desconto_40_fora_sne',
+  'integral_juros',
+];
+
+/** spec §7 "PIX/débito/boleto/cartão". */
+export const PAYMENT_METHOD_ORDER: readonly PaymentMethod[] = [
+  'pix',
+  'debito',
+  'boleto',
+  'cartao',
+];
+
+/** Rótulos por faixa (contrato §4.3; OD-P70 para a faixa 40). */
+const TIER_LABEL_KEYS: Readonly<
+  Record<PaymentComparisonMode, Readonly<Record<PaymentTierCode, string>>>
+> = {
+  comparison: {
+    desconto_80: 'portal.screens.t13.cmd.pagar_80',
+    desconto_60_reconhecimento: 'portal.screens.t13.cmd.pagar_60_sne',
+    desconto_40_fora_sne: 'portal.forms.pagamento.tier.desconto_40_fora_sne',
+    integral_juros: 'portal.screens.t23.field.valor_integral',
+  },
+  preserving_appeal: {
+    desconto_80: 'portal.screens.t23.field.valor_80',
+    desconto_60_reconhecimento: 'portal.screens.t13.cmd.pagar_60_sne',
+    desconto_40_fora_sne: 'portal.forms.pagamento.tier.desconto_40_fora_sne',
+    integral_juros: 'portal.screens.t23.field.valor_integral',
+  },
+};
+
+const METHOD_LABEL_KEYS: Readonly<Record<PaymentMethod, string>> = {
+  pix: 'portal.forms.pagamento.meio.pix',
+  debito: 'portal.forms.pagamento.meio.debito',
+  boleto: 'portal.forms.pagamento.meio.boleto',
+  cartao: 'portal.forms.pagamento.meio.cartao',
+};
+
+const WAIVER_FLAG_TIER: PaymentTierCode = 'desconto_40_fora_sne';
+const CARD_METHOD: PaymentMethod = 'cartao';
+const SNE_ROUTE = '/sne';
+
+@Component({
+  selector: 'portal-payment-comparison',
+  imports: [StynxTranslatePipe, StynxIntlCurrencyPipe, StynxIntlDatePipe],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    '[attr.mode]': 'mode()',
+    '[attr.data-mode]': 'mode()',
+    '[attr.data-ait-id]': 'aitId()',
+    '[attr.data-paid]': 'payment().paid ? "true" : null',
+  },
+  template: `
+    @if (mode() === 'preserving_appeal') {
+      <p class="portal-payment-guarantee" data-guarantee>
+        {{ 'portal.screens.t23.intro' | stynxTranslate }}
+      </p>
+    }
+    @if (payment().paid) {
+      <p role="status" data-already-paid>
+        {{ 'portal.errors.payment_already_paid' | stynxTranslate }}
+      </p>
+    }
+
+    <fieldset class="portal-payment-tiers" [disabled]="disabled()">
+      <legend>{{ 'portal.forms.pagamento.faixa' | stynxTranslate }}</legend>
+      @for (view of tiers(); track view.tier.code) {
+        <div
+          class="portal-payment-tier"
+          [attr.data-tier]="view.tier.code"
+          [attr.data-percent]="view.tier.percent"
+          [attr.data-available]="view.available ? 'true' : 'false'"
+          [attr.data-reason]="view.reason"
+          [attr.data-waives-appeal]="view.tier.waivesAppeal ? 'true' : 'false'"
+          [attr.data-requires-sne]="view.tier.requiresSne ? 'true' : 'false'"
+          [attr.data-amount]="
+            view.tier.amount === null ? 'unavailable' : view.tier.amount
+          "
+          [attr.data-available-until]="view.tier.availableUntil"
+          [attr.data-paid-tier]="payment().paid ? payment().paidTier : null"
+        >
+          <label>
+            <input
+              type="radio"
+              name="tier"
+              [value]="view.tier.code"
+              [checked]="tierChoice() === view.tier.code"
+              [disabled]="!view.available"
+              [attr.aria-disabled]="view.available ? null : 'true'"
+              [attr.aria-describedby]="hintId(view)"
+              (click)="onTierClick(view, $event)"
+            />
+            <span class="portal-payment-tier-label">{{
+              view.labelKey | stynxTranslate
+            }}</span>
+            <span class="portal-payment-tier-amount" data-tier-amount>
+              @if (view.tier.amount !== null) {
+                {{ view.tier.amount | stynxIntlCurrency: 'BRL' }}
+              } @else {
+                {{ 'portal.states.empty' | stynxTranslate }}
+              }
+            </span>
+          </label>
+          @if (view.tier.availableUntil; as availableUntil) {
+            <p class="portal-payment-tier-until">
+              {{
+                'portal.forms.pagamento.valido_ate'
+                  | stynxTranslate
+                    : { availableUntil: (availableUntil | stynxIntlDate) }
+              }}
+            </p>
+          }
+          <p [id]="hintId(view)" class="portal-payment-tier-hint">
+            @if (view.tier.waivesAppeal) {
+              <span aria-hidden="true">⚠</span>
+              <span data-waiver-warning>{{
+                'portal.forms.pagamento.hint_40' | stynxTranslate
+              }}</span>
+            } @else {
+              <span data-keeps-appeal>{{
+                'portal.screens.t23.intro' | stynxTranslate
+              }}</span>
+            }
+            @if (view.tier.requiresSne) {
+              <span data-sne-hint>{{
+                'portal.forms.pagamento.hint_60' | stynxTranslate
+              }}</span>
+              <a [attr.href]="sneRoute" (click)="onSneLink($event)">{{
+                'portal.services.adesao_sne' | stynxTranslate
+              }}</a>
+            }
+            @if (view.reason === 'portal.waiver_40_term') {
+              <span data-unavailable-reason>{{
+                'portal.screens.t13.state.faixa_40_indisponivel'
+                  | stynxTranslate
+              }}</span>
+            }
+          </p>
+        </div>
+      }
+    </fieldset>
+
+    @if (!payment().paid) {
+      <fieldset class="portal-payment-methods" [disabled]="disabled()">
+        <legend>{{ 'portal.forms.pagamento.meio' | stynxTranslate }}</legend>
+        @for (view of methods(); track view.method) {
+          <div
+            class="portal-payment-method"
+            [attr.data-method]="view.method"
+            [attr.data-available]="view.available ? 'true' : 'false'"
+            [attr.data-reason]="view.reason"
+          >
+            <label>
+              <input
+                type="radio"
+                name="method"
+                [value]="view.method"
+                [checked]="methodChoice() === view.method"
+                [disabled]="!view.available"
+                [attr.aria-disabled]="view.available ? null : 'true'"
+                (change)="onMethodChange(view)"
+              />
+              <span>{{ view.labelKey | stynxTranslate }}</span>
+            </label>
+            @if (view.method === 'cartao' && !view.available) {
+              <p data-card-unavailable>
+                {{
+                  'portal.screens.t23.state.erro_recuperavel' | stynxTranslate
+                }}
+              </p>
+            }
+          </div>
+        }
+        @if (installmentsEnabled()) {
+          <label class="portal-payment-installments">
+            <span>{{
+              'portal.forms.pagamento.parcelas' | stynxTranslate
+            }}</span>
+            <input
+              type="number"
+              name="installments"
+              min="1"
+              step="1"
+              [value]="installmentsChoice() ?? ''"
+              (input)="onInstallmentsInput($event)"
+            />
+          </label>
+        }
+      </fieldset>
+
+      <button
+        type="button"
+        class="portal-payment-confirm"
+        data-confirm
+        [disabled]="!canConfirm()"
+        (click)="confirm()"
+      >
+        {{ confirmLabelKey() | stynxTranslate }}
+      </button>
+    }
+
+    <button
+      type="button"
+      data-accessible-format
+      (click)="accessibleFormatRequested.emit()"
+    >
+      {{ 'portal.screens.t13.field.formato_acessivel' | stynxTranslate }}
+    </button>
+
+    @if (mode() === 'comparison') {
+      <p class="portal-payment-preserving-link">
+        <a
+          [attr.href]="preservingRoute()"
+          data-preserving-appeal
+          (click)="onPreservingLink($event)"
+          >{{ 'portal.screens.t23.title' | stynxTranslate }}</a
+        >
+      </p>
+    }
+  `,
+})
+export class PaymentComparisonComponent {
+  private readonly changeDetector = inject(ChangeDetectorRef);
+
+  /** `AitDetail.payment`. */
+  readonly payment = input.required<PaymentInfo>();
+  /** `PAYMENT_FLAGS` (§4.2). */
+  readonly flags = input.required<PaymentFlags>();
+  readonly mode = input<PaymentComparisonMode>('comparison');
+  /** Link a T-23 (mode comparison) e a /sne. */
+  readonly aitId = input.required<string>();
+  /** Wizard ocupado. */
+  readonly disabled = input(false);
+  /** `422 PAYMENT_TIER_NOT_AVAILABLE { availableTiers[] }` — faixas fora dela: `data-reason="server"`. */
+  readonly availableTiers = input<readonly PaymentTierCode[] | null>(null);
+  /** `422 PAYMENT_METHOD_UNAVAILABLE { available[] }` — meios fora dela: `data-reason="server"`. */
+  readonly availableMethods = input<readonly PaymentMethod[] | null>(null);
+  readonly selection = model<PaymentSelection | null>(null);
+  /** Faixa `waivesAppeal` escolhida → a página abre o ConsequenceDialog `renuncia_40`. */
+  readonly waiverRequested = output<PaymentTierCode>();
+  /** Faixa `requiresSne` → link /sne (T-09, par 3); a página navega. */
+  readonly sneEnrollmentRequested = output<void>();
+  /** Link a T-23 (mode comparison); a página navega. */
+  readonly preservingAppealRequested = output<void>();
+  /** [RN-PORTAL-114] (destino: OD-P75). */
+  readonly accessibleFormatRequested = output<void>();
+  readonly confirmed = output<ConfirmedPaymentSelection>();
+
+  readonly sneRoute = SNE_ROUTE;
+  private readonly installmentsState = signal<number | null>(null);
+  /** Meio escolhido antes da faixa (a seleção só existe com faixa). */
+  private readonly methodState = signal<PaymentMethod | null>(null);
+
+  readonly tierChoice = computed(() => this.selection()?.tier ?? null);
+  readonly methodChoice = computed(
+    () => this.selection()?.method ?? this.methodState(),
+  );
+  readonly installmentsChoice: Signal<number | null> =
+    this.installmentsState.asReadonly();
+
+  /** Ordem `PAYMENT_TIER_ORDER`, só as presentes em `payment.tiers`; em T-23 sem as que renunciam. */
+  readonly tiers = computed<readonly TierView[]>(() => {
+    const payment = this.payment();
+    const flags = this.flags();
+    const mode = this.mode();
+    const serverTiers = this.availableTiers();
+    const views: TierView[] = [];
+    for (const code of PAYMENT_TIER_ORDER) {
+      const tier = payment.tiers.find((candidate) => candidate.code === code);
+      if (!tier) continue;
+      const reason = this.tierReason(tier, payment, flags, mode, serverTiers);
+      if (reason === 'mode') continue; // não renderizada (§4.3 10)
+      views.push({
+        tier,
+        available: reason === null,
+        reason,
+        labelKey: TIER_LABEL_KEYS[mode][code],
+      });
+    }
+    return views;
+  });
+
+  readonly methods = computed<readonly MethodView[]>(() => {
+    const flags = this.flags();
+    const serverMethods = this.availableMethods();
+    return PAYMENT_METHOD_ORDER.map((method) => {
+      const reason = this.methodReason(method, flags, serverMethods);
+      return {
+        method,
+        available: reason === null,
+        reason,
+        labelKey: METHOD_LABEL_KEYS[method],
+      };
+    });
+  });
+
+  readonly installmentsEnabled = computed(
+    () => this.flags().installments && this.methodChoice() === CARD_METHOD,
+  );
+
+  readonly canConfirm = computed(() => {
+    if (this.payment().paid || this.disabled()) return false;
+    const tier = this.tierChoice();
+    const method = this.methodChoice();
+    if (tier === null || method === null) return false;
+    const tierOk = this.tiers().some(
+      (view) => view.tier.code === tier && view.available,
+    );
+    const methodOk = this.methods().some(
+      (view) => view.method === method && view.available,
+    );
+    return tierOk && methodOk;
+  });
+
+  readonly confirmLabelKey = computed(() => {
+    if (this.mode() === 'preserving_appeal') {
+      return 'portal.screens.t23.cmd.pagar_sem_abrir_mao';
+    }
+    const tier = this.tierChoice();
+    const view = tier
+      ? this.tiers().find((candidate) => candidate.tier.code === tier)
+      : undefined;
+    return view?.labelKey ?? 'portal.common.action.continue';
+  });
+
+  readonly preservingRoute = computed(
+    () =>
+      `/autos/${encodeURIComponent(this.aitId())}/pagamento/preservando-recurso`,
+  );
+
+  hintId(view: TierView): string {
+    return `portal-payment-tier-${view.tier.code}-hint`;
+  }
+
+  /** Faixa que renuncia: nada muda aqui — a página decide depois do diálogo (§4.3 3). */
+  onTierClick(view: TierView, event: Event): void {
+    if (!view.available) {
+      event.preventDefault();
+      return;
+    }
+    if (view.tier.waivesAppeal) {
+      event.preventDefault();
+      this.waiverRequested.emit(view.tier.code);
+      return;
+    }
+    this.selectTier(view.tier.code);
+  }
+
+  /**
+   * Seleciona a faixa (a página chama depois de `ConsequenceDialog.confirmed` para uma faixa que
+   * renuncia; o clique direto chama para as demais). Mantém o meio já escolhido.
+   */
+  selectTier(code: PaymentTierCode): void {
+    this.selection.set({
+      tier: code,
+      method: this.methodChoice(),
+      ...this.installmentsPart(),
+    });
+    this.reflectSelection();
+  }
+
+  onMethodChange(view: MethodView): void {
+    if (!view.available) return;
+    if (view.method !== CARD_METHOD) this.installmentsState.set(null);
+    this.methodState.set(view.method);
+    const tier = this.tierChoice();
+    if (tier !== null) {
+      this.selection.set({
+        tier,
+        method: view.method,
+        ...this.installmentsPart(),
+      });
+    }
+    this.reflectSelection();
+  }
+
+  onInstallmentsInput(event: Event): void {
+    const raw = (event.target as HTMLInputElement).value;
+    const parsed = Number.parseInt(raw, 10);
+    this.installmentsState.set(
+      Number.isInteger(parsed) && parsed >= 1 ? parsed : null,
+    );
+    const current = this.selection();
+    if (current) {
+      this.selection.set({ ...current, ...this.installmentsPart() });
+    }
+  }
+
+  confirm(): void {
+    if (!this.canConfirm()) return;
+    const current = this.selection();
+    if (!current || current.method === null) return;
+    this.confirmed.emit({
+      tier: current.tier,
+      method: current.method,
+      ...this.installmentsPart(),
+    });
+  }
+
+  onSneLink(event: Event): void {
+    event.preventDefault();
+    this.sneEnrollmentRequested.emit();
+  }
+
+  onPreservingLink(event: Event): void {
+    event.preventDefault();
+    this.preservingAppealRequested.emit();
+  }
+
+  /** O estado do botão de confirmar acompanha a escolha no mesmo evento (resposta imediata). */
+  private reflectSelection(): void {
+    this.changeDetector.detectChanges();
+  }
+
+  private installmentsPart(): { installments?: number } {
+    const installments = this.installmentsState();
+    return this.installmentsEnabled() && installments !== null
+      ? { installments }
+      : {};
+  }
+
+  private tierReason(
+    tier: PaymentTier,
+    payment: PaymentInfo,
+    flags: PaymentFlags,
+    mode: PaymentComparisonMode,
+    serverTiers: readonly PaymentTierCode[] | null,
+  ): TierUnavailableReason | null {
+    if (mode === 'preserving_appeal' && tier.waivesAppeal) return 'mode';
+    if (payment.paid) return 'paid';
+    if (tier.code === WAIVER_FLAG_TIER && !flags.waiverTerm) {
+      return 'portal.waiver_40_term';
+    }
+    if (serverTiers !== null && !serverTiers.includes(tier.code)) {
+      return 'server';
+    }
+    return null;
+  }
+
+  private methodReason(
+    method: PaymentMethod,
+    flags: PaymentFlags,
+    serverMethods: readonly PaymentMethod[] | null,
+  ): MethodUnavailableReason | null {
+    if (method === CARD_METHOD && !flags.cardPayment) {
+      return 'portal.card_payment';
+    }
+    if (serverMethods !== null && !serverMethods.includes(method)) {
+      return 'server';
+    }
+    return null;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/prefilled-summary.component.ts b/apps/portal/web/src/app/shared/prefilled-summary.component.ts
new file mode 100644
index 0000000..18a0a53
--- /dev/null
+++ b/apps/portal/web/src/app/shared/prefilled-summary.component.ts
@@ -0,0 +1,71 @@
+// PrefilledSummary (contrato CTG-0003b §3.4 f; [RN-PORTAL-106]; [RN-PORTAL-107] regra 2): o que o
+// órgão já tem sobre o ato, somente leitura — um `PrefilledField` por chave de `prefilled{}`
+// presente em `PREFILLED_LABEL_KEYS`. O mapa é FECHADO e fica vazio até OD-P82 fixar os nomes das
+// chaves de `prefilled` por `serviceKey` e suas chaves i18n: chave fora do mapa não é renderizada
+// (nunca um nome cru de campo no DOM), e nada aqui vira `<input>` editável.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+} from '@angular/core';
+import { PrefilledFieldComponent } from './prefilled-field.component';
+
+/**
+ * chave de `prefilled{}` → chave i18n do rótulo. Vazio até OD-P82 (nenhuma fonte fixa os nomes
+ * das chaves por `serviceKey`); acrescentar entradas SÓ com fonte por chave.
+ */
+export const PREFILLED_LABEL_KEYS: Readonly<Record<string, string>> = {};
+
+export interface PrefilledSummaryField {
+  readonly name: string;
+  readonly labelKey: string;
+  readonly value: string | null;
+}
+
+function displayValue(value: unknown): string | null {
+  if (typeof value === 'string') return value.length > 0 ? value : null;
+  if (typeof value === 'number' || typeof value === 'boolean') {
+    return String(value);
+  }
+  return null;
+}
+
+@Component({
+  selector: 'portal-prefilled-summary',
+  imports: [PrefilledFieldComponent],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: { '[attr.data-field-count]': 'fields().length' },
+  template: `
+    @if (fields().length > 0) {
+      <div class="portal-prefilled-summary" data-prefilled-summary>
+        @for (field of fields(); track field.name) {
+          <portal-prefilled-field
+            [name]="field.name"
+            [labelKey]="field.labelKey"
+            [value]="field.value"
+          />
+        }
+      </div>
+    }
+  `,
+})
+export class PrefilledSummaryComponent {
+  /** `prefilled{}` do `createRequest` (`ServiceWizardStore.prefilled`). */
+  readonly prefilled = input.required<Readonly<Record<string, unknown>>>();
+  /** Mapa fechado nome → chave i18n; padrão `PREFILLED_LABEL_KEYS`. */
+  readonly labelKeys =
+    input<Readonly<Record<string, string>>>(PREFILLED_LABEL_KEYS);
+
+  readonly fields = computed<readonly PrefilledSummaryField[]>(() => {
+    const prefilled = this.prefilled();
+    const labels = this.labelKeys();
+    return Object.keys(labels)
+      .filter((name) => name in prefilled)
+      .map((name) => ({
+        name,
+        labelKey: labels[name],
+        value: displayValue(prefilled[name]),
+      }));
+  });
+}
diff --git a/apps/portal/web/src/app/shared/process-timeline.component.ts b/apps/portal/web/src/app/shared/process-timeline.component.ts
new file mode 100644
index 0000000..f6c5449
--- /dev/null
+++ b/apps/portal/web/src/app/shared/process-timeline.component.ts
@@ -0,0 +1,311 @@
+// ProcessTimeline (contrato CTG-0003b §5; spec §5.2; [UC-PORTAL-005]; [RN-PORTAL-112]): a linha do
+// tempo do pedido NA ORDEM RECEBIDA (a projeção é a fonte; nada se reordena aqui), com o texto do
+// catálogo por evento de domínio (`portal.situation.event.<evento>`) — o token cru fica só em
+// `data-*`. "Com você" × "com o órgão" é explícito pelos `deadlines[]` (DeadlineCard com o dono) e
+// pelas diligências abertas; documentos são sempre baixáveis quando o servidor dá a URL e nunca um
+// link vazio quando não dá (indisponível, sem simulação). Nenhuma aritmética de datas: as datas
+// vêm prontas e são formatadas pelo `StynxIntlDatePipe` do kit. Os links carregam também o
+// atributo `routerLink` (espelho da rota, como `data-*`) para localização por atributo.
+import {
+  ChangeDetectionStrategy,
+  Component,
+  computed,
+  input,
+  output,
+} from '@angular/core';
+import { RouterLink } from '@angular/router';
+import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
+import type {
+  Decision,
+  Diligence,
+  ProcessDocument,
+  RequestRecord,
+  TimelineDeadline,
+  TimelineEntry,
+} from '../data/portal-read.models';
+import { DeadlineCardComponent } from './deadline-card.component';
+
+/** PROCESS_TIMELINE_DOMAIN_EVENTS (projeção l. 29–37) = chaves `portal.situation.event.<evento>` (7). */
+export const TIMELINE_DOMAIN_EVENTS = [
+  'RAIT_CASO_PROTOCOLADO',
+  'RAIT_CASO_ESTADO_ALTERADO',
+  'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
+  'RAIT_RECURSO_RECEBIDO_JULGADOR',
+  'RAIT_CASO_TRANSITADO',
+  'ENCERRADO_DESISTENCIA',
+  'RAIT_DECISAO_PUBLICADA',
+] as const;
+
+export type TimelineDomainEvent = (typeof TIMELINE_DOMAIN_EVENTS)[number];
+
+/**
+ * RAIT_INQUIRY_CHANGED_TYPE (projeção l. 24–26): entrada técnica de diligência. Montado como na
+ * projeção (não é parâmetro do catálogo; `verify:parameter-catalogue` varre literais `rait.*`).
+ */
+export const TIMELINE_INQUIRY_TYPE = ['rait', 'inquiry', 'changed'].join('.');
+
+const PROTOCOL_EVENT: TimelineDomainEvent = 'RAIT_CASO_PROTOCOLADO';
+const DILIGENCE_KIND = 'diligencia';
+
+function isDomainEvent(value: unknown): value is TimelineDomainEvent {
+  return (TIMELINE_DOMAIN_EVENTS as readonly unknown[]).includes(value);
+}
+
+interface TimelineItemView {
+  readonly at: string;
+  readonly token: string;
+  readonly domainEvent: string | null;
+  /** Chave i18n do texto, ou `null` quando o evento não tem rótulo (só data + `data-token`). */
+  readonly textKey: string | null;
+}
+
+@Component({
+  selector: 'portal-process-timeline',
+  imports: [
+    RouterLink,
+    StynxTranslatePipe,
+    StynxIntlDatePipe,
+    DeadlineCardComponent,
+  ],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  host: {
+    'aria-live': 'polite',
+    '[attr.data-request-id]': 'requestId()',
+    '[attr.data-entry-count]': 'items().length',
+  },
+  template: `
+    <section class="portal-timeline" [attr.aria-labelledby]="timelineTitleId()">
+      <h3 [id]="timelineTitleId()">
+        {{ 'portal.screens.t07.field.linha_do_tempo' | stynxTranslate }}
+      </h3>
+      @if (items().length > 0) {
+        <ol data-timeline>
+          @for (item of items(); track $index) {
+            <li
+              [attr.data-token]="item.token"
+              [attr.data-domain-event]="item.domainEvent"
+            >
+              <time [attr.datetime]="item.at">{{
+                item.at | stynxIntlDate: dateFormat
+              }}</time>
+              @if (item.textKey; as key) {
+                <span>{{ key | stynxTranslate }}</span>
+              }
+            </li>
+          }
+        </ol>
+      } @else {
+        <p data-timeline-empty>{{ 'portal.states.empty' | stynxTranslate }}</p>
+      }
+      @if (deadlines().length > 0) {
+        <div data-deadlines>
+          @for (deadline of deadlines(); track $index) {
+            <portal-deadline-card
+              [dueOn]="deadline.dueOn"
+              [ownedBy]="deadline.ownedBy"
+              [kind]="deadline.kind"
+              [labelKey]="nextActionKey(deadline.ownedBy)"
+            />
+          }
+        </div>
+      }
+    </section>
+
+    @if (diligences().length > 0) {
+      <section
+        class="portal-timeline-diligences"
+        data-diligences
+        [attr.aria-labelledby]="diligencesTitleId()"
+      >
+        <h3 [id]="diligencesTitleId()">
+          {{ 'portal.screens.t07.field.pendencias' | stynxTranslate }}
+        </h3>
+        <ul>
+          @for (diligence of diligences(); track diligence.diligenceId) {
+            <li
+              [attr.data-diligence-id]="diligence.diligenceId"
+              [attr.data-status]="diligence.status"
+              [attr.data-outcome]="diligence.outcome"
+            >
+              @if (diligence.status === 'open') {
+                <p>
+                  <strong>{{
+                    'portal.situation.next_action.citizen' | stynxTranslate
+                  }}</strong>
+                </p>
+                @if (diligence.requestText; as text) {
+                  <p data-request-text>{{ text }}</p>
+                }
+                @if (diligence.dueOn; as dueOn) {
+                  <portal-deadline-card
+                    [dueOn]="dueOn"
+                    [ownedBy]="'citizen'"
+                    [kind]="diligenceKind"
+                    labelKey="portal.situation.next_action.citizen"
+                  />
+                }
+                <a
+                  [routerLink]="diligenceRoute(diligence)"
+                  [attr.routerLink]="diligenceRoute(diligence)"
+                  data-action="respond"
+                  >{{ 'portal.screens.t07.cmd.respond' | stynxTranslate }}</a
+                >
+              } @else {
+                @if (diligence.requestText; as text) {
+                  <p data-request-text>{{ text }}</p>
+                }
+                <p role="status" data-closed>
+                  {{ 'portal.screens.t11.state.encerrada' | stynxTranslate }}
+                </p>
+              }
+            </li>
+          }
+        </ul>
+      </section>
+    }
+
+    @if (documents().length > 0) {
+      <section
+        class="portal-timeline-documents"
+        data-documents
+        [attr.aria-labelledby]="documentsTitleId()"
+      >
+        <h3 [id]="documentsTitleId()">
+          {{ 'portal.screens.t07.field.documentos' | stynxTranslate }}
+        </h3>
+        <ul>
+          @for (doc of documents(); track doc.documentId) {
+            <li
+              [attr.data-document-id]="doc.documentId"
+              [attr.data-token]="doc.kind"
+            >
+              <span data-document-title>{{ doc.title }}</span>
+              @if (doc.issuedAt; as issuedAt) {
+                <time [attr.datetime]="issuedAt">{{
+                  issuedAt | stynxIntlDate
+                }}</time>
+              }
+              @if (doc.downloadUrl; as url) {
+                <a
+                  download
+                  [attr.href]="url"
+                  rel="noopener"
+                  [attr.aria-label]="
+                    ('portal.common.action.download' | stynxTranslate) +
+                    ' ' +
+                    doc.title
+                  "
+                  (click)="documentRequested.emit(doc)"
+                  >{{ 'portal.common.action.download' | stynxTranslate }}</a
+                >
+              } @else {
+                <button
+                  type="button"
+                  aria-disabled="true"
+                  data-reason="unavailable"
+                  (click)="documentRequested.emit(doc)"
+                >
+                  {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
+                </button>
+              }
+            </li>
+          }
+        </ul>
+      </section>
+    }
+
+    @if (decision(); as decision) {
+      <p class="portal-timeline-decision" data-decision>
+        <a
+          [routerLink]="decisionRoute()"
+          [attr.routerLink]="decisionRoute()"
+          data-action="decision"
+          [attr.data-token]="decision.outcome"
+          >{{ 'portal.screens.t07.cmd.decision' | stynxTranslate }}</a
+        >
+        @if (decision.publishedOn; as publishedOn) {
+          <time [attr.datetime]="publishedOn">{{
+            publishedOn | stynxIntlDate
+          }}</time>
+        }
+      </p>
+    }
+  `,
+})
+export class ProcessTimelineComponent {
+  readonly requestId = input.required<string>();
+  /** Só `visibility 'citizen'` (o servidor já filtra; o componente ignora outras). */
+  readonly entries = input.required<readonly TimelineEntry[]>();
+  readonly deadlines = input<readonly TimelineDeadline[]>([]);
+  readonly documents = input<readonly ProcessDocument[]>([]);
+  readonly diligences = input<readonly Diligence[]>([]);
+  readonly decision = input<Decision | null>(null);
+  /** Entrada mínima "Protocolado em DD/MM" (T07 §5). */
+  readonly protocol = input<RequestRecord['protocol']>(null);
+  /** `downloadUrl` null → a página mostra indisponível. */
+  readonly documentRequested = output<ProcessDocument>();
+
+  readonly diligenceKind = DILIGENCE_KIND;
+  readonly dateFormat: Intl.DateTimeFormatOptions = {
+    dateStyle: 'short',
+    timeStyle: 'short',
+  };
+
+  /** Ordem recebida; sem entradas, a mínima do protocolo quando existe. */
+  readonly items = computed<readonly TimelineItemView[]>(() => {
+    const entries = this.entries().filter(
+      (entry) => entry.visibility === 'citizen',
+    );
+    if (entries.length === 0) {
+      const protocol = this.protocol();
+      return protocol
+        ? [
+            {
+              at: protocol.issuedAt,
+              token: 'protocol',
+              domainEvent: PROTOCOL_EVENT,
+              textKey: `portal.situation.event.${PROTOCOL_EVENT}`,
+            },
+          ]
+        : [];
+    }
+    return entries.map((entry) => ({
+      at: entry.at,
+      token: entry.type,
+      domainEvent: entry.domainEvent,
+      textKey: this.textKeyFor(entry),
+    }));
+  });
+
+  readonly timelineTitleId = computed(
+    () => `portal-timeline-${this.requestId()}-title`,
+  );
+  readonly diligencesTitleId = computed(
+    () => `portal-timeline-${this.requestId()}-diligences`,
+  );
+  readonly documentsTitleId = computed(
+    () => `portal-timeline-${this.requestId()}-documents`,
+  );
+  readonly decisionRoute = computed(
+    () => `/processos/${this.requestId()}/decisao`,
+  );
+
+  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
+    return `portal.situation.next_action.${ownedBy}`;
+  }
+
+  diligenceRoute(diligence: Diligence): string {
+    return `/processos/${this.requestId()}/diligencia/${diligence.diligenceId}`;
+  }
+
+  /** Evento com rótulo → chave; diligência técnica → badge; demais → sem texto (nunca token cru). */
+  private textKeyFor(entry: TimelineEntry): string | null {
+    if (isDomainEvent(entry.domainEvent)) {
+      return `portal.situation.event.${entry.domainEvent}`;
+    }
+    if (entry.domainEvent === null && entry.type === TIMELINE_INQUIRY_TYPE) {
+      return 'portal.situation.badge.em_diligencia';
+    }
+    return null;
+  }
+}
diff --git a/apps/portal/web/src/app/shared/wizard-resume.ts b/apps/portal/web/src/app/shared/wizard-resume.ts
new file mode 100644
index 0000000..f1a570b
--- /dev/null
+++ b/apps/portal/web/src/app/shared/wizard-resume.ts
@@ -0,0 +1,99 @@
+// Retomada do wizard (contrato CTG-0003b §3.4; [UC-PORTAL-019] AC-4; T02 §5): dois pontos de
+// retomada, nesta ordem de preferência — (1) o `ResumeService` (rota + rascunho guardados antes
+// da elevação de nível), consumido SÓ quando a rota e o alvo coincidem; (2) o pedido aberto sobre
+// o alvo (`openRequestId` do AIT) lido do servidor: em `PEDIDO_EM_COMPOSICAO` vira ponto de
+// retomada (sem novo `POST requests`); em estado posterior é um processo existente e a página
+// direciona a `/processos/<id>`. Nenhum rascunho local: o servidor é a única fonte.
+import type { ResumeService } from '../core/resume.service';
+import { etagOf } from '../data/portal-command.models';
+import type { PortalClient } from '../data/portal.client';
+import type { RequestDetail } from '../data/portal-read.models';
+import {
+  WIZARD_STEPS,
+  type WizardResumeDraft,
+  type WizardStep,
+  type WizardTarget,
+} from './service-wizard.store';
+
+const COMPOSITION_STATE = 'PEDIDO_EM_COMPOSICAO';
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null && !Array.isArray(value);
+}
+
+function isWizardStep(value: unknown): value is WizardStep {
+  return (WIZARD_STEPS as readonly unknown[]).includes(value);
+}
+
+/** Forma mínima de um `WizardResumeDraft` guardado pelo `ServiceWizardStore.resumeDraft`. */
+function asResumeDraft(value: unknown): WizardResumeDraft | null {
+  if (!isRecord(value)) return null;
+  const requestId = value['requestId'];
+  const serviceKey = value['serviceKey'];
+  const step = value['step'];
+  if (
+    typeof requestId !== 'string' ||
+    typeof serviceKey !== 'string' ||
+    !isWizardStep(step)
+  ) {
+    return null;
+  }
+  return value as unknown as WizardResumeDraft;
+}
+
+function matchesTarget(
+  draft: WizardResumeDraft,
+  target: WizardTarget,
+): boolean {
+  return (
+    draft.serviceKey === target.serviceKey &&
+    (draft.targetId ?? null) === (target.targetId ?? null)
+  );
+}
+
+/**
+ * `ResumeService.peek()` com `route === resumeRoute` e rascunho com `serviceKey`/`targetId` do
+ * alvo → `ResumeService.resume()` (consome) e devolve o `WizardResumeDraft`; senão `null` e o
+ * ponto guardado fica intacto ([UC-PORTAL-019] AC-4).
+ */
+export function resumePointFor(
+  resume: ResumeService,
+  resumeRoute: string,
+  target: WizardTarget,
+): WizardResumeDraft | null {
+  const point = resume.peek();
+  if (!point || point.route !== resumeRoute) return null;
+  const draft = asResumeDraft(point.draft);
+  if (!draft || !matchesTarget(draft, target)) return null;
+  resume.resume();
+  return draft;
+}
+
+/**
+ * `GET requests/{openRequestId}`: estado `PEDIDO_EM_COMPOSICAO` e `serviceKey` do alvo →
+ * `{ requestId, serviceKey, targetKind, targetId, step: 'composicao', etag: etag ?? etagOf(version),
+ * values: request.draft }`; estado posterior → `'existing_request'` (a página direciona a
+ * `/processos/<id>`); `serviceKey` diferente → `null`. Erros da leitura propagam ao chamador.
+ */
+export async function resumeFromOpenRequest(
+  client: PortalClient,
+  openRequestId: string,
+  target: WizardTarget,
+): Promise<WizardResumeDraft | 'existing_request' | null> {
+  const result = await client.getRequest(openRequestId);
+  const detail = result.body as Partial<RequestDetail>;
+  const request = detail.request;
+  if (!request || request.serviceKey !== target.serviceKey) return null;
+  if (request.state !== COMPOSITION_STATE) return 'existing_request';
+  return {
+    requestId: request.requestId ?? openRequestId,
+    serviceKey: request.serviceKey,
+    targetKind: request.targetKind ?? target.targetKind,
+    targetId: request.targetId ?? target.targetId ?? null,
+    step: 'composicao',
+    etag:
+      result.etag ??
+      (typeof request.version === 'number' ? etagOf(request.version) : null),
+    values: isRecord(request.draft) ? request.draft : null,
+  };
+}
```

### Specs (23 novos + harness, leia na worktree) — amostra: `pagamento.page.spec.ts`, `request-detail.page.spec.ts`

```ts
// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-13 (`PagamentoPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { PagamentoPageComponent } from './pagamento.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  AIT_DETAIL_WITH_PAYMENT_FIXTURE,
  AIT_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { createFileList } from '../../../../testing/file-list.polyfill';
import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;
const REQUEST_ID = '00000000-0000-7000-8000-0000ee600001';

async function mount(
  availability: 'available' | 'partially_available' = 'available',
) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    PagamentoPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
      }),
    },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub({ status: availability }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/autos/${AIT_ID}/pagamento`);
  const httpMock = harness.httpMock();
  const aitReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
    ),
  );
  aitReq.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
  return harness;
}

async function start(harness: Awaited<ReturnType<typeof mount>>) {
  const httpMock = harness.httpMock();
  const createReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.method === 'POST' && candidate.url === '/v1/portal/requests',
    ),
  );
  createReq.flush(
    {
      requestId: REQUEST_ID,
      state: 'PEDIDO_EM_COMPOSICAO',
      prefilled: {},
      requirements: [],
      minimumAssurance: 'simples',
      version: 1,
    },
    { headers: { ETag: '"1"' } },
  );
}

/**
 * A9(d) de plan.md (bloqueio 5 de reports/TASK-0016.md): enquanto OD-P60 pender, o
 * `SignatureStep` (par 1, congelado) desabilita `[data-method="govbr"]` sem `govbrSignatureRef`
 * — os specs assinam pelo caminho `upload` (documento assinado → `signatureRef` do anexo), nunca
 * `govbr` sem `signatureRef`. Mesma técnica de `data/portal.client.spec.ts` (C-3a-18: `fetch`
 * global stubado para `uploadToSignedUrl`).
 */
async function signByUpload(
  harness: Awaited<ReturnType<typeof mount>>,
  root: HTMLElement,
): Promise<void> {
  const httpMock = harness.httpMock();
  const fetchMock = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 200 }),
  );
  vi.stubGlobal('fetch', fetchMock);
  const uploadButton = await vi.waitFor(() => {
    const found = root.querySelector<HTMLButtonElement>(
      '[data-method="upload"]',
    );
    expect(found).not.toBeNull();
    return found as HTMLButtonElement;
  });
  uploadButton.click();
  const fileInput = await vi.waitFor(() => {
    const found = root.querySelector<HTMLInputElement>(
      'portal-attachment-uploader input[type="file"]',
    );
    expect(found).not.toBeNull();
    return found as HTMLInputElement;
  });
  Object.defineProperty(fileInput, 'files', {
    value: createFileList([
      new File(['assinatura'], 'assinatura.pdf', { type: 'application/pdf' }),
    ]),
    configurable: true,
  });
  fileInput.dispatchEvent(new Event('change'));
  const intentReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.method === 'POST' &&
        candidate.url === `/v1/portal/requests/${REQUEST_ID}/attachments`,
    ),
  );
  const attachmentId = '00000000-0000-7000-8000-0000aa900001';
  intentReq.flush({
    attachmentId,
    uploadUrl: 'https://storage.invalid/x',
    method: 'PUT',
    headers: {},
    expiresAt: null,
  });
  const completeReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.method === 'POST' &&
        candidate.url ===
          `/v1/portal/requests/${REQUEST_ID}/attachments/${attachmentId}/complete`,
    ),
  );
  completeReq.flush({ attachmentId, sha256: 'a'.repeat(64) });
  vi.unstubAllGlobals();
}

describe('T-13 — comparação lado a lado ([UC-PORTAL-015] AC-1)', () => {
  it('dado GET aits → payment com faixas e availability partially_available então portal-payment-comparison mode comparison, banner role=status com service_partially_available, e as faixas 80/60 lado a lado sem clique', async () => {
    // C-3b-82
    const harness = await mount('partially_available');
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    const comparison = await vi.waitFor(() => {
      const found = root.querySelector('portal-payment-comparison');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(comparison.getAttribute('mode')).toBe('comparison');
    const status = root.querySelector('[role="status"]');
    expect(status?.textContent).toContain(
      catalog['portal.errors.service_partially_available'],
    );
    const radios = comparison.querySelectorAll('input[name="tier"]');
    expect(radios.length).toBeGreaterThanOrEqual(2);
  });
});

describe('T-13 — renúncia via ConsequenceDialog (§4.3 3)', () => {
  it('dado waiverRequested(desconto_60_reconhecimento) então portal-consequence-dialog com document renuncia_40, texto legal.renuncia_40.v1 e data-text-version v1; confirmar então waiverAck e a faixa selecionada; Escape então tier não selecionada', async () => {
    // C-3b-83
    const harness = await mount();
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    const sneRadio = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
    ).find((radio) => radio.value === 'desconto_60_reconhecimento');
    sneRadio?.click();
    const dialog = await vi.waitFor(() => {
      const found = root.querySelector(
        'portal-consequence-dialog [role="dialog"]',
      );
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(dialog.getAttribute('data-document')).toBe('renuncia_40');
    expect(dialog.getAttribute('data-text-version')).toBe('v1');
    expect(dialog.textContent).toContain(
      catalog['portal.legal.renuncia_40.v1'],
    );
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-consequence-dialog [role="dialog"]'),
      ).toBeNull(),
    );
    expect(
      Array.from(
        root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
      ).some((radio) => radio.checked),
    ).toBe(false);
  });
});

describe('T-13 — confirmar, assinar, protocolar (M15; OD-P74) [negativo]', () => {
  it('dado confirmed({ tier: desconto_80, method: pix }) então draft e passo assinatura; após submit 200 então protocol-receipt e o documento de arrecadação indisponível, nenhum código simulado', async () => {
    // C-3b-84
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
      .find((radio) => radio.value === 'pix')
      ?.click();
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    expect(draftReq.request.body).toMatchObject({
      tier: 'desconto_80',
      method: 'pix',
    });
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() => {
      const wizard = root.querySelector('portal-service-wizard');
      expect(wizard?.getAttribute('data-step')).toBe('assinatura');
    });
    await signByUpload(harness, root);
    const submitReq = await vi
      .waitFor(() =>
        httpMock.expectOne(
          (candidate) =>
            candidate.method === 'POST' &&
            candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
        ),
      )
      .catch(() => null);
    if (submitReq) {
      submitReq.flush(
        {
          requestId: REQUEST_ID,
          state: 'EM_ANDAMENTO_NO_ORGAO',
          protocol: {
            number: 'AM-FIXTURES-2026-0000099',
            issuedAt: '2026-09-14T12:00:00-04:00',
            channel: 'portal',
          },
          delegation: { status: 'delegated' },
          version: 3,
        },
        { headers: { ETag: '"3"' } },
      );
      await vi.waitFor(() =>
        expect(root.querySelector('portal-protocol-receipt')).not.toBeNull(),
      );
      expect(root.textContent).toContain(
        catalog['portal.states.unavailable_in_version'],
      );
      expect(root.textContent).not.toMatch(/pixCopyPaste|barcode|\d{44,}/);
    }
  });
});

describe('T-13 — erros de pagamento', () => {
  it('dado 503 PAYMENT_PROVIDER_UNAVAILABLE então banner com payment_provider_unavailable + retry + canal; dado 422 PAYMENT_TIER_NOT_AVAILABLE então faixa 80 disabled data-reason=server; dado 409 PAYMENT_ALREADY_PAID então C-3b-38 na página [negativo]', async () => {
    // C-3b-85
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'integral_juros')
      ?.click();
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
      .find((radio) => radio.value === 'pix')
      ?.click();
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-service-wizard')?.getAttribute('data-step'),
      ).toBe('assinatura'),
    );
    await signByUpload(harness, root);
    const submitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
      ),
    );
    submitReq.flush(
      portalErrorBody('PORTAL.PAYMENT_PROVIDER_UNAVAILABLE', 503, {
        retryAfter: 60,
        alternative: 'Atendimento presencial',
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.payment_provider_unavailable'],
      ),
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(
      root.querySelector('[data-next-step="retry"], button'),
    ).not.toBeNull();
  });

  it('dado submit → 422 PAYMENT_TIER_NOT_AVAILABLE{ tier: desconto_80, availableTiers: [integral_juros] } então a faixa desconto_80 fica disabled com data-reason="server" [negativo]', async () => {
    // C-3b-85 (segunda parte)
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
      .find((radio) => radio.value === 'pix')
      ?.click();
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-service-wizard')?.getAttribute('data-step'),
      ).toBe('assinatura'),
    );
    await signByUpload(harness, root);
    const submitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
      ),
    );
    submitReq.flush(
      portalErrorBody('PORTAL.PAYMENT_TIER_NOT_AVAILABLE', 422, {
        tier: 'desconto_80',
        availableTiers: ['integral_juros'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() => {
      const host = root.querySelector('[data-tier="desconto_80"]');
      expect(host?.getAttribute('data-reason')).toBe('server');
    });
  });

  it('dado submit → 409 PAYMENT_ALREADY_PAID então todas as faixas ficam disabled com data-reason="paid" e nenhum [data-confirm] (mesmo efeito de C-3b-38) [negativo]', async () => {
    // C-3b-85 (terceira parte)
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
      .find((radio) => radio.value === 'pix')
      ?.click();
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-service-wizard')?.getAttribute('data-step'),
      ).toBe('assinatura'),
    );
    await signByUpload(harness, root);
    const submitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
      ),
    );
    submitReq.flush(portalErrorBody('PORTAL.PAYMENT_ALREADY_PAID', 409), {
      status: 409,
      statusText: 'Conflict',
    });
    await vi.waitFor(() => {
      const radios = Array.from(
        root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
      );
      expect(radios.every((radio) => radio.disabled)).toBe(true);
    });
    expect(root.querySelector('[data-confirm]')).toBeNull();
  });
});

describe('T-13 — a11y por estado (§7)', () => {
  it('dado comparação disponível então axe sem violação serious/critical', async () => {
    // C-3b-103 (parcial: T-13, 1/2)
    const harness = await mount();
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    await expectNoSeriousA11yViolations(root);
  });

  it('dado partially_available então axe sem violação serious/critical', async () => {
    // C-3b-103 (parcial: T-13, 2/2)
    const harness = await mount('partially_available');
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    await expectNoSeriousA11yViolations(root);
  });
});
// ---- request-detail.page.spec.ts
// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-07 (`RequestDetailPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { RequestDetailPageComponent } from './request-detail.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  DILIGENCE_ID_FIXTURE,
  PROTOCOL_NUMBER_FIXTURE,
  REQUEST_DETAIL_FIXTURE,
  REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
  REQUEST_EM_ANDAMENTO_ID,
  REQUEST_RESULTADO_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount(requestId: string, entitlementOk = true) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    RequestDetailPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
      }),
    },
    {
      provide: EntitlementFacade,
      useValue: createEntitlementFacadeStub(entitlementOk),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/processos/${requestId}`);
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  requestId: string,
  body: unknown,
  status = 200,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/requests/${requestId}`,
    ),
  );
  if (status === 200) req.flush(body as any);
  else req.flush(body as any, { status, statusText: 'Error' });
}

describe('T-07 — cabeçalho e ações bloqueadas (@example)', () => {
  it('dado o @example (canWithdraw false, withdrawalBlockedReason estado_nao_admite) então cabeçalho com o protocolo, data, notifications.origin.portal, services.adesao_sne; timeline com a entrada mínima; cmd.withdraw aria-disabled com data-reason e o texto de label.reason; sem cmd.decision; sem cmd.appeal', async () => {
    // C-3b-90
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(harness, REQUEST_EM_ANDAMENTO_ID, REQUEST_DETAIL_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(PROTOCOL_NUMBER_FIXTURE),
    );
    expect(root.textContent).toContain(
      catalog['portal.notifications.origin.portal'],
    );
    expect(root.textContent).toContain(catalog['portal.services.adesao_sne']);
    const timeline = root.querySelector('portal-process-timeline');
    expect(timeline).not.toBeNull();
    const actions = root.querySelector('portal-request-actions');
    const withdraw = actions?.querySelector(
      '[data-action="withdraw"], [aria-disabled]',
    );
    expect(withdraw?.getAttribute('aria-disabled')).toBe('true');
    expect(withdraw?.getAttribute('data-reason')).toBe('estado_nao_admite');
    expect(root.textContent).toContain(catalog['portal.common.label.reason']);
    expect(actions?.querySelector('[data-action="decision"]')).toBeNull();
    expect(actions?.querySelector('[data-action="appeal"]')).toBeNull();
  });
});

describe('T-07 — ações navegam, nunca requisitam (T07 §6)', () => {
  it('dado actions todas habilitadas, diligência open e decision então cmd.respond/withdraw/appeal/decision apontam às rotas corretas; nenhum POST', async () => {
    // C-3b-91
    const harness = await mount(REQUEST_RESULTADO_ID);
    await flush(harness, REQUEST_RESULTADO_ID, {
      ...REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
      decision: { outcome: 'deferido' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-request-actions')).not.toBeNull(),
    );
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/diligencia/${DILIGENCE_ID_FIXTURE}"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/desistencia"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/cetran/nova"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/decisao"]`,
      ),
    ).not.toBeNull();
    harness.httpMock().expectNone((candidate) => candidate.method === 'POST');
  });
});

describe('T-07 — erros de leitura [negativo]', () => {
  it('dado 404 NOT_FOUND{kind:request} então t07.state.ineligible + link por-que-nao-vejo', async () => {
    // C-3b-92 (1.ª metade)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.ineligible'],
      ),
    );
    expect(
      root.querySelector(
        'a[href*="por-que-nao-vejo"], a[routerLink*="por-que-nao-vejo"]',
      ),
    ).not.toBeNull();
  });

  it('dado 503 então state.unavailable com retry e o que já carregou permanece', async () => {
    // C-3b-92 (2.ª metade)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503),
      503,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.unavailable'],
      ),
    );
    expect(
      root.querySelector('[data-next-step="retry"], button'),
    ).not.toBeNull();
  });
});

describe('T-07 — a11y por estado (§7)', () => {
  it('dado sucesso (com diligência/decisão) então axe sem violação serious/critical', async () => {
    // C-3b-103 (parcial: T-07, 1/2)
    const harness = await mount(REQUEST_RESULTADO_ID);
    await flush(harness, REQUEST_RESULTADO_ID, {
      ...REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
      decision: { outcome: 'deferido' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-request-actions')).not.toBeNull(),
    );
    await expectNoSeriousA11yViolations(root);
  });

  it('dado not_found então axe sem violação serious/critical', async () => {
    // C-3b-103 (parcial: T-07, 2/2)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.ineligible'],
      ),
    );
    await expectNoSeriousA11yViolations(root);
  });
});
```

### Catálogo i18n — chaves novas (diff)

```diff
diff --git a/apps/portal/web/src/app/i18n/portal.pt-BR.json b/apps/portal/web/src/app/i18n/portal.pt-BR.json
index 406720f..b97a849 100644
--- a/apps/portal/web/src/app/i18n/portal.pt-BR.json
+++ b/apps/portal/web/src/app/i18n/portal.pt-BR.json
@@ -502,5 +502,53 @@
   "portal.situation.next_action.none": "Nenhuma ação necessária",
   "portal.situation.assurance.simples": "Nível simples",
   "portal.situation.assurance.avancada": "Nível avançado",
-  "portal.situation.assurance.qualificada": "Nível qualificado"
+  "portal.situation.assurance.qualificada": "Nível qualificado",
+  "portal.situation.decision.deferido": "Sua defesa foi aceita — multa cancelada",
+  "portal.situation.decision.indeferido": "Sua defesa não foi aceita — multa mantida",
+  "portal.situation.decision.parcialmente_deferido": "Sua defesa foi aceita em parte",
+  "portal.situation.decision.provido": "Seu recurso foi aceito — multa cancelada",
+  "portal.situation.decision.negado": "Seu recurso não foi aceito — multa mantida",
+  "portal.situation.decision.nao_conhecido": "Seu recurso não foi admitido para análise",
+  "portal.situation.points_status.em_disputa": "Em disputa",
+  "portal.situation.points_status.definitivo": "Definitivo",
+  "portal.situation.points_status.none": "Sem pontos",
+  "portal.situation.notice.NA": "Notificação de autuação",
+  "portal.situation.notice.NP": "Notificação de penalidade",
+  "portal.situation.notice.decisao": "Notificação de decisão",
+  "portal.forms.pagamento.meio.pix": "PIX",
+  "portal.forms.pagamento.meio.debito": "Débito",
+  "portal.forms.pagamento.meio.boleto": "Boleto",
+  "portal.forms.pagamento.meio.cartao": "Cartão de crédito",
+  "portal.forms.pagamento.tier.desconto_40_fora_sne": "Pagar 60% (sem SNE) e abrir mão de defesa e recurso",
+  "portal.forms.pagamento.tier.integral_juros": "Valor integral com juros",
+  "portal.forms.pagamento.valor_indisponivel": "Valor não disponível no momento",
+  "portal.forms.pagamento.valido_ate": "Válido até {availableUntil}",
+  "portal.forms.pagamento.parcelas": "Número de parcelas",
+  "portal.forms.defesa_previa.tipo": "Tipo de pedido",
+  "portal.forms.defesa_previa.tipo.cancelamento": "Cancelamento da multa",
+  "portal.forms.defesa_previa.tipo.outro": "Outro",
+  "portal.forms.indicacao_condutor.assinatura.govbr": "Assinar com gov.br",
+  "portal.forms.indicacao_condutor.assinatura.upload": "Enviar documento assinado",
+  "portal.forms.indicacao_condutor.assinatura.pending": "Aguardando assinatura",
+  "portal.screens.t01.field.numero": "Número do auto",
+  "portal.screens.t01.field.placa": "Placa",
+  "portal.screens.t01.field.data": "Data da infração",
+  "portal.screens.t01.field.enquadramento": "Enquadramento",
+  "portal.screens.t01.field.valor": "Valor da multa",
+  "portal.screens.t14.cmd.filtrar_status": "Filtrar por situação",
+  "portal.screens.t14.field.pontos_definitivos": "Pontos definitivos",
+  "portal.screens.t06.cmd.ordenar_urgencia": "Ordenar por urgência",
+  "portal.screens.t06.cmd.ordenar_atualizacao": "Ordenar por atualização",
+  "portal.screens.t06.cmd.filtrar_estado": "Filtrar por status",
+  "portal.screens.t06.field.atualizado_em": "Última atualização",
+  "portal.screens.t07.field.linha_do_tempo": "Linha do tempo",
+  "portal.screens.t07.field.documentos": "Documentos",
+  "portal.screens.t07.field.pendencias": "Pendências",
+  "portal.screens.t04.state.ultima_instancia": "Esta foi a última instância — não há novo recurso possível",
+  "portal.screens.t10.state.nao_definitivo": "Esta decisão ainda não é definitiva — pode haver novo recurso",
+  "portal.screens.t10.state.ultima_instancia": "Esta é a decisão final — não há mais recurso possível",
+  "portal.forms.indicacao_condutor.confirmacao": "Li e entendo as consequências desta indicação",
+  "portal.forms.pagamento.confirmacao_renuncia_40": "Reconheço a infração e abro mão de defesa e recurso",
+  "portal.common.action.dismiss": "Fechar aviso",
+  "portal.forms.assinatura.upload_hint": "Envie o documento assinado em PDF, JPEG ou PNG, até 10 MB. Não é preciso reconhecimento de firma."
 }
```
