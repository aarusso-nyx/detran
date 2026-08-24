import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { StynxToastContainerComponent } from '@stynx-nyx/angular-ui';

export interface DetranNavItem {
  label: string;
  link: string | readonly string[];
  icon?: string;
}

@Component({
  selector: 'detran-app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, StynxToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detran-shell">
      <header class="detran-topbar">
        <a class="detran-brand" [routerLink]="homeLink">{{
          applicationName
        }}</a>
        <ng-content select="[detran-topbar-actions]" />
      </header>
      <aside class="detran-sidenav" aria-label="Navegação principal">
        <nav>
          @for (item of navigation; track item.label) {
            <a [routerLink]="item.link"
              ><span aria-hidden="true">{{ item.icon }}</span
              >{{ item.label }}</a
            >
          }
        </nav>
        <ng-content select="[detran-sidenav-footer]" />
      </aside>
      <main class="detran-content" id="detran-content">
        <ng-content /><router-outlet />
      </main>
      <stynx-toast-container />
    </div>
  `,
})
export class DetranAppShellComponent {
  @Input() applicationName = 'DETRAN';
  @Input() homeLink: string | readonly string[] = '/';
  @Input() navigation: readonly DetranNavItem[] = [];
}
