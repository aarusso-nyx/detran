// R-0014 TASK-0002 (Inspector). `serviceAvailabilityGuard(serviceKey)` isolado (M8):
// `unavailable` → `/servico-indisponivel/<key>`; `partially_available` → permite (a tela
// limita o escopo); nunca 404.
import { TestBed } from '@angular/core/testing';
import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Router, UrlTree } from '@angular/router';
import { serviceAvailabilityGuard } from './service-availability.guard';
import { ServiceCatalogFacade } from '../service-catalog.facade';
import { createServiceCatalogFacadeStub } from '../../../testing/service-catalog-facade.stub';

function routerState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('serviceAvailabilityGuard', () => {
  it('dado serviço indisponível quando ativa o guarda então redireciona para /servico-indisponivel/<key>', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ServiceCatalogFacade,
          useValue: createServiceCatalogFacadeStub({
            status: 'unavailable',
            reason: 'delegacao_indisponivel_r0007',
          }),
        },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      serviceAvailabilityGuard('consulta_multas')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos'),
      ),
    );
    expect(result).toBeInstanceOf(UrlTree);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/servico-indisponivel/consulta_multas',
    );
  });

  it('dado serviço parcialmente disponível quando ativa o guarda então permite', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ServiceCatalogFacade,
          useValue: createServiceCatalogFacadeStub({
            status: 'partially_available',
          }),
        },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      serviceAvailabilityGuard('consulta_multas')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos'),
      ),
    );
    expect(result).toBe(true);
  });

  it('dado serviço disponível quando ativa o guarda então permite', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ServiceCatalogFacade,
          useValue: createServiceCatalogFacadeStub({ status: 'available' }),
        },
      ],
    });
    const result = await TestBed.runInInjectionContext(() =>
      serviceAvailabilityGuard('consulta_multas')(
        {} as ActivatedRouteSnapshot,
        routerState('/autos'),
      ),
    );
    expect(result).toBe(true);
  });
});
