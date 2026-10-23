# PR #223 CI security repair — 2026-10-23

User authorization: check CI, fix failures and merge when required checks are green.

Foundation run 40032118991 on ea0f15c9 passed the root check and docs build, then
failed docs:security on GHSA-27r3-jxmh-p828, high severity, body-parser <1.20.9.
The official advisory names 1.20.9 as the patched 1.x version.

Engineer updated only docs/site/package-lock.json through npm's package-lock-only
update. The resolved body-parser moves 1.20.6→1.20.9. Its declared qs range changes
~6.15.1→~6.16.0; the resolved qs node and every other package resolution remain
unchanged. No manifest override, audit exception, root lock, native graph, test,
policy, threshold or assertion changes.

Fresh npm ci, unchanged security:check and complete documentation build passed.
The audit reports zero flagged vulnerabilities and zero exceptions. git diff
whitespace check passed. Original failure, exact patch and command logs remain
outside the repository in the existing M1 provider-adoption artifact capsule.
This is a bounded documentation dependency repair; no general security-readiness
or new scorecard verdict is asserted. Required CI must pass on the new PR head.

Independent cross-family supplemental review returned PASS with no findings.
The migration portion is pre-execution review; the package-lock portion validates
this bounded delivery. The parent independently checked the official advisory
and the Engineer completed the final successful documentation build afterward.
