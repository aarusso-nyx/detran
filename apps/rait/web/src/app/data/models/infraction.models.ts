// Modelos da infração (contrato CTG-0002b §2): aliases de
// `BpInfInfraction001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfInfraction001 } from '@detran/api-clients';

type S = BpInfInfraction001.components['schemas'];

export type Infraction = S['Infraction'];
export type InfractionTimer = S['InfractionTimer'];
export type InfractionEvent = S['InfractionEvent'];

export type InfractionState = Infraction['state'];
export type InfractionSubstate = NonNullable<Infraction['substate']>;
export type InfractionTimerCode = InfractionTimer['timer_code'];
export type InfractionTimerStatus = InfractionTimer['status'];
export type PaymentTier = Infraction['payment_tier'];
export type ClosureMotive = NonNullable<Infraction['closure_motive']>;
export type InfractionRiskFlag = Infraction['risk_flag'];
