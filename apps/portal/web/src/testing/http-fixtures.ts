// R-0014 TASK-0008 (Inspector). Fixtures HTTP centralizadas para os specs do par 1 (CTG-0003a
// §9): ids canônicos de `backend/database/seed/70-fixtures-portal.sql` e corpos literais dos
// critérios `C-3a-nn` do contrato. Nenhum valor inventado — cada constante cita a linha do
// contrato ou da seed de onde veio; o que a seed não define (ex.: cpf em claro — só `cpf_hash`
// é persistido) fica fora do fixture em vez de ser inventado.
export const TENANT_ID = '00000000-0000-7000-8000-00000000a001'; // contrato, intro
export const SUBJECT_PRATA_ID = '00000000-0000-7000-8000-000070000002'; // seed 10.2 "Cidadã Prata (fixture)"
export const AIT_ID = '00000000-0000-7000-8000-0000f0000002'; // contrato, intro
export const REQUEST_COMPOSICAO_ID = '00000000-0000-7000-8000-000070400005'; // contrato, intro ("pedido em composição")
export const REQUEST_DESISTIDO_ID = '00000000-0000-7000-8000-00007040000c'; // seed 10.5, state DESISTIDO
export const REPRESENTATION_ID = '00000000-0000-7000-8000-000070100001'; // seed 10.3

/** Relógio fixo do §9 do contrato (`PortalClock` substituído por `useValue` nos specs). */
export const FIXED_CLOCK_ISO = '2026-09-14T12:00:00-04:00';
export const FIXED_CLOCK_DATE = new Date(FIXED_CLOCK_ISO);

/** Corpo de erro padrão do domínio `portal` (`portal.client.ts` `PortalErrorBody`, catálogo §8). */
export function portalErrorBody(
  code: string,
  status: number,
  context?: Record<string, unknown>,
): {
  code: string;
  status: number;
  message: string;
  context?: Record<string, unknown>;
} {
  return {
    code,
    status,
    message: code,
    ...(context ? { context } : {}),
  };
}

/** `GET /v1/portal/identity/me` — corpo do C-3a-38 (contrato §9). */
export const ME_RESPONSE_FIXTURE = {
  subjectId: SUBJECT_PRATA_ID,
  name: 'Cidadã Prata (fixture)',
  assuranceLevel: 'avancada' as const,
  actRequirements: [
    { actKey: 'defesa_previa', minimumAssurance: 'avancada', allowed: true },
    { actKey: 'consulta_multas', minimumAssurance: 'simples', allowed: false },
  ],
  representations: [
    {
      id: REPRESENTATION_ID,
      representedName: 'Cidadã Prata (fixture)',
      scope: 'ait' as const,
      validUntil: '2027-09-14',
    },
  ],
  preferences: null,
  heldDataSummary: [],
};

/** `POST /v1/portal/requests` 201 — corpo do C-3a-05/C-3a-55 (contrato §2.1, §9). */
export const REQUEST_CREATED_FIXTURE = {
  requestId: REQUEST_COMPOSICAO_ID,
  state: 'PEDIDO_EM_COMPOSICAO' as const,
  prefilled: { placa: 'ABC1D23' },
  requirements: ['Conta gov.br'],
  minimumAssurance: 'avancada' as const,
  version: 1,
};

/** `PUT .../draft` 200 — corpo do C-3a-07 (contrato §2.1). */
export const DRAFT_SAVED_FIXTURE = {
  requestId: REQUEST_COMPOSICAO_ID,
  version: 2,
  savedAt: FIXED_CLOCK_ISO,
};

/** `POST .../submit` 200 — corpo do C-3a-58 (contrato §9; protocolo do C-3a-82). */
export const REQUEST_SUBMITTED_FIXTURE = {
  requestId: REQUEST_COMPOSICAO_ID,
  state: 'EM_ANDAMENTO_NO_ORGAO' as const,
  protocol: {
    number: 'AM-FIXTURES-2026-0000005',
    issuedAt: '2026-09-05T12:00:00-04:00',
    channel: 'portal' as const,
  },
  delegation: { status: 'delegated' as const, externalId: null },
  version: 2,
};

/** `POST .../withdraw` 200 — corpo do C-3a-12 (contrato §2.1). */
export const REQUEST_WITHDRAWN_FIXTURE = {
  requestId: REQUEST_DESISTIDO_ID,
  state: 'DESISTIDO' as const,
  withdrawnAt: FIXED_CLOCK_ISO,
  version: 2,
};
