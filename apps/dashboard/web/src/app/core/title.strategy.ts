// Título do documento (CTG-0002.md §5): "<título da rota> — <marca>", com o título vindo da
// chave i18n da ROTA (nunca do componente). Sem título, só a marca.
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';
import { StynxI18nService } from '@detran/ui';

const BRAND_KEY = 'dashboard.shell.brand';

@Injectable({ providedIn: 'root' })
export class DashboardTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(StynxI18nService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    const brand = this.i18n.translate(BRAND_KEY);
    this.title.setTitle(key ? `${this.i18n.translate(key)} — ${brand}` : brand);
  }
}
