// Execute the installed population exactly; task-bound members need explicit local-write consent.
export function scorecardEnumerationPlan(presets, registry, inputs) {
  const sweep = presets.presets.find((entry) => entry.name === 'sweep');
  if (!sweep) throw new Error('Installed sweep is missing');
  const members = sweep.members;
  if (new Set(members).size !== members.length)
    throw new Error('Installed sweep has duplicate members');
  const registered = registry.entries
    .filter((entry) => entry.effect === 'read')
    .map((entry) => entry.kind);
  if (
    members.length !== registered.length ||
    registered.some((kind) => !members.includes(kind))
  )
    throw new Error(
      'Sweep differs from the complete registered read population',
    );
  const second = presets.selection_effect_rule.sweep_second_pass.split(',');
  if (
    new Set(second).size !== second.length ||
    second.some((kind) => !members.includes(kind))
  )
    throw new Error('Second pass is not a unique subset of the sweep');
  const command = (kind, phase) => ({
    kind,
    label: `${phase}-${kind}`,
    argv: [
      'pnpm',
      'exec',
      'devai',
      'sense',
      'run',
      kind,
      '--repo-root',
      '.',
      '--input',
      JSON.stringify(inputs[kind] ?? {}),
      ...(inputs[kind]?.taskId ? ['--as-role', 'inspector', '--write'] : []),
      '--format',
      'json',
    ],
  });
  return {
    first: members
      .filter((kind) => !second.includes(kind))
      .map((kind) => command(kind, 'first')),
    second: second.map((kind) => command(kind, 'second')),
    separately_required: [...sweep.excluded],
  };
}
