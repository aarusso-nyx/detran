# C7 fixture-owned Portal HTTP listener

Architect reference under the Owner-authorized C2-C8 campaign, active R-0041.
Successful `createPortalApp` fixtures own one HTTP listener on `127.0.0.1`,
using an OS-assigned positive port. It remains stable across requests and the
existing `app.close()` teardown owns shutdown. Setup failure remains failure;
cleanup failure is preserved with the original error.

Inspector scope is exactly four files: the fixture helper, portal-routes,
portal-payload-lint and portal-stream. Retain every original business assertion,
timeout, test population, request guard and tenant/RLS path. Add listener identity
assertions to C-0002-76. Retire only the two consumers' duplicate listen calls.
No product code, dependency, descriptor, workflow, threshold or C6 activation changes.

The first two-file task review returned FAIL because two consumers already listened.
The revised four-file task returned PASS. Both reviews remain authentic. The fix
eliminates implicit per-request Supertest listen/close ownership, without asserting
that the precise cause of every observed socket error or timeout was established.

All nine callers require the complete original RC and CI. The listen-failure cleanup
branch has no direct test in this bounded packet; independent code review must
inspect it. No unit coverage is claimed for that branch. The first main RC failures,
the initial mixed RED and any partial GREEN remain explicitly preserved. C6 stays
blocked; all nine additional native bindings remain deferred together.
