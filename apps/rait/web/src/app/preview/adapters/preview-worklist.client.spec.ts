// Article7 Inspector: approved A2 limitation is shared by preview/read aliases.
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
