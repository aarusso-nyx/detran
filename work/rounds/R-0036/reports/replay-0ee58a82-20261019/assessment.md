# R-0036 complete collector and input-format checkpoint

At evaluated commit `0ee58a823c907ff2449a00b09ccfd1450d74c7ef`, native build,
migration and unit readings passed. The unit reading observed 12,260 passed tests
and zero failed assertions; the full collector report retained 161 TODOs across
569 test files. Inventory regeneration produced all seven required bodies without
errors or missing kinds; native REVIEW preserves the static binding limitations.
The aggregate inventory hash and all seven bodies are archived.

The coverage producer emitted all 2,574 implementation sources and passed the
existing SENATRAN 70/60/70/70 package gates. Its native REVIEW reported 53.04%
using 47,177 statement counters / 25,023 hits as the documented fallback when
per-file `l` counters are absent. This is not the standard line percentage.
Istanbul's original line summary is 23,583 / 43,685 = 53.98%. Both percentages
remain between the unchanged 50/80 review/pass boundaries.

The next collector format adds exact `l` counters using Istanbul's standard
getLineCoverage method, preserves the original V8 report, and binds the normalized
report digest. It requires a fresh complete run and native reading at a new
frozen commit. These original readings were persisted unchanged; they are not
rewritten or relabeled as the later line measurement.

The two fixture-task producer transcripts were reconstructed from their complete
step logs and checked against native stdout/stderr digests. Exact canonical
reading bytes, task logs, test reports and input hashes are retained. No final
43-cell scorecard or consolidated measured-cell count is claimed here.
