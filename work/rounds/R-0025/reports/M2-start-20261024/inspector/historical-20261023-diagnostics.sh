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
