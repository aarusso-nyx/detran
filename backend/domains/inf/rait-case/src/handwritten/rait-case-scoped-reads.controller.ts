import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Action, Audit, NoIdempotent, Resource } from '@detran/shared';
import {
  RaitCaseScopeService,
  type RaitScopeRequest,
} from './rait-case-scope.service.js';
@Controller('v1/inf/rait')
export class RaitCaseScopedReadsController {
  constructor(private readonly scope: RaitCaseScopeService) {}
  @Get('cases')
  @Resource('inf:rait-case')
  @Action('read')
  listRaitCase(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('cases', undefined, query, request.principal);
  }
  @Get('cases/:id')
  @Resource('inf:rait-case')
  @Action('read')
  getRaitCase(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('cases', id, query, request.principal);
  }
  @Get('parties')
  @Resource('inf:rait-party')
  @Action('read')
  listRaitParty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('parties', undefined, query, request.principal);
  }
  @Post('parties')
  @Resource('inf:rait-party')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_PARTY_CREATE',
    entity: 'inf.rait_party',
  })
  createRaitParty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'parties',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('parties/:id')
  @Resource('inf:rait-party')
  @Action('read')
  getRaitParty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('parties', id, query, request.principal);
  }
  @Patch('parties/:id')
  @Resource('inf:rait-party')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_PARTY_UPDATE',
    entity: 'inf.rait_party',
  })
  updateRaitParty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'parties',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Delete('parties/:id')
  @Resource('inf:rait-party')
  @Action('delete')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_PARTY_DELETE',
    entity: 'inf.rait_party',
  })
  removeRaitParty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'parties',
      id,
      body,
      request.principal,
      true,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('documents')
  @Resource('inf:rait-document')
  @Action('read')
  listRaitDocument(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('documents', undefined, query, request.principal);
  }
  @Post('documents')
  @Resource('inf:rait-document')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DOCUMENT_CREATE',
    entity: 'inf.rait_document',
  })
  createRaitDocument(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'documents',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('documents/:id')
  @Resource('inf:rait-document')
  @Action('read')
  getRaitDocument(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('documents', id, query, request.principal);
  }
  @Patch('documents/:id')
  @Resource('inf:rait-document')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DOCUMENT_UPDATE',
    entity: 'inf.rait_document',
  })
  updateRaitDocument(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'documents',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('pending-contents')
  @Resource('inf:rait-pending-content')
  @Action('read')
  listRaitPendingContent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read(
      'pending-contents',
      undefined,
      query,
      request.principal,
    );
  }
  @Post('pending-contents')
  @Resource('inf:rait-pending-content')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_PENDING_CONTENT_CREATE',
    entity: 'inf.rait_pending_content',
  })
  createRaitPendingContent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'pending-contents',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('pending-contents/:id')
  @Resource('inf:rait-pending-content')
  @Action('read')
  getRaitPendingContent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('pending-contents', id, query, request.principal);
  }
  @Patch('pending-contents/:id')
  @Resource('inf:rait-pending-content')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_PENDING_CONTENT_UPDATE',
    entity: 'inf.rait_pending_content',
  })
  updateRaitPendingContent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'pending-contents',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('redirects')
  @Resource('inf:rait-redirect')
  @Action('read')
  listRaitRedirect(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('redirects', undefined, query, request.principal);
  }
  @Post('redirects')
  @Resource('inf:rait-redirect')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_REDIRECT_CREATE',
    entity: 'inf.rait_redirect',
  })
  createRaitRedirect(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'redirects',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('redirects/:id')
  @Resource('inf:rait-redirect')
  @Action('read')
  getRaitRedirect(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('redirects', id, query, request.principal);
  }
  @Patch('redirects/:id')
  @Resource('inf:rait-redirect')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_REDIRECT_UPDATE',
    entity: 'inf.rait_redirect',
  })
  updateRaitRedirect(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'redirects',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('admissibility')
  @Resource('inf:rait-admissibility')
  @Action('read')
  listRaitAdmissibility(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read(
      'admissibility',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('admissibility/:id')
  @Resource('inf:rait-admissibility')
  @Action('read')
  getRaitAdmissibility(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('admissibility', id, query, request.principal);
  }
  @Get('deadlines')
  @Resource('inf:rait-deadline')
  @Action('read')
  listRaitDeadline(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('deadlines', undefined, query, request.principal);
  }
  @Post('deadlines')
  @Resource('inf:rait-deadline')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DEADLINE_CREATE',
    entity: 'inf.rait_deadline',
  })
  createRaitDeadline(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'deadlines',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('deadlines/:id')
  @Resource('inf:rait-deadline')
  @Action('read')
  getRaitDeadline(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('deadlines', id, query, request.principal);
  }
  @Patch('deadlines/:id')
  @Resource('inf:rait-deadline')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DEADLINE_UPDATE',
    entity: 'inf.rait_deadline',
  })
  updateRaitDeadline(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'deadlines',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('inquiries')
  @Resource('inf:rait-inquiry')
  @Action('read')
  listRaitInquiry(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('inquiries', undefined, query, request.principal);
  }
  @Post('inquiries')
  @Resource('inf:rait-inquiry')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_INQUIRY_CREATE',
    entity: 'inf.rait_inquiry',
  })
  createRaitInquiry(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'inquiries',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('inquiries/:id')
  @Resource('inf:rait-inquiry')
  @Action('read')
  getRaitInquiry(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('inquiries', id, query, request.principal);
  }
  @Patch('inquiries/:id')
  @Resource('inf:rait-inquiry')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_INQUIRY_UPDATE',
    entity: 'inf.rait_inquiry',
  })
  updateRaitInquiry(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'inquiries',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('drafts')
  @Resource('inf:rait-draft')
  @Action('read')
  listRaitDraft(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('drafts', undefined, query, request.principal);
  }
  @Post('drafts')
  @Resource('inf:rait-draft')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DRAFT_CREATE',
    entity: 'inf.rait_draft',
  })
  createRaitDraft(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'drafts',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('drafts/:id')
  @Resource('inf:rait-draft')
  @Action('read')
  getRaitDraft(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('drafts', id, query, request.principal);
  }
  @Patch('drafts/:id')
  @Resource('inf:rait-draft')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DRAFT_UPDATE',
    entity: 'inf.rait_draft',
  })
  updateRaitDraft(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'drafts',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('decisions')
  @Resource('inf:rait-decision')
  @Action('read')
  listRaitDecision(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('decisions', undefined, query, request.principal);
  }
  @Post('decisions')
  @Resource('inf:rait-decision')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DECISION_CREATE',
    entity: 'inf.rait_decision',
  })
  createRaitDecision(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'decisions',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('decisions/:id')
  @Resource('inf:rait-decision')
  @Action('read')
  getRaitDecision(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('decisions', id, query, request.principal);
  }
  @Patch('decisions/:id')
  @Resource('inf:rait-decision')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_DECISION_UPDATE',
    entity: 'inf.rait_decision',
  })
  updateRaitDecision(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'decisions',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('communications')
  @Resource('inf:rait-communication')
  @Action('read')
  listRaitCommunication(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read(
      'communications',
      undefined,
      query,
      request.principal,
    );
  }
  @Post('communications')
  @Resource('inf:rait-communication')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_COMMUNICATION_CREATE',
    entity: 'inf.rait_communication',
  })
  createRaitCommunication(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'communications',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('communications/:id')
  @Resource('inf:rait-communication')
  @Action('read')
  getRaitCommunication(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('communications', id, query, request.principal);
  }
  @Patch('communications/:id')
  @Resource('inf:rait-communication')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_COMMUNICATION_UPDATE',
    entity: 'inf.rait_communication',
  })
  updateRaitCommunication(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'communications',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('events')
  @Resource('inf:rait-case-event')
  @Action('read')
  listRaitCaseEvent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('events', undefined, query, request.principal);
  }
  @Post('events')
  @Resource('inf:rait-case-event')
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_CASE_EVENT_CREATE',
    entity: 'inf.rait_case_event',
  })
  createRaitCaseEvent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
  ) {
    return this.scope.mutate(
      'events',
      undefined,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
  @Get('events/:id')
  @Resource('inf:rait-case-event')
  @Action('read')
  getRaitCaseEvent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('events', id, query, request.principal);
  }
  @Patch('events/:id')
  @Resource('inf:rait-case-event')
  @Action('update')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_CASE_EVENT_UPDATE',
    entity: 'inf.rait_case_event',
  })
  updateRaitCaseEvent(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.mutate(
      'events',
      id,
      body,
      request.principal,
      false,
      request.headers?.['idempotency-key'],
    );
  }
}
