import type { MobileEncryptedStorePort } from '@stynx-nyx/mobile-runtime';

interface InstalledNormativePackage {
  readonly id: string;
  readonly manifestHash: string;
  readonly validUntil: string;
  readonly content: unknown;
}

interface NormativePackageEnvelope {
  readonly content: unknown;
  readonly manifestHash?: string;
  readonly manifest_hash?: string;
  readonly validUntil?: string;
  readonly valid_until?: string;
}

interface ValidationResponse {
  readonly manifestHash?: string;
  readonly manifest_hash?: string;
  readonly validUntil?: string;
  readonly valid_until?: string;
}

interface NormativeClientPort {
  packageContent(id: string): Promise<NormativePackageEnvelope>;
  validatePackage(
    id: string,
    input: Readonly<{ manifest_hash: string }>,
  ): Promise<ValidationResponse>;
}

interface BootstrapPort {
  snapshot():
    | Readonly<{
        normativePackage?: Readonly<{
          id: string;
          manifestHash: string;
          validUntil: string;
        }>;
      }>
    | undefined;
}

const COLLECTION = 'teat-normative-package';
const ACTIVE_KEY = 'active';

async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function firstDefined(
  ...values: readonly (string | undefined)[]
): string | undefined {
  return values.find((value): value is string => value !== undefined);
}

export class NormativePackageService {
  private integrityBlocked = false;

  constructor(
    private readonly store: MobileEncryptedStorePort,
    private readonly client: NormativeClientPort,
    private readonly provisioning: unknown,
    private readonly bootstrap?: BootstrapPort,
  ) {
    if (this.store.encrypted !== true) {
      throw new Error('normative-package-store-not-encrypted');
    }
  }

  async install(id: string): Promise<InstalledNormativePackage> {
    const envelope = await this.client.packageContent(id);
    if (envelope === undefined || !Object.hasOwn(envelope, 'content')) {
      this.integrityBlocked = true;
      throw new Error('normative-package-content-missing');
    }
    const computedHash = await sha256(envelope.content);
    const bootstrapAuthority = this.bootstrap?.snapshot()?.normativePackage;
    const declaredHash = firstDefined(
      envelope.manifestHash,
      envelope.manifest_hash,
      bootstrapAuthority?.id === id
        ? bootstrapAuthority.manifestHash
        : undefined,
    );
    if (declaredHash === undefined || declaredHash !== computedHash) {
      this.integrityBlocked = true;
      throw new Error('normative-package-hash-mismatch');
    }

    const validation = await this.client.validatePackage(id, {
      manifest_hash: computedHash,
    });
    const validUntil = firstDefined(
      validation.validUntil,
      validation.valid_until,
      envelope.validUntil,
      envelope.valid_until,
      bootstrapAuthority?.id === id ? bootstrapAuthority.validUntil : undefined,
    );
    if (validUntil === undefined || Number.isNaN(Date.parse(validUntil))) {
      this.integrityBlocked = true;
      throw new Error('normative-package-valid-until-missing');
    }

    const installed = {
      id,
      manifestHash: computedHash,
      validUntil,
      content: envelope.content,
    } satisfies InstalledNormativePackage;
    await this.store.put(COLLECTION, ACTIVE_KEY, installed);
    this.integrityBlocked = false;
    return installed;
  }

  async usable(now: string): Promise<InstalledNormativePackage | undefined> {
    if (this.integrityBlocked || Number.isNaN(Date.parse(now)))
      return undefined;
    const installed = await this.store.get<InstalledNormativePackage>(
      COLLECTION,
      ACTIVE_KEY,
    );
    if (installed === undefined) return undefined;
    const computedHash = await sha256(installed.content);
    if (computedHash !== installed.manifestHash) {
      this.integrityBlocked = true;
      return undefined;
    }
    return installed;
  }

  async revalidate(
    now: string,
  ): Promise<'usable' | 'warning-expired' | 'blocked'> {
    const installed = await this.usable(now);
    if (installed === undefined) return 'blocked';
    return Date.parse(now) >= Date.parse(installed.validUntil)
      ? 'warning-expired'
      : 'usable';
  }
}
