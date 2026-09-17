// R-0014 TASK-0002 (Inspector). `entitlementGuard(kind)` isolado (M8): id vem do parâmetro
// de rota indicado pelo manifesto (`:aitId` para `kind: 'ait'`); falso → redireciona para
// `/vinculo/por-que-nao-vejo?recurso=<kind>&id=<id>`.
import { TestBed } from '@angular/core/testing';
import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { convertToParamMap, Router, UrlTree } from '@angular/router';
import { entitlementGuard } from './entitlement.guard';
import { EntitlementFacade } from '../entitlement.facade';
import { createEntitlementFacadeStub } from '../../../testing/entitlement-facade.stub';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function routeSnapshot(aitId: string): ActivatedRouteSnapshot {
  return {
    paramMap: convertToParamMap({ aitId }),
  } as ActivatedRouteSnapshot;
}

function routerState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('entitlementGuard', () => {
  it('dado vínculo negado (check=false) quando ativa o guarda então redireciona para por-que-nao-vejo com recurso e id', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EntitlementFacade,
          useValue: createEntitlementFacadeStub(false),
        },
      ],
    });
    const url = `/autos/${FIXED_ENTITY_ID}`;
    const resultPromise = TestBed.runInInjectionContext(() =>
      entitlementGuard('ait')(routeSnapshot(FIXED_ENTITY_ID), routerState(url)),
    );
    return Promise.resolve(resultPromise).then((result) => {
      expect(result).toBeInstanceOf(UrlTree);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl(result as UrlTree)).toBe(
        `/vinculo/por-que-nao-vejo?recurso=ait&id=${FIXED_ENTITY_ID}`,
      );
    });
  });

  it('dado vínculo confirmado (check=true) quando ativa o guarda então permite', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EntitlementFacade,
          useValue: createEntitlementFacadeStub(true),
        },
      ],
    });
    const url = `/autos/${FIXED_ENTITY_ID}`;
    const result = await TestBed.runInInjectionContext(() =>
      entitlementGuard('ait')(routeSnapshot(FIXED_ENTITY_ID), routerState(url)),
    );
    expect(result).toBe(true);
  });
});
