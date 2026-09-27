# backend/domains/shared — Shared backend kit

Cross-domain building blocks: the policy kit (unified
`domain:resource:action` matrix), `@Resource`/`@Action`/`@Audit`/`@Public`
decorators, the global guard, role normalization and the request-path
`withTenantContext` transaction façade.

- Package name: `@detran/shared`; domain packages import this workspace package
  rather than using deep relative paths (ADR-0001).
- Role union (`DETRAN_ROLES` in `src/roles.ts`, 36 codes): PEC 15 + eight unique TEAT
  staff codes + RAIT 10 + DASHBOARD 2 + `CIDADAO`; TEAT `auditor` maps to PEC
  `AUDITOR` (ADR-0005).
- Keep this thin: anything platform-generic belongs in stynx, not here.
