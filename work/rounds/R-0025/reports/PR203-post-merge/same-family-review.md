# Bounded same-family source/Inspector review

Read-only external agents p402_sources and s1_regression_inspector inspected the
proposed S2 packet and actual baseline sources. This does not substitute for the
cross-family bridge review and is not S2 dispatch or executed test evidence.

Findings corrected before final review:

1. ADR0037 excludes legal_priority=NULL, not protocolled_at=NULL. Retain the
   approved protocolled_at/id deterministic tie-breaker without invented eligibility.
2. The proposed pure-risk spec must live under tests/unit/ to be discovered by
   the existing deadlines Vitest configuration. The exact packet normalizes that
   path without a runner/config change.
3. Adding the legacy qualification table requires explicitly owned AIT RLS
   census98→99 and protection assertions, preserving10 reference tables and all
   previous tenant invariants. That exact path/hash and bounded change are included.

Inspector rechecked247 owned/generated-envelope entries, baseline hashes and
non-overlap. Current contract census329 plus the two new named GET operations
supports331; internal qualification operations[] adds no public CRUD. No remaining
blocking finding was reported in the inspected scope. Final packet review is
separately attributed and retained through the bridge.
