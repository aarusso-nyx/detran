// R-0014 TASK-0017 (Inspector). CTG-0003c §5.3 — `DigitalDocumentCardComponent`; arquivo
// inteiramente novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { DigitalDocumentCardComponent } from './digital-document-card.component'; // §9.
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  inputs: {
    kind?: 'cnh-e' | 'crlv-e';
    category?: 'A' | 'C';
    qrVerification?: string | null;
    validUntil?: string | null;
    cachedAt?: string | null;
    offline?: boolean;
    source?: string | null;
    fields?: readonly {
      readonly labelKey: string;
      readonly value: string | null;
      readonly token?: string;
    }[];
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      DigitalDocumentCardComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(DigitalDocumentCardComponent);
  fixture.componentRef.setInput('kind', inputs.kind ?? 'cnh-e');
  fixture.componentRef.setInput('category', inputs.category ?? 'C');
  fixture.componentRef.setInput(
    'qrVerification',
    inputs.qrVerification ?? null,
  );
  fixture.componentRef.setInput('validUntil', inputs.validUntil ?? null);
  fixture.componentRef.setInput('cachedAt', inputs.cachedAt ?? null);
  fixture.componentRef.setInput('offline', inputs.offline ?? false);
  fixture.componentRef.setInput('source', inputs.source ?? null);
  fixture.componentRef.setInput('fields', inputs.fields ?? []);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('DigitalDocumentCardComponent — categoria A com QR (§5.3 b/c)', () => {
  it('dado category A com qrVerification qr então data-category A, qrVerifiable, notCopy e os botões baixar/compartilhar/imprimir', async () => {
    // C-3c-89 (1.ª metade)
    const { element } = await setup({
      kind: 'cnh-e',
      category: 'A',
      qrVerification: 'qr-fixture',
    });
    expect(element.getAttribute('data-category')).toBe('A');
    expect(element.textContent).toContain(
      catalog['portal.documents.cnh.qrVerifiable'],
    );
    expect(element.textContent).toContain(
      catalog['portal.documents.cnh.notCopy'],
    );
    expect(element.querySelector('[data-download]')).not.toBeNull();
  });

  it('dado category A sem qrVerification então renderiza como C (data-category C) e sem os botões de documento [negativo]', async () => {
    // C-3c-89 (2.ª metade)
    const { element: withoutQr } = await setup({
      kind: 'cnh-e',
      category: 'A',
      qrVerification: null,
    });
    expect(withoutQr.getAttribute('data-category')).toBe('C');
    expect(withoutQr.querySelector('[data-download]')).toBeNull();
  });
});

describe('DigitalDocumentCardComponent — categoria C (§5.3 d/g; RN-115 2; RN-117)', () => {
  it('dado category C com cachedAt então notDocument e consultedAt (prefixo — {consultedAt} é interpolado pelo motor)', async () => {
    // C-3c-90 (1.ª metade)
    const { element } = await setup({
      category: 'C',
      cachedAt: '2026-09-14',
    });
    expect(element.textContent).toContain(
      catalog['portal.documents.consulta.notDocument'],
    );
    const consultedAtPrefix =
      catalog['portal.documents.consulta.consultedAt'].split('{')[0];
    expect(element.textContent).toContain(consultedAtPrefix);
  });

  it('dado category A então o DOM não contém cópia/espelho [negativo]', async () => {
    // C-3c-90 (2.ª metade)
    const { element: categoryA } = await setup({
      category: 'A',
      qrVerification: 'qr',
    });
    const text = categoryA.textContent ?? '';
    expect(/c[óo]pia|espelho/i.test(text)).toBe(false);
  });
});

describe('DigitalDocumentCardComponent — validade como data (§5.3 e; UC-011 AC-2)', () => {
  it('dado validUntil 2031-05-01 então <time datetime="2031-05-01"> com a data formatada', async () => {
    // C-3c-91 (1.ª metade)
    const { element } = await setup({
      category: 'A',
      qrVerification: 'qr',
      validUntil: '2031-05-01',
    });
    const time = element.querySelector('time[datetime="2031-05-01"]');
    expect(time).not.toBeNull();
  });

  it('dado validUntil null então sem elemento <time> [negativo: nunca duração]', async () => {
    // C-3c-91 (2.ª metade)
    const { element: withoutValidity } = await setup({
      category: 'A',
      qrVerification: 'qr',
      validUntil: null,
    });
    expect(withoutValidity.querySelector('time')).toBeNull();
    expect(withoutValidity.textContent).not.toMatch(/\b\d+\s*anos?\b/i);
  });
});

describe('DigitalDocumentCardComponent — a11y por estado (§5.3/§7.3 — cobertura integral)', () => {
  it('dado categoria A com QR então axe sem violação serious/critical', async () => {
    const { element } = await setup({ category: 'A', qrVerification: 'qr' });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado categoria A SEM QR (renderiza como C) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ category: 'A', qrVerification: null });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado categoria C então axe sem violação serious/critical', async () => {
    const { element } = await setup({ category: 'C', cachedAt: '2026-09-14' });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado categoria C com source então axe sem violação serious/critical', async () => {
    const { element } = await setup({
      category: 'C',
      cachedAt: '2026-09-14',
      source: 'RENACH',
    });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado fields[] preenchidos então axe sem violação serious/critical', async () => {
    const { element } = await setup({
      category: 'A',
      qrVerification: 'qr',
      fields: [
        { labelKey: 'portal.documents.cnh.categories', value: 'B', token: 'B' },
      ],
    });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado offline então axe sem violação serious/critical', async () => {
    const { element } = await setup({
      category: 'A',
      qrVerification: 'qr',
      offline: true,
    });
    await expectNoSeriousA11yViolations(element);
  });
});
