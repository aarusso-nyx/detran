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

## Modules

| Module                  | Package                           | Blueprint                        |
| ----------------------- | --------------------------------- | -------------------------------- |
| `billing/`              | `@detran/ch-billing`              | `BP-CH-BILLING-001`              |
| `biometrics/`           | `@detran/ch-biometrics`           | `BP-CH-BIOMETRICS-001`           |
| `clinical-controls/`    | `@detran/ch-clinical-controls`    | `BP-CH-CLINICAL-CONTROLS-001`    |
| `clinical-network/`     | `@detran/ch-clinical-network`     | `BP-CH-CLINICAL-NETWORK-001`     |
| `clinical-reports/`     | `@detran/ch-clinical-reports`     | `BP-CH-REPORTS-001`              |
| `encounters/`           | `@detran/ch-encounters`           | `BP-CH-ENCOUNTERS-001`           |
| `exams/`                | `@detran/ch-exams`                | `BP-CH-EXAMS-001`                |
| `inconsistencies/`      | `@detran/ch-inconsistencies`      | `BP-CH-INCONSISTENCIES-001`      |
| `juntas/`               | `@detran/ch-juntas`               | `BP-CH-JUNTAS-001`               |
| `operational-controls/` | `@detran/ch-operational-controls` | `BP-CH-OPERATIONAL-CONTROLS-001` |
| `patients/`             | `@detran/ch-patients`             | `BP-CH-PATIENTS-001`             |
| `process-blocks/`       | `@detran/ch-process-blocks`       | `BP-CH-PROCESS-BLOCKS-001`       |
| `restrictions/`         | `@detran/ch-restrictions`         | `BP-CH-RESTRICTIONS-001`         |
| `retention/`            | `@detran/ch-retention`            | `BP-CH-RETENTION-001`            |
| `scheduling/`           | `@detran/ch-scheduling`           | `BP-CH-SCHEDULING-001`           |
| `telehealth/`           | `@detran/ch-telehealth`           | `BP-CH-TELEHEALTH-001`           |
| `toxicology/`           | `@detran/ch-toxicology`           | `BP-CH-TOXICOLOGY-001`           |
