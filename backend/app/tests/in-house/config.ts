export const inHouseEnabled = process.env.DETRAN_IN_HOUSE === '1';

export interface InHouseConfiguration {
  apiBaseUrl: string;
  cognitoAccessToken: string;
  clinicalTrustHealthUrl: string;
  clinicalTrustToken: string;
  readerDatabaseUrl: string;
  tenantId: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when DETRAN_IN_HOUSE=1`);
  return value;
}

function url(name: string, protocols: string[]): string {
  const value = required(name);
  const parsed = new URL(value);
  if (!protocols.includes(parsed.protocol)) {
    throw new Error(`${name} must use ${protocols.join(' or ')}`);
  }
  return value.replace(/\/$/u, '');
}

export function inHouseConfiguration(): InHouseConfiguration {
  const tenantId = required('DETRAN_IN_HOUSE_TENANT_ID');
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      tenantId,
    )
  ) {
    throw new Error('DETRAN_IN_HOUSE_TENANT_ID must be a UUID');
  }
  const readerDatabaseUrl = url('DETRAN_IN_HOUSE_READER_DATABASE_URL', [
    'postgres:',
    'postgresql:',
  ]);
  const databaseUser = new URL(readerDatabaseUrl).username;
  if (!databaseUser || databaseUser === 'postgres') {
    throw new Error(
      'DETRAN_IN_HOUSE_READER_DATABASE_URL must identify a non-postgres reader role',
    );
  }
  return {
    apiBaseUrl: url('DETRAN_IN_HOUSE_API_BASE_URL', ['https:']),
    cognitoAccessToken: required('DETRAN_IN_HOUSE_COGNITO_ACCESS_TOKEN'),
    clinicalTrustHealthUrl: url('DETRAN_IN_HOUSE_CLINICAL_TRUST_HEALTH_URL', [
      'https:',
    ]),
    clinicalTrustToken: required('DETRAN_IN_HOUSE_CLINICAL_TRUST_TOKEN'),
    readerDatabaseUrl,
    tenantId,
  };
}
