# R-0025 — bounded browser-RGR delivery-review addendum

Auditor (Art.7), Claude family CLI alias opus, read-only. Do not edit, run tests,
install, start servers, mutate Git, message anyone or invoke state/evidence verbs.
Read files, diffs and hashes only. Exact model is not inferred from alias.

This is the browser-boundary item of the SAME delivery review, not a second
exhaustive review of unchanged code. Original findings got REVIEW then PASS in
reviews/delivery-review-A-C3-01-{1,2}.json. Actual compiled browser smoke then
exposed three integration gaps which its mocked transport tests did not observe.
The orchestration limit is at most two REVIEW correction cycles per item; this
new browser item has not previously received a reviewer verdict. Restrict review
to the corrected browser delta and its material consequences. Do not add unrelated
findings on unchanged text or reopen completed original findings.

Read newest JW01-admissibility.md browser addendum, ADR-0041 browser addendum,
docs/framework/arch/frontend-wiring-pattern.md, reports/JW01-browser-smoke.md,
TASK-0024/25/27 report addenda and the delta since ad35fe0e in apps/rait/web.

Check:

1. Actual generated GET returns a weak cache tag; CASE.version is the server-owned
   command counter (blueprint description and backend exact If-Match comparison).
   CASE-only client command-precondition cache must be separate from raw EtagStore.
   getCase validates a strictly positive safe integer from actual response, never
   coerces, defaults or increments. Numeric strong header/body mismatch fails and
   clears command tag. Weak/opaque/missing cache headers cannot replace validated
   version. Other collections/generic HTTP metadata stay unchanged.
2. Four command responses update the canonical command tag with actual response
   ETag and check body.version where present; R01 uses header as parent version.
   Invalid explicit weak/opaque If-Match is not sent. Version-bound idempotency
   from original correction stays intact and exact original retry remains stable.
3. main uses installed STYNX DI interceptor chain, which converts HTTP errors into
   real SDK errors. Boundary uses public @stynx-nyx/angular classifyStynxError to
   recognize them, then RAIT's own catalogue/status mapping, safe context and
   validated responseBody.requestId. Unknown plain objects/Errors stay unknown;
   no arbitrary status412 duck-typing or raw server messageKey/text trust.
   The already installed SDK 1.5.3 is now an explicit exact dependency; recognition
   uses the public StynxSdkError class, independent of constructor names. Existing HttpErrorResponse/unavailable paths remain intact.
4. Successful admit and reject reload the case and checklist without requiring
   SSE; dismissal and failure preserve their existing behavior.
5. Inspector authored RED before code with realistic weak GET→command and actual
   installed ErrorInterceptor, then ran positive/negative tests. No weakened raw
   ETag, full inventory, preview zero-network, guard or error catalogue assertions.
6. Verify actual browser final receipt if present; pending final root gates must
   remain pending, never inferred PASS. Local synthetic session/verifier is not
   cryptographic JWT/real IdP or individual same-tenant scope. Original round and
   full JW-01 remain open; no merge/close/seal or proof mutation is authorized.

Return ONLY raw JSON, no Markdown/backticks. First character {, last character }.
Keys: mode=delivery-review, round=R-0025, item=browser-boundaries, cycle=1,
verdict=PASS|REVIEW|FAIL, findings=[{severity:high|low,file:relativepath,line:integer,
claim:concrete source-backed issue,fix:required correction}], notes=[observed
identity/scope/results/limits]. PASS accepts this bounded delta only.
