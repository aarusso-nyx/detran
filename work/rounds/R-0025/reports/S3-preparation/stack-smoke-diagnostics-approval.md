# A2 — exact stack-smoke diagnostic amendment

Architect. **Proposed, not executed.** One Engineer path:
`.github/workflows/ci.yml`, only the existing manual `stack-smoke` job.

Run39698481809/job119561609883 failed `pnpm stack:smoke` after successful stack
health. `tools/stack/smoke.mjs` writes sanitized per-target rows through
`writeReport` to the directory selected by `DETRAN_STACK_STATE_DIR ?? join(TMPDIR ?? "/tmp", "detran-stack")` and exits
nonzero without printing those reports. The workflow runs cleanup but does not
retain them; the run's artifact list has only a Docker build artifact. The actual
failing target/reason is not recoverable from existing logs. The script, stack
controller and workflow are identical between pinned S2 and inspected main.

Recommended bounded change: immediately after the existing smoke step and before
cleanup, add one `if: always()` shell step that enumerates only
the exact report directory selected by the same nullish expression above,
for `smoke-report*.json` and `smoke-report*.txt`, prints
their names and contents, and explicitly reports when none exists. Do not print
process environments, database URLs, tokens or arbitrary stack-directory files.
Preserve the script's nullish precedence: an explicitly empty state directory
means the current directory; an empty TMPDIR means relative detran-stack.
Use nullglob and quoted path expansion. Existing smoke command, step failure,
timeouts, job condition, cleanup and all checks remain byte-identical.
No `continue-on-error`, dependency/pin changes or test edits. Log retention suffices;
no new upload action/dependency is needed for this first diagnostic amendment.

Engineer may implement only after explicit approval. Inspector reviews the exact
diff, verifies shell syntax and proves with disposable sanitized report files
that present reports print, missing reports are identified, and prior smoke
failure remains a failed job while diagnostics/cleanup still execute. Never claim
these harness checks prove stack health. Run the manual stack job against the
proper candidate and preserve its actual reports; any resulting repair needs its
own sourced ownership disposition. Do not start a competing local stack.

Stop for an additional path, unsanitized content, a required job/timeout change,
or any proposal to infer/fix the unknown failure without new evidence. S2 PR211
stays unmerged. Requested decision: approve this one-file diagnostic-only extension.

Exact proposed insertion (before “Stop the disposable local stack”):

```yaml
      - name: Print disposable stack smoke diagnostics
        if: always()
        shell: bash
        run: |
          set -euo pipefail
          if [[ -v DETRAN_STACK_STATE_DIR ]]; then
            report_dir="${DETRAN_STACK_STATE_DIR:-.}"
          elif [[ -v TMPDIR ]]; then
            report_dir="${TMPDIR:-.}/detran-stack"
          else
            report_dir=/tmp/detran-stack
          fi
          shopt -s nullglob
          reports=("$report_dir"/smoke-report*.json "$report_dir"/smoke-report*.txt)
          if ((${#reports[@]} == 0)); then
            printf '%s\n' 'No smoke report was produced; inspect the preceding failed step.'
          fi
          for report in "${reports[@]}"; do
            printf 'Smoke diagnostic: %s\n' "${report##*/}"
            cat -- "$report"
          done
```
