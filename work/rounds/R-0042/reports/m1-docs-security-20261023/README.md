# M1 docs security follow-up — draft CI checkpoint

PR #223 merged after all required checks passed on cac88d51. Its later main
push at d8def62f failed docs security after two fast-uri advisories were updated
in the live audit feed. The authentic post-merge refusal is retained separately;
it does not rewrite the earlier successful pre-merge run.

Engineer bumps only the existing docs fast-uri 3.x override and corresponding
lock leaf from 3.1.8 to patched 3.1.9, with registry-authenticated resolution and
integrity. Ajv's existing ^3.0.1 edge accepts the patch. Body-parser 1.20.9, every
other docs lock node and the complete root/native dependency graph stay unchanged.
Official advisory sources:
https://github.com/advisories/GHSA-w74x-v6f9-j3xg and
https://github.com/advisories/GHSA-wjr9-j795-jxcr.

Independent review is PASS for draft CI publication only. JSON/format/diff and
bounded preservation checks passed. Installation, actual audit and docs build
remain pending during the shared STYNX verification window; no execution PASS
is claimed for this patch yet. Required-green integration remains mandatory.

The preceding compatibility change passed all 58 security-history tests in CI;
a separate ADR status-heading refusal is retained. Adding the intended Accepted
status resolved the local state-index check without changing checks or runtime.
The exact-source 74b9eec8 measurement stays held separately, with its earlier
failures preserved. #211 remains unmerged, C6 blocked, and histories intact.
