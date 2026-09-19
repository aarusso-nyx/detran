// R-0014 TASK-0008 (Inspector). `core/error-boundary.ts` ganha `presentError`,
// `PORTAL_ERROR_CODES`, `ERROR_PRESENTATION`, `ErrorPresentation`, `NextStep`,
// `PresentErrorOptions` e `ClassifiedError` estendida (`fields`, `retryAfter`, `context`) — §3
// do contrato CTG-0003a (TASK-0009, Engineer). O módulo já existe (`classifyError`,
// `messageKeyFor` reais); os exports novos ainda não — o spec importa o módulo por namespace e
// tipa contra `PortalErrorBoundaryContract` (`src/testing/contract-types.ts`, transcrição do
// §3) com `as unknown as`, evitando o TS2305 "has no exported member" que uma importação
// nomeada direta produziria (arquivo "(altera)" do §1; ver relatório de entrega). Em runtime,
// `presentError`/`PORTAL_ERROR_CODES` são `undefined` até TASK-0009: as chamadas lançam
// "is not a function"/"is not iterable" — falha esperada.
import { HttpErrorResponse } from '@angular/common/http';
import * as ErrorBoundaryModule from './error-boundary';
import {
  PORTAL_ERROR_CODES,
  type PortalErrorBoundaryContract,
} from '../../testing/contract-types';
import { readCatalog } from '../../testing/kb';
import { AIT_ID, portalErrorBody } from '../../testing/http-fixtures';

const errorBoundary =
  ErrorBoundaryModule as unknown as PortalErrorBoundaryContract;

function httpError(
  status: number,
  code: string,
  context?: Record<string, unknown>,
): HttpErrorResponse {
  return new HttpErrorResponse({
    error: portalErrorBody(code, status, context),
    status,
    statusText: 'error',
  });
}

describe('presentError — cobertura dos 67 códigos do catálogo §3.3', () => {
  it('dado cada um dos 67 códigos de PORTAL_ERROR_CODES quando presentError então messageKey = portal.errors.<código minúsculo> e a chave existe no catálogo', () => {
    // C-3a-19
    const catalog = readCatalog();
    const missing: string[] = [];
    for (const code of PORTAL_ERROR_CODES) {
      const presentation = errorBoundary.presentError(httpError(400, code));
      const expectedKey = `portal.errors.${code.slice('PORTAL.'.length).toLowerCase()}`;
      if (presentation.messageKey !== expectedKey) {
        missing.push(
          `${code}: messageKey inesperado ${presentation.messageKey}`,
        );
      }
      if (!(expectedKey in catalog)) {
        missing.push(`${code}: chave ausente do catálogo (${expectedKey})`);
      }
    }
    expect(missing).toEqual([]);
    expect(PORTAL_ERROR_CODES).toHaveLength(67);
  });
});

describe('presentError — elevação de nível (ASSURANCE_INSUFFICIENT)', () => {
  it('dado 403 ASSURANCE_INSUFFICIENT com options.resumeRoute então nextStep elevation, nextStepRoute com retomar, contexto preservado e nunca context.resumeRoute como rota [DIVERGE-8]', () => {
    // C-3a-20
    const error = httpError(403, 'PORTAL.ASSURANCE_INSUFFICIENT', {
      actKey: 'defesa_previa',
      required: 'avancada',
      current: 'simples',
      elevationMethods: ['biographic', 'biometric', 'icp'],
      resumeRoute: '/v1/portal/requests/x',
    });
    const presentation = errorBoundary.presentError(error, {
      resumeRoute: '/autos/x/defesa/nova',
    });
    expect(presentation.nextStep).toBe('elevation');
    expect(presentation.nextStepRoute).toBe(
      '/assinatura/elevacao?retomar=%2Fautos%2Fx%2Fdefesa%2Fnova',
    );
    expect(presentation.context['actKey']).toBe('defesa_previa');
    expect(presentation.nextStepRoute).not.toContain(
      encodeURIComponent('/v1/portal/requests/x'),
    );
  });
});

describe('presentError — vínculo (NOT_FOUND, ENTITLEMENT_REQUIRED)', () => {
  it('dado 404 NOT_FOUND com options.entitlement então nextStep entitlement_help com recurso/id; dado 422 ENTITLEMENT_REQUIRED então idem', () => {
    // C-3a-21
    const options = { entitlement: { kind: 'ait', id: AIT_ID } };
    const notFound = errorBoundary.presentError(
      httpError(404, 'PORTAL.NOT_FOUND', { kind: 'ait' }),
      options,
    );
    expect(notFound.nextStep).toBe('entitlement_help');
    expect(notFound.nextStepRoute).toBe(
      `/vinculo/por-que-nao-vejo?recurso=ait&id=${AIT_ID}`,
    );
    const entitlementRequired = errorBoundary.presentError(
      httpError(422, 'PORTAL.ENTITLEMENT_REQUIRED', {
        targetKind: 'ait',
        howToProve: 'procuracao',
      }),
      options,
    );
    expect(entitlementRequired.nextStep).toBe('entitlement_help');
    expect(entitlementRequired.nextStepRoute).toBe(
      `/vinculo/por-que-nao-vejo?recurso=ait&id=${AIT_ID}`,
    );
  });
});

describe('presentError — inelegibilidade e indisponibilidade', () => {
  it('dado 422 INELIGIBLE então nextStep ineligible, alternativeChannel true; dado 422 SERVICE_UNAVAILABLE com options.serviceKey então nextStep service_unavailable com a rota do serviço', () => {
    // C-3a-22
    const ineligible = errorBoundary.presentError(
      httpError(422, 'PORTAL.INELIGIBLE', {
        reason: 'fora do escopo',
        alternative: 'presencial',
        serviceKey: 'defesa_previa',
      }),
    );
    expect(ineligible.nextStep).toBe('ineligible');
    expect(ineligible.alternativeChannel).toBe(true);

    const unavailable = errorBoundary.presentError(
      httpError(422, 'PORTAL.SERVICE_UNAVAILABLE', {
        unavailableReason: 'delegacao_indisponivel_r0007',
        alternativeChannelNote: 'Atendimento presencial',
      }),
      { serviceKey: 'defesa_previa' },
    );
    expect(unavailable.nextStep).toBe('service_unavailable');
    expect(unavailable.nextStepRoute).toBe(
      '/servico-indisponivel/defesa_previa',
    );
  });
});

describe('presentError — severidade (warning/info) e canal alternativo', () => {
  it('dado REQUEST_OUT_OF_DEADLINE, SERVICE_PARTIALLY_AVAILABLE, DELEGATION_FAILED então warning e alternativeChannel false', () => {
    // C-3a-23 (parte 1)
    for (const code of [
      'PORTAL.REQUEST_OUT_OF_DEADLINE',
      'PORTAL.SERVICE_PARTIALLY_AVAILABLE',
      'PORTAL.DELEGATION_FAILED',
    ] as const) {
      const presentation = errorBoundary.presentError(httpError(502, code));
      expect(presentation.severity, code).toBe('warning');
      expect(presentation.alternativeChannel, code).toBe(false);
    }
  });

  it('dado INDICATION_SECOND_SIGNATURE_PENDING, CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING, CRASH_THIRD_PARTY_DATA_RESTRICTED, EXAM_PROCESSING, PRIVACY_NO_DATA então info', () => {
    // C-3a-23 (parte 2). §3.3 marca status "—" para estas linhas (sem status HTTP fixo — são
    // avisos, não falhas); o status usado aqui é arbitrário, só a classificação importa.
    for (const code of [
      'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING',
      'PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING',
      'PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED',
      'PORTAL.EXAM_PROCESSING',
      'PORTAL.PRIVACY_NO_DATA',
    ] as const) {
      const presentation = errorBoundary.presentError(httpError(200, code));
      expect(presentation.severity, code).toBe('info');
    }
  });
});

describe('presentError — 503 *_UNAVAILABLE (retry + canal alternativo)', () => {
  it('dado 503 PAYMENT_PROVIDER_UNAVAILABLE | SNE_UPSTREAM_UNAVAILABLE | NATIONAL_READ_UNAVAILABLE então nextStep retry, alternativeChannel true, retryAfter do context', () => {
    // C-3a-24
    for (const code of [
      'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE',
      'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
      'PORTAL.NATIONAL_READ_UNAVAILABLE',
    ] as const) {
      const presentation = errorBoundary.presentError(
        httpError(503, code, { retryAfter: 30 }),
      );
      expect(presentation.nextStep, code).toBe('retry');
      expect(presentation.alternativeChannel, code).toBe(true);
      expect(presentation.retryAfter, code).toBe(30);
    }
  });
});

describe('presentError — DELEGATION_FAILED (recibo mantido)', () => {
  it('dado 502 DELEGATION_FAILED com protocol então severity warning, nextStep none, context.protocol preservado', () => {
    // C-3a-25
    const protocol = {
      number: 'AM-FIXTURES-2026-0000005',
      issuedAt: '2026-09-05T12:00:00-04:00',
      channel: 'portal',
    };
    const presentation = errorBoundary.presentError(
      httpError(502, 'PORTAL.DELEGATION_FAILED', {
        protocol,
        retryPolicy: 'manual',
      }),
    );
    expect(presentation.severity).toBe('warning');
    expect(presentation.nextStep).toBe('none');
    expect(presentation.context['protocol']).toEqual(protocol);
  });
});

describe('presentError — campos inválidos (inline_fields)', () => {
  it('dado 400 VALIDATION_FAILED, 422 INDICATION_DRIVER_INVALID e 422 SNE_CONTACT_REQUIRED então nextStep inline_fields com fields (SNE: missing[] → fields)', () => {
    // C-3a-26
    const validation = errorBoundary.presentError(
      httpError(400, 'PORTAL.VALIDATION_FAILED', { fields: ['facts'] }),
    );
    expect(validation.nextStep).toBe('inline_fields');
    expect(validation.fields).toEqual(['facts']);

    const driver = errorBoundary.presentError(
      httpError(422, 'PORTAL.INDICATION_DRIVER_INVALID', {
        fields: ['driver.cpf'],
      }),
    );
    expect(driver.nextStep).toBe('inline_fields');
    expect(driver.fields).toEqual(['driver.cpf']);

    const sne = errorBoundary.presentError(
      httpError(422, 'PORTAL.SNE_CONTACT_REQUIRED', { missing: ['email'] }),
    );
    expect(sne.nextStep).toBe('inline_fields');
    expect(sne.fields).toEqual(['email']);
  });
});

describe('presentError — erro fora do catálogo e offline [negativo]', () => {
  it('dado 400 sem code (kernel de idempotência, [DIVERGE-6]) então code null, messageKey portal.states.error, nextStep retry', () => {
    // C-3a-27
    const error = new HttpErrorResponse({
      error: { message: 'corpo fora da forma' },
      status: 400,
      statusText: 'Bad Request',
    });
    const classified = errorBoundary.classifyError(error);
    expect(classified.code).toBeNull();
    const presentation = errorBoundary.presentError(error);
    expect(presentation.messageKey).toBe('portal.states.error');
    expect(presentation.nextStep).toBe('retry');
  });

  it('dado status 0 então messageKey depende de navigator.onLine (offline × error)', () => {
    // C-3a-28
    const error = new HttpErrorResponse({ status: 0, statusText: 'timeout' });
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');

    onLineSpy.mockReturnValue(false);
    expect(errorBoundary.presentError(error).messageKey).toBe(
      'portal.states.offline',
    );

    onLineSpy.mockReturnValue(true);
    expect(errorBoundary.presentError(error).messageKey).toBe(
      'portal.states.error',
    );

    onLineSpy.mockRestore();
  });
});

describe('presentError — pedido já existente', () => {
  it('dado 409 REQUEST_DRAFT_EXISTS então nextStep existing_request com a rota do processo; dado 422 REQUEST_ONE_PER_AIT sem id então existing_request com nextStepRoute null', () => {
    // C-3a-29
    const draftExists = errorBoundary.presentError(
      httpError(409, 'PORTAL.REQUEST_DRAFT_EXISTS', {
        requestId: '00000000-0000-7000-8000-000070400005',
      }),
    );
    expect(draftExists.nextStep).toBe('existing_request');
    expect(draftExists.nextStepRoute).toBe(
      '/processos/00000000-0000-7000-8000-000070400005',
    );

    const onePerAit = errorBoundary.presentError(
      httpError(422, 'PORTAL.REQUEST_ONE_PER_AIT', {
        existingProtocol: 'AM-FIXTURES-2026-0000001',
      }),
    );
    expect(onePerAit.nextStep).toBe('existing_request');
    expect(onePerAit.nextStepRoute).toBeNull();
  });
});

describe('presentError — messageKey do servidor fora do namespace portal.errors', () => {
  it("dado corpo com messageKey 'zz.errors.x' então messageKey = messageKeyFor(code), nunca a chave estranha", () => {
    // C-3a-30. B10 (iteração 2): o literal usado como chave "de fora" precisa ficar fora das
    // superfícies do `verify:parameter-catalogue` (que varre `rait.*` como namespace real) —
    // `zz.errors.x` é um prefixo inequivocamente fictício, nunca uma chave real do catálogo.
    const error = new HttpErrorResponse({
      error: {
        code: 'PORTAL.INTERNAL',
        status: 500,
        message: 'erro',
        messageKey: 'zz.errors.x',
      },
      status: 500,
      statusText: 'Internal Server Error',
    });
    const presentation = errorBoundary.presentError(error);
    expect(presentation.messageKey).toBe('portal.errors.internal');
  });
});
