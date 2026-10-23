# R-0044 — Current dependency vulnerabilities

Status: active; canonical lifecycle in record.md. Authority: D-1 in decisions.md. Baseline: a97e6def6cc4b80d65c5ab0ee9579241f0b33446.

## Scope

Use fresh complete audit and official patched versions; smallest peer-compatible manifest/lockfile changes. Preserve DEVAI2.6.3, STYNX1.5.3, all prior reviewed security patches, thresholds and API behavior. No audit exclusions or waiver changes.

## Sequence and gates

1. Engineer/Inspector reproduce current failures and retain raw RED results.
2. Implement only the assigned package, with role-separated source and test changes.
3. Inspector validate affected complete populations, source contracts and unchanged assertions/thresholds; retain all failed attempts separately.
4. Architect/Inspector record exact candidate diagnostics through official evidence verbs and verify chain prefix and protected-file hashes.
5. Deliver a separate PR; keep this round active pending protected integration and post-integration verification.

## Protected boundaries

Preserve both evidence histories, every closed-round byte, the original seven test task descriptors, thresholds, N/A declarations, DEVAI2.6.3 and C6 hold. Do not touch the sibling DEVAI repository, import its unpublished package, mix the measurement PR or include another remediation package. Fresh scorecard assessment follows a new frozen source epoch; no results are combined across commits.
