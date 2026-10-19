# S2-R5 — generator-native legacy qualification immutability

Architect source clarification; Owner recommendation adopted under the recorded
five-hour delegation on 2026-10-19T22:54:11Z. The approved append-only requirement,
closed path inventory and runtime scope are unchanged.

## Concrete decision

Use existing `immutable: true` (without `immutableColumns`) and
`applicationAppendOnly: true` on the exact `RaitClaimLegacyQualification` blueprint
entity. Keep all seven CHECKs, composite uniqueness and tenant/case FK. Do not add
a duplicate custom immutability trigger. The existing generator supplies BEFORE
UPDATE OR DELETE and BEFORE TRUNCATE rejection with SQLSTATE42501, including
updates to `updated_at`.

The generated applicationAppendOnly REVOKE is subsequently overwritten by later
broad INF grants and the final `20-rls-policies.sql` grant. The current loader runs
`19-rait-case-scope-enforce.sql` after those grants in the existing transaction.
The approved supporting SQL19 path may therefore add the minimal final statement:

```sql
REVOKE UPDATE, DELETE ON TABLE inf.rait_claim_legacy_qualification FROM role_app_backend;
```

A supporting assertion may follow the existing SQL19 style. No loader, generator
logic, new SQL file, package, seed or shared grant policy change is needed.

## Authority and validation boundary

Architect owns the existing blueprint source path; Engineer owns the existing
supporting SQL19 path only for constraints/immutability the generator cannot finish.
This is source-backed realization of the already-approved append-only invariant,
not a new permission or operational source. The minimal final REVOKE compensates
for observed grant order; generator-produced triggers remain present throughout.

Inspector's storage tests must retain exact UPDATE-reason, UPDATE-updated_at,
DELETE, cross-tenant, revision and row-preservation assertions. Schema absence is
still prerequisite-pending in the pre-generation baseline, not security RED.
Generated trigger/ACL acceptance must run against actual final applied DDL under
role_app_backend. Database constraints cannot authenticate provenance receipts;
independent runtime authenticity, current revision, parent/version and binding
checks remain mandatory. Production verifiers remain missing absent accepted
operational authority. No custom trigger, backfill or public CRUD is commissioned.

Read-only preflight: existing generator supports the flags and all seven checks;
loader final order is20→21-ops-provisioning→19-priority-enforce→19-case-scope-enforce
→19-priority-verify in one transaction. This receipt records the recommendation;
actual generated output and PostgreSQL acceptance remain pending.
