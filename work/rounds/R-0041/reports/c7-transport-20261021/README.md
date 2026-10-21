# C7 Portal fixture transport correction

R-0041 stays active. The initial two-file TASK review is FAIL; revised four-file TASK-v2 is PASS. No C6 review was retried. See contract.md and both original reviews.

The fixture now owns one ephemeral loopback listener. Two consumers no longer start a second listener. C-0002-76 gains pre/post listener identity assertions; all its original bytes remain after removing the added guards (source-preservation.json). Product code, dependencies, workflows, task descriptors, original assertions/timeouts and tenant/RLS behavior are unchanged.

Actual captures: RED8pass/2fail (expected listener precondition plus C75 validation); initial partial GREEN9pass/1fail (C76 fully passes; C75 remains); full-fixture GREEN43pass/0fail across portal-routes, payload-lint and stream, with canonical disposable PostGIS and SENATRAN mock. The earlier captures remain as-is. These are ordinary working-tree diagnostics, not signed RC or C6 evidence.

IMPORTANT: summary-errata.json corrects inherited authored-summary metadata: base HEAD is not an exact clean candidate, and the F3 sources did change. Original summaries and invocation stdout/stderr remain byte-preserved. Final fixture population differs, so the C75 difference has no established causal attribution.

The listener-failure cleanup branch has no direct test in this packet; independent delivery review must inspect the rethrow/AggregateError behavior. Complete original RC on a clean published candidate, official proof verification, required PR checks and actual main verification remain required. Neither old main RC failure is relabeled PASS, and no whole43 scorecard or campaign closure follows.
