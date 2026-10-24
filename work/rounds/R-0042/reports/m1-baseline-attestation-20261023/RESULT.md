# Exact-main local RC attestation result

Inspector; completed 2026-10-23T22:36Z. Candidate `80505ac00690a3210913f09904004898b78860c3`, tree `ca29d8c69b2dc45b2691c05a788e1db223ab7655`.

Native backend-kernel result PASS: started22:05:10.952Z, finished22:33:20.320Z. Full official RC profile completed; original immutable native receipt375b395c70a3e8bc7197a9385b7bf7dd2202dcfb1a6fda9d29d64111c8a07771, resultbe907de3f139afe0bda7f0185a88dfd8c9cf0544017631548de296852206cfe0. Copies and full backend transcript are adjacent.

Initial official prepare reached export and failed `ARTIFACT_SYMLINK_ESCAPE` because default `/Users/aarusso/.config/devai` traverses the development-volume migration symlink. Failure retained verbatim in prepare.log. No RC rerun, evidence rewrite, trust change, or immutable deletion.

Recovery used the official unchanged export-cli against the same native receipt, same key and same controls with their canonical `/Volumes/Development/runtimes/devai/config/...` paths. Export succeeded (export-canonical-paths.log). Envelope digest29ce592723f0ff452bc719703d089f80f7a8d633fcf2448143aa6c6a70ce4e9a; policy d00d3364a6fd7b480d9603d6456d4ecfd0fdbd405fba87974498ce020754aad7.

Official `pnpm devai:rc:publish` succeeded using canonical DEVAI_RC_EVIDENCE_ROOT. Published tag `devai-local-evidence/ca29d8c69b2dc45b2691c05a788e1db223ab7655`. Owner-authorized publisher performed protected-tag creation through existing configured GitHub owner privileges; its full remote rule notice is retained in publish.log.

Independent protected verifier [40034673414](https://github.com/aarusso-nyx/detran/actions/runs/40034673414) COMPLETED SUCCESS. Downloaded native verification-summary.json reports pass, exact-commit80505ac0, correct tree/policy/signer, no failure. Adjacent verifier-run.json and remote-verifier/verification-summary.json are the evidence.

This attests80505ac0 only. Post-roadmap/provider current-main candidate requires its own valid native assessment; do not transfer this PASS to another tree. No source/tests/config/policy/proof-history edits. Disposable run container cleaned by official kernel; other containers untouched. Managed worktree retained for subsequent coordinated execution. PR211 unmerged, C6 blocked.
