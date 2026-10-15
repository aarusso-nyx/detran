# Architect fixed exact-buffer creation entry, prospective source only

Status: SOURCE ONLY, NOT ADMISSION. This specifies the entry for accepted disabled creator05, not executable authority. Engineer authors it; F1/F3 review exact source before Root issues records. The actual holder is `/root/engineer_portable_custody`; Root is issuer. Existing local-only authority suffices for one owned inert creation after these concrete controls, with no new Owner question.

## Fixed paths and invocation

Entry: `scratch/r22-adoption-161/public-installer-preparation/populated-history-target-linux-runner-creation-05/run_creation_admitted.py`.
Admission: same directory, `ROOT-CREATION-INVOCATION-ADMISSION.json`.
Creation permit: same directory, `ROOT-RUNNER-CREATION-PERMIT-ISSUED.json`.
Entry output: same directory, `admission-entry-01/`.
Creator source: same directory, `create_inert_runner_once.py`, SHA256 `b44968796f3feb5e264c3b33a917941a69f393428b470b89f53b09247d66e087`.
Creator output: same directory, `actual-one-use-creation/`.
Operational host leaf remains the amended `populated-history-target-linux-runner-creation-03/empty-image-pgdata`; no new leaf selector.

Invocation has exactly one argument, lowercase64hex **admission SHA**, with no source/permit/path/env selector. Use a closed launcher environment LANG=C, LC_ALL=C, TZ=UTC. Current observed host Python executable is `/opt/homebrew/Cellar/python@3.14/3.14.7/Frameworks/Python.framework/Versions/3.14/bin/python3.14`, 34,640 bytes, SHA256 `87d4df53fd91304be5bac391fb204643c36b7df2023c04a0953bcbc7d4fdf634`; this is a local byte observation, not a claim about Python release trust. Pin that actual canonical executable and invoke with `-I -S` so no site/.pth/PYTHONPATH startup or source-directory import lookup participates. A changed interpreter requires a reviewed new binding; no ambient python3 fallback. The eventual Root invocation record retains the exact argv/env/tool identity.

## Closed eleven-key admission record

The exact top-level keys are:

`kind,status,issuer,holder,maxInvocations,consumedInvocations,entry,creator,permit,python,reviewRefs`.

Values: kind=`root-one-use-inert-runner-creation-entry-v1`; status=`ISSUED`; issuer=`/root`; holder=`/root/engineer_portable_custody`; maxInvocations strictlyint1; consumedInvocations strictlyint0.

`entry`, `creator`, `permit` and `python` are closed `{path,bytes,sha256}` records. Bytes is strictly positive int; sha256 is exactly `sha256:` followed by lowercase64hex. The first three paths are their literal repository-relative paths above, not alternatives. Python path is the literal absolute canonical executable above. Rehash actual bytes, require nonsymlink regular files and no parent redirection. Entry self bytes must equal the entry B3. Creator source must also equal the fixed reviewed b449 SHA.

`reviewRefs` is closed `{entryArchitect,entryInspector,creatorArchitect,creatorInspector}`, each an exact B3 referring to a distinct completed immutable report. Reports must be under owned source-review locations and independently checked for their actual actors/source identities before Root issuance. Entry rehashes these exact bytes; it does not mint an Inspector review. No null, draft, placeholder, extra key, boolean counter or unknown path is accepted.

Parse admitted UTF8 JSON with duplicate keys refused. The entry reads each admitted buffer once, hashes before parse/compile and uses that exact buffer. Rehash source/admission/permit/reviews immediately before invocation and at closure; any movement refuses or becomes UNKNOWN. The fixed reviewed creator validator checks its exact closed seventeen-key permit, host UID/GID, Root issuer/Engineer holder, fixed image/names/leaf/toolchain/source/reviews/effect roster and max1/consumed0. Permit sourceRefs must bind this exact creator and completed creator reviews; no source or permit correction is performed by the entry.

## Acyclic authoring order

1. Freeze creator05 and its source reviews.
2. Author/freeze/review the entry. It knows fixed paths/schema/current creator identity, but embeds no future admission or permit digest.
3. Root issues the exact creation permit, binding creator and its reviews. It need not contain a future entry or admission hash.
4. Root issues the admission record binding final entry, creator, issued permit, Python and the four completed reports.
5. Root and independent reviewers verify exact records/refs. Engineer invokes the fixed entry with the admission's exact externally supplied SHA once.

Admission is external immutable authority data. Nothing rewrites entry/source/permit to include its own future hash, and no circular self-seal is used. Source/entry reviews may reference immutable pre-admission bytes rather than nonexistent future records.

## Entry consumption, exact evaluation and authoritative returned disposition

Before any Docker command or creator call, validate argument shape; fixed admission regularity/hash and closed schema; all B3s/current source/Python/flags; actual issued creator permit authority; absent entry output and creator output via lstat (including dangling symlinks). Do not create or delete the operational leaf. Creator's own immediate absence checks and durable consumption remain required inside run_once.

Create the entry's exclusive mode0700 output, retain admitted admission/source/permit/review identity, then durably write `ENTRY-CONSUMING.json` with file, output-directory and parent fsync before compile/exec or invoking the creator. The recorded entry invocation count is one; actual creator-call counters start at zero. Failed validation has no creator call. No retry or second output namespace.

Compile and exec only the exact admitted creator buffer into a fresh non-main `types.ModuleType` with `__file__` set to the literal canonical creator path and a fixed non-main `__name__`. Do not use importlib loaders, sys.path package imports, .pyc, AST rewriting or text transformation. Do not evaluate any SDK/Nest/pg/fixture. Resolve the actual `run_once` function from that exact module before setting call-attempt status. Pass only the raw lowercase64hex digest from the admitted permit B3 to `run_once(expected_permit_sha256)` once.

Record creatorCallAttempted/creatorReturned as strict booleans and attempted count0/1, distinguishing compile/exec/lookup failure from a call exception. Any exception, moving source or incomplete receipt is UNKNOWN. A returned value is not invented or reconstructed: retain its actual JSON-safe bytes in an exclusive `CREATOR-RETURNED-DISPOSITION.json`, then retain an entry `VERDICT.json` referencing that B3, actual call counters, exception information, entry/admission/creator/permit hashes and closing rehash status. Retain first creator OUTCOME and all additive correction B3s as immutable records; never overwrite or treat first pending-success as authoritative after an actual returned UNKNOWN. If the creator returns unexpected shape or late interruption, refuse next phase.

Success means only `RUNNER_CREATED_PENDING_INSPECTOR_BIRTH_CLOSED`, current directory acknowledged, actual CID/host identity and retained receipts. It is not CLOSED birth or accepted resolver evidence. Entry stdout/status must distinguish a closed entry from an accepted creation; use a fixed documented single-line completion protocol and retain raw outer stdout/stderr/exit/PID. Nonempty unexpected output, abrupt termination, unavailable verdict or a leftover consuming marker without completion remains UNKNOWN; do not synthesize closure. A signal after creator restores originals follows original caller policy; lack of returned disposition prevents future admission. The entry may not stop/delete/retry independently; qualified cleanup remains creator scope or a separate reviewed cleanup.

## Required inert source witnesses before issuance

Reject wrong admission SHA/unknown or duplicate keys; mismatched self/creator/permit/review/Python bytes; wrong actor/counter; nonisolated interpreter; existing/dangling entry or creator output. Verify compile/exec failure reports callcount0; call exception reports attempted1/returnedfalse; ordinary returned pending disposition is retained exactly; returned UNKNOWN and linked correction cannot admit birth/resolver. Verify exact-buffer execution despite poisoned loader/.pyc, one run_once call with the admitted permit digest, movement before call, and terminal signal/incomplete-verdict UNKNOWN. All are TEST_ONLY control-plane ports, not Docker effects.

A future invocation is allowed only after exact source/record reviews and Root issuance, by the actual Engineer holder. Then Root records return and Inspector independently captures complete CLOSED new birth under caller07's path. A separate reviewed caller07 source-buffer entry and separate one-use resolver permit are still required. No DB/server/role/SDK/fixture/native CI/provider/trust or publication authority follows.
