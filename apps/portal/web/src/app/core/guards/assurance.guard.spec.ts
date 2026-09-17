// R-0014 TASK-0002 (Inspector). `assuranceGuard(level)` isolado (M8): ordem
// `simples < avancada < qualificada`; nunca exige `qualificada` ([RN-PORTAL-101], plan.md M8).
import { TestBed } from '@angular/core/testing';
import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Router, UrlTree } from '@angular/router';
import { assuranceGuard } from './assurance.guard';
import { SessionFacade } from '../session.facade';
import {
  createSessionFacadeStub,
  type AssuranceLevel,
} from '../../../testing/session-facade.stub';

function routerState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

function configure(assuranceLevel: AssuranceLevel | null) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: SessionFacade,
        useValue: createSessionFacadeStub({ active: true, assuranceLevel }),
      },
    ],
  });
}

describe('assuranceGuard', () => {
  it('dado nível simples quando exige avancada então redireciona para /assinatura/elevacao com retomar', () => {
    configure('simples');
    const result = TestBed.runInInjectionContext(() =>
      assuranceGuard('avancada')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova'),
      ),
    );
    expect(result).toBeInstanceOf(UrlTree);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/assinatura/elevacao?retomar=%2Fautos%2F00000000-0000-7000-8000-0000000000aa%2Fdefesa%2Fnova',
    );
  });

  it('dado nível avancada quando exige avancada então permite', () => {
    configure('avancada');
    const result = TestBed.runInInjectionContext(() =>
      assuranceGuard('avancada')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova'),
      ),
    );
    expect(result).toBe(true);
  });

  it('dado nível qualificada quando exige avancada então permite (nunca bloqueada)', () => {
    configure('qualificada');
    const result = TestBed.runInInjectionContext(() =>
      assuranceGuard('avancada')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova'),
      ),
    );
    expect(result).toBe(true);
  });

  it('dado nível simples quando exige simples então permite', () => {
    configure('simples');
    const result = TestBed.runInInjectionContext(() =>
      assuranceGuard('simples')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos'),
      ),
    );
    expect(result).toBe(true);
  });

  it('dado sessão sem nível (null) quando exige simples então redireciona para elevação', () => {
    configure(null);
    const result = TestBed.runInInjectionContext(() =>
      assuranceGuard('simples')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos'),
      ),
    );
    expect(result).toBeInstanceOf(UrlTree);
  });
});
