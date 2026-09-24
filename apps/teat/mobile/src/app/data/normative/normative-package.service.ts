import type { MobileEncryptedStorePort } from '@stynx-nyx/mobile-runtime';
import type { CommandHeaders } from '../api/ait.client.js';

export interface InstalledNormativePackage {
  readonly id: string;
  readonly version: string;
  readonly manifestHash: string;
  readonly validUntil: string;
  readonly manifest: Readonly<Record<string, unknown>>;
  readonly signature: Readonly<{
    value: string;
    signer: string;
    kind: 'local-unsigned';
  }>;
}

interface NormativePackageEnvelope {
  readonly manifest: Readonly<Record<string, unknown>>;
  readonly manifest_hash: string;
  readonly signature: string;
}

interface NormativeClientPort {
  packageContent(id: string): Promise<NormativePackageEnvelope>;
  validatePackage(
    id: string,
    input: Readonly<{ package_version: string; manifest_hash: string }>,
    headers: CommandHeaders,
  ): Promise<Readonly<{ valid: boolean; reason: string }>>;
}

interface BootstrapPort {
  snapshot():
    | Readonly<{
        normativePackage: Readonly<{
          id: string;
          version: string;
          manifestHash: string;
          validUntil: string;
        }>;
      }>
    | undefined;
}

const COLLECTION = 'package';
const ACTIVE_KEY = 'active';

async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export class NormativePackageService {
  private integrityBlocked = false;

  constructor(
    private readonly store: MobileEncryptedStorePort,
    private readonly client: NormativeClientPort,
    private readonly bootstrap: BootstrapPort,
  ) {
    if (store.encrypted !== true) {
      throw new Error('normative-package-store-not-encrypted');
    }
  }

  async install(
    id: string,
    input: Readonly<{ packageVersion: string; headers: CommandHeaders }>,
  ): Promise<InstalledNormativePackage> {
    const authority = this.bootstrap.snapshot()?.normativePackage;
    if (
      authority === undefined ||
      authority.id !== id ||
      authority.version !== input.packageVersion
    ) {
      throw new Error('normative-package-authority-mismatch');
    }
    const envelopePromise = this.client.packageContent(id);
    const validationPromise = this.client.validatePackage(
      id,
      {
        package_version: input.packageVersion,
        manifest_hash: authority.manifestHash,
      },
      input.headers,
    );
    const envelope = await envelopePromise;
    const manifestHash = await sha256(envelope.manifest);
    if (
      manifestHash !== envelope.manifest_hash ||
      manifestHash !== authority.manifestHash
    ) {
      this.integrityBlocked = true;
      throw new Error('normative-package-hash-mismatch');
    }
    const manifestVersion = envelope.manifest['package_version'];
    const manifestValidUntil = envelope.manifest['valid_until'];
    if (
      manifestVersion !== input.packageVersion ||
      manifestValidUntil !== authority.validUntil ||
      typeof envelope.signature !== 'string' ||
      envelope.signature === ''
    ) {
      this.integrityBlocked = true;
      throw new Error('normative-package-manifest-mismatch');
    }
    const validation = await validationPromise;
    if (!validation.valid) {
      this.integrityBlocked = true;
      throw new Error(`normative-package-invalid:${validation.reason}`);
    }
    const installed: InstalledNormativePackage = {
      id,
      version: input.packageVersion,
      manifestHash,
      validUntil: authority.validUntil,
      manifest: envelope.manifest,
      signature: {
        value: envelope.signature,
        signer: 'source_pending',
        kind: 'local-unsigned',
      },
    };
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
    if ((await sha256(installed.manifest)) !== installed.manifestHash) {
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
