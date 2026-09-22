// Modelos do módulo integrações (contrato CTG-0002b §2): aliases de
// `BpInfRaitIntegration001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfRaitIntegration001 } from '@detran/api-clients';

type S = BpInfRaitIntegration001.components['schemas'];

export type RaitReconciliation = S['RaitReconciliation'];
export type CreateRaitReconciliationDto = S['CreateRaitReconciliationDto'];

export type RaitReconciliationSystem = RaitReconciliation['system'];
export type RaitReconciliationStatus = RaitReconciliation['status'];
