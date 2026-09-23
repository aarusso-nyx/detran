// Raiz do console (CTG-0002.md §1/§5): só monta o shell; toda tela é rota.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardShellComponent } from './core/dashboard-shell.component';

@Component({
  selector: 'dash-root',
  imports: [DashboardShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<dash-shell />',
})
export class AppComponent {}
