import { readFileSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DETRAN_ROLES } from '../../../../shared/src/roles.js';
import {
  ProofHarness,
  invoke,
  invokeInFreshProcess,
  assertReply,
  TENANT_A,
  TENANT_B,
  AGENCY_A,
  AGENT_A,
  ISSUER_A,
  NOW,
  canonical,
  type Operation,
  type CommandInput,
  type CommandReply,
} from './harness.js';

const contract = JSON.parse(
  readFileSync(
    new URL(
      '../../../../../../docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const operations: Operation[] = [
  'challenge',
  'register',
  'issue',
  'download',
  'receipt',
  'readiness',
  'revoke',
  'reconcile',
];
const mutations: Operation[] = [
  'challenge',
  'register',
  'issue',
  'receipt',
  'revoke',
  'reconcile',
];
const roles: Partial<Record<Operation, string[]>> = {
  challenge: ['technical-admin', 'agency-admin'],
  issue: ['agency-admin', 'field-supervisor'],
  readiness: ['agency-admin', 'technical-admin', 'field-agent'],
  revoke: ['agency-admin', 'technical-admin'],
};
const schemas: Record<Operation, string> = {
  challenge: 'KeyChallengeResponse',
  register: 'RegisterDeviceKeyResponse',
  issue: 'IssueProvisioningPackageResponse',
  download: 'DownloadProvisioningPackageResponse',
  receipt: 'ProvisioningReceiptResponse',
  readiness: 'ProvisioningReadinessResponse',
  revoke: 'RevokeGrantResponse',
  reconcile: 'ReconcileGrantResponse',
};
let h: ProofHarness;
beforeEach(async () => {
  h = new ProofHarness();
  await h.open();
});
afterEach(async () => {
  await h.close();
});

function validateSchema(value: any, schema: any): void {
  if (schema.$ref)
    return validateSchema(
      value,
      contract.components.schemas[schema.$ref.split('/').at(-1)],
    );
  if (schema.type === 'object') {
    expect(value).toBeTypeOf('object');
    expect(value).not.toBeNull();
    expect(Array.isArray(value)).toBe(false);
    for (const key of schema.required ?? [])
      expect(Object.hasOwn(value, key), key).toBe(true);
    if (schema.additionalProperties === false)
      expect(
        Object.keys(value).filter(
          (key) => !Object.hasOwn(schema.properties, key),
        ),
      ).toEqual([]);
    for (const [key, definition] of Object.entries(schema.properties ?? {}))
      if (Object.hasOwn(value, key)) validateSchema(value[key], definition);
  } else if (schema.type === 'array') {
    expect(Array.isArray(value)).toBe(true);
    expect(value.length).toBeGreaterThanOrEqual(schema.minItems ?? 0);
    for (const item of value) validateSchema(item, schema.items);
  } else if (schema.type === 'integer') {
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(schema.minimum ?? -Infinity);
  } else {
    expect(typeof value).toBe(schema.type);
    if (schema.minLength)
      expect(value.length).toBeGreaterThanOrEqual(schema.minLength);
    if (schema.format === 'uuid')
      expect(value).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu,
      );
    if (schema.format === 'date-time')
      expect(Number.isFinite(Date.parse(value))).toBe(true);
  }
  if (schema.enum) expect(schema.enum).toContain(value);
}

async function persistedReply(
  operation: Operation,
  input: CommandInput,
  reply: CommandReply,
) {
  assertReply(reply);
  validateSchema(reply.body, contract.components.schemas[schemas[operation]]);
  if (mutations.includes(operation)) {
    const rows = await h.owner.query(
      'select response_body_json, response_etag, request_digest from ops.provisioning_command_idempotency where tenant_id=$1 and idempotency_key=$2 and command_name=$3',
      [TENANT_A, input.idempotencyKey, operation],
    );
    expect(rows.rows).toEqual([
      {
        response_body_json: reply.body,
        response_etag: reply.etag,
        request_digest: expect.stringMatching(/^[a-f0-9]{64}$/u),
      },
    ]);
    const event = await h.owner.query(
      'select tenant_id, payload from integration.outbox where tenant_id=$1 and idempotency_key=$2',
      [TENANT_A, `${operation}:${input.idempotencyKey}`],
    );
    expect(event.rowCount).toBe(1);
    expect(event.rows[0].tenant_id).toBe(TENANT_A);
    expect(JSON.stringify(event.rows)).not.toMatch(
      /private[_-]?key|refresh[_-]?token|protected[_-]?value/iu,
    );
  }
}

describe('P0–P6 / A5 — autoridade dinâmica e efeito verificável', () => {
  it.each(operations)(
    'dado principal ausente quando executa %s então recusa 401 sem qualquer efeito',
    async (operation) => {
      const input = await h.prepare(operation);
      (input.context as { principal: unknown }).principal = undefined;
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.AUTH_REQUIRED',
        status: 401,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(operations)(
    'dado vínculo válido de %s quando executado então corpo real adere ao OpenAPI e efeito pertence ao tenant',
    async (operation) => {
      const input = await h.prepare(operation);
      const reply = await invoke(operation, input);
      await persistedReply(operation, input, reply);
      if (operation === 'download')
        expect(reply.body).toEqual({
          package_id: h.packageId,
          grant_id: h.grantId,
          device_id: h.deviceId,
          manifest_digest: `${h.prefix}-package`,
          envelope_uri: `fixture://ops-provisioning/${h.deviceId}/${h.prefix}-package`,
          signature_key_id: 'fixture-kid-a',
          schema_version: '1.0',
        });
      if (operation === 'readiness')
        expect(reply.body).toEqual({
          device_id: h.deviceId,
          ready: true,
          blockers: [],
          evaluated_at: NOW,
          remaining_acts: 10,
          remaining_numbering_count: 1,
        });
    },
  );

  for (const operation of operations) {
    const allowed = roles[operation];
    it.each(allowed ?? [...DETRAN_ROLES, ''])(
      'dado %s com vínculo positivo quando executa ' +
        operation +
        ' então a autoridade A5 permite o efeito exato',
      async (role) => {
        const input = await h.prepare(operation);
        input.context.principal.roles = role ? [role] : [];
        const reply = await invoke(operation, input);
        await persistedReply(operation, input, reply);
      },
    );
    if (allowed) {
      it.each(DETRAN_ROLES.filter((role) => !allowed.includes(role)))(
        'dado papel omitido %s com wildcard quando executa ' +
          operation +
          ' sem vínculo de agente então recusa sem efeito',
        async (role) => {
          const input = await h.prepare(operation);
          input.context.principal.roles = [role];
          input.context.principal.permissions = ['*', 'ops:provisioning:*'];
          if (operation === 'readiness')
            delete input.context.principal.claims.agent_id;
          const before = await h.snapshot();
          await expect(invoke(operation, input)).rejects.toMatchObject({
            code: 'TEAT.FORBIDDEN_ACTION',
            status: 403,
          });
          expect(await h.snapshot()).toEqual(before);
        },
      );
    }
    it(
      'dado principal de outro tenant quando executa ' +
        operation +
        ' então recusa sem ler ou escrever recurso alheio',
      async () => {
        const input = await h.prepare(operation);
        input.context.tenantId = TENANT_B;
        input.db = await h.connect(TENANT_B);
        const before = await h.snapshot();
        await expect(invoke(operation, input)).rejects.toMatchObject({
          code: 'TEAT.FORBIDDEN_ACTION',
          status: 403,
        });
        expect(await h.snapshot()).toEqual(before);
      },
    );
  }

  it.each(['challenge', 'issue', 'readiness', 'revoke'] as Operation[])(
    'dado agency-admin sem atribuição ao órgão quando executa %s então recusa antes do efeito',
    async (operation) => {
      const input = await h.prepare(operation);
      input.context.principal.roles = ['agency-admin'];
      input.context.principal.claims = { traffic_agency_id: randomUUID() };
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );

  it.each(['register', 'download', 'receipt', 'reconcile'] as Operation[])(
    'dado ADMIN com wildcard mas identidade desvinculada quando executa %s então não herda o vínculo de outro principal',
    async (operation) => {
      const input = await h.prepare(operation);
      input.context.principal = {
        subject: 'fixture-other-subject',
        roles: ['ADMIN'],
        permissions: ['*'],
        claims: {
          traffic_agency_id: AGENCY_A,
          device_id: randomUUID(),
          agent_id: randomUUID(),
        },
      };
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );

  it.each(['receipt', 'reconcile'] as Operation[])(
    'dado mesmo subject sem autenticação do dispositivo quando executa %s então recusa',
    async (operation) => {
      const input = await h.prepare(operation);
      delete input.context.principal.claims.device_id;
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(
    (['register', 'download', 'receipt', 'reconcile'] as Operation[]).flatMap(
      (operation) =>
        DETRAN_ROLES.filter((role) => role !== 'ADMIN').map(
          (role) => [operation, role] as const,
        ),
    ),
  )(
    'dado %s com identidade inválida e papel %s quando executa então papel ou wildcard não concedem vínculo',
    async (operation, role) => {
      const input = await h.prepare(operation);
      input.context.principal = {
        subject: 'fixture-other-subject',
        roles: [role],
        permissions: ['*'],
        claims: {},
      };
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(['register', 'download'] as Operation[])(
    'dado dispositivo e órgão corretos mas subject errado quando executa %s então recusa o emissor substituto',
    async (operation) => {
      const input = await h.prepare(operation);
      input.context.principal.subject = 'fixture-other-subject';
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(['receipt', 'reconcile'] as Operation[])(
    'dado subject e órgão corretos mas dispositivo errado quando executa %s então recusa a cópia',
    async (operation) => {
      const input = await h.prepare(operation);
      input.context.principal.claims.device_id = randomUUID();
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dado field-agent da mesma agência porém não vinculado quando consulta readiness então recusa', async () => {
    const input = h.input('readiness');
    input.context.principal.roles = ['field-agent'];
    input.context.principal.claims.agent_id = randomUUID();
    await expect(invoke('readiness', input)).rejects.toMatchObject({
      code: 'TEAT.FORBIDDEN_ACTION',
      status: 403,
    });
  });
  it('dado supervisor sem atribuição à agência quando emite então recusa e preserva reservas', async () => {
    const input = await h.prepare('issue');
    input.context.principal.claims.traffic_agency_id = randomUUID();
    const before = await h.snapshot();
    await expect(invoke('issue', input)).rejects.toMatchObject({
      code: 'TEAT.FORBIDDEN_ACTION',
      status: 403,
    });
    expect(await h.snapshot()).toEqual(before);
  });

  it('dado agente vinculado sem papel staff quando consulta readiness então identidade basta', async () => {
    const input = h.input('readiness');
    input.context.principal.roles = [];
    delete input.context.principal.claims.traffic_agency_id;
    const reply = await invoke('readiness', input);
    expect(reply.body).toEqual({
      device_id: h.deviceId,
      ready: true,
      blockers: [],
      evaluated_at: NOW,
      remaining_acts: 10,
      remaining_numbering_count: 1,
    });
  });
  it.each(DETRAN_ROLES)(
    'dado agente vinculado com papel %s quando consulta readiness então o papel não elimina o vínculo suficiente',
    async (role) => {
      const input = h.input('readiness');
      input.context.principal.roles = [role];
      delete input.context.principal.claims.traffic_agency_id;
      expect((await invoke('readiness', input)).body).toEqual({
        device_id: h.deviceId,
        ready: true,
        blockers: [],
        evaluated_at: NOW,
        remaining_acts: 10,
        remaining_numbering_count: 1,
      });
    },
  );
});

describe('P1/P4 — versões, replay durável e exclusão mútua', () => {
  it('dado literal numérico um sem leitura recuperável quando tenta challenge então não há bootstrap especial e retorna 412', async () => {
    const input = await h.prepare('challenge');
    expect(input.ifMatch).not.toBe('"1"');
    input.ifMatch = '"1"';
    const before = await h.snapshot();
    await expect(invoke('challenge', input)).rejects.toMatchObject({
      code: 'TEAT.VERSION_CONFLICT',
      status: 412,
    });
    expect(await h.snapshot()).toEqual(before);
  });
  it('dado dispositivo ainda sem chave quando readiness é false então seu ETag inicia challenge e o ETag resultante registra a chave', async () => {
    await h.owner.query('delete from ops.device_key where id=$1', [h.keyId]);
    const readiness = await invoke('readiness', h.input('readiness'));
    expect(readiness.body).toMatchObject({
      device_id: h.deviceId,
      ready: false,
      blockers: expect.arrayContaining([
        { code: expect.stringMatching(/\S/u), resource: 'device_key' },
      ]),
    });
    const challengeInput = h.input('challenge', { ifMatch: readiness.etag });
    const challenge = await invoke('challenge', challengeInput);
    await persistedReply('challenge', challengeInput, challenge);
    expect(
      (
        await h.owner.query(
          'select device_id,version::int,status from ops.device_key where id=$1',
          [challenge.body.challenge_id],
        )
      ).rows,
    ).toEqual([{ device_id: h.deviceId, version: 2, status: 'challenged' }]);
    const registerInput = h.input('register', { ifMatch: challenge.etag });
    registerInput.body.challenge_id = challenge.body.challenge_id;
    registerInput.body.challenge_proof = `fixture-proof:${challenge.body.challenge}:${h.deviceId}:${registerInput.body.public_key}`;
    const registered = await invoke('register', registerInput);
    await persistedReply('register', registerInput, registered);
    expect(
      (
        await h.owner.query(
          'select status,key_fingerprint from ops.device_key where id=$1',
          [challenge.body.challenge_id],
        )
      ).rows,
    ).toEqual([
      {
        status: 'registered',
        key_fingerprint: registerInput.body.key_fingerprint,
      },
    ]);
    const before = await h.snapshot();
    await expect(
      invoke('challenge', {
        ...challengeInput,
        idempotencyKey: `${h.prefix}-old-readiness`,
        body: h.body('challenge', `${h.prefix}-old-readiness`),
      }),
    ).rejects.toMatchObject({ code: 'TEAT.VERSION_CONFLICT', status: 412 });
    expect(await h.snapshot()).toEqual(before);
  });

  it('dado dispositivo versão quatro e chave versão sete quando cria challenge então persiste máximo mais um e expõe ETag utilizável', async () => {
    h.bindingVersion = 4;
    await h.owner.query('update ops.device_key set version=7 where id=$1', [
      h.keyId,
    ]);
    const input = await h.prepare('challenge');
    const reply = await invoke('challenge', input);
    await persistedReply('challenge', input, reply);
    expect(
      (
        await h.owner.query(
          'select version::int from ops.device_key where id=$1',
          [reply.body.challenge_id],
        )
      ).rows,
    ).toEqual([{ version: 8 }]);
  });

  it.each(['device-state', 'key-version', 'device-binding', 'device-version'])(
    'dada alteração de %s após leitura quando challenge usa o token antigo então readiness muda e retorna 412 sem efeito',
    async (change) => {
      const readInput = h.input('readiness');
      readInput.context.principal.roles = ['technical-admin'];
      const old = await invoke('readiness', readInput);
      if (change === 'device-state')
        await h.owner.query(
          'update ops.ops_operational_device set tamper_flag=true where id=$1',
          [h.deviceId],
        );
      if (change === 'key-version')
        await h.owner.query(
          'update ops.device_key set version=version+1 where id=$1',
          [h.keyId],
        );
      if (change === 'device-binding') h.bindingAgencyId = randomUUID();
      if (change === 'device-version') h.bindingVersion += 1;
      const current = await invoke('readiness', readInput);
      expect(current.etag).not.toBe(old.etag);
      const input = h.input('challenge', { ifMatch: old.etag });
      input.context.principal.roles = ['technical-admin'];
      const before = await h.snapshot();
      await expect(invoke('challenge', input)).rejects.toMatchObject({
        code: 'TEAT.VERSION_CONFLICT',
        status: 412,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );

  it('dados challenges concorrentes em conexões distintas quando reutilizam o mesmo readiness então só um confirma e a próxima versão é exclusiva', async () => {
    const first = await h.prepare('challenge');
    const second = {
      ...first,
      db: await h.connect(),
      idempotencyKey: `${h.prefix}-challenge-competitor`,
      body: h.body('challenge', `${h.prefix}-challenge-competitor`),
    };
    const pids = await Promise.all([
      first.db.query('select pg_backend_pid() pid'),
      second.db.query('select pg_backend_pid() pid'),
    ]);
    expect(pids[0].rows[0].pid).not.toBe(pids[1].rows[0].pid);
    const results = await Promise.allSettled([
      invoke('challenge', first),
      invoke('challenge', second),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      (
        results.find(
          (result) => result.status === 'rejected',
        ) as PromiseRejectedResult
      ).reason,
    ).toMatchObject({ code: 'TEAT.VERSION_CONFLICT', status: 412 });
    expect(
      (
        await h.owner.query(
          "select version::int from ops.device_key where device_id=$1 and status='challenged'",
          [h.deviceId],
        )
      ).rows,
    ).toEqual([{ version: 2 }]);
    const next = await h.prepare('challenge');
    next.idempotencyKey = `${h.prefix}-challenge-next`;
    next.body.idempotency_key = next.idempotencyKey;
    await invoke('challenge', next);
    expect(
      (
        await h.owner.query(
          "select version::int from ops.device_key where device_id=$1 and status='challenged' order by version",
          [h.deviceId],
        )
      ).rows,
    ).toEqual([{ version: 2 }, { version: 3 }]);
  });
  it('dada a mesma chave bruta em receipt e revoke quando ambos confirmam então comandos e outbox têm namespaces distintos sem colisão', async () => {
    const rawKey = `${h.prefix}-shared-raw-key`;
    const receiptInput = h.input('receipt', {
      idempotencyKey: rawKey,
      body: h.body('receipt', rawKey),
    });
    const revokeInput = h.input('revoke', {
      idempotencyKey: rawKey,
      body: h.body('revoke', rawKey),
    });
    const receipt = await invoke('receipt', receiptInput);
    const revoke = await invoke('revoke', revokeInput);
    await persistedReply('receipt', receiptInput, receipt);
    await persistedReply('revoke', revokeInput, revoke);
    const records = await h.owner.query(
      'select command_name, idempotency_key, response_body_json, response_etag from ops.provisioning_command_idempotency where tenant_id=$1 and idempotency_key=$2 order by command_name',
      [TENANT_A, rawKey],
    );
    expect(records.rows).toEqual([
      {
        command_name: 'receipt',
        idempotency_key: rawKey,
        response_body_json: receipt.body,
        response_etag: receipt.etag,
      },
      {
        command_name: 'revoke',
        idempotency_key: rawKey,
        response_body_json: revoke.body,
        response_etag: revoke.etag,
      },
    ]);
    const events = await h.owner.query(
      'select id, idempotency_key, payload from integration.outbox where tenant_id=$1 and idempotency_key=any($2::text[]) order by idempotency_key',
      [TENANT_A, [`receipt:${rawKey}`, `revoke:${rawKey}`, rawKey]],
    );
    expect(events.rows.map(({ id: _id, ...event }) => event)).toEqual([
      { idempotency_key: `receipt:${rawKey}`, payload: receipt.body },
      { idempotency_key: `revoke:${rawKey}`, payload: revoke.body },
    ]);
    expect(new Set(events.rows.map((event) => event.id)).size).toBe(2);
    const snapshot = await h.snapshot();
    expect((snapshot.idempotency as unknown[]).length).toBe(2);
    expect((snapshot.outbox as unknown[]).length).toBe(2);
  });
  it('dado runtime reiniciado em outro processo quando lê prontidão então a consulta usa o estado PostgreSQL persistido', async () => {
    const child = await invokeInFreshProcess('readiness', h.input('readiness'));
    expect(child.pid).not.toBe(process.pid);
    expect(child.reply.body).toEqual({
      device_id: h.deviceId,
      ready: true,
      blockers: [],
      evaluated_at: NOW,
      remaining_acts: 10,
      remaining_numbering_count: 1,
    });
  });
  it.each(mutations)(
    'dado %s com body vazio mas contexto e headers válidos quando executado então recusa 400 sem persistir',
    async (operation) => {
      const input = await h.prepare(operation);
      input.body = {};
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 400,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each([
    'device_key',
    'offline_authorization_grant',
    'provisioning_package',
    'provisioning_receipt',
    'device_revocation',
  ])(
    'dado %s do tenant A quando conexão B lê então RLS não revela qualquer registro',
    async (table) => {
      if (table === 'provisioning_receipt')
        await invoke('receipt', h.input('receipt'));
      if (table === 'device_revocation')
        await invoke('revoke', h.input('revoke'));
      const own = await h.clients[0]!.query(
        `select id from ops.${table} where device_id=$1`,
        [h.deviceId],
      );
      expect(own.rowCount).toBeGreaterThan(0);
      const foreign = await h.connect(TENANT_B);
      expect(
        (
          await foreign.query(
            `select id from ops.${table} where device_id=$1`,
            [h.deviceId],
          )
        ).rows,
      ).toEqual([]);
    },
  );
  it.each(mutations)(
    'dado %s sem precondição quando executado então recusa 428 e preserva snapshot',
    async (operation) => {
      const input = await h.prepare(operation);
      delete input.ifMatch;
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.IF_MATCH_REQUIRED',
        status: 428,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(mutations)(
    'dado %s sem idempotency key quando executado então recusa 400 e preserva snapshot',
    async (operation) => {
      const input = await h.prepare(operation);
      delete input.idempotencyKey;
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 400,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(mutations)(
    'dado %s com ETag antigo quando executado então recusa 412 sem efeito',
    async (operation) => {
      const input = await h.prepare(operation);
      input.ifMatch = '"stale-version"';
      const before = await h.snapshot();
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.VERSION_CONFLICT',
        status: 412,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(mutations)(
    'dado %s confirmado com ACK perdido quando conexão e comando reiniciam então replay preserva exatamente corpo ETag e efeitos',
    async (operation) => {
      const input = await h.prepare(operation);
      const first = await invoke(operation, input);
      await persistedReply(operation, input, first);
      const before = await h.snapshot();
      await input.db.end();
      h.clients.splice(h.clients.indexOf(input.db), 1);
      input.db = await h.connect();
      input.body = JSON.parse(canonical(input.body));
      const replay = await invokeInFreshProcess(operation, input);
      expect(replay.pid).not.toBe(process.pid);
      expect(replay.reply).toEqual(first);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(mutations)(
    'dado %s com chave reutilizada e payload diferente quando repetido então recusa 409 sem segundo efeito',
    async (operation) => {
      const input = await h.prepare(operation);
      await invoke(operation, input);
      const before = await h.snapshot();
      // A second idempotency key in the body is itself a different canonical
      // request. For payload-bearing commands change an otherwise valid field.
      const field = {
        challenge: 'idempotency_key',
        register: 'key_fingerprint',
        issue: 'maximum_acts',
        receipt: 'receipt_type',
        revoke: 'reason_code',
        reconcile: 'acts',
      }[operation as 'challenge'];
      if (operation === 'issue') input.body.maximum_acts = 9;
      else if (operation === 'receipt') input.body.receipt_type = 'activated';
      else if (operation === 'reconcile')
        input.body.acts[0].local_content_hash += '-changed';
      else input.body[field] += '-changed';
      await expect(invoke(operation, input)).rejects.toMatchObject({
        code: 'TEAT.IDEMPOTENCY_REPLAY',
        status: 409,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );

  it('dado ETag devolvido por receipt quando reutilizado então nova transição funciona e a versão anterior falha', async () => {
    const input = h.input('receipt');
    const first = await invoke('receipt', input);
    const next = h.input('receipt', {
      ifMatch: first.etag,
      idempotencyKey: `${h.prefix}-receipt-next`,
      body: {
        ...h.body('receipt', `${h.prefix}-receipt-next`),
        receipt_type: 'activated',
      },
    });
    const second = await invoke('receipt', next);
    expect(second.etag).not.toBe(first.etag);
    const before = await h.snapshot();
    await expect(
      invoke('receipt', {
        ...next,
        idempotencyKey: `${h.prefix}-receipt-stale`,
        body: {
          ...next.body,
          idempotency_key: `${h.prefix}-receipt-stale`,
          receipt_type: 'exported',
        },
      }),
    ).rejects.toMatchObject({ code: 'TEAT.VERSION_CONFLICT', status: 412 });
    expect(await h.snapshot()).toEqual(before);
  });

  it.each(['receipt', 'issue', 'reconcile'] as Operation[])(
    'dado retry concorrente de %s em duas conexões PostgreSQL quando ambos executam então há um efeito e duas respostas idênticas',
    async (operation) => {
      const input = await h.prepare(operation);
      const second = await h.connect();
      const pids = await Promise.all([
        input.db.query('select pg_backend_pid() pid'),
        second.query('select pg_backend_pid() pid'),
      ]);
      expect(pids[0].rows[0].pid).not.toBe(pids[1].rows[0].pid);
      const [a, b] = await Promise.all([
        invoke(operation, input),
        invoke(operation, { ...input, db: second }),
      ]);
      expect(a).toEqual(b);
      await persistedReply(operation, input, a);
      const snapshot = await h.snapshot();
      expect((snapshot.idempotency as unknown[]).length).toBe(1);
      if (operation === 'reconcile')
        expect((snapshot.numbering_consumption as unknown[]).length).toBe(1);
    },
  );

  it('dada mesma reserva e dois emissores concorrentes com chaves diferentes quando emitem então somente um pacote novo referencia a reserva', async () => {
    const first = await h.prepare('issue');
    const second = {
      ...first,
      db: await h.connect(),
      idempotencyKey: `${h.prefix}-competitor`,
      body: { ...first.body, idempotency_key: `${h.prefix}-competitor` },
    };
    const results = await Promise.allSettled([
      invoke('issue', first),
      invoke('issue', second),
    ]);
    expect(results.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find(
      (x) => x.status === 'rejected',
    ) as PromiseRejectedResult;
    expect(rejected.reason).toMatchObject({
      code: 'TEAT.VERSION_CONFLICT',
      status: 412,
    });
    const grants = await h.owner.query(
      'select id from ops.offline_authorization_grant where device_id=$1 and id<>$2',
      [h.deviceId, h.grantId],
    );
    expect(grants.rowCount).toBe(1);
  });
});

describe('P2/P3 — enrollment e envelope ligados ao dispositivo', () => {
  it.each([
    'public-key-pem',
    'attestation-private-key',
    'attestation-refresh-token',
  ])(
    'dado material protegido em %s quando registra então rejeita sem persistir valor bruto',
    async (location) => {
      const input = await h.prepare('register');
      if (location === 'public-key-pem') {
        const oldPublic = input.body.public_key;
        input.body.public_key =
          '-----BEGIN PRIVATE KEY-----FORBIDDEN-FIXTURE-----END PRIVATE KEY-----';
        input.body.challenge_proof = input.body.challenge_proof.replace(
          oldPublic,
          input.body.public_key,
        );
      } else {
        input.body.attestation_evidence =
          location === 'attestation-private-key'
            ? { nested: { private_key: 'FORBIDDEN-FIXTURE' } }
            : { refresh_token: 'FORBIDDEN-FIXTURE' };
      }
      const before = await h.snapshot();
      await expect(invoke('register', input)).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 422,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dado challenge vinculado quando prova pública é válida então registra chave persistida e encerra o challenge', async () => {
    const input = await h.prepare('register');
    const reply = await invoke('register', input);
    const row = await h.owner.query(
      'select device_id, key_fingerprint, public_key, attestation_evidence_json, status from ops.device_key where id=$1',
      [reply.body.device_key_id],
    );
    expect(row.rows).toEqual([
      {
        device_id: h.deviceId,
        key_fingerprint: input.body.key_fingerprint,
        public_key: input.body.public_key,
        attestation_evidence_json: { fixture: true },
        status: 'registered',
      },
    ]);
    await persistedReply('register', input, reply);
    const replayWithNewKey = {
      ...input,
      ifMatch: reply.etag,
      idempotencyKey: `${h.prefix}-reuse-challenge`,
      body: { ...input.body, idempotency_key: `${h.prefix}-reuse-challenge` },
    };
    await expect(invoke('register', replayWithNewKey)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
    });
  });
  it.each(['proof', 'expired', 'copied-device', 'private-material'])(
    'dado enrollment %s quando registra então recusa sem persistir chave',
    async (condition) => {
      const input = await h.prepare('register');
      if (condition === 'proof') input.body.challenge_proof = 'tampered';
      if (condition === 'expired') h.now = '2026-09-23T00:00:00.000Z';
      if (condition === 'copied-device') input.deviceId = randomUUID();
      if (condition === 'private-material')
        input.body.private_key = 'PRIVATE-KEY-FIXTURE-FORBIDDEN';
      const before = await h.snapshot();
      const error =
        condition === 'copied-device'
          ? { code: 'TEAT.FORBIDDEN_ACTION', status: 403 }
          : condition === 'private-material'
            ? { code: 'TEAT.VALIDATION_FAILED', status: 400 }
            : { code: 'TEAT.VALIDATION_FAILED', status: 422 };
      await expect(invoke('register', input)).rejects.toMatchObject(error);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dada emissão autorizada quando assina e cifra então grant arrays pacote reserva e outbox são persistidos juntos', async () => {
    const input = await h.prepare('issue');
    const result = await invoke('issue', input);
    await persistedReply('issue', input, result);
    const grant = await h.owner.query(
      'select device_id, traffic_agency_id, authorized_agents_json, numbering_reservation_ids_json, issued_by_subject, maximum_acts from ops.offline_authorization_grant where id=$1',
      [result.body.grant_id],
    );
    expect(grant.rows).toEqual([
      {
        device_id: h.deviceId,
        traffic_agency_id: AGENCY_A,
        authorized_agents_json: input.body.authorized_agents,
        numbering_reservation_ids_json: [h.issuanceReservationId],
        issued_by_subject: ISSUER_A,
        maximum_acts: 10,
      },
    ]);
    const pkg = await h.owner.query(
      'select grant_id, device_id, manifest_digest, envelope_uri from ops.provisioning_package where id=$1',
      [result.body.package_id],
    );
    expect(pkg.rows).toEqual([
      {
        grant_id: result.body.grant_id,
        device_id: h.deviceId,
        manifest_digest: result.body.manifest_digest,
        envelope_uri: result.body.envelope_uri,
      },
    ]);
    expect(result.body.envelope_uri).toBe(
      `fixture://ops-provisioning/${h.deviceId}/${result.body.manifest_digest}`,
    );
    const reserve = await h.owner.query(
      'select reconciliation_json from ops.numbering_reservation where id=$1',
      [h.issuanceReservationId],
    );
    expect(reserve.rows[0].reconciliation_json).toMatchObject({
      grant_id: result.body.grant_id,
      package_id: result.body.package_id,
    });
    expect(h.visits).toEqual(
      expect.arrayContaining([
        'sign',
        'encrypt',
        'after-domain',
        'after-numbering',
        'after-outbox',
        'before-commit',
      ]),
    );
    expect(h.signedManifests).toHaveLength(1);
    expect(h.signedManifests[0]).toMatchObject({
      schemaVersion: '1.0',
      grantId: result.body.grant_id,
      tenantId: TENANT_A,
      trafficAgencyId: AGENCY_A,
      deviceId: h.deviceId,
      deviceKeyThumbprint: 'fixture-public-key-a',
      authorizedAgents: [
        {
          agentId: AGENT_A,
          registrationNumber: 'fixture-agent-a',
          roles: ['field-agent'],
          permissions: ['ops:provisioning'],
        },
      ],
      validFrom: input.body.valid_from,
      validUntil: input.body.valid_until,
      maximumOfflineSeconds: 3600,
      maximumActs: 10,
      revocationEpoch: 0,
      policyVersion: 'fixture-policy-v1',
      normativePackageId: input.body.normative_package_id,
      numberingReservationIds: [h.issuanceReservationId],
      issuedAt: NOW,
      issuedBySubject: ISSUER_A,
      keyId: 'fixture-kid-a',
    });
    expect(result.body.manifest_digest).toBe(
      createHash('sha256')
        .update(canonical(h.signedManifests[0]))
        .digest('hex'),
    );
    expect(JSON.stringify(h.signedManifests)).not.toMatch(
      /private[_-]?key|refresh[_-]?token|protected[_-]?value/iu,
    );
  });
  it.each([
    'tampered-digest',
    'tampered-artifact',
    'copied-device',
    'expired',
    'revoked',
    'downgrade',
    'rotated-key',
    'untrusted-signing-key',
  ])(
    'dado pacote %s quando dispositivo tenta instalar então recusa receipt e preserva evidência',
    async (condition) => {
      const input = h.input('receipt');
      if (condition === 'tampered-digest')
        input.body.manifest_digest = 'tampered';
      if (condition === 'tampered-artifact')
        await h.owner.query(
          'update ops.provisioning_package set artifact_digests_json=$2 where id=$1',
          [h.packageId, { manifest: 'tampered' }],
        );
      if (condition === 'copied-device')
        input.context.principal.claims.device_id = randomUUID();
      if (condition === 'expired') h.now = '2026-09-23T00:00:00.000Z';
      if (condition === 'revoked')
        await h.owner.query(
          "update ops.offline_authorization_grant set status='revoked', revoked_at=$2 where id=$1",
          [h.grantId, NOW],
        );
      if (condition === 'downgrade')
        await h.owner.query(
          "update ops.provisioning_package set schema_version='0.9' where id=$1",
          [h.packageId],
        );
      if (condition === 'rotated-key')
        await h.owner.query(
          "update ops.device_key set status='revoked', revoked_at=$2 where id=$1",
          [h.keyId, NOW],
        );
      if (condition === 'untrusted-signing-key') h.trustedKeyIds.clear();
      const before = await h.snapshot();
      await expect(invoke('receipt', input)).rejects.toMatchObject(
        condition === 'copied-device'
          ? { code: 'TEAT.FORBIDDEN_ACTION', status: 403 }
          : { code: 'TEAT.VALIDATION_FAILED', status: 422 },
      );
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dado profile production com ports fixture quando emite então recusa sem invocar assinatura ou gravar pacote', async () => {
    const input = await h.prepare('issue');
    input.runtimeProfile = 'production';
    const before = await h.snapshot();
    await expect(invoke('issue', input)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
    });
    expect(h.visits).not.toContain('sign');
    expect(await h.snapshot()).toEqual(before);
  });
});

describe('P4/P5 — INV-OFFLINE-001, crash e reconciliação', () => {
  it.each(['2026-09-20T23:59:59Z', '2026-09-22T00:00:01Z'])(
    'dado ato formalizado em %s fora da validade quando reconcilia então rejeita sem consumo',
    async (occurredAt) => {
      const input = h.input('reconcile');
      input.body.acts[0].occurred_at = occurredAt;
      const before = await h.snapshot();
      await expect(invoke('reconcile', input)).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 422,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dado ato posterior à revogação conhecida quando reconcilia então rejeita sem consumir saldo bloqueado', async () => {
    const revoked = await invoke('revoke', h.input('revoke'));
    const input = h.input('reconcile', { ifMatch: revoked.etag });
    input.body.acts[0].occurred_at = '2026-09-21T13:00:00Z';
    const before = await h.snapshot();
    await expect(invoke('reconcile', input)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
    });
    expect(await h.snapshot()).toEqual(before);
  });
  it.each([
    'idempotency_key',
    'reserved_numbering_context',
    'local_content_hash',
    'device_id',
    'agent_id',
    'occurred_at',
    'location_context',
    'normative_package_id',
  ])(
    'dado ato sem %s quando reconciliado então recusa 400 sem consumo nem outbox',
    async (field) => {
      const input = h.input('reconcile');
      delete input.body.acts[0][field];
      const before = await h.snapshot();
      await expect(invoke('reconcile', input)).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 400,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each([
    'device_id',
    'agent_id',
    'normative_package_id',
    'reserved_numbering_context',
  ])(
    'dado ato com %s alheio ao grant quando reconciliado então recusa 422 sem efeito',
    async (field) => {
      const input = h.input('reconcile');
      input.body.acts[0][field] =
        field === 'reserved_numbering_context'
          ? { reservation_id: randomUUID(), number: 1 }
          : randomUUID();
      const before = await h.snapshot();
      await expect(invoke('reconcile', input)).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 422,
      });
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dado ato válido quando reconciliado então consumo mantém número hash e contexto forense persistidos', async () => {
    const input = h.input('reconcile');
    const reply = await invoke('reconcile', input);
    expect(reply.body).toEqual({
      grant_id: h.grantId,
      accepted_count: 1,
      rejected_count: 0,
      unresolved_count: 0,
      reconciliation_digest: expect.stringMatching(/^[a-f0-9]{64}$/u),
      reconciled_at: NOW,
    });
    const rows = await h.owner.query(
      'select reservation_id, number::text, idempotency_key, details_json from ops.numbering_consumption where reservation_id=$1',
      [h.reservationId],
    );
    expect(rows.rows).toEqual([
      {
        reservation_id: h.reservationId,
        number: String(h.number),
        idempotency_key: input.body.acts[0].idempotency_key,
        details_json: expect.objectContaining(input.body.acts[0]),
      },
    ]);
    await persistedReply('reconcile', input, reply);
  });
  it('dado lote com ato válido e ato adulterado quando reconcilia então nenhuma metade é confirmada', async () => {
    const input = h.input('reconcile');
    input.body.acts.push({
      ...input.body.acts[0],
      idempotency_key: `${h.prefix}-second-act`,
      normative_package_id: randomUUID(),
    });
    const before = await h.snapshot();
    await expect(invoke('reconcile', input)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
    });
    expect(await h.snapshot()).toEqual(before);
  });
  it('dado número já formalizado com hash quando outro ato tenta reutilizá-lo então recusa e mantém o ato original', async () => {
    const input = h.input('reconcile');
    const first = await invoke('reconcile', input);
    const second = h.input('reconcile', {
      ifMatch: first.etag,
      idempotencyKey: `${h.prefix}-different-act`,
      body: {
        idempotency_key: `${h.prefix}-different-act`,
        acts: [
          {
            ...input.body.acts[0],
            idempotency_key: `${h.prefix}-other-legal-act`,
            local_content_hash: `${h.prefix}-other-hash`,
          },
        ],
      },
    });
    const before = await h.snapshot();
    await expect(invoke('reconcile', second)).rejects.toMatchObject({
      code: 'TEAT.IDEMPOTENCY_REPLAY',
      status: 409,
    });
    expect(await h.snapshot()).toEqual(before);
  });
  it.each(['issue', 'receipt', 'reconcile', 'revoke'] as Operation[])(
    'dado %s quando processo falha em cada ponto de commit então rollback remove efeitos parciais e retry converge',
    async (operation) => {
      const input = await h.prepare(operation);
      for (const point of [
        'after-domain',
        'after-numbering',
        'after-outbox',
        'before-commit',
      ]) {
        h.crashAt = point;
        const before = await h.snapshot();
        await expect(invoke(operation, input)).rejects.toThrow(
          `fixture-crash:${point}`,
        );
        expect(h.visits).toContain(point);
        expect(await h.snapshot()).toEqual(before);
        expect(
          (await input.db.query('select txid_current_if_assigned() as xid'))
            .rows,
        ).toEqual([{ xid: null }]);
      }
      h.crashAt = undefined;
      const reply = await invoke(operation, input);
      await persistedReply(operation, input, reply);
    },
  );
  it('dado grant perdido quando revogado então decisão ator época e saldo bloqueado são auditáveis e retry não duplica', async () => {
    const input = h.input('revoke');
    const reply = await invoke('revoke', input);
    expect(reply.body).toEqual({
      grant_id: h.grantId,
      device_id: h.deviceId,
      revocation_epoch: 1,
      revoked_at: NOW,
    });
    const decisions = await h.owner.query(
      'select grant_id, device_id, revocation_epoch::int, reason_code, decision_by_subject, decided_at from ops.device_revocation where device_id=$1',
      [h.deviceId],
    );
    expect(decisions.rows).toEqual([
      {
        grant_id: h.grantId,
        device_id: h.deviceId,
        revocation_epoch: 1,
        reason_code: input.body.reason_code,
        decision_by_subject: ISSUER_A,
        decided_at: new Date(NOW),
      },
    ]);
    const grant = await h.owner.query(
      'select status, revocation_epoch::int from ops.offline_authorization_grant where id=$1',
      [h.grantId],
    );
    expect(grant.rows).toEqual([{ status: 'revoked', revocation_epoch: 1 }]);
    const reserve = await h.owner.query(
      'select status from ops.numbering_reservation where id=$1',
      [h.reservationId],
    );
    expect(reserve.rows).toEqual([{ status: 'blocked' }]);
    const before = await h.snapshot();
    expect(await invoke('revoke', input)).toEqual(reply);
    expect(await h.snapshot()).toEqual(before);
  });
  it.each(['expiry', 'revocation'])(
    'dado ato formalizado antes de %s quando reconciliado depois então preserva número sem apagar ou renumerar',
    async (condition) => {
      const input = h.input('reconcile');
      if (condition === 'expiry') h.now = '2026-09-23T00:00:00.000Z';
      else {
        const revoked = await invoke('revoke', h.input('revoke'));
        input.ifMatch = revoked.etag;
      }
      const reply = await invoke('reconcile', input);
      expect(reply.body).toMatchObject({
        grant_id: h.grantId,
        accepted_count: 1,
        rejected_count: 0,
      });
      const original = await h.owner.query(
        'select id, reservation_id, number, finalized_at, details_json from ops.numbering_consumption where reservation_id=$1',
        [h.reservationId],
      );
      expect(original.rowCount).toBe(1);
      expect(original.rows[0].number).toBe(String(h.number));
      expect(original.rows[0].details_json).toMatchObject(input.body.acts[0]);
      const replay = await invoke('reconcile', input);
      expect(replay).toEqual(reply);
      expect(
        (
          await h.owner.query(
            'select id, reservation_id, number, finalized_at, details_json from ops.numbering_consumption where reservation_id=$1',
            [h.reservationId],
          )
        ).rows,
      ).toEqual(original.rows);
    },
  );
});
