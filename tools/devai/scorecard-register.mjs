const coordinates = Array.from({ length: 5 }, (_, f) =>
  Array.from({ length: 9 }, (_, t) => `F${f + 1}:T${t + 1}`),
).flat();
const na = ['F1:T1', 'F4:T5'];
const key = (cell) => `${cell.substrate}:${cell.property}`;
const conclusive = new Set(['PASS', 'REVIEW', 'FAIL']);
const text = (value) => typeof value === 'string' && value.trim().length > 0;

export function reconcileRegister({
  scorecard,
  commit,
  registry,
  assessments,
  observations,
  requiredKinds,
}) {
  if (
    !Array.isArray(requiredKinds) ||
    !requiredKinds.length ||
    new Set(requiredKinds).size !== requiredKinds.length ||
    requiredKinds.some((kind) => !registry.some((entry) => entry.kind === kind))
  )
    throw new Error('Missing or invalid evaluated sensor selection');
  if (scorecard.integration_head !== commit)
    throw new Error('Scorecard candidate mismatch');
  const keys = scorecard.cells.map(key);
  if (
    keys.length !== 45 ||
    new Set(keys).size !== 45 ||
    coordinates.some((cell) => !keys.includes(cell))
  )
    throw new Error('Expected exactly 45 unique scorecard coordinates');
  if (
    scorecard.cells
      .filter((cell) => cell.verdict === 'N/A')
      .map(key)
      .sort()
      .join() !== na.join()
  )
    throw new Error('N/A ledger changed');
  if (
    assessments.length !== 43 ||
    new Set(assessments.map((row) => row.cell)).size !== 43 ||
    assessments.some(
      (row) => !coordinates.includes(row.cell) || na.includes(row.cell),
    )
  )
    throw new Error('Expected exactly 43 explicit assessments');
  return scorecard.cells
    .filter((cell) => cell.verdict !== 'N/A')
    .map((cell) => {
      const coordinate = key(cell),
        assessment = assessments.find((row) => row.cell === coordinate);
      if (
        !assessment ||
        !['measured', 'partial', 'blocked'].includes(
          assessment.evaluation_disposition,
        )
      )
        throw new Error(`Missing explicit disposition: ${coordinate}`);
      for (const field of [
        'criteria',
        'limitations',
        'next_action',
        'follow_up_owner',
      ])
        if (!text(assessment[field]))
          throw new Error(`Missing ${field}: ${coordinate}`);
      if (
        !assessment.input_population ||
        typeof assessment.input_population !== 'object'
      )
        throw new Error(`Missing input population: ${coordinate}`);
      const sensors = registry
        .filter((entry) =>
          entry.cells?.some((binding) => key(binding) === coordinate),
        )
        .map((entry) => entry.kind);
      if (!sensors.length)
        throw new Error(`No registered sensors: ${coordinate}`);
      const selected = sensors.filter((kind) => requiredKinds.includes(kind));
      const evidence = (cell.sensor_readings ?? []).map((id) => {
        const observation = observations.get(id);
        if (!observation) throw new Error(`Missing captured evidence: ${id}`);
        const reading = observation.reading;
        if (
          reading.metrics?.candidate_commit &&
          reading.metrics.candidate_commit !== commit
        )
          throw new Error(`Stale task reading: ${id}`);
        return { ...observation, id, kind: reading.sensor.kind };
      });
      if (assessment.evaluation_disposition === 'measured') {
        if (
          !conclusive.has(cell.verdict) ||
          !selected.length ||
          selected.some(
            (kind) => !evidence.some((item) => item.kind === kind),
          ) ||
          evidence.some(
            (item) =>
              !item.has_measurement_capture ||
              item.reading.killed ||
              item.capture_terminated ||
              !['pass', 'review', 'fail'].includes(item.reading.status),
          )
        )
          throw new Error(
            `Insufficient current evidence for a measured claim: ${coordinate}`,
          );
        if (
          coordinate === 'F3:T2' &&
          !evidence.some((item) => item.reading.metrics?.lines_total > 0)
        )
          throw new Error(
            'Coverage cannot be measured without an actual nonempty line population',
          );
      }
      return {
        ...assessment,
        cell: coordinate,
        registered_sensors: sensors,
        selected_sensors: selected,
        optional_unselected_sensors: sensors.filter(
          (kind) => !requiredKinds.includes(kind),
        ),
        native_verdict: cell.verdict,
        evidence,
      };
    });
}

export function countBy(items, field) {
  return items.reduce((counts, item) => {
    counts[item[field]] = (counts[item[field]] ?? 0) + 1;
    return counts;
  }, {});
}
