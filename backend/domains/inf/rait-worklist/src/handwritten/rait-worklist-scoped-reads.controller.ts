import { Body, Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import {
  RaitCaseScopeService,
  type RaitScopeRequest,
} from '@detran/inf-rait-case';
@Controller('v1/inf/rait')
export class RaitWorklistScopedReadsController {
  constructor(private readonly scope: RaitCaseScopeService) {}
  @Get('units')
  @Resource('inf:rait-unit')
  @Action('read')
  listRaitUnit(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'units',
      'rait_unit',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('units/:id')
  @Resource('inf:rait-unit')
  @Action('read')
  getRaitUnit(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'units',
      'rait_unit',
      id,
      query,
      request.principal,
    );
  }
  @Get('pools')
  @Resource('inf:rait-pool')
  @Action('read')
  listRaitPool(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'pools',
      'rait_pool',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('pools/:id')
  @Resource('inf:rait-pool')
  @Action('read')
  getRaitPool(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'pools',
      'rait_pool',
      id,
      query,
      request.principal,
    );
  }
  @Get('pool-members')
  @Resource('inf:rait-pool-member')
  @Action('read')
  listRaitPoolMember(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'pool-members',
      'rait_pool_member',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('pool-members/:id')
  @Resource('inf:rait-pool-member')
  @Action('read')
  getRaitPoolMember(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'pool-members',
      'rait_pool_member',
      id,
      query,
      request.principal,
    );
  }
  @Get('schedules')
  @Resource('inf:rait-schedule')
  @Action('read')
  listRaitSchedule(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'schedules',
      'rait_schedule',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('schedules/:id')
  @Resource('inf:rait-schedule')
  @Action('read')
  getRaitSchedule(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'schedules',
      'rait_schedule',
      id,
      query,
      request.principal,
    );
  }
  @Get('schedule-slots')
  @Resource('inf:rait-schedule-slot')
  @Action('read')
  listRaitScheduleSlot(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'schedule-slots',
      'rait_schedule_slot',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('schedule-slots/:id')
  @Resource('inf:rait-schedule-slot')
  @Action('read')
  getRaitScheduleSlot(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'schedule-slots',
      'rait_schedule_slot',
      id,
      query,
      request.principal,
    );
  }
  @Get('batches')
  @Resource('inf:rait-batch')
  @Action('read')
  listRaitBatch(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'batches',
      'rait_batch',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('batches/:id')
  @Resource('inf:rait-batch')
  @Action('read')
  getRaitBatch(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'batches',
      'rait_batch',
      id,
      query,
      request.principal,
    );
  }
  @Get('batch-items')
  @Resource('inf:rait-batch-item')
  @Action('read')
  listRaitBatchItem(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'batch-items',
      'rait_batch_item',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('batch-items/:id')
  @Resource('inf:rait-batch-item')
  @Action('read')
  getRaitBatchItem(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'batch-items',
      'rait_batch_item',
      id,
      query,
      request.principal,
    );
  }
  @Get('assignments')
  @Resource('inf:rait-assignment')
  @Action('read')
  listRaitAssignment(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('assignments', undefined, query, request.principal);
  }
  @Get('assignments/:id')
  @Resource('inf:rait-assignment')
  @Action('read')
  getRaitAssignment(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('assignments', id, query, request.principal);
  }
  @Get('impediments')
  @Resource('inf:rait-impediment')
  @Action('read')
  listRaitImpediment(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'impediments',
      'rait_impediment',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('impediments/:id')
  @Resource('inf:rait-impediment')
  @Action('read')
  getRaitImpediment(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'impediments',
      'rait_impediment',
      id,
      query,
      request.principal,
    );
  }
  @Get('substitute-duties')
  @Resource('inf:rait-substitute-duty')
  @Action('read')
  listRaitSubstituteDuty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'substitute-duties',
      'rait_substitute_duty',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('substitute-duties/:id')
  @Resource('inf:rait-substitute-duty')
  @Action('read')
  getRaitSubstituteDuty(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'substitute-duties',
      'rait_substitute_duty',
      id,
      query,
      request.principal,
    );
  }
  @Get('benches')
  @Resource('inf:rait-bench')
  @Action('read')
  listRaitBench(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.organizational(
      'benches',
      'rait_bench',
      undefined,
      query,
      request.principal,
    );
  }
  @Get('benches/:id')
  @Resource('inf:rait-bench')
  @Action('read')
  getRaitBench(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.organizational(
      'benches',
      'rait_bench',
      id,
      query,
      request.principal,
    );
  }
  @Get('clocks')
  @Resource('inf:rait-clock')
  @Action('read')
  listRaitClock(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('clocks', undefined, query, request.principal);
  }
  @Get('clocks/:id')
  @Resource('inf:rait-clock')
  @Action('read')
  getRaitClock(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('clocks', id, query, request.principal);
  }
  @Get('clock-alerts')
  @Resource('inf:rait-clock-alert')
  @Action('read')
  listRaitClockAlert(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
  ) {
    return this.scope.read('clock-alerts', undefined, query, request.principal);
  }
  @Get('clock-alerts/:id')
  @Resource('inf:rait-clock-alert')
  @Action('read')
  getRaitClockAlert(
    @Req() request: RaitScopeRequest,
    @Query() query: Record<string, unknown>,
    @Body() body: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.scope.read('clock-alerts', id, query, request.principal);
  }
}
