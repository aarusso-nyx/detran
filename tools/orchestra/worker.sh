#!/usr/bin/env bash
# Executor de workers pela CLI do Codex (docs/meta/agents/orchestra/README.md §2 — desvio
# autorizado pelo Owner em R-0014 AUTHORIZATION.md Amendment 2: workers da outra família enquanto
# a família do maestro está no limite de uso). O worker escreve na worktree dentro da sua fronteira
# (sandbox workspace-write), nunca executa git (regra do prompt; o transcript JSONL é conferido e o
# maestro confere `git status`), e o relatório final vai para <relatorio.md>; o transcript fica ao lado.
#
# Uso: tools/orchestra/worker.sh <modelo> <esforco> <prompt.md> <relatorio.md> [<worktree>]
#   codex exec -m <modelo> -c model_reasoning_effort=<esforco> -c sandbox_workspace_write.network_access=true \
#              -C <worktree> -s workspace-write \
#              --skip-git-repo-check --json -o <relatorio> - < prompt  > <relatorio>.jsonl
set -euo pipefail

model="${1:-}"; effort="${2:-}"; prompt="${3:-}"; out="${4:-}"; cwd="${5:-$(pwd)}"
if [[ -z "$model" || -z "$effort" || -z "$prompt" || -z "$out" ]]; then
  sed -n '2,11p' "$0" >&2; exit 2
fi
[[ -f "$prompt" ]] || { echo "worker: prompt não encontrado: $prompt" >&2; exit 2; }
[[ -d "$cwd" ]] || { echo "worker: worktree não encontrada: $cwd" >&2; exit 2; }
repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
command -v node >/dev/null || { echo "worker: ARCHIVAL_PC_GUARD_INTEGRITY: Node ausente" >&2; exit 7; }
node "$repo_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs" --repo-root "$repo_root" --prompt "$prompt"
command -v codex >/dev/null || { echo "worker: codex CLI ausente" >&2; exit 3; }
mkdir -p "$(dirname "$out")"

started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
head_before="$(git -C "$cwd" rev-parse HEAD)"
codex exec -m "$model" -c "model_reasoning_effort=\"$effort\"" -c "sandbox_workspace_write.network_access=true" -C "$cwd" -s workspace-write \
  --skip-git-repo-check --json -o "$out" - < "$prompt" > "${out%.md}.jsonl"
ended="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
head_after="$(git -C "$cwd" rev-parse HEAD)"
# O worker nunca executa git: a prova é o transcript (todo comando fica em `command_execution`).
# O HEAD pode mudar por commits do maestro em paralelo; por isso é só registrado, não comparado.
if grep -o '"type":"command_execution","command":"[^"]*' "${out%.md}.jsonl" | grep -Eq '(^|[^a-z-])git( |$)'; then
  echo "worker: o transcript contém um comando git — fronteira violada (${out%.md}.jsonl)" >&2; exit 5
fi

sha() { shasum -a 256 "$1" | cut -d' ' -f1; }
record="${out%.md}.worker.json"
cat > "$record" <<JSON
{
  "family": "codex",
  "model": "$model",
  "effort": "$effort",
  "prompt": "$prompt",
  "prompt_sha256": "$(sha "$prompt")",
  "report": "$out",
  "report_sha256": "$(sha "$out")",
  "transcript": "${out%.md}.jsonl",
  "cwd": "$cwd",
  "head_before": "$head_before",
  "head_after": "$head_after",
  "started_at": "$started",
  "ended_at": "$ended"
}
JSON
echo "worker: codex/$model ($effort) -> $out (registro $record)"
