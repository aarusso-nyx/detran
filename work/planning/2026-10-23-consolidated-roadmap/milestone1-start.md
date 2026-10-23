# Milestone 1 start — 2026-10-23

The Owner authorized beginning M1 after recording the consolidated plan. PR #223
records that roadmap at d6d9b9cc. The following are separate execution observations
against main 80505ac00690a3210913f09904004898b78860c3, not new scorecard verdicts.

## Attestation

An isolated named published branch at the unchanged main commit is executing the
official `pnpm devai:rc:prepare` flow with required Node 24.15.0/pnpm 9.15.0 and
disposable Docker fixtures. Initial DDL/seed, decorator and RLS checks passed;
the run was still in progress at this observation. No completed RC receipt, signed
bundle publication or trusted verifier PASS is claimed. Original main CI passed;
the separate trusted-RC workflow failed for its missing protected evidence tag.

## Provider adoption preflight

Engineer verified official registry DEVAI 2.7.0 integrity
`sha512-nRLnRarjaaPzmq3zJKIEwOPcuAW6F915wGG/Od3dhdHK+M7WWVmOctDLfamHQpBGgra7eLEQUEaSDF7/ooDR7A==`,
published release source ff8accd83c912d02d17df80eccbe147aafd082e3 and ancestry of
#424 merge 5034e0ccc7a0af573c3d0af068c6c2b263d71ffe. Only package.json and
pnpm-lock.yaml changed in the isolated adoption worktree. No transitive dependency
version or native capture graph changed; install scripts and native capture were
not executed. Those two package edits remain local, outside this planning PR.

The official `devai init upgrade --constitution --format json` dry plan returned
ready, no refusals, no retired keys and no replaced defaults. It names exactly
five generated updates: constitution pin/pointer, project config, policy-binding
receipt and authority policy. [The parsed plan](milestone1-upgrade-plan.json) and
[the preservation comparison](milestone1-adoption-preservation.json) retain the
observed values; original raw captures are retained outside the repository.

Migration MIG-2.7.0-constitution-1-1-0 requires an Architect review of Articles 6/7/10
before registered binding. The proposed constitution adds a bounded Engineer
focused-regression verb and retains independent-assurance withholding. Source
review does not activate the verb for a protected task or waive its restrictions.
The native reporter identity migration is separate from RC toolchain policy.

The checkpoint stops before official binding/write, commit or publication of
adoption. Next: record the Architect migration review and exact effects, execute
the supported registered upgrade in the proper role session, then check doctor,
preservation and runtime/guard compatibility before any frozen scorecard epoch.
No second approval is inferred necessary merely from a supported dry plan; any
unexpected authority, custody, source or runtime effect stops dependent execution.

PR #211 remains unmerged, S3 runtime held, C6 blocked with empty bindings. Histories,
thresholds, original acceptance and protected local work remain unchanged. Neither
metadata install nor a ready dry plan means provider adoption or M1 is complete.
