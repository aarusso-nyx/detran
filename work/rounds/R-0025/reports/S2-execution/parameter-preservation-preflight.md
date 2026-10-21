# Parameter version preservation — read-only preflight

Auditor, Constitution Article7. Source inspection only; no generation, seed,
reset, database mutation or operational activation was performed by this check.

`tools/parameters/generate-seed.mjs:25–29` retains the existing fixed effective
date2026-09-13 for these four RAIT ladder defaults. Lines31–38 emit version1
INSERT with `ON CONFLICT(tenant_id,coalesce(traffic_agency_id,zeroUUID),surface,key,effective_from)
DO NOTHING`. Only unrelated TEAT bootstrap has a special date rule.

Existing `backend/database/seed/05-parameters.sql:16–17` contains the B/D string
versions with that identity; its DO NOTHING preserves colliding old rows and
versions. Typed regeneration changes fresh-install defaults, not those operating
values. A preexisting same key at another date remains intact; seed insertion of
its own fixture-date row is not a verified operational activation.

`backend/database/apply.sh` applies DDL files only, not this seed. The separate
`backend/database/seed.sh:24/45/68` includes it in three fixture profiles inside
single transactions. No generator/loader amendment is necessary for preservation.
Do not replace DO NOTHING with UPDATE or silently introduce an operating version2.

Existing string-valued B/D operating versions remain unqualified for the exact
new typed risk API; required source/activation qualification therefore returns503
until independently authorized typed operating inputs are available. A/C proposed
catalogue rows likewise do not become executable merely by generation. S2's
production release gate remains open. Final generated attribution, actual
integration/upgrade checks and full HTTP acceptance remain pending.
