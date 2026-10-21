# Clean candidate observation

Evaluated commit: `329f2472ac184b1141d6cc84c4157c5cc84a3df7`.
Evaluated tree: `d20fdea7082c2d9c0102f302ae6472ab1ac0ac1a`.
The official doctor identifies this candidate as clean.

The Vite compatibility repair succeeds: the unsupported-version refusal is gone. The clean-candidate doctor nevertheless returns REVIEW / inner `ok:false`, because all seven native invariant tasks refuse `AUDIT_PROJECTION_LINK_REFUSED`. Other doctor checks pass.

The actual official invocation was:

```text
PATH=/tmp/detran-c6-vite736-bin:$PATH pnpm exec devai sense run unit_test --repo-root . --as-role engineer --write --input '{"taskId":"invariant-ch","population":"detran-invariant-ch-v1"}' --format json
```

It exits 3 before test execution. The complete error envelope is on STDERR; empty STDOUT is authentic. No sensor reading was persisted and no test PASS was claimed. A second identical invocation confirms the same refusal; the retained CH streams are from that second run against the same clean commit.

The next precise barrier is existing native closure policy: `packages/cli/src/commands/sense/native-runner-selection.ts` loops over every non-mutated tracked path and calls `readCandidateFile`. `packages/sensors/src/audit-projection.ts` rejects any symlink component. The only tracked symlink in this candidate is `apps/rait/web/src/app/preview/fixtures`, whose actual link text is `../../../../../../docs/framework/arch/fixtures`. Its existence therefore prevents the native whole-candidate regular-file check, independently of whether CH imports it.

No symlink, runtime fixture, guard, provider policy or application source was changed to bypass this refusal. Parent receives this bounded blocker for a separately reviewed repair; the complete population and fail-closed semantics must remain intact. No proof chain, legacy chain, historical round or threshold was changed by this work.
