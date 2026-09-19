// R-0014 TASK-0017 (Inspector). CTG-0003c §5.7 — `EvaluationFormComponent`; arquivo inteiramente
// novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { EvaluationFormComponent } from './evaluation-form.component'; // §9.
import {
  EVALUATION_CREATED_FIXTURE,
  REQUEST_ADESAO_SNE_ID,
} from '../../testing/http-fixtures-pair3';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  inputs: {
    scale?: readonly number[] | null;
    status?: string;
    fields?: readonly string[];
    result?: unknown;
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      EvaluationFormComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(EvaluationFormComponent);
  fixture.componentRef.setInput('subjectKind', 'request');
  fixture.componentRef.setInput('subjectId', REQUEST_ADESAO_SNE_ID);
  fixture.componentRef.setInput('scale', inputs.scale ?? null);
  fixture.componentRef.setInput('status', inputs.status ?? 'idle');
  fixture.componentRef.setInput('fields', inputs.fields ?? []);
  fixture.componentRef.setInput('result', inputs.result ?? null);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

const DIMENSIONS = [
  'satisfaction',
  'quality',
  'deadline',
  'clarity',
  'channel',
];

describe('EvaluationFormComponent — escala pendente e aviso de publicação (§5.7; OD-P65)', () => {
  it('dado scale null então cinco <input type=number step=1> sem min/max; publicIndicator visível antes do envio', async () => {
    // C-3c-98 (1.ª parte)
    const { element } = await setup();
    const numberInputs = element.querySelectorAll(
      'input[type="number"][step="1"]',
    );
    expect(numberInputs.length).toBe(5);
    for (const input of Array.from(numberInputs)) {
      expect(input.hasAttribute('min')).toBe(false);
      expect(input.hasAttribute('max')).toBe(false);
    }
    expect(element.textContent).toContain(
      catalog['portal.evaluations.publicIndicator'],
    );
  });

  it('dado scale [1..5] então rádios por dimensão (5 × 5)', async () => {
    // C-3c-98 (2.ª parte)
    const { element: withScale } = await setup({ scale: [1, 2, 3, 4, 5] });
    expect(withScale.querySelectorAll('input[type="radio"]').length).toBe(25);
  });

  it('dado comment não vazio então link abrir manifestação', async () => {
    // C-3c-98 (3.ª parte)
    const { fixture: fixtureComment, element: withComment } = await setup();
    const commentField = withComment.querySelector<HTMLTextAreaElement>(
      'textarea[name="comment"]',
    )!;
    commentField.value = 'comentário de fixture';
    commentField.dispatchEvent(new Event('input', { bubbles: true }));
    fixtureComment.detectChanges();
    expect(
      withComment.querySelector('[data-open-manifestation]'),
    ).not.toBeNull();
  });
});

describe('EvaluationFormComponent — submitted() (§5.7)', () => {
  it('dado submit então submitted emite { subjectKind, subjectId, scores: {5 dimensões}, comment? }', async () => {
    // C-3c-99
    const { fixture, element } = await setup();
    const captured: unknown[] = [];
    (fixture.componentInstance as any).submitted.subscribe((body: unknown) =>
      captured.push(body),
    );
    for (const dimension of DIMENSIONS) {
      const input = element.querySelector<HTMLInputElement>(
        `input[name="scores.${dimension}"]`,
      )!;
      input.value = '5';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const form = element.querySelector('form')!;
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(captured).toHaveLength(1);
    const body = captured[0] as {
      subjectKind: string;
      subjectId: string;
      scores: Record<string, number>;
    };
    expect(body.subjectKind).toBe('request');
    expect(body.subjectId).toBe(REQUEST_ADESAO_SNE_ID);
    for (const dimension of DIMENSIONS) {
      expect(body.scores[dimension]).toBe(5);
    }
  });
});

describe('EvaluationFormComponent — a11y por estado (§7.3)', () => {
  it('dado escala numérica então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado escala de rádios então axe sem violação serious/critical', async () => {
    const { element } = await setup({ scale: [1, 2, 3, 4, 5] });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado resultado publicado então axe sem violação serious/critical', async () => {
    const { element } = await setup({ result: EVALUATION_CREATED_FIXTURE });
    await expectNoSeriousA11yViolations(element);
  });
});
