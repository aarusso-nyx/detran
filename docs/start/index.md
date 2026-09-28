---
title: Start here
sidebar_position: 1
---

# DETRAN — start here

**DETRAN** is the private monorepo consolidating a Brazilian DETRAN software suite:
one unified NestJS modular-monolith backend organised domain-first around the national
traffic systems (`inf`/RENAINF, `est`/RENAEST, `ch`/RENACH, `ops` cross-domain;
`vam`/RENAVAM reserved), frontend apps only under `apps/` (TEAT, BOAT, RAIT, PORTAL,
DASHBOARD), the `senatran-mock` national-API mock and the `senatran-adapter` sole
integration boundary. DEVAI-governed (`@aarusso-nyx/devai@1.5.6`, Constitution
1.0.0) on the STYNX 1.4.0 platform substrate (Angular 22, ADR-0015).

## Status

The implementation backlog of campaign C-0001 is merged into `main`: WP-0 and WP-T0 (pre-method
round R-0001) and the governed rounds R-0003…R-0016, each closed with a DEVAI compliance closure
(PC-0001…PC-0014), built the work packages of the RAIT, TEAT, PORTAL, BOAT and DASHBOARD build
packs, within the scope each round recorded. Campaign C-0002 (consolidation, rounds R-0017…R-0032)
is in progress. Work-package state: `BUILD-PLAN.md`; round state: `work/rounds/README.md` (both at
the repository root). Binding architecture decisions: the [ADR index](../meta/adr/).
