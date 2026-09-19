// R-0014 TASK-0015 (Inspector). CTG-0003b §3.4 — `PagamentoFacade` (T-13/T-23); arquivo
// inteiramente novo (§1) — "Cannot find module" até TASK-0016 (esperado, §9). Assunção assumida
// de `load()` (mesma nota de `defesa.facade.spec.ts`): `load({ aitId })`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ServiceCatalogFacade } from '../../core/service-catalog.facade';
import { createServiceCatalogFacadeStub } from '../../../testing/service-catalog-facade.stub';
import { PagamentoFacade } from './pagamento.facade';
import {
  AIT_DETAIL_WITH_PAYMENT_FIXTURE,
  AIT_ID,
} from '../../../testing/http-fixtures-reads';

function setup(availability: 'partially_available' | 'unavailable') {
  TestBed.configureTestingModule({
    providers: [
      PagamentoFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: ServiceCatalogFacade,
        useValue: createServiceCatalogFacadeStub({ status: availability }),
      },
    ],
  });
  return {
    // PagamentoFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.4).
    facade: TestBed.inject(PagamentoFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('PagamentoFacade — availability() (T-13/T-23; §3.4)', () => {
  it('dado ServiceCatalogFacade.availability(pagamento) → partially_available então availability() com esse status (a página mostra o banner)', async () => {
    // C-3b-30 (1.ª metade)
    const { facade, httpMock } = setup('partially_available');
    const promise = (
      facade as unknown as {
        load: (params: { aitId: string }) => Promise<void>;
      }
    ).load({ aitId: AIT_ID });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    req.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
    await promise;
    expect(facade.availability()?.status).toBe('partially_available');
  });

  it('dado ServiceCatalogFacade.availability(pagamento) → unavailable então idem (a guarda já redirecionou; a facade não decide)', async () => {
    // C-3b-30 (2.ª metade)
    const { facade, httpMock } = setup('unavailable');
    const promise = (
      facade as unknown as {
        load: (params: { aitId: string }) => Promise<void>;
      }
    ).load({ aitId: AIT_ID });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    req.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
    await promise;
    expect(facade.availability()?.status).toBe('unavailable');
  });
});
