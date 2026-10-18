// C-03/C-06: never manufacture a protocol, document, authenticated session, or delegated success.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AIT_ID, REQUEST_COMPOSICAO_ID } from '../../testing/http-fixtures';
import { classifyError } from '../core/error-boundary';
import { PortalClient } from '../data/portal.client';
import { PreviewActionLog } from './preview-action-log';
import { PreviewRootComponent } from './preview-root.component';
import { PreviewPortalClient } from './adapters/portal.client';
import {
  configurePreview,
  expectNoNetwork,
  setPreviewDocument,
} from './preview.spec-helper';

/** Public action names of PortalClient (source contract). No success fixture is ever replayed. */
const ACTIONS = [
  'createRequest',
  'saveDraft',
  'requestAttachmentUpload',
  'uploadToSignedUrl',
  'completeAttachment',
  'submitRequest',
  'withdrawRequest',
  'respondDiligence',
  'elevateAssurance',
  'completeElevation',
  'downloadReceipt',
  'markInboxRead',
  'enrollSne',
  'cancelSne',
  'createPushSubscription',
  'updatePreferences',
  'downloadCnhDocument',
  'issueCrlv',
  'createManifestation',
  'acknowledgeManifestation',
  'createEvaluation',
] as const;

describe('C-03 — every Portal action remains nonfunctional', () => {
  for (const method of ACTIONS) {
    it(`${method}: override, rejection and visible status notice, no HTTP or simulated success`, async () => {
      setPreviewDocument('/autos');
      await configurePreview();
      const fixture = TestBed.createComponent(PreviewRootComponent);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const client = TestBed.inject(PortalClient);
      expect(client).toBeInstanceOf(PreviewPortalClient);
      expect(client).toBeInstanceOf(PortalClient);
      expect(Object.hasOwn(PreviewPortalClient.prototype, method)).toBe(true);
      const log = TestBed.inject(PreviewActionLog);
      const before = log.entries().length;
      const callable = client as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const outcome = callable[method](
        REQUEST_COMPOSICAO_ID,
        'defesa_previa',
        AIT_ID,
        {},
        null,
      );
      await expect(outcome).rejects.toBeDefined();
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(log.entries().length).toBe(before + 1);
        expect(log.entries().at(-1)?.command).toBeTruthy();
        const statuses = [
          ...(fixture.nativeElement as HTMLElement).querySelectorAll(
            '[role="status"]',
          ),
        ];
        expect(
          statuses.some((node) =>
            /não funcional na prévia/i.test(node.textContent ?? ''),
          ),
        ).toBe(true);
      });
      expectNoNetwork();
    });
  }
  for (const serviceKey of [
    'defesa_previa',
    'recurso_jari',
    'recurso_cetran',
  ]) {
    it(`${serviceKey}: disabled delegation keeps SERVICE_UNAVAILABLE and never emits a protocol`, async () => {
      setPreviewDocument('/autos');
      await configurePreview();
      const client = TestBed.inject(PortalClient);
      const error = await client
        .createRequest({
          serviceKey,
          channel: 'portal',
          targetKind: 'ait',
          targetId: AIT_ID,
        })
        .catch((failure: unknown) => failure);
      expect(classifyError(error)).toMatchObject({
        code: 'PORTAL.SERVICE_UNAVAILABLE',
        status: 422,
      });
      expect(classifyError(error).context['unavailableReason']).toBe(
        'delegacao_indisponivel_r0007',
      );
      expect(error).not.toHaveProperty('body.protocol');
      expectNoNetwork();
    });
  }
  it('T-27 real elevation button announces nonfunctionality and remains unavailable', async () => {
    const url = setPreviewDocument('/assinatura/elevacao', 'simples');
    await configurePreview();
    const fixture = TestBed.createComponent(PreviewRootComponent);
    fixture.autoDetectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector<HTMLButtonElement>(
      'portal-elevation-page button[data-method="biometric"]',
    );
    expect(button).not.toBeNull();
    button!.click();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(TestBed.inject(PreviewActionLog).entries().length).toBeGreaterThan(
        0,
      );
      expect(
        root.querySelector('portal-preview-bar [role="status"]')?.textContent,
      ).toMatch(/não funcional na prévia/i);
      expect(
        root.querySelector('portal-elevation-page')?.getAttribute('data-phase'),
      ).toBe('unavailable');
    });
    expect(TestBed.inject(Router).url).toBe(url);
    expectNoNetwork();
  });
});
