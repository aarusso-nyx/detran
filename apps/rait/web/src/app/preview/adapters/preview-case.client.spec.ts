// Article7 Inspector: S1/A2 preview remains projection-shaped and never writes.
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
