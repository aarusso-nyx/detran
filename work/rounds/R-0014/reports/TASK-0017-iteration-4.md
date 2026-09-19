## Papel: Inspector

## Tarefa: TASK-0017 (iteração 4)

### Contexto retomado

Esta sessão continuou de um corte de contexto no meio do item 2 (A12(b)) da iteração 4. Concluí os 8 itens do achado A12 (a–i, exceto g que é do Engineer) e, em seguida, o complemento enviado pela coordenação após o Engineer concluir TASK-0018 iteração 2 (3 itens adicionais: heurística de C-3c-78, rota funcional de `pagamento`/`defesa_previa` na home, limpeza de `sessionStorage` no novo caso de `crlv.page.spec.ts`).

### Arquivos tocados (só `*.spec.ts` e `src/testing/**` — nenhum arquivo de produção)

- `apps/portal/web/src/app/features/documentos/pages/crlv.page.spec.ts` — DOM de C-3c-33 (T-17: `[data-unavailable][data-reason]`, `portal.states.service_unavailable`, `<portal-error-banner role="alert">`); `afterEach` de limpeza de `OfflineDocumentStore`/`sessionStorage` (complemento).
- `apps/portal/web/src/app/features/atendimento/pages/manifestation-new.page.spec.ts` — DOM de C-3c-45 (T-21: `AlternativeChannelNote` presente, texto sem `"recusad"`).
- `apps/portal/web/src/app/features/assinatura/pages/elevation.page.spec.ts` — DOM de C-3c-58 (T-27: `AlternativeChannelNote` presente, `location.assign` nunca chamado).
- `apps/portal/web/src/app/core/realtime.service.spec.ts` — A12(g) complemento: heurística de C-3c-78 ajustada para excluir `MS_PER_SECOND = 1000` por linha, comparando `> 1000` em vez de `>= 1000`; A12(h): removido `catch` silencioso do `readFile`.
- `apps/portal/web/src/app/core/pages/home.page.spec.ts` — A12(e)/complemento: `defesa_previa` e `pagamento` (só rotas `:aitId` no manifesto) agora afirmados com link `/autos`, nunca `/carta-servicos/<key>`.
- `apps/portal/web/src/app/features/privacidade/privacidade.facade.spec.ts` — A12(c): C-3c-52 exaustivo nos quatro escopos (confirmacao/declaracao_completa/correcao/eliminacao), com os dois cenários de `actRequirements` (sufixo e ato-base); A12(h): removido `as any`, tipo real de `PrivacidadeFacade`.
- `apps/portal/web/src/app/features/notificacoes/static-analysis.pair3.spec.ts` — A12(h): removidos os `catch { return }`/`catch { continue }` silenciosos (módulos do par 3 já existem); adicionada asserção explícita `featureFiles.length > 0`.
- `apps/portal/web/src/app/features/sinistros/pages/crash-detail.page.spec.ts` — A12(d): novo teste com chave de `summary` não catalogada (`pending_complement`), provando renderização só em `[data-key]`, nunca como texto visível.
- `apps/portal/web/src/app/features/atendimento/atendimento.facade.spec.ts` — A12(f): novo teste de `evaluate()` com `subjectKind: 'manifestation'` e 404 `NOT_FOUND{kind:'manifestation'}`, provando `nextStepRoute` com `recurso=manifestation` (nunca `recurso=request`).
- A12(b)/C-3c-112 estendido (AlternativeChannelNote em estado de erro) nas 5 telas de ato restantes: `notificacoes/pages/sne.page.spec.ts`, `documentos/pages/cnh.page.spec.ts`, `atendimento/pages/manifestation-detail.page.spec.ts`, `privacidade/pages/own-data.page.spec.ts`, `exames/pages/junta-medica.page.spec.ts` — assertivas adicionadas aos testes de estado indisponível/erro já existentes.
- A12(i): busca confirmou que nenhum spec afirma `portal.services.pagamento` como título de débito — já correto (`portal.documents.clearance.debts`), nenhuma alteração necessária.

### Comando e saída literal (após `prettier --write` nos 4 arquivos que o `--check` sinalizou)

```
pnpm --filter @detran/portal-web typecheck
> tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit
(0 erros)

pnpm --filter @detran/portal-web lint
> eslint .
(0 erros)

pnpm --filter @detran/portal-web test
 Test Files  118 passed (118)
      Tests  1314 passed | 14 todo (1328)

prettier --check (48 arquivos de spec/testing tocados no par 3)
All matched files use Prettier code style!
```

`git diff --stat` confirma que nenhum arquivo de produção (`*.ts` fora de `*.spec.ts`/`testing/**`) foi tocado por mim nesta sessão — as modificações em `home.page.ts`, `realtime.service.ts`, `atendimento.facade.ts`, `catalogo.facade.ts`, `documentos.facade.ts`, `exames.facade.ts`, `notificacoes.facade.ts`, `sinistros.facade.ts`, `crash-detail.page.ts`, `clearance-status.component.ts`, `inicio.facade.ts` e `portal.pt-BR.json` são do Engineer (TASK-0018 iteração 2, paralela).

### Critérios de aceitação

| Item | Status |
|---|---|
| A12(a) offline real (`navigator.onLine` spy) | PASS (confirmado nas execuções anteriores à retomada) |
| A12(b) DOM C-3c-33/45/58 (T-17/T-21/T-27) | PASS |
| A12(b)/C-3c-112 estendido (8 telas de ato, estado de erro) | PASS |
| A12(c) C-3c-52 exaustivo (4 escopos) | PASS |
| A12(d) chave de summary desconhecida | PASS |
| A12(e) home: `defesa_previa`/`pagamento` → `/autos` | PASS |
| A12(f) 404 manifestation → `recurso=manifestation` | PASS |
| A12(h) `as any`/catches silenciosos removidos | PASS |
| A12(i) título de débitos | PASS (nenhuma ocorrência incorreta encontrada) |
| Complemento (1) heurística C-3c-78 | PASS |
| Complemento (2) home `pagamento`/`defesa_previa` | PASS (mesmo teste de A12(e)) |
| Complemento (3) `afterEach` crlv.page.spec.ts | PASS |
| `Test Files 0 failed`, `Tests 0 failed` | PASS — `118 passed (118)` / `1314 passed \| 14 todo (1328)` |

### Casos vermelhos classificados por dependência do Engineer

Nenhum. Todos os 118 arquivos/1314 testes passam; os 14 `it.todo` permanecem citando `OD-P54/P65/P87/P88/P15/P92/P91` (nenhum novo `skip`/`todo` sem `OD-*`).

### Defeitos reais de produção encontrados

Nenhum. Os 8 itens do achado A12 e os 3 do complemento eram, todos, defeitos ou lacunas de especificação de teste (spec desatualizado em relação ao contrato/à implementação real), nunca de produção — confirmado por leitura das fontes reais (`core/error-banner.component.ts`, `features/documentos/pages/crlv.page.ts`, `core/functional-route.ts`, `app.route-manifest.ts`, `core/error-boundary.ts`, `features/atendimento/atendimento.facade.ts`, `features/privacidade/privacidade.facade.ts`, `features/sinistros/pages/crash-detail.page.ts`, `shared/service-wizard.component.ts`) antes de cada correção.

### Propostas de OD

Nenhuma.

### Bloqueios

Nenhum.

### Observação sobre `pnpm check`

O `pnpm check` da raiz do monorepo cobre pacotes e portas totalmente fora do escopo desta rodada Inspector (backend, blueprints, contratos SENATRAN, RLS, decorators etc.), nenhum dos quais foi tocado nesta iteração. Segui o padrão já estabelecido e aceito nas iterações 1–3 deste mesmo TASK-0017: `typecheck`, `lint`, `test` e `prettier --check` com escopo em `@detran/portal-web`, todos verdes, conforme reportado acima. Se a coordenação exigir o `pnpm check` completo da raiz, sinalizo que isso envolve gates de outros papéis (Architect/Engineer de outras frentes) e recomendo rodá-lo como gate de fechamento do round, não por iteração de Inspector.
