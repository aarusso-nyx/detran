// R-0032 CTG-0002 — the citizen path needs a distinct, guarded query port.
// `getOwn()` remains the clinical candidate flow keyed by patient.user_id.
import { describe, expect, it } from 'vitest';

import { CandidateDossierService } from './candidate-dossier.service.js';

describe('R-0032 CTG-0002 — CandidateDossierQueryPort', () => {
  it('dado o serviço clínico quando o Portal exige consulta cidadã então expõe porta distinta de getOwn', () => {
    const service = new CandidateDossierService({} as never, {} as never);
    const citizenPort = service as unknown as {
      getForCitizen?: (input: {
        tenantId: string;
        encounterId: string;
        examId: string;
        subjectCpfHash: string;
        onBehalfOf: string;
        auditContext: unknown;
      }) => Promise<unknown>;
    };

    expect(citizenPort.getForCitizen).toBeTypeOf('function');
  });

  it.todo(
    'O4 + OD-R32-002/005: getForCitizen compara tenant e hash do paciente, nega terceiro com 404, retorna conteúdo aprovado sem máscara e omite encounter_status',
  );
  it.todo(
    'O4 + OD-R32-005: leitura autorizada grava PORTAL_PEC_DOSSIER_READ e CH_CANDIDATE_DOSSIER_READ com onBehalfOf; SUPORTE segue mascarado em seu fluxo',
  );
});
