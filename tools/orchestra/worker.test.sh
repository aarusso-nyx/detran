#!/usr/bin/env bash
# Prova do executor de workers (tools/orchestra/worker.sh) com um `codex` falso: o relatório vai
# para o caminho pedido, o registro traz os hashes e o HEAD é conferido.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT

mkdir -p "$fixture_root/bin" "$fixture_root/reports" "$fixture_root/repo"
git -C "$fixture_root/repo" init -q && git -C "$fixture_root/repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m init
printf '%s\n' 'Execute the fixture task and report.' > "$fixture_root/prompt.md"
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -euo pipefail' \
  'while (($#)); do' \
  '  if [[ "$1" == "-o" ]]; then' \
  '    shift' \
  '    printf "%s\n" "Papel: Inspector" > "$1"' \
  '    printf "%s\n" "{\"type\":\"turn.completed\"}"' \
  '    exit 0' \
  '  fi' \
  '  shift' \
  'done' \
  'exit 2' > "$fixture_root/bin/codex"
chmod +x "$fixture_root/bin/codex"

PATH="$fixture_root/bin:$PATH" "$repo_root/tools/orchestra/worker.sh" \
  fixture-model low "$fixture_root/prompt.md" "$fixture_root/reports/TASK-TEST.md" "$fixture_root/repo"

node - "$fixture_root/reports/TASK-TEST.md" "$fixture_root/reports/TASK-TEST.worker.json" "$fixture_root/reports/TASK-TEST.jsonl" <<'NODE'
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const [reportPath, recordPath, transcriptPath] = process.argv.slice(2);
assert.equal(readFileSync(reportPath, 'utf8'), 'Papel: Inspector\n');
const record = JSON.parse(readFileSync(recordPath, 'utf8'));
assert.equal(record.family, 'codex');
assert.equal(record.model, 'fixture-model');
assert.equal(record.effort, 'low');
assert.equal(record.report_sha256, createHash('sha256').update(readFileSync(reportPath)).digest('hex'));
assert.match(record.head, /^[0-9a-f]{40}$/);
assert.ok(readFileSync(transcriptPath, 'utf8').includes('turn.completed'));
console.log('worker.test: OK');
NODE
