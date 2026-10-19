# R-0036 fixture isolation and integration checkpoint

Candidate `8cf4223a18d287da2c64a5a57f7172cebb3ce574`. This is a measurement
checkpoint, not a complete 43-cell assessment. Results from different candidates
are not combined into a final measured-cell count.

- Published DEVAI 2.6.2 E2E measurement: **FAIL**, 1853 passed and two failed.
  Resetting the mock between suite families did not eliminate the two previously
  observed 402 response mismatches. Each failing test file explicitly assumes a
  fresh seed, while other files mutate those same seed records. A separate complete replay
  at diagnostic commit 90dc922b reset the seed before every existing mock E2E
  file and reproduced both mismatches (1853 passed, two failed, no timeout).
  Cross-file contamination is not a sufficient explanation. BL-0016 assigns
  investigation of the actual error envelope and seed/business state.
  Product sources, test assertions and suite timeouts are unchanged.
- Unpublished DEVAI PR #413 diagnostic integration measurement: **PASS**, 1515
  passed, zero failed, 670460 ms. The 15-minute orchestration budget permits the
  complete backend, adapter and mock population to finish. This diagnostic is not
  promoted to an official published-provider reading; adoption and replay remain
  required. The earlier truncated executions are preserved.
- Both complete task transcripts were reconstructed and their stdout/stderr
  digests matched the corresponding readings before compressed archival.
- Product remediation is separate: BL-0013 covers the 37 dependency advisories
  (identical before and after adoption); BL-0014 covers 1135 lint errors and one
  warning revealed by complete parsing; BL-0015 covers slow historical CI with
  the existing population limitation retained. No product fix is included here.

The performance workload and generous initial limits are defined in ADR-0044.
The native performance result at candidate 599161f9 remains separately preserved
in remediation-599161f9; it does not certify a new candidate automatically.

DEVAI #413 has passed its required remote checks. Integration/publication awaits
the exact-effect Owner authorization required by the DEVAI maintainer contract.
Separate provider branches are validating push-population verification and
explicit monorepo source/specification roots. Coverage producer provenance,
complete inventory regeneration, adoption, exact-candidate replay and the final
43-row reconciliation remain open. The historical N/A cells and all existing
thresholds are preserved.

Published-provider doctor remains FAIL solely because 2.6.2 mistakes the coverage
population declaration for an incomplete task reference. PR #413 repairs that
classification; its diagnostic doctor passed previously. Chain verification is
PASS with 202 records and the entire 201-record historical prefix preserved.

The diagnostic per-file wrapper is retained on its isolated branch and was not
merged into the measurement candidate: it reproduces the same failures while
adding substantial setup work. The native complete-suite result remains FAIL.
