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

**Segundo ciclo — restrito aos nove achados de `delivery-review-CTG-0003b`** (orchestra/README.md
§5). Adenda **A10** (`plan.md` §Adendas) e iterações TASK-0016 it. 2 (`reports/TASK-0016-iteration-2.md`)
e TASK-0015 it. 3 (`reports/TASK-0015-iteration-3.md`):

1. (high 10, `payment-comparison.component.ts` `methodReason`) **invertido**: o servidor prevalece
   (`available[]`/422 `PAYMENT_METHOD_UNAVAILABLE` → `data-reason="server"`), flags só quando o
   servidor não se pronuncia; C-3b-87 voltou a `cartao` com `data-reason="server"`.
2. (high 10, composição T-13/T-23) ratificada por A10(b): comparação renderizada pela página assim
   que o `payment` chega; `PagamentoForm` é o passo 2 lógico do wizard.
3. (high 11, T-05 sem `AttachmentUploader`) ratificado por A10(c): o documento assinado entra pelo
   `SignatureStep` (`upload` → `signatureRef`); OD-P81 estendida.
4. (low 11, `runAit` sequencial) ratificado por A10(d).
5. (low 8, `amount === null`) → `portal.forms.pagamento.valor_indisponivel` no componente e em C-3b-36.
6. (low 7, seletor de retry) `, button` removido nas três asserções.
7. (low 5, C-3b-70) reescrito: monta `avancada`, rebaixa a sessão para `simples` após a navegação,
   `minimumAssurance: 'avancada'` no 201; asserção original do `AssuranceExplainer` restaurada.
8. (low 4, `<select>` sem filtro) sem `[value]`/`selectedIndex = -1` quando a query não tem filtro (até OD-P84).
9. (low 5, `locale`) **OD-P101** (renumerada; OD-P87 ficou para o `If-Match` de `PUT preferences`).

Gates re-executados pelo maestro: typecheck 0, lint 0, `pnpm --filter @detran/portal-web test` →
**74 passed, 909 passed | 7 todo (916)**, build OK, `verify:parameter-catalogue` OK, `format:check` OK.
(O contrato do par 3, `contracts/CTG-0003c.md`, já existe na worktree mas **não** faz parte desta
entrega — está fora do staged.)

### Veredito anterior (delivery-review-CTG-0003b.json)

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
      "line": 274,
      "claim": "C-3b-103 entregue parcial: o contrato exige `axe` em CADA estado da tabela §7 (loading, ready, empty, not_found, error, unavailable, offline, partial) para as 13 telas, mas há 30 casos de axe ao todo — 2 a 3 por tela, nenhum de `loading` e nenhum de `offline`, e T-23 com um único estado (`preserving_appeal`; sem not_found/erro/indisponível/partial). Além disso as três outras asserções de C-3b-103 não existem em nenhum spec do par: `h1` único (nenhum `querySelectorAll('h1')`), região de estado com `aria-label` `portal.a11y.status_region` (0 ocorrências em specs) e foco no banner de erro. É exatamente a 'cobertura parcial declarada' que `plan.md` §Retomada manda evitar desde o primeiro ciclo neste CTG e que o delivery-review do CTG-0003a recusou (§Pendências de cobertura).",
      "fix": "Iteração restrita do Inspector (TASK-0015): um caso de axe por estado da tabela §7 em cada uma das 13 telas (incl. loading e offline; partial em T-13 e T-23) e asserções explícitas de `h1` único, `aria-label`=`portal.a11y.status_region` e foco no banner `severity: 'error'`; ou, se a cobertura integral for reduzida por decisão, registrar a redução em `plan.md` §Pendências de cobertura com a OD/adenda que a autoriza."
    },
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/features/pagamento/pages/pagamento.page.spec.ts",
      "line": 258,
      "claim": "C-3b-84 (critério [negativo] de M15/OD-P74) é condicional: `const submitReq = await vi.waitFor(...).catch(() => null)` (l. 249-257) e todas as asserções do critério — `portal-protocol-receipt`, `portal.states.unavailable_in_version` para o documento de arrecadação e `not.toMatch(/pixCopyPaste|barcode|\\d{44,}/)` — ficam dentro de `if (submitReq) { … }`. Se o `POST …/submit` deixar de ocorrer (regressão no ciclo assinar→protocolar), o teste passa verde sem verificar nada: o gate 'nunca um boleto/PIX simulado' deixa de existir silenciosamente.",
      "fix": "Remover o `.catch(() => null)` e o `if`: `expectOne` do `submit` como asserção obrigatória (o fluxo por `upload` da adenda A9(d) já chega lá) e manter as três asserções no corpo do `it`."
    },
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/features/autos/static-analysis.appeal.spec.ts",
      "line": 65,
      "claim": "C-3b-104 (offline transversal) tem escape silencioso: `if (!req) { onLineSpy.mockRestore(); return; }` — o `it` termina verde quando a leitura HTTP não aparece em 300 ms. O comentário (l. 51-54) justifica o guarda pelo estado anterior à TASK-0016 ('a rota ainda renderiza PlaceholderPageComponent'), premissa que deixou de valer nesta entrega e que a iteração 2 do Inspector não retirou. Um `it` que pode passar sem executar nenhuma asserção é skip implícito (§4.5 do método; rubrica 7).",
      "fix": "Iteração restrita do Inspector: trocar o `vi.waitFor(...).catch(() => null)` + `return` por `expectOne` obrigatório da leitura de `/v1/portal/aits/{id}` e manter as asserções de `portal.states.offline` / `role=\"alert\"` / ausência de retry automático."
    },
    {
      "severity": "high",
      "item": 10,
      "file": "apps/portal/web/src/app/shared/payment-comparison.component.ts",
      "line": 522,
      "claim": "Contradição contrato × código resolvida sem adenda do Architect: `methodReason` dá precedência à flag estática sobre a resposta do servidor (`cartao` com `flags.cardPayment=false` → `data-reason=\"portal.card_payment\"` mesmo sob `422 PAYMENT_METHOD_UNAVAILABLE`), enquanto o contrato §4.2 diz que `payment.methods` do servidor 'prevalece sobre estas flags' e C-3b-87 fixa `cartao` com `data-reason=\"server\"`. O Inspector reescreveu o critério para `boleto` com `available:['pix','debito']` (spec l. 156 e comentário l. 223-225) — a adenda A9 ratifica só (c), (d) e (e), não esta.",
      "fix": "Adenda numerada do Architect (A10) ratificando a precedência flag → servidor e a reescrita de C-3b-87 (`boleto`), OU inverter a precedência em `methodReason` e repor o critério original com `cartao`."
    },
    {
      "severity": "high",
      "item": 10,
      "file": "apps/portal/web/src/app/features/pagamento/pages/pagamento.page.ts",
      "line": 108,
      "claim": "Composição de T-13/T-23 diverge do contrato §3.4 ('a página hospeda `<portal-service-wizard>` … e projeta o formulário do passo 2') e §4.4 ('`PagamentoFormComponent` (passo 2 projetado no wizard)'): a página renderiza `<portal-pagamento-form>` fora do wizard (l. 108-127) e instancia `<portal-service-wizard #wizard … />` sem conteúdo projetado (l. 128). O relatório do Engineer registra a decisão (C-3b-86/87 exigem a comparação antes do `POST requests`), mas nenhuma adenda a ratifica; consequência observável: a comparação aparece antes de o pedido existir e o passo 'composicao' do wizard fica vazio nas duas telas de pagamento.",
      "fix": "Adenda do Architect ratificando a composição (comparação fora do `ng-content`, `PagamentoForm` como passo 2 lógico) e ajustando §4.4/§6 T-13/T-23; ou projetar o formulário no wizard e reescrever C-3b-86/87."
    },
    {
      "severity": "high",
      "item": 11,
      "file": "apps/portal/web/src/app/features/indicacao/components/indicacao-condutor-form.component.ts",
      "line": 6,
      "claim": "T-05 entrega sem um componente que o contrato §6 lista: 'AttachmentUploader (caminho b) quando `signatures.owner|driver === 'upload'`'. O formulário não importa nem renderiza `AttachmentUploaderComponent` (só `PrefilledSummary` + campos + assinaturas); o cabeçalho do arquivo justifica pela estrita `IndicacaoCondutorSchema` sem `attachmentIds` e delega ao `SignatureStep`. A justificativa consta do relatório do Engineer, mas não há adenda do Architect nem OD — e o caminho (b) de [RN-PORTAL-104] fica sem lugar de envio no passo 2.",
      "fix": "Adenda do Architect ratificando 'documento assinado entra pelo SignatureStep' (e corrigindo §6 T-05), ou OD sobre onde `attachmentIds` do caminho (b) é gravado no rascunho da indicação (extensão de OD-P81)."
    },
    {
      "severity": "low",
      "item": 11,
      "file": "apps/portal/web/src/app/features/autos/autos.facade.ts",
      "line": 158,
      "claim": "`runAit` lê `getAitPoints` SEQUENCIALMENTE, depois do detalhe (l. 173-178), enquanto o contrato §3.2 documenta 'GET aits/{id} (+ GET aits/{id}/points em paralelo…)'. Diferença observável no caminho de erro: com 404/503 no detalhe, os pontos não são pedidos. Nenhum critério é violado (C-3b-12 só exige uma chamada e isolamento da falha) e o cabeçalho do arquivo documenta a escolha, mas ela não está em §Fora de escopo do relatório nem em adenda.",
      "fix": "Ratificar em adenda (leitura de pontos após o detalhe) ou disparar as duas leituras juntas."
    },
    {
      "severity": "low",
      "item": 8,
      "file": "apps/portal/web/src/app/shared/payment-comparison.component.ts",
      "line": 182,
      "claim": "Faixa com `amount === null` mostra `portal.states.empty` = 'Nenhum registro encontrado.' no lugar do valor — texto genérico de lista vazia onde se espera um valor monetário ([IU-PORTAL-001] §E, linguagem cidadã). O contrato §4.3.2 pedia `portal.states.empty` 'chave própria: OD-P70', e OD-P70 já entregou `portal.forms.pagamento.valor_indisponivel` = 'Valor não disponível no momento' (TASK-0006 it. 6), que ficou sem uso. A nota do maestro ('`amount` null → \"valor indisponível\" com chave') não corresponde ao código.",
      "fix": "Trocar por `portal.forms.pagamento.valor_indisponivel` (mantendo `data-amount=\"unavailable\"`) e ajustar C-3b-36 e §4.3.2."
    },
    {
      "severity": "low",
      "item": 7,
      "file": "apps/portal/web/src/app/features/autos/pages/ait-detail.page.spec.ts",
      "line": 256,
      "claim": "Asserção de 'botão retry' enfraquecida por seletor alternativo: `root.querySelector('[data-next-step=\"retry\"], button')` (mesmo padrão em `features/processos/pages/request-detail.page.spec.ts:168` e `features/pagamento/pages/pagamento.page.spec.ts:345`) — qualquer `<button>` da página satisfaz o critério. O `PortalErrorBanner` já expõe `data-next-step` no contêiner (`core/error-banner.component.ts`), então o seletor preciso é suficiente.",
      "fix": "Remover o `, button` das três asserções, deixando só `[data-next-step=\"retry\"]`."
    },
    {
      "severity": "low",
      "item": 5,
      "file": "apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.spec.ts",
      "line": 208,
      "claim": "C-3b-70 simula a insuficiência de nível com `minimumAssurance: 'qualificada'` no 201 — nível que [RN-PORTAL-101]/M8 dizem que nunca é exigido —, e por isso o próprio spec troca a asserção do contrato ('e o AssuranceExplainer do par 1') por `portal.errors.assurance_qualified_never_required` (l. 263-268). A mecânica decorre de A9(c), mas o efeito é que o estado real 'sem permissão' de T-02 (exigência `avancada` com sessão `simples`) continua sem teste e um elemento do critério foi substituído sem adenda.",
      "fix": "Registrar em adenda a substituição do `AssuranceExplainer` por `assurance_qualified_never_required` em C-3b-70, ou simular a insuficiência com nível de sessão abaixo do exigido (stub que rebaixa `assuranceLevel` após a navegação), preservando a asserção do explainer."
    },
    {
      "severity": "low",
      "item": 4,
      "file": "apps/portal/web/src/app/features/autos/pages/ait-list.page.ts",
      "line": 107,
      "claim": "Os `<select>` de T-14 (`name=\"status\"`, 7 opções) e T-06 (`name=\"state\"`, 13 opções) não têm opção 'sem filtro', mas o valor ligado é `facade.query().status ?? ''`: sem filtro nenhum `<option>` casa com `''` e o navegador exibe a primeira situação como selecionada enquanto a lista vem inteira — o controle informa um estado que não é o do dado. A lacuna está registrada (OD-P84, A9(h)), mas C-3b-60 fixa 'exatamente 7 opções', o que impede a correção sem mexer no critério.",
      "fix": "Ao fechar OD-P84, ajustar também C-3b-60 (7 tokens + 1 opção 'todas') ou, até lá, não ligar `[value]` quando a query não tem filtro."
    },
    {
      "severity": "low",
      "item": 5,
      "file": "apps/portal/web/src/app/shared/payment-comparison.component.ts",
      "line": 9,
      "claim": "O contrato §4.3.2 manda formatar `amount` com `Intl.NumberFormat(brand.locale, …)` (`locale` de `GET brand`, CTG-0003a A1), mas `AvailableBrand` do par 1 (congelado) não expõe `locale`; a entrega usa o locale do runtime de i18n. Inspector e Engineer apontaram a lacuna nos relatórios, porém nenhuma OD foi aberta para a origem do `locale` (A9(h) propõe só OD-P84/85/86) — fonte pendente sem `OD-*` contraria a regra 'nada inventado / lacuna vira OD'.",
      "fix": "Abrir OD (ex.: OD-P87) para expor `locale` em `BrandService.state()`/`AvailableBrand` e citar a decisão em §4.3.2."
    }
  ],
  "notes": [
    "Gates não foram reexecutados por mim (o prompt fixa trabalho somente de leitura); julguei sobre a árvore staged e os números do maestro. O log citado (`pnpm-check-ctg3b.log`) não está na worktree — registrar o caminho ou anexar ao evidence.",
    "Item 1 (papel) OK: TASK-0020 Architect, TASK-0015 Inspector, TASK-0016 Engineer, TASK-0006 it.6 Architect (transcr.); item 3/§9 (fronteira) OK — o staged só toca `apps/portal/web/**` e `work/rounds/R-0014/**`; nenhum arquivo 'Generated from BP-…', nenhum `packages/**`, nenhum `zz-*.spec.ts` remanescente.",
    "Item 7 OK no essencial: nenhum `it.skip`/`.only`; os 7 `it.todo` citam OD-P54/P59/P60/P72/P74/P76; nenhum arquivo gerado editado à mão. As três mudanças de asserção com adenda (A9c/d/e) conferem; as ressalvas estão nos achados acima.",
    "Item 8/9 OK: nenhum `new Date`/`Date.now`/`getTime`/`localStorage`/`navigator.onLine` em código de produção do par (só em specs de análise estática); nenhuma URL externa nos arquivos do §1; ordenação por urgência só por comparação de texto ISO; tokens crus só em `data-*`/`data-reason`.",
    "Item 13 OK: a exaustividade de presença/ausência continua em `app.guards-matrix.spec.ts` (persona anônima/simples/avancada/qualificada × disponibilidade × vínculo para todas as rotas do manifesto), agora montando páginas reais; C-3b-54 cobre as 10 rotas com vínculo e C-3b-55 os 4 serviços `unavailable` das fixtures.",
    "`ProcessTimeline` (7 estados) e `PaymentComparison` (6 casos) têm axe por estado — a lacuna de a11y é só nas 13 páginas; em `PaymentComparison` os casos 'flag off' e 'cartão desabilitado' repetem o estado padrão (PAYMENT_FLAGS já desliga ambos) e o estado `disabled` (wizard ocupado) de C-3b-43 não é coberto.",
    "Chaves i18n órfãs criadas na iteração 6 do transcriber: `portal.forms.pagamento.valor_indisponivel`, `portal.forms.pagamento.tier.integral_juros` (o rótulo usado é `portal.screens.t23.field.valor_integral`), `portal.common.action.dismiss` e `portal.forms.assinatura.upload_hint` (alvo é o par 1, congelado). Sem gate que as detecte (o scanner verifica usado ⊆ catálogo, não o inverso).",
    "`angular.json` `maximumWarning` 500 → 600 kB (A9(g), maestro): é afrouxamento de limiar, ainda que só de aviso e com `maximumError` em 1 MB; vale registrar o valor real (503,87 kB) no fechamento para que o par 3 não use os 96 kB de folga sem revisão.",
    "`src/testing/router-harness.ts` passou a receber `readonly unknown[]` no lugar de `Provider[]` para aceitar `ModuleWithProviders` e componentes standalone: perde-se tipagem nos 50 specs anteriores; aceitável como infraestrutura de teste, mas convém restringir a `Provider | ModuleWithProviders<unknown> | Type<unknown>` no par 3.",
    "A semântica ratificada em A9(a) (leituras das facades resolvem ao despachar) faz `loadList/loadDetail/loadDecision(): Promise<void>` não significar 'concluído' — armadilha para chamadores futuros; o par 3 deveria tipar isso explicitamente (ex.: `dispatch*`) ou documentar no contrato §3."
  ]
}
```

### Diff das correções (produção + specs tocados nas iterações A10)

```diff
diff --git a/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts b/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts
new file mode 100644
index 0000000..7d124dd
--- /dev/null
+++ b/apps/portal/web/src/app/features/autos/pages/ait-list.page.ts
@@ -0,0 +1,288 @@
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
+        <!-- Sem filtro, nenhuma opção fica selecionada (OD-P84: opção "todas" pendente; A10 h). -->
+        <select #statusSelect name="status" (change)="onStatusChange($event)">
+          @for (situation of situations; track situation) {
+            <option
+              [value]="situation"
+              [selected]="facade.query().status === situation"
+            >
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
+  private readonly statusSelect =
+    viewChild<ElementRef<HTMLSelectElement>>('statusSelect');
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
+    // Sem filtro na query, o <select> não mostra opção alguma como escolhida (A10 h; até OD-P84
+    // não há opção "todas" — o navegador escolheria a primeira sozinho).
+    afterRenderEffect(() => {
+      const filter = this.facade.query().status;
+      const select = this.statusSelect()?.nativeElement;
+      untracked(() => {
+        if (select && !filter) select.selectedIndex = -1;
+      });
+    });
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
diff --git a/apps/portal/web/src/app/features/processos/pages/request-list.page.ts b/apps/portal/web/src/app/features/processos/pages/request-list.page.ts
new file mode 100644
index 0000000..be2ff70
--- /dev/null
+++ b/apps/portal/web/src/app/features/processos/pages/request-list.page.ts
@@ -0,0 +1,336 @@
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
// ---- specs
diff --git a/apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.spec.ts b/apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.spec.ts
new file mode 100644
index 0000000..d589005
--- /dev/null
+++ b/apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.spec.ts
@@ -0,0 +1,420 @@
+// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-02 (`DefesaPreviaPageComponent`); página real,
+// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
+import { DefesaPreviaPageComponent } from './defesa-previa.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
+import { TestBed } from '@angular/core/testing';
+import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
+import portalCatalog from '../../../i18n/portal.pt-BR.json';
+import { PORTAL_ROUTES } from '../../../app.routes';
+import { SessionFacade } from '../../../core/session.facade';
+import { EntitlementFacade } from '../../../core/entitlement.facade';
+import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
+import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
+import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
+import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
+import { createPortalRouterHarness } from '../../../../testing/router-harness';
+import {
+  AIT_DETAIL_FIXTURE,
+  AIT_ID,
+} from '../../../../testing/http-fixtures-reads';
+import { portalErrorBody } from '../../../../testing/http-fixtures';
+import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';
+
+const catalog = portalCatalog as Record<string, string>;
+
+async function mount(
+  session = createSessionFacadeStub({
+    active: true,
+    assuranceLevel: 'avancada',
+  }),
+) {
+  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
+    DefesaPreviaPageComponent,
+    { provide: SessionFacade, useValue: session },
+    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
+    {
+      provide: ServiceCatalogFacade,
+      useValue: createServiceCatalogFacadeStub({ status: 'available' }),
+    },
+    StynxI18nModule.forRoot({
+      defaultLocale: 'pt-BR',
+      loadCatalog: async () => catalog,
+    }),
+  ]);
+  await TestBed.inject(StynxI18nService).initialize();
+  await harness.navigate(`/autos/${AIT_ID}/defesa/nova`);
+  return harness;
+}
+
+async function flushAitContext(
+  harness: Awaited<ReturnType<typeof mount>>,
+  openRequestId: string | null,
+) {
+  const httpMock = harness.httpMock();
+  const req = await vi.waitFor(() =>
+    httpMock.expectOne(
+      (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
+    ),
+  );
+  req.flush({
+    ...AIT_DETAIL_FIXTURE,
+    openRequestId,
+    deadlines: [{ kind: 'T-DEF', dueOn: '2026-10-14', ownedBy: 'citizen' }],
+  });
+}
+
+describe('T-02 — abertura sem rascunho (start automático; [RN-PORTAL-107] 3)', () => {
+  it('dado GET aits → openRequestId null então POST /v1/portal/requests { serviceKey: defesa_previa, targetKind: ait, targetId, channel: portal }; dado 201 então textarea facts/grounds, select requestType, portal-attachment-uploader com o checklist = requirements[] inteiro', async () => {
+    // C-3b-68
+    const harness = await mount();
+    await flushAitContext(harness, null);
+    const httpMock = harness.httpMock();
+    const createReq = await vi.waitFor(() =>
+      httpMock.expectOne(
+        (candidate) =>
+          candidate.method === 'POST' &&
+          candidate.url === '/v1/portal/requests',
+      ),
+    );
+    expect(createReq.request.body).toMatchObject({
+      serviceKey: 'defesa_previa',
+      targetKind: 'ait',
+      targetId: AIT_ID,
+      channel: 'portal',
+    });
+    createReq.flush(
+      {
+        requestId: '00000000-0000-7000-8000-000070400005',
+        state: 'PEDIDO_EM_COMPOSICAO',
+        prefilled: {},
+        requirements: ['Foto do local', 'Cópia do documento'],
+        minimumAssurance: 'avancada',
+        version: 1,
+      },
+      { headers: { ETag: '"1"' } },
+    );
+    const root = harness.harness.routeNativeElement as HTMLElement;
+    await vi.waitFor(() => {
+      expect(root.querySelector('textarea[name="facts"]')).not.toBeNull();
+    });
+    expect(
+      root.querySelector('textarea[name="facts"]')?.closest('form, div')
+        ?.textContent,
+    ).toBeTruthy();
+    expect(root.querySelector('textarea[name="grounds"]')).not.toBeNull();
+    expect(root.querySelector('select[name="requestType"]')).not.toBeNull();
+    const uploader = root.querySelector('portal-attachment-uploader');
+    expect(uploader?.textContent).toContain('Foto do local');
+    expect(uploader?.textContent).toContain('Cópia do documento');
+  });
+});
+
+describe('T-02 — retomada via openRequestId ([UC-PORTAL-019] AC-4; T02 §5)', () => {
+  it('dado openRequestId e GET requests → PEDIDO_EM_COMPOSICAO com draft { facts: a } então nenhum POST requests, wizard em step composicao e values() { facts: a }', async () => {
+    // C-3b-69 (1.ª metade)
+    const openId = '00000000-0000-7000-8000-000070400005';
+    const harness = await mount();
+    await flushAitContext(harness, openId);
+    const httpMock = harness.httpMock();
+    const requestReq = await vi.waitFor(() =>
+      httpMock.expectOne(
+        (candidate) => candidate.url === `/v1/portal/requests/${openId}`,
+      ),
+    );
+    requestReq.flush(
+      {
+        request: {
+          requestId: openId,
+          state: 'PEDIDO_EM_COMPOSICAO',
+          serviceKey: 'defesa_previa',
+          targetKind: 'ait',
+          targetId: AIT_ID,
+          draft: { facts: 'a' },
+          version: 1,
+        },
+      },
+      { headers: { ETag: '"1"' } },
+    );
+    httpMock.expectNone(
+      (candidate) =>
+        candidate.method === 'POST' && candidate.url === '/v1/portal/requests',
+    );
+    const root = harness.harness.routeNativeElement as HTMLElement;
+    await vi.waitFor(() => {
+      const wizard = root.querySelector('portal-service-wizard');
+      expect(wizard?.getAttribute('data-step')).toBe('composicao');
+    });
+  });
+
+  it('dado state PROTOCOLADO então t02.state.ineligible e link /processos/<id>', async () => {
+    // C-3b-69 (2.ª metade)
+    const openId = '00000000-0000-7000-8000-000070400005';
+    const harness = await mount();
+    await flushAitContext(harness, openId);
+    const req = await vi.waitFor(() =>
+      harness
+        .httpMock()
+        .expectOne(
+          (candidate) => candidate.url === `/v1/portal/requests/${openId}`,
+        ),
+    );
+    req.flush({
+      request: {
+        requestId: openId,
+        state: 'PROTOCOLADO',
+        serviceKey: 'defesa_previa',
+        targetKind: 'ait',
+        targetId: AIT_ID,
+        draft: null,
+        version: 2,
+      },
+    });
+    const root = harness.harness.routeNativeElement as HTMLElement;
+    await vi.waitFor(() =>
+      expect(root.textContent).toContain(
+        catalog['portal.screens.t02.state.ineligible'],
+      ),
+    );
+    expect(
+      root.querySelector(`a[routerLink="/processos/${openId}"]`),
+    ).not.toBeNull();
+  });
+});
+
+describe('T-02 — nível insuficiente no passo assinatura (T02 §5; A10(g) de plan.md — a rota avancada exige avancada no assuranceGuard, M8 intocável, satisfeito na navegação; a insuficiência é simulada rebaixando a sessão DEPOIS que o guarda já passou, nunca com qualificada como exigência)', () => {
+  it('dado assuranceLevel avancada na navegação (satisfaz o assuranceGuard), rebaixado para simples depois, e minimumAssurance avancada no 201 então o texto de t02.state.forbidden aparece acima do portal-signature-step, que delega ao AssuranceExplainer (data-required=avancada, data-current=simples); a página não navega para fora', async () => {
+    // C-3b-70 — A10(g): nível de sessão abaixo do exigido (não `qualificada` no `minimumAssurance`,
+    // reservado por [RN-PORTAL-101] para "nunca exigido"), preservando a asserção do
+    // `AssuranceExplainer` do par 1.
+    const session = createSessionFacadeStub({
+      active: true,
+      assuranceLevel: 'avancada',
+    });
+    const harness = await mount(session);
+    await flushAitContext(harness, null);
+    // O `assuranceGuard` (M8, intocável) já validou a rota com `avancada` durante `navigate()`
+    // acima; rebaixar depois simula a insuficiência sem depender de `qualificada`.
+    session.assuranceLevelSignal.set('simples');
+    const httpMock = harness.httpMock();
+    const createReq = await vi.waitFor(() =>
+      httpMock.expectOne(
+        (candidate) =>
+          candidate.method === 'POST' &&
+          candidate.url === '/v1/portal/requests',
+      ),
+    );
+    createReq.flush(
+      {
+        requestId: '00000000-0000-7000-8000-000070400005',
+        state: 'PEDIDO_EM_COMPOSICAO',
+        prefilled: {},
+        requirements: [],
+        minimumAssurance: 'avancada',
+        version: 1,
+      },
+      { headers: { ETag: '"1"' } },
+    );
+    const root = harness.harness.routeNativeElement as HTMLElement;
+    await vi.waitFor(() =>
+      expect(root.querySelector('textarea[name="facts"]')).not.toBeNull(),
+    );
+    root.querySelector<HTMLTextAreaElement>('textarea[name="facts"]')!.value =
+      'x';
+    root
+      .querySelector('textarea[name="facts"]')
+      ?.dispatchEvent(new Event('input', { bubbles: true }));
+    root.querySelector<HTMLTextAreaElement>('textarea[name="grounds"]')!.value =
+      'y';
+    root
+      .querySelector('textarea[name="grounds"]')
+      ?.dispatchEvent(new Event('input', { bubbles: true }));
+    harness.harness.detectChanges(); // reflete os values antes do clique (zoneless).
+    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
+    const draftReq = await vi.waitFor(() =>
+      httpMock.expectOne(
+        (candidate) =>
+          candidate.method === 'PUT' &&
+          candidate.url ===
+            '/v1/portal/requests/00000000-0000-7000-8000-000070400005/draft',
+      ),
+    );
+    draftReq.flush(
+      {
+        requestId: '00000000-0000-7000-8000-000070400005',
+        version: 2,
+        savedAt: '2026-09-14T12:00:00-04:00',
+      },
+      { headers: { ETag: '"2"' } },
+    );
+    await vi.waitFor(() =>
+      expect(root.textContent).toContain(
+        catalog['portal.screens.t02.state.forbidden'],
+      ),
+    );
+    const forbidden = Array.from(root.querySelectorAll('*')).find((element) =>
+      element.textContent?.includes(
+        catalog['portal.screens.t02.state.forbidden'],
+      ),
+    );
+    const signatureStep = root.querySelector('portal-signature-step');
+    expect(forbidden).toBeTruthy();
+    expect(signatureStep).not.toBeNull();
+    // O texto de contexto da página precede o SignatureStep no DOM (contrato §3.4 e).
+    expect(
+      forbidden!.compareDocumentPosition(signatureStep as Node) &
+        Node.DOCUMENT_POSITION_FOLLOWING,
+    ).toBeTruthy();
+    // SignatureStep (par 1, congelado): insuficiência em 'avancada'/'simples' delega ao
+    // AssuranceExplainer (não ao banner "nunca exigido", reservado a required==='qualificada').
+    const explainer = await vi.waitFor(() => {
+      const found = root.querySelector('portal-assurance-explainer');
+      expect(found).not.toBeNull();
+      return found as HTMLElement;
+    });
+    expect(explainer.getAttribute('data-required')).toBe('avancada');
+    expect(explainer.getAttribute('data-current')).toBe('simples');
+    expect(root.textContent).not.toContain(
+      catalog['portal.errors.assurance_qualified_never_required'],
+    );
+    expect(harness.currentUrl()).toContain(`/autos/${AIT_ID}/defesa/nova`);
+  });
+});
+
+describe('T-02 — indisponibilidade na abertura (M15)', () => {
+  it('dado POST requests → 422 SERVICE_UNAVAILABLE { unavailableReason: delegacao_indisponivel_r0007 } então t02.state.unavailable, data-reason, o note renderizado e nenhum recibo [negativo]', async () => {
+    // C-3b-71
+    const harness = await mount();
+    await flushAitContext(harness, null);
+    const httpMock = harness.httpMock();
+    const createReq = await vi.waitFor(() =>
+      httpMock.expectOne(
+        (candidate) =>
+          candidate.method === 'POST' &&
+          candidate.url === '/v1/portal/requests',
+      ),
+    );
```
