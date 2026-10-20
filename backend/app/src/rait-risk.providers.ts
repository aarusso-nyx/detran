import { Global, Inject, Injectable, Module } from '@nestjs/common';
import {
  addCalendarDays,
  addCalendarMonths,
  isWeekend,
  type RaitRiskClockInput,
  type RaitRiskStep,
} from '@detran/inf-deadlines';
import {
  RAIT_RISK_PROVENANCE_READER,
  RAIT_RISK_SNAPSHOT_FACTORY,
  raitQualify,
  raitQualifyPolicy,
  raitSourceRows,
  raitCanonical,
  type RaitRiskProvenanceReader,
  type RaitRiskSnapshotFactory,
  type RaitRiskSourceSnapshot,
  type RaitRiskTx,
  type RaitOperationClockSnapshot,
} from '@detran/inf-rait-case';
import { DetranError } from '@detran/shared';
type Row = Record<string, unknown>;
const unavailable = (): never => {
  throw new DetranError('RAIT.RISK_SOURCE_UNAVAILABLE', { status: 503 });
};
const ref = (table: string, id: unknown) => 'sql:' + table + ':' + String(id);
const date = (value: unknown) => String(value);
@Injectable()
export class SqlRaitRiskSnapshotFactory implements RaitRiskSnapshotFactory {
  constructor(
    @Inject(RAIT_RISK_PROVENANCE_READER)
    private readonly provenance: RaitRiskProvenanceReader,
  ) {}
  create(tx: RaitRiskTx, operation: RaitOperationClockSnapshot) {
    return {
      read: (tenantId: string, caseId: string) =>
        this.read(tx, operation, tenantId, caseId),
    };
  }
  private async read(
    tx: RaitRiskTx,
    operation: RaitOperationClockSnapshot,
    tenantId: string,
    caseId: string,
  ): Promise<RaitRiskSourceSnapshot> {
    try {
      const q = async (sql: string, args: unknown[] = []) =>
        (await tx.query<Row>(sql, args)).rows;
      const parent = (
        await q(
          'select id,ait_id,instance from inf.rait_case where tenant_id=$1 and id=$2 for share',
          [tenantId, caseId],
        )
      )[0];
      if (!parent) return unavailable();
      const ait = (
        await q(
          'select id,traffic_agency_id from inf.ait_ait where tenant_id=$1 and id=$2 for share',
          [tenantId, parent.ait_id],
        )
      )[0];
      const infractions = await q(
        'select id from inf.infraction where tenant_id=$1 and ait_id=$2 for share',
        [tenantId, parent.ait_id],
      );
      if (!ait || infractions.length !== 1) return unavailable();
      const infraction = infractions[0]!,
        base = [
          ref('inf.rait_case', caseId),
          ref('inf.ait_ait', ait.id),
          ref('inf.infraction', infraction.id),
        ];
      const allRefs = new Set<string>(),
        versions = new Set<string>();
      const qualify = async (
        kind: Parameters<typeof raitQualify>[2],
        refs: string[],
        dependencies: readonly string[] = [],
      ) => {
        const result = await raitQualify(
          tx,
          this.provenance,
          kind,
          tenantId,
          caseId,
          [...new Set(refs)],
          dependencies,
        );
        refs.forEach((r) => allRefs.add(r));
        result.forEach((v) => versions.add(v));
        return result;
      };
      const today = operation.today(operation.tenantTz);
      const rounded = async (raw: string) => {
        let value = raw;
        while (
          isWeekend(value) ||
          (
            await q(
              'select id from inf.rait_holiday where tenant_id=$1 and holiday_on=$2 for share',
              [tenantId, value],
            )
          ).length
        )
          value = addCalendarDays(value, 1);
        return value;
      };
      const clocks = await q(
        'select id,clock_code from inf.rait_clock where tenant_id=$1 and case_id=$2 order by id for share',
        [tenantId, caseId],
      );
      const events = await q(
        'select id from inf.rait_case_event where tenant_id=$1 and case_id=$2 order by occurred_at,id',
        [tenantId, caseId],
      );
      const eventRows = await raitSourceRows(
        tx,
        tenantId,
        events.map((e) => ref('inf.rait_case_event', e.id)),
      );
      const chronologicalEvents = [...eventRows].sort((a, b) => {
        const left = String(a.fields.occurred_at),
          right = String(b.fields.occurred_at);
        return left < right
          ? -1
          : left > right
            ? 1
            : a.sourceRef < b.sourceRef
              ? -1
              : a.sourceRef > b.sourceRef
                ? 1
                : 0;
      });
      const latestMovement = [...chronologicalEvents]
        .reverse()
        .find((e) =>
          ['ADMITIDO', 'DISTRIBUIDO', 'TRIAGEM_ADMISSIBILIDADE'].includes(
            String(e.fields.to_state),
          ),
        );
      const admission = [...chronologicalEvents]
        .reverse()
        .find((e) => e.fields.to_state === 'ADMITIDO');
      const auditAction = admission
        ? 'INF_RAIT_CASE_ADMIT'
        : 'INF_RAIT_CASE_TRIAGE';
      const audits = await q(
        `select event_id::text,to_char(occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') at from audit.events where tenant_id=$1 and entity_id=$2 and action=$3 order by event_id desc limit 1`,
        [tenantId, caseId, auditAction],
      );
      const auditRefs = audits.map(
        (e) => 'sql:audit.events:' + String(e.event_id) + '@' + String(e.at),
      );
      const infEvents = await q(
        'select id from inf.infraction_event where tenant_id=$1 and infraction_id=$2 order by occurred_at,id',
        [tenantId, infraction.id],
      );
      const infEventRows = await raitSourceRows(
        tx,
        tenantId,
        infEvents.map((e) => ref('inf.infraction_event', e.id)),
      );
      const inputs: RaitRiskClockInput[] = [];
      const incidentQualifications: RaitRiskSourceSnapshot['incidentQualifications'][number][] =
        [];
      for (const code of ['A', 'B', 'C', 'D'] as const) {
        if (code === 'B' && parent.instance === 'defesa_previa') {
          const sourceVersions = await qualify('applicability', base);
          inputs.push({
            clockCode: code,
            applicability: 'not_applicable',
            sourceRef: 'B:defesa_previa',
            sourceVersions,
          });
          continue;
        }
        const found = clocks.filter((c) => c.clock_code === code);
        if (found.length !== 1) return unavailable();
        const clockRef = ref('inf.rait_clock', found[0]!.id),
          clock = (await raitSourceRows(tx, tenantId, [clockRef]))[0]!.fields;
        const timerCode = (
          {
            A: 'T-DEC',
            B: 'T-JUL-24M',
            C: 'T-PAR-3A',
            D: 'T-PRESC-5A',
          } as const
        )[code];
        const availableTimers: { id: unknown; table: string }[] = [];
        const infractionTimers = await q(
          `select id from inf.infraction_timer where tenant_id=$1 and infraction_id=$2 and timer_code=$3 and status='armado' and satisfied_at is null and expired_at is null and ${code === 'B' ? 'instance=$4' : 'instance is null'} order by id for share`,
          code === 'B'
            ? [tenantId, infraction.id, timerCode, parent.instance]
            : [tenantId, infraction.id, timerCode],
        );
        availableTimers.push(
          ...infractionTimers.map((t) => ({
            id: t.id,
            table: 'inf.infraction_timer',
          })),
        );
        if (code === 'B') {
          const caseTimers = await q(
            'select id from inf.rait_deadline where tenant_id=$1 and case_id=$2 and timer_code=$3 and satisfied_at is null order by id for share',
            [tenantId, caseId, timerCode],
          );
          availableTimers.push(
            ...caseTimers.map((t) => ({
              id: t.id,
              table: 'inf.rait_deadline',
            })),
          );
        }
        if (availableTimers.length !== 1) return unavailable();
        const timerRef = ref(availableTimers[0]!.table, availableTimers[0]!.id),
          timer = (await raitSourceRows(tx, tenantId, [timerRef]))[0]!.fields;
        if (
          (timer.cancel_reason !== undefined && timer.cancel_reason !== null) ||
          (timer.business_days !== undefined && timer.business_days !== false)
        )
          return unavailable();
        const refs = [...base, clockRef, timerRef];
        await qualify('timer', refs);
        const parameters = await q(
          `select id,traffic_agency_id from ops.parameter where tenant_id=$1 and surface='rait' and key=$2 and effective_from<=$3 and (effective_to is null or effective_to>=$3) and (traffic_agency_id=$4 or traffic_agency_id is null) order by (traffic_agency_id is not null) desc,effective_from desc,version desc for share`,
          [tenantId, 'rait.ladder.' + code, today, ait.traffic_agency_id],
        );
        const tier = parameters.filter(
          (p) => p.traffic_agency_id === ait.traffic_agency_id,
        );
        const selected = tier.length
          ? tier
          : parameters.filter((p) => p.traffic_agency_id === null);
        // Overlapping effective activations are ambiguous, even when one version is newer.
        if (selected.length !== 1) return unavailable();
        const parameterRef = ref('ops.parameter', selected[0]!.id),
          parameter = (await raitSourceRows(tx, tenantId, [parameterRef]))[0]!
            .fields;
        if (
          parameter.status !== 'vigente' ||
          parameter.scope !==
            (parameter.traffic_agency_id === null ? 'tenant' : 'agency') ||
          parameter.source_pending !== false ||
          parameter.value_type !== 'json'
        )
          return unavailable();
        await qualify('parameter', [parameterRef]);
        const ladder = parameter.value_json as {
          schemaVersion: number;
          clockCode: string;
          unit: string;
          tracks: {
            ceiling: number;
            steps: { flag: RaitRiskStep['flag']; after: number }[];
          }[];
          sourceRef: string;
        };

        const expectedSource = (
          {
            A: 'WF-RAIT-002#4.3',
            B: 'WF-RAIT-002#4.1',
            C: 'WF-RAIT-002#4.2',
            D: 'DT-030',
          } as const
        )[code];
        if (
          !ladder ||
          typeof ladder !== 'object' ||
          ladder.schemaVersion !== 1 ||
          ladder.clockCode !== code ||
          ladder.sourceRef !== expectedSource ||
          !Array.isArray(ladder.tracks)
        )
          return unavailable();

        const approvedTracks = {
          A: [
            {
              ceiling: 180,
              steps: [
                { flag: 'ALERTA_N1', after: 90 },
                { flag: 'ALERTA_N2', after: 135 },
                { flag: 'CRITICO', after: 162 },
              ],
            },
            {
              ceiling: 360,
              steps: [
                { flag: 'ALERTA_N1', after: 180 },
                { flag: 'ALERTA_N2', after: 270 },
                { flag: 'CRITICO', after: 324 },
              ],
            },
          ],
          B: [
            {
              ceiling: 24,
              steps: [
                { flag: 'ALERTA_N1', after: 12 },
                { flag: 'ALERTA_N2', after: 18 },
                { flag: 'ALERTA_N3', after: 21 },
                { flag: 'CRITICO', after: 23 },
              ],
            },
          ],
          C: [
            {
              ceiling: 36,
              steps: [
                { flag: 'ALERTA_N2', after: 24 },
                { flag: 'ALERTA_N3', after: 30 },
                { flag: 'CRITICO', after: 33 },
              ],
            },
          ],
          D: [
            {
              ceiling: 60,
              steps: [
                { flag: 'ALERTA_N1', after: 30 },
                { flag: 'ALERTA_N2', after: 45 },
                { flag: 'CRITICO', after: 54 },
              ],
            },
          ],
        };
        if (
          raitCanonical(ladder.tracks) !==
            raitCanonical(approvedTracks[code]) ||
          ladder.unit !== (code === 'A' ? 'days' : 'months') ||
          Object.keys(ladder).sort().join(',') !==
            'clockCode,schemaVersion,sourceRef,tracks,unit'
        )
          return unavailable();
        let ceiling =
          code === 'A' ? 180 : code === 'B' ? 24 : code === 'C' ? 36 : 60;

        if (code === 'A') {
          const criteria = await q(
            "select id from inf.rait_admissibility where tenant_id=$1 and case_id=$2 and criterion='tempestividade' order by id for share",
            [tenantId, caseId],
          );
          if (criteria.length > 1) return unavailable();
          const criterionRefs = criteria.map((c) =>
            ref('inf.rait_admissibility', c.id),
          );
          const criterion = criterionRefs.length
            ? (await raitSourceRows(tx, tenantId, criterionRefs))[0]!.fields
            : null;
          const extensions = infEventRows.filter(
            (e) =>
              e.fields.payload &&
              typeof e.fields.payload === 'object' &&
              (e.fields.payload as Row).caseId === caseId &&
              (e.fields.payload as Row).track === 360,
          );
          ceiling = criterion?.verdict === true ? 360 : 180;

          if (ceiling === 360 && (!admission || extensions.length !== 1))
            return unavailable();
          await qualify('track', [
            ...refs,
            ...criterionRefs,
            ...(ceiling === 360 && admission
              ? [admission.sourceRef]
              : latestMovement
                ? [latestMovement.sourceRef]
                : []),
            ...auditRefs,
            ...extensions.map((e) => e.sourceRef),
          ]);
        }
        if (code === 'B') {
          const caseSource = (
            await raitSourceRows(tx, tenantId, [base[0]!])
          )[0]!.fields;
          const received =
            parent.instance === 'jari'
              ? caseSource.judge_body_received_on
              : parent.instance === 'cetran'
                ? caseSource.cetran_received_on
                : null;
          if (!received || timer.started_on !== received) return unavailable();
        }
        if (code === 'C') {
          // The canonical reset timestamp identifies the actual movement; its legal qualification comes only from the independent policy receipt.
          const movements = chronologicalEvents.filter(
            (event) => event.fields.occurred_at === clock.last_reset_at,
          );
          if (!clock.last_reset_at || movements.length !== 1)
            return unavailable();
          const movement = movements[0]!;
          const local = (
            await q(
              'select ($1::timestamptz at time zone $2)::date::text as local_day',
              [movement.fields.occurred_at, operation.tenantTz],
            )
          )[0]!.local_day;
          if (timer.started_on !== local) return unavailable();
          const policyRefs = [
            ...base,
            clockRef,
            timerRef,
            movement.sourceRef,
            ...auditRefs,
          ];
          const policy = await raitQualifyPolicy(
            tx,
            this.provenance,
            tenantId,
            caseId,
            [...new Set(policyRefs)],
          );
          policyRefs.forEach((sourceRef) => allRefs.add(sourceRef));
          policy.sourceVersions.forEach((version) => versions.add(version));
          await qualify(
            'movement',
            [
              base[0]!,
              base[2]!,
              clockRef,
              timerRef,
              movement.sourceRef,
              ...auditRefs,
            ],
            [policy.receiptDigest],
          );
        }
        if (code === 'D') {
          // S2 supports the explicitly qualified original-start disposition. An unresolved reset is unavailable.
          if (clock.last_reset_at !== null) return unavailable();
          const infractionRow = (
            await raitSourceRows(tx, tenantId, [base[2]!])
          )[0]!.fields;
          if (timer.started_on !== infractionRow.committed_on)
            return unavailable();
          await qualify('interruption', [
            ...refs,
            ...eventRows.map((e) => e.sourceRef),
            ...auditRefs,
            ...infEventRows
              .filter(
                (e) =>
                  e.fields.payload &&
                  typeof e.fields.payload === 'object' &&
                  (e.fields.payload as Row).caseId === caseId &&
                  (e.fields.payload as Row).track === 360,
              )
              .map((e) => e.sourceRef),
          ]);
        }
        const track = ladder.tracks.find((t) => t.ceiling === ceiling);
        if (!track || !Array.isArray(track.steps)) return unavailable();
        if (
          code === 'A' &&
          timer.started_on !==
            (await raitSourceRows(tx, tenantId, [base[2]!]))[0]!.fields
              .committed_on
        )
          return unavailable();
        const start = date(timer.started_on),
          raw =
            ladder.unit === 'days'
              ? addCalendarDays(start, ceiling)
              : addCalendarMonths(start, ceiling),
          due = await rounded(raw);
        if (
          timer.raw_due_on !== raw ||
          timer.due_on !== due ||
          ('ceiling_on' in timer && timer.ceiling_on !== due) ||
          clock.ceiling_on !== due ||
          clock.started_on !== start ||
          timer.suspended_by_act_id !== null ||
          ('suspended_days' in timer && timer.suspended_days !== 0)
        )
          return unavailable();
        const steps: RaitRiskStep[] = [];
        for (const step of track.steps)
          steps.push({
            flag: step.flag,
            reachedOn: await rounded(
              ladder.unit === 'days'
                ? addCalendarDays(start, step.after)
                : addCalendarMonths(start, step.after),
            ),
            parameterRef,
            sourceRef: ladder.sourceRef,
          });
        steps.push({
          flag: 'PRESCRITO_OPERACIONAL',
          reachedOn: due,
          parameterRef,
          sourceRef: ladder.sourceRef,
        });
        if (today >= due) {
          const alerts = await q(
            "select id,incident_ref from inf.rait_clock_alert where tenant_id=$1 and clock_id=$2 and level='PRESCRITO_OPERACIONAL' order by id for share",
            [tenantId, clock.id],
          );
          if (alerts.length !== 1 || !alerts[0]!.incident_ref)
            return unavailable();
          const incidents = await q(
            'select id,case_id,clock_id from inf.rait_incident where tenant_id=$1 and incident_ref=$2 order by id for share',
            [tenantId, alerts[0]!.incident_ref],
          );
          if (
            incidents.length !== 1 ||
            (incidents[0]!.case_id !== null &&
              incidents[0]!.case_id !== caseId) ||
            (incidents[0]!.clock_id !== null &&
              incidents[0]!.clock_id !== clock.id) ||
            (incidents[0]!.case_id === null && incidents[0]!.clock_id === null)
          )
            return unavailable();
          const sourceVersions = await qualify('incident', [
            base[0]!,
            clockRef,
            ref('inf.rait_clock_alert', alerts[0]!.id),
            ref('inf.rait_incident', incidents[0]!.id),
          ]);
          incidentQualifications.push({
            clockCode: code,
            status: 'qualified',
            sourceVersions,
          });
        }
        inputs.push({
          clockCode: code,
          applicability: 'applicable',
          timerRef,
          startedOn: start,
          ceilingOn: due,
          steps,
          sourceVersions: [...versions].sort(),
        });
      }
      return {
        input: {
          asOf: operation.instant.toISOString(),
          today,
          tenantTimezone: operation.tenantTz,
          clocks: inputs,
        },
        incidentQualifications,
        sourceRefs: [...allRefs].sort(),
      };
    } catch {
      return unavailable();
    }
  }
}
@Global()
@Module({
  providers: [
    {
      provide: RAIT_RISK_PROVENANCE_READER,
      useValue: {
        qualify: async () => ({ status: 'missing', sourceVersions: [] }),
      } satisfies RaitRiskProvenanceReader,
    },
    SqlRaitRiskSnapshotFactory,
    {
      provide: RAIT_RISK_SNAPSHOT_FACTORY,
      useExisting: SqlRaitRiskSnapshotFactory,
    },
  ],
  exports: [RAIT_RISK_SNAPSHOT_FACTORY, RAIT_RISK_PROVENANCE_READER],
})
export class RaitRiskSnapshotModule {}
