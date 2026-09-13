# DETRAN

Private monorepo consolidating the DETRAN software suite: the former `pec`, `teat` and
`senatran` repositories, plus four new applications (RAIT, PORTAL, BOAT, DASHBOARD),
built on the **STYNX** platform (`@stynx-nyx/*`; target 1.3.1 / Angular 22 per ADR-0015, pins at 1.1.1 until WP-0 merges) and governed by **DEVAI**
(`@aarusso-nyx/devai@1.4.5`, Constitution 1.0.0).

One unified NestJS **modular-monolith backend** (single deployable, one PostgreSQL with
schema-per-domain + RLS), `apps/` holding **frontends only**, and a single
**senatran-adapter** as the sole boundary to the national SENATRAN API
(`SENATRAN_PROVIDER=mock|real`).

## Domain map

Domains follow the national traffic systems:

| Domain | National system | Scope                                                                                  |
| ------ | --------------- | -------------------------------------------------------------------------------------- |
| `inf`  | RENAINF         | Infrações — AIT lifecycle, defesas, penalidades, recursos, julgamento (JARI)           |
| `est`  | RENAEST         | Sinistros — crash records and analytics                                                |
| `ch`   | RENACH          | Condutor/habilitação (the former pec domains)                                          |
| `vam`  | RENAVAM         | **Reserved — not built**                                                               |
| `ops`  | —               | Cross-domain field operations: agents, devices, shifts, evidence custody, offline sync |

Transversal elements: `portal` and `dashboard` backend domains, `senatran-mock`
(the ported national-API mock) and `packages/senatran-adapter`.

## Layout

```
backend/            # THE unified backend: app/ (composition root), domains/, database/ddl/
apps/               # frontends only: teat, boat, rait, portal, dashboard (+ pec slot, reserved)
packages/           # senatran-adapter, ui
senatran-mock/      # ported national-API mock (D-0001 standalone exception)
tools/  docs/  .devai/  .github/
```

## Getting started

```sh
export NODE_AUTH_TOKEN="$(gh auth token)"   # GitHub Packages auth (@stynx-nyx, @aarusso-nyx)
pnpm install
pnpm check
```

## Documentation

- [docs/](docs/README.md) — seven-section docs IA (start, theory, framework, roles, adopters, reference, meta)
- [Founding ADRs](docs/meta/adr/) — domain-first layout, modular monolith, senatran-adapter boundary, migration policy
- [AGENTS.md](AGENTS.md) — rules for agents working in this repository
