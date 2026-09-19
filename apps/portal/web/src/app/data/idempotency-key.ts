// Idempotency-Key determinística (plan.md M17, transcrita em CTG-0003a §2.2): forma
// `<ato>:<alvo>:<fingerprint>`, com `<fingerprint>` = SHA-256 (hex minúsculo, 64 caracteres) do
// corpo JSON canonicalizado — chaves em ordem de código de unidade, recursivo; arrays na ordem
// dada; `undefined` (e funções) omitidos como em `JSON.stringify`; `null` mantido; sem espaços;
// UTF-8 — calculado no cliente com `crypto.subtle`. Mesmo corpo → mesma chave.

function serialize(value: unknown): string | undefined {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      return JSON.stringify(value);
    case 'bigint':
      throw new TypeError('canonicalJson: bigint não é serializável');
    case 'object':
      break;
    default:
      // undefined, function, symbol: omitidos como em JSON.stringify.
      return undefined;
  }
  const candidate = value as { toJSON?: unknown };
  if (typeof candidate.toJSON === 'function') {
    return serialize((candidate.toJSON as () => unknown)());
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => serialize(item) ?? 'null').join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const entries: string[] = [];
  for (const key of Object.keys(record).sort()) {
    const text = serialize(record[key]);
    if (text !== undefined) entries.push(`${JSON.stringify(key)}:${text}`);
  }
  return `{${entries.join(',')}}`;
}

/** JSON canônico (M17): objetos com chaves ordenadas recursivamente, sem espaços. */
export function canonicalJson(value: unknown): string {
  return serialize(value) ?? '';
}

function toBytes(input: string | ArrayBuffer | Uint8Array): Uint8Array {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

/** SHA-256 via `crypto.subtle.digest` sobre UTF-8 (string) ou bytes; hex minúsculo, 64 chars. */
export async function sha256Hex(
  input: string | ArrayBuffer | Uint8Array,
): Promise<string> {
  const bytes = toBytes(input);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    bytes as Uint8Array<ArrayBuffer>,
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

/** `${act}:${target}:${sha256Hex(canonicalJson(body))}`. */
export async function idempotencyKey(
  act: string,
  target: string,
  body: unknown,
): Promise<string> {
  return `${act}:${target}:${await sha256Hex(canonicalJson(body))}`;
}
