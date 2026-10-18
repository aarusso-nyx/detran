# Installer complete namespace refinement

Architect/F1. Candidate02 source review7132ba7585897c34848d2160b06d8a85a524eeb405b0b33f2261cd927bfb8b7d is preserved as historical and superseded for execution readiness by D5. No runtime seal or database authority is active.

The14 snapshot/pristine predicates `nspname NOT LIKE 'pg_%'` exclude legal user namespaces such as `pgxevil` because underscore is a LIKE wildcard. This violates the existing complete catalog boundary. Change only these predicates to `left(nspname,3) <> 'pg_'`, using each actual table alias and retaining the information_schema exclusion. Reserved literal `pg_` namespaces remain excluded; legal `pgxevil` and its tables/functions/constraints/data/sequences must be included. Do not replace this with a closed package-schema list or normalize away the unexplained user namespace.

Inspector first records a pertinent pgxevil source/pure RED, preserving original28 results. Engineer then applies the narrow predicate correction and refreshes exact source/input identities with execution seal null. Independent review checks every affected query and exact diff before any real candidate/lease. This is source/pure evidence, not live PostgreSQL pristine/rollback proof; the actual leased fresh/recovery experiments remain required.
