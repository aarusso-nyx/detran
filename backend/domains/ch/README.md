# backend/domains/ch — Condutor/Habilitação (RENACH)

Domain packages for driver/licensing processes, including the PEC clinical
runtime. The SENATRAN adapter remains the sole national-system boundary.

- Each module is a pnpm workspace package with explicit dependencies (ADR-0001,
  ADR-0002).
- All appointment, encounter, examination, report, and biometric records are
  sensitive data. Their blueprint fields carry `x-pii` and retention metadata.
- PEC processing uses the LGPD Article 11 II(a) legal-obligation basis. Article
  11 II(f), health protection, is explicitly not the processing basis for this
  administrative expert-assessment purpose.

The external biometric verifier fails closed unless all three settings are
present: `DETRAN_BIOMETRIC_VERIFICATION_URL`,
`DETRAN_BIOMETRIC_VERIFICATION_TOKEN`, and
`DETRAN_BIOMETRIC_PROCESSOR_CONTRACT_ID`. Each request declares the fixed legal
basis, the bound operator contract, and one of the separate candidate-presence
or examiner-authorship purposes. Only an opaque capture reference is sent; the
adapter does not accept a raw biometric payload.
