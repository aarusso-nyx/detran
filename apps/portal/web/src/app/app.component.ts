// Raiz do app: monta o `CitizenShell` com a marca do `BrandService` e anuncia a navegação em
// curso na região `aria-live` do shell (`portal.states.loading`).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { BrandService } from './core/brand.service';
import { CitizenShellComponent } from './core/citizen-shell.component';

const LOADING_KEY = 'portal.states.loading';

@Component({
  selector: 'portal-root',
  imports: [CitizenShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <portal-citizen-shell [brand]="brand.state()" [statusKey]="status()" />
  `,
})
export class AppComponent {
  protected readonly brand = inject(BrandService);
  private readonly router = inject(Router);

  protected readonly status = toSignal(
    this.router.events.pipe(
      filter(
        (event) =>
          event instanceof NavigationStart || event instanceof NavigationEnd,
      ),
      map((event) => (event instanceof NavigationStart ? LOADING_KEY : '')),
    ),
    { initialValue: '' },
  );

  constructor() {
    void this.brand.load();
  }
}
