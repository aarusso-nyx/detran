// R-0014 TASK-0017 (Inspector). CTG-0003c §3.7 — `PrivacidadeFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PrivacidadeFacade } from './privacidade.facade'; // §9: "Cannot find module" esperado.
import { SessionFacade } from '../../core/session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import type { ActRequirement } from '../../../testing/contract-types';
import {
  ME_PAIR3_FIXTURE,
  ME_PAIR3_WITH_DATA_FIXTURE,
} from '../../../testing/http-fixtures-pair3';

function setup(
  account: unknown = ME_PAIR3_FIXTURE,
  actRequirements: readonly ActRequirement[] = [
    {
      act: 'lgpd_declaracao:declaracao_completa',
      level: 'avancada',
      allowed: true,
    },
  ],
) {
  const sessionFacade = createSessionFacadeStub({
    active: true,
    account,
    actRequirements,
  });
  TestBed.configureTestingModule({
    providers: [
      PrivacidadeFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SessionFacade, useValue: sessionFacade },
    ],
  });
  return {
    // A12(h): PrivacidadeFacade já existe (TASK-0018) — tipo real, sem `as any`.
    facade: TestBed.inject(PrivacidadeFacade),
  };
}

describe('PrivacidadeFacade — confirmation() (T-24; §3.7; UC-018 2a)', () => {
  it('dado me com heldDataSummary:[] então confirmation no_data', async () => {
    // C-3c-51 (1.ª parte)
    const { facade } = setup(ME_PAIR3_FIXTURE);
    expect(facade.confirmation()).toBe('no_data');
  });

  it('dado me com heldDataSummary:[{}] então confirmation has_data', async () => {
    // C-3c-51 (2.ª parte)
    const { facade: facadeWithData } = setup(ME_PAIR3_WITH_DATA_FIXTURE);
    expect(facadeWithData.confirmation()).toBe('has_data');
  });
});

describe('PrivacidadeFacade — canRequest() (§3.7; M8; fail-closed)', () => {
  it("dado canRequest('declaracao_completa') sem a chave em actRequirements então false; com { actKey, allowed:true } então true", async () => {
    // C-3c-52
    const { facade } = setup();
    expect(facade.canRequest('correcao')).toBe(false);
    expect(facade.canRequest('declaracao_completa')).toBe(true);
  });

  it('dado só actRequirements[lgpd_declaracao:declaracao_completa] então os quatro escopos (confirmacao/declaracao_completa/correcao/eliminacao) — só declaracao_completa true (A12(c) exaustivo)', async () => {
    // C-3c-52 (exaustivo, ato-suffix)
    const { facade } = setup();
    expect(facade.canRequest('confirmacao')).toBe(false);
    expect(facade.canRequest('declaracao_completa')).toBe(true);
    expect(facade.canRequest('correcao')).toBe(false);
    expect(facade.canRequest('eliminacao')).toBe(false);
  });

  it('dado só actRequirements[lgpd_declaracao] (sem sufixo, ato-base) então só confirmacao true — os demais fail-closed (A12(c) exaustivo)', async () => {
    // C-3c-52 (exaustivo, ato-base)
    const { facade } = setup(ME_PAIR3_FIXTURE, [
      { act: 'lgpd_declaracao', level: 'avancada', allowed: true },
    ]);
    expect(facade.canRequest('confirmacao')).toBe(true);
    expect(facade.canRequest('declaracao_completa')).toBe(false);
    expect(facade.canRequest('correcao')).toBe(false);
    expect(facade.canRequest('eliminacao')).toBe(false);
  });
});
