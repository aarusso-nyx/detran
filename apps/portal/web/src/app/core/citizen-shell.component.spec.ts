// R-0014 TASK-0002 (Inspector). `CitizenShellComponent` (M7/M9 do plan.md;
// portal-frontends.md §5.1): 5 destinos de navegação, rodapé, skip link — todos via chave
// i18n. O texto exato é do Engineer (TASK-0004); aqui só a CHAVE é testada, nunca o texto
// (prompt §Definições que valem como contrato). Usa o `StynxTranslatePipe`/`StynxI18nModule`
// reais (`@stynx-nyx/angular-i18n` 1.3.1) com um catálogo de teste próprio: cada chave
// esperada mapeia para um marcador único, então nenhuma letra deve sobrar fora dos
// marcadores nas landmarks `nav`/`footer` — prova de que nenhum literal escapa do catálogo.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { CitizenShellComponent } from './citizen-shell.component';

const EXPECTED_KEYS = [
  'portal.shell.nav.inicio',
  'portal.shell.nav.autos',
  'portal.shell.nav.processos',
  'portal.shell.nav.atualizacoes',
  'portal.shell.nav.documentos',
  'portal.shell.footer.carta',
  'portal.shell.footer.presencial',
  'portal.shell.footer.acessibilidade',
  'portal.shell.footer.privacidade',
  'portal.a11y.skip_link',
] as const;

function markerFor(key: string): string {
  return `MARCADOR::${key}::FIM`;
}

const TEST_CATALOG: Record<string, string> = Object.fromEntries(
  EXPECTED_KEYS.map((key) => [key, markerFor(key)]),
);

function withoutLetters(text: string): string {
  return EXPECTED_KEYS.reduce(
    (acc, key) => acc.split(markerFor(key)).join(''),
    text,
  );
}

describe('CitizenShellComponent', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        CitizenShellComponent,
        StynxI18nModule.forRoot({
          defaultLocale: 'pt-BR',
          loadCatalog: async () => TEST_CATALOG,
        }),
      ],
      providers: [provideRouter([])],
    });
    await TestBed.inject(StynxI18nService).initialize();
  });

  it('dado o catálogo de teste quando o shell renderiza então os 5 destinos usam portal.shell.nav.{inicio,autos,processos,atualizacoes,documentos}', () => {
    const fixture = TestBed.createComponent(CitizenShellComponent);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav, 'shell sem landmark <nav>').not.toBeNull();
    const navText = nav?.textContent ?? '';
    for (const key of [
      'portal.shell.nav.inicio',
      'portal.shell.nav.autos',
      'portal.shell.nav.processos',
      'portal.shell.nav.atualizacoes',
      'portal.shell.nav.documentos',
    ]) {
      expect(navText).toContain(markerFor(key));
    }
    expect(withoutLetters(navText)).not.toMatch(/\p{L}/u);
  });

  it('dado o catálogo de teste quando o shell renderiza então o rodapé usa portal.shell.footer.{carta,presencial,acessibilidade,privacidade}', () => {
    const fixture = TestBed.createComponent(CitizenShellComponent);
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('footer');
    expect(footer, 'shell sem landmark <footer>').not.toBeNull();
    const footerText = footer?.textContent ?? '';
    for (const key of [
      'portal.shell.footer.carta',
      'portal.shell.footer.presencial',
      'portal.shell.footer.acessibilidade',
      'portal.shell.footer.privacidade',
    ]) {
      expect(footerText).toContain(markerFor(key));
    }
    expect(withoutLetters(footerText)).not.toMatch(/\p{L}/u);
  });

  it('dado o catálogo de teste quando o shell renderiza então o skip link usa portal.a11y.skip_link', () => {
    const fixture = TestBed.createComponent(CitizenShellComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain(markerFor('portal.a11y.skip_link'));
  });
});
