import { Injectable } from '@nestjs/common';
import { DetranError } from '@detran/shared';
import {
  RaitCaseCommandService,
  type CommandResult,
} from './rait-case-command.service.js';

/** Canonical POST boundary; the parent-case transaction owns context, version and replay. */
@Injectable()
export class RaitAdmissibilityCommandService {
  constructor(private readonly cases: RaitCaseCommandService) {}

  execute(input: {
    payload: Record<string, unknown>;
    headers: Record<string, string>;
  }): Promise<CommandResult> {
    if (
      !input.payload ||
      Array.isArray(input.payload) ||
      typeof input.payload.case_id !== 'string'
    ) {
      throw new DetranError('RAIT.VALIDATION_FAILED', {
        status: 400,
        messageKey: 'rait.errors.validation_failed',
        message: 'O comando não pode ser executado.',
      });
    }
    return this.cases.execute({
      command: 'save-admissibility',
      targetId: input.payload.case_id,
      payload: input.payload,
      headers: input.headers,
    });
  }
}
