// R-0014 TASK-0002 (Inspector). `portalAuthGuard` isolado (M7/M8 do plan.md). A cobertura
// presença × ausência por rota do manifesto completo está em `app.guards-matrix.spec.ts`;
// aqui só o comportamento do guarda em si, injeção mínima.
import { TestBed } from '@angular/core/testing';
import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Router, UrlTree } from '@angular/router';
import { portalAuthGuard } from './auth.guard';
import { SessionFacade } from '../session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';

function routerState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('portalAuthGuard', () => {
  it('dado sessão inativa quando ativa o guarda então redireciona para / com retomar=url', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionFacade,
          useValue: createSessionFacadeStub({ active: false }),
        },
      ],
    });
    const result = TestBed.runInInjectionContext(() =>
      portalAuthGuard({} as ActivatedRouteSnapshot, routerState('/autos')),
    );
    expect(result).toBeInstanceOf(UrlTree);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe('/?retomar=%2Fautos');
  });

  it('dado sessão ativa quando ativa o guarda então permite a navegação', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionFacade,
          useValue: createSessionFacadeStub({ active: true }),
        },
      ],
    });
    const result = TestBed.runInInjectionContext(() =>
      portalAuthGuard({} as ActivatedRouteSnapshot, routerState('/autos')),
    );
    expect(result).toBe(true);
  });
});
