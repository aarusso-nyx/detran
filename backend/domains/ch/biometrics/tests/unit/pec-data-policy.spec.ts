import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { PEC_BIOMETRIC_PROCESSING_POLICY } from '../../src/biometric-processing-policy.js';

interface BlueprintField {
  name: string;
  pii?: string;
  retention?: string;
}

interface BlueprintEntity {
  name: string;
  fields: BlueprintField[];
}

interface Blueprint {
  database: { entities: BlueprintEntity[] };
}

function blueprint(name: string): Blueprint {
  const url = new URL(
    `../../../../../../docs/framework/blueprints/${name}`,
    import.meta.url,
  );
  return JSON.parse(readFileSync(url, 'utf8')) as Blueprint;
}

function entity(model: Blueprint, name: string): BlueprintEntity {
  const value = model.database.entities.find((item) => item.name === name);
  if (!value) throw new Error(`Missing blueprint entity ${name}`);
  return value;
}

describe('PEC sensitive-data policy', () => {
  it('AC-PEC-002-2 classifies the whole encounter and exam core as sensitive health data', () => {
    const encounters = blueprint('BP-CH-ENCOUNTERS-001.json');
    const exams = blueprint('BP-CH-EXAMS-001.json');
    for (const item of [
      entity(encounters, 'Appointment'),
      entity(encounters, 'Encounter'),
      entity(exams, 'MedicalExam'),
      entity(exams, 'PsychologicalExam'),
    ]) {
      const clinicalFields = item.fields.filter(
        (field) => !['id', 'tenant_id'].includes(field.name),
      );
      expect(clinicalFields).not.toHaveLength(0);
      expect(
        clinicalFields.every((field) => field.pii === 'sensitive-health'),
      ).toBe(true);
      expect(clinicalFields.every((field) => Boolean(field.retention))).toBe(
        true,
      );
    }
  });

  it('AC-PEC-002-3 fixes legal obligation as the basis and excludes health protection', () => {
    expect(PEC_BIOMETRIC_PROCESSING_POLICY.classifications).toEqual([
      'sensitive-health',
      'biometric-sensitive',
    ]);
    expect(PEC_BIOMETRIC_PROCESSING_POLICY.legalBasis).toBe(
      'LGPD_ART_11_II_A_LEGAL_OBLIGATION',
    );
    expect(PEC_BIOMETRIC_PROCESSING_POLICY.prohibitedLegalBasis).toBe(
      'LGPD_ART_11_II_F_HEALTH_PROTECTION',
    );
  });

  it('AC-PEC-002-4 classifies biometric records and binds an external operator contract', () => {
    const biometrics = blueprint('BP-CH-BIOMETRICS-001.json');
    for (const item of biometrics.database.entities) {
      const biometricFields = item.fields.filter(
        (field) => !['id', 'tenant_id'].includes(field.name),
      );
      expect(biometricFields).not.toHaveLength(0);
      expect(biometricFields.every((field) => Boolean(field.pii))).toBe(true);
      expect(biometricFields.every((field) => Boolean(field.retention))).toBe(
        true,
      );
    }
    expect(PEC_BIOMETRIC_PROCESSING_POLICY.processorRole).toBe('OPERATOR');
    expect(
      PEC_BIOMETRIC_PROCESSING_POLICY.processorContractIdEnvironmentVariable,
    ).toBe('DETRAN_BIOMETRIC_PROCESSOR_CONTRACT_ID');
    expect(PEC_BIOMETRIC_PROCESSING_POLICY.rawBiometricPersistence).toBe(
      'PROHIBITED',
    );
    expect(PEC_BIOMETRIC_PROCESSING_POLICY.purposes.candidatePresence).not.toBe(
      PEC_BIOMETRIC_PROCESSING_POLICY.purposes.examinerAuthorship,
    );
  });
});
