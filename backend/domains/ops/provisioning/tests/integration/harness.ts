import pg from 'pg';
import { randomUUID, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { expect } from 'vitest';

import { CreateKeyChallengeCommand } from '../../src/handwritten/create-key-challenge.command.js';
import { RegisterDeviceKeyCommand } from '../../src/handwritten/register-device-key.command.js';
import { IssueProvisioningPackageCommand } from '../../src/handwritten/issue-provisioning-package.command.js';
import { DownloadProvisioningPackageCommand } from '../../src/handwritten/download-provisioning-package.command.js';
import { RecordProvisioningReceiptCommand } from '../../src/handwritten/record-provisioning-receipt.command.js';
import { RevokeOfflineGrantCommand } from '../../src/handwritten/revoke-offline-grant.command.js';
import { ReconcileOfflineGrantCommand } from '../../src/handwritten/reconcile-offline-grant.command.js';
import { readProvisioningReadiness } from '../../src/handwritten/provisioning.readiness.js';
import type { ProvisioningPorts } from '../../src/handwritten/provisioning.contract.js';

export const TENANT_A = '00000000-0000-7000-8000-00000000a001';
export const TENANT_B = '00000000-0000-7000-8000-00000000b001';
export const DEVICE_KEY_A = '00000000-0000-7000-8000-0000a2010001';
export const DEVICE_KEY_B = '00000000-0000-7000-8000-0000b2010001';
export const GRANT_A = '00000000-0000-7000-8000-0000a3010001';
export const PACKAGE_A = '00000000-0000-7000-8000-0000a4010001';
export const DEVICE_A = '00000000-0000-7000-8000-0000a1010001';

const { Client } = pg;

function databaseConfig() {
  return {
    connectionString:
      process.env.DETRAN_TEST_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/detran_r13',
  };
}

export async function tenantClient(
  tenantId: string,
): Promise<InstanceType<typeof Client>> {
  const client = new Client(databaseConfig());
  await client.connect();
  await client.query('set role role_app_backend');
  await client.query("select set_config('app.tenant_id', $1, false)", [
    tenantId,
  ]);
  return client;
}

export async function ownerClient(): Promise<InstanceType<typeof Client>> {
  const client = new Client(databaseConfig());
  await client.connect();
  return client;
}

/** Inspector-owned seam: ADR-0028 transaction, identity, clock and fixture ports.
 * The real command owns BEGIN/COMMIT/ROLLBACK on db. Tests never implement a
 * domain command or substitute an in-memory repository for PostgreSQL.
 */
export const NOW = '2026-09-21T12:00:00.000Z';
export const AGENCY_A = '00000000-0000-7000-8000-0000a1020001';
export const AGENT_A = '00000000-0000-7000-8000-0000a1030001';
export const NORMATIVE_A = '00000000-0000-7000-8000-0000a1040001';
export const ISSUER_A = AGENT_A;
export type Operation =
  | 'challenge'
  | 'register'
  | 'issue'
  | 'download'
  | 'receipt'
  | 'readiness'
  | 'revoke'
  | 'reconcile';
export type CommandReply = { body: Record<string, any>; etag: string };
export type FixturePrincipal = {
  subject: string;
  roles: string[];
  permissions: string[];
  claims: { traffic_agency_id?: string; device_id?: string; agent_id?: string };
};
export type CommandInput = {
  db: Awaited<ReturnType<typeof tenantClient>>;
  context: { tenantId: string; principal: FixturePrincipal };
  deviceId: string;
  packageId: string;
  grantId: string;
  body: Record<string, any>;
  ifMatch?: string;
  idempotencyKey?: string;
  clock: { now: () => Date };
  runtimeProfile: 'test' | 'production';
  ports: ProvisioningPorts;
};

const constructors = {
  challenge: CreateKeyChallengeCommand,
  register: RegisterDeviceKeyCommand,
  issue: IssueProvisioningPackageCommand,
  download: DownloadProvisioningPackageCommand,
  receipt: RecordProvisioningReceiptCommand,
  revoke: RevokeOfflineGrantCommand,
  reconcile: ReconcileOfflineGrantCommand,
};

export async function invoke(
  operation: Operation,
  input: CommandInput,
): Promise<CommandReply> {
  if (operation === 'readiness') {
    return (
      readProvisioningReadiness as unknown as (
        input: CommandInput,
      ) => Promise<CommandReply>
    )(input);
  }
  return new constructors[operation]().execute(
    input,
  ) as unknown as Promise<CommandReply>;
}

/** Fresh OS process: no parent module cache or singleton can satisfy replay. */
export async function invokeInFreshProcess(
  operation: Operation,
  input: CommandInput,
) {
  const names: Record<Operation, [string, string]> = {
    challenge: ['create-key-challenge.command', 'CreateKeyChallengeCommand'],
    register: ['register-device-key.command', 'RegisterDeviceKeyCommand'],
    issue: [
      'issue-provisioning-package.command',
      'IssueProvisioningPackageCommand',
    ],
    download: [
      'download-provisioning-package.command',
      'DownloadProvisioningPackageCommand',
    ],
    receipt: [
      'record-provisioning-receipt.command',
      'RecordProvisioningReceiptCommand',
    ],
    readiness: ['provisioning.readiness', 'readProvisioningReadiness'],
    revoke: ['revoke-offline-grant.command', 'RevokeOfflineGrantCommand'],
    reconcile: [
      'reconcile-offline-grant.command',
      'ReconcileOfflineGrantCommand',
    ],
  };
  const [file, symbol] = names[operation];
  const { db: _db, ports: _ports, clock, ...wire } = input;
  const modulePath = fileURLToPath(
    new URL(`../../src/handwritten/${file}.ts`, import.meta.url),
  );
  const tsconfigPath = fileURLToPath(
    new URL('./tsconfig.fresh-process.json', import.meta.url),
  );
  const script = `import pg from 'pg'; import { ${symbol} } from ${JSON.stringify(modulePath)};
    void (async () => {
      const input = ${JSON.stringify(wire)};
      const client = new pg.Client({ connectionString: process.env.DETRAN_TEST_DATABASE_URL });
      await client.connect();
      try {
        await client.query('set role role_app_backend');
        await client.query("select set_config('app.tenant_id',$1,false)", [input.context.tenantId]);
        const ports = {
          fixtureOnly: true,
          resolveDevice: async (tenantId, deviceId) => tenantId === ${JSON.stringify(TENANT_A)} && deviceId === input.deviceId ? { tenantId, deviceId, trafficAgencyId: ${JSON.stringify(AGENCY_A)}, principalSubject: ${JSON.stringify(ISSUER_A)}, agentId: ${JSON.stringify(AGENT_A)}, version: 1 } : null,
          normativeUsable: async id => id === ${JSON.stringify(NORMATIVE_A)},
          trustedSigningKey: async id => id === 'fixture-kid-a',
          verifyAttestation: async () => { throw new Error('Replay must not repeat attestation'); },
          sign: async () => { throw new Error('Replay must not sign twice'); },
          encrypt: async () => { throw new Error('Replay must not encrypt twice'); },
          checkpoint: async () => { throw new Error('Replay must not repeat mutation checkpoints'); },
        };
        const commandInput = { ...input, db: client, ports, clock: { now: () => new Date(${JSON.stringify(clock.now().toISOString())}) } };
        const reply = await ${operation === 'readiness' ? `${symbol}(commandInput)` : `new ${symbol}().execute(commandInput)`};
        process.stdout.write('R13_REPLAY:' + JSON.stringify({ reply, pid: process.pid }));
      } finally { await client.end(); }
    })().catch(error => { process.stderr.write(String(error.stack)); process.exitCode=1; });`;
  const result = await promisify(execFile)(
    'pnpm',
    ['exec', 'tsx', `--tsconfig=${tsconfigPath}`, '--eval', script],
    {
      cwd: fileURLToPath(new URL('../../../../../../', import.meta.url)),
      env: process.env,
      timeout: 15000,
      maxBuffer: 1024 * 1024,
    },
  );
  const marker = result.stdout.lastIndexOf('R13_REPLAY:');
  expect(marker).toBeGreaterThanOrEqual(0);
  return JSON.parse(result.stdout.slice(marker + 'R13_REPLAY:'.length)) as {
    reply: CommandReply;
    pid: number;
  };
}

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export class ProofHarness {
  readonly deviceId = randomUUID();
  readonly keyId = randomUUID();
  readonly grantId = randomUUID();
  readonly packageId = randomUUID();
  readonly reservationId = randomUUID();
  readonly rangeId = randomUUID();
  readonly issuanceReservationId = randomUUID();
  readonly issuanceRangeId = randomUUID();
  readonly number = 2026000001;
  readonly prefix = `r13-proof-${randomUUID()}`;
  readonly clients: Awaited<ReturnType<typeof tenantClient>>[] = [];
  owner!: Awaited<ReturnType<typeof ownerClient>>;
  now = NOW;
  crashAt: string | undefined;
  normativeUsable = true;
  bindingVersion = 1;
  bindingAgencyId = AGENCY_A;
  readonly visits: string[] = [];
  readonly signedManifests: unknown[] = [];
  readonly trustedKeyIds = new Set(['fixture-kid-a']);
  readonly ports = {
    fixtureOnly: true,
    resolveDevice: async (tenantId: string, deviceId: string) =>
      tenantId === TENANT_A && deviceId === this.deviceId
        ? {
            deviceId,
            tenantId,
            trafficAgencyId: this.bindingAgencyId,
            principalSubject: ISSUER_A,
            agentId: AGENT_A,
            version: this.bindingVersion,
          }
        : null,
    normativeUsable: async (id: string) =>
      this.normativeUsable && id === NORMATIVE_A,
    trustedSigningKey: async (id: string) => this.trustedKeyIds.has(id),
    verifyAttestation: async (input: {
      challenge: string;
      proof: string;
      deviceId: string;
      publicKey: string;
    }) =>
      input.proof ===
      `fixture-proof:${input.challenge}:${input.deviceId}:${input.publicKey}`,
    sign: async (manifest: unknown) => {
      this.visits.push('sign');
      this.signedManifests.push(manifest);
      const digest = createHash('sha256')
        .update(canonical(manifest))
        .digest('hex');
      return {
        digest,
        signature: `fixture-signature:${digest}`,
        keyId: 'fixture-kid-a',
        publicChain: ['fixture-public-chain'],
      };
    },
    encrypt: async (input: { deviceId: string; digest: string }) => {
      this.visits.push('encrypt');
      return {
        envelopeUri: `fixture://ops-provisioning/${input.deviceId}/${input.digest}`,
      };
    },
    checkpoint: async (point: string) => {
      this.visits.push(point);
      if (this.crashAt === point) throw new Error(`fixture-crash:${point}`);
    },
  };

  async open() {
    this.owner = await ownerClient();
    await this.owner.query("select set_config('app.tenant_id',$1,false)", [
      TENANT_A,
    ]);
    await this.owner.query(
      `insert into ops.ops_operational_device select (jsonb_populate_record(null::ops.ops_operational_device,to_jsonb(d)||$1::jsonb)).* from ops.ops_operational_device d where id='00000000-0000-7000-8000-0000e4000002'`,
      [
        JSON.stringify({
          id: this.deviceId,
          traffic_agency_id: AGENCY_A,
          hardware_identifier_hash: this.prefix,
        }),
      ],
    );
    await this.owner.query(
      `insert into ops.device_key select (jsonb_populate_record(null::ops.device_key, to_jsonb(k) || $1::jsonb)).* from ops.device_key k where id=$2`,
      [
        JSON.stringify({ id: this.keyId, device_id: this.deviceId }),
        DEVICE_KEY_A,
      ],
    );
    await this.owner.query(
      `insert into ops.offline_authorization_grant select (jsonb_populate_record(null::ops.offline_authorization_grant, to_jsonb(g) || $1::jsonb)).* from ops.offline_authorization_grant g where id=$2`,
      [
        JSON.stringify({
          id: this.grantId,
          device_id: this.deviceId,
          issued_by_subject: ISSUER_A,
          // ADR-0028 Amendment 4: a valid package and grant share one manifest.
          manifest_digest: `${this.prefix}-package`,
          numbering_reservation_ids_json: [this.reservationId],
          status: 'issued',
          version: 1,
          revoked_at: null,
        }),
        GRANT_A,
      ],
    );
    await this.owner.query(
      `insert into ops.provisioning_package select (jsonb_populate_record(null::ops.provisioning_package, to_jsonb(p) || $1::jsonb)).* from ops.provisioning_package p where id=$2`,
      [
        JSON.stringify({
          id: this.packageId,
          grant_id: this.grantId,
          device_id: this.deviceId,
          manifest_digest: `${this.prefix}-package`,
          artifact_digests_json: { manifest: `${this.prefix}-package` },
          envelope_uri: `fixture://ops-provisioning/${this.deviceId}/${this.prefix}-package`,
          numbering_policy_json: { reservation_ids: [this.reservationId] },
          expires_at: '2026-09-22T00:00:00Z',
          version: 1,
        }),
        PACKAGE_A,
      ],
    );
    await this.owner.query(
      `insert into ops.ait_numbering_range select (jsonb_populate_record(null::ops.ait_numbering_range, to_jsonb(r) || $1::jsonb)).* from ops.ait_numbering_range r where id='00000000-0000-7000-8000-0000e5000001'`,
      [
        JSON.stringify({
          id: this.rangeId,
          traffic_agency_id: AGENCY_A,
          series: this.rangeId,
        }),
      ],
    );
    // §5.10 (CTG-0002): uma reserva `reserved` por dispositivo e turno, garantida
    // no banco. O provisioning não lê o turno; cada reserva copiada da canônica
    // (…e6000001, de outro dispositivo e agente) recebe turno próprio.
    await this.owner.query(
      `insert into ops.numbering_reservation select (jsonb_populate_record(null::ops.numbering_reservation, to_jsonb(r) || $1::jsonb)).* from ops.numbering_reservation r where id='00000000-0000-7000-8000-0000e6000001'`,
      [
        JSON.stringify({
          id: this.reservationId,
          range_id: this.rangeId,
          device_id: this.deviceId,
          traffic_agency_id: AGENCY_A,
          agent_id: AGENT_A,
          shift_id: randomUUID(),
          idempotency_key: this.prefix,
          status: 'reserved',
          valid_until: '2026-09-22T00:00:00Z',
          reconciliation_json: {},
        }),
      ],
    );
    const seeded = await this.owner.query(
      'select count(*)::int n from ops.numbering_reservation where id=$1',
      [this.reservationId],
    );
    expect(seeded.rows).toEqual([{ n: 1 }]);
    // Historical positive grant has the same persisted recipient binding that
    // the issue command must now create atomically for every new reservation.
    await this.owner.query(
      'insert into ops.provisioning_grant_reservation_binding (tenant_id,grant_id,reservation_id,traffic_agency_id,device_id,authorized_agent_id) values ($1,$2,$3,$4,$5,$6)',
      [
        TENANT_A,
        this.grantId,
        this.reservationId,
        AGENCY_A,
        this.deviceId,
        AGENT_A,
      ],
    );
    // Issuance allocates a fresh interval. The existing grant retains its own
    // reservation so that the fixture never asks production to double-allocate.
    await this.owner.query(
      `insert into ops.ait_numbering_range select (jsonb_populate_record(null::ops.ait_numbering_range,to_jsonb(r)||$1::jsonb)).* from ops.ait_numbering_range r where id=$2`,
      [
        JSON.stringify({
          id: this.issuanceRangeId,
          series: this.issuanceRangeId,
          start_number: 2026000002,
          end_number: 2026000011,
          next_number: 2026000002,
        }),
        this.rangeId,
      ],
    );
    await this.owner.query(
      `insert into ops.numbering_reservation select (jsonb_populate_record(null::ops.numbering_reservation,to_jsonb(r)||$1::jsonb)).* from ops.numbering_reservation r where id=$2`,
      [
        JSON.stringify({
          id: this.issuanceReservationId,
          range_id: this.issuanceRangeId,
          shift_id: randomUUID(),
          start_number: 2026000002,
          end_number: 2026000011,
          idempotency_key: `${this.prefix}-fresh-interval`,
        }),
        this.reservationId,
      ],
    );
    await this.connect();
    return this;
  }

  async connect(tenantId = TENANT_A) {
    const client = await tenantClient(tenantId);
    this.clients.push(client);
    return client;
  }

  principal(operation: Operation): FixturePrincipal {
    const role =
      operation === 'challenge' ||
      operation === 'readiness' ||
      operation === 'revoke'
        ? 'agency-admin'
        : operation === 'issue'
          ? 'field-supervisor'
          : 'field-agent';
    return {
      subject: ISSUER_A,
      roles: [role],
      permissions: [],
      claims: {
        traffic_agency_id: AGENCY_A,
        device_id: this.deviceId,
        agent_id: AGENT_A,
      },
    };
  }

  body(
    operation: Operation,
    key = `${this.prefix}-${operation}`,
  ): Record<string, any> {
    const common = { idempotency_key: key };
    switch (operation) {
      case 'challenge':
        return common;
      case 'register':
        return {
          ...common,
          challenge_id: this.keyId,
          challenge_proof: 'fixture-unprepared-proof',
          public_key: 'PUBLIC-KEY-FIXTURE-ROTATED',
          key_fingerprint: `${this.prefix}-public`,
          attestation_evidence: { fixture: true },
        };
      case 'issue':
        return {
          ...common,
          device_id: this.deviceId,
          authorized_agents: [
            {
              agent_id: AGENT_A,
              registration_number: 'fixture-agent-a',
              roles: ['field-agent'],
              permissions: ['ops:provisioning'],
            },
          ],
          valid_from: '2026-09-21T00:00:00Z',
          valid_until: '2026-09-22T00:00:00Z',
          maximum_offline_seconds: 3600,
          maximum_acts: 10,
          policy_version: 'fixture-policy-v1',
          normative_package_id: NORMATIVE_A,
          numbering_reservation_ids: [this.issuanceReservationId],
        };
      case 'receipt':
        return {
          ...common,
          receipt_type: 'installed',
          manifest_digest: `${this.prefix}-package`,
          occurred_at: NOW,
        };
      case 'revoke':
        return {
          ...common,
          reason_code: 'fixture-loss',
          revocation_epoch: 1,
          decided_at: NOW,
        };
      case 'reconcile':
        return {
          ...common,
          acts: [
            {
              idempotency_key: `${this.prefix}-act`,
              reserved_numbering_context: {
                reservation_id: this.reservationId,
                number: this.number,
              },
              local_content_hash: `${this.prefix}-hash`,
              device_id: this.deviceId,
              agent_id: AGENT_A,
              occurred_at: '2026-09-21T01:00:00Z',
              location_context: { latitude: -23, longitude: -46 },
              normative_package_id: NORMATIVE_A,
            },
          ],
        };
      default:
        return {};
    }
  }

  input(
    operation: Operation,
    overrides: Partial<CommandInput> = {},
  ): CommandInput {
    return {
      db: this.clients[0]!,
      context: { tenantId: TENANT_A, principal: this.principal(operation) },
      deviceId: this.deviceId,
      packageId: this.packageId,
      grantId: this.grantId,
      body: this.body(operation),
      ifMatch: operation === 'challenge' ? undefined : '"1"',
      idempotencyKey: `${this.prefix}-${operation}`,
      clock: { now: () => new Date(this.now) },
      runtimeProfile: 'test',
      ports: this.ports,
      ...overrides,
    };
  }

  async prepare(operation: Operation): Promise<CommandInput> {
    const input = this.input(operation);
    if (operation === 'register') {
      const challenge = await invoke(
        'challenge',
        await this.prepare('challenge'),
      );
      expect(challenge.body).toMatchObject({
        device_id: this.deviceId,
        challenge_id: expect.stringMatching(/^[a-f0-9-]{36}$/u),
        challenge: expect.stringMatching(/\S/u),
      });
      input.ifMatch = challenge.etag;
      input.body.challenge_id = challenge.body.challenge_id;
      input.body.challenge_proof = `fixture-proof:${challenge.body.challenge}:${this.deviceId}:${input.body.public_key}`;
    }
    if (operation === 'issue' || operation === 'challenge') {
      input.ifMatch = (await invoke('readiness', this.input('readiness'))).etag;
    }
    return input;
  }

  async snapshot() {
    const result: Record<string, unknown> = {};
    result.device = (
      await this.owner.query(
        'select to_jsonb(t) as value from ops.ops_operational_device t where id=$1',
        [this.deviceId],
      )
    ).rows;
    for (const table of [
      'device_key',
      'offline_authorization_grant',
      'provisioning_package',
      'provisioning_receipt',
      'device_revocation',
      'provisioning_reconciliation',
      'provisioning_grant_reservation_binding',
      'sync_queue_item',
      'numbering_reservation',
    ]) {
      result[table] = (
        await this.owner.query(
          `select to_jsonb(t) as value from ops.${table} t where device_id=$1 order by id`,
          [this.deviceId],
        )
      ).rows;
    }
    result.numbering_consumption = (
      await this.owner.query(
        'select to_jsonb(t) as value from ops.numbering_consumption t where reservation_id=any($1::uuid[]) order by id',
        [[this.reservationId, this.issuanceReservationId]],
      )
    ).rows;
    result.numbering_ranges = (
      await this.owner.query(
        'select to_jsonb(t) as value from ops.ait_numbering_range t where id=any($1::uuid[]) order by id',
        [[this.rangeId, this.issuanceRangeId]],
      )
    ).rows;
    result.idempotency = (
      await this.owner.query(
        'select to_jsonb(t) as value from ops.provisioning_command_idempotency t where idempotency_key like $1 order by id',
        [`${this.prefix}%`],
      )
    ).rows;
    result.outbox = (
      await this.owner.query(
        'select to_jsonb(t) as value from integration.outbox t where idempotency_key like $1 or aggregate_id in ($2,$3,$4) order by id',
        [`%${this.prefix}%`, this.deviceId, this.grantId, this.packageId],
      )
    ).rows;
    return result;
  }

  async close() {
    await Promise.all(
      this.clients.map(async (client) => {
        await client.query('rollback');
        await client.end();
      }),
    );
    await this.owner.query(
      'delete from integration.outbox where idempotency_key like $1 or aggregate_id in ($2,$3,$4) or aggregate_id in (select id::text from ops.provisioning_package where device_id=$2::uuid)',
      [`%${this.prefix}%`, this.deviceId, this.grantId, this.packageId],
    );
    await this.owner.query(
      'delete from ops.provisioning_command_idempotency where idempotency_key like $1',
      [`${this.prefix}%`],
    );
    await this.owner.query(
      'delete from ops.numbering_consumption where reservation_id=any($1::uuid[])',
      [[this.reservationId, this.issuanceReservationId]],
    );
    for (const table of [
      'provisioning_receipt',
      'provisioning_reconciliation',
      'provisioning_grant_reservation_binding',
      'sync_queue_item',
      'device_revocation',
      'provisioning_package',
      'offline_authorization_grant',
      'device_key',
      'numbering_reservation',
    ]) {
      await this.owner.query(`delete from ops.${table} where device_id=$1`, [
        this.deviceId,
      ]);
    }
    await this.owner.query('delete from ops.ait_numbering_range where id=$1', [
      this.rangeId,
    ]);
    await this.owner.query('delete from ops.ait_numbering_range where id=$1', [
      this.issuanceRangeId,
    ]);
    await this.owner.query(
      'delete from ops.ops_operational_device where id=$1',
      [this.deviceId],
    );
    await this.owner.end();
  }
}

export function assertReply(reply: CommandReply) {
  expect(reply.etag).toMatch(/^"[^"\r\n]+"$/u);
  expect(reply.etag).not.toMatch(/ops-provisioning-(?:v1|readiness-v1)/u);
  expect(JSON.stringify(reply)).not.toMatch(
    /private[_-]?key|refresh[_-]?token|protected[_-]?value|BEGIN.*PRIVATE/iu,
  );
}
