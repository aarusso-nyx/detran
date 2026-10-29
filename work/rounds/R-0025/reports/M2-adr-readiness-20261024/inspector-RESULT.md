# Inspector: finite provenance fixture qualification

Original exact18 added vectors executed unchanged, twice: against current5dec824a tools and archived68084d5b tools. Source snapshots/sourceSHA verified before and after. Both fixture helpers are byte-identical across these revisions. No runtime helper/test/assertion edit.

| Tool source | Renumber9vectors | Gate9vectors | Combined |
|---|---|---|---|
|Current5dec824a (same toolbytes asS2head9b2a190a)|7PASS/2FAIL,exit1|7PASS/2FAIL,exit1|14PASS/4FAIL deliberateRED|
|Archived68084d5b|9PASS/0FAIL,exit0|9PASS/0FAIL,exit0|18PASS/0FAIL fixturequalification|

Each selected population has9tests/0skip/0cancel/0todo; no skip-as-PASS. Total36 authentic executions. Both currenttool families fail the valid-multi-origin vector (currentline3-only validator rejects a genuine second origin) and no-separator vector (currentvalidator accepts first-lineprovenance without required leading-block separator). Remaining7negativevectors per tool reject forged suffix, body-only, missing/wrongorigin, ordinaryprose, proseboundary and wrongfirstline as asserted. Archivedtools pass both positive/strictnegative boundaries. Renumbervectors retain original snapshot-byte-preservation assertions and validcase0pending assertions.

ActualNode24.15.0, builtins only. Four commands ran sequentially using `--test-isolation=none --test-concurrency=1`, exactprefix selection and128MiBheap inherited perNodeprocess. Original testparent awaited at mostONE NodeCLIchild; observedprocessshapes recorded, no thirdworker/service. Root expressly clarified this allowed shape. Total wall2.053250541910529s under30s cap. Full argv/safeenvironment/status/stdout/stderr/sourceSHA/processobservations retained percommand. No broad122testpopulation ran.

Temporary synthetic config/ADR/closure fixtures were created only inside this externalownedTMPDIR by original fixture functions, and originalfinallycleanup removed all temporaryroots. These are disposable testfixtures, not dynamicnativegovernance artifacts. Tool/test sourcecopies remain byte-identical. No install/build/nativeproducer/DB/service/indexrefresh/RC/sign/publish, worktree/sourcewrites, branchswitch or protectedhistorymutation.

**ArchivedPASS qualifies only this finite fixture behavior.** It is not currentdelivery, integrationapproval, nativeevidence, acceptedADRmaterialization, recovery/adoptioncompletion or permission to copyruntimehelpers into source. CurrentRED is a deliberatecounterexample, not deliveryfailure. OriginalT/P/newsource/recovery gates, PR211hold,C6block and STYNXheavywindow remain unchanged.
