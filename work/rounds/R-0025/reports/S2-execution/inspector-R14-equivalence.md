# R14 independent SQL equivalence RED

One actual control executed:1 FAIL,114 filtered,33.97s,45 assertions. The failure is exactly runtime source query reduction:38 SELECTs for10 distinct tables. Independent fixture batching uses10 SELECTs. Scalar, fixture-batched and actual runtime canonical bytes and SHA256 agree before the decisive query-count assertion.

The same actual app-role transaction verifies mixed/shuffled refs, independent UUID lexical aliases in the fixture, two actual audit composite identities, microsecond timestamp formatting, bigint event IDs as text, bytea hex, null/DATE/JSON fields, duplicate/missing/unknown/foreign-tenant rejection, and freshness after an actual update to this fixture parameter. No row cache, runtime-helper reuse, caller trust or recursive verification reduction was introduced.

Beyond-safe-integer bigint audit values, schema-column absence, and artificial ambiguous physical keys remain unexecuted: this lease grants no audit-history fabrication, schema changes or guard weakening. Existing114 controls remain unchanged; total115 is114 plus this independent control. Full acceptance and offpage performance GREEN remain pending. Original failed epochs remain preserved. Exact code/runtime/dependency hashes matched after execution. DB lease released with no worker active.
