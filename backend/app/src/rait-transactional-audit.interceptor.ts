import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuditInterceptor } from '@stynx-nyx/backend';
import { DetranError } from '@detran/shared';
import { catchError, type Observable, throwError } from 'rxjs';

import {
  RaitCaseCommandsController,
  RaitInquiryCommandsController,
} from '@detran/inf-rait-case';

import { asDetranHttpException } from './detran-error.filter.js';

type Handler = (...args: never[]) => unknown;

const TRANSACTIONALLY_AUDITED = new Map<object, ReadonlySet<Handler>>([
  [
    RaitCaseCommandsController,
    new Set<Handler>([
      RaitCaseCommandsController.prototype.protocol,
      RaitCaseCommandsController.prototype.admit,
      RaitCaseCommandsController.prototype.nonAdmission,
      RaitCaseCommandsController.prototype.remit,
      RaitCaseCommandsController.prototype.receive,
      RaitCaseCommandsController.prototype.ready,
      RaitCaseCommandsController.prototype.decide,
      RaitCaseCommandsController.prototype.returnDraft,
      RaitCaseCommandsController.prototype.withdraw,
      RaitCaseCommandsController.prototype.redirect,
      RaitCaseCommandsController.prototype.resolvePending,
      RaitCaseCommandsController.prototype.claimNext,
    ]),
  ],
  [
    RaitInquiryCommandsController,
    new Set<Handler>([
      RaitInquiryCommandsController.prototype.answer,
      RaitInquiryCommandsController.prototype.extend,
      RaitInquiryCommandsController.prototype.expire,
    ]),
  ],
]);

const WORKLIST_TRANSACTIONAL_HANDLERS = new Set([
  'createSchedule',
  'publishSchedule',
  'createBatch',
  'approveBatch',
  'acceptBatchItem',
  'declareBatchItemImpediment',
  'draw',
  'reassign',
]);

const SESSION_AGENDA_TRANSACTIONAL_HANDLERS = new Set([
  'closeAgenda',
  'open',
  'adjourn',
  'conveneExtraordinary',
  'read',
  'view',
  'withdraw',
  'createVote',
  'proclaim',
  'createMinutes',
  'signMinutes',
  'publish',
]);

function isWorklistTransactionalCommand(context: ExecutionContext): boolean {
  const controller = context.getClass();
  const handler = context.getHandler() as Handler;
  return (
    controller?.name === 'RaitWorklistCommandsController' &&
    WORKLIST_TRANSACTIONAL_HANDLERS.has(handler.name)
  );
}

function isSessionAgendaTransactionalCommand(
  context: ExecutionContext,
): boolean {
  const controller = context.getClass();
  const handler = context.getHandler() as Handler;
  return (
    controller?.name === 'RaitSessionCommandsController' &&
    SESSION_AGENDA_TRANSACTIONAL_HANDLERS.has(handler.name)
  );
}

@Injectable()
export class RaitTransactionalAuditInterceptor implements NestInterceptor {
  constructor(private readonly delegate: AuditInterceptor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handlers = TRANSACTIONALLY_AUDITED.get(context.getClass());
    if (
      handlers?.has(context.getHandler() as Handler) ||
      isWorklistTransactionalCommand(context) ||
      isSessionAgendaTransactionalCommand(context)
    )
      return next
        .handle()
        .pipe(
          catchError((error: unknown) =>
            throwError(() =>
              error instanceof DetranError
                ? asDetranHttpException(error)
                : error,
            ),
          ),
        );
    return this.delegate.intercept(context, next);
  }
}
