# C6 native Vite compatibility — Engineer delivery

The installed DEVAI 2.6.3 runner rejects Vite versions other than 7.3.6. Its runner selection resolves Vite from the selected physical Vitest package, not from the executable alias. The original root Vitest 4.1.11 resolved Vite 8.2.2. The provider also authenticates a Vite 7.3.6 platform-probe caller by exact file bytes and coordinates; no provider acceptance rule was relaxed.

## Bounded change

- Add `vitest@4.1.11>vite: 7.3.6` to the existing pnpm overrides, preserving all six existing overrides.
- Add exact root development tool dependency `vite: 7.3.6`. The override alone changed the peer requirement but retained the already selected Vite 8 peer; the explicit root peer pin is necessary with this pnpm 9.15.0 graph. Vitest declares Vite compatibility as `^6.0.0 || ^7.0.0 || ^8.0.0`.
- Regenerate the lock with official pnpm, then install with `--frozen-lockfile`.
- Provision the existing real installed Vitest alias in the independent foundation job and add its external directory to `GITHUB_PATH`, just as the producer job already does.

Physical before/after assertions confirm root Vitest 4.1.11 now resolves Vite 7.3.6. All five installed Angular build consumers remain Angular build 22.1.6 / Vite 8.1.5, the actual pre-C2 versions in this worktree. Their build dependency resolution was preserved. Official pnpm also reassociated two app Vitest peer snapshots among already present Vite 8.1.5/8.2.2 instances; no Angular build snapshot/version changed. C2's later Angular security upgrade remains separate.

## Actual validation

- Frozen installation: PASS.
- Physical root/Angular resolution assertions: PASS; full path receipts retained.
- CI isolation: 10 tests PASS, zero skipped.
- Prettier for changed manifest, lock and CI workflow: PASS.
- Installed task/adopter schemas: PASS.
- STYNX pin: PASS, remains 1.5.3.
- Full graph audit before and after the explicit root peer pin: unchanged 27 vulnerabilities (3 low, 10 moderate, 12 high, 2 critical), no new advisory IDs and no Vite advisory. This is the pre-C2 baseline, not an audit PASS. The isolated exact Vitest4.1.11/Vite7.3.6 graph audit returns zero vulnerabilities; its separate npm lock and raw response are retained.
- Prepared dirty-candidate doctor: REVIEW. All seven Vite-version refusals disappeared; all seven native tasks now correctly refuse the uncommitted candidate with `SENSE_NATIVE_CANDIDATE_DIRTY`. The outer successful JSON transport envelope does not override the inner failed readiness check. Clean-candidate execution remains the next official step.

A fresh external alias directory `/tmp/detran-c6-vite736-bin` avoids replacing the previous alias pointing at the old physical Vitest instance. The installer receipt records the genuine new entrypoint and SHA-256. No nonce, native reading, proof line or evidence-chain entry was manufactured. Native CH execution and any reading persistence require the clean committed candidate and authorized role; subsequent outputs will be handed to the parent/Inspector separately.
