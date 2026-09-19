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

**Terceiro ciclo — restrito aos cinco achados de `delivery-review-CTG-0003b-2`** (orchestra/README.md
§5). O maestro reconhece a omissão: ao ler o veredito do ciclo 1 truncou a lista e não relatou os
três primeiros `high`; A10 foi corrigida (cabeçalho "6 high + 6 low", itens (j)/(k)/(l)) e as
correções aplicadas — TASK-0015 it. 4 (`reports/TASK-0015-iteration-4.md`) e TASK-0016 it. 3
(`reports/TASK-0016-iteration-3.md`):

1. (high 11, C-3b-103) novo helper `src/testing/a11y-state.spec-helper.ts` (`expectA11yStateInvariants`:
   `h1` único, `role="status"` com `aria-label` de `portal.a11y.status_region`, foco no
   `portal-error-banner[role="alert"]`, axe serious/critical) aplicado a **todos os estados** da
   tabela §7 nas 13 telas (74 casos, inclusive `loading`, `offline`, `partial` em T-13/T-23).
2. (high 7, C-3b-84) `.catch(() => null)`/`if` removidos: `expectOne` do `submit` obrigatório e as
   três asserções negativas incondicionais.
3. (high 7, C-3b-104) `if (!req) return` e o comentário obsoleto removidos: `expectOne` obrigatório.
4. (low 11, cabeçalho de A10) corrigido para "6 high + 6 low" com (j)/(k)/(l).
5. (low 5, OD-P101) citada no cabeçalho de `payment-comparison.component.ts`; renumeração
   registrada em A10(i) (OD-P87 é o `If-Match` de `PUT preferences`, contrato do par 3).

Gates re-executados pelo maestro: typecheck 0, lint 0, `pnpm --filter @detran/portal-web test` →
**74 passed, 969 passed | 7 todo (976)**, build OK, `verify:parameter-catalogue` OK, `format:check`
OK. Nota: o catálogo i18n staged inclui também as 119 chaves do par 3 (OD-P89(a), TASK-0006 it. 7,
transcritas com fonte por chave em `reports/TASK-0006-iteration-7.md`) — aditivas, cobertas por
`i18n-keys.spec.ts`; o contrato do par 3 e seus artefatos **não** fazem parte desta entrega.

### Veredito anterior (delivery-review-CTG-0003b-2.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 11,
      "file": "apps/portal/web/src/app/features/pagamento/pages/pagamento-preservando-recurso.page.spec.ts",
      "line": 290,
      "claim": "Achado 1 do ciclo anterior (C-3b-103 parcial) NÃO foi corrigido nem ratificado. A árvore continua com 30 casos de axe nas 13 telas (2–3 por tela; T-23 com um só, l. 290), nenhum de `loading` e nenhum de `offline`, e as outras três asserções do critério continuam inexistentes: `grep -rn \"status_region\" --include=*.spec.ts` → 0 ocorrências, `querySelectorAll('h1')` → 0 ocorrências, nenhuma asserção de foco no banner `severity: 'error'`. A adenda A10 não trata do achado, `plan.md` §Pendências de cobertura (l. 323-325) só registra a pendência de 2026-09-17 do CTG-0003a, e `reports/TASK-0015-iteration-3.md` l. 20 declara explicitamente que o item 'não consta da mensagem restrita da coordenação e não foi tocado'. É a mesma cobertura parcial não declarada que o CTG-0003a recusou.",
      "fix": "Iteração restrita do Inspector (TASK-0015): um caso de axe por estado da tabela §7 em cada uma das 13 telas (incl. `loading` e `offline`; `partial` em T-13/T-23) e asserções explícitas de `h1` único, `aria-label`=`portal.a11y.status_region` e foco no banner de erro; OU, se a redução for decidida, registrá-la em `plan.md` §Pendências de cobertura com a adenda/OD que a autoriza, como foi feito no CTG-0003a."
    },
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/features/pagamento/pages/pagamento.page.spec.ts",
      "line": 258,
      "claim": "Achado 2 do ciclo anterior (C-3b-84 condicional) NÃO foi corrigido: `const submitReq = await vi.waitFor(...).catch(() => null)` (l. 249-257) e o bloco `if (submitReq) { … }` (l. 258-279) continuam idênticos; as três asserções do critério [negativo] de M15/OD-P74 (`portal-protocol-receipt`, `portal.states.unavailable_in_version`, `not.toMatch(/pixCopyPaste|barcode|\\d{44,}/)`) seguem dentro do `if`. Uma regressão que suprima o `POST …/submit` deixa o `it` verde sem verificar nada — o gate 'nunca um boleto/PIX simulado' desaparece silenciosamente. Nenhuma adenda (A10 a…i) cobre o achado e `reports/TASK-0015-iteration-3.md` l. 20 confirma que não foi tocado.",
      "fix": "Iteração restrita do Inspector: remover o `.catch(() => null)` e o `if`, deixando o `expectOne` do `submit` como asserção obrigatória (o fluxo por `upload` de A9(d) já chega lá) e as três asserções no corpo do `it`."
    },
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/features/autos/static-analysis.appeal.spec.ts",
      "line": 65,
      "claim": "Achado 3 do ciclo anterior (C-3b-104 com escape silencioso) NÃO foi corrigido: `if (!req) { onLineSpy.mockRestore(); return; }` (l. 65-68) continua no arquivo, precedido pelo comentário de l. 52-55 que ainda afirma 'Até TASK-0016 a rota ainda renderiza `PlaceholderPageComponent` … nenhuma leitura HTTP é disparada' — premissa falsa nesta entrega (`features/autos/pages/ait-detail.page.ts` existe e a rota monta a página real). O `it` termina verde sem executar nenhuma asserção se a leitura não aparecer em 300 ms: skip implícito. Nenhuma adenda cobre o achado; `reports/TASK-0015-iteration-3.md` l. 20 confirma que não foi tocado.",
      "fix": "Iteração restrita do Inspector: `expectOne` obrigatório da leitura de `/v1/portal/aits/{id}` (sem `.catch`/`return`), comentário de l. 52-55 removido por obsoleto, mantendo as asserções de `portal.states.offline`, `role=\"alert\"` e ausência de retry automático."
    },
    {
      "severity": "low",
      "item": 11,
      "file": "work/rounds/R-0014/plan.md",
      "line": 431,
      "claim": "O cabeçalho de A10 transcreve o veredito anterior como 'delivery-review-CTG-0003b REVIEW — 3 high + 6 low', mas `reviews/delivery-review-CTG-0003b.json` traz 6 `high` + 6 `low`. Os três `high` omitidos são exatamente os achados 1, 2 e 3 acima (axe por estado, `.catch` de C-3b-84, escape de C-3b-104) — nenhum aparece em A10(a…i) nem na mensagem restrita da coordenação, e por isso atravessaram o ciclo sem correção e sem registro em §Fora de escopo. A contagem errada no documento da rodada é a causa mecânica da entrega incompleta.",
      "fix": "Corrigir o cabeçalho de A10 para '6 high + 6 low' e acrescentar itens (j)/(k)/(l) com o destino dos três achados (corrigir na iteração restrita ou registrar a redução em §Pendências de cobertura)."
    },
    {
      "severity": "low",
      "item": 5,
      "file": "apps/portal/web/src/app/shared/payment-comparison.component.ts",
      "line": 9,
      "claim": "A correção do achado `low` sobre o `locale` ficou meio-feita: A10(i) abre **OD-P101** para a origem do `locale`, mas a OD não é citada onde a decisão foi tomada — o cabeçalho do componente (l. 8-9) diz apenas 'o `GET brand` não expõe `locale`, CTG-0003a A1 — ver relatório', sem `OD-*`, e `reports/TASK-0016-iteration-2.md` l. 30-31 ainda registra 'OD-P87 (origem do `locale` para `Intl`)' — número que A10(i) e `contracts/CTG-0003c.md` (l. 2011, §2.3) atribuem à origem do `If-Match` de `PUT preferences`. Duas decisões diferentes sob o mesmo número nos registros da rodada, e OD-P101 só existe dentro do texto de A10.",
      "fix": "Citar `OD-P101` no cabeçalho de `payment-comparison.component.ts` (§4.3.2), corrigir a linha do relatório de TASK-0016 it. 2 e listar OD-P101 com enunciado próprio junto das demais OD propostas do par 2 (A9(h)/A10)."
    }
  ],
  "notes": [
    "Segundo ciclo: avaliei apenas as correções dos 12 achados do `delivery-review-CTG-0003b.json`; nenhum achado novo sobre texto não alterado foi levantado.",
    "Os nove itens da mensagem do maestro conferem: (1) `methodReason` invertido — `if (serverMethods !== null) return serverMethods.includes(method) ? null : 'server'` antes da flag (`payment-comparison.component.ts:530-541`) e C-3b-87 de volta a `cartao`/`data-reason=\"server\"` com `available:['pix','debito','boleto']` (`pagamento-preservando-recurso.page.spec.ts:156-158, 224-238`); (2) composição T-13/T-23 ratificada por A10(b) (código inalterado: `pagamento.page.ts:110/128`); (3) T-05 ratificado por A10(c), cabeçalho do formulário documenta o caminho pelo `SignatureStep` (`indicacao-condutor-form.component.ts:4-8`); (4) `runAit` ratificado por A10(d) (`autos.facade.ts:158-179`); (5) `amount === null` → `portal.forms.pagamento.valor_indisponivel` (`payment-comparison.component.ts:10, 184`) com o spec ajustado; (6) `, button` removido nas três asserções (`ait-detail.page.spec.ts:255`, `request-detail.page.spec.ts:167`, `pagamento.page.spec.ts:344`); (7) C-3b-70 reescrito com rebaixamento da sessão após a navegação e asserção do `AssuranceExplainer` restaurada (`defesa-previa.page.spec.ts`, `data-required=\"avancada\"`/`data-current=\"simples\"`; o stub já expunha `assuranceLevelSignal`); (8) `<select>` sem filtro com `selectedIndex = -1` em `afterRenderEffect` nas duas listas (`ait-list.page.ts:249-257`, `request-list.page.ts:258-263`); (9) locale → A10(i)/OD-P101, com a ressalva do achado acima.",
    "Não reexecutei gates (o prompt fixa trabalho somente de leitura); julguei sobre a árvore staged e os números do maestro (74 arquivos, 909 passed | 7 todo).",
    "Fronteira de escrita (itens 3/9) continua OK: o staged toca só `apps/portal/web/**` e `work/rounds/R-0014/**`; nenhum `packages/**`, nenhum arquivo gerado, nenhum `it.skip`/`.only` introduzido pelas iterações A10.",
    "O texto do contrato não foi alterado pelas ratificações: §4.3.2 (l. 730-731) ainda diz `portal.states.empty` e `Intl.NumberFormat(brand.locale)`, e C-3b-36 (l. 1228) idem — as adendas A10(e)/(i) prevalecem, mas convém consolidar isso no fechamento (TASK-0012) para o par 3 não reler o texto antigo.",
    "`.catch(() => null)` também aparece em `ait-detail.page.spec.ts:71` e `decisao.page.spec.ts:78`, mas ali são *helpers* de flush opcional (`pointsReq?.flush(...)`, `requestReq?.flush(...)`) em leituras secundárias, não asserções de critério dentro de `if` — não são os achados 2/3 e não os levanto como novos; ao corrigir 2/3, preservar a distinção.",
    "`work/rounds/R-0014/contracts/CTG-0003c.md` está na worktree como untracked e fora do staged, como o maestro declarou; não o avaliei."
  ]
}
```

### Helper novo e amostra dos specs corrigidos

```ts
// R-0014 TASK-0015 (Inspector), iteração 4 — A10(j)/C-3b-103: invariantes de acessibilidade
// transversais (contrato §7 do CTG-0003b + §8 do CTG-0003a) comuns às 13 telas em CADA estado da
// tabela §7: `h1` único, região de estado (`role="status"`) com `aria-label` traduzido de
// `portal.a11y.status_region`, e — quando o estado tem um `portal-error-banner` com
// `severity:'error'` — o foco no próprio banner (o componente já o move via `afterRenderEffect`,
// `core/error-banner.component.ts`). `axe` (sem violação `serious`/`critical`) é delegado a
// `a11y/axe.spec-helper.ts`. Só usado por specs.
import { expect } from 'vitest';
import { expectNoSeriousA11yViolations } from '../app/a11y/axe.spec-helper';

export interface A11yStateExpectations {
  /**
   * O estado tem um `portal-error-banner` `role="alert"` (severity 'error') e ele deve ter
   * recebido o foco (`document.activeElement`) — estados error/unavailable/offline/not_found
   * quando modelados pelo banner de erro (`PortalErrorBannerComponent`).
   */
  readonly errorBannerFocused?: boolean;
}

export async function expectA11yStateInvariants(
  root: HTMLElement,
  catalog: Record<string, string>,
  expectations: A11yStateExpectations = {},
): Promise<void> {
  expect(root.querySelectorAll('h1')).toHaveLength(1);
  const statusRegion = root.querySelector(
    `[role="status"][aria-label="${catalog['portal.a11y.status_region']}"]`,
  );
  expect(statusRegion).not.toBeNull();
  if (expectations.errorBannerFocused) {
    const banner = root.querySelector('.portal-error-banner[role="alert"]');
    expect(banner).not.toBeNull();
    expect(document.activeElement).toBe(banner);
  }
  await expectNoSeriousA11yViolations(root);
}
// ---- pagamento.page.spec.ts (C-3b-84)
217:    // C-3b-84
218-    const harness = await mount();
219-    await start(harness);
220-    const httpMock = harness.httpMock();
221-    const root = harness.harness.routeNativeElement as HTMLElement;
222-    await vi.waitFor(() =>
223-      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
224-    );
225-    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
226-      .find((radio) => radio.value === 'desconto_80')
227-      ?.click();
228-    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
229-      .find((radio) => radio.value === 'pix')
230-      ?.click();
231-    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
232-    const draftReq = await vi.waitFor(() =>
233-      httpMock.expectOne(
234-        (candidate) =>
235-          candidate.method === 'PUT' &&
236-          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
237-      ),
238-    );
239-    expect(draftReq.request.body).toMatchObject({
240-      tier: 'desconto_80',
241-      method: 'pix',
242-    });
243-    draftReq.flush(
244-      {
245-        requestId: REQUEST_ID,
246-        version: 2,
247-        savedAt: '2026-09-14T12:00:00-04:00',
248-      },
249-      { headers: { ETag: '"2"' } },
250-    );
251-    await vi.waitFor(() => {
252-      const wizard = root.querySelector('portal-service-wizard');
253-      expect(wizard?.getAttribute('data-step')).toBe('assinatura');
254-    });
255-    await signByUpload(harness, root);
256:    // C-3b-84 — A10(k): o `expectOne` do `submit` é obrigatório (não `.catch(() => null)`/`if`):
257-    // uma regressão que suprima o POST deixaria o `it` verde sem checar nada (M15/OD-P74).
258-    const submitReq = await vi.waitFor(() =>
259-      httpMock.expectOne(
260-        (candidate) =>
261-          candidate.method === 'POST' &&
262-          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
263-      ),
264-    );
265-    submitReq.flush(
266-      {
267-        requestId: REQUEST_ID,
268-        state: 'EM_ANDAMENTO_NO_ORGAO',
269-        protocol: {
270-          number: 'AM-FIXTURES-2026-0000099',
271-          issuedAt: '2026-09-14T12:00:00-04:00',
272-          channel: 'portal',
273-        },
274-        delegation: { status: 'delegated' },
275-        version: 3,
276-      },
// ---- static-analysis.appeal.spec.ts (C-3b-104)
1:// R-0014 TASK-0015 (Inspector). CTG-0003b §8 — C-3b-104 (offline transversal), C-3b-105 (análise
2-// estática de todo o par) e C-3b-107 (it.todo das três OD que ficam para depois deste par). Vive
3-// em `features/autos/` pelo mesmo motivo de `page-routes.spec.ts` (glob de fronteira do prompt).
4-import { TestBed } from '@angular/core/testing';
5-import { readdir, readFile } from 'node:fs/promises';
6-import { dirname, join } from 'node:path';
7-import { fileURLToPath } from 'node:url';
8-import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
9-import portalCatalog from '../../i18n/portal.pt-BR.json';
10-import { PORTAL_ROUTES } from '../../app.routes';
11-import { SessionFacade } from '../../core/session.facade';
12-import { EntitlementFacade } from '../../core/entitlement.facade';
13-import { ServiceCatalogFacade } from '../../core/service-catalog.facade';
14-import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
15-import { createEntitlementFacadeStub } from '../../../testing/entitlement-facade.stub';
16-import { createServiceCatalogFacadeStub } from '../../../testing/service-catalog-facade.stub';
17-import { createPortalRouterHarness } from '../../../testing/router-harness';
18-import { AIT_ID } from '../../../testing/http-fixtures-reads';
19-
20-const catalog = portalCatalog as Record<string, string>;
21-
22-describe('offline transversal (M14; spec §8) — representativo, mecanismo comum a todas as facades', () => {
23-  it('dado navigator.onLine false e status 0 numa leitura de T-01 então texto de portal.states.offline em role=alert, nenhuma fila/retry automático, e o conteúdo já carregado permanece', async () => {
24:    // C-3b-104 (o mecanismo — classifyError/readStatusFor status 0 + offline — já é coberto
25-    // isoladamente por C-3b-07; aqui prova-se a ligação com uma página real)
26-    const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
27-      {
28-        provide: SessionFacade,
29-        useValue: createSessionFacadeStub({
30-          active: true,
31-          assuranceLevel: 'avancada',
32-        }),
33-      },
34-      {
35-        provide: EntitlementFacade,
36-        useValue: createEntitlementFacadeStub(true),
37-      },
38-      {
39-        provide: ServiceCatalogFacade,
40-        useValue: createServiceCatalogFacadeStub({ status: 'available' }),
41-      },
42-      StynxI18nModule.forRoot({
43-        defaultLocale: 'pt-BR',
44-        loadCatalog: async () => catalog,
45-      }),
```
