# Autorização direta — R-0025 `rait-web-wiring`

**Papel decisor:** Owner. **Recebimento local nesta sessão:** 2026-09-29
(America/Sao_Paulo). A fonte textual da adenda A-C2-15 em
`work/campaigns/C-0002-consolidacao.md` é datada de 2026-09-30; essa data é
registrada como proveniência do texto, sem afirmar que já ocorreu no relógio local.

O prompt direto da Sessão A autorizou o pré-trabalho da R-0025 nos limites da
A-C2-15: TASK-0001, TASK-0002, TASK-0003 e TASK-0006, somente análise e contratos.
A branch parte de `origin/main`; há um prompt-review restrito às tarefas liberadas,
comandos de aceitação por tarefa, push sem PR e checkpoint. TASK-0004/0005/0007/0008
esperam R-0022/R-0023; TASK-0009 em diante esperam R-0024. Os contratos desta
sessão serão reconferidos contra `origin/main` na retomada, com adenda numerada se
houver divergência.

Maestro e workers: Codex Sol 6 e escada Codex. Reviewer: Claude Code Opus 5.5
pela ponte `tools/orchestra/bridge.sh claude`.

## Adenda A-C3-01 — retomada e primeiro recorte (Owner, 2026-10-18)

Fonte: mensagem expressa do Owner na sessão de continuação, texto literal:

> Resume R-0025 from orchestra/rait-web-wiring, reconcile it with current main, apply A-C3-01, and start with JW-01. Refresh stale planning records, preserve existing local changes, run the required checks, and open a PR.

Diante da divergência documentada entre claim-next e admissibilidade, o maestro
perguntou sobre iniciar pelo caso protocolado → triagem → checklist → admitir/rejeitar,
deixando claim e instrução para depois. Resposta literal do Owner:

> Proceed with the admissibility slice (recommended)

Autoriza o primeiro PR limitado de admissibilidade, reconciliação, checks e revisão.
Não autoriza merge/close/seal. Não reduz a aceitação integral da R-0025 nem declara
JW-01 completa. As quatro tarefas da Sessão A permanecem completed/históricas.
O restante dos 64 comandos, F-02/instrução, claim, minuta e jornadas posteriores
permanece no plano integral, sem PASS por ausência de execução.

A-C3-01 aplica C-0003 §4/A-C2-16: main e padrão v0 entregues pela R-0033 substituem
espera obrigatória por R-0022/23/24. R-0022 continua parada; não é retomada nem
fundida integralmente. Costuras e limites atuais estão no adendo do plano e no
contrato `contracts/JW01-admissibility.md`. Maestro família Codex, reviewer Claude
via alias CLI `opus`; sem inferência de modelo exato a partir do alias.

## Adenda pós-merge PR #193 — Owner, 2026-10-18

Autorização direta subsequente, literal:

> Check CI on PR #193, fix any failures, and merge it once all required checks are green.

Os checks requeridos passaram e o merge foi executado em
`e68266a0c83143fa099c37b0b3e5444e7bbb0484`. A restrição prévia de merge foi
superada exclusivamente para esse PR. Em seguida, literal do Owner:

> Complete the post-merge evidence and audit for PR #193, refresh R-0025’s planning records, and recommend the next JW-01 slice. Keep the broader round open and preserve existing local changes.

Autoriza observação exata, evidência parcial e atualização documental por PR;
não autoriza close/seal, declaração de aceitação integral ou implementação da
próxima fatia recomendada. As limitações e decisões pendentes continuam abertas.

## Adenda pós-merge PR200 — Owner, 2026-10-19

Mensagem direta: “Complete the post-merge evidence and audit for PR #200, then
present the exact next P4-02 implementation slice for approval. Keep runtime
paused and preserve local and scorecard work.”

Autoriza observação exata não-promotora, evidência parcial por verbo e preparação
documental por PR. P4-02-S1 permanece proposta: nenhum dispatch Inspector/Engineer,
merge deste follow-up, fechamento de rodada ou implementação runtime está liberado.
D1–D11 e o design integrado por PR200 permanecem aprovados; não são reabertos.

## P4-02-S1 execution authorization — Owner, 2026-10-19

status: active
GRANTED for P4-02-S1 only, per direct Owner message:

> I approve P4-02-S1 as written. Check CI on PR #201, fix any failures, and merge once required checks are green. Then execute the approved slice, preserving local and scorecard work.

PR201 merged as a006b039 with all required checks PASS. Only the S1 Architect →
Inspector RED → Engineer → Inspector GREEN/review implementation-PR sequence is
active. Historical queued tasks and S2 remain unapproved for dispatch; no merge,
release, production provisioning, close/seal or scorecard modification authorized.

### Bounded S1 loader extension — Owner, 2026-10-19

Owner answer: “Approve the bounded apply.sh extension”. Adds only
backend/database/apply.sh ownership for the exact loader dependency described in
reports/P4-02-S1-architect-checkpoint.md: closed manual inventory, early sorted-pass
exclusion and transactional post-pass load of19-rait-case-scope-enforce.sql before
final priority verification. Supporting scoped-binding DDL was already authorized.
All existing guards remain; no script/generator logic outside these insertions,
new grant/production data, legal guard or S2 implementation is authorized.

### P4-02-S1-A2 frontend compatibility — Owner, 2026-10-19

Owner answered “Approve A2 as written (recommended)” to the concrete42-file
compatibility packet reports/P4-02-S1-A2-frontend-compatibility.md. Authorizes
25 read-type and17 omission-aware existing-consumer changes, with Inspector-only
colocated tests, preserving T0 exclusions. Explicit temporary unavailable batch
position/deadline/acceptance and pending missing-item details on the three named
views are approved; they are not functional parity or permission to mark those
journeys complete. Typed restoration remains required before their completion.
No new screen/command/private-field grant, risk/claim activation or S2 work.

### Bounded S1 identity validation extension — Owner, 2026-10-19

Owner answered “Approve the bounded identity validation extension” to the exact
request covering `backend/app/src/detran-runtime.ts` and Inspector-owned tests.
The tenant membership verifier must reject noncanonical actor IDs before its UUID
SQL cast using the existing `403 TENANT_ACCESS_DENIED` response. Valid membership
behavior is preserved. This fixes raw external OIDC subjects causing HTTP500 before
S1 handlers. Engineer owns only this additional runtime path; Inspector owns its
focused tests. No tenant permission, identity mapping, fallback principal, S2 work
or wider authentication redesign is authorized.

### P4-02-S1-A3 replay provenance — Owner, 2026-10-19

Owner answered “Approve A3 as written (recommended)” to
reports/P4-02-S1-A3-replay-provenance.md. Authorizes its exact additional
Architect ADR/index paths and Inspector checks, and the bounded internal audit
receipt for actor-unbound command replay. Preserve canonical fingerprints, bind
to the exact ledger UUID in the same transaction and deny missing/ambiguous or
other-actor provenance with409 without disclosure/re-execution. No schema, public
field, permission, historical rewrite, production migration, S2 or merge grant.

### P4-02-S1-A4 preview source tests — Owner, 2026-10-19

Owner answered “Approve A4 as written (recommended)” to
reports/P4-02-S1-A4-preview-source-tests.md. Adds Inspector ownership only of
apps/rait/web/src/app/preview/preview-fixture-source.spec.ts. Preserve complete
canonical fixture integrity through the existing store/helper; assert exact
authorized client subsets and denials under closed T0 instead of unconditional
all-row analyst access. No runtime, fixture JSON, role grant, threshold, skip/TODO,
scorecard, S2 or merge authority follows. All other S1 boundaries remain.

### P4-02-S1-A5 contract-operation census — Owner, 2026-10-19

Owner answered “Approve A5 as written (recommended)” to
reports/P4-02-S1-A5-contract-operation-census.md. Adds Inspector ownership only
of tools/contracts/tests/check-commands.test.mjs for the exact fixed census
258→329 (71 approved scoped replacements), explanatory comment and test title.
All route/error, TEAT100 and malformed-input assertions remain. No runtime,
contract, generator, threshold, scorecard, S2 or merge authority is added.
