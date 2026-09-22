import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contract = JSON.parse(
  await readFile(
    new URL(
      '../../../docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

const POSTS = [
  '/v1/ops/provisioning/devices/{deviceId}/key-challenges',
  '/v1/ops/provisioning/devices/{deviceId}/keys',
  '/v1/ops/provisioning/packages',
  '/v1/ops/provisioning/packages/{id}/receipts',
  '/v1/ops/provisioning/grants/{id}/revoke',
  '/v1/ops/provisioning/grants/{id}/reconcile',
];

const GETS = [
  '/v1/ops/provisioning/packages/{id}/content',
  '/v1/ops/provisioning/devices/{deviceId}/readiness',
];

function refs(operation) {
  return operation.parameters.map((parameter) => parameter.$ref);
}

function errorCodes(operation, status) {
  return Object.values(operation.responses[status].content).flatMap(
    (media) => media.schema.properties.code.enum,
  );
}

test('dado contrato de provisionamento quando comandos POST são verificados então os seis exigem If-Match e Idempotency-Key e retornam ETag', () => {
  assert.equal(POSTS.length, 6);
  for (const path of POSTS) {
    const operation = contract.paths[path].post;
    assert.deepEqual(
      refs(operation).filter((ref) => ref.endsWith('IfMatch')),
      ['#/components/parameters/IfMatch'],
      path,
    );
    assert.deepEqual(
      refs(operation).filter((ref) => ref.endsWith('IdempotencyKey')),
      ['#/components/parameters/IdempotencyKey'],
      path,
    );
    const success = operation.responses['201'] ?? operation.responses['200'];
    assert.equal(success.headers.ETag.$ref, '#/components/headers/ETag', path);
    assert.deepEqual(errorCodes(operation, '428'), ['TEAT.IF_MATCH_REQUIRED']);
    assert.deepEqual(errorCodes(operation, '412'), ['TEAT.VERSION_CONFLICT']);
  }
});

test('dado contrato de provisionamento quando os dois GET são verificados então não exigem cabeçalhos de comando', () => {
  assert.equal(GETS.length, 2);
  for (const path of GETS) {
    const operation = contract.paths[path].get;
    assert.equal(
      refs(operation).some(
        (ref) => ref.endsWith('IfMatch') || ref.endsWith('IdempotencyKey'),
      ),
      false,
      path,
    );
  }
});

test('dado contratos de registro e ato offline quando schemas são verificados então chave privada é ausente e os oito campos de INV-OFFLINE-001 são obrigatórios', () => {
  const schemas = contract.components.schemas;
  const registration = schemas.RegisterDeviceKeyRequest;
  assert.equal('private_key' in registration.properties, false);
  assert.equal('privateKey' in registration.properties, false);
  assert.deepEqual(schemas.OfflineOriginatedAct.required, [
    'idempotency_key',
    'reserved_numbering_context',
    'local_content_hash',
    'device_id',
    'agent_id',
    'occurred_at',
    'location_context',
    'normative_package_id',
  ]);
});

test('dado cada resposta final de provisionamento quando o contrato é publicado então cada sucesso declara um corpo OpenAPI concreto sem material privado', () => {
  const operations = [
    ...POSTS.map((path) => contract.paths[path].post),
    ...GETS.map((path) => contract.paths[path].get),
  ];

  for (const operation of operations) {
    const success = operation.responses['201'] ?? operation.responses['200'];
    const schema = success.content['application/json'].schema;
    assert.match(schema.$ref, /^#\/components\/schemas\/[A-Za-z]+Response$/u);
    const schemaName = schema.$ref.split('/').at(-1);
    const properties = contract.components.schemas[schemaName].properties;
    assert.equal(
      Object.keys(properties).some((key) =>
        /private(?:_|)key|protected(?:_|)value/iu.test(key),
      ),
      false,
      `${operation.operationId} não pode publicar chave privada ou valor protegido`,
    );
  }
});

test('dado corpos JSON de concessão, recibo e reconciliação quando o contrato é verificado então coleções são arrays tipados, nunca objetos JSON livres', () => {
  const schemas = contract.components.schemas;
  for (const [schemaName, property] of [
    ['IssueProvisioningPackageRequest', 'authorized_agents'],
    ['IssueProvisioningPackageRequest', 'numbering_reservation_ids'],
    ['AuthorizedAgent', 'roles'],
    ['AuthorizedAgent', 'permissions'],
    ['ReconcileGrantRequest', 'acts'],
  ]) {
    const definition = schemas[schemaName].properties[property];
    assert.equal(definition.type, 'array', `${schemaName}.${property}`);
    assert.ok(definition.items, `${schemaName}.${property} precisa de items`);
  }
});

test('dado grant persistido publicado quando entidade e DTO CRUD são gerados então ambos preservam arrays de agentes e reservas tipadas', async () => {
  const crud = JSON.parse(
    await readFile(
      new URL(
        '../../../docs/framework/contracts/BP-OPS-PROVISIONING-001.openapi.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  for (const name of [
    'OfflineAuthorizationGrant',
    'CreateOfflineAuthorizationGrantDto',
  ]) {
    const properties = crud.components.schemas[name].properties;
    assert.equal(properties.authorized_agents_json.type, 'array');
    assert.deepEqual(properties.authorized_agents_json.items.required, [
      'agent_id',
      'registration_number',
      'roles',
      'permissions',
    ]);
    assert.equal(
      properties.authorized_agents_json.items.properties.agent_id.format,
      'uuid',
    );
    assert.deepEqual(properties.numbering_reservation_ids_json, {
      type: 'array',
      minItems: 1,
      items: { type: 'string', format: 'uuid' },
    });
  }
});
