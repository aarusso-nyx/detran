// Article7 Inspector: approved A2 limitation is shared by preview/read aliases.
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RaitRoleCode } from '../../app.route-manifest';
import {
  PreviewFixtureStore,
  type RaitFixturesJson,
} from '../preview-fixtures';
import { RaitHttp } from '../../data/api/rait-http';
import { PreviewWorklistClient } from './preview-worklist.client';
import {
  configurePreview,
  previewSpecContext,
  resetPreviewDocument,
  setPreviewDocument,
} from '../preview.spec-helper';

afterEach(() => {
  vi.restoreAllMocks();
  resetPreviewDocument();
});
describe('S1/A2 preview WORKLIST projection boundary', () => {
  it('batch-item reads do not restore withheld ordering, deadline or acceptance fields and do not perform network writes', async () => {
    const getList = vi.spyOn(RaitHttp.prototype, 'getList');
    setPreviewDocument('/painel', 'rait-secretary', 'loaded');
    await configurePreview(previewSpecContext().providers);
    const page = await TestBed.inject(
      PreviewWorklistClient,
    ).listRaitBatchItem();
    expect(page.items.length).toBeGreaterThan(0);
    for (const row of page.items)
      for (const field of [
        'position',
        'claim_due_on',
        'accepted_at',
        'declined_at',
        'decline_kind',
        'decline_basis',
        'tenant_id',
      ])
        expect(row).not.toHaveProperty(field);
    expect(getList).not.toHaveBeenCalled();
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});

describe('S1 preview WORKLIST purpose regression controls', () => {
  async function asRole(role: RaitRoleCode) {
    setPreviewDocument('/painel', role, 'loaded');
    await configurePreview(previewSpecContext().providers);
    return TestBed.inject(PreviewWorklistClient);
  }
  for (const role of [
    'agency-admin',
    'integration-operator',
    'rait-hr',
    'rait-finance',
  ] as const) {
    it(`denies unsupported ${role} organization and case-linked purposes without HTTP`, async () => {
      const client = await asRole(role);
      for (const page of await Promise.all([
        client.listRaitUnit(),
        client.listRaitPool(),
        client.listRaitAssignment(),
        client.listRaitClock(),
        client.listRaitClockAlert(),
        client.listRaitBatchItem(),
      ]))
        expect(page.items).toEqual([]);
      TestBed.inject(HttpTestingController).expectNone(() => true);
    });
  }
  it('retains legitimate assigned clocks and alerts with qualified clock parents and no tenant data', async () => {
    const client = await asRole('rait-analyst');
    const fixtures = await TestBed.inject(PreviewFixtureStore).load();
    const clocks = await client.listRaitClock();
    const alerts = await client.listRaitClockAlert();
    expect(clocks.items.length).toBeGreaterThan(0);
    expect(alerts.items.length).toBeGreaterThan(0);
    for (const row of alerts.items) {
      const parent = fixtures.clocks.find((clock) => clock.id === row.clock_id);
      expect(parent).toBeDefined();
      expect(clocks.items.some((clock) => clock.id === row.clock_id)).toBe(
        true,
      );
      expect(row).not.toHaveProperty('tenant_id');
    }
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
  it('suppresses orphan clock alerts rather than falling back to an unqualified purpose', async () => {
    setPreviewDocument('/painel', 'rait-secretary', 'loaded');
    await configurePreview(previewSpecContext().providers);
    const fixtures = await TestBed.inject(PreviewFixtureStore).load();
    const client = TestBed.inject(PreviewWorklistClient);
    const orphanId = fixtures.clockAlerts[0].id;
    const orphanFixture: RaitFixturesJson = {
      ...fixtures,
      clocks: fixtures.clocks.filter(
        (clock) => clock.id !== fixtures.clockAlerts[0].clockId,
      ),
    };
    vi.spyOn(TestBed.inject(PreviewFixtureStore), 'load').mockResolvedValue(
      orphanFixture,
    );
    expect(
      (await client.listRaitClockAlert()).items.some(
        (row) => row.id === orphanId,
      ),
    ).toBe(false);
    await expect(client.getRaitClockAlert(orphanId)).rejects.toThrow();
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});
