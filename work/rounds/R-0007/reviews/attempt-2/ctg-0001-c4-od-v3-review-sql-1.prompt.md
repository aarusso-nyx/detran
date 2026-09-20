# C4-OD V3 — independent SQL-byte review 1

Role: independent Auditor, model Fable 5, read-only. Review the exact
TASK-0029 preparation candidate before **any** PostgreSQL apply, including
the 52 DDL inputs and all outputs that the approved transaction would consume.
Worktree: `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`.

Read the finite paths in
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL-REVIEW-READSET.md`
and the frozen manifest. The adapter verifies SHA-256 bytes before and after.
No shell, edits, SQL execution, DB connection, tests, generation or Git. Prior
V3/DDL05 reviews concern other candidates; none approves these SQL19/apply
bytes. Judge actual implementability and safety, not just documentary intent.

Audit these gates in particular:

1. `apply.sh` inventory, exact-once phase ordering (pre just before DDL34,
   DDL20 before enforce, verify last), one `psql -X`/`ON_ERROR_STOP=1`/
   `--single-transaction` connection for normal schema application, advisory
   and table locks, no per-file commits, fail-closed lexical inspection,
   success after commit. `--full` may drop only the explicitly authorized
   dedicated disposable DB, creation outside transaction, owner preserved;
   no claim that a failed full install recovers an erased DB. No seeds inside
   schema transaction. Check actual shell/psql behavior, including preflight
   errors, connection/role change, and DDL transaction compatibility.
2. Pre/enforce/verify SQL against real DDL34, DDL20, DDL05/14 and the frozen
   TASK0028 sensor. Legacy rows/unknown priority strings must remain in situ;
   no snapshot-restore mask. Fresh and upgrade must converge in tested schema,
   ownership, ACL, indexes, RLS/FORCE, triggers and data; no silent acceptance
   of unsupported legacy shape or DDL14 divergence. No permissions confirmed
   between phases, and rollback/fault injection must be possible with the
   frozen harness. Identify any SQL that cannot parse or run on PostgreSQL.
3. New `role_rait_priority_writer` exactly matches OWNER authorization:
   NOLOGIN/NOSUPERUSER/NOBYPASSRLS/NOCREATEDB/NOCREATEROLE/NOREPLICATION,
   no app membership, no silent alteration of incompatible existing role.
   Function SECURITY DEFINER, fixed safe search_path, no dynamic SQL in
   user-facing function, PUBLIC EXECUTE revoked, minimal grants, RLS/FORCE,
   actor membership within tenant/scope; app authenticates actor via HTTP,
   database only validates actorId membership and does not claim independent
   authentication. Check TEMP marker anti-spoofing, precreation, owner/persistence
   checks, same-session/transaction use, pool reuse, direct SQL invocation and
   commit cleanup, including grant TEMP on dedicated DB and privilege boundary.
4. Priority proof semantics: exact parameter JSON/policy snapshot, six Clock
   providers, age at qualification act, PCD attachment validated at protocol,
   none default, no post-protocol proof/requalification, append-only facts with
   future revision mechanism still possible by later authorized policy, but
   currently forbidden. Verify function rank derives from trusted validated
   evidence rather than caller rank/flag, and denies malformed/spoofed/cross-
   tenant proofs. Assess trigger/constraint timing for first INSERT, commit,
   legacy cases and direct app/writer writes, and id/protocolled_at immutable.
5. BP/manual OpenAPI/DDL34/generated alignment, 17 case entities, 14 commands,
   legal priority not writable via generated repository, manual POST contract,
   six Clock declarations, and no unauthorised handwritten/tooling edits.
   Report preparation gates as coordinator-reported only: two generations zero
   drift, checks/README manual PASS, 96 paths and 52 DDL SHA aggregates. Do not
   infer build/runtime PASS: handwritten Clock provider is a later task.
6. Operational readiness: does the frozen TASK0028 harness actually exercise
   this candidate in the dedicated DB with explicit role/context/fixtures,
   nominal positive test counts and no zero-test PASS? Are any extra SQL files,
   external grants, existing constraints, extension features or owner metadata
   needed that the allowed sequence does not provide? If any materially unsafe
   or unexecutable condition is found, mark it **high**, give exact file/line
   and smallest correction; do not waive it as a future DB-test question.

This review occurs before DB apply. A PASS approves only SQL bytes for the
subsequent authorized dedicated DB rehearsal; it is **not** a PostgreSQL PASS,
TASK0028 PASS, TASK0030 eligibility, or PR/merge approval. `origin/main` has
since advanced with new DDLs; PASS on this frozen 49+3 inventory is not
transferable after integration without exact revalidation/delta review.

Return **only** native structured JSON matching the supplied schema's five
keys: `mode="prompt-review"` (fixed transport literal, this is SQL-byte
review), `round="R-0007"`, `verdict`, `findings`, `notes`. Each finding must
have severity high/low, item integer 1–13, real relative path, existing
one-based line, concrete claim and actionable fix. PASS requires zero high;
REVIEW/FAIL must include high. No prose outside the structure, wrapper string
or invented executed test evidence.
