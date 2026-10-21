# Proposed S2 CI amendment — isolated scope suite capacity

Architect recommendation; NOT AUTHORIZED. Original R4 explicitly allows capacity
10000 only for the new claim suite and excludes existing suites. Its temporary
Owner delegation expired. This amendment needs Owner approval before application.

Exactly one Inspector-owned path: backend/app/tests/e2e/rait-p402-scope.e2e.spec.ts.
In its existing beforeAll, before dynamic AppModule import, call existing
env('STYNX_RATE_LIMIT_DEFAULT', '10000'). The existing env helper captures the
original value once. Wrap afterAll closure in try/finally so that restoration of
all captured environment values happens even on initialization/closure failure.
No production configuration/default120, decorator, guard, limiter implementation,
rate-window SQL, other suite, CI setting, timeout/population/assertion/threshold
changes. Real PostgreSQL limiter stays enabled. Preserve all scope controls and
prove its own tenant window was exercised; run unchanged PEC limiter controls
under their original capacity. Setup/behavior failures stay fatal.

Evidence: PR211 run39354880732 kernel26 failures includes repeated429 masking
roughly15 real scope/claim controls. The suite performs hundreds of real HTTP
requests with canonical fixed actors against a120/minute guard, so speed/correct
implementation can hit the limit. Existing R4 handles the same interference for
the new complete51 claim fixture; this extends isolation only to this one suite.
Rejecting this extension leaves these validations blocked until an independently
approved isolation arrangement is supplied. No increase in production capacity.

## Owner decision

On2026-10-21 Owner explicitly answered: “Aprovar a extensão limitada
(recomendado)” to the exact scope/capacity/restore question. AUTHORIZED as written,
only the one scope test file; no renewed blanket Owner delegation. Inspector may
apply and validate this bounded correction. Preserve original RED/429 results.
