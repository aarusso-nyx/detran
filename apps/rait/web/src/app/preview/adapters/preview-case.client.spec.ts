// Article7 Inspector: S1/A2 preview remains projection-shaped and never writes.
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RaitRoleCode } from '../../app.route-manifest';
import { PreviewFixtureStore } from '../preview-fixtures';
import { RaitHttp } from '../../data/api/rait-http';
import { PreviewCaseClient } from './preview-case.client';
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
async function setup() {
  setPreviewDocument('/painel', 'rait-analyst', 'loaded');
  await configurePreview(previewSpecContext().providers);
  return TestBed.inject(PreviewCaseClient);
}
describe('S1/A2 preview CASE projection boundary', () => {
  it('does not restore storage keys, tenant internals or raw event payload into typed reads', async () => {
    const getList = vi.spyOn(RaitHttp.prototype, 'getList');
    const client = await setup();
    const documents = await client.listRaitDocument();
    expect(documents.items.length).toBeGreaterThan(0);
    for (const document of documents.items)
      for (const field of [
        'tenant_id',
        'storage_key',
        'attached_by',
        'created_at',
        'updated_at',
      ])
        expect(document).not.toHaveProperty(field);
    const events = await client.listRaitCaseEvent();
    expect(events.items.length).toBeGreaterThan(0);
    for (const event of events.items)
      expect(event).not.toHaveProperty('payload');
    expect(getList).not.toHaveBeenCalled();
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});

// T0 access map: unmatched purposes deny; archived reads use S only.
describe('S1 preview purpose regression controls', () => {
  async function asRole(role: RaitRoleCode) {
    setPreviewDocument('/painel', role, 'loaded');
    await configurePreview(previewSpecContext().providers);
    return TestBed.inject(PreviewCaseClient);
  }
  for (const role of [
    'agency-admin',
    'integration-operator',
    'rait-hr',
    'rait-finance',
  ] as const) {
    it(`denies CASE and child reads for unsupported ${role} without HTTP`, async () => {
      const client = await asRole(role);
      for (const page of await Promise.all([
        client.listRaitCase(),
        client.listRaitDocument(),
        client.listRaitParty(),
        client.listRaitPendingContent(),
        client.listRaitRedirect(),
        client.listRaitCaseEvent(),
      ]))
        expect(page.items).toEqual([]);
      const fixture = await TestBed.inject(PreviewFixtureStore).load();
      await expect(client.getRaitCase(fixture.cases[0].id)).rejects.toThrow();
      TestBed.inject(HttpTestingController).expectNone(() => true);
    });
  }
  it('denies unsupported T document, pending-content and linked redirect reads while preserving triage cases', async () => {
    const client = await asRole('rait-analyst');
    const fixtures = await TestBed.inject(PreviewFixtureStore).load();
    const triageIds = new Set(
      fixtures.cases
        .filter((row) =>
          ['PROTOCOLADO', 'TRIAGEM_ADMISSIBILIDADE'].includes(row.state),
        )
        .map((row) => row.id),
    );
    expect(triageIds.size).toBeGreaterThan(0);
    const cases = await client.listRaitCase();
    expect(cases.items.some((row) => triageIds.has(row.id))).toBe(true);
    for (const page of await Promise.all([
      client.listRaitDocument(),
      client.listRaitPendingContent(),
      client.listRaitRedirect(),
    ])) {
      expect(
        page.items.every((row) => !row.case_id || !triageIds.has(row.case_id)),
      ).toBe(true);
    }
    const assignedDocuments = (await client.listRaitDocument()).items;
    expect(assignedDocuments.length).toBeGreaterThan(0);
    for (const row of assignedDocuments) {
      expect(row).toHaveProperty('filename');
      expect(row).not.toHaveProperty('storage_key');
    }
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
  for (const role of ['AUDITOR', 'rait-secretary'] as const) {
    it(`limits archived ${role} reads to S and suppresses third-party children`, async () => {
      const client = await asRole(role);
      const fixtures = await TestBed.inject(PreviewFixtureStore).load();
      const archived = fixtures.cases.find((row) => row.archived);
      expect(archived).toBeDefined();
      if (!archived) throw new Error('Canonical archive fixture missing');
      const row = await client.getRaitCase(archived.id);
      expect(row.id).toBe(archived.id);
      expect(row).not.toHaveProperty('non_admission_reason');
      for (const page of await Promise.all([
        client.listRaitParty(),
        client.listRaitDocument(),
      ]))
        expect(page.items.some((child) => child.case_id === archived.id)).toBe(
          false,
        );
      TestBed.inject(HttpTestingController).expectNone(() => true);
    });
  }
  for (const role of [
    'rait-analyst',
    'rait-coordinator',
    'rait-manager',
    'rait-chair',
    'agency-admin',
  ] as const) {
    it(`does not turn archived ${role} into a procedural grant`, async () => {
      const client = await asRole(role);
      const fixtures = await TestBed.inject(PreviewFixtureStore).load();
      const archived = fixtures.cases.find((row) => row.archived);
      if (!archived) throw new Error('Canonical archive fixture missing');
      await expect(client.getRaitCase(archived.id)).rejects.toThrow();
      TestBed.inject(HttpTestingController).expectNone(() => true);
    });
  }
});
