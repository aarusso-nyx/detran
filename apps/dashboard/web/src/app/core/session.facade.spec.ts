// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/session.facade.spec.ts" (C-02-16..18).
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import {
  DashboardSessionFacade,
  StynxDashboardSessionFacade,
  permissionAllows,
  rolesFromClaims,
} from './session.facade.js';
import { createStynxSessionStub } from '../../testing/stynx-session.stub.js';

describe('permissionAllows (policy.ts 1831-1836)', () => {
  it("dado permissions ['*'] quando checado 'dashboard:alert:read' então true (C-02-16)", () => {
    expect(permissionAllows(['*'], 'dashboard:alert:read')).toBe(true);
  });
  it("dado permissions ['dashboard:alert:read'] quando checado a mesma chave então true (C-02-16)", () => {
    expect(
      permissionAllows(['dashboard:alert:read'], 'dashboard:alert:read'),
    ).toBe(true);
  });
  it("dado permissions ['dashboard:alert:*'] quando checado 'dashboard:alert:ack' então true (C-02-16)", () => {
    expect(permissionAllows(['dashboard:alert:*'], 'dashboard:alert:ack')).toBe(
      true,
    );
  });
  it("dado permissions ['dashboard:duty:*'] quando checado 'dashboard:alert:ack' então false (C-02-16)", () => {
    expect(permissionAllows(['dashboard:duty:*'], 'dashboard:alert:ack')).toBe(
      false,
    );
  });
  it('dado permissions [] quando checado qualquer chave então false (C-02-16)', () => {
    expect(permissionAllows([], 'dashboard:alert:read')).toBe(false);
  });
  it("dado permissions ['*'] quando checado uma chave malformada então false (C-02-16)", () => {
    expect(permissionAllows(['*'], 'malformada')).toBe(false);
  });
});

describe('rolesFromClaims (detran-runtime.ts roleClaims)', () => {
  it('dado claims com cognito:groups e roles quando lido então união sem repetição, itens não-string descartados (C-02-17)', () => {
    expect(
      rolesFromClaims({
        'cognito:groups': ['dash-operator', 'x'],
        roles: ['AUDITOR', 'dash-operator', 7],
      }),
    ).toEqual(['dash-operator', 'x', 'AUDITOR']);
  });
  it("dado claims { roles: 'AUDITOR' } (não array) quando lido então [] (C-02-17)", () => {
    expect(rolesFromClaims({ roles: 'AUDITOR' })).toEqual([]);
  });
  it('dado claims null quando lido então [] (C-02-17)', () => {
    expect(rolesFromClaims(null)).toEqual([]);
  });
  it("dado claims { cognito:groups: ['auditor'] } quando lido então ['auditor'] (canonicalização é da facade) (C-02-17)", () => {
    expect(rolesFromClaims({ 'cognito:groups': ['auditor'] })).toEqual([
      'auditor',
    ]);
  });
});

describe('StynxDashboardSessionFacade', () => {
  it("dado o stub com permissions ['dashboard:alert:read'] e claims cognito:groups [auditor, dash-operator] quando lida então active/roles/permissions/layer/can/hasRole batem (C-02-18)", () => {
    const stub = createStynxSessionStub({
      active: true,
      permissions: ['dashboard:alert:read'],
      claims: { 'cognito:groups': ['auditor', 'dash-operator'] },
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: StynxSessionService, useValue: stub },
        {
          provide: DashboardSessionFacade,
          useClass: StynxDashboardSessionFacade,
        },
      ],
    });
    const facade = TestBed.inject(DashboardSessionFacade);
    expect(facade.active()).toBe(true);
    expect([...facade.roles()]).toEqual(['AUDITOR', 'dash-operator']);
    expect([...facade.permissions()]).toEqual(['dashboard:alert:read']);
    expect(facade.layer()).toBe('N2');
    expect(facade.can('dashboard:alert:read')).toBe(true);
    expect(facade.can('dashboard:alert:ack')).toBe(false);
    expect(facade.hasRole('AUDITOR')).toBe(true);

    stub.active.set(false);
    expect(facade.active()).toBe(false);

    stub.state.set({ ...stub.state(), permissions: ['*'] });
    expect(facade.can('dashboard:alert:read')).toBe(true);
    expect(facade.can('dashboard:duty:read')).toBe(true);
  });
});
