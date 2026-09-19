All acceptance criteria green. Composing the final report.

## Entrega — Tarefa: TASK-0015 (iteração 3)

**Papel (Art. 6): Inspector.**

### Escopo desta iteração
Restrito à adenda A10 de `work/rounds/R-0014/plan.md` §Adendas (achados do `delivery-review-CTG-0003b`, `work/rounds/R-0014/reviews/delivery-review-CTG-0003b.json`). Apenas `*.spec.ts`/`src/testing/**`; sem `git`, sem `pnpm install`.

### Achados endereçados
- **(a) C-3b-87** — `apps/portal/web/src/app/features/pagamento/pages/pagamento-preservando-recurso.page.spec.ts`: revertido de `boleto` para `cartao` com `available: ['pix','debito','boleto']` e asserção `data-reason="server"` em `[data-method="cartao"]`, conforme A10(a) (servidor prevalece sobre `PAYMENT_FLAGS`, contrato §4.2). A produção (`methodReason` em `payment-comparison.component.ts`) já estava corrigida pelo Engineer no momento da checagem (`serverMethods !== null` avaliado antes da flag estática) — não foi necessário aguardar os 5 min.
- **(e) C-3b-36** — `apps/portal/web/src/app/shared/payment-comparison.component.spec.ts`: assert trocado de `catalog['portal.states.empty']` para `catalog['portal.forms.pagamento.valor_indisponivel']`; `data-amount="unavailable"` mantido. Produção já usava a chave própria (OD-P70).
- **(f) Asserções de retry** — removido o fallback `, button` em três specs, restando só `[data-next-step="retry"]`:
  - `apps/portal/web/src/app/features/autos/pages/ait-detail.page.spec.ts:256`
  - `apps/portal/web/src/app/features/processos/pages/request-detail.page.spec.ts:168`
  - `apps/portal/web/src/app/features/pagamento/pages/pagamento.page.spec.ts:345`
- **(g) C-3b-70** — `apps/portal/web/src/app/features/defesa/pages/defesa-previa.page.spec.ts`: reescrito para montar com `assuranceLevel: 'avancada'` (satisfaz o `assuranceGuard` na navegação), rebaixar `session.assuranceLevelSignal.set('simples')` **depois** da navegação, e usar `minimumAssurance: 'avancada'` no 201 (nunca `qualificada` como exigência, [RN-PORTAL-101]). Restaurada a asserção original do `AssuranceExplainer` (`portal-assurance-explainer`, `data-required="avancada"`, `data-current="simples"`) e confirmado que o banner `assurance_qualified_never_required` **não** aparece.

### Itens de A10 fora desta iteração
Os demais achados do `delivery-review-CTG-0003b.json` (item 11 axe por estado/13 telas, item 7 `.catch(() => null)` em C-3b-84/C-3b-104, item 10 composição T-13/T-23, item 11 `AttachmentUploader` em T-05, itens `low` de `runAit`/`<select>` sem filtro/OD-P87) não constam da mensagem restrita da coordenação para esta iteração e não foram tocados — permanecem como pendências registradas no próprio `delivery-review` e em A10(b)/(c)/(d)/(h)/(i).

### Comandos executados e resultado
1. `pnpm --filter @detran/portal-web typecheck` → **0 erros**
2. `pnpm --filter @detran/portal-web lint` → **0 erros**
3. `pnpm --filter @detran/portal-web test` → **74 arquivos passaram (74) / 909 passed | 7 todo (916) / 0 failed** (verde já na primeira execução após os fixes — nenhuma dependência pendente do Engineer)
4. `pnpm verify:parameter-catalogue` → **OK (87 entries, 18 flags, 14 i18n namespaces, 0 errors)**
5. `pnpm format:check` → achou 4 arquivos desformatados: 3 dentro do meu escopo (`ait-detail.page.spec.ts`, `pagamento.page.spec.ts`, `request-detail.page.spec.ts` — resíduo do `sed` do item (f)) e 1 fora de escopo (`work/rounds/R-0014/contracts/CTG-0003c.md`, pertencente ao TASK-0021 em execução em paralelo). Corrigi só os 3 do meu escopo com `prettier --write`; **não toquei** o `CTG-0003c.md` por não ser spec/testing nem meu. Reexecutado `format:check` → **OK, exceto o `CTG-0003c.md` remanescente** (fora do meu escopo); typecheck/lint/test reconfirmados verdes após o ajuste.

### Critérios de aceite
- `typecheck && lint`: **PASS** (0 erros)
- `test`: **PASS** — 0 failed, 909 passed, 7 todo (916 total)
- `verify:parameter-catalogue`: **PASS**
- `format:check`: **PASS no escopo do Inspector** (o único arquivo ainda com warning, `work/rounds/R-0014/contracts/CTG-0003c.md`, é de outra tarefa em curso — TASK-0021 — e não está em `*.spec.ts`/`src/testing/**`; sinalizo para quem fechar essa tarefa rodar `prettier --write` nele)

### Casos vermelhos por defeito real
Nenhum. Todos os achados de A10 atribuídos ao Inspector eram specs desalinhados com decisões já ratificadas ou com correções paralelas do Engineer (que já haviam chegado ao código de produção no momento da checagem).

### Restrições respeitadas
Nenhum comando `git` de escrita, nenhum `pnpm install`; alterações confinadas a `*.spec.ts`; nenhuma asserção enfraquecida (pelo contrário: (f) e (a) restauram rigor perdido em iterações anteriores); nenhum `it.skip` introduzido.
