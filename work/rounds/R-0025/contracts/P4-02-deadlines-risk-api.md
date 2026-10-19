# Additive CTG-0001 §5 supplement — current RAIT risk API

Architect, Article7. ADR0049 / Owner-approved D11; documentation only. This
supplements the exact public surface of work/rounds/R-0006/contracts/CTG-0001.md §5
and its §5.2 amendment without rewriting that historical contract. Existing API
names and semantics remain. No database, scheduler, publishing or second deadline
engine is introduced into @detran/inf-deadlines.

Future public exports from src/rait-risk.ts via handwritten src/index.ts are:

```ts
export type RaitRiskFlag =
  | 'SEM_RISCO'
  | 'ALERTA_N1'
  | 'ALERTA_N2'
  | 'ALERTA_N3'
  | 'CRITICO'
  | 'PRESCRITO_OPERACIONAL';
export type RaitRiskClockCode = 'A' | 'B' | 'C' | 'D';
export interface RaitRiskStep {
  flag: Exclude<RaitRiskFlag, 'SEM_RISCO'>;
  reachedOn: LocalDate;
  parameterRef: string;
  sourceRef: string;
}
export type RaitRiskClockInput =
  | {
      clockCode: RaitRiskClockCode;
      applicability: 'not_applicable';
      sourceRef: string;
      sourceVersions: readonly string[];
    }
  | {
      clockCode: RaitRiskClockCode;
      applicability: 'applicable';
      timerRef: string;
      startedOn: LocalDate;
      ceilingOn: LocalDate;
      steps: readonly RaitRiskStep[];
      sourceVersions: readonly string[];
    };
export interface RaitRiskInput {
  asOf: string;
  today: LocalDate;
  tenantTimezone: string;
  clocks: readonly RaitRiskClockInput[];
}
export interface RaitRiskSnapshot {
  asOf: string;
  today: LocalDate;
  clocks: readonly (
    | {
        clockCode: RaitRiskClockCode;
        applicability: 'applicable';
        flag: RaitRiskFlag;
        ceilingOn: LocalDate;
      }
    | { clockCode: RaitRiskClockCode; applicability: 'not_applicable' }
  )[];
  worstFlag: RaitRiskFlag | null;
  sourceVersions: readonly string[];
}
export class RaitRiskSourceError extends Error {
  readonly code: 'RAIT_RISK_SOURCE_INVALID';
}
export function evaluateRaitRisk(input: RaitRiskInput): RaitRiskSnapshot;
```

LocalDate is the existing public type. asOf/today/timezone come from one validated
ADR0025 operation snapshot, not wall-clock reads in this pure function or browser
input. The CASE adapter validates current source records and asks the existing
deadline/calendar/date owners to resolve the approved ladder's threshold dates;
reachedOn is not caller-supplied authority. No arbitrary hardcoded elapsed-age rule.

Require exactly one applicability record for each A/B/C/D; no duplicate/missing
clock, empty provenance, invalid dates/instant/timezone or unqualified parameter
snapshot. Applicable clocks carry the complete typed source-backed steps for that
clock and its true ceiling, not a seeded flag. No invented intermediate D stage.
Malformed/inconsistent inputs throw RaitRiskSourceError, mapped by HTTP adapter to
RISK_SOURCE_UNAVAILABLE503. The function performs no writes/publication.

Within each applicable clock choose the reached stage under the approved ladder;
otherwise assessed SEM_RISCO. The case key is the worst applicable flag under the
canonical severity order. No applicable clocks yields worstFlag=null, not assessed
SEM_RISCO; a live defense selector cannot use null and fails source qualification.
Inactive/closed-case displays may retain explicit not-applicable rather than fake
low risk. All candidate risk comparisons use the same operation day/source snapshot.

The result is a computed projection with explicit asOf/source versions. It never
pretends a persisted clock.flag_changed_at was updated. Existing stored flags remain
historical/default data unless independently qualified; claim/queue and any current
risk display use the typed snapshot. There is no claim-only flag event or partial
DASHBOARD feed. Tests assert complete/missing/applicability/threshold-date source,
worst-flag and same-instant behavior, plus public-export and no-side-effect invariants.
Real HTTP+DB tests separately prove source qualification, ordering and rollback.

Each snapshot clock explicitly retains applicability and the applicable ceiling
from that same source instant; the header never joins a fresh flag to an unrelated
raw read's ceiling. No fake flag or ceiling for a not-applicable clock. The CASE
adapter's separate incident-qualification port is specified by ADR0049: it validates
existing same-tenant incident/ref/target provenance in the caller transaction.
The pure evaluateRaitRisk function does not require incident I/O or create records.
Missing required incident qualification maps to503 for pool context/claim and the
scoped risk read; it is not represented as SEM_RISCO or a successful partial queue.
