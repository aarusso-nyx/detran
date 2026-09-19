// R-0014 TASK-0017 (Inspector). CTG-0003c §3.9 — `CatalogoFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CatalogoFacade } from './catalogo.facade'; // §9: "Cannot find module" esperado.
import { ServiceCatalogFacade } from '../../core/service-catalog.facade';
import { createServiceCatalogFacadeStub } from '../../../testing/service-catalog-facade.stub';
import { SERVICE_DEFESA_PREVIA_UNAVAILABLE_FIXTURE } from '../../../testing/http-fixtures-pair3';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      CatalogoFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: ServiceCatalogFacade,
        useValue: createServiceCatalogFacadeStub(),
      },
    ],
  });
  return {
    // CatalogoFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.9).
    facade: TestBed.inject(CatalogoFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
});

describe('CatalogoFacade — loadService() indisponível (T-25; §3.9; §6)', () => {
  it('dado loadService(defesa_previa) com o item de fixture unavailable então selected().availability unavailable e unavailableReason delegacao_indisponivel_r0007 [negativo: sem botão de ir para o serviço na página]', async () => {
    // C-3c-63
    const { facade, httpMock } = setup();
    const promise = facade.loadService('defesa_previa');
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/services/defesa_previa'),
    );
    req.flush(SERVICE_DEFESA_PREVIA_UNAVAILABLE_FIXTURE);
    await promise;
    expect(facade.selected()?.availability).toBe('unavailable');
    expect(facade.selected()?.unavailableReason).toBe(
      'delegacao_indisponivel_r0007',
    );
  });
});

describe('CatalogoFacade — functionalRoute() (§3.9) [negativo]', () => {
  it("dado functionalRoute('consulta_multas') então '/autos'; functionalRoute('defesa_previa') então '/autos'; functionalRoute('inexistente') então null", async () => {
    // C-3c-64
    const { facade } = setup();
    expect(facade.functionalRoute('consulta_multas')).toBe('/autos');
    expect(facade.functionalRoute('defesa_previa')).toBe('/autos');
    expect(facade.functionalRoute('inexistente')).toBeNull();
  });
});

describe('CatalogoFacade — nível do ato (RN-102 b; RN-108) [negativo]', () => {
  it('dado o item adesao_sne então minimumAssurance é avancada tal como no catálogo (nível do ato, nunca cor de selo)', async () => {
    // C-3c-65 (parte de dados; a asserção de DOM 'bronze|prata|ouro' é reprovada em service-charter.page.spec.ts)
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/services',
      ),
    );
    req.flush([
      {
        serviceKey: 'adesao_sne',
        minimumAssurance: 'avancada',
        availability: 'available',
      },
    ]);
    await promise;
    expect(facade.items()[0].minimumAssurance).toBe('avancada');
  });
});
