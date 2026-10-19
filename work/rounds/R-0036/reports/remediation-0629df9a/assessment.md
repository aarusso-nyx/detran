# R-0036 second measurement checkpoint

Candidate `0629df9a9ac781478ed4bb760e7ecdb76c21be87`, published DEVAI 2.6.2.

- **Workspace types: native PASS.** The complete workspace command ran through
  the reviewed task executor, with zero changes to product code or test limits.
- **Integration: observation error.** The executor stopped at its 600-second
  global budget. This does not establish a product failure or a complete
  integration population. The leftover disposable container was removed.
- **E2E: native FAIL.** 1,853 tests passed and two failed across the configured
  population. Full failure identities need a repeat with retained task logs;
  fixture/measurement regressions and pre-existing product/test failures have
  not yet been distinguished. No assertion was changed to pass.

All three readings are recorded in the governed chain and listed in the manifest.
The newer provider diagnostic completed the full dependency audit and emitted
native FAIL: 5 critical, 15 high, 13 moderate and 4 low findings. Its thresholds
remain 0 high for PASS and 5 for REVIEW. This unpublished-provider diagnostic is
separate from official scorecard evidence and from product remediation.

The initial performance suite and explicit targets were authorized subsequently
by the Owner. They are being developed on an isolated DETRAN branch so this
candidate's in-flight measurements remain unchanged. The complete 43-cell grid
must still be rerun on the final frozen configuration with the adopted provider;
these checkpoint counts are not a mixed-commit substitute for that grid.
