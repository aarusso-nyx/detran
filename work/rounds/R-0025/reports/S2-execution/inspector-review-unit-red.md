# TASK-0044 independent unit RED

F4 executed one test: one genuine assertion failure, 90 filtered. The actual evaluator returns insertion order instead of the required globally sorted opaque union.

F5 executed one test: one genuine assertion failure. The actual current-risk service invokes locked S1 authorization after global SQL instead of first invoking nonlocking authorization. Actual HTTP contention remains a separate pending acceptance control.

Runtime checkpoint: `5357b49f`. No DB was used by these two invocations. F1 remains pending, F2 depends on F1-only wiring for decisive RED, and F3 remains OPEN. These results are deliberate RED counterexamples, not delivery or product-readiness approval. Raw Vitest transcripts are copied unchanged; no credentials or raw DSNs appear. Exact test and transcript hashes are recorded in the JSON receipt.
