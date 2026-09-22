// Título do documento (contrato CTG-0002a §5): `title` da rota (chave `rait.screens.<slug>.title`)
// traduzido pelo catálogo, com o sufixo `rait.shell.title_suffix`: "<título> — <sufixo>"; rota
// sem `title` → só o sufixo.
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';
import { StynxI18nService } from '@detran/ui';

export const TITLE_SUFFIX_KEY = 'rait.shell.title_suffix';

@Injectable({ providedIn: 'root' })
export class RaitTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(StynxI18nService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    const suffix = this.i18n.translate(TITLE_SUFFIX_KEY);
    this.title.setTitle(
      key ? `${this.i18n.translate(key)} — ${suffix}` : suffix,
    );
  }
}
