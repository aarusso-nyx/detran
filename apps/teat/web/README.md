# apps/teat/web — TEAT staff webapp (UI and workflow homologation build)

Angular web console (`@detran/teat-web`) for electronic traffic-citation operations (AIT issuance
and lifecycle), re-hosted from the teat repository onto the unified backend. Frontends only live
under apps/ (ADR-0001).

Delivered in R-0013 (WP-T6; PR #113, merge `646c6c28`; closure PC-0013) as a **UI and workflow
homologation build** (ADR-0033): synthetic, segregated demonstration data; no production
operation.

Scripts: `pnpm --filter @detran/teat-web build`, `test`, `lint`, `typecheck`.

Especificação do frontend, contrato de rotas, erros e pacote de construção: `docs/framework/arch/teat-frontends.md`, `teat-route-contract.md`, `teat-error-catalog.md`, `teat-build-pack.md` (2026-09-13).
