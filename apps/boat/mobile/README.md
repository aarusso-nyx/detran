# apps/boat/mobile — BOAT field extension (`@detran/boat-mobile`)

BOAT — Boletim de Acidentalidade de Trânsito (`docs/framework/product/domains/est/boat/APP.md`):
crash-record (sinistro) capture feeding `backend/domains/est` (RENAEST).

This package is an Angular library built with ng-packagr (`ng-package.json`; script `build`), not
a standalone Capacitor app: the TEAT field shell (`apps/teat/mobile`) mounts it through
`createBoatExtension` and `BOAT_PT_BR_CATALOG`.

Delivered in R-0015 (WP-B4 and WP-B5; PRs #107 and #116, merge `50626da5`; closure PC-0014).
Real hardware, field release and real RENAEST/SNE/gov.br homologation remain out of scope
(`docs/meta/agents/orchestra/waves.md`, history row R-0015).

Scripts: `pnpm --filter @detran/boat-mobile build`, `test`, `lint`, `typecheck`.

Especificação do frontend, contrato de rotas, erros e pacote de construção: `docs/framework/arch/boat-frontends.md`, `boat-route-contract.md`, `boat-error-catalog.md`, `boat-build-pack.md` (2026-09-13).
