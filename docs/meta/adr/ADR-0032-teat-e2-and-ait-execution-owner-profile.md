# ADR-0032: TEAT E2 and AIT execution profile selected by the Owner

## Status

Owner decision for R-0013 on 2026-09-23. The Owner adopted every alternative marked
recommended in the R-0013 closure questionnaire: 1A–5A and 7A–16A. In a separate explicit
reply, the Owner chose **6A**: revocation-status and shift-status assertions have a maximum
age of **15 minutes** each, and the grant's offline window is capped at **1 hour**. These are
operational policy ceilings, not asserted legal deadlines and not defaults inferred from test
fixtures or the 300-second online snapshot parameter.

This decision authorizes contracts and implementation within the selected profile. It is not
evidence that production signing keys, normative catalogue rows, executable validators,
Android runtime adapters, or full-round gates already exist. The Gertec GMS820 remains
unconditionally homologated as equipment by the separate Owner decision in ADR-0029; E2
acceptance tests do not reopen that homologation.

## Decision — E2

1. Use the JSON/JOSE profile: I-JSON and RFC 8785 canonical bytes, JWS Compact ES256 for
   signed artifacts and JWE Compact ECDH-ES with A256GCM for the device envelope. Reject
   `alg=none`, unknown critical headers, noncanonical payloads and silent COSE fallback.
2. Distribute approved public trust roots independently of the envelope, with purpose-bound
   `kid`, versioned overlap during rotation and explicit withdrawal. The actual institutional
   key identities and protected signing service must be supplied by the responsible custodian;
   private key material never belongs in the repository or this decision record.
3. Enroll distinct Android Keystore keys by purpose, including a non-exportable agreement key
   bound to the grant. Verify possession, attestation and the intended key use in the enrollment
   contract. A model's homologation is not a substitute for a particular grant's cryptographic
   proof.
4. Use separate signed grant, post-opening shift assertion, revocation-status assertion and
   authenticated reservation facts, all bound to the exact normative manifest digest and
   tenant/agency/agent/device/shift scope. An identifier or `offlineReady` boolean alone is
   never authority.
5. Start `maximumOfflineSeconds` at the last successful authenticated online refresh of
   grant, revocation and shift, with a server-signed `offlineWindowStartedAt` bound to those
   proofs. App launch, navigation and restart do not reset it. The numerical maximum and the
   status assertion lifetimes are capped by 6A: 3600 seconds for the offline window and 900
   seconds for each revocation and shift assertion. An earlier signed `validUntil`, grant,
   reservation or policy boundary still wins; expiry of any applicable proof blocks.
6. Use a signed server time anchor and monotonic elapsed time during a session. After restart
   or anchor loss, block offline operation until a new authenticated refresh; ordinary wall
   time alone is not an authority source.
7. Replace `local-unsigned` normative packages with an exact version/hash manifest signed by
   a purpose-bound institutional key compatible with the selected profile. Expiration alone
   remains a visible, recorded warning after signature and identity verification (ADR-0031).

## Decision — AIT V01–V11 and lifecycle

1. Define a closed, versioned JSON rule language for `expression_json`, `required_fields` and
   modality rules, including operators, canonical paths, types, null/absence, conditions,
   severity, stable blocker codes, evaluation order and unknown-rule failure. Bind each rule
   to the exact catalogue ID, version and manifest hash. No open-ended expression is executable.
2. The Architect may map approved V01–V11 predicates to existing typed data under Inspector
   RED tests and independent review. Missing authoritative facts or a new normative choice
   remain blocked; this does not delegate new legal policy to the Architect.
3. Represent the fact's place with an identifiable description and UF, the fact's date/time,
   and a measured GPS/network sample with provenance; municipality is included when known or
   required by an applicable ficha. Coordinates alone do not replace the place description.
4. Represent no-approach reason with a versioned structured value, narrative when required,
   and an explicit fact for absence of flagrante. Evaluate `caso_1/2/3` independently; never
   infer lack of flagrante from `had_approach=false`.
5. When a person is present **and there was an approach**, record that presence and exactly
   one science result — signed, refused or unable — with a reason for refusal or impossibility.
   Neither result by itself invalidates the AIT; absence of a required result/reason blocks
   completion of that branch. Without approach, omit the branch rather than invent a refusal.
6. Record source and agent confirmation per vehicle field required by V05, at least plate,
   brand and species when imported from OCR/base. For every linked evidence item verify SHA-256,
   AIT link and initial custody event. Quantity/type/role minima come from the exact ficha;
   no universal photo requirement is created. Apply the proposed alcohol rule to art. 165
   only; art. 165-A needs its own approved rule, not extrapolation.
7. Provide signed, time-scoped offline proof of the agent's category, assignment, applicable
   agreement and territorial competence. For V10 use an explicit encounter/fact identity,
   framing root and reviewable factual comparison across the agent's acts. Do not infer same
   fact from proximity alone or permit a client-chosen encounter ID to bypass duplicate checks;
   backend reconciliation must verify the same relation.
8. Obtain the GPS/network sample during the current AIT, with finite measured coordinates,
   accuracy, capture time and origin. No unapproved numeric accuracy ceiling is introduced.
   Missing permission, sample or provenance blocks before consuming a number.
9. Represent abandonment and cancellation requests as durable sidecar events. A number pinned
   to a draft remains consumed and is never automatically reused. A request retains the draft
   lock; only an authenticated authority decision, applied atomically with the outcome, may
   release it. Reconciliation preserves the consumed number and audited disposition.

## Remaining inputs and acceptance boundary

The questionnaire's Owner choices are complete. The responsible institutional and engineering
sources must still provide
public trust identities, production signing and envelope ports, exact signed normative
catalogue/ficha rows, typed aggregate and competence projections, and canonical test vectors.
Inspector must exercise positive and negative branches, Android GMS820 interoperability,
restart/crash boundaries, backend reconciliation and the complete gate. A previous narrow
review or this decision is not a Round PASS, push, or final PR authorization by itself.
