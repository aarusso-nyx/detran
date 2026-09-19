// CTG-0001 §1 (M1) — `If-Match` helpers shared by TEAT, RAIT and PORTAL
// commands (R-0009 CTG-0002 §0, adenda A4(a): prefix `PORTAL`).
// Grammar accepted for the header mirrors `OpsParameterService.normalizeIfMatch`
// (parameter.service.ts): a bare integer, a quoted integer, or a weak ETag
// (`W/"n"`). Any other shape counts as "absent" (428), never as a mismatch.
import { DetranError } from './detran-error.js';

function normalizeIfMatch(
  header: string | string[] | undefined,
): number | undefined {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return undefined;
  const match = /^(?:W\/)?"?(\d+)"?$/u.exec(value.trim());
  if (!match) return undefined;
  return Number(match[1]);
}

/**
 * Throws `<PREFIX>.IF_MATCH_REQUIRED` (428) when the header is absent or
 * malformed, `<PREFIX>.VERSION_CONFLICT` (412, `context.expected`) when it
 * does not match `version`. Never throws when it matches.
 */
export function assertIfMatch(
  header: string | string[] | undefined,
  version: number,
  prefix: 'TEAT' | 'RAIT' | 'PORTAL',
): void {
  const received = normalizeIfMatch(header);
  if (received === undefined) {
    throw new DetranError(`${prefix}.IF_MATCH_REQUIRED`, { status: 428 });
  }
  if (received !== version) {
    throw new DetranError(`${prefix}.VERSION_CONFLICT`, {
      status: 412,
      context: { expected: version, received },
    });
  }
}

/** `ETag` response value for a resource `version` — `"<version>"`, quoted. */
export function etagOf(version: number): string {
  return `"${version}"`;
}
