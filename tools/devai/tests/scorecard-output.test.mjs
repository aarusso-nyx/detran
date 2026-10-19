import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseCommandDocument,
  unwrapCommandDocument,
} from '../scorecard-output.mjs';

test('a failed gate retains native readings from the stderr payload', () => {
  const reading = { id: 'SR-0123456789abcdef', status: 'fail' };
  const document = {
    ok: false,
    error: {
      code: 'ACTION_GATE_FAILED',
      context: {
        payload: {
          results: [{ stdout: JSON.stringify(reading) }],
          readiness_status: 'fail',
        },
      },
    },
  };
  const parsed = parseCommandDocument({
    stdout: '',
    stderr: `warning\n${JSON.stringify(document)}\n`,
  });
  assert.equal(parsed.ok, false);
  assert.equal(unwrapCommandDocument(parsed).readiness_status, 'fail');
  assert.deepEqual(
    JSON.parse(unwrapCommandDocument(parsed).results[0].stdout),
    reading,
  );
});

test('successful command execution does not turn an UNKNOWN scorecard into PASS', () => {
  const document = {
    ok: true,
    result: { verdict: 'pass', value: { overall: { verdict: 'UNKNOWN' } } },
  };
  const parsed = parseCommandDocument({
    stdout: `warning\n${JSON.stringify(document)}\n`,
  });
  assert.equal(unwrapCommandDocument(parsed).overall.verdict, 'UNKNOWN');
});

test('a refusal without readings and non-JSON diagnostics do not create observations', () => {
  const refused = {
    ok: false,
    error: { code: 'AUTHORITY_HOST_PROCESS_ADAPTER_REQUIRED' },
  };
  assert.deepEqual(unwrapCommandDocument(refused), refused);
  assert.equal(
    parseCommandDocument({ stdout: 'not JSON', stderr: 'timeout' }),
    null,
  );
});
