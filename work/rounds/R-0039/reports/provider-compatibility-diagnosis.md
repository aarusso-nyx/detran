# Provider compatibility diagnosis — C3/C4/C5

Role: Architect, read-only diagnosis. No sibling source/configuration, Git state, readings, thresholds or historical proofs were modified. Inspected installed DEVAI 2.6.3 and read-only sibling DEVAI main `4289ff51d1095485a10503cb7502e5b09cd78592` (the sibling root package version is still 2.6.2; this is not evidence that the installed release is 2.6.2). Paths below are relative to their explicitly named repository.

## Decision

The existing sanctioned adopter-policy mechanism is sufficient **as the binding transport**, but its currently closed sensor-input vocabulary and sensor implementations cannot consume the truthful C3/C4 representations. A bounded generic DEVAI repair is required. Do not hand-edit `.devai/config`, inject arbitrary policy keys, rewrite invariant domains, manufacture SQL PII rows, or mark the RBAC surface absent.

Use the current `sensor_inputs` projection through `init bind --adopter-policy`. Add closed path-valued inputs and validated generic observation schemas; keep existing ownership, digest, candidate, path-containment and retirement checks. A new general-purpose adopter-policy extension is unnecessary. Threshold changes and policy exceptions are unnecessary.

## Observed provider boundaries

1. `packages/sensors/src/spec-security-coverage.ts:31` exposes internal function options, but CLI adapter `packages/cli/src/commands/sense/adapters.ts:308` passes only `repoRoot`. `findPiiRegistry` at line 151 accepts SQL INSERT text; `findNoPersonalDataDeclaration` at line 72 accepts only `personal_data.stored: false`. A truthful structured registry containing actual PII and unresolved legal metadata satisfies neither branch. `findRbacInvariant` at line 183 recognizes `domain === 'RBAC'`, while DETRAN's active `INV-AUTH-001` has `domain: 'AUTH'` and **`type: 'rbac'`**. The invariant is already explicit; changing its domain to game the predicate would be inappropriate.
2. `packages/sensors/src/inventory-rbac.ts:75` accepts API/data-model paths but no authorization-model path. Its implementation consumes `auth.guards`, `auth.roles` and an explicit `auth.required === false` marker. Guard-only declarations intentionally remain REVIEW with `RBAC_AUTHORIZATION_UNRESOLVED` (around line 274); a guard name is not a concrete permission. `law/schemas/rbac-inventory.schema.json` currently permits EndpointBinding only as `permissionId` + `endpointId`, which cannot faithfully express Resource/Action plus ordered/contextual conditions. The CLI adapter at `adapters.ts:236` also forwards no new authorization input.
3. `packages/sensors/src/inventory-data-handling.ts:153` has no JSON PII-registry input. It records missing legal-basis/retention metrics but currently does not downgrade PASS solely for that missing metadata (lines 215–247). A registry addition must not copy “pending” into the string `legal_basis` and thereby appear complete. Detection, inventory completeness, legal sufficiency and executable retention are distinct signals.
4. `law/schemas/sensor-inputs.schema.json` closes `inputs` and each kind. `packages/cli/src/commands/sense/shared.ts:190–315` derives allowed keys from that schema; unknown inputs are refused. Its path-key set around line 193 must also cover new keys so symlink/realpath containment remains enforced. An unrecognized object inside `sensor_inputs` is not an extension point.
5. `law/schemas/adopter-policy.schema.json` already delegates `sensor_inputs` to that closed schema. `packages/cli/src/services/adopter-policy.ts:254–265` validates and projects the complete object to `.devai/config/sensor-inputs.json`; binding, ownership receipts and removal semantics already exist. This transport should be reused without adding a separate arbitrary `security` configuration domain.
6. `packages/sensors/src/harness-security.ts:104` inspects workflow action refs, top-level permissions and pull_request_target/checkout combinations. It has no dependency on application authorization or personal-data classification. Existing DETRAN workflow actions are SHA-pinned and top-level permissions exist. No concrete C3/C4 compatibility defect in this sensor was demonstrated. Do not add an allowlist or suppressions to get a desired verdict. Its line scanner has known expressiveness limits, so a YAML-parser repair would be a distinct small change with a real red counterexample, if required.

The corresponding installed bundled implementation is `node_modules/@aarusso-nyx/devai/dist/runtime/index/release-host.js`: RBAC guard-unresolved finding around 187748; harness scanner around 197189; no-personal-data detector around 198163; RBAC invariant detector around 198248. These corroborate the boundary rather than relying on the sibling package version label.

## Minimal generic provider contract

Proposed input additions (names are a proposed API, not currently accepted):

| Sensor | Added input | Purpose |
| --- | --- | --- |
| `inventory_rbac` | `authorizationModelPath` | Read a validated explicit authorization observation model beside the existing native API map |
| `inventory_data_handling` | `piiRegistryPath` | Read the union of source-declared PII and heuristic candidates, retaining unresolved metadata |
| `spec_security_coverage` | `piiRegistryPath`, `invariantsDir` | Recognize structured PII-spec presence and the actual invariant corpus |
| `inventory_api` | `publicMarkerDecorators` if needed | Expose its existing internal public-marker option through the sanctioned closed input declaration; only explicit recognized source decorators can declare public |

Threat-model/data-handling option forwarding can be exposed at the same time if a demonstrated nondefault path requires it, but is not necessary for the current conventional `law/security/threat-model.json` path. No arbitrary command execution, custom verdict override or input-driven thresholds should be introduced.

Add provider-owned `law/schemas/authorization-model.schema.json` and `law/schemas/pii-registry.schema.json` (or equivalent explicitly named generic schemas) and register/export validators using the existing schema package conventions. Do not hardcode `detran-*` kind names or DETRAN policy function names in DEVAI. The adopter's normalization can emit the generic contract deterministically from its existing source-backed snapshots; direct consumption requires the same closed validation contract, not an unchecked JSON blob.

### Authorization observation model

Required semantics:

- Every native API observation ID appears exactly once. IDs use the existing qualified endpoint identity; preserve fixtures, mock and distinct source variants. Population labels annotate, never shrink the denominator.
- A discriminated binding records `public`, `static-role`, `static-permission`, `conditional-policy` or `unresolved`. Public requires explicit recognized source evidence; static-role/permission requires actual concrete source metadata. Resource/Action, guard identity and function names alone cannot populate static-role/permission.
- Conditional records retain resource, action, source function/decorator locations, contextual predicate references and an explicit verification state. They never imply conjunction/disjunction or an unconditional grant inferred from English prose. Ordered policy shortcuts and earlier denials remain opaque source-backed conditions unless actually resolved by a supported parser.
- Validate source path/hash/coordinates and identity correspondence against the current native API body and reading candidate. Missing IDs, duplicate IDs, unknown IDs, incompatible schema, source drift or stale population cause an error/unknown observation, never an empty “clean” inventory.
- Extend RBAC body with a separate conditional/unresolved observation collection and metrics instead of encoding conditional policies as invented `permissionId` grants. Keep legacy endpointBindings and unresolved facts interpretable. If the closed body schema needs a versioned extension, provide explicit backward compatibility and tests rather than silently changing meaning.

DETRAN's actual 1,139 entries are 1,004 conditional policy references, six individually reviewed public routes, 121 mock and eight fixtures. `runtime_authorization_proven` is false throughout. Representing the 1,004 references is progress in observation, not proof that 1,004 endpoints have unconditional roles. At least 129 mock/fixture entries remain unresolved by this application-specific model; conditional completeness/runtime verification remains an explicit concern for the other 1,004.

### Personal-data registry

Required semantics:

- Union native heuristic candidates with source-declared fields keyed by schema/table/column. Keep blueprint-only fields and missing SQL mappings; do not restrict the registry to the old 70-name heuristic.
- Each declaration retains field and DDL/source references, source hashes/pointers, classification state, purpose, legal-basis and retention claims, and explicit pending/conflict state. Empty, pending, proposal-only or conflicting values cannot count as approved facts.
- Separate observed source claims from legal validation and operational enforcement. A string such as `forever`, `case+5y` or a parameter reference is a source claim, not a proof of legal sufficiency or implemented deletion. No registry may assert “no personal data” while it contains candidate or classified fields.
- Preserve unknowns in the output and completeness metrics. No “default legal basis”, automatic statutory citation or blanket retention is permitted. If an authority decision is accepted as validation, its authentic source and approval must be verified; a user-controlled `approved: true` is insufficient.
- Validate against all source SQL fields and retain unknown/missing/conflicting mappings as observations; reject malformed or stale provenance. Candidate binding remains in the official observation/evidence flow rather than embedding a self-referential Git tree in a tracked file.

DETRAN's union has 211 entries: 70 native candidates, 158 blueprint declarations, 17 overlap, 141 additional fields. All 211 have field-level purpose and legal-basis gaps in the examined mapping, 73 lack retention, 53 lack a canonical classification, 21 `state` and eight `cnpj` require semantic review, and four declared `forever` values require review. Keep those exact gaps visible. The RAIT legal-basis and five-year proposals are explicitly unvalidated in the existing source and cannot be promoted by Owner delegation.

## Signal and verdict semantics

| Sensor/signal | Truthful current disposition after proposed compatibility repair |
| --- | --- |
| `spec_security_coverage` PII-presence | `pii_registry_present=1` when the complete generic registry is schema-valid, source-backed and populated, **even if entries explicitly remain pending**. This is document presence, not legal compliance. Add completeness metrics/findings rather than pretending unknown legal values are present. |
| RBAC invariant presence | Accept schema-valid active invariants whose canonical `type` is `rbac`, retaining legacy `domain=RBAC` compatibility where appropriate. Do not accept arbitrary substring matches or rename DETRAN's domain. `INV-AUTH-001` supplies this presence signal. |
| F1 security presence result | With C5's valid structured threat model, the registry and the RBAC invariant recognized, the existing three-presence rule may produce PASS. It must be explicitly described as specification presence and cannot close BL-0020/legal gaps or assert readiness. Without the threat model, existing partial-presence behavior remains REVIEW. |
| `inventory_rbac` | REVIEW for the current conditional model and unresolved mock/fixture populations. Report observed conditional/public counts separately from static-role/permission resolution. Never convert 1,004 conditional references into resolved roles or claim all authorization is proven. |
| `inventory_data_handling` | REVIEW for explicit unresolved curation in the new registry-aware path, with the above missing/pending/conflict counts. An applicable hard-fail invariant requiring complete legal basis/retention still yields FAIL through its normal evaluator; do not bypass it or claim REVIEW supersedes it. Existing name-only PASS is detection output, not a declaration of compliance. |
| `harness_security` | Keep its own observed findings and current rule. Pinned refs + explicit permissions + no dangerous trigger combination may PASS that narrow scanner. Application registry gaps neither make it fail nor justify suppressing real workflow findings. |

These are proposed semantics to validate in a separate provider repair, not readings issued in this diagnosis. No thresholds, denominator exclusions, N/A declarations or old evidence should change. Stronger handling of newly explicit pending registry data is an additive fail-closed path; document and test the semantic boundary in the provider ADR/design note.

## Bounded DEVAI repair files and validation

Expected implementation owners/files in the sibling DEVAI PR:

- Architect: the two new generic schemas and registration; `law/schemas/sensor-inputs.schema.json`; backward-compatible RBAC body schema extension; sensor design notes/ADR explaining presence versus completeness. Reuse `law/schemas/adopter-policy.schema.json`'s existing sensor_inputs reference; no new blanket extension is needed.
- Engineer: `packages/sensors/src/spec-security-coverage.ts`, `inventory-rbac.ts`, `inventory-data-handling.ts`, a shared schema/provenance reader; `packages/cli/src/commands/sense/adapters.ts`, `shared.ts`, inventory-regeneration input forwarding as required; schema validator exports/packaging. Do not modify unrelated harness workflows, domain policies, tests' expected security thresholds or application permissions.
- Inspector: extend `packages/sensors/tests/spec-substrate.test.ts`, `packages/sensors/tests/unit/coverage-rbac-runtime-coverage.test.ts`, data-handling unit coverage; add generic registry boundary fixtures; extend `tests/contract/sensor-inputs.contract.test.ts`, `packages/schemas/tests/contract/adopter-policy-schema.test.ts`, `packages/cli/tests/unit/adopter-policy-binding.test.ts`, binding atomicity/retirement and authority tests. If a harness parser bug is actually repaired, extend `harness-security-scalar-boundaries.test.ts` and `coherence-security-runtime-coverage.test.ts` independently.

Required negative cases: conditional guard cannot become static permission; role/permission shortcuts cannot erase earlier denials; public marker without proof remains unknown; missing/duplicate/extra endpoint IDs cannot shrink the population; fixture and mock entries persist; dynamic routes stay unresolved; wrong SQL namespace/column/coordinates fail; blueprint-only PII is retained; missing/blank/proposal/conflicting legal metadata remains pending; `forever` is not approved automatically; stale input hashes/candidate/source mismatch is refused; path traversal and symlink escape are refused; malformed explicitly configured registry cannot fall back silently; unknown input keys remain refused; read-only runs do not persist; init-bind dry-run has no writes and failed bindings remain atomic; retirement restores the installed default without altering thresholds; old no-personal-data and SQL registry inputs retain documented backward compatibility without overriding contradictory evidence.

After generic provider validation and release through its own authorized PR/release flow, adopt the release in a separate DETRAN change, bind the schema-valid inputs officially, freeze a clean candidate, regenerate native prerequisites and issue fresh readings. Keep this diagnosis and all R-0036/R-0037 historical output unchanged. Integration is incomplete until the native reader actually demonstrates the described observations and tests; a JSON registry alone is not that integration.

Graft read-only discovery: approximately 21,596 tokens saved in this diagnosis call.
