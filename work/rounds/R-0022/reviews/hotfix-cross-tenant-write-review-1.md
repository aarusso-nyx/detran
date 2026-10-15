# Delivery-review — hotfix B6 (gravações entre tenants antes da validação de _membership_)

> Reviewer da família oposta (Codex Sol 6). Papel: **Auditor** (Art. 18), somente leitura na worktree
> `/private/tmp/claude-501/-Users-aarusso-Development-detran--claude-worktrees-r-0022-stynx-sse-tenancy-c949d9/b1c1803b-45c2-401e-9bf3-6408f6685798/scratchpad/wtb6` (branch `fix/boat-victim-audit-tenant`, a partir de `main` `70664353`).
> Responda **apenas** com JSON: {"mode":"delivery-review","scope":"hotfix-cross-tenant-write","verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low","file":"…","line":1,"claim":"…","fix":"…"}],"notes":["…"]}

Decisão do Owner (DETRAN R-0022 `AUTHORIZATION.md` Adenda B13, OD-R22-58 (a)): hotfix próprio contra
`main`, tríade, varredura, revisão da outra família. Revise `git diff 70664353..HEAD` (teste vermelho
`95eb5e94`, correção no HEAD).

Defeito: `BoatVictimPurposeInterceptor` gravava a auditoria `EST_CRASH_VICTIM_READ` e o store DETRAN do
`RateLimitGuard` gravava `integration.rate_limit_windows` no tenant do claim/cabeçalho **antes** da
validação de _membership_ da tenancy. Correção: `DetranTenantMembershipVerifier` (predicado de
_membership_ ativa igual ao da tenancy 1.4.0, papel `app` sob RLS no contexto do tenant pedido) antes das
duas gravações; sem _membership_ → 403 `TENANT_ACCESS_DENIED` e nenhuma linha; rotas públicas do Portal
(`request.portalPublic`, ator nominal OD-P27) isentas.

Evidência do worker: spec novo 3 vermelhos → 10/10; tier e2e completo 40 arquivos / 1700 aprovados;
integration 34; app unit 135; rls-smoke, verify:decorators, typecheck e `pnpm check` OK.

Rubrica, com atenção especial:

1. A isenção `portalPublic` só funciona se o contexto de decisão do rate limit recebido por
   `consume`/`runBound` carregar `request`; confira no `.d.ts`/`.js` publicado do `RateLimitGuard`
   (1.4.0 instalado nesta worktree) se `request` chega ao store — se não chegar, a manifestação pública
   anônima (OD-P30, nunca 401/403) pode passar a receber 403. Aponte a evidência.
2. A consulta de _membership_ sob RLS no contexto do tenant pedido devolve a linha do próprio usuário
   quando ele é membro (confira as políticas de `auth.memberships`/`tenancy.tenants` na DDL).
3. Nenhum membro escapa do limite; comportamento de membros inalterado; fail-closed.
4. O teste prova o defeito pelo motivo certo; nenhuma mudança alheia; nenhum código STYNX copiado além
   do predicado SQL declarado.
