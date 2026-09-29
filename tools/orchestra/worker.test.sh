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
assert.match(record.head_after, /^[0-9a-f]{40}$/);
assert.equal(record.head_before, record.head_after);
assert.ok(readFileSync(transcriptPath, 'utf8').includes('turn.completed'));
console.log('worker.test: OK');
NODE

# Negativo: transcript com comando git → o executor recusa (exit 5).
printf '%s\n' '{"type":"item.started","item":{"type":"command_execution","command":"/bin/zsh -lc git status"}}' > "$fixture_root/git.jsonl"
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -euo pipefail' \
  'while (($#)); do' \
  '  if [[ "$1" == "-o" ]]; then' \
  '    shift' \
  '    printf "%s\\n" "Papel: Inspector" > "$1"' \
  '    cat "$FAKE_TRANSCRIPT"' \
  '    exit 0' \
  '  fi' \
  '  shift' \
  'done' \
  'exit 2' > "$fixture_root/bin/codex"
if FAKE_TRANSCRIPT="$fixture_root/git.jsonl" PATH="$fixture_root/bin:$PATH" "$repo_root/tools/orchestra/worker.sh" fixture-model low "$fixture_root/prompt.md" "$fixture_root/reports/TASK-GIT.md" "$fixture_root/repo" 2>/dev/null; then
  echo 'worker.test: FAIL — comando git no transcript não foi recusado' >&2; exit 1
fi
echo 'worker.test: OK (recusa git)'

# Caracterização RED A3.5: a guarda deve rodar antes de criar a saída ou chamar a CLI.
# Cada caso segue após a falha para que a ausência atual da preflight revele todos os REDs.
guard_failures=0
guard_root="$fixture_root/guard-root"
mkdir -p "$guard_root/bin" "$guard_root/tools/orchestra" "$guard_root/tools/devai" "$guard_root/fixture-repo"
cp "$repo_root/tools/orchestra/worker.sh" "$guard_root/tools/orchestra/worker.sh"
if [[ -f "$repo_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs" ]]; then
  cp "$repo_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs" "$guard_root/tools/devai/"
else
  printf '%s\n' '#!/usr/bin/env node' 'process.exit(0);' > "$guard_root/tools/devai/assert-archival-prompt-not-dispatchable.mjs"
fi
git -C "$guard_root/fixture-repo" init -q
git -C "$guard_root/fixture-repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m init
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
  const target = join(root, path);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, bytes);
  const raw_sha256 = createHash('sha256').update(bytes).digest('hex');
  const canonical_sha256 = createHash('sha256').update(bytes.toString().replace(/[ \t\n]+$/u, '')).digest('hex');
  return { task_id, kind, path, raw_sha256, canonical_sha256 };
});
const manifest = { schemaVersion: '1.0.0', round_id: 'R-0007', status: 'pre-migration', canonicalization: 'utf8-bom-crlf-trailing-v1', expected_counts: { task_prompts: 6, task_json_originals: 5, archive_packages: 11, canonical_tasks: 11, sidecars: 11 }, original_sources };
const target = join(root, 'work/rounds/R-0020/contracts/CTG-0003-A3.5-guard-manifest.json');
mkdirSync(join(target, '..'), { recursive: true });
writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
NODE
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'printf "%s\\n" called >> "$FAKE_CLI_LOG"' \
  'while (($#)); do if [[ "$1" == "-o" ]]; then shift; printf "%s\\n" "Papel: Inspector" > "$1"; fi; shift || true; done' \
  'printf "%s\\n" "{\"type\":\"turn.completed\"}"' > "$guard_root/bin/codex"
chmod +x "$guard_root/bin/codex"

for variant in source copy crlf bom newline; do
  archive_prompt="$guard_root/work/rounds/R-0007/prompts/TASK-0004-S1.md"
  case "$variant" in
    copy) archive_prompt="$guard_root/copy.md"; cp "$guard_root/work/rounds/R-0007/prompts/TASK-0004-S1.md" "$archive_prompt" ;;
    crlf) archive_prompt="$guard_root/crlf.md"; sed 's/$/\r/' "$guard_root/work/rounds/R-0007/prompts/TASK-0004-S1.md" > "$archive_prompt" ;;
    bom) archive_prompt="$guard_root/bom.md"; printf '\357\273\277' > "$archive_prompt"; cat "$guard_root/work/rounds/R-0007/prompts/TASK-0004-S1.md" >> "$archive_prompt" ;;
    newline) archive_prompt="$guard_root/newline.md"; cp "$guard_root/work/rounds/R-0007/prompts/TASK-0004-S1.md" "$archive_prompt"; printf '\n' >> "$archive_prompt" ;;
  esac
  out="$guard_root/out/$variant.md"
  set +e
  FAKE_CLI_LOG="$guard_root/$variant.cli" PATH="$guard_root/bin:$PATH" "$guard_root/tools/orchestra/worker.sh" fixture low "$archive_prompt" "$out" "$guard_root/fixture-repo" >/dev/null 2>&1
  status=$?
  set -e
  if [[ "$status" -ne 6 || -e "$out" || -e "$guard_root/$variant.cli" ]]; then
    echo "worker.test: RED A3.5 ($variant): esperava exit 6 antes de CLI/saída" >&2
    guard_failures=$((guard_failures + 1))
  fi
done

if (( guard_failures > 0 )); then
  echo "worker.test: RED A3.5: $guard_failures caso(s)" >&2
  exit 1
fi
