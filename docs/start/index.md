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
integration boundary. DEVAI-governed (`@aarusso-nyx/devai@1.4.5`, Constitution
1.0.0) on the STYNX 1.3.1 platform substrate (Angular 22, ADR-0013).

## Status

Phase 0 skeleton: workspace layout, governance root, founding ADRs and staged CI.
Consolidation and app build-out proceed per the phase plan; see the
[founding ADRs](../meta/adr/) for the binding architecture decisions.
