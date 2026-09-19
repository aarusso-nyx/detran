Papel: Inspector

## Tarefa: TASK-0017 (iteração 2 — cobertura integral de `axe`/estado)

### Escopo desta iteração

Restrito ao pedido do coordenador: completar `expectA11yStateInvariants`/`axe` por **estado** (tabela §7.2 do contrato) nas 22 páginas do par 3 e nos 7 compartilhados (§5), mais specs mínimos para `junta-medica-form.component.ts` e `lgpd-request-form.component.ts` (§1 os lista como "passo 2 projetado no ServiceWizard"). Só `*.spec.ts` e `src/testing/**`; nenhum código de produção tocado; nenhum `git`; nenhum `pnpm install`. O Engineer (TASK-0018) avançou em paralelo durante esta iteração — `data/portal.client.ts` e `core/realtime.service.ts` já existem/mudaram no disco; não toquei em nenhum dos dois.

### Arquivos alterados/criados

**Alterados (22 páginas — estados acrescentados):** `features/notificacoes/pages/{inbox,preferences,sne}.page.spec.ts`; `features/documentos/pages/{cnh,vehicles,crlv}.page.spec.ts`; `features/sinistros/pages/{crash-list,crash-detail}.page.spec.ts`; `features/exames/pages/{exam-list,junta-medica}.page.spec.ts`; `features/atendimento/pages/{manifestation-new,manifestation-detail,evaluation}.page.spec.ts`; `features/privacidade/pages/own-data.page.spec.ts`; `features/assinatura/pages/elevation.page.spec.ts`; `features/catalogo/pages/{service-charter,points-explainer}.page.spec.ts`; `core/pages/{inicio,conta,acessibilidade,home}.page.spec.ts`.

**Alterados (7 compartilhados):** `shared/{notification-list,sne-consent,digital-document-card,clearance-status,own-data-panel,manifestation-form,evaluation-form}.component.spec.ts`.

**Novos:** `features/exames/components/junta-medica-form.component.spec.ts`, `features/privacidade/components/lgpd-request-form.component.spec.ts`.

### Matriz página × estados cobertos (§7.2; sem lacuna declarada)

| Página | Estados com `expectA11yStateInvariants`/`axe` |
|---|---|
| T-12 inbox | loading, ready, empty, error, unavailable, offline, degradado (tempo real) |
| /notificacoes/preferencias | inicial (banner), push subscribed, push denied, push error |
| T-09 sne | loading, não aderido, aderido, ineligible, error_recoverable, unavailable, forbidden |
| T-16 cnh | loading, ready, empty, nao_valida, pendencia, unavailable, offline |
| /veiculos | loading, ready, empty, error, unavailable, offline |
| T-17 crlv | loading, ready, pendencia (débito), restrição, unavailable, offline |
| T-18 crash-list | loading, ready, empty, unavailable, offline |
| T-19 crash-detail | carregando, ready (com/sem supressão), sem_permissao, erro_recuperavel, indisponivel, offline |
| T-20 exam-list | carregando, ready, vazio, erro_recuperavel, indisponivel, offline |
| /exames/:examId/junta/nova | composição (delega os 9 estados do `ServiceWizard` já cobertos em `shared/service-wizard.component.spec.ts`, congelado — §6 "estados: os do wizard"), indisponível de domínio (BOARD_REQUEST_WINDOW_CLOSED) |
| T-21 manifestation-new | idle, erro_recuperavel, indisponivel, sucesso |
| T-22 manifestation-detail | carregando, ready (ENCERRADA), ready (CIENCIA_AO_USUARIO), sem_permissao, indisponivel |
| T-26 evaluation | carregando, ready, sem_permissao, indisponivel, sem_elegibilidade, erro_recuperavel, sucesso |
| T-24 own-data | carregando, has_data, no_data, partial, sem_elegibilidade (403), sem_permissao (422), indisponivel |
| T-27 elevation | idle, carregando (starting), erro_recuperavel, indisponivel |
| T-25 carta (lista+detalhe) | carregando, ready (lista), erro_recuperavel, indisponivel, offline, ready (detalhe), indisponível (detalhe), sem_permissao (detalhe) |
| T-15 points-explainer | estático (única linha do §6 — "sem loading/erro") |
| /inicio | loading, empty, error, offline |
| /conta | loading, ready, error, offline |
| /acessibilidade | estático |
| / (home) | loading, ready, error, offline |

7 compartilhados: cada um ganhou o(s) estado(s) que faltava(m) do seu próprio §5 (SneConsent: `enrollment` null/carregando; DigitalDocumentCard: categoria A sem QR, `source`, `fields[]`; ClearanceStatus: `blocked` presente; OwnDataPanel: `suppressedNoticeKey`; ManifestationForm: `sessionActive` false) — os demais já estavam cobertos na primeira entrega.

### Comandos executados e saída resumida

1. `pnpm --filter @detran/portal-web typecheck` → **0 erros fora do sancionado**: 45 `TS2307 Cannot find module`, um por arquivo do §1 ainda ausente (inclui os dois componentes novos); corrigi 2 erros reais que introduzi (`routeNativeElement` após o refactor de `mount()` em `elevation.page.spec.ts`; `req.flush(undefined)` em `service-charter.page.spec.ts`) — ambos já resolvidos, confirmados numa nova rodada limpa.
2. `pnpm --filter @detran/portal-web test` → **Test Files 42 failed | 76 passed (118)** / **Tests 5 failed | 990 passed | 14 todo (1009)**. Os 74 arquivos/972+7 testes anteriores continuam verdes. As 5 falhas discretas são todas em `home.page.spec.ts` (alvo "altera", ainda sem o catálogo real — esperado). `portal.client.pair3.spec.ts` e `static-analysis.pair3.spec.ts` passam integralmente agora (o Engineer já implementou os 13 métodos novos de `PortalClient` em paralelo). As 42 falhas de arquivo inteiro são todas `Failed to resolve import` dos módulos do §1 ainda ausentes — nunca sintaxe/setup.
3. `node_modules/.bin/prettier --check <48 arquivos meus>` → **OK**.
4. `pnpm format:check` (monorepo inteiro) → 2 avisos, ambos em arquivos do Engineer fora da minha fronteira (`core/realtime.service.ts`, `data/portal.client.ts` — não toquei, reporto sem corrigir).

### Critérios de aceitação

- `typecheck` só com `Cannot find module` dos módulos do §1: **PASS**.
- `pnpm --filter @detran/portal-web test` → os 972+7 anteriores verdes: **PASS**.
- `pnpm format:check`: **PASS** no meu escopo (os 2 avisos são do Engineer, fora da minha fronteira — sinalizados, não corrigidos).
- Cobertura por estado sem lacuna declarada: **PASS** — matriz acima cobre as 22 páginas e os 7 compartilhados; as únicas reduções de escopo (T-15/`/acessibilidade` com 1 estado, junta médica delegando ao `ServiceWizard`) são justificadas por texto literal do próprio contrato (§6), não por corte de cobertura.

### Fora do escopo / deixado

- T-27: a fase "completing" (retorno do gov.br) e o estado `sufficient` (retomada imediata, sem DOM estável) permanecem `it.todo`/fora, pois dependem de nomes de parâmetro de URL que são `source_pending` (OD-P15, já com `it.todo` citado em `static-analysis.pair3.spec.ts`).
- Os specs de `junta-medica-form`/`lgpd-request-form` assumem a API real e já congelada de `features/defesa/components/defesa-previa-form.component.ts` (`model('values')`, `fields`, `disabled`) — documentado no cabeçalho de cada arquivo; se o Engineer usar uma API diferente, o typecheck vai sinalizar e não será mais só `Cannot find module`.

### OD tocadas ou propostas

Nenhuma nova.

### Bloqueios

Nenhum.

Arquivos relevantes (todos sob `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac/apps/portal/web/src/app/`): as 22 specs de página listadas acima, os 7 `shared/*.component.spec.ts`, e os 2 novos `features/exames/components/junta-medica-form.component.spec.ts` e `features/privacidade/components/lgpd-request-form.component.spec.ts`.
