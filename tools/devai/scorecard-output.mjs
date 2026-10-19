// DEVAI writes failed action envelopes to stderr, with completed readings in payload.
export function parseCommandDocument({ stdout = '', stderr = '' }) {
  for (const output of [stdout, stderr]) {
    for (const line of output.trim().split('\n').reverse()) {
      try {
        return JSON.parse(line);
      } catch {
        // Package-manager warnings and plain diagnostics remain in the transcript.
      }
    }
  }
  return null;
}

export function unwrapCommandDocument(document) {
  return (
    document?.result?.value ?? document?.error?.context?.payload ?? document
  );
}
