# apps/teat/mobile — TEAT field-agent mobile app (UI and workflow homologation build)

Angular/Capacitor mobile app (`@detran/teat-mobile`) for field agents (offline-first AIT
issuance), re-hosted from the teat repository onto the unified backend and
@stynx-nyx/mobile-runtime. It is the field shell that mounts the BOAT extension
(`@detran/boat-mobile`, `createBoatExtension` in `src/main.ts`).

Delivered in R-0013 (WP-T6; PR #113, merge `646c6c28`; closure PC-0013) as a **UI and workflow
homologation build** (ADR-0033): synthetic, segregated demonstration data; the production path
stays fail-closed. The production mobile app is a later dedicated round, tracked in issues
#108–#112.

Scripts: `pnpm --filter @detran/teat-mobile build`, `test`, `test:focal`, `lint`, `typecheck`.

Especificação do frontend, contrato de rotas, erros e pacote de construção: `docs/framework/arch/teat-frontends.md`, `teat-route-contract.md`, `teat-error-catalog.md`, `teat-build-pack.md` (2026-09-13).
