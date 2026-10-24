# Current exact Linux Bash5 fixture validation PASS

Inspector executed the entire unchanged historical Python harness (`e227c40171cfdcb04d6df38be41cc00ee7cbb97c83780b7468f9258513ceb62a`) and byte-identical current approved script (`9b83d4ba4d783acb48ec4b3148d988cbb03a7cfed539f039a1d602e253470673`) together inside the already present Linux Node image9137a20e2587. No assertion/reference normalization. Bash5.2.15, Python3 and Node available in that image.

Result: PASS,25 recorded cases (syntax,9state/TMPDIR combinations and9Node reference checks, present/missing reports,3simulated independent steps,aggregate). Original-failure/always-diagnostics/always-cleanup exits[1,0,0], aggregate1. Directory-variable unset/empty semantics and safe report-only output passed.

Execution used networknone,readonlyroot,128MiB,0.25CPU,32PIDlimit,rm,pullnever,nonserviceBashentrypoint. Only exact sanitized external /input readonly and dedicated /evidence writable were mounted. No repository/credential/sibling mounts or private environment forwarding. Owned container completed exit0 and is absent afterward; unrelated containers untouched.

Earlier unsupported hostBash3.2 syntax negative and first Mac/Linux transport-adapter assertion mismatch remain retained unchanged. They are environment/harness boundaries, not target product failures. This current unchanged Linux harness resolves the local modern-shell gap, but does not establish real stackhealth or live GitHub runner semantics. No stack,build,install,nativeproducttest or CI dispatch ran; no repository bytes written.
