// R-0014 TASK-0017 (Inspector). CTG-0003c §3.8 — `AssinaturaFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9). A navegação em si (`window.location
// .assign`/`router.navigateByUrl`) é da PÁGINA (§3.8: "a facade não toca em window") — reprovada
// em `elevation.page.spec.ts`; aqui prova-se o que a facade calcula e dispara.
import { TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AssinaturaFacade } from './assinatura.facade'; // §9: "Cannot find module" esperado.
import { SessionFacade } from '../../core/session.facade';
import { ResumeService } from '../../core/resume.service';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';

const AIT_FIXED_ID = '00000000-0000-7000-8000-0000f0000002';

function setup(
  options: {
    assuranceLevel?: 'simples' | 'avancada' | 'qualificada' | null;
    requirementFor?: (actKey: string) => { level: string } | null;
  } = {},
) {
  const sessionFacade = createSessionFacadeStub({
    active: true,
    assuranceLevel: options.assuranceLevel ?? 'simples',
  });
  if (options.requirementFor) {
    (sessionFacade as unknown as { requirementFor: unknown }).requirementFor =
      options.requirementFor;
  }
  TestBed.configureTestingModule({
    providers: [
      AssinaturaFacade,
      { provide: SessionFacade, useValue: sessionFacade },
    ],
  });
  return {
    // AssinaturaFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.8).
    facade: TestBed.inject(AssinaturaFacade) as any,
    sessionFacade,
    resumeService: TestBed.inject(ResumeService),
  };
}

describe('AssinaturaFacade — resolveContext() com retomar (T-27; §3.8; M8)', () => {
  it("dado retomar='/autos/…/defesa/nova' com requirementFor(defesa_previa)=avancada e assuranceLevel simples então context = { actKey:defesa_previa, required:avancada, current:simples, sufficient:false }", async () => {
    // C-3c-55
    const { facade } = setup({
      assuranceLevel: 'simples',
      requirementFor: (actKey) =>
        actKey === 'defesa_previa' ? { level: 'avancada' } : null,
    });
    facade.resolveContext(
      convertToParamMap({
        retomar: `/autos/${AIT_FIXED_ID}/defesa/nova`,
      }),
    );
    expect(facade.context()).toEqual(
      expect.objectContaining({
        actKey: 'defesa_previa',
        required: 'avancada',
        current: 'simples',
        sufficient: false,
      }),
    );
  });
});

describe('AssinaturaFacade — resolveContext() sem retomar/ResumePoint (§3.8)', () => {
  it("dado sem retomar e sem ResumePoint então resumeRoute '/inicio' e required 'avancada'", async () => {
    // C-3c-56
    const { facade, resumeService } = setup();
    resumeService.clear();
    facade.resolveContext(convertToParamMap({}));
    expect(facade.context()?.resumeRoute).toBe('/inicio');
    expect(facade.context()?.required).toBe('avancada');
  });
});

describe('AssinaturaFacade — start() (T-27; §3.8; UC-019 3)', () => {
  it("dado start('biometric') então SessionFacade.requestElevation chamado com { targetLevel:avancada, method:biometric, resumeRoute } e phase redirecting", async () => {
    // C-3c-57
    const { facade, sessionFacade } = setup();
    facade.resolveContext(convertToParamMap({ retomar: '/inicio' }));
    await facade.start('biometric');
    expect(sessionFacade.requestElevationMock).toHaveBeenCalledWith(
      expect.objectContaining({ targetLevel: 'avancada', method: 'biometric' }),
    );
    expect(facade.phase()).toBe('redirecting');
    expect(facade.started()?.redirectUrl).toBeTruthy();
  });

  it('dado start com 422 SERVICE_UNAVAILABLE{elevacao_govbr_pendente_r0014} então phase unavailable [negativo: nenhuma navegação simulada]', async () => {
    // C-3c-58
    const { facade, sessionFacade } = setup();
    facade.resolveContext(convertToParamMap({ retomar: '/inicio' }));
    sessionFacade.requestElevationMock.mockRejectedValueOnce(
      Object.assign(new Error('422'), {
        status: 422,
        error: {
          code: 'PORTAL.SERVICE_UNAVAILABLE',
          status: 422,
          message: 'erro',
          context: { unavailableReason: 'elevacao_govbr_pendente_r0014' },
        },
      }),
    );
    await facade.start('biometric');
    expect(facade.phase()).toBe('unavailable');
    expect(facade.started()).toBeNull();
  });
});

describe('AssinaturaFacade — complete() (T-27; §3.8; UC-019 3b/AC-4)', () => {
  it('dado complete(e1,tok) com 400 VALIDATION_FAILED então phase error [negativo: nenhum beco sem saída — context permanece]', async () => {
    // C-3c-59
    const { facade, sessionFacade } = setup();
    facade.resolveContext(convertToParamMap({ retomar: '/inicio' }));
    sessionFacade.completeElevationMock.mockRejectedValueOnce(
      Object.assign(new Error('400'), {
        status: 400,
        error: {
          code: 'PORTAL.VALIDATION_FAILED',
          status: 400,
          message: 'erro',
        },
      }),
    );
    const result = await facade.complete('e1', 'tok');
    expect(result).toBe(false);
    expect(facade.phase()).toBe('error');
    expect(facade.context()).not.toBeNull();
  });

  it('dado complete(e1,tok) com sucesso e ResumePoint então SessionFacade.load() foi chamado, phase done e ResumeService.peek() ainda devolve o ponto (não consumido)', async () => {
    // C-3c-60
    const { facade, sessionFacade, resumeService } = setup();
    resumeService.save({ route: '/autos/x/defesa/nova', draft: null });
    facade.resolveContext(convertToParamMap({ retomar: '/inicio' }));
    const result = await facade.complete('e1', 'tok');
    expect(result).toBe(true);
    expect(sessionFacade.loadMock).toHaveBeenCalled();
    expect(facade.phase()).toBe('done');
    expect(resumeService.peek()).toEqual({
      route: '/autos/x/defesa/nova',
      draft: null,
    });
  });
});

describe('AssinaturaFacade — sufficient (§3.8) [negativo]', () => {
  it('dado assuranceLevel avancada e requirementFor avancada então context.sufficient true', async () => {
    // C-3c-61
    const { facade } = setup({
      assuranceLevel: 'avancada',
      requirementFor: () => ({ level: 'avancada' }),
    });
    facade.resolveContext(
      convertToParamMap({ retomar: `/autos/${AIT_FIXED_ID}/defesa/nova` }),
    );
    expect(facade.context()?.sufficient).toBe(true);
  });
});

async function allFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await allFiles(full)));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

describe('Análise estática — features/assinatura/** sem bronze/prata/ouro fora de i18n (RN-102 a; T27 §10) [negativo]', () => {
  it('dado o código de produção de features/assinatura/** então bronze/prata/ouro não aparecem em código (só em textos i18n, fora deste diretório)', async () => {
    // C-3c-62
    const dir = dirname(fileURLToPath(import.meta.url));
    const files = await allFiles(dir);
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      expect(/\b(bronze|prata|ouro)\b/i.test(source), file).toBe(false);
    }
  });
});
