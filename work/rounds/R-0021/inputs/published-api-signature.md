# Published API — @stynx-nyx/signature 1.4.0 / 1.5.0-rc.2

Extracted from archived npm tarballs; byte-identical own JS and declarations across both versions. See published-api-metadata.json for archive and per-file hashes. This is an inspection input, not a local API implementation.

## package/dist/signature/src/digest.d.ts

```text
export type Sha256Encoding = 'hex' | 'base64';
export interface Sha256Options {
    encoding?: Sha256Encoding;
}
export declare function sha256(input: string | Buffer | Uint8Array, options?: Sha256Options): string;
export declare function canonicalJson(value: unknown): string;
export declare function sha256CanonicalJson(value: unknown, options?: Sha256Options): string;
export declare function canonicalXmlDigest(xml: string, options?: Sha256Options): string;
//# sourceMappingURL=digest.d.ts.map
```

## package/dist/signature/src/errors.d.ts

```text
export declare class SignatureError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
export declare class SignatureHashMismatchError extends SignatureError {
    constructor(expected: string, actual: string);
}
export declare class SignatureCertificateValidationError extends SignatureError {
    constructor(reason?: string);
}
export declare class SignatureProviderConfigurationError extends SignatureError {
    constructor(message?: string);
}
export declare class SignatureProviderError extends SignatureError {
    constructor(message: string, options?: ErrorOptions);
}
export declare class SignatureProviderResponseError extends SignatureProviderError {
    constructor(message: string);
}
export declare class SignatureVerificationInputError extends SignatureError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map
```

## package/dist/signature/src/govbr-sandbox.d.ts

```text
export type GovBrSandboxState = 'pending' | 'completed' | 'failed';
export type GovBrSandboxDecision = 'approved' | 'denied';
export interface GovBrSandboxSigner {
    sub: string;
    username: string;
    cpf?: string | null | undefined;
    email?: string | null | undefined;
}
export interface GovBrSandboxRequest {
    tenantId: string;
    signer: GovBrSandboxSigner;
    resourceType: string;
    resourceId?: string | null | undefined;
    payload: Record<string, unknown>;
    returnUrl?: string | undefined;
}
export interface GovBrSandboxEvidence {
    uniqueAssociation: true;
    signerControlHighConfidence: true;
    laterModificationDetectable: true;
    creationDataControl: 'sandbox-state-challenge';
}
export interface GovBrSandboxResult {
    id: string;
    state: string;
    challenge: string;
    provider: 'govbr-local-sandbox';
    status: GovBrSandboxState;
    signerUniqueKey: string;
    payloadHash: string;
    signatureHash: string | null;
    tamperEvidentHash: string | null;
    evidenceUri: string | null;
    evidence: GovBrSandboxEvidence | null;
    createdAt: string;
    decidedAt: string | null;
}
export declare class GovBrSandboxAdapter {
    private readonly now;
    private readonly requests;
    constructor(now?: () => Date);
    createRequest(input: GovBrSandboxRequest): GovBrSandboxResult;
    complete(state: string, decision: GovBrSandboxDecision, challenge?: string): GovBrSandboxResult;
    verify(payload: Record<string, unknown>, result: GovBrSandboxResult): boolean;
}
export declare function createGovBrSandboxAdapter(now?: () => Date): GovBrSandboxAdapter;
export declare function govBrSandboxCallbackUrl(basePath: string, result: GovBrSandboxResult): string;
//# sourceMappingURL=govbr-sandbox.d.ts.map
```

## package/dist/signature/src/http-provider-client.d.ts

```text
import type { CertificateValidationRequest, CertificateValidationResult, HttpSignatureProviderOptions, ProviderSignRequest, ProviderSignResult, ProviderVerifyRequest, VerifyResult } from './types';
export declare class HttpSignatureProviderClient {
    private readonly options;
    private readonly adapter;
    private readonly pathPrefix;
    private readonly defaultHeaders;
    constructor(options?: HttpSignatureProviderOptions);
    validateCertificate(request: CertificateValidationRequest): Promise<CertificateValidationResult>;
    signPades(request: ProviderSignRequest): Promise<ProviderSignResult>;
    verifyPades(request: ProviderVerifyRequest): Promise<VerifyResult>;
    private execute;
    private request;
    private path;
}
//# sourceMappingURL=http-provider-client.d.ts.map
```

## package/dist/signature/src/http-provider-client.js

```text
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpSignatureProviderClient = void 0;
const integration_adapter_1 = require("@stynx-nyx/integration-adapter");
const errors_1 = require("./errors");
class HttpSignatureProviderClient {
    options;
    adapter;
    pathPrefix;
    defaultHeaders;
    constructor(options = {}) {
        this.options = options;
        this.pathPrefix = normalizePathPrefix(options.pathPrefix ?? '/mock');
        this.defaultHeaders = options.headers ?? {};
        this.adapter = new integration_adapter_1.IntegrationAdapter({
            name: 'stynx-signature-provider',
            request: async (input) => this.request(input),
            parseResponse: (raw) => raw,
            retryPolicy: options.retryPolicy ?? { maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 1_000 },
            timeoutMs: options.timeoutMs ?? 15_000,
            idempotencyKey: (input) => input.idempotencyKey,
            circuitBreakerKey: (input) => input.circuitBreakerKey,
            ...(options.telemetry ? { telemetry: options.telemetry } : {}),
        });
    }
    async validateCertificate(request) {
        const raw = await this.execute({
            endpoint: this.options.baseUrl,
            path: this.path('/tsa/ocsp/validate'),
            circuitBreakerKey: 'certificate-validation',
            body: {
                tenantId: request.tenantId,
                actorId: request.actorId,
                certificate: serializeCertificate(request.certificate),
                certificatePem: request.certificate.pem,
                allowCrlFallback: request.allowCrlFallback,
                crlUrl: request.crlUrl ?? this.options.crlUrl,
                metadata: request.metadata,
            },
        });
        assertBoolean(raw.good, 'good');
        assertRevocationSource(raw.source, 'source');
        return {
            good: raw.good,
            source: toRevocationSource(raw.source),
            checkedAt: parseDate(raw.checkedAt, 'checkedAt'),
            ...(raw.certificateChainPem ? { certificateChainPem: raw.certificateChainPem } : {}),
            ...(raw.reason ? { reason: raw.reason } : {}),
            ...(raw.providerEvidenceUri ? { providerEvidenceUri: raw.providerEvidenceUri } : {}),
        };
    }
    async signPades(request) {
        const raw = await this.execute({
            endpoint: request.tsa.endpoint || this.options.baseUrl,
            path: this.path('/tsa/sign'),
            idempotencyKey: request.idempotencyKey,
            circuitBreakerKey: 'pades-sign',
            headers: request.tsa.headers,
            body: {
                tenantId: request.tenantId,
                actorId: request.actorId,
                pdfBase64: Buffer.from(request.document).toString('base64'),
                documentSha256: request.documentSha256,
                algorithm: request.algorithm,
                digestAlgorithm: request.digestAlgorithm,
                tsa: {
                    policyOid: request.tsa.policyOid,
                    timeoutMs: request.tsa.timeoutMs,
                },
                certificate: serializeCertificate(request.certificate),
                certificatePem: request.certificate.pem,
                credential: request.credential,
                metadata: request.metadata,
            },
        });
        assertString(raw.signedPdfBase64, 'signedPdfBase64');
        return {
            signedDocument: Buffer.from(raw.signedPdfBase64, 'base64'),
            ...(raw.cmsSignatureBase64
                ? { cmsSignature: Buffer.from(raw.cmsSignatureBase64, 'base64') }
                : {}),
            ...(raw.signatureId ? { signatureId: raw.signatureId } : {}),
            ...(raw.signedAt ? { signedAt: parseDate(raw.signedAt, 'signedAt') } : {}),
            ...(raw.tsaTime ? { tsaTime: parseDate(raw.tsaTime, 'tsaTime') } : {}),
            ...(raw.certificateChainPem ? { certificateChainPem: raw.certificateChainPem } : {}),
            revocationSource: raw.revocationSource ? toRevocationSource(raw.revocationSource) : 'none',
            ...(raw.revocationCheckedAt
                ? { revocationCheckedAt: parseDate(raw.revocationCheckedAt, 'revocationCheckedAt') }
                : {}),
            ...(raw.providerEvidenceUri ? { providerEvidenceUri: raw.providerEvidenceUri } : {}),
        };
    }
    async verifyPades(request) {
        const raw = await this.execute({
            endpoint: this.options.baseUrl,
            path: this.path('/pades/verify'),
            circuitBreakerKey: 'pades-verify',
            body: {
                tenantId: request.tenantId,
                documentBase64: Buffer.from(request.document).toString('base64'),
                documentSha256: request.documentSha256,
                signedDocumentBase64: request.signedDocument
                    ? Buffer.from(request.signedDocument).toString('base64')
                    : undefined,
                cmsSignatureBase64: request.cmsSignature
                    ? Buffer.from(request.cmsSignature).toString('base64')
                    : undefined,
                policy: request.policy,
                metadata: request.metadata,
            },
        });
        if (raw.status !== 'valid' && raw.status !== 'invalid' && raw.status !== 'unknown') {
            throw new errors_1.SignatureProviderResponseError('status must be valid, invalid, or unknown');
        }
        return {
            status: raw.status,
            documentSha256: request.documentSha256,
            checkedAt: parseDate(raw.checkedAt, 'checkedAt'),
            ...(raw.signerCertificate ? { signerCertificate: raw.signerCertificate } : {}),
            revocationSource: raw.revocationSource ? toRevocationSource(raw.revocationSource) : 'none',
            ...(raw.revocationCheckedAt
                ? { revocationCheckedAt: parseDate(raw.revocationCheckedAt, 'revocationCheckedAt') }
                : {}),
            ...(raw.certificateChainPem ? { certificateChainPem: raw.certificateChainPem } : {}),
            reasons: raw.reasons ?? [],
        };
    }
    async execute(input) {
        try {
            return (await this.adapter.execute(input));
        }
        catch (error) {
            if (error instanceof errors_1.SignatureProviderError) {
                throw error;
            }
            throw new errors_1.SignatureProviderError(`Signature provider call failed: ${errorMessage(error)}`, {
                cause: error,
            });
        }
    }
    async request(input) {
        const baseUrl = input.endpoint ?? this.options.baseUrl;
        if (!baseUrl) {
            throw new errors_1.SignatureProviderConfigurationError('Signature provider base URL is required');
        }
        const fetchFn = this.options.fetch ?? fetch;
        const response = await fetchFn(new URL(input.path, ensureTrailingSlash(baseUrl)), {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                ...this.defaultHeaders,
                ...(input.headers ?? {}),
            },
            body: JSON.stringify(input.body),
        });
        if (!response.ok) {
            throw new errors_1.SignatureProviderError(`Signature provider returned HTTP ${response.status} for ${input.path}`);
        }
        return response.json();
    }
    path(suffix) {
        return `${this.pathPrefix}${suffix}`;
    }
}
exports.HttpSignatureProviderClient = HttpSignatureProviderClient;
function normalizePathPrefix(value) {
    if (value === '') {
        return '';
    }
    return value.startsWith('/') ? value.replace(/\/$/, '') : `/${value.replace(/\/$/, '')}`;
}
function ensureTrailingSlash(value) {
    return value.endsWith('/') ? value : `${value}/`;
}
function serializeCertificate(certificate) {
    return {
        subject: certificate.subject,
        issuer: certificate.issuer,
        serialNumber: certificate.serialNumber,
        notBefore: certificate.notBefore?.toISOString(),
        notAfter: certificate.notAfter?.toISOString(),
    };
}
function toRevocationSource(source) {
    return source.toLowerCase();
}
function parseDate(value, field) {
    if (!value) {
        return new Date();
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new errors_1.SignatureProviderResponseError(`${field} is not a valid date`);
    }
    return date;
}
function assertString(value, field) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new errors_1.SignatureProviderResponseError(`${field} must be a non-empty string`);
    }
}
function assertBoolean(value, field) {
    if (typeof value !== 'boolean') {
        throw new errors_1.SignatureProviderResponseError(`${field} must be a boolean`);
    }
}
function assertRevocationSource(value, field) {
    if (value !== 'OCSP' && value !== 'CRL' && value !== 'EMBEDDED' && value !== 'NONE') {
        throw new errors_1.SignatureProviderResponseError(`${field} must be OCSP, CRL, EMBEDDED, or NONE`);
    }
}
function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=http-provider-client.js.map
```

## package/dist/signature/src/index.d.ts

```text
import type { SignatureBackend } from './types';
export * from './errors';
export * from './digest';
export * from './govbr-sandbox';
export * from './http-provider-client';
export * from './pades';
export * from './provider-backend';
export * from './sequential';
export * from './signature.module';
export * from './signature.service';
export * from './tokens';
export * from './types';
export * from './xmldsig';
/**
 * Creates a deterministic in-memory signature backend for tests and local demos.
 */
export declare function createMockSignatureBackend(now?: () => Date): SignatureBackend;
//# sourceMappingURL=index.d.ts.map
```

## package/dist/signature/src/pades.d.ts

```text
export interface PadesEvidenceRequest {
    payload: Uint8Array;
    verifyUrl: string;
    reason?: string | undefined;
    signedAt?: string | undefined;
    signerName?: string | undefined;
    evidenceUri?: string | undefined;
}
export interface PadesEvidenceEnvelope {
    format: 'PAdES';
    profile: 'PAdES-B-B';
    signerName: string;
    signedAt: string;
    reason: string;
    verifyUrl: string;
    payloadSha256: string;
    signatureSha256: string;
    evidenceUri: string;
}
export interface PadesEvidenceResult {
    signedDocument: Uint8Array;
    envelope: PadesEvidenceEnvelope;
    block: Uint8Array;
}
export declare class MockPadesEvidenceAdapter {
    private readonly now;
    constructor(now?: () => Date);
    sign(input: PadesEvidenceRequest): PadesEvidenceResult;
}
export declare function createMockPadesEvidenceAdapter(now?: () => Date): MockPadesEvidenceAdapter;
export declare function encodePadesEvidenceBlock(envelope: PadesEvidenceEnvelope): Uint8Array;
export declare function decodePadesEvidenceBlock(document: Uint8Array): PadesEvidenceEnvelope | null;
//# sourceMappingURL=pades.d.ts.map
```

## package/dist/signature/src/provider-backend.d.ts

```text
import type { SignatureBackend, SignatureProviderClient, SignatureRequest, SignatureResult, VerificationPolicy, VerifyRequest, VerifyResult } from './types';
export declare class ProviderBackedSignatureBackend implements SignatureBackend {
    private readonly provider;
    private readonly options;
    constructor(provider: SignatureProviderClient, options?: {
        verificationPolicy?: VerificationPolicy | undefined;
        crlUrl?: string | undefined;
        now?: (() => Date) | undefined;
    });
    sign(request: SignatureRequest): Promise<SignatureResult>;
    verify(request: VerifyRequest): Promise<VerifyResult>;
    private now;
}
//# sourceMappingURL=provider-backend.d.ts.map
```

## package/dist/signature/src/sequential.d.ts

```text
export interface SequentialSignerRef {
    id: string;
    subject: string;
    serial: string;
    role?: string | undefined;
}
export interface SequentialSignatureEntry {
    order: number;
    signer: SequentialSignerRef;
    digest: string;
    signedAt: string;
}
export interface SequentialEnvelope {
    schemaVersion: '1';
    payloadBase64: string;
    payloadSha256: string;
    signatures: SequentialSignatureEntry[];
    expectedSignerIds: string[];
    allowedReaderRoles: string[];
    published: boolean;
}
export interface SequentialVerifyResult {
    ok: boolean;
    order: string[];
    tampered: boolean;
    reasons: string[];
}
export interface SequentialReadResult {
    allowed: boolean;
    payload?: Uint8Array | undefined;
    reasons: string[];
}
export declare class SequentialSigner {
    private readonly options;
    constructor(options: {
        expectedSignerIds: string[];
        allowedReaderRoles?: string[] | undefined;
        now?: (() => Date) | undefined;
    });
    create(payload: Uint8Array): SequentialEnvelope;
    append(envelope: SequentialEnvelope, signer: SequentialSignerRef): SequentialEnvelope;
    publish(envelope: SequentialEnvelope): SequentialEnvelope;
    verify(envelope: SequentialEnvelope): SequentialVerifyResult;
    read(envelope: SequentialEnvelope, role: string): SequentialReadResult;
}
export declare function verifySequentialEnvelope(envelope: SequentialEnvelope): SequentialVerifyResult;
export declare function readSequentialEnvelope(envelope: SequentialEnvelope, role: string): SequentialReadResult;
//# sourceMappingURL=sequential.d.ts.map
```

## package/dist/signature/src/signature.module.d.ts

```text
import { type DynamicModule } from '@nestjs/common';
import type { StynxSignatureModuleOptions } from './types';
export declare class StynxSignatureModule {
    static forRoot(options?: StynxSignatureModuleOptions): DynamicModule;
}
//# sourceMappingURL=signature.module.d.ts.map
```

## package/dist/signature/src/signature.module.js

```text
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StynxSignatureModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StynxSignatureModule = void 0;
const common_1 = require("@nestjs/common");
const http_provider_client_1 = require("./http-provider-client");
const provider_backend_1 = require("./provider-backend");
const signature_service_1 = require("./signature.service");
const tokens_1 = require("./tokens");
let StynxSignatureModule = StynxSignatureModule_1 = class StynxSignatureModule {
    static forRoot(options = {}) {
        return {
            module: StynxSignatureModule_1,
            global: true,
            providers: [
                {
                    provide: tokens_1.STYNX_SIGNATURE_OPTIONS,
                    useValue: options,
                },
                {
                    provide: tokens_1.STYNX_SIGNATURE_PROVIDER_CLIENT,
                    useFactory: () => options.providerClient ?? new http_provider_client_1.HttpSignatureProviderClient(options.provider),
                },
                {
                    provide: tokens_1.STYNX_SIGNATURE_BACKEND,
                    useFactory: (provider) => options.backend ??
                        new provider_backend_1.ProviderBackedSignatureBackend(provider, {
                            verificationPolicy: options.verificationPolicy,
                            crlUrl: options.provider?.crlUrl,
                            now: options.now,
                        }),
                    inject: [tokens_1.STYNX_SIGNATURE_PROVIDER_CLIENT],
                },
                {
                    provide: signature_service_1.SignatureService,
                    useFactory: (backend) => new signature_service_1.SignatureService(backend),
                    inject: [tokens_1.STYNX_SIGNATURE_BACKEND],
                },
            ],
            exports: [
                tokens_1.STYNX_SIGNATURE_OPTIONS,
                tokens_1.STYNX_SIGNATURE_BACKEND,
                tokens_1.STYNX_SIGNATURE_PROVIDER_CLIENT,
                signature_service_1.SignatureService,
            ],
        };
    }
};
exports.StynxSignatureModule = StynxSignatureModule;
exports.StynxSignatureModule = StynxSignatureModule = StynxSignatureModule_1 = __decorate([
    (0, common_1.Module)({})
], StynxSignatureModule);
//# sourceMappingURL=signature.module.js.map
```

## package/dist/signature/src/signature.service.d.ts

```text
import type { SignatureBackend, SignatureRequest, SignatureResult, VerifyRequest, VerifyResult } from './types';
export declare function sha256Hex(bytes: Uint8Array): string;
export declare class SignatureService {
    private readonly backend;
    constructor(backend?: SignatureBackend);
    sign(request: SignatureRequest): Promise<SignatureResult>;
    verify(request: VerifyRequest): Promise<VerifyResult>;
}
//# sourceMappingURL=signature.service.d.ts.map
```

## package/dist/signature/src/signature.service.js

```text
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureService = void 0;
exports.sha256Hex = sha256Hex;
const node_crypto_1 = require("node:crypto");
const errors_1 = require("./errors");
class MissingSignatureBackend {
    async sign() {
        throw new errors_1.SignatureProviderConfigurationError();
    }
    async verify() {
        throw new errors_1.SignatureProviderConfigurationError();
    }
}
function sha256Hex(bytes) {
    return (0, node_crypto_1.createHash)('sha256').update(bytes).digest('hex');
}
function assertDocumentHash(document, expectedSha256) {
    const actual = sha256Hex(document);
    if (actual !== expectedSha256) {
        throw new errors_1.SignatureHashMismatchError(expectedSha256, actual);
    }
}
class SignatureService {
    backend;
    constructor(backend = new MissingSignatureBackend()) {
        this.backend = backend;
    }
    async sign(request) {
        assertDocumentHash(request.document, request.documentSha256);
        return this.backend.sign({
            ...request,
            algorithm: request.algorithm ?? 'pades-ltv',
            digestAlgorithm: request.digestAlgorithm ?? 'sha256',
        });
    }
    async verify(request) {
        assertDocumentHash(request.document, request.documentSha256);
        if (!request.signedDocument && !request.cmsSignature) {
            throw new errors_1.SignatureVerificationInputError();
        }
        return this.backend.verify(request);
    }
}
exports.SignatureService = SignatureService;
//# sourceMappingURL=signature.service.js.map
```

## package/dist/signature/src/tokens.d.ts

```text
export declare const STYNX_SIGNATURE_OPTIONS: unique symbol;
export declare const STYNX_SIGNATURE_BACKEND: unique symbol;
export declare const STYNX_SIGNATURE_PROVIDER_CLIENT: unique symbol;
//# sourceMappingURL=tokens.d.ts.map
```

## package/dist/signature/src/types.d.ts

```text
import type { IntegrationTelemetry, RetryPolicy } from '@stynx-nyx/integration-adapter';
export type SignatureAlgorithm = 'pades-baseline-t' | 'pades-ltv';
export type DigestAlgorithm = 'sha256';
export type RevocationSource = 'ocsp' | 'crl' | 'embedded' | 'none';
export interface SignatureCertificateRef {
    subject: string;
    issuer: string;
    serialNumber: string;
    notBefore?: Date;
    notAfter?: Date;
    pem?: string | undefined;
}
export interface SignatureCredentialRef {
    certificateId?: string | undefined;
    keyId?: string | undefined;
    providerAccountId?: string | undefined;
}
export interface TsaOptions {
    endpoint: string;
    policyOid?: string | undefined;
    timeoutMs?: number | undefined;
    headers?: Record<string, string> | undefined;
}
export interface VerificationPolicy {
    requireTimestamp?: boolean | undefined;
    requireRevocationEvidence?: boolean | undefined;
    allowCrlFallback?: boolean | undefined;
    maxClockSkewMs?: number | undefined;
}
export interface SignatureRequest {
    tenantId: string;
    actorId: string;
    document: Uint8Array;
    documentSha256: string;
    tsa: TsaOptions;
    certificate: SignatureCertificateRef;
    credential?: SignatureCredentialRef | undefined;
    algorithm?: SignatureAlgorithm | undefined;
    digestAlgorithm?: DigestAlgorithm | undefined;
    idempotencyKey?: string | undefined;
    metadata?: Record<string, string> | undefined;
}
export interface SignatureEvidence {
    signatureId: string;
    documentSha256: string;
    signedAt: Date;
    tsaTime?: Date | undefined;
    signerCertificate: SignatureCertificateRef;
    certificateChainPem?: string[] | undefined;
    revocationSource: RevocationSource;
    revocationCheckedAt?: Date | undefined;
    providerEvidenceUri?: string | undefined;
}
export interface SignatureResult {
    status: 'signed';
    signedDocument: Uint8Array;
    cmsSignature: Uint8Array;
    evidence: SignatureEvidence;
}
export interface VerifyRequest {
    tenantId: string;
    document: Uint8Array;
    documentSha256: string;
    signedDocument?: Uint8Array | undefined;
    cmsSignature?: Uint8Array | undefined;
    policy?: VerificationPolicy | undefined;
    metadata?: Record<string, string> | undefined;
}
export interface VerifyResult {
    status: 'valid' | 'invalid' | 'unknown';
    documentSha256: string;
    checkedAt: Date;
    signerCertificate?: SignatureCertificateRef | undefined;
    revocationSource: RevocationSource;
    revocationCheckedAt?: Date | undefined;
    certificateChainPem?: string[] | undefined;
    reasons: string[];
}
export interface SignatureBackend {
    sign(request: SignatureRequest): Promise<SignatureResult>;
    verify(request: VerifyRequest): Promise<VerifyResult>;
}
export interface CertificateValidationRequest {
    tenantId: string;
    actorId?: string | undefined;
    certificate: SignatureCertificateRef;
    allowCrlFallback: boolean;
    crlUrl?: string | undefined;
    metadata?: Record<string, string> | undefined;
}
export interface CertificateValidationResult {
    good: boolean;
    source: RevocationSource;
    checkedAt: Date;
    certificateChainPem?: string[] | undefined;
    reason?: string | undefined;
    providerEvidenceUri?: string | undefined;
}
export interface ProviderSignRequest {
    tenantId: string;
    actorId: string;
    document: Uint8Array;
    documentSha256: string;
    tsa: TsaOptions;
    certificate: SignatureCertificateRef;
    credential?: SignatureCredentialRef | undefined;
    algorithm: SignatureAlgorithm;
    digestAlgorithm: DigestAlgorithm;
    idempotencyKey?: string | undefined;
    metadata?: Record<string, string> | undefined;
}
export interface ProviderSignResult {
    signedDocument: Uint8Array;
    cmsSignature?: Uint8Array | undefined;
    signatureId?: string | undefined;
    signedAt?: Date | undefined;
    tsaTime?: Date | undefined;
    certificateChainPem?: string[] | undefined;
    revocationSource: RevocationSource;
    revocationCheckedAt?: Date | undefined;
    providerEvidenceUri?: string | undefined;
}
export interface ProviderVerifyRequest {
    tenantId: string;
    document: Uint8Array;
    documentSha256: string;
    signedDocument?: Uint8Array | undefined;
    cmsSignature?: Uint8Array | undefined;
    policy?: VerificationPolicy | undefined;
    metadata?: Record<string, string> | undefined;
}
export interface SignatureProviderClient {
    validateCertificate(request: CertificateValidationRequest): Promise<CertificateValidationResult>;
    signPades(request: ProviderSignRequest): Promise<ProviderSignResult>;
    verifyPades(request: ProviderVerifyRequest): Promise<VerifyResult>;
}
export interface HttpSignatureProviderOptions {
    baseUrl?: string | undefined;
    pathPrefix?: string | undefined;
    timeoutMs?: number | undefined;
    headers?: Record<string, string> | undefined;
    crlUrl?: string | undefined;
    retryPolicy?: RetryPolicy | undefined;
    telemetry?: IntegrationTelemetry | undefined;
    fetch?: typeof fetch | undefined;
}
export interface StynxSignatureModuleOptions {
    provider?: HttpSignatureProviderOptions | undefined;
    backend?: SignatureBackend | undefined;
    providerClient?: SignatureProviderClient | undefined;
    verificationPolicy?: VerificationPolicy | undefined;
    now?: (() => Date) | undefined;
}
//# sourceMappingURL=types.d.ts.map
```
