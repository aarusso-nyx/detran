# Smoke diagnostic extension — Owner approval, 2026-10-23

Architect records the direct Owner instruction:

> I approve the one-file smoke diagnostic extension. Check CI on PR #221, fix failures, and merge when required checks are green. Then apply it, keeping #211 unmerged, S3 runtime paused, and local and scorecard work preserved.

Approves the exact [diagnostic packet](stack-smoke-diagnostics-approval.md),
SHA256 `4109df03f149245ad4bd9651b46de6bc6f517e3dfb5531ebe4f98ac45d218a02`.
Its “proposed/requested approval” text is the preserved earlier proposal; this
later receipt supersedes that status only for the one-file diagnostic extension.

After PR221 integration, Engineer may insert only the specified always-run
report-printing step in `.github/workflows/ci.yml`'s existing stack-smoke job.
Inspector validates exact scope, shell behavior for present/missing reports and
unset/empty directory variables, and preservation of original failure/cleanup.
Then run the manual stack diagnostic on the attributable S2 candidate and preserve
actual output; this does not turn the preserved S2 source into an integrated or
accepted candidate. No proof history, timeout, check condition or smoke behavior
may change. A subsequent observed failure requires its own sourced repair scope.
No PR211 merge, S3 runtime, local/scorecard mutation or extra path is authorized.
