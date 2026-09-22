// Página padrão da fábrica de rotas (CTG-0002.md §3/§9): usada quando uma entrada do manifesto
// ainda não tem página própria. Em L0 renderiza exatamente o que as 18 telas renderizam sem
// backend: "indisponível nesta versão", citando R-0011 / BP-DASH-MONITOR-001.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScreenFrameComponent } from '../screen-frame.component';
import type { DashboardPanel } from '../../app.route-manifest';
import { UNAVAILABLE_IN_VERSION } from '../../shared/screen-state';

@Component({
  selector: 'dash-unavailable-page',
  imports: [ScreenFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<dash-screen-frame
    [slug]="slug"
    [screen]="screen"
    [state]="state"
  />`,
})
export class UnavailablePageComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;

  protected readonly slug = (this.data['slug'] as string | undefined) ?? '';
  protected readonly screen =
    (this.data['screen'] as DashboardPanel | '' | undefined) || null;
  protected readonly state = UNAVAILABLE_IN_VERSION;
}
