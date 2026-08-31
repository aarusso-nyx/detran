import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  BiometricLifecycleService,
  type RecordBiometricCheckInput,
  type RecordFingerConditionInput,
  type RequestBiometricExceptionInput,
} from './biometric-lifecycle.service.js';

interface ExceptionDecisionInput {
  approve: boolean;
  justification?: string;
}

@Controller('v1/ch/biometrics')
@Resource('ch:biometric')
export class BiometricCommandsController {
  constructor(private readonly lifecycle: BiometricLifecycleService) {}

  @Post('checks')
  @Action('capture')
  @Audit({ action: 'CH_BIOMETRIC_CHECK', entity: 'ch.biometric_check' })
  recordCheck(@Body() input: RecordBiometricCheckInput) {
    return this.lifecycle.recordCheck(input);
  }

  @Post('finger-conditions')
  @Action('capture')
  @Audit({
    action: 'CH_BIOMETRIC_FINGER_CONDITION',
    entity: 'ch.biometric_finger_condition',
  })
  recordFingerCondition(@Body() input: RecordFingerConditionInput) {
    return this.lifecycle.recordFingerCondition(input);
  }

  @Post('exceptions')
  @Resource('ch:biometric-exception')
  @Action('request')
  @Audit({
    action: 'CH_BIOMETRIC_EXCEPTION_REQUEST',
    entity: 'ch.biometric_exception',
  })
  requestException(@Body() input: RequestBiometricExceptionInput) {
    return this.lifecycle.requestException(input);
  }

  @Post('exceptions/:id/decision')
  @Resource('ch:biometric-exception')
  @Action('approve')
  @Audit({
    action: 'CH_BIOMETRIC_EXCEPTION_DECIDE',
    entity: 'ch.biometric_exception',
  })
  decideException(
    @Param('id') id: string,
    @Body() input: ExceptionDecisionInput,
  ) {
    return this.lifecycle.decideException(
      id,
      input.approve,
      input.justification,
    );
  }
}
