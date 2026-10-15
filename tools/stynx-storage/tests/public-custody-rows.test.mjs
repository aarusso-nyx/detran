import assert from 'node:assert/strict';
import { test } from 'node:test';
import { custodyRows } from '../../stynx-storage-public-custody.mjs';

test('public custody reader selects each exact retained relation', async () => {
  for (const [kind, relation] of [
    ['baseline', 'integration.stynx_offline_baseline_custody'],
    ['forward', 'integration.stynx_offline_forward_receipts'],
    ['group', 'integration.stynx_storage_target_admissions'],
  ]) {
    const queries = [];
    const client = {
      async query(sql) {
        queries.push(sql);
        return { rows: [] };
      },
    };
    assert.deepEqual(await custodyRows(client, kind), []);
    assert.equal(queries.length, 1);
    assert.match(
      queries[0],
      new RegExp(`FROM ${relation.replaceAll('.', '\\.')} t$`),
    );
  }
});
