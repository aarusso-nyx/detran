# EC2: baseline historical artifacts versus new append custody

Auditor, independent read-only Git-object comparison. Baseline source `74b9eec83cd10d981f5ec5923c0f82ad7b2c13b5` contains335 records; current delivery `a9eaef48fc3dbd814c40e6f352b1efbf7022a0bc` contains392. No file was restored, rebuilt, moved or replaced by this audit.

**No new history loss was introduced by this delivery.** The full old335-record prefix is unchanged; all211 previously tracked canonical sensor files are byte-identical. Every one of57 newly appended record artifacts exists and hash-matches. The current canonical tree has268 tracked files.

The old prefix references158 sensor artifacts and already had13 absent canonical targets at frozen74. Current392 records reference215 artifacts: the same12 targets remain missing and one old coverage binding now sees different bytes at its formerly absent path. Exact record/context/path/expected/current hashes, same-basename archive candidates and new valid binding are in `ec2-baseline-historical-artifact-gaps.json`.

## Exact historical issue population

- Sequence149, EV-3751088b544129ca: security_scan/SR-0633d2afcf0126e7; absent baseline/current.
- Sequence155, EV-5e8ba53365b6209f: security_scan/SR-bbe1e9585f6b0bda; absent baseline/current.
- Sequences157–163, original sourcebdedd9a41ca5aa83ae549dca414f7c5f1b88be80: inventory_api/SR-4a5d069ad4efdccb; inventory_routes/SR-52b447b63b5cccda; inventory_data_model/SR-16e75fbbc4beae33; inventory_data_handling/SR-7773a87215f599d7; inventory_rbac/SR-a5011c23cdaf011f; inventory_dep_graph/SR-f82dbd83c3c012a2; inventory_coverage/SR-89c58a03a01c1554. All absent baseline/current.
- Sequences322–324, sourcecd0c1b09d11291f1140dc7360b7f3724dda42bb7: unit_test/SR-01e4f2ecf2543cc6; integration_test/SR-d603a85ffe378693; e2e_test/SR-7fc907e0932b6762. Canonical targets absent baseline/current; exact original bytes remain archived in `work/rounds/R-0042/reports/seven-measurement-gaps-20261022/canonical-readings/`, unchanged from74 and hash-matching those old records.
- Sequence325, EV-c9c54fe012ef845d, samecd0source: test_coverage_depth/SR-01d9bca900c51904. Canonical target absent at74, old expectedSHAfc4b0dcbfb72366dc7abaf611fa986e5a187595ca3e35b02d42b213c99224e8f. Exact old bytes remain in the R0042 report canonical-readings archive, unchanged and matching. New74 native execution legitimately created that previously absent canonical path with SHA264d6e66cbf17864109d51135e1cad00aa399a5b25d3c92e2cefd8c0df39bae4 and its own authentic official record. The old chain binding remains unchanged and therefore does not match the new file. No pre-existing canonical file was overwritten. The old and new coverage metrics are distinct and retained in the manifest.

A similarly named R0036 archived security reading at sequence149 has different bytes; it cannot substitute for the old bound artifact. Older same-name coverage variants also differ. The archive search was deliberately bounded to tracked paths sharing exact historical basenames, with hashes; lack of such a filename is not a claim that no differently named/compressed historical evidence exists anywhere. No alternate artifact was installed into the canonical store.

## Bounded EC2 interpretation

The literal global assertion “every sense.readings.record artifact is present and hash-matching” is **not satisfied**:13 historical bindings remain canonically unavailable/mismatched. They must remain explicit existing custody limitations. Neither this audit nor native compatibility is a waiver or complete historical-artifact PASS.

The narrower delivery assertion **is supported**: all57 appended current-source records have actual artifact custody; all old records and previously available tracked bytes are preserved; the13 old canonical gaps predate the delivery. Independent review may assess that bounded no-new-loss conclusion while retaining the historical limitations. If EC2 was intended literally as total-history repair, obtain an explicit scope-aware reviewer disposition; do not silently reinterpret its PASS condition or restore/reconstruct bytes to satisfy it.

Official native record/schema admission of the new coverage emission binds the new hash and current74 context. A repeated reading ID/path is not proof that old bytes were recovered, nor permission to change old context/hash. Later scorecards must still select genuine current-candidate readings through supported identity/lineage behavior; the old historical binding cannot be borrowed as current evidence.

Captured native chain verification PASS reports127 proof lines anchored and53 historical gaps acknowledged. Those counts concern native proof-anchor/chain compatibility. They are **not** the sensor-artifact availability census215/13 and do not certify all historical sensor files present. Report both checks separately.

No closed-round artifact/history or old proof was rewritten. New clean epoch, full measurement completion, final review/checks, R0042integration/closeout and final signedRC remain pending their own gates. #211 and C6 holds persist.
