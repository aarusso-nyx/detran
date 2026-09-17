// Título do documento a partir do `title` da rota (chave i18n) traduzido pelo catálogo, com a
// marca do órgão (ou neutra) como sufixo: "<título> — <marca>".
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';
import { StynxI18nService } from '@detran/ui';
import { BrandService } from './brand.service';

@Injectable({ providedIn: 'root' })
export class PortalTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(StynxI18nService);
  private readonly brand = inject(BrandService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    const brand = this.brand.state();
    const brandName =
      brand.status === 'available'
        ? brand.name
        : this.i18n.translate(brand.neutralLabelKey);
    this.title.setTitle(
      key ? `${this.i18n.translate(key)} — ${brandName}` : brandName,
    );
  }
}
