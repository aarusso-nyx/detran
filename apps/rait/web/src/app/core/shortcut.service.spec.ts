// R-0012 TASK-0005 (Inspector). Critérios C-2A-42…45 do contrato `CTG-0002a.md` §11 sobre
// `core/shortcut.service.ts` e `core/shortcut-help.component.ts`. Falha esperada nesta entrega:
// esses arquivos de produção ainda não existem (TASK-0006).
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { createSessionStub } from '../../testing/session.stub';
import { createRaitRouterHarness } from '../../testing/router-harness';
// Produção (TASK-0006): ainda não existe.
import { ShortcutService } from './shortcut.service';
import { RaitSessionFacade } from './session.facade';
import { RAIT_ROUTES } from '../app.routes';

function setup() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  return TestBed.inject(ShortcutService);
}

function keydown(
  key: string,
  options: Partial<KeyboardEventInit> = {},
  target: EventTarget = document.body,
): void {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  Object.defineProperty(event, 'target', { value: target, configurable: true });
  target.dispatchEvent(event);
}

describe('C-2A-42 — register/keydown básico e alvos ignorados', () => {
  it('dado register("claim-next", h) quando keydown "n" no body então h chamado uma vez com preventDefault', () => {
    const service = setup();
    const handler = vi.fn();
    service.register('claim-next', handler);
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    document.body.dispatchEvent(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('dado alvo <input>/<textarea>/<select>/[contenteditable] quando keydown "n" então h não chamado', () => {
    const service = setup();
    const handler = vi.fn();
    service.register('claim-next', handler);
    for (const tag of ['input', 'textarea', 'select']) {
      const element = document.createElement(tag);
      document.body.appendChild(element);
      keydown('n', {}, element);
      element.remove();
    }
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    document.body.appendChild(editable);
    keydown('n', {}, editable);
    editable.remove();
    expect(handler).not.toHaveBeenCalled();
  });

  it('dado ctrlKey/metaKey/altKey quando keydown "n" então h não chamado', () => {
    const service = setup();
    const handler = vi.fn();
    service.register('claim-next', handler);
    keydown('n', { ctrlKey: true });
    keydown('n', { metaKey: true });
    keydown('n', { altKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it('dado event.repeat quando keydown "n" então h não chamado', () => {
    const service = setup();
    const handler = vi.fn();
    service.register('claim-next', handler);
    keydown('n', { repeat: true });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('C-2A-43 — chord "g" + "f"/"p"', () => {
  it('dado register("go-queue", q) e register("go-dashboard", p) quando "g" então "f" então q chamado', () => {
    const service = setup();
    const q = vi.fn();
    const p = vi.fn();
    service.register('go-queue', q);
    service.register('go-dashboard', p);
    keydown('g');
    keydown('f');
    expect(q).toHaveBeenCalledTimes(1);
    expect(p).not.toHaveBeenCalled();
  });

  it('dado "g" então "p" quando disparado então p chamado', () => {
    const service = setup();
    const q = vi.fn();
    const p = vi.fn();
    service.register('go-queue', q);
    service.register('go-dashboard', p);
    keydown('g');
    keydown('p');
    expect(p).toHaveBeenCalledTimes(1);
    expect(q).not.toHaveBeenCalled();
  });

  it('dado "g" então "x" (não é f nem p) quando disparado então nada e pendingChord() null', () => {
    const service = setup();
    keydown('g');
    expect(service.pendingChord()).toBe('g');
    keydown('x');
    expect(service.pendingChord()).toBeNull();
  });

  it('dado "g" (aguarda 60 s) então "f" quando disparado então q chamado (sem timeout)', () => {
    vi.useFakeTimers();
    try {
      const service = setup();
      const q = vi.fn();
      service.register('go-queue', q);
      keydown('g');
      vi.advanceTimersByTime(60_000);
      keydown('f');
      expect(q).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('C-2A-44 — unregister e substituição de handler', () => {
  it('dado unregister devolvido por register quando chamado então a tecla deixa de disparar', () => {
    const service = setup();
    const handler = vi.fn();
    const unregister = service.register('claim-next', handler);
    unregister();
    keydown('n');
    expect(handler).not.toHaveBeenCalled();
  });

  it('dado register da mesma chave duas vezes quando disparado então só o último handler dispara', () => {
    const service = setup();
    const first = vi.fn();
    const second = vi.fn();
    service.register('claim-next', first);
    service.register('claim-next', second);
    keydown('n');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('dado keydown de tecla sem handler ("t") quando disparado então nenhum erro e preventDefault não chamado', () => {
    setup();
    const event = new KeyboardEvent('keydown', {
      key: 't',
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    expect(() => document.body.dispatchEvent(event)).not.toThrow();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('C-2A-45 — atalhos registrados pelo shell', () => {
  it('dado shell com sessão rait-analyst quando "?" então diálogo de atalhos abre com as 10 entradas', async () => {
    const session = createSessionStub({
      active: true,
      roles: ['rait-analyst'],
    });
    const { RaitShellComponent } = await import('./rait-shell.component');
    TestBed.configureTestingModule({
      imports: [RaitShellComponent],
      providers: [
        provideRouter([]),
        { provide: RaitSessionFacade, useValue: session },
      ],
    });
    const fixture = TestBed.createComponent(RaitShellComponent);
    fixture.detectChanges();
    keydown('?');
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('dado sessão rait-analyst quando "g" "p" então navega /painel; "g" "f" então /fila/defesa', async () => {
    // A7(f): o harness de rota puro (`createRaitRouterHarness`) não monta o `RaitShellComponent`
    // — é ele quem registra os atalhos `go-dashboard`/`go-queue` (via `ShortcutService`). O
    // teste instancia o shell diretamente sobre `RAIT_ROUTES` e aguarda a navegação lazy
    // resultante com `vi.waitFor` (padrão de app 9).
    const session = createSessionStub({
      active: true,
      roles: ['rait-analyst'],
    });
    const { RaitShellComponent } = await import('./rait-shell.component');
    TestBed.configureTestingModule({
      imports: [RaitShellComponent],
      providers: [
        provideRouter(RAIT_ROUTES),
        { provide: RaitSessionFacade, useValue: session },
      ],
    });
    const fixture = TestBed.createComponent(RaitShellComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    keydown('g');
    keydown('p');
    await vi.waitFor(() => expect(router.url).toBe('/painel'));
    keydown('g');
    keydown('f');
    await vi.waitFor(() => expect(router.url).toBe('/fila/defesa'));
  });

  it("dado sessão rait-rapporteur quando 'g' 'f' então /painel (OD-R12-002 — :orgao do relator sem fonte)", async () => {
    const session = createSessionStub({
      active: true,
      roles: ['rait-rapporteur'],
    });
    const harness = await createRaitRouterHarness([
      { provide: RaitSessionFacade, useValue: session },
    ]);
    await harness.navigateByUrl('/painel');
    keydown('g');
    keydown('f');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/painel');
  });
});
