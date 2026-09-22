// Modelos do módulo caso (contrato CTG-0002b §2): SÓ `import type` de `@detran/api-clients` —
// cada alias aponta para `BpInfRaitCase001.components['schemas'][…]` (ADR-0007: gerado, nunca
// editado). Enums = tipos indexados dos campos do contrato (única fonte de tokens, spec §8;
// glossário §2.8). Nenhum campo inventado; nenhum tipo manuscrito descreve payload da API.
import type { BpInfRaitCase001 } from '@detran/api-clients';

type S = BpInfRaitCase001.components['schemas'];

export type RaitCase = S['RaitCase'];
export type RaitParty = S['RaitParty'];
export type RaitDocument = S['RaitDocument'];
export type RaitPriorityAssessment = S['RaitPriorityAssessment'];
export type RaitPriorityBasis = S['RaitPriorityBasis'];
export type RaitPendingContent = S['RaitPendingContent'];
export type RaitRedirect = S['RaitRedirect'];
export type RaitAdmissibility = S['RaitAdmissibility'];
export type RaitDeadline = S['RaitDeadline'];
export type RaitInquiry = S['RaitInquiry'];
export type RaitInquiryDocument = S['RaitInquiryDocument'];
export type RaitPendingDocument = S['RaitPendingDocument'];
export type RaitWithdrawalAttestation = S['RaitWithdrawalAttestation'];
export type RaitDraft = S['RaitDraft'];
export type RaitDecision = S['RaitDecision'];
export type RaitCommunication = S['RaitCommunication'];
export type RaitCaseEvent = S['RaitCaseEvent'];

// `Create<X>Dto` gerados do CRUD — usados só nas assinaturas de comando (§3.5) até R-0007
// CTG-0004 trocar pelo tipo do contrato `.commands`.
export type CreateRaitCaseDto = S['CreateRaitCaseDto'];
export type CreateRaitPartyDto = S['CreateRaitPartyDto'];
export type CreateRaitDocumentDto = S['CreateRaitDocumentDto'];
export type CreateRaitPriorityAssessmentDto =
  S['CreateRaitPriorityAssessmentDto'];
export type CreateRaitPriorityBasisDto = S['CreateRaitPriorityBasisDto'];
export type CreateRaitPendingContentDto = S['CreateRaitPendingContentDto'];
export type CreateRaitRedirectDto = S['CreateRaitRedirectDto'];
export type CreateRaitAdmissibilityDto = S['CreateRaitAdmissibilityDto'];
export type CreateRaitDeadlineDto = S['CreateRaitDeadlineDto'];
export type CreateRaitInquiryDto = S['CreateRaitInquiryDto'];
export type CreateRaitInquiryDocumentDto = S['CreateRaitInquiryDocumentDto'];
export type CreateRaitPendingDocumentDto = S['CreateRaitPendingDocumentDto'];
export type CreateRaitWithdrawalAttestationDto =
  S['CreateRaitWithdrawalAttestationDto'];
export type CreateRaitDraftDto = S['CreateRaitDraftDto'];
export type CreateRaitDecisionDto = S['CreateRaitDecisionDto'];
export type CreateRaitCommunicationDto = S['CreateRaitCommunicationDto'];
export type CreateRaitCaseEventDto = S['CreateRaitCaseEventDto'];

/** 16 tokens de WF-RAIT-001. */
export type RaitCaseState = RaitCase['state'];
export type RaitInstance = RaitCase['instance'];
export type RaitNonAdmissionReason = NonNullable<
  RaitCase['non_admission_reason']
>;
export type RaitPartyRole = RaitParty['role'];
export type RaitLegitimacyBasis = NonNullable<RaitParty['legitimacy_basis']>;
export type RaitDocumentOrigin = RaitDocument['origin'];
export type RaitAdmissibilityCriterion = RaitAdmissibility['criterion'];
export type RaitTimerCode = RaitDeadline['timer_code'];
export type RaitInquiryAddressee = RaitInquiry['addressee'];
export type RaitInquiryOutcome = NonNullable<RaitInquiry['outcome']>;
export type RaitDraftStatus = RaitDraft['status'];
export type RaitDecisionKind = RaitDecision['decision_kind'];
export type RaitCommunicationChannel = RaitCommunication['channel'];
export type RaitRedirectDirection = RaitRedirect['direction'];
export type RaitRedirectReason = RaitRedirect['reason'];
export type RaitPendingContentOutcome = NonNullable<
  RaitPendingContent['outcome']
>;
