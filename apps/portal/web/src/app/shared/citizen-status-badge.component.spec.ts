// R-0014 TASK-0008 (Inspector). `shared/citizen-status-badge.component.ts` (novo, contrato
// CTG-0003a §5.1) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato). Catálogo real (as 5 chaves `portal.situation.badge.*` e as
// 4 `portal.situation.badge_of.*` já existem no catálogo, verificado em
// `src/app/i18n/portal.pt-BR.json`).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import {
  BADGE_SITUATIONS,
  badgeOf,
  CitizenStatusBadgeComponent,
} from './citizen-status-badge.component';

const catalog = portalCatalog as Record<string, string>;

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      CitizenStatusBadgeComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(CitizenStatusBadgeComponent);
}

describe('CitizenStatusBadgeComponent', () => {
  // B6 (iteração 2): um `it` por situação — `setup()` chama `TestBed.configureTestingModule`,
  // que só pode ser reconfigurado depois de `TestBed.resetTestingModule()`; o `afterEach` de
  // `src/test-setup.ts` já faz isso entre `it`s (M3: specs nunca inicializam o ambiente), então
  // um `it.each` evita cinco reconfigurações no mesmo teste.
  it.each(BADGE_SITUATIONS)(
    'dado a situação %s e token EM_ANDAMENTO_NO_ORGAO então texto = portal.situation.badge.<situacao>, data-token e data-situation; o token nunca aparece como texto ([RN-PORTAL-112])',
    async (situation) => {
      // C-3a-47
      const fixture = await setup();
      fixture.componentRef.setInput('situation', situation);
      fixture.componentRef.setInput('token', 'EM_ANDAMENTO_NO_ORGAO');
      fixture.detectChanges();
      const host: HTMLElement = fixture.nativeElement;
      expect(host.getAttribute('data-token')).toBe('EM_ANDAMENTO_NO_ORGAO');
      expect(host.getAttribute('data-situation')).toBe(situation);
      expect(host.textContent).toContain(
        catalog[`portal.situation.badge.${situation}`],
      );
      expect(host.textContent).not.toContain('EM_ANDAMENTO_NO_ORGAO');
      await expectNoSeriousA11yViolations(host);
    },
  );

  it('dado badgeOf então EM_ANDAMENTO_NO_ORGAO→em_analise, RESULTADO_DISPONIVEL→decidido, CONCLUIDO e DESISTIDO→encerrado, PROTOCOLADO→null (OD-P56); nenhuma tabela literal no arquivo além da leitura do catálogo', () => {
    // C-3a-48
    expect(badgeOf('EM_ANDAMENTO_NO_ORGAO')).toBe('em_analise');
    expect(badgeOf('RESULTADO_DISPONIVEL')).toBe('decidido');
    expect(badgeOf('CONCLUIDO')).toBe('encerrado');
    expect(badgeOf('DESISTIDO')).toBe('encerrado');
    expect(badgeOf('PROTOCOLADO')).toBeNull();
  });
});
