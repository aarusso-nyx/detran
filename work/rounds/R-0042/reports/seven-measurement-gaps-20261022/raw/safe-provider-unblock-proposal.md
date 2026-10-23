# Safe proposal: provider loader observation boundary

Status: proposed, not implemented. Separate from the static JSON population repair and from the withheld C6 service/custody prototype. No retry or rephrasing of that withheld review is authorized here.

## Evidence and attribution limits

The final serial required DEVAI pre-push refuses: test:cli has48 failures and test:root has10. The static sensor, ADR/catalogue, schema, build, lint and typecheck nodes pass. Native positives report fs.openSync.readable as unsupported. The native-input-provenance source is byte-identical to baseline a1521a78; a full baseline gate was not reproduced, so no confirmed pre-existing attribution is made.

The Node loader stack calls a pre-captured original readFileSync binding, whose internal openSync reaches the installed guard at trusted depth zero. A first explicit UTF-8 diagnostic accepted the retained original binding and did not reproduce the refusal; that outcome is preserved. A separate default binary-read diagnostic reproduces the retained-binding/open-guard mechanism without invoking the native service/custody protocol or changing repository source. The distinction matters because the loader stack reads binary bytes. This supports only a mechanism hypothesis, not full baseline attribution or a security acceptance result.

## Reviewable scope and stop conditions

An independent HUMAN security review should first decide whether a finite package-owned Node-loader observation can bind the canonical path, bytes, caller and operation without broadening native read authority. Candidate implementation paths, only after that disposition, are packages/cli/src/native-input-provenance.ts and its focused adversarial regressions; any wider change needs a new packet. Keep generic descriptor reads and unknown/direct opens unsupported, alias and package boundaries strict, complete provenance and exact candidate bindings mandatory, and default permission/effect scopes unchanged.

Do not permit blanket trustedReadDepth around arbitrary callbacks/hooks, suppress fs.openSync.readable, accept reporter data without provenance, disable the hook, use alternate publication transport or skip required native tests. A safe finite boundary that cannot be demonstrated remains unsupported. Preserve both failed gates and all old records.

Required future evidence: exact baseline reproduction if approved, positive owned-loader observation, hostile retained bindings/callbacks/hooks and external/changed-path negative cases, ordinary/direct-descriptor refusal, source/candidate freshness, independent human security verdict, unchanged full required gate and official release RC. No review request for the withheld C6 prototype is submitted by this proposal.

## Dependency and effect boundary

Until that review and required checks succeed, keep the static repair local: no provider PR/source publication, merge or release through another route. Owner authorization for a new exact provider publication effect must also be established. DETRAN stays on2.6.3; its five canonical static readings remain gaps. C6 remains blocked with empty bindings and all nine native producers inactive. The separate product findings and closed rounds are untouched.
