// R-0014 TASK-0002 (Inspector, iteração 2 — adenda A1). `BrandService` (M7/§5.1 de
// portal-frontends.md): `GET /v1/portal/brand` ok → marca; erro → estado `unavailable` com
// marca neutra (`portal.shell.brand.neutral`, namespace mínimo M9) sem lançar.
// `provideHttpClientTesting`. Corpo de sucesso = contrato real (`portal-route-contract.md`
// §2: `platform.tenant_brand_profile`) — `{ displayName, shortName, legalName, primaryColor,
// supportUrl, privacyUrl, accessibilityUrl, serviceContact, locale, timeZone }`; não há
// `logoUrl` (OD-P47 proposta, sem chave até decisão). `state()` segue `core/brand.service.ts`
// (`AvailableBrand`): `name` = `displayName`, sem `logoUrl`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { BrandService } from './brand.service';

describe('BrandService', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      service: TestBed.inject(BrandService),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('dado GET /v1/portal/brand com sucesso quando load() é chamado então marca o estado com a marca recebida', async () => {
    const { service, httpMock } = setup();
    const loadPromise = service.load();
    const request = httpMock.expectOne('/v1/portal/brand');
    expect(request.request.method).toBe('GET');
    request.flush({
      displayName: 'DETRAN Exemplo',
      shortName: 'DETRAN',
      legalName: 'Departamento Estadual de Trânsito Exemplo',
      primaryColor: '#0B5FFF',
      supportUrl: 'https://exemplo.detran.gov.br/atendimento',
      privacyUrl: 'https://exemplo.detran.gov.br/privacidade',
      accessibilityUrl: 'https://exemplo.detran.gov.br/acessibilidade',
      serviceContact: 'atendimento@exemplo.detran.gov.br',
      locale: 'pt-BR',
      timeZone: 'America/Sao_Paulo',
    });
    await loadPromise;
    expect(service.state()).toEqual({
      status: 'available',
      name: 'DETRAN Exemplo',
      supportUrl: 'https://exemplo.detran.gov.br/atendimento',
      privacyUrl: 'https://exemplo.detran.gov.br/privacidade',
      accessibilityUrl: 'https://exemplo.detran.gov.br/acessibilidade',
      primaryColor: '#0B5FFF',
    });
  });

  it('dado GET /v1/portal/brand com erro quando load() é chamado então não lança e cai em estado unavailable com marca neutra', async () => {
    const { service, httpMock } = setup();
    const loadPromise = service.load();
    const request = httpMock.expectOne('/v1/portal/brand');
    request.flush('erro', { status: 500, statusText: 'Internal Server Error' });
    await expect(loadPromise).resolves.not.toThrow();
    expect(service.state()).toEqual({
      status: 'unavailable',
      neutralLabelKey: 'portal.shell.brand.neutral',
    });
  });
});
