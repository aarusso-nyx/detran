// OfflineDocumentStore (portal-frontends.md §5.1/§8; plan.md M14): cache cifrado de CNH-e e
// CRLV-e com validade — os únicos conteúdos offline do Portal ([UC-PORTAL-011] AC-4). Cifra com
// AES-GCM (`crypto.subtle`) e chave derivada (HKDF) do `sid` da sessão STYNX, mantida só em
// memória e nunca persistida; o texto cifrado fica em `sessionStorage` (morre com a aba, como a
// chave). Sem `sid` (sessão inativa) nada é gravado nem lido. Contrato testável: CTG-0003a §7
// (validade devolvida pelo servidor, nunca calculada; `now` vem do `PortalClock`; `clear()` no
// logout pela `PortalSessionFacade`).
import { Injectable, inject } from '@angular/core';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { PortalClock } from './clock';

export type OfflineDocumentKind = 'cnh-e' | 'crlv-e';

export interface OfflineDocument<T = unknown> {
  readonly kind: OfflineDocumentKind;
  readonly document: T;
  /** ISO-8601, devolvido pelo servidor junto com o documento. */
  readonly validUntil: string;
}

interface StoredEnvelope {
  readonly iv: string;
  readonly payload: string;
}

const STORAGE_PREFIX = 'portal-offline-document';
const HKDF_SALT = 'portal-offline-document-v1';
const IV_BYTES = 12;

function storage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

@Injectable({ providedIn: 'root' })
export class OfflineDocumentStore {
  private readonly session = inject(StynxSessionService);
  private readonly clock = inject(PortalClock);
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private keyCache: { sid: string; key: Promise<CryptoKey> } | null = null;

  async put<T>(
    kind: OfflineDocumentKind,
    document: T,
    validUntil: string,
  ): Promise<void> {
    const key = await this.sessionKey();
    const store = storage();
    if (!key || !store) return;
    const iv = crypto.getRandomValues(
      new Uint8Array(new ArrayBuffer(IV_BYTES)),
    );
    const plain = this.encoder.encode(
      JSON.stringify({
        kind,
        document,
        validUntil,
      } satisfies OfflineDocument<T>),
    );
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plain,
    );
    const envelope: StoredEnvelope = {
      iv: toBase64(iv),
      payload: toBase64(new Uint8Array(cipher)),
    };
    store.setItem(this.storageKey(kind), JSON.stringify(envelope));
  }

  /**
   * Devolve o documento se existir, decifrar e ainda estiver dentro da validade
   * (`validUntil > now`; a validade é a devolvida pelo servidor). Entrada vencida, cifrada com
   * outro `sid` ou corrompida é removida e devolve `null`.
   */
  async get<T = unknown>(
    kind: OfflineDocumentKind,
    now: Date = this.clock.now(),
  ): Promise<OfflineDocument<T> | null> {
    const key = await this.sessionKey();
    const store = storage();
    if (!key || !store) return null;
    const raw = store.getItem(this.storageKey(kind));
    if (!raw) return null;
    try {
      const envelope = JSON.parse(raw) as StoredEnvelope;
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(envelope.iv) },
        key,
        fromBase64(envelope.payload),
      );
      const parsed = JSON.parse(
        this.decoder.decode(plain),
      ) as OfflineDocument<T>;
      if (new Date(parsed.validUntil).getTime() <= now.getTime()) {
        store.removeItem(this.storageKey(kind));
        return null;
      }
      return parsed;
    } catch {
      store.removeItem(this.storageKey(kind));
      return null;
    }
  }

  clear(): void {
    const store = storage();
    if (!store) return;
    for (const kind of ['cnh-e', 'crlv-e'] as const) {
      store.removeItem(this.storageKey(kind));
    }
    this.keyCache = null;
  }

  private storageKey(kind: OfflineDocumentKind): string {
    return `${STORAGE_PREFIX}:${kind}`;
  }

  /** Chave AES-GCM 256 derivada do `sid` corrente; `null` sem sessão ativa. */
  private sessionKey(): Promise<CryptoKey | null> {
    const sid = this.session.state().sid;
    if (!sid) {
      this.keyCache = null;
      return Promise.resolve(null);
    }
    if (this.keyCache?.sid !== sid) {
      this.keyCache = { sid, key: this.deriveKey(sid) };
    }
    return this.keyCache.key;
  }

  private async deriveKey(sid: string): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(sid),
      'HKDF',
      false,
      ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: this.encoder.encode(HKDF_SALT),
        info: this.encoder.encode(STORAGE_PREFIX),
      },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
}
