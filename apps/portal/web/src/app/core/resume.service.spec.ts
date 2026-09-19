// R-0014 TASK-0002 (Inspector). `ResumeService` (M7/§5.1 de portal-frontends.md): guarda
// `{ route, draft }` ao redirecionar para elevação ([UC-PORTAL-019] AC-4) e `resume()`
// devolve e limpa (retomada única — não pode ser lida duas vezes).
import { TestBed } from '@angular/core/testing';
import { ResumeService } from './resume.service';
import type { ResumeServiceContract } from '../../testing/contract-types';

describe('ResumeService', () => {
  it('dado route e draft salvos via save() quando resume() é chamado então devolve o mesmo par', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ResumeService);
    service.save({
      route: '/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova',
      draft: { texto: 'rascunho' },
    });
    expect(service.resume()).toEqual({
      route: '/autos/00000000-0000-7000-8000-0000000000aa/defesa/nova',
      draft: { texto: 'rascunho' },
    });
  });

  it('dado um resume salvo quando resume() é chamado então limpa o estado (chamada seguinte devolve null)', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ResumeService);
    service.save({ route: '/sne', draft: null });
    service.resume();
    expect(service.resume()).toBeNull();
  });

  it('dado nenhum resume salvo quando resume() é chamado então devolve null', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ResumeService);
    expect(service.resume()).toBeNull();
  });
});

// R-0014 TASK-0008 (Inspector). `peek()` (novo, [DIVERGE-4]/A6(a) do plan.md): leitura SEM
// consumo — `core/auth-flow.service.ts:38` passa a usá-lo no callback OIDC para não descartar o
// rascunho antes de o wizard retomá-lo ([UC-PORTAL-019] AC-4). `ResumeService` já existe;
// `peek()` ainda não — o spec injeta a instância real e tipa contra `ResumeServiceContract`
// (`src/testing/contract-types.ts`) com `as unknown as`, evitando o TS2339 que uma referência
// direta produziria. Em runtime, `peek` não existe: a chamada lança "is not a function" — falha
// esperada até TASK-0009.
describe('ResumeService.peek() ([DIVERGE-4])', () => {
  it('dado save({ route, draft }) então peek() devolve o ponto sem limpar (duas chamadas iguais); resume() devolve e limpa; peek() depois → null', () => {
    // C-3a-46
    TestBed.configureTestingModule({});
    const service = TestBed.inject(
      ResumeService,
    ) as unknown as ResumeServiceContract;
    service.save({ route: '/sne', draft: { texto: 'rascunho' } });
    expect(service.peek()).toEqual({
      route: '/sne',
      draft: { texto: 'rascunho' },
    });
    expect(service.peek()).toEqual({
      route: '/sne',
      draft: { texto: 'rascunho' },
    });
    expect(service.resume()).toEqual({
      route: '/sne',
      draft: { texto: 'rascunho' },
    });
    expect(service.peek()).toBeNull();
  });
});
