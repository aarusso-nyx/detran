import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ProofHarness,
  invoke,
  assertReply,
  NOW,
} from '../integration/harness.js';

let h: ProofHarness;
beforeEach(async () => {
  h = new ProofHarness();
  await h.open();
});
afterEach(async () => {
  await h.close();
});

describe('P6 — readiness calculada sobre recursos persistidos', () => {
  it('dado dispositivo preparado quando consulta prontidão então permite operação e devolve vetor reutilizável', async () => {
    const before = await h.snapshot();
    const result = await invoke('readiness', h.input('readiness'));
    expect(result.body).toEqual({
      device_id: h.deviceId,
      ready: true,
      blockers: [],
      evaluated_at: NOW,
      remaining_acts: 10,
      remaining_numbering_count: 1,
    });
    assertReply(result);
    expect(await h.snapshot()).toEqual(before);
    const issued = await invoke(
      'issue',
      h.input('issue', { ifMatch: result.etag }),
    );
    expect(issued.body.device_id).toBe(h.deviceId);
    expect(
      (
        await h.owner.query(
          'select id from ops.provisioning_package where id=$1',
          [issued.body.package_id],
        )
      ).rowCount,
    ).toBe(1);
  });

  it.each([
    ['expired', 'offline_authorization_grant'],
    ['revoked', 'offline_authorization_grant'],
    ['missing-grant', 'offline_authorization_grant'],
    ['missing-key', 'device_key'],
    ['missing-package', 'provisioning_package'],
    ['missing-numbering', 'numbering_reservation'],
    ['normative-unusable', 'normative_package'],
  ])(
    'dado %s quando consulta prontidão então ready false identifica exatamente o recurso bloqueante e altera ETag',
    async (condition, resource) => {
      const ready = await invoke('readiness', h.input('readiness'));
      if (condition === 'expired')
        await h.owner.query(
          "update ops.offline_authorization_grant set valid_until='2026-09-21T10:00:00Z' where id=$1",
          [h.grantId],
        );
      if (condition === 'revoked')
        await h.owner.query(
          "update ops.offline_authorization_grant set status='revoked', revoked_at=$2 where id=$1",
          [h.grantId, NOW],
        );
      if (condition === 'missing-key')
        await h.owner.query('delete from ops.device_key where id=$1', [
          h.keyId,
        ]);
      if (condition === 'missing-grant')
        await h.owner.query(
          'delete from ops.offline_authorization_grant where id=$1',
          [h.grantId],
        );
      if (condition === 'missing-package')
        await h.owner.query(
          'delete from ops.provisioning_package where id=$1',
          [h.packageId],
        );
      if (condition === 'missing-numbering')
        await h.owner.query(
          'delete from ops.numbering_reservation where id=$1',
          [h.reservationId],
        );
      if (condition === 'normative-unusable') h.normativeUsable = false;
      const blocked = await invoke('readiness', h.input('readiness'));
      expect(blocked.body).toEqual({
        device_id: h.deviceId,
        ready: false,
        blockers: [{ code: expect.stringMatching(/\S/u), resource }],
        evaluated_at: NOW,
        remaining_acts: condition === 'missing-grant' ? 0 : 10,
        remaining_numbering_count: [
          'missing-grant',
          'missing-numbering',
        ].includes(condition)
          ? 0
          : 1,
      });
      expect(blocked.etag).not.toBe(ready.etag);
      const before = await h.snapshot();
      await expect(
        invoke('issue', h.input('issue', { ifMatch: ready.etag })),
      ).rejects.toMatchObject({ code: 'TEAT.VERSION_CONFLICT', status: 412 });
      expect(await h.snapshot()).toEqual(before);
    },
  );

  it('dado dispositivo inexistente quando technical-admin consulta então 404 canônico não simula readiness vazia', async () => {
    const input = h.input('readiness', { deviceId: randomUUID() });
    input.context.principal.roles = ['technical-admin'];
    await expect(invoke('readiness', input)).rejects.toMatchObject({
      code: 'TEAT.TENANT_MISMATCH',
      status: 404,
    });
  });

  it('dada revogação conhecida do dispositivo quando consulta então bloqueador é revogação e o grant histórico permanece', async () => {
    await invoke('revoke', h.input('revoke'));
    const result = await invoke('readiness', h.input('readiness'));
    expect(result.body).toMatchObject({ device_id: h.deviceId, ready: false });
    expect(result.body.blockers).toEqual(
      expect.arrayContaining([
        { code: expect.stringMatching(/\S/u), resource: 'device_revocation' },
      ]),
    );
    expect(
      (
        await h.owner.query(
          'select id, status from ops.offline_authorization_grant where id=$1',
          [h.grantId],
        )
      ).rows,
    ).toEqual([{ id: h.grantId, status: 'revoked' }]);
  });
});
