# PR #203 — concurrent evidence reconciliation

Role: Architect for custody documentation; Inspector for supported proof-anchor recovery and CI validation.

Main advanced to `653e34019da0411ac92a46495b18e6c1df484ebf` through scorecard closure PR #204 while S1 CI ran at `bbf93ce57fc6e60d9d314bb2cbdf53b483fae810`. Only the append-only evidence chain conflicted. Both branches appended a distinct record after the same predecessor.

`s1-chain.json` and `main-chain.json` preserve the exact original bytes, record identities, contexts and hashes; `custody-manifest.json` records their provenance and digests. All original commits remain ancestors through merge. The canonical chain continues main's complete prefix. No original chain entry is manually rehashed or presented as a new observation.

After committing the merge checkpoint, the supported `devai evidence record --recover-newest-line` verb anchors the existing newest R-0025 generic proof (sequence 3) against the new canonical head. Its original proof-line bytes remain unchanged. A subsequent generic custody record binds these snapshots. The initial recovery attempt before that checkpoint correctly refused with `PROOF_HISTORY_MODIFIED`; it produced no recovery record.

The four CI fixture repairs affect tests only: exact RLS inventory, admission routing receipts, authorized CTG2 transaction fixtures and the upgrade loader inventory/order. Runtime, SQL, permissions, scorecard artifacts, thresholds and original evidence reports are unchanged by these repairs. Local backend stages passed across recorded reruns; final exact-head GitHub CI determines merge eligibility. Historical reports retain their original epoch and limitations.

R-0025 remains open. S2 stays paused. This reconciliation introduces no scorecard measurement, product readiness promotion, deployment or closure claim.
