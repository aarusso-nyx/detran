# TASK-0018 — iteração 2 (restrita): achados do delivery-review-CTG-0003c (ciclo 1)

Papel: **Engineer** (Art. 6). Mesmas regras, fronteira e leitura da TASK-0018. O reviewer
(`work/rounds/R-0014/reviews/delivery-review-CTG-0003c.json`) devolveu REVIEW; o maestro decidiu
em `plan.md` **A12** (leia-a inteira). Esta iteração corrige **só** os itens abaixo, em código de
produção; specs e `src/testing/**` são do Inspector (TASK-0017 it. 4, em paralelo — não os toque;
alguns specs vão ficar vermelhos até ele terminar, e é esperado). Nenhum `git`; nenhum `pnpm install`.

1. **A12(a) — `status 0` só pelo `ErrorBoundary`.** Remover as oito cópias de `presentRead`
   (`features/{documentos,notificacoes,sinistros,exames,atendimento,catalogo}/*.facade.ts`,
   `core/pages/inicio.facade.ts`, `core/pages/home.page.ts`) e chamar `presentError` do
   `ErrorBoundary` diretamente; nenhuma leitura de `navigator` nas features (C-3c-113). Atualize
   os comentários que citavam A11(b).
2. **A12(d) — T-19 `crash-detail.page.ts`:** entradas de `summary` sem rótulo em
   `LABELLED_SUMMARY_KEYS` rendem só o valor (`<dd>`) dentro do grupo com `data-key`; a chave crua
   **nunca** aparece como texto (remova o `<dt [attr.data-raw-key]>{{ entry.key }}</dt>`). Confira
   com `axe` (o spec do Inspector vai exercitar uma chave desconhecida).
3. **A12(e) — regra §3.9 na home:** extrair `functionalRouteFor` de `features/catalogo/catalogo.facade.ts`
   para `src/app/core/functional-route.ts` (função pura, mesma semântica: entrada do manifesto sem
   parâmetro → rota; com `:aitId` → `/autos`; outro parâmetro → `null`); `CatalogoFacade` e
   `home.page.ts` passam a usá-la; `directRouteFor` sai. Serviço `available`/`partially_available`
   com rota funcional → link para ela; sem rota funcional → `/carta-servicos/<key>` (como hoje).
4. **A12(f) — `atendimento.facade.ts` `evaluate()`:** `entitlement: { kind: body.subjectKind, id: body.subjectId }`.
5. **A12(g) — `core/realtime.service.ts`:** `POLLING_INTERVAL_SECONDS = POLLING_INTERVAL_MS / 1000`
   (nenhum segundo literal de intervalo).
6. **A12(i) — `shared/clearance-status.component.ts`:** `<h3>` da seção de débitos usa
   `portal.documents.clearance.debts` (já no catálogo — o maestro a acrescentou), não
   `portal.services.pagamento`.

Fora disso, nada muda. Ao terminar: `pnpm --filter @detran/portal-web typecheck` (0 erros),
`lint` (0 erros), `build` (OK, sem rede), `prettier --write` nos arquivos tocados,
`pnpm verify:parameter-catalogue` OK. `test`: informe as linhas `Test Files`/`Tests` e liste os
vermelhos — os únicos admitidos são os casos de offline do par 3 que ainda simulam só `status 0`
(o Inspector os está trocando por `navigator.onLine === false`) e os casos novos que ele estiver
escrevendo; qualquer outro vermelho é seu.

## Entrega (formato da TASK-0018, "Tarefa: TASK-0018 (iteração 2)")

Arquivos tocados por item 1…6; comandos e saída literal; vermelhos restantes classificados;
"Fora do escopo"/OD (ou "nenhuma"); bloqueios (ou "nenhum").
