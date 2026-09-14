#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT

mkdir -p "$fixture_root/bin" "$fixture_root/reviews"
printf '%s\n' 'Review the fixture and return JSON.' > "$fixture_root/prompt.md"
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -euo pipefail' \
  'while (($#)); do' \
  '  if [[ "$1" == "-o" ]]; then' \
  '    shift' \
  '    printf "%s" "${FAKE_CODEX_OUTPUT:-{\"mode\":\"prompt-review\",\"round\":\"R-TEST\",\"verdict\":\"PASS\",\"findings\":[],\"notes\":[]}}" > "$1"' \
  '    exit 0' \
  '  fi' \
  '  shift' \
  'done' \
  'exit 2' > "$fixture_root/bin/codex"
chmod +x "$fixture_root/bin/codex"
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -euo pipefail' \
  'printf "%s" "${FAKE_CLAUDE_OUTPUT:-{\"mode\":\"delivery-review\",\"round\":\"R-TEST\",\"verdict\":\"PASS\",\"findings\":[],\"notes\":[]}}"' \
  > "$fixture_root/bin/claude"
chmod +x "$fixture_root/bin/claude"

PATH="$fixture_root/bin:$PATH" "$repo_root/tools/orchestra/bridge.sh" \
  codex fixture "$fixture_root/prompt.md" "$fixture_root/reviews/result.json" "$repo_root"

node - "$fixture_root/reviews/result.json" "$fixture_root/reviews/result.bridge.json" <<'NODE'
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const [outputPath, recordPath] = process.argv.slice(2);
const output = readFileSync(outputPath, 'utf8');
const parsed = JSON.parse(output);
const record = JSON.parse(readFileSync(recordPath, 'utf8'));

assert.equal(parsed.verdict, 'PASS');
assert.match(output, /^\{\n  "mode": "prompt-review",/);
assert.equal(output.endsWith('\n'), true);
assert.equal(
  record.output_sha256,
  createHash('sha256').update(output).digest('hex'),
);
NODE

PATH="$fixture_root/bin:$PATH" "$repo_root/tools/orchestra/bridge.sh" \
  claude fixture "$fixture_root/prompt.md" "$fixture_root/reviews/claude.json" "$repo_root"

node - "$fixture_root/reviews/claude.json" <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const parsed = JSON.parse(readFileSync(process.argv[2], 'utf8'));
assert.equal(parsed.mode, 'delivery-review');
assert.equal(parsed.verdict, 'PASS');
NODE

printf '%s\n' '{"sentinel":true}' > "$fixture_root/reviews/invalid.json"
if PATH="$fixture_root/bin:$PATH" FAKE_CODEX_OUTPUT='not-json' \
  "$repo_root/tools/orchestra/bridge.sh" codex fixture "$fixture_root/prompt.md" \
  "$fixture_root/reviews/invalid.json" "$repo_root" >/dev/null 2>&1; then
  echo "bridge test: JSON inválido foi aceito" >&2
  exit 1
fi

node - "$fixture_root/reviews/invalid.json" <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

assert.deepEqual(JSON.parse(readFileSync(process.argv[2], 'utf8')), {
  sentinel: true,
});
NODE

[[ ! -e "$fixture_root/reviews/invalid.bridge.json" ]] || {
  echo "bridge test: registro criado para JSON inválido" >&2
  exit 1
}

echo "bridge test: PASS"
