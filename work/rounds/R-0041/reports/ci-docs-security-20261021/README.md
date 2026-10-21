# PR #214 — C7 docs dependency security repair

The original run39626296396 failed in `foundation` at `pnpm docs:security`,
after the complete `pnpm check` and docs build/link-check had passed. Five
advisories affected the existing documentation dependency tree. The three source
files were byte-identical to main1115 before this repair; no causal claim is made
about the advisory database publication timing. The original failed run and its
source hash/excerpt are preserved.

Engineer change: pin follow-redirects1.16.1 and patch launch-editor2.14.1 to2.14.2
in the documentation package only; regenerate its lockfile using npm. Exactly two
resolved package entries change. Upstream launch-editor also changes its declared
shell-quote range; the resolved shell-quote version remains unchanged.

Architect change: remove the sole unused GHSA-vfj7-8cjw-p6xm braces exception,
which the original audit explicitly reported as no longer matching. The vendored
braces/image-size patches and their integrity checks remain intact. No new
exception, severity change or audit-checker change is introduced.

Local Inspector validation: actual `npm ci`, `pnpm docs:check`,
`pnpm docs:security`, `npm audit --json`, dependency-tree check and doctor pass.
The docs audit reports zero vulnerabilities and zero allowed exceptions at the
original moderate threshold. This is a docs-tree observation; no workspace-wide
security result or product dependency remediation is claimed.

Official upstream patch references:

- https://github.com/advisories/GHSA-q3jh-wrc6-jgq8
- https://github.com/advisories/GHSA-8r9p-f939-6h3c
- https://github.com/advisories/GHSA-587h-7wmj-h5pm
- https://github.com/advisories/GHSA-698v-4r3x-3vcv
- https://github.com/advisories/GHSA-r825-w8mm-5pxw

R-0041 stays active; closed rounds, prior reports, thresholds and both proof
histories remain protected. C6's withheld protocol remains blocked without a valid
verdict: it was not reviewed, rephrased, implemented or executed for this repair.
Independent review of this bounded docs dependency delta and fresh CI on the new
commit are separate gates; future outcomes are not assumed here.

Independent delivery review: PASS (0.90), preserved under
`../../reviews/ci-docs-security-20261021/`. The reviewer observed that CI's original
audit counted three flagged dependency entries and the local pre-change audit
counted two; both identified the same five blocking advisories. The difference
is retained without inventing a cause. Fresh CI remains pending.
