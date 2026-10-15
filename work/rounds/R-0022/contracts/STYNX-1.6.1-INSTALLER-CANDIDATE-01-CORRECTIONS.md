# STYNX 1.6.1 — candidate01 corrections

Role: Architect/F1. This is one source correction lane under the existing unblocked adoption scope, not a database execution permit. Candidate01 remains historical and null-sealed. No SQL or SDK was executed by this review.

## Exact reviewed inputs

- Main `tools/stynx-storage-install.mjs`: bfc524e193322772cb2c63c58bd18f1f0c2fbe74feea57588e8ec4b05f2e52e6.
- Prior child `tools/stynx-storage-prior-verifier.mjs`: d2d048cf45afdaec3c1e44cb28705d02d6c1aee110552f300ad2c2117fd0e6f8.
- Runtime guard `tools/stynx-storage-runtime-guard.mjs`: b2af285f6fe6216bd5245f6aeee935e7d51a09db4038498aa72121f7e29ce45c.
- Apply wrapper `backend/database/apply.sh`: 2e60afa0bdff35160080ce2640fe53c0cd8af27e9a8a5b78bcb5586978ab8eb3.
- Factual inventory `scratch/r22-adoption-161/node-installer-source-candidate-01/input-inventory.json`: b10cb69a80c871646d2e181439b1c7a0e8afbbcef124f74ff552ef874f16b386.

## Required bounded corrections

D1 — Cancellation before exclusion. SIGINT, SIGTERM and SIGHUP permanently mark interruption. While the maintenance connection or advisory lock is still pending and no lock has been confirmed held, cancel/end that maintenance client so the wait cannot outlive cancellation. A possible acquisition/cancellation race must fail closed, retain actual cleanup observations and never start target work. Once the lock is confirmed held, preserve that connection through target/child cancellation and locked readback; release it only in the existing cleanup path. Check interruption before every first connection/lock/target start as appropriate. Never interpret cancellation as proof of rollback or COMMIT outcome.

D2 — Retain both readbacks. Use fixed distinct exclusive paths `postcommit-locked-readback.json` for the ordinary postcommit observation and `recovery-locked-readback.json` for the catch-path observation. Retain the actual second observation even when the first exists. Neither overwrites a prior file. The first failing invariant remains the primary error; cleanup/retention errors are additive. Candidate/rolled-back/commit-unknown/postcommit-stop semantics and the held-lock boundary stay unchanged. No automatic retry, repair or receipt recreation is introduced.

D3 — Complete predecessor custody. For every full-recreation predecessor, parse the copied reviewedCandidate with the existing closed candidate schema and validate its actual sourceBeforeLease and both actual review actor/report references, in addition to its already checked direct activation/lease/candidate/manifest references. Rehash every nested B3 reference and collect it into the current full-chain input inventory, rejecting duplicate-path conflicting identities, absent/extra/unsealed records and traversal/cycles. Compare retained copies by byte identity where paths differ. Rehash the entire admitted transitive set before COMMIT. Old authority must be established from retained original facts, never inferred from the replacement database name/OID. No predecessor report becomes a new execution privilege.

D4 — Prior child cancellation. The child must permanently remember a signal even during public imports before Client assignment. Check that state before connecting, before each selected public verifier, and before producing a successful disposition. On interruption retain the failed READ ONLY report and actual rollback/close errors; terminate any existing client without later starting another. A clean module graph or absent client does not erase cancellation. No owner write, service bootstrap, new public seed or maintenance-lock reacquisition is added.

## F3 before F2 and completion

Inspector preserves the original24/source results and authors one pertinent RED set for D1–D4 in the already owned installer/prior-child sensor lanes. Source witnesses are labelled source-only. Consumer-only controlled barriers may exercise cancellation/retention helpers without pretending to be PostgreSQL or SDK proof. Engineer then makes one bounded candidate revision in the existing main/prior-child family, retaining candidate01 and null execution seals. Inspector independently checks the exact revised source and pertinent tests. Actual signal, lock wait, rollback, uncertain COMMIT and postcommit STOP experiments still require the separate owned-subject lease and real PostgreSQL observations; source GREEN does not establish them.

Full source review otherwise found the intended fixed73 SQL inventory, late20→06→31 ordering, original fresh-row preservation, suffix9-only upgrade, owner-maintenance plus target transaction exclusion, SQL UTC facts, candidate retention before controlled COMMIT, separate latest READ ONLY verification, full-recreation provenance and selected runtime guard boundaries present. This is bounded static review, not SQL compilation or execution acceptance. Revised source review may identify additional concrete defects; no claim of universal safety is made.
