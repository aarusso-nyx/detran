import { describe, expect, it } from 'vitest';

import { TENANT, withRealAppConnection } from './rait-case-runtime.fixture.js';

const CASE = '00000000-0000-7000-8000-000010000008';
const INQUIRY = '00000000-0000-7000-8000-000015000001';

describe('CTG-0001 §10.5 — codecs e associações reais no PostgreSQL', () => {
  it('dado date e timestamptz da diligência quando o driver lê então dia civil não é convertido em Date nem confundido com instante', async () => {
    const row = await withRealAppConnection(async (client) => {
      await client.query(
        `update inf.rait_inquiry set due_on = '2026-09-23'
          where tenant_id = $1 and id = $2`,
        [TENANT, INQUIRY],
      );
      const result = await client.query<{
        due_on: string;
        created_at: string | Date;
      }>(
        `select due_on::text as due_on, created_at from inf.rait_inquiry
          where tenant_id = $1 and id = $2`,
        [TENANT, INQUIRY],
      );
      return result.rows[0];
    });
    expect(row).toBeDefined();
    expect(row?.due_on).toBe('2026-09-23');
    expect(row?.due_on).not.toBeInstanceOf(Date);
    expect(row?.created_at).toBeInstanceOf(Date);
  });

  it('dado documento de outro caso quando a associação de resposta é tentada sob RLS então a fixture não produz vínculo cruzado', async () => {
    const document = '00000000-0000-7000-8000-000012000009';
    await expect(
      withRealAppConnection((client) =>
        client.query(
          `insert into inf.rait_inquiry_document
             (tenant_id, inquiry_id, document_id, attached_by)
           select $1, inquiry.id, document.id, current_setting('app.actor_id')::uuid
             from inf.rait_inquiry inquiry
             join inf.rait_document document on document.tenant_id = inquiry.tenant_id
            where inquiry.tenant_id = $1 and inquiry.id = $2
              and document.id = $3 and document.case_id = $4`,
          [TENANT, INQUIRY, document, CASE],
        ),
      ),
    ).resolves.toMatchObject({ rowCount: 0 });
  });
});
