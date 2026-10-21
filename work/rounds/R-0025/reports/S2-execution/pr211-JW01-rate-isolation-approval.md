# Proposed JW01 isolated rate capacity — NOT AUTHORIZED

Inspector recommendation; explicitOwner approval required. CurrentOwner authority covers onlyclaim/scope, so this packet is proposal only and noJW01 source was changed.

Exactly one path: `backend/app/tests/e2e/rait-jw01-admissibility.e2e.spec.ts`.
Save original STYNX_RATE_LIMIT_DEFAULT once; set10000 only for this suite before dynamicAppModule import; restore in guaranteedfinally after app/fixtureclose even failures. RealPGlimiter/tenant/role/purpose guards remain active. No limiterrows cleared, no mock/disabledguard, no production120default, window, route, policy, budget, timeout, populations, assertions or otherpath changes. Adjacent proposedpatch concretely shows capacity/lifetime only; acceptance also requires actualown-tenant PGwindow proof and unchangedPEC ratecontrols under originalcapacity.

Evidence: canonicalfullapp50JW01controls42PASS8FAIL. All8latefailures are429 Rate limit exceeded masking businessassertions. Existing suite performs repeated triage/save/admit under canonical shared RAIT_ACTOR/SECRETARY in5.647s. Runtime default120/60s remains enforced; fixture resets businessrows, neverratewindows. This is consistent with same suite-isolation pressure previously approved forscope. Actual bucketrows were erased by later supportedupgrade rehearsal, so no verified cross-suitebucketcollision is claimed. Re-execution with capturedwindow required; ifunexpected isolation mechanism emerges, stop rather thanexpand.

Approval would permit only this bounded capacity/lifetime+proof correction, followed by unchangedfull50 and unchangedPECcontrols. Until approval, leaveJW01source untouched and failures OPEN.
