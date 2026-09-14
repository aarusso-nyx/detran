import { Body, Controller, Headers, Param, Put, Res } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import {
  OpsParameterService,
  type ParameterPutInput,
} from './parameter.service.js';

interface ResponseHeaders {
  setHeader(name: string, value: string): unknown;
}

@Controller('v1/ops/parameters')
@Resource('ops:parameter')
export class ParameterCommandController {
  constructor(private readonly service: OpsParameterService) {}

  @Put(':key')
  @Action('update')
  @Audit({ action: 'OPS_PARAMETER_UPDATE', entity: 'ops.parameter' })
  async update(
    @Param('key') key: string,
    @Body() body: ParameterPutInput,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) response: ResponseHeaders,
  ) {
    const result = await this.service.put(key, body, {
      ifMatch,
      idempotencyKey,
    });
    response.setHeader('ETag', `"${result.version}"`);
    return result;
  }
}
