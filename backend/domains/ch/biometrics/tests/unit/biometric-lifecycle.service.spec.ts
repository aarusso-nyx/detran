import { describe, expect, it, vi } from 'vitest';

import { BiometricLifecycleService } from '../../src/biometric-lifecycle.service.js';
import { BiometricVerificationHttpAdapter } from '../../src/biometric-verification.http-adapter.js';

const gate = {
  clinic_id: 'clinic-1',
  patient_id: 'patient-1',
  status: 'SCHEDULED',
  provider_code: 'provider-1',
  device_certificate_fingerprint: 'device-sha256',
  lfd_capable: true,
};

const receipt = {
  passed: true,
  score: 98,
  lfdScore: 97,
  evidenceDocumentId: 'document-1',
  evidenceSha256: 'a'.repeat(64),
  reason: null,
};

function subject(
  query: ReturnType<typeof vi.fn>,
  provider = { verify: vi.fn(async () => receipt) },
  actorId = 'actor-1',
) {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return {
    service: new BiometricLifecycleService(
      repository as never,
      context as never,
      provider as never,
    ),
    provider,
  };
}

describe('BiometricLifecycleService', () => {
  it('AC-PEC-003-3 treats facial fallback as a normal per-finger path', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [gate] })
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'check-1', passed: true }] })
      .mockResolvedValueOnce({ rows: [] });
    const { service, provider } = subject(query);

    await expect(
      service.recordCheck({
        appointmentId: 'appointment-1',
        stationId: 'station-1',
        subjectPatientId: 'patient-1',
        kind: 'CHECKIN',
        modality: 'FACE',
        fallbackFromFingerprint: true,
        captureReference: 'opaque-capture-reference',
      }),
    ).resolves.toMatchObject({ id: 'check-1', passed: true });

    expect(query.mock.calls[1]?.[0]).toContain('ch.biometric_finger_condition');
    expect(provider.verify).toHaveBeenCalledWith(
      expect.objectContaining({ modality: 'FACE' }),
    );
    expect(query.mock.calls[3]?.[0]).toContain("status = 'CHECKED_IN'");
  });

  it('AC-PEC-003-3 rejects facial fallback without a structured finger condition', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [gate] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });
    const { service, provider } = subject(query);

    await expect(
      service.recordCheck({
        appointmentId: 'appointment-1',
        stationId: 'station-1',
        subjectPatientId: 'patient-1',
        kind: 'CHECKIN',
        modality: 'FACE',
        fallbackFromFingerprint: true,
        captureReference: 'opaque-capture-reference',
      }),
    ).rejects.toThrow(
      'Facial fallback requires a structured unavailable-finger record',
    );
    expect(provider.verify).not.toHaveBeenCalled();
  });

  it('RN-PEC-131 requires LFD-capable hardware for fingerprint checks', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ ...gate, lfd_capable: false }],
    });
    const { service, provider } = subject(query);

    await expect(
      service.recordCheck({
        appointmentId: 'appointment-1',
        stationId: 'station-1',
        subjectPatientId: 'patient-1',
        kind: 'CHECKIN',
        modality: 'FINGERPRINT',
        captureReference: 'opaque-capture-reference',
      }),
    ).rejects.toThrow('Fingerprint station must support LFD');
    expect(provider.verify).not.toHaveBeenCalled();
  });

  it('AC-PEC-003-1 requires a distinct supervisor for exception approval', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });
    const { service } = subject(query);

    await expect(service.decideException('exception-1', true)).rejects.toThrow(
      'Exception decision requires a distinct supervisor before expiry',
    );
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toContain('requested_by <> $3');
    expect(sql).toContain('expires_at > now()');
  });

  it('AC-PEC-003-4 binds an exception to the failed biometric evidence', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });
    const { service } = subject(query);

    await expect(
      service.requestException({
        appointmentId: 'appointment-1',
        clinicId: 'clinic-1',
        stationId: 'station-1',
        biometricCheckId: 'check-1',
        scope: 'CHECKIN',
        reason: 'Provider rejected capture',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    ).rejects.toThrow('requires a matching failed check');
    expect(query.mock.calls[0]?.[0]).toContain('not passed');
  });

  it('fails closed when the biometric provider is not configured', async () => {
    const previousUrl = process.env.DETRAN_BIOMETRIC_VERIFICATION_URL;
    const previousToken = process.env.DETRAN_BIOMETRIC_VERIFICATION_TOKEN;
    delete process.env.DETRAN_BIOMETRIC_VERIFICATION_URL;
    delete process.env.DETRAN_BIOMETRIC_VERIFICATION_TOKEN;
    try {
      await expect(
        new BiometricVerificationHttpAdapter().verify({
          providerCode: 'provider-1',
          stationId: 'station-1',
          deviceCertificateFingerprint: 'device-sha256',
          captureReference: 'opaque',
          modality: 'FINGERPRINT',
          kind: 'CHECKIN',
          subjectReference: { patientId: 'patient-1' },
        }),
      ).rejects.toThrow('Biometric verification provider is not configured');
    } finally {
      if (previousUrl)
        process.env.DETRAN_BIOMETRIC_VERIFICATION_URL = previousUrl;
      if (previousToken)
        process.env.DETRAN_BIOMETRIC_VERIFICATION_TOKEN = previousToken;
    }
  });
});
