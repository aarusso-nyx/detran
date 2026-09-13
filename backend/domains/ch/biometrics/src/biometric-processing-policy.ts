export const PEC_BIOMETRIC_PROCESSING_POLICY = Object.freeze({
  classifications: Object.freeze(['sensitive-health', 'biometric-sensitive']),
  classification: 'sensitive-biometric',
  legalBasis: 'LGPD_ART_11_II_A_LEGAL_OBLIGATION',
  prohibitedLegalBasis: 'LGPD_ART_11_II_F_HEALTH_PROTECTION',
  processorRole: 'OPERATOR',
  processorContractIdEnvironmentVariable:
    'DETRAN_BIOMETRIC_PROCESSOR_CONTRACT_ID',
  rawBiometricPersistence: 'PROHIBITED',
  purposes: Object.freeze({
    candidatePresence: 'CANDIDATE_PRESENCE_VALIDATION',
    examinerAuthorship: 'EXAMINER_AUTHORSHIP_VALIDATION',
  }),
});

export type PecBiometricProcessingPurpose =
  (typeof PEC_BIOMETRIC_PROCESSING_POLICY.purposes)[keyof typeof PEC_BIOMETRIC_PROCESSING_POLICY.purposes];
