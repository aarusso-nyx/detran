// R-0014 TASK-0008 (Inspector). `shared/alternative-channel-note.component.ts` (novo, contrato
// CTG-0003a §5.10) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato). `BrandService.AvailableBrand` ganha `serviceContact`
// ([DIVERGE-9]) — o stub do `state()` já antecipa o campo novo.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { BrandService, NEUTRAL_BRAND } from '../core/brand.service';
import { AlternativeChannelNoteComponent } from './alternative-channel-note.component';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

function brandStub(state: unknown) {
  return {
    state: () => state,
    available: () => (state as { status: string }).status === 'available',
    load: vi.fn(),
  };
}

async function setup(brand: unknown) {
  await TestBed.configureTestingModule({
    imports: [
      AlternativeChannelNoteComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [{ provide: BrandService, useValue: brandStub(brand) }],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(AlternativeChannelNoteComponent);
}

describe('AlternativeChannelNoteComponent — marca disponível', () => {
  it('dado brand available com serviceContact e note então rótulo alternative_channel, link presencial com href supportUrl, note e serviceContact renderizados; data-service-key quando dado', async () => {
    // C-3a-84
    const fixture = await setup({
      status: 'available',
      name: 'DETRAN Exemplo',
      supportUrl: 'https://exemplo.detran.gov.br/atendimento',
      serviceContact: 'ouvidoria@detran-am.fixtures.invalid',
    });
    fixture.componentRef.setInput(
      'note',
      'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
    );
    fixture.componentRef.setInput('serviceKey', 'defesa_previa');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(
      catalog['portal.common.label.alternative_channel'],
    );
    const link = host.querySelector('a[href]');
    expect(link?.getAttribute('href')).toBe(
      'https://exemplo.detran.gov.br/atendimento',
    );
    expect(link?.textContent).toContain(
      catalog['portal.common.link.presencial'],
    );
    expect(host.textContent).toContain('Atendimento presencial');
    expect(host.textContent).toContain('ouvidoria@detran-am.fixtures.invalid');
    expect(host.getAttribute('data-service-key')).toBe('defesa_previa');
  });
});

describe('AlternativeChannelNoteComponent — marca indisponível', () => {
  it('dado brand NEUTRAL_BRAND e note null então rótulo e link (sem href) ainda renderizados — o canal nunca desaparece ([RN-PORTAL-105]); nenhum endereço/horário inventado (OD-P57)', async () => {
    // C-3a-85
    const fixture = await setup(NEUTRAL_BRAND);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(
      catalog['portal.common.label.alternative_channel'],
    );
    expect(host.textContent).toContain(
      catalog['portal.common.link.presencial'],
    );
    const link = host.querySelector('a');
    expect(link?.hasAttribute('href')).toBe(false);
    expect(host.textContent).not.toMatch(/\d{2}:\d{2}/); // sem horário inventado
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('AlternativeChannelNoteComponent — a11y (C-3a-99)', () => {
  it('dado marca disponível (com note/serviceContact) então nenhuma violação axe serious/critical', async () => {
    const fixture = await setup({
      status: 'available',
      name: 'DETRAN Exemplo',
      supportUrl: 'https://exemplo.detran.gov.br/atendimento',
      serviceContact: 'ouvidoria@detran-am.fixtures.invalid',
    });
    fixture.componentRef.setInput(
      'note',
      'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
    );
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado marca indisponível (NEUTRAL_BRAND, sem href) então nenhuma violação axe serious/critical', async () => {
    const fixture = await setup(NEUTRAL_BRAND);
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
