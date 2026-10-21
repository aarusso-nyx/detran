# C7 harness coherence: exact remaining REVIEW

Read-only diagnosis of DETRAN governance checkout HEAD73c0b877980ce0e4f20fdd624c2f223a447c0e98 and the supplied actual reading /tmp/c5-c2-harness-coherence.json. No source, Git, state, bindings or evidence was changed. The provider workflow-parser/harness-coherence/adopter-closure source has no diff from v2.6.3; compiled existing parser functions were invoked read-only for diagnostics.

## Conclusion

The concurrency group is valid. The remaining native REVIEW is not a YAML parsing failure or action pin drift. All eight jobs of ci.yml have unproved effects under the installed closed classifier. The separately generated attestation workflow classifies as publication and retains its serialized lock; it is not the reported issue.

The actual reading reports action_version_drift_count0, concurrency_mixed0, concurrency_semantic_issues1, incoherence_score1, max_review_incoherence3, verdict REVIEW. Preserve this supported conservative verdict. No threshold adjustment or broad trust declaration is warranted.

## Exact mechanism

workflowConcurrency reads ci.yml as group `${{ github.workflow }}-${{ github.ref }}`, cancelInProgress=true. Both contexts are admitted by the superseding subject grammar. In harness-coherence.ts:378–437, however, holds() additionally requires every job.effect to be proved and not unknown. Any unknown or publication is effectful; a superseding workflow lock cannot satisfy that rule.

The misleading generic text is explained by lines447–467: unknown job names are included only when replacing unknown with the strongest effect publication would itself satisfy the workflow declaration. With cancel=true that counterfactual also fails, so unknownAlone=false and the generic “declare ... true (superseding)” text is selected. It does not mean the existing group was absent or parsed incorrectly.

Read-only full-source jobEffectFacts results:

| Job | Native classifier effect | Direct structural blockers/examples |
|---|---|---|
| evidence-gate | unknown | Checkout candidate selector, NODE_AUTH_TOKEN installer env, pnpm exec evidence command and attested-route shell/env are unproved. |
| invariant-producers | unknown | services plus21 job env keys fail executionMetadata before per-step classification; Bash DDL/seed, native alias provisioning and seven bare native invocations also lack an admitted effect proof. |
| foundation | unknown | NODE_AUTH_TOKEN install, fail-closed shell gate, alias provisioning, package scripts/docs/doctor and whitespace command remain unproved. |
| backend-kernel-full | unknown | services plus19 job env keys; fallback and publishing shell. checks:write additionally gives a proved minimum publication effect under the current model even if other unknowns were resolved. |
| boat-documents-real | unknown | setup-python action inputs, installer env, Python virtualenv/pip/WeasyPrint commands, Docker pull and PDF validation env/closure are unproved. |
| senatran-mock | unknown | Docker Buildx/build-push actions and Docker Compose/curl/shell steps are unproved. |
| senatran-mock-tests | unknown | services plus7 job env keys; install env, working-directory package/DB/test commands are unproved. |
| stack-smoke | unknown | install env, Docker image/stack shell, package scripts and teardown are unproved. |

Actual-source full-job facts and canonical step facts are in /tmp/devai-c7-job-effects.json. Additional /tmp/devai-c7-step-diagnostic.json isolates one step at a time in in-memory YAML, optionally removes job env/services to identify the source of uncertainty. That file is explicitly a hypothetical diagnostic, not original workflow execution, reviewed standing or a native verdict. It confirms setup-node/pnpm actions can classify read-only in otherwise admitted metadata while service/env-bearing jobs remain unknown. Unsupported closure output for remote uses is not itself an unknown-effect proof; known registered remote actions are classified separately.

## Why an ordinary existing binding does not settle it

law/policy/adopter-policy.json1.3.0 contains no reviewed_workflow_steps block, and .devai/config/reviewed-workflow-steps.json is absent. The valid current binding does not own that projection. Therefore this is not a stale/missing rebind of already approved review entries.

The registered adopter review mechanism is intentionally closed:

- executionMetadata at workflow-parser.ts:1905–1933 refuses services/container and env keys outside its finite inert set. DATABASE_URL, runtime/profile/DB authorization keys and NODE_AUTH_TOKEN are not admitted as inert. These are meaningful CI inputs and credentials; do not remove or disguise them to change classification.
- adopterStepExecution at1613–1635 refuses any workflow/job/step env and uses steps. Therefore adding a reviewed occurrence cannot override the service/job metadata refusal, cannot certify installer env, and cannot blanket-trust the external Docker/Python uses. The emitted workflowReviewInventory reports zero complete adopter-review closures for68ci.yml steps (and zero for13generated verifier steps). This is a bounded capability result, not evidence those steps are unsafe.
- An existing supported review entry must bind canonical YAML digest, all actual matching occurrences, exact executable closure/file hashes, current source/target binding and a substantive review. A generic effect label, empty closure, wildcard trust, or convenient composite wrapper would not meet that contract.

Thus no small honest “add reviewed_workflow_steps and bind” fix makes current native concurrency coherent. Even hypothetical complete read-only proofs for ordinary steps leave backend-kernel-full checks:write modeled as publication, which requires serialization under the present policy. Disabling superseding cancellation for the whole CI, removing required check publication, changing credential plumbing, moving services/env to hide them, or editing the generated attestation workflow would change the required behavior or conceal the gap.

## Recommended disposition

Keep C7's implemented action-pin convergence and workflow/ref cancellation semantics; retain separate serialized official attestation. Record the native REVIEW with these exact evidence limits as the remaining control-model/review capability gap under BL-0022. This is a supported verdict, not an unmeasured cell, readiness approval or a claim that the current group is broken. No product change and no provider expansion is needed to report it truthfully.

A future bounded packet may review explicit step closures where representable and, separately, design exact classification of the service/env/remote-action/check-publication paths with independent negative tests and protected semantics. It would require an architecture/effect contract and genuine proofs, not a registry entry solely to get PASS. Changing the generic diagnostic to name both actual unknown jobs and known publication constraints could improve clarity without changing admission, but that is optional separate provider work and does not resolve current standing.

No configuration or publication action is proposed now. The independent C5-C8 delivery review may reach the same conclusion; its in-progress file is not claimed as a completed review here.
