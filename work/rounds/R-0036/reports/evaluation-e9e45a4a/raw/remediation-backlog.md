# Separate product and governance remediation

Frozen assessment: `e9e45a4a6cbed5cfd394c716c79a55b1aca386b8`, DEVAI 2.6.3. All 43 applicable scorecard cells have current machine verdicts and complete declared measurement populations. Measurement findings BL-0002 through BL-0012 are resolved with explicit references; product changes have not been implemented. The independent RAIT P4 planning boundary remains in force.

| Task | Priority | Owner | Cells | Work |
| --- | --- | --- | --- | --- |
| BL-0013 | P1 | Engineer | F2:T6 | Pre-existing dependency vulnerabilities |
| BL-0019 | P1 | Architect | F1:T6, F1:T8 | P1 Architect: normalize and complete security and robustness specification signals |
| BL-0020 | P1 | Architect | F4:T6 | P1 Architect: resolve static RBAC inventory mappings and PII classifications |
| BL-0014 | P2 | Engineer | F2:T5 | Product lint findings |
| BL-0015 | P2 | Engineer | F5:T7 | Slow historical main-branch CI |
| BL-0016 | P2 | Inspector | F3:T1 | Two pre-existing SENATRAN mock HTTP 402 E2E mismatches |
| BL-0017 | P2 | Inspector | F3:T2, F3:T3 | P2 Inspector: improve product unit coverage and sparse package tests |
| BL-0018 | P2 | Architect | F1:T4, F4:T1, F4:T2, F4:T4, F4:T9 | P2 Architect: complete canonical source and use-case inventory traces |
| BL-0021 | P2 | Inspector | F3:T5 | P2 Inspector: resolve integration and E2E mock ownership findings |
| BL-0022 | P2 | Architect | F5:T3, F5:T4, F5:T5 | P2 Architect: remediate classified harness and historical governance findings |
| BL-0023 | P3 | Engineer | F4:T7 | P3 Engineer: investigate canonical inventory generation duration |

Prioritize critical/high dependency advisories and security/specification mapping investigations, then the reproducible E2E mismatches, coverage, traceability, lint and harness findings. Inventory duration is lower priority. Static authorization gaps are not proof that endpoints are unprotected; name-based PII candidates are not legal determinations. The native data-handling PASS is retained with this limitation.

The JSON register contains the exact metrics and task references per cell. Each new task has a captured native backlog receipt; the final native backlog snapshot is remediation-backlog-final.json. Existing BL-0013 through BL-0016 remain open. The two supplemental UNKNOWN diagnostics (site provenance and action-effect inference) are outside the 43-cell mapping and remain explicitly uncertain in diagnostic-dispositions.json.
