# ADR-0004: Migration Policy — Fresh Layout, Module-by-Module Port, Origin Freeze

## Status

Accepted (owner-confirmed Decisions Ledger, 2026-08-23).

## Context

Three mature repos (pec, teat, senatran) must converge into detran without a
big-bang rewrite and without a long twilight of double maintenance. A git-history
import (subtree/filter-repo) would carry the origin repos' app-shaped layout,
duplicated infrastructure and known debt (teat's bypassed RLS, in-memory fallbacks,
13 drifted generated copies; pec's in-memory audit sink) into the new repo wholesale,
defeating the point of the domain-first layout (ADR-0001) and the unified kernel
(ADR-0002). Meanwhile the origin repos are live and cannot simply stop.

## Decision

- **Fresh clean layout**: detran starts from this scaffold; code is **ported
  module-by-module** into the target layout, with no git-history import. Origin
  history remains permanently available in the archived origin repos.
- **Port order follows the phase plan**: senatran → `senatran-mock` (Phase 0),
  foundation + ops (Phase 2), teat's infraction domains → `inf` (Phase 3), crash →
  `est` (Phase 5), pec's 29 domains → `ch` (Phase 6, largest port, lowest coupling —
  hence last). pec runs from its own repo until its port.
- **Origin freeze on merge**: the moment a module's detran port merges, that module
  is frozen at origin — no further feature work or fixes land in the origin copy.
- **Parity before freeze is trusted**: each ported module carries a parity
  checklist (endpoints, DDL, tests) signed off before its origin freeze is relied
  upon; ports adopt the unified kernel rather than carrying origin infrastructure
  (ADR-0002).
- **Archive at parity**: when a repo's last module reaches parity, the origin repo
  is archived (pec, teat, senatran). senatran gives up its public-repo perks —
  accepted by the owner.

## Consequences

- No double maintenance beyond the port window of each individual module, and no
  divergence risk after it: the freeze is per-module and immediate.
- Bug reports against a frozen origin module are fixed in detran only; origin
  repos degrade to read-only reference until archived.
- Loss of in-repo history is deliberate; archaeology happens in the archived
  origin repos, and each port PR references its origin paths.
- Porting is incremental and gate-checked per module (Orchestration rule: gates
  are law), so a failed port blocks only its module, not the phase.
- The suite is fully consolidated only at Phase 6 closeout; until then the
  portfolio intentionally runs split, with detran authoritative for every ported
  module.
