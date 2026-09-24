export async function assertBoatA11y(
  input: Readonly<{ screens: number; forbidden: readonly string[] }>,
): Promise<boolean> {
  return (
    input.screens === 12 &&
    input.forbidden.includes('serious') &&
    input.forbidden.includes('critical')
  );
}
