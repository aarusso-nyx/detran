# S2-R1 — explicit external execution resources

Role: Owner decision recorded by Architect; operational provisioning by Engineer.

The Owner authorized recommended choices for the current approved S2 during
2026-10-19T21:39:32Z–2026-10-20T02:39:32Z, ending on return to console.
Decision: adopt the recommended external-checkout execution arrangement below.

Observed: TASK-0032 queue registration succeeded, but resource provisioning
cancelled the task: four autonomous DEVAI worktrees already occupy the cap.
No S2 managed worktree was created. Installed DEVAI2.6.3 exposes no supported
retain/adopt command; internal helpers and experimental dispatch are not authorized.

Preserve every S1 task, checkout, registry, expired lock and recovery receipt.
Leave the autonomous cap and governance configuration unchanged. Register fresh
S2 tasks using supported queue/start commands without --with-worktree; declared
module locks remain governed. Execute role work in ordinary, explicitly external
Git checkouts at recorded checkpoint SHAs. These checkouts are not DEVAI-managed
worktrees and must never be reported as such. Root owns all Git operations.

Maintain Architect source → independent Inspector RED → Engineer implementation
→ independent GREEN/review ancestry. Record external paths and actual results;
requested historical executor metadata is not proof of the actual served model.
Do not fabricate task lifecycle completion. This amendment authorizes operational
resources only: no runtime inventory expansion, legal rule, gate change, dependency,
S3/UI activation, production action, scorecard change or destructive cleanup.
Stop for an actual resource ownership conflict or unsupported lifecycle mutation.

Rationale: a disposable role checkout preserves source custody and recovery without
raising DEVAI autonomous capacity or deleting old resources. The human-authorized
external execution boundary is explicit and independently auditable.
