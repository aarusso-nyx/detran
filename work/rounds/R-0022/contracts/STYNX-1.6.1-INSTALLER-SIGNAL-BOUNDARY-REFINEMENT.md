# Installer signal boundary refinement

Architect/F1. This is a concrete completion of D1 in946cd679, combined with D5 in2bf0c2ad before the next source candidate. Preserve candidate02 and28 source results. Execution seals remain null; no SQL is authorized here.

Check irreversible interruption before ordinary verifyReadOnly starts another target client, before full DROP DATABASE, and before full CREATE DATABASE. A signal during role/prechecks or between destructive operations must not allow the next ordinary action. Once DROP was attempted, interruption retains full-lifecycle-stop facts and never infers database recreation or restoration. Recovery readBack remains allowed under the retained maintenance lock to establish actual state.

A signal during final role verification or maintenance cleanup must also preclude the final committed-verified outcome even if cleanupErrors is empty. Derive the stopped disposition from actual committed/commitAttempted/destructiveAttempted facts, preserving primary error, cleanup and actual observations. No commit success, rollback or database OID may be inferred from signal timing. Inspector adds pertinent source witnesses before the combined F2 correction; actual signal behavior remains separate leased PostgreSQL proof.
