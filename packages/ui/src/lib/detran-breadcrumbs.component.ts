import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface DetranBreadcrumb {
  label: string;
  link?: string | readonly string[];
}

@Component({
  selector: 'detran-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Navegação estrutural" class="detran-breadcrumbs">
      @for (crumb of items; track $index; let last = $last) {
        @if (crumb.link && !last) {
          <a [routerLink]="crumb.link">{{ crumb.label }}</a
          ><span aria-hidden="true">/</span>
        } @else {
          <span [attr.aria-current]="last ? 'page' : null">{{
            crumb.label
          }}</span>
        }
      }
    </nav>
  `,
})
export class DetranBreadcrumbsComponent {
  @Input() items: readonly DetranBreadcrumb[] = [];
}
