# backend/domains/inf — Infrações (RENAINF)

Domain packages for traffic-infraction processing: AIT lifecycle, normative rules,
administrative measures, alcohol procedures, defesas, penalidades, recursos and
julgamento (JARI two-tier boards).

- Populated in Phase 3: W3.1 ports teat's infraction domains (ait-lifecycle, normative,
  measures, alcohol); W3.3 builds the RAIT backend modules (defesas, penalidades,
  recursos, julgamento).
- Each module is a real pnpm workspace package with explicit deps — no deep relative
  imports (ADR-0001, ADR-0002).
