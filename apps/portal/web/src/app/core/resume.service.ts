// ResumeService (portal-frontends.md §5.1; [UC-PORTAL-019] AC-4): guarda a rota e o rascunho ao
// redirecionar para a elevação de nível e retoma onde parou. Estado em memória espelhado em
// `sessionStorage` (sobrevive ao redirect OIDC, morre com a aba); nunca `localStorage` (spec §1
// "Estado"). `resume()` é de uso único: devolve e limpa; `peek()` lê sem consumir ([DIVERGE-4]):
// o callback OIDC só precisa da rota, e o `ServiceWizard.resumeFrom` consome o ponto.
import { Injectable } from '@angular/core';

export interface ResumePoint {
  readonly route: string;
  readonly draft: unknown;
}

const STORAGE_KEY = 'portal-resume';

function sessionStore(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private point: ResumePoint | null = null;

  save(point: ResumePoint): void {
    this.point = point;
    try {
      sessionStore()?.setItem(STORAGE_KEY, JSON.stringify(point));
    } catch {
      // sessionStorage indisponível (modo privado/cota): a cópia em memória basta.
    }
  }

  /** Devolve o ponto sem limpá-lo (leitura não consumidora, [DIVERGE-4]). */
  peek(): ResumePoint | null {
    return this.point ?? this.read();
  }

  resume(): ResumePoint | null {
    const point = this.peek();
    this.clear();
    return point;
  }

  clear(): void {
    this.point = null;
    try {
      sessionStore()?.removeItem(STORAGE_KEY);
    } catch {
      // idem
    }
  }

  private read(): ResumePoint | null {
    try {
      const raw = sessionStore()?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof (parsed as { route?: unknown }).route === 'string'
      ) {
        return {
          route: (parsed as { route: string }).route,
          draft: (parsed as { draft?: unknown }).draft ?? null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
