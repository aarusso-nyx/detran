import {
  CallHandler,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoJwtValidator } from '@stynx-nyx/auth';
import {
  STYNX_SESSION_STORE,
  SessionJwtSigningService,
  SessionService,
  type SessionBundle,
  type SessionStore,
} from '@stynx-nyx/sessions';
import { mergeMap, type Observable } from 'rxjs';

import { DetranSessionReadiness } from './detran-runtime.js';

interface SessionRequest {
  path?: string;
  url?: string;
  body?: {
    cognitoToken?: string;
    deviceMeta?: Record<string, unknown>;
  };
  stynxClaims?: { sid: string };
}

const STRONG_FACTOR_MARKER = 'detranStrongFactorVerifiedAt';

function requestPath(request: SessionRequest): string {
  return (request.path ?? request.url ?? '').split('?')[0] ?? '';
}

function claimValues(claim: unknown): string[] {
  if (Array.isArray(claim)) return claim.map(String);
  if (typeof claim === 'string') return claim.split(/[ ,]+/u).filter(Boolean);
  return [];
}

@Injectable()
export class DetranSessionStrongFactorGuard implements CanActivate {
  constructor(
    private readonly cognito: CognitoJwtValidator,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const path = requestPath(request);
    if (path !== '/sessions' && path !== '/sessions/switch') return true;
    if (!request.body)
      throw new UnauthorizedException('Session body is required');

    if (path === '/sessions') {
      const token = request.body.cognitoToken;
      if (!token) throw new UnauthorizedException('Cognito token is required');
      const claims = await this.cognito.validateAccessToken(token);
      const claimName = process.env.STYNX_STRONG_FACTOR_CLAIM ?? 'amr';
      const accepted = new Set(
        (
          process.env.STYNX_STRONG_FACTOR_VALUES ??
          'mfa,software_token_mfa,hardware_mfa,webauthn'
        )
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      );
      const factors = claimValues(claims.claims[claimName]).map((value) =>
        value.toLowerCase(),
      );
      if (!factors.some((factor) => accepted.has(factor))) {
        throw new UnauthorizedException('A verified strong factor is required');
      }
      request.body.deviceMeta = {
        ...(request.body.deviceMeta ?? {}),
        [STRONG_FACTOR_MARKER]: new Date().toISOString(),
        detranStrongFactorMethod: factors.find((factor) =>
          accepted.has(factor),
        ),
      };
      return true;
    }

    const sid = request.stynxClaims?.sid;
    const current = sid ? await this.sessions.get(sid) : null;
    if (!current?.deviceMeta?.[STRONG_FACTOR_MARKER]) {
      throw new UnauthorizedException(
        'Tenant switching requires a strong-factor session',
      );
    }
    request.body.deviceMeta = { ...(current.deviceMeta ?? {}) };
    return true;
  }
}

@Injectable()
export class DetranSingleSessionInterceptor implements NestInterceptor {
  constructor(
    @Inject(STYNX_SESSION_STORE) private readonly store: SessionStore,
    private readonly sessions: SessionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const path = requestPath(request);
    if (path !== '/sessions' && path !== '/sessions/switch') {
      return next.handle();
    }
    return next.handle().pipe(
      mergeMap(async (value: unknown) => {
        const bundle = value as Partial<SessionBundle>;
        if (!bundle.sid) return value;
        const created = await this.sessions.get(bundle.sid);
        if (!created) throw new ConflictException('New session is not active');
        const candidates = await this.store.listSessionIdsByUser(
          created.userId,
        );
        const records = (
          await Promise.all(candidates.map((sid) => this.sessions.get(sid)))
        ).filter((record) => record?.tenantId === created.tenantId);
        records.sort(
          (left, right) =>
            new Date(right!.createdAt).getTime() -
              new Date(left!.createdAt).getTime() ||
            right!.sid.localeCompare(left!.sid),
        );
        const winner = records[0];
        await Promise.all(
          records.slice(1).map((record) => this.sessions.revoke(record!.sid)),
        );
        if (winner?.sid !== created.sid) {
          await this.sessions.revoke(created.sid);
          throw new ConflictException(
            'A concurrent session replaced this session',
          );
        }
        return value;
      }),
    );
  }
}

@Injectable()
export class DetranSessionReadinessBinder implements OnModuleInit {
  constructor(
    @Inject(STYNX_SESSION_STORE) private readonly store: SessionStore,
    private readonly signing: SessionJwtSigningService,
    private readonly readiness: DetranSessionReadiness,
  ) {}

  async onModuleInit(): Promise<void> {
    this.readiness.bind(this.store, this.signing);
    await this.readiness.checkRedis();
    await this.readiness.checkJwks();
  }
}
