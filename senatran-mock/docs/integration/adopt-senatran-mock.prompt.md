# Prompt — adopt the SENATRAN mock as the integration target

> **Refreshed (W0.3/W0.2, 2026-08-24).** The mock now lives **in-repo** in the
> `detran` monorepo at `senatran-mock/` (ported from the standalone `senatran`
> repo, which is frozen per ADR-0004 — no further fixes land there). Reality is
> **120 endpoints**, not 87 (the count this prompt used to quote before the
> RENAEST/SNE/CDT/DETRAN-bridge national extensions landed — D-0011). Two
> audiences read this file differently:
>
> - **A sibling repo not yet ported into detran** (`pec`, `teat`, before their
>   Phase 3/6 port) still integrates the mock the way this prompt describes:
>   point an HTTP client at a running `senatran-mock` instance, now at
>   `../detran/senatran-mock` instead of `../senatran`.
> - **Any code already inside `detran`** (`backend/domains/**`, `apps/**`) must
>   **not** follow this prompt directly. Per **ADR-0003**, no app or backend
>   domain module may call SENATRAN/senatran-mock directly — the sole sanctioned
>   boundary is **`packages/senatran-adapter`** (typed ports per national system,
>   `SENATRAN_PROVIDER=mock|real`, resilience, idempotency). A CI boundary check
>   fails on direct calls. Consume the adapter's typed ports instead; this prompt
>   only documents what the adapter itself integrates against.

The prompt is deliberately self-contained; the only thing you may need to adjust
is the path/URL to the `senatran-mock` checkout if it is not at `../detran/senatran-mock`.

---

```text
GOAL
Replace this repository's own mock/stub/fake of the SENATRAN/DENATRAN APIs with
the shared `senatran-mock` service, so every sibling integrates against one
deterministic, contract-faithful source of truth instead of divergent local
fakes.

WHAT `senatran-mock` IS (rely on this — do not re-implement it)
- A dev-only mock provider for SENATRAN/DENATRAN. Deterministic seed, stateful
  transactional flows, faithful error envelopes. Never holds real data.
- Source: the `detran` monorepo, `senatran-mock/` — usually checked out next to
  this repo at ../detran, so the mock is at ../detran/senatran-mock. (Its origin,
  the standalone `senatran` repo, is frozen — do not integrate against it.)
- Bring it up (no local Node/Postgres needed):
      cd ../detran/senatran-mock && docker compose up --build
  It serves on http://localhost:3000. Readiness: GET /health -> {"status":"ok","db":"up"}.
- ONE convention across all 120 endpoints:
    * base path /v1
    * auth header `x-cpf-usuario` on every request (and `x-client-cert-cn` when
      cert simulation is on)
    * errors are always { "returnCode": <int>, "message": "<text>" }
    * field names are Portuguese camelCase, exactly as the contract declares
- Three surfaces, same convention:
    * Read (WSDenatran) — 57 GET endpoints: vehicles, drivers, infractions,
      indicators. Contract:
      ../detran/senatran-mock/docs/framework/contracts/openapi.yaml
    * Transactional (RENACH/RENAINF) — 32 endpoints: licensing-exam and
      infraction-lifecycle workflows (stateful, idempotent), ported into
      WSDenatran conventions from the canonical reference (D-0009). Contract:
      ../detran/senatran-mock/docs/framework/contracts/openapi-transactional.yaml
    * National extensions — 31 endpoints, same contract file as Transactional
      (D-0011): RENAEST crash/sinister base (6, `/v1/renaest/*`), SNE electronic
      notifications (7, `/v1/sne/*`), CDT citizen-channel projection (6,
      `/v1/cdt/*`), and the State-DETRAN national-base bridge (6,
      `/v1/detrans/{uf}/*`).
  The contracts are the source of truth. All ship response `example`s.

DETERMINISTIC FIXTURES & MAGIC KEYS (use these; do NOT invent test data)
The authoritative, machine-readable list is
../detran/senatran-mock/database/seed/manifest.json. Read it and drive tests from
it. Essentials:
- Auth (non-secret dev fixtures):
    x-cpf-usuario: 12345678909
    x-client-cert-cn: senatran-dev-client
  Reserved x-cpf-usuario 00000000000 always -> 401.
- Known-good read fixtures:
    placa ABC1D23  -> vehicle, all restriction indicators clear
    placa IND1I01  -> vehicle with alarme + roubo/furto + transferência + penhora
    placa ABC1234  -> legacy plate, PJ (CNPJ) owner
    chassi 9BWZZZ377VT004251, renavam 00123456780 (all -> ABC1D23)
    condutor cpf 52998224725 ; proprietário cnpj 11444777000161
- Transactional fixtures:
    RENACH process RS123456789 (at AGUARDANDO_MEDICO)
    credentialed clinic RS-CLINIC-0001 ; a credentialed CRM examiner (see manifest)
    RENAINF AIT A0001001 ; SNE-non-adherent device DEV-0001
- Magic keys (force a status deterministically, independent of data):
    placa ERR2A02 -> 402 ; placa ERR5A00 -> 500
    chassi ERR00000000000402/…500 ; cpf 00000000402/…500 ;
    cnpj 00000000000402/…500 ; renavam 00000000402/…500
  A well-formed but absent identifier -> 404.

YOUR TASK
1. DISCOVER. Find everywhere this repo mocks, stubs, fakes, records, or
   hard-codes SENATRAN/DENATRAN responses (HTTP mocks, fixture JSON, wiremock/
   nock/msw handlers, in-memory fakes, test doubles, hand-written stub clients).
   List them with file paths.
2. PROPOSE a short migration plan BEFORE editing: the stub sites you found, the
   single HTTP client that will replace them, and the config switch. Wait for my
   go-ahead if anything is ambiguous.
3. POINT THE CLIENT at the mock via configuration, not code — e.g.
   SENATRAN_BASE_URL=http://localhost:3000, defaulting to it in dev/test. Make
   the client attach the auth headers above on every request.
4. SWAP TESTS to exercise the running mock (or assert against the published
   manifest fixtures and magic keys) instead of bespoke stub payloads. Keep them
   deterministic by using the fixtures/magic keys — never freshly invented data.
5. REMOVE the now-dead local mock/stub once the suite is green against the mock.
6. MAKE IT REPRODUCIBLE. Add a dev bring-up step so a clean checkout works:
   either document `cd ../detran/senatran-mock && docker compose up`, or add
   senatran-mock to this repo's own compose (e.g. `docker compose -f
   ../detran/senatran-mock/docker-compose.yml up`), and gate the test suite on
   GET /health.
7. VERIFY by running this repo's tests against the live mock; report pass/fail
   and anything that had to change.

GUARDRAILS
- Dev-only. Never point the mock (or this integration) at real SENATRAN data.
- The contract wins. If this repo expects a field or endpoint the mock does not
  provide, STOP and flag it as a possible contract gap to raise against
  `detran/senatran-mock` — do not fork or patch the mock, and do not silently
  reshape responses.
- Stay thin: one HTTP client to /v1 + auth headers. Do not re-implement business
  rules (state machines, idempotency, error semantics) the mock already owns.
- The dev cpf/cert are non-secret fixtures; do not treat them as credentials, and
  do not commit any real ones.
- If this repo is (or is being ported into) the `detran` monorepo, do not follow
  this prompt at all — consume `packages/senatran-adapter` instead (ADR-0003).

DELIVERABLE
A PR that removes this repo's local SENATRAN stub, routes the client at the
shared mock, passes the test suite against it deterministically, and adds a short
"Running against the SENATRAN mock" note to the README.
```

---

## Notes for maintainers

- Keep the fixture/magic-key summary above in sync with
  [`database/seed/manifest.json`](../../database/seed/manifest.json) — the
  manifest is the source of truth; this prompt only quotes the essentials.
- If a sibling reports a missing field/endpoint (guardrail #2), treat it as a
  contract-conformance signal for this repo, not a reason for the sibling to
  diverge.
- The **canonical** in-monorepo consumer is `packages/senatran-adapter`
  (detran ADR-0003: `[SENATRAN-REAL]|[SENATRAN-MOCK] ⇄ [SENATRAN-ADAPTER] ⇄
backend ⇄ apps`), generated from the two contracts referenced above. This
  prompt exists for repos outside that boundary — pre-port siblings today,
  and any future non-detran consumer.
