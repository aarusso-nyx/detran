Papel: Inspector

Tarefa: TASK-0008 (iteração 3 — C-3a-99/C-3a-100 do contrato §9, cobrança do `delivery-review-CTG-0003a.json` item 11)

## Leitura desta iteração

`work/rounds/R-0014/reviews/delivery-review-CTG-0003a.json` (finding único, severity high, item 11); `work/rounds/R-0014/contracts/CTG-0003a.md` §8 (tabela de estados) e §9 (C-3a-99/100); código de produção dos 11 componentes `shared/*.component.ts` (para não inventar estado que o componente não expõe).

## Arquivos alterados (só `*.spec.ts` e `src/testing/**`; nenhum `git`, nenhum install, nenhum código de produção)

- `shared/citizen-status-badge.component.spec.ts` — já cobria axe nas 5 situações (iteração 2); sem alteração.
- `shared/deadline-card.component.spec.ts` — `describe` a11y novo, 4 combinações (`ownedBy` × `daysLeft`).
- `shared/action-triplet.component.spec.ts` — `describe` a11y (estado com ação indisponível) + `describe` de ordem de tabulação (C-3a-100).
- `shared/prefilled-field.component.spec.ts` — `describe` a11y, 3 estados (valor, vazio, corrigível).
- `shared/attachment-uploader.component.spec.ts` — `describe` a11y, 4 estados (vazio, rejected, done, unavailable) — **3 falham por defeito real**.
- `shared/consequence-dialog.component.spec.ts` — `describe` a11y (3 estados) + `describe` de ciclo de Tab (C-3a-100: Shift+Tab do primeiro ao último, Tab do último ao primeiro, Escape).
- `shared/signature-step.component.spec.ts` — `describe` a11y, 5 estados (insuficiente, suficiente, upload escolhido, none, qualificada) — **1 falha por defeito real** (propagação do mesmo defeito do uploader).
- `shared/protocol-receipt.component.spec.ts` — `describe` a11y, 3 estados (sucesso, falha de download, com badge).
- `shared/alternative-channel-note.component.spec.ts` — `describe` a11y, 2 estados (disponível, neutra).
- `shared/assurance-explainer.component.spec.ts` — `describe` a11y, 1 estado adicional (`sem_elegibilidade`; o estado com métodos já tinha axe desde a iteração 2).
- `shared/service-wizard.component.spec.ts` — `describe` a11y, 8 estados (idle, carregando, inelegível, indisponível, banner de erro, composição, assinatura, protocolo/sucesso, offline); também ganhou `provideRouter` no `setup()` (gap de infraestrutura de teste — `PortalErrorBannerComponent` usa `routerLink`, exigia `Router`).

## Comandos executados e saída resumida

- `pnpm --filter @detran/portal-web typecheck` → 0 erros.
- `pnpm --filter @detran/portal-web lint` → 0 erros.
- `pnpm --filter @detran/portal-web test` → `Test Files 2 failed | 48 passed (50)` / `Tests 4 failed | 707 passed | 3 todo (714)`.
- `pnpm format:check` → `All matched files use Prettier code style!`.

## Critérios de aceitação

- `typecheck && lint` 0 erros: **PASS**.
- `test` → 0 failed: **FAIL** — 4 casos vermelhos, todos pelo mesmo defeito real de implementação (não de spec), reportado abaixo sem acomodação, conforme instruído.
- `format:check` OK: **PASS**.

## Defeito real encontrado — `AttachmentUploaderComponent` (não acomodado)

**Componente:** `apps/portal/web/src/app/shared/attachment-uploader.component.ts`.
**Elemento:** `<input type="file" multiple [accept]="acceptAttribute()" [attr.aria-describedby]="hintId()" ...>` (linhas 68-75).
**Estados afetados:** vazio (sem entradas), com entrada `rejected`, com entrada `done` — qualquer estado em que o `<input type="file">` é renderizado (o estado `unavailable` NÃO é afetado, porque nesse estado o `<input>` some, substituído pelo banner de erro).
**Violações axe:** `label` (critical) e `label-title-only` (serious).
**Causa:** o input só tem `aria-describedby` apontando para o texto de dica (`hintKey()`), que é uma *descrição* suplementar — não um *nome* acessível. Nenhum `<label for>`, `aria-label` ou `aria-labelledby` associa um nome ao campo.
**Correção sugerida (fora da minha fronteira):** associar um `<label>` (visível ou `sr-only`) ou `aria-label`/`aria-labelledby` ao `<input>`, além do `aria-describedby` já presente.
**Propagação:** o mesmo defeito aparece em `SignatureStepComponent` quando o cidadão escolhe o método `upload` (embute `<portal-attachment-uploader>`) — é o mesmo defeito de origem, não um segundo defeito.

**Testes deixados vermelhos, de propósito, para documentar isso:**
- `attachment-uploader.component.spec.ts` › `AttachmentUploaderComponent — a11y (C-3a-99)` › "dado o estado inicial (sem entradas)…"
- `attachment-uploader.component.spec.ts` › mesmo describe › "dado uma entrada rejected…"
- `attachment-uploader.component.spec.ts` › mesmo describe › "dado uma entrada done…"
- `signature-step.component.spec.ts` › `SignatureStepComponent — a11y (C-3a-99)` › "dado o caminho upload escolhido…"

## Matriz C-3a-99/100 → spec → caso

| Critério | Componente | Spec | Estados/casos cobertos |
|---|---|---|---|
| C-3a-99 | CitizenStatusBadge | `citizen-status-badge.component.spec.ts` | 5 situações (já na iteração 2) |
| C-3a-99 | DeadlineCard | `deadline-card.component.spec.ts` | citizen×∅, agency×∅, citizen×7, agency×3 |
| C-3a-99 | ActionTriplet | `action-triplet.component.spec.ts` | 3 disponíveis (iteração 2) + 1 indisponível (nova) |
| C-3a-99 | ServiceWizard | `service-wizard.component.spec.ts` | idle, loading, ineligible, unavailable, banner de erro, composição, assinatura, protocolo/sucesso, offline (9 casos) |
| C-3a-99 | PrefilledField | `prefilled-field.component.spec.ts` | valor, vazio, corrigível |
| C-3a-99 | AttachmentUploader | `attachment-uploader.component.spec.ts` | vazio*, rejected*, done*, unavailable (*3 vermelhos — defeito real) |
| C-3a-99 | ConsequenceDialog | `consequence-dialog.component.spec.ts` | aberto sem marcar, aberto marcado, `efeitos_sne` |
| C-3a-99 | SignatureStep | `signature-step.component.spec.ts` | insuficiente, suficiente, upload escolhido*, none, qualificada (*1 vermelho — defeito propagado) |
| C-3a-99 | ProtocolReceipt | `protocol-receipt.component.spec.ts` | sucesso, download falho, com badge |
| C-3a-99 | AlternativeChannelNote | `alternative-channel-note.component.spec.ts` | disponível, neutra |
| C-3a-99 | AssuranceExplainer | `assurance-explainer.component.spec.ts` | métodos presentes (iteração 2) + `sem_elegibilidade` (novo) |
| C-3a-100 | ConsequenceDialog | `consequence-dialog.component.spec.ts` | Shift+Tab do primeiro (checkbox) → último (cancelar); Tab do último (confirmar) → primeiro (checkbox); Escape com foco dentro → `cancelled` + foco devolvido ao disparador |
| C-3a-100 | ActionTriplet | `action-triplet.component.spec.ts` | ordem DOM/foco defend·indicate·pay (disponível e indisponível), todos alcançáveis via `.focus()`, nenhum com `tabindex="-1"` |

## Fora do escopo / deixado

- Não toquei em `attachment-uploader.component.ts` nem em nenhum outro arquivo de produção — o defeito acima permanece sem correção, como instruído ("não acomode").
- Os três `it.todo` restantes (OD-P54, OD-P59, OD-P60) continuam intocados — não fazem parte desta iteração.

## OD tocadas ou propostas

Nenhuma nova. As três `it.todo` citadas acima continuam vinculadas às OD já registradas.

## Bloqueios

Nenhum bloqueio meu. O caso do `AttachmentUploaderComponent`/`SignatureStepComponent` é bloqueio de implementação (acessibilidade), não meu, e está relatado acima com componente, estado e violação para a próxima iteração da Engineer.
