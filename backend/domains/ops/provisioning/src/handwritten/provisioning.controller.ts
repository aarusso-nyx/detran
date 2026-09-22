import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  Action,
  Audit,
  Resource,
  NoIdempotent,
  type RequestLike,
} from '@detran/shared';
import {
  OPS_PROVISIONING_TOKEN,
  ProvisioningRuntime,
} from './provisioning.provider.js';
import type { ProvisioningResult } from './provisioning.contract.js';
type HeaderResponse = { setHeader(name: string, value: string): void };
@Controller('v1/ops/provisioning')
@Resource('ops:provisioning')
export class ProvisioningController {
  constructor(
    @Inject(OPS_PROVISIONING_TOKEN)
    private readonly runtime: ProvisioningRuntime,
  ) {}
  @Post('devices/:deviceId/key-challenges')
  @Action('create-key-challenge')
  @NoIdempotent()
  @Audit({
    action: 'OPS_PROVISIONING_CREATE_KEY_CHALLENGE',
    entity: 'ops.device_key',
  })
  async createKeyChallenge(
    @Param('deviceId') deviceId: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('challenge', request, {
        deviceId,
        body,
        ifMatch,
        idempotencyKey,
      }),
    );
  }
  @Post('devices/:deviceId/keys')
  @Action('register-device-key')
  @NoIdempotent()
  @Audit({
    action: 'OPS_PROVISIONING_REGISTER_DEVICE_KEY',
    entity: 'ops.device_key',
  })
  async registerDeviceKey(
    @Param('deviceId') deviceId: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('register', request, {
        deviceId,
        body,
        ifMatch,
        idempotencyKey,
      }),
    );
  }
  @Post('packages')
  @Action('issue-provisioning-package')
  @NoIdempotent()
  @Audit({
    action: 'OPS_PROVISIONING_ISSUE_PACKAGE',
    entity: 'ops.provisioning_package',
  })
  async issueProvisioningPackage(
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('issue', request, {
        body,
        ifMatch,
        idempotencyKey,
      }),
    );
  }
  @Post('packages/:id/receipts')
  @Action('record-provisioning-receipt')
  @NoIdempotent()
  @Audit({
    action: 'OPS_PROVISIONING_RECORD_RECEIPT',
    entity: 'ops.provisioning_receipt',
  })
  async recordProvisioningReceipt(
    @Param('id') packageId: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('receipt', request, {
        packageId,
        body,
        ifMatch,
        idempotencyKey,
      }),
    );
  }
  @Post('grants/:id/revoke')
  @Action('revoke-offline-grant')
  @NoIdempotent()
  @HttpCode(200)
  @Audit({
    action: 'OPS_PROVISIONING_REVOKE_GRANT',
    entity: 'ops.device_revocation',
  })
  async revokeOfflineGrant(
    @Param('id') grantId: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('revoke', request, {
        grantId,
        body,
        ifMatch,
        idempotencyKey,
      }),
    );
  }
  @Post('grants/:id/reconcile')
  @Action('reconcile-offline-grant')
  @NoIdempotent()
  @HttpCode(200)
  @Audit({
    action: 'OPS_PROVISIONING_RECONCILE_GRANT',
    entity: 'ops.offline_authorization_grant',
  })
  async reconcileOfflineGrant(
    @Param('id') grantId: string,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('reconcile', request, {
        grantId,
        body,
        ifMatch,
        idempotencyKey,
      }),
    );
  }
  @Get('packages/:id/content')
  @Action('download-provisioning-package')
  @NoIdempotent()
  async downloadProvisioningPackage(
    @Param('id') packageId: string,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('download', request, { packageId }),
    );
  }
  @Get('devices/:deviceId/readiness')
  @Action('readiness')
  @NoIdempotent()
  async readiness(
    @Param('deviceId') deviceId: string,
    @Req() request: RequestLike,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    return this.reply(
      response,
      await this.runtime.execute('readiness', request, { deviceId }),
    );
  }
  private reply(response: HeaderResponse, result: ProvisioningResult) {
    response.setHeader('ETag', result.etag);
    return result.body;
  }
}
