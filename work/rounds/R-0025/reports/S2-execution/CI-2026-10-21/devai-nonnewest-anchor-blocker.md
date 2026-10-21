# Architect observation — supported non-newest merge recovery required

Installed @aarusso-nyx/devai2.6.3 has a supported `evidence record
--recover-newest-line` operation. Normal merge1115f589 preserved the entire
main chain and all original round JSONL bytes. The divergent S2 chain is preserved
verbatim in preserved-premerge-S2-chain.json, including original direct anchors
for immutable R0025 generic lines7/8. Supported newest recovery8 succeeded.
Line7 remains an orphan in the integrated chain, and required evidence verification
fails. No absence of implementation/testing is inferred from this governance defect.

The proposed historical-prefix recovery was actually refused:
`PROOF_HISTORY_MODIFIED record/proofs/work/generic/R-0025.jsonl: a committed proof
line was changed or removed in the working tree; restore the committed bytes, never
re-anchor or re-declare the line`. The refusal was emitted to stderr (the original
sequence7 stdout capture is empty); this paragraph is a transcript, not a raw log.
The original complete epoch was restored byte-for-byte in finally. No retry via
a different checkout, hidden API, manual chain edit or historical-gap waiver.

Required upstream capability: reviewed public DEVAI action to reconcile a proved
immutable divergent anchor at a non-newest physical sequence. It must validate
exact original published chain/proof custody, epoch prefix/history and digest,
reject altered/ambiguous/duplicate/historically declared lines, and append only
to the selected canonical chain without rewriting proof lines or prior records.
This is not available in the installed CLI. This repo cannot modify sibling DEVAI.
Recommend a separate upstream DEVAI repair/release and a bounded adoption packet
here; do not waive evidence-gate or manually fabricate the missing anchor.

This merge blocker is independent of F3/DRESET, performance, TEAT and the exhausted
delivery-review cap. Required CI cannot be called green until it is resolved.
