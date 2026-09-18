// R-0014 TASK-0008 (Inspector). `core/session.facade.ts` ganha o `SessionFacade` completo do
// §4 do contrato CTG-0003a (TASK-0009, Engineer): `account` (hoje privado), `representations`,
// `loading`, `loadError`, `load()` (renomeia `loadAccount()`, [DIVERGE-19]), `requirementFor()`,
// `canPerform()`, `requestElevation()`, `completeElevation()`. A classe `PortalSessionFacade`
// já existe; o spec injeta a instância real e tipa contra `PortalSessionFacadeContract`
// (`src/testing/contract-types.ts`) com `as unknown as`, evitando os erros de acesso a membro
// privado/inexistente (TS2341/TS2339) que uma referência direta produziria (arquivo "(altera)"
// do §1; ver relatório de entrega). Em runtime, os métodos novos não existem: as chamadas
// lançam "is not a function" — falha esperada até TASK-0009. `StynxSessionService` e
// `PortalClient` são substituídos por stubs (prompt: "PortalSessionFacade com
// StynxSessionService e PortalClient stubs"); `ResumeService`/`OfflineDocumentStore` reais
// (já funcionam) com espiões.
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { OfflineDocumentStore } from './offline-document.store';
import { PortalSessionFacade } from './session.facade';
import { PortalClient } from '../data/portal.client';
import { ResumeService } from './resume.service';
import type { PortalSessionFacadeContract } from '../../testing/contract-types';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { ME_RESPONSE_FIXTURE } from '../../testing/http-fixtures';

function setup(claims: Record<string, unknown> | null = null) {
  const stynxStub = createStynxSessionStub({ active: false, claims });
  const meMock = vi.fn<
    (...args: unknown[]) => Promise<typeof ME_RESPONSE_FIXTURE>
  >(async () => ME_RESPONSE_FIXTURE);
  const elevateAssuranceMock = vi.fn<
    (...args: unknown[]) => Promise<{
      body: { redirectUrl: string; resumeToken: string; elevationId: string };
      etag: string | null;
    }>
  >(async () => ({
    body: {
      redirectUrl: 'https://sso.gov.br/authorize?fixture=1',
      resumeToken: 'resume-token-fixture',
      elevationId: 'elevation-fixture',
    },
    etag: null,
  }));
  const completeElevationMock = vi.fn<
    (...args: unknown[]) => Promise<{
      body: { assuranceLevel: 'avancada' };
      etag: string | null;
    }>
  >(async () => ({
    body: { assuranceLevel: 'avancada' as const },
    etag: null,
  }));
  const clientStub = {
    me: meMock,
    brand: vi.fn(),
    services: vi.fn(),
    entitledResource: vi.fn(),
    elevateAssurance: elevateAssuranceMock,
    completeElevation: completeElevationMock,
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: StynxSessionService, useValue: stynxStub },
      { provide: PortalClient, useValue: clientStub },
    ],
  });
  const facade = TestBed.inject(
    PortalSessionFacade,
  ) as unknown as PortalSessionFacadeContract;
  const resumeService = TestBed.inject(ResumeService);
  const offlineStore = TestBed.inject(OfflineDocumentStore);
  return {
    facade,
    stynxStub,
    meMock,
    elevateAssuranceMock,
    completeElevationMock,
    resumeService,
    offlineStore,
  };
}

describe('PortalSessionFacade.load()', () => {
  it("dado sessão ativa com claim assurance_level 'simples' e GET me com actRequirements/representations então uma chamada ao client.me(); account() cru; assuranceLevel() do me; actRequirements() e representations() mapeados; representation() null (OD-P48)", async () => {
    // C-3a-38
    const { facade, stynxStub, meMock } = setup({ assurance_level: 'simples' });
    stynxStub.active.set(true);
    await facade.load();
    expect(meMock).toHaveBeenCalledTimes(1);
    expect(facade.account()).toEqual(ME_RESPONSE_FIXTURE);
    expect(facade.assuranceLevel()).toBe('avancada');
    expect(facade.actRequirements()).toEqual([
      { act: 'defesa_previa', level: 'avancada', allowed: true },
      { act: 'consulta_multas', level: 'simples', allowed: false },
    ]);
    expect(facade.representations()).toEqual([
      {
        id: '00000000-0000-7000-8000-000070100001',
        label: 'Cidadã Prata (fixture)',
        scope: 'ait',
        validUntil: '2027-09-14',
      },
    ]);
    expect(facade.representation()).toBeNull();
  });
});

describe('PortalSessionFacade.canPerform() / requirementFor()', () => {
  it('dado actRequirements com defesa_previa allowed true e consulta_multas allowed false então canPerform reflete allowed; ato desconhecido → false/null (spec §3: sem tabela no cliente)', async () => {
    // C-3a-39
    const { facade, stynxStub } = setup();
    stynxStub.active.set(true);
    await facade.load();
    expect(facade.canPerform('defesa_previa')).toBe(true);
    expect(facade.canPerform('consulta_multas')).toBe(false);
    expect(facade.canPerform('inexistente')).toBe(false);
    expect(facade.requirementFor('inexistente')).toBeNull();
  });
});

describe('PortalSessionFacade.requestElevation()', () => {
  it('dado requestElevation então ResumeService.save ANTES do POST; devolve { redirectUrl, resumeToken, elevationId } do cliente', async () => {
    // C-3a-40
    const { facade, resumeService, elevateAssuranceMock } = setup();
    const saveSpy = vi.spyOn(resumeService, 'save');
    const draft = { requestId: 'x' };
    const result = await facade.requestElevation({
      targetLevel: 'avancada',
      method: 'biographic',
      resumeRoute: '/autos/x/defesa/nova',
      draft,
    });
    expect(saveSpy).toHaveBeenCalledWith({
      route: '/autos/x/defesa/nova',
      draft,
    });
    expect(elevateAssuranceMock).toHaveBeenCalled();
    const saveOrder = saveSpy.mock.invocationCallOrder[0];
    const postOrder = elevateAssuranceMock.mock.invocationCallOrder[0];
    expect(saveOrder).toBeLessThan(postOrder);
    expect(result).toEqual({
      redirectUrl: 'https://sso.gov.br/authorize?fixture=1',
      resumeToken: 'resume-token-fixture',
      elevationId: 'elevation-fixture',
    });
  });

  it('dado POST elevations → 422 SERVICE_UNAVAILABLE (elevacao_govbr_pendente_r0014) então requestElevation rejeita e ResumeService.peek() ainda devolve o ponto (nada se perde, [UC-PORTAL-019] 3a)', async () => {
    // C-3a-41
    const { facade, resumeService } = setup();
    const clientStub = TestBed.inject(PortalClient) as unknown as {
      elevateAssurance: ReturnType<typeof vi.fn>;
    };
    clientStub.elevateAssurance.mockRejectedValueOnce(
      new Error('422 PORTAL.SERVICE_UNAVAILABLE'),
    );
    await expect(
      facade.requestElevation({
        targetLevel: 'avancada',
        method: 'biographic',
        resumeRoute: '/autos/x/defesa/nova',
      }),
    ).rejects.toThrow();
    const peekable = resumeService as unknown as {
      peek(): { route: string; draft: unknown } | null;
    };
    expect(peekable.peek()).toEqual({
      route: '/autos/x/defesa/nova',
      draft: null,
    });
  });
});

describe('PortalSessionFacade.completeElevation()', () => {
  it('dado completeElevation(eid, tok) então POST …/eid/complete { resumeToken: tok } seguido de novo GET me; assuranceLevel() reflete o novo me; ResumeService.peek() não consumido', async () => {
    // C-3a-42
    const { facade, stynxStub, meMock, completeElevationMock, resumeService } =
      setup();
    stynxStub.active.set(true);
    await facade.load();
    const peekable = resumeService as unknown as {
      save(point: { route: string; draft: unknown }): void;
      peek(): { route: string; draft: unknown } | null;
    };
    peekable.save({ route: '/autos/x/defesa/nova', draft: null });

    meMock.mockResolvedValueOnce({
      ...ME_RESPONSE_FIXTURE,
      assuranceLevel: 'avancada',
    });
    await facade.completeElevation('elevation-fixture', 'tok');
    expect(completeElevationMock).toHaveBeenCalledWith('elevation-fixture', {
      resumeToken: 'tok',
    });
    expect(meMock).toHaveBeenCalledTimes(2);
    expect(facade.assuranceLevel()).toBe('avancada');
    expect(peekable.peek()).toEqual({
      route: '/autos/x/defesa/nova',
      draft: null,
    });
  });
});

describe('PortalSessionFacade — logout (transição active true → false)', () => {
  it('dado sessão ativa → inativa então account() null e OfflineDocumentStore.clear() chamado uma vez; ResumeService.clear() NÃO chamado (§4)', async () => {
    // C-3a-43
    const { facade, stynxStub, resumeService, offlineStore } = setup();
    const clearOfflineSpy = vi.spyOn(offlineStore, 'clear');
    const clearResumeSpy = vi.spyOn(resumeService, 'clear');
    stynxStub.active.set(true);
    await facade.load();
    stynxStub.active.set(false);
    TestBed.tick();
    expect(facade.account()).toBeNull();
    expect(clearOfflineSpy).toHaveBeenCalledTimes(1);
    expect(clearResumeSpy).not.toHaveBeenCalled();
  });
});

describe('PortalSessionFacade — falha de load()', () => {
  it('dado GET me → 500 então account() null, loadError() { code: PORTAL.INTERNAL }, active() inalterado, assuranceLevel() = claim (guardas continuam a funcionar)', async () => {
    // C-3a-44
    const { facade, stynxStub, meMock } = setup({ assurance_level: 'simples' });
    stynxStub.active.set(true);
    meMock.mockRejectedValueOnce(
      Object.assign(new Error('500'), {
        error: { code: 'PORTAL.INTERNAL', status: 500, message: 'erro' },
        status: 500,
        name: 'HttpErrorResponse',
      }),
    );
    await facade.load();
    expect(facade.account()).toBeNull();
    expect(facade.loadError()).toMatchObject({ code: 'PORTAL.INTERNAL' });
    expect(facade.active()).toBe(true);
    expect(facade.assuranceLevel()).toBe('simples');
  });
});

describe('PortalSessionFacade — loading()', () => {
  it('dado load() em curso então loading() true; ao terminar false', async () => {
    // C-3a-45
    const { facade, meMock } = setup();
    let resolveMe: (value: typeof ME_RESPONSE_FIXTURE) => void = () => {};
    meMock.mockImplementationOnce(
      () =>
        new Promise<typeof ME_RESPONSE_FIXTURE>((resolve) => {
          resolveMe = resolve;
        }),
    );
    const loadPromise = facade.load();
    expect(facade.loading()).toBe(true);
    resolveMe(ME_RESPONSE_FIXTURE);
    await loadPromise;
    expect(facade.loading()).toBe(false);
  });
});
