# Architecture

Stub — Phase 2 (W2.1) documents the composition root, adapter kernel, runtime
profiles, policy matrix and tenancy enforcement here.

- [apps/rait/web — especificação do frontend](./rait-web-frontend.md) (2026-09-12, draft).
- [apps/rait/web — diagramas de módulos, rotas e componentes](./rait-web-structure-diagrams.md) (2026-09-12, draft; SVGs em `./diagrams/`).
- [apps/rait/web — jornadas por papel com diagramas](./rait-web-journeys/README.md) (2026-09-12, draft).
- [RAIT — catálogo de erros](./rait-error-catalog.md) (2026-09-12, draft).
- [RAIT — pacote de construção para a orquestra de agentes](./rait-build-pack.md) (2026-09-12, draft; WP-0…WP-F).
- Questões pendentes de decisão (Owner, regimentos JARI/CETRAN, LEGAL): `docs/meta/knowledge-base/open-decisions-rait.md`.
- Suporte à orquestra (2026-09-13): [manuais dos agentes](../../meta/agents/README.md) · [estratégia de testes](./rait-test-strategy.md) · [fixtures canônicas](./rait-fixtures.md) (`backend/database/seed/`) · [motor de prazos](./rait-deadline-engine.md) · [eventos e SSE](./rait-events-sse-contract.md) · [guia do kit @detran/ui](./detran-ui-guide.md) · [glossário i18n](./rait-i18n-glossary.md) (`./i18n/rait.pt-BR.json`) · [roteiro WP-0](./wp0-stynx-1-3-1-migration.md) · `CODESTYLE.md` e `.github/pull_request_template.md` na raiz.
- TEAT (2026-09-13): [frontends mobile e web](./teat-frontends.md) · [contrato de rotas](./teat-route-contract.md) · [catálogo de erros](./teat-error-catalog.md) · [pacote de construção](./teat-build-pack.md).
- PORTAL (2026-09-13): [frontend PWA](./portal-frontends.md) · [contrato de rotas](./portal-route-contract.md) · [catálogo de erros](./portal-error-catalog.md) · [pacote de construção](./portal-build-pack.md).
- BOAT (2026-09-13): [frontends de sinistro](./boat-frontends.md) · [contrato de rotas](./boat-route-contract.md) · [catálogo de erros](./boat-error-catalog.md) · [pacote de construção](./boat-build-pack.md).
- DASHBOARD (2026-09-13): [frontend de monitoramento](./dashboard-frontends.md) · [contrato de rotas](./dashboard-route-contract.md) · [catálogo de erros](./dashboard-error-catalog.md) · [pacote de construção](./dashboard-build-pack.md).
- Portão de implementação (2026-09-13): [pontos de atenção e decisões abertas](../../meta/knowledge-base/implementation-gate-2026-09-13.md).
- Fechamento de decisões (2026-09-13): [plano em três vias](../../meta/knowledge-base/decision-closure-plan.md) · [catálogo de parâmetros e flags](./parameter-catalogue.md) (ADR-0021) · [cédulas do Owner](../../meta/knowledge-base/owner-ballots/README.md).
