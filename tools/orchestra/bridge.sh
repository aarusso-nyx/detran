#!/usr/bin/env bash
# Ponte entre famílias para o reviewer das orquestras (docs/meta/agents/orchestra/README.md §8).
# Invoca a CLI da OUTRA família de forma não interativa e somente leitura, grava a resposta e um
# registro com os hashes do prompt e da saída. Nunca escreve no repositório além de <saida>.
#
# Uso: tools/orchestra/bridge.sh <codex|claude> <modelo> <prompt.md> <saida.json> [<worktree>]
#   codex : codex exec -m <modelo> -C <worktree> -s read-only --ephemeral --skip-git-repo-check -o <saida> -  < prompt
#   claude: (cd <worktree> && claude -p --model <modelo> --permission-mode plan --output-format text < prompt) > saida
set -euo pipefail

family="${1:-}"; model="${2:-}"; prompt="${3:-}"; out="${4:-}"; cwd="${5:-$(pwd)}"
if [[ -z "$family" || -z "$model" || -z "$prompt" || -z "$out" ]]; then
  sed -n '2,9p' "$0" >&2; exit 2
fi
[[ -f "$prompt" ]] || { echo "bridge: prompt não encontrado: $prompt" >&2; exit 2; }
[[ -d "$cwd" ]] || { echo "bridge: worktree não encontrada: $cwd" >&2; exit 2; }
mkdir -p "$(dirname "$out")"
raw_out="$(mktemp "${out}.raw.XXXXXX")"
trap 'rm -f "$raw_out"' EXIT

started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
case "$family" in
  codex)
    command -v codex >/dev/null || { echo "bridge: codex CLI ausente" >&2; exit 3; }
    codex exec -m "$model" -C "$cwd" -s read-only --ephemeral --skip-git-repo-check -o "$raw_out" - < "$prompt"
    ;;
  claude)
    command -v claude >/dev/null || { echo "bridge: claude CLI ausente" >&2; exit 3; }
    (cd "$cwd" && claude -p --model "$model" --permission-mode plan --output-format text < "$prompt") > "$raw_out"
    ;;
  *) echo "bridge: família desconhecida: $family (use codex|claude)" >&2; exit 2 ;;
esac
ended="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

command -v pnpm >/dev/null || { echo "bridge: pnpm ausente; não foi possível normalizar a saída" >&2; exit 3; }
raw_out_abs="$(cd "$(dirname "$raw_out")" && pwd)/$(basename "$raw_out")"
if ! pnpm --dir "$cwd" exec prettier --parser json --write "$raw_out_abs" >/dev/null; then
  echo "bridge: saída do reviewer não é JSON válido: $out" >&2
  exit 4
fi
mv "$raw_out" "$out"
trap - EXIT

sha() { shasum -a 256 "$1" | cut -d' ' -f1; }
record="${out%.json}.bridge.json"
cat > "$record" <<EOF
{
  "family": "$family",
  "model": "$model",
  "prompt": "$prompt",
  "prompt_sha256": "$(sha "$prompt")",
  "output": "$out",
  "output_sha256": "$(sha "$out")",
  "cwd": "$cwd",
  "started_at": "$started",
  "ended_at": "$ended"
}
EOF
echo "bridge: $family/$model -> $out (registro $record)"
