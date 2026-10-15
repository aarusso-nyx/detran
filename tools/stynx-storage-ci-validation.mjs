// Pure consumer-owned archive validation. No SDK, network, filesystem, SQL or process effects.
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
export class ArchiveValidationError extends Error {
  constructor() {
    super('archive-integrity');
    this.name = 'ArchiveValidationError';
    this.reason = 'archive-integrity';
  }
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
function requireThat(condition) {
  if (!condition) throw new ArchiveValidationError();
}
function safeRelative(value) {
  requireThat(
    typeof value === 'string' &&
      value.length &&
      !value.startsWith('/') &&
      !/[\\\0\r\n]/u.test(value) &&
      value.split('/').every((p) => p && p !== '.' && p !== '..'),
  );
  return value;
}
export function checkDownloaded(bytes, expected) {
  requireThat(
    bytes instanceof Uint8Array &&
      expected &&
      Number.isSafeInteger(expected.bytes) &&
      expected.bytes > 0 &&
      /^sha256:[a-f0-9]{64}$/u.test(expected.sha256) &&
      (expected.integrity === null ||
        /^sha(?:512|256|1)-[A-Za-z0-9+/]+={0,2}$/u.test(expected.integrity)),
  );
  requireThat(
    bytes.length === expected.bytes &&
      'sha256:' + hash(bytes) === expected.sha256,
    'archive-integrity',
  );
  if (expected.integrity !== null) {
    const [algorithm, base64] = expected.integrity.split('-', 2);
    requireThat(
      createHash(algorithm).update(bytes).digest('base64') === base64,
      'archive-integrity',
    );
  }
}
function parseArchivePayload(bytes) {
  const tar = gunzipSync(bytes, { maxOutputLength: 512 * 1024 * 1024 }),
    files = new Map();
  let offset = 0,
    longName = null,
    pax = null,
    prefix = null;
  const text = (buffer) => {
    const nul = buffer.indexOf(0),
      raw = nul < 0 ? buffer : buffer.subarray(0, nul),
      s = raw.toString('utf8');
    requireThat(Buffer.from(s, 'utf8').equals(raw), 'archive-integrity');
    return s;
  };
  const octal = (buffer) => {
    const s = text(buffer).trim();
    requireThat(/^[0-7]*$/u.test(s), 'archive-integrity');
    const v = parseInt(s || '0', 8);
    requireThat(Number.isSafeInteger(v), 'archive-integrity');
    return v;
  };
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    offset += 512;
    if (header.every((v) => v === 0)) {
      requireThat(
        tar.subarray(offset).every((v) => v === 0),
        'archive-integrity',
      );
      break;
    }
    const wanted = octal(header.subarray(148, 156));
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : header[i];
    requireThat(sum === wanted, 'archive-integrity');
    let name = text(header.subarray(0, 100));
    const prep = text(header.subarray(345, 500));
    if (prep) name = prep + '/' + name;
    const size = octal(header.subarray(124, 136)),
      mode = octal(header.subarray(100, 108)),
      type = String.fromCharCode(header[156] || 48);
    requireThat(offset + size <= tar.length, 'archive-integrity');
    const content = tar.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;
    if (type === 'L') {
      requireThat(longName === null, 'archive-integrity');
      longName = text(content);
      continue;
    }
    if (type === 'x' || type === 'g') {
      requireThat(pax === null, 'archive-integrity');
      pax = {};
      let at = 0;
      while (at < content.length) {
        const space = content.indexOf(32, at);
        requireThat(space > at, 'archive-integrity');
        const digits = content.subarray(at, space).toString('ascii');
        requireThat(/^[1-9][0-9]*$/u.test(digits), 'archive-integrity');
        const length = Number(digits);
        requireThat(
          Number.isSafeInteger(length) &&
            at + length <= content.length &&
            content[at + length - 1] === 10,
          'archive-integrity',
        );
        const entry = content
            .subarray(space + 1, at + length - 1)
            .toString('utf8'),
          equals = entry.indexOf('=');
        requireThat(equals > 0, 'archive-integrity');
        const key = entry.slice(0, equals);
        requireThat(
          [
            'path',
            'size',
            'mtime',
            'atime',
            'ctime',
            'uid',
            'gid',
            'uname',
            'gname',
            'comment',
          ].includes(key) && !Object.hasOwn(pax, key),
          'archive-integrity',
        );
        pax[key] = entry.slice(equals + 1);
        at += length;
      }
      if (type === 'g') {
        requireThat(
          Object.keys(pax).every((key) => key === 'comment'),
          'archive-integrity',
        );
        pax = null;
      }
      continue;
    }
    name = pax?.path ?? longName ?? name;
    if (pax?.size !== undefined)
      requireThat(Number(pax.size) === size, 'archive-integrity');
    longName = null;
    pax = null;
    if (type === '5') {
      safeRelative(name.replace(/\/$/u, ''));
      continue;
    }
    requireThat(type === '0', 'archive-integrity');
    safeRelative(name);
    const [first, ...rest] = name.split('/');
    if (prefix === null) prefix = first;
    requireThat(first === prefix && rest.length, 'archive-integrity');
    const member = rest.join('/');
    requireThat(!files.has(member), 'archive-integrity');
    files.set(member, { bytes: Buffer.from(content), mode: mode & 0o777 });
  }
  requireThat(
    files.size > 0 && longName === null && pax === null,
    'archive-integrity',
  );
  return files;
}
export function archivePayload(bytes) {
  try {
    return parseArchivePayload(bytes);
  } catch (error) {
    if (error instanceof ArchiveValidationError) throw error;
    throw new ArchiveValidationError();
  }
}

// npm registry metadata can duplicate optional dependencies in dependencies.
// An omitted publisher peerDependenciesMeta field provides no corroboration;
// archive and payload byte seals remain responsible for its authenticity.
export class PackageDependencyMetadataError extends Error {
  constructor() {
    super('input-identity');
    this.name = 'PackageDependencyMetadataError';
    this.reason = 'input-identity';
  }
}
export function checkPackageDependencyMetadata(manifest, versionRecord) {
  const refuse = () => {
    throw new PackageDependencyMetadataError();
  };
  const object = (value) => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
      Reflect.ownKeys(value).some(
        (key) =>
          typeof key !== 'string' ||
          !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'),
      )
    )
      refuse();
    return value;
  };
  object(manifest);
  object(versionRecord);
  const field = (record, name, meta = false) => {
    const descriptor = Object.getOwnPropertyDescriptor(record, name);
    if (!descriptor) return {};
    const value = object(descriptor.value);
    for (const [key, entry] of Object.entries(value)) {
      if (!key) refuse();
      if (!meta) {
        if (typeof entry !== 'string' || !entry.length) refuse();
      } else {
        object(entry);
        if (
          Object.keys(entry).some((name) => name !== 'optional') ||
          (Object.hasOwn(entry, 'optional') &&
            typeof entry.optional !== 'boolean')
        )
          refuse();
      }
    }
    return value;
  };
  const signature = (map) =>
    JSON.stringify(
      Object.keys(map)
        .sort()
        .map((key) => [key, map[key]]),
    );
  const leftDependencies = field(manifest, 'dependencies'),
    rightDependencies = field(versionRecord, 'dependencies'),
    leftOptional = field(manifest, 'optionalDependencies'),
    rightOptional = field(versionRecord, 'optionalDependencies'),
    leftPeers = field(manifest, 'peerDependencies'),
    rightPeers = field(versionRecord, 'peerDependencies'),
    leftMeta = field(manifest, 'peerDependenciesMeta', true),
    rightMeta = field(versionRecord, 'peerDependenciesMeta', true);
  if (
    signature({ ...leftDependencies, ...leftOptional }) !==
      signature({ ...rightDependencies, ...rightOptional }) ||
    signature(leftOptional) !== signature(rightOptional) ||
    signature(leftPeers) !== signature(rightPeers) ||
    (Object.hasOwn(versionRecord, 'peerDependenciesMeta') &&
      signature(leftMeta) !== signature(rightMeta))
  )
    refuse();
}
