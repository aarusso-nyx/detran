import { describe, expect, it } from 'vitest';
import {
  RAIT_STREAM_TOPICS,
  sanitizeRaitEvent,
} from '../../src/handwritten/rait/rait-stream.service.js';

describe('GET /v1/inf/rait/stream — contrato SSE', () => {
  it('dado envelope com tenant e PII quando preparado então nenhum dado protegido vaza', () => {
    expect(
      sanitizeRaitEvent({
        tenantId: 'tenant-a',
        data: { cpf: 'x', caseId: 'case-1' },
      }),
    ).toEqual({ data: { caseId: 'case-1' } });
  });
  it('dado catálogo de tópicos quando publicado então coincide com o contrato', () => {
    expect(RAIT_STREAM_TOPICS).toEqual([
      'case',
      'assignment',
      'clock',
      'session',
      'agenda-item',
      'batch',
      'outbox',
    ]);
  });
});
