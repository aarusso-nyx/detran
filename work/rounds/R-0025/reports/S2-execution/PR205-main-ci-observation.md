# PR205 exact merge CI observation

Observed 2026-10-19T22:37:07.398732+00:00, exact merge2e04f29c864cc3cdb3e73d4ec0de995e67214db7.
All five required contexts SUCCESS: foundation,evidence-gate,senatran-mock,
senatran-mock-tests,verified-local-rc. Ordinary DETRAN CI39330256160 SUCCESS.
verified-local-rc118334634402 reports Remote backend fallback: no eligible exact-tree
attestation selected, so the complete backend suite ran remotely. This is observed
backend validation, not a trusted local receipt or production/readiness promotion.

Separate trusted-local-RC workflow39330256191 FAILED at Bind candidate and protected
evidence tag; later verification steps SKIPPED and summary/artifact missing. Retain
this failure separately; do not call the workflow successful because its required
context was satisfied by the remote fallback. Two direct log downloads failed TLS
handshake; API jobs/annotations are preserved, so no more specific root cause is
asserted. No CI/workflow config was changed or gate weakened by this observation.
