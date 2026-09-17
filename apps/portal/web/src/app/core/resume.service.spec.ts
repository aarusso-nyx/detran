// R-0014 TASK-0002 (Inspector). `ResumeService` (M7/§5.1 de portal-frontends.md): guarda
// `{ route, draft }` ao redirecionar para elevação ([UC-PORTAL-019] AC-4) e `resume()`
// devolve e limpa (retomada única — não pode ser lida duas vezes).
import { TestBed } from '@angular/core/testing';
import { ResumeService } from './resume.service';

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
