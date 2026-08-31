import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

const WEBHOOK_ACTOR_ID = '00000000-0000-4000-8000-000000000009';
const MAX_CLOCK_SKEW_SECONDS = 300;

interface WebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer;
  tenantId?: string;
  principal?: {
    id: string;
    roles: string[];
    permissions: string[];
    tenants: string[];
    claims: Record<string, unknown>;
  };
}

@Injectable()
export class RenachWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<WebhookRequest>();
    const secret = process.env.DETRAN_RENACH_WEBHOOK_SECRET;
    if (!secret) {
      throw new UnauthorizedException(
        'RENACH webhook authentication is not configured',
      );
    }
    const tenantId = header(request, 'x-detran-tenant-id');
    const eventId = header(request, 'x-renach-event-id');
    const timestamp = header(request, 'x-renach-timestamp');
    const supplied = header(request, 'x-renach-signature').replace(
      /^sha256=/u,
      '',
    );
    if (!UUID.test(tenantId) || !eventId || !/^\d{10}$/u.test(timestamp)) {
      throw new UnauthorizedException(
        'Invalid RENACH webhook identity headers',
      );
    }
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (age > MAX_CLOCK_SKEW_SECONDS) {
      throw new UnauthorizedException(
        'RENACH webhook timestamp is outside the allowed window',
      );
    }
    if (!request.rawBody) {
      throw new UnauthorizedException('RENACH webhook raw body is required');
    }
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${tenantId}.${eventId}.`)
      .update(request.rawBody)
      .digest();
    if (!/^[0-9a-f]{64}$/u.test(supplied)) {
      throw new UnauthorizedException('Invalid RENACH webhook signature');
    }
    const actual = Buffer.from(supplied, 'hex');
    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      throw new UnauthorizedException('Invalid RENACH webhook signature');
    }
    request.tenantId = tenantId;
    request.principal = {
      id: WEBHOOK_ACTOR_ID,
      roles: ['SYSTEM_INTEGRATION'],
      permissions: [],
      tenants: [tenantId],
      claims: { source: 'renach-webhook', eventId },
    };
    return true;
  }
}

function header(request: WebhookRequest, name: string): string {
  const value = request.headers[name];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
