# TASK-0017 — iteração 4 (restrita): achados do delivery-review-CTG-0003c (ciclo 1)

Papel: **Inspector** (Art. 6). Mesmas regras, fronteira e leitura da TASK-0017. O reviewer
(`work/rounds/R-0014/reviews/delivery-review-CTG-0003c.json`) devolveu REVIEW; o maestro decidiu
em `plan.md` **A12** (leia-a inteira). O Engineer (TASK-0018 it. 2) corrige em paralelo a produção
para A12(a)/(d)/(e)/(f)/(g)/(i) — não toque em produção; enquanto ele não termina, os casos novos
que dependem dessas correções podem ficar vermelhos (esperado). Nunca reduza asserção; nunca
`it.skip`/`it.todo` novo sem OD.

1. **A12(a) — offline simulado como nos pares 1/2:** em todos os casos "offline" do par 3 que hoje
   só devolvem `status 0` (`documentos.facade.spec.ts` C-3c-27/28/35 e os casos `dado offline` de
   `cnh`, `crlv`, `vehicles`, `crash-list`, `crash-detail`, `exam-list`, `service-charter`, `home`,
   `inicio`, `conta`, e qualquer outro que encontre com `grep -ln 'status: 0'`), acrescentar
   `vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false)` (restaurado em `afterEach`),
   como `inbox.page.spec.ts` e `request-detail.page.spec.ts` fazem. A produção deixa de
   reclassificar `status 0` fora do `ErrorBoundary`; a asserção `portal.states.offline` continua.
2. **A12(b) — metade DOM de C-3c-33/45/58 nas páginas** `documentos/pages/crlv.page.spec.ts` (T-17),
   `atendimento/pages/manifestation-new.page.spec.ts` (T-21) e `assinatura/pages/elevation.page.spec.ts`
   (T-27): caso de estado `unavailable` (422 `SERVICE_UNAVAILABLE`/catálogo indisponível, nos moldes
   dos pares anteriores) assertando `root.querySelector('portal-alternative-channel-note')`, o texto
   de `portal.screens.t<nn>.state.indisponivel`, o `data-reason` do banner, nenhum card/nenhuma
   navegação, e `expectA11yStateInvariants`. **C-3c-112 estendido**: um estado de erro/indisponibilidade
   por tela de ato (`sne`, `cnh`, `crlv`, `manifestation-new`, `manifestation-detail`, `own-data`,
   `elevation`, `junta-medica`) provando `<portal-alternative-channel-note>` presente — pode ser um
   `it` novo em cada spec de página ou uma extensão de `a11y/all-routes.a11y.spec.ts`.
3. **A12(c) — C-3c-52 exaustivo** em `privacidade/privacidade.facade.spec.ts`: com
   `actRequirements` só `lgpd_declaracao:declaracao_completa` → `true` para `declaracao_completa`,
   `false` para `confirmacao`, `correcao`, `eliminacao`; segundo caso com `{ act: 'lgpd_declaracao', allowed: true }`
   (sem sufixo) → só `confirmacao` `true`.
4. **A12(d) — T-19** `sinistros/pages/crash-detail.page.spec.ts`: caso com `summary` contendo uma
   chave fora de `gravidade|dinamica` (ex. `pending_complement: 'x'`), assertando que o valor
   aparece no `<dl data-summary>` dentro do grupo `[data-key="pending_complement"]`, que a string
   `pending_complement` **não** aparece como texto, e `axe`.
5. **A12(e) — home**: em `core/pages/home.page.spec.ts`, serviço `pagamento` `partially_available`
   (fixture) → link para `/autos` (rota funcional por §3.9), não `/carta-servicos/pagamento`.
6. **A12(f) — `atendimento.facade.spec.ts`:** 404 `NOT_FOUND{kind:'manifestation'}` em
   `POST /v1/portal/evaluations` para `subjectKind 'manifestation'` → banner cujo `nextStepRoute`
   leva a `/vinculo/por-que-nao-vejo?recurso=manifestation&id=<id>` (nunca `recurso=request`).
7. **A12(h)** — `privacidade.facade.spec.ts`: `as any` → tipo real `PrivacidadeFacade`;
   `notificacoes/static-analysis.pair3.spec.ts` e `core/realtime.service.spec.ts`: substituir
   `catch { continue }`/`catch { return }` por falha explícita (`expect(files.length).toBeGreaterThan(0)`,
   leitura sem `try`).
8. **A12(i)** — se algum spec assertava `portal.services.pagamento` como título da seção de débitos
   (`clearance-status.component.spec.ts`, `crlv.page.spec.ts`), trocar por
   `portal.documents.clearance.debts` (chave já no catálogo).

## Critérios de aceitação

`typecheck` 0 erros; `lint` 0 erros; `format:check` OK nos seus arquivos; `test` → informe as
linhas literais `Test Files`/`Tests`; vermelhos admitidos **só** os que dependem da produção do
Engineer ainda em curso (liste-os com o item A12 correspondente). Total de testes ≥ 1309 + os novos.

## Entrega (formato da TASK-0017, "Tarefa: TASK-0017 (iteração 4)")

Specs tocados por item 1…8; saída literal; vermelhos restantes classificados; defeitos reais de
produção encontrados (ou "nenhum"); OD (ou "nenhuma"); bloqueios (ou "nenhum").
