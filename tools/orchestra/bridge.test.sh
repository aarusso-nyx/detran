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

# Caracterização RED A3.5: bridge rejeita fonte arquivística antes de mktemp e da CLI.
guard_root="$fixture_root/guard-root"
mkdir -p "$guard_root/bin" "$guard_root/tools/orchestra" "$guard_root/tools/devai" "$guard_root/fixture-repo"
cp "$repo_root/tools/orchestra/bridge.sh" "$guard_root/tools/orchestra/bridge.sh"
if [[ -f "$repo_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs" ]]; then
  cp "$repo_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs" "$guard_root/tools/devai/"
else
  printf '%s\n' '#!/usr/bin/env node' 'process.exit(0);' > "$guard_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs"
fi
node - "$guard_root" <<'NODE'
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.argv[2];
const ids = ['TASK-0004-S1', 'TASK-0004-S2', 'TASK-0004-S2-R1', 'TASK-0004-S3', 'TASK-0004-S4', 'TASK-0004-S5', 'TASK-0078', 'TASK-0079', 'TASK-0080', 'TASK-0081', 'TASK-0082'];
const original_sources = ids.map((task_id, index) => {
  const kind = index < 6 ? 'task-prompt' : 'task-json-original';
  const path = kind === 'task-prompt' ? `work/rounds/R-0007/prompts/${task_id}.md` : `work/rounds/R-0007/tasks/${task_id}.json`;
  const bytes = Buffer.from(`fixture archival source ${task_id}\n`);
  const target = join(root, path); mkdirSync(join(target, '..'), { recursive: true }); writeFileSync(target, bytes);
  const raw_sha256 = createHash('sha256').update(bytes).digest('hex');
  const canonical_sha256 = createHash('sha256').update(bytes.toString().replace(/[ \t\n]+$/u, '')).digest('hex');
  return { task_id, kind, path, raw_sha256, canonical_sha256 };
});
const manifest = { schemaVersion: '1.0.0', round_id: 'R-0007', status: 'pre-migration', canonicalization: 'utf8-bom-crlf-trailing-v1', expected_counts: { task_prompts: 6, task_json_originals: 5, archive_packages: 11, canonical_tasks: 11, sidecars: 11 }, original_sources };
const target = join(root, 'work/rounds/R-0020/contracts/CTG-0003-A3.5-guard-manifest.json'); mkdirSync(join(target, '..'), { recursive: true }); writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
NODE
printf '%s\n' '#!/usr/bin/env bash' 'printf codex >> "$FAKE_CLI_LOG"' 'exit 0' > "$guard_root/bin/codex"
printf '%s\n' '#!/usr/bin/env bash' 'printf claude >> "$FAKE_CLI_LOG"' 'exit 0' > "$guard_root/bin/claude"
chmod +x "$guard_root/bin/codex" "$guard_root/bin/claude"
archive_prompt="$guard_root/work/rounds/R-0007/prompts/TASK-0004-S1.md"
guard_failures=0
for family in codex claude; do
  out="$guard_root/out/$family.json"
  set +e
  FAKE_CLI_LOG="$guard_root/$family.cli" PATH="$guard_root/bin:$PATH" "$guard_root/tools/orchestra/bridge.sh" "$family" fixture "$archive_prompt" "$out" "$guard_root/fixture-repo" >/dev/null 2>&1
  status=$?
  set -e
  if [[ "$status" -ne 6 || -e "$out" || -e "$guard_root/$family.cli" ]]; then
    echo "bridge test: RED A3.5 ($family): esperava exit 6 antes de CLI/saída" >&2
    guard_failures=$((guard_failures + 1))
  fi
done
if (( guard_failures > 0 )); then
  echo "bridge test: RED A3.5: $guard_failures caso(s)" >&2
  exit 1
fi
