# DETRAN R-0022 STYNX 1.6.1 adoption — v16 local evidence addendum

This supplements v15, whose manifest transitively links v14 and the public synthetic TEST_ONLY fixtures. Local evidence only; no stage/commit/push/PR/merge/release/deploy or DEVAI proof-chain mutation.

## Verified local evidence since v15

- Fresh keeper04 creation was consumed once and returned success pending Inspector birth: entry VERDICT sha256:9be46748b9aa9e8d760fac953c0b8d089ebc129db278dea614e4136e28bc74a2; creator OUTCOME sha256:e3d7b86f1160b0f6847f71c7ec22a40700923b5a46aaba52c6000f778bd2de1a. Independent Inspector birth closed with seven-key record sha256:d7b5a58ab649ce774067dddd96c9b62b8bddb4e6067ab93948812e664f3945ad; all 11 read-only diagnostics passed, with exact QEMU and Node hashes, one inert process, three read-only mounts and empty host leaf.
- The independently reviewed numeric own-PID process-only probe consumed exactly one new permit/admission. It **failed UNKNOWN_QUARANTINE**, not a target-Linux success: entry VERDICT sha256:f822396dd75105ea74f955fed0c5bb4f1323a7f5237660a1640f73ea6b519e94; caller OUTCOME sha256:ef0b2cd501e4aa3c652186f8d367897985213301cca7b2ccd4503716e2d427c2. Node exited 1 with EROFS opening `/proc/108/stat`, stdout empty. The numeric-path hypothesis therefore did not produce a process proof in this owned QEMU runtime. The caller stopped keeper04; final same-CID inspect showed Running=false/Pid=0/ExitCode=137, so no clean TERM-only exit is claimed. There was no SDK evaluation or SQL. No retry.
- Inspector independently closed failure readback sha256:817681a7bc2a537a144d01e1e0054166b0feed33c55b69fc8bcda1352e85d2c4, rehashing 69 custody files and 13 command receipts. Its verdict is FAILED/UNKNOWN_QUARANTINE. The prior keeper03 resolver failure from v15 also remains quarantined. Architect is preparing an external live-PID observation design; it is source design only, with no fresh runner or invocation.

## External provider and trust inputs still absent

The signing provider product/custodian is unknown. No actual provider-signed public samples or approved normative floor/profile/revision/approver, signer/TSA/archive anchors, or algorithm/OID/timestamp/revocation/provenance trust values have been supplied. Synthetic TEST_ONLY fixtures cannot prove provider acceptance or production signing. v14's public STYNX API gaps, native CI, full parity/cutover and publication boundaries remain open. Neither failed local QEMU probe is acceptance evidence.
