// AssinaturaFacade (contrato CTG-0003c §3.8; T-27; [RN-PORTAL-101/102]; [UC-PORTAL-019]; M8):
// resolve o contexto da elevação — a rota a retomar (`?retomar`, senão o `ResumeService`, senão
// `/inicio`), o ato dessa rota no manifesto, o nível exigido (matriz `me.actRequirements` do
// servidor; senão o `access` da rota; senão o teto `avancada`) e o nível atual — e conduz as
// fases: `start` (`SessionFacade.requestElevation`, que grava o ponto de retomada ANTES do POST) e
// `complete` (retorno do gov.br → `SessionFacade.completeElevation` → `load()`), sem consumir o
// `ResumePoint`. A facade não toca em `window`: a navegação para o `redirectUrl` é da página.
// Nunca "acesso negado"; `422 SERVICE_UNAVAILABLE` (elevacao_govbr_pendente_r0014) → `unavailable`.
import { Injectable, inject, signal } from '@angular/core';
import type { ParamMap } from '@angular/router';
import {
  PORTAL_ROUTE_MANIFEST,
  type RouteManifestEntry,
} from '../../app.route-manifest';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { ResumeService } from '../../core/resume.service';
import {
  ASSURANCE_ORDER,
  SessionFacade,
  isAssuranceLevel,
  type AssuranceLevel,
  type ElevationMethod,
} from '../../core/session.facade';
import type { ElevationStarted } from '../../data/portal-command.models';

export type ElevationPhase =
  | 'idle' // aguardando escolha do caminho
  | 'starting' // POST elevations em curso
  | 'redirecting' // redirectUrl recebido; navegação externa em curso
  | 'completing' // retorno do gov.br: POST …/complete em curso
  | 'done' // nível elevado; retomada em curso
  | 'unavailable' // 422 SERVICE_UNAVAILABLE{elevacao_govbr_pendente_r0014} (OD-P15)
  | 'error'; // qualquer outro erro (inclui resumeToken inválido: 400 VALIDATION_FAILED)

export interface ElevationContext {
  /** `?retomar` ou `ResumeService.peek()?.route`; sem ambos → '/inicio'. */
  readonly resumeRoute: string;
  /** `serviceKey` da entrada do manifesto cujo `path` casa com `resumeRoute`, senão `null`. */
  readonly actKey: string | null;
  /** Nível exigido: matriz do servidor (`requirementFor(actKey).level`) → teto `avancada` (RN-101). */
  readonly required: AssuranceLevel;
  readonly current: AssuranceLevel | null;
  readonly sufficient: boolean;
}

/** = `RESUME_QUERY_PARAM` de `core/guards/auth.guard.ts` (C-3c-113 veda importar `core/guards`). */
const RESUME_QUERY_PARAM = 'retomar';
/** = `DEFAULT_LANDING_ROUTE` de `core/auth-flow.service.ts`. */
const DEFAULT_RESUME_ROUTE = '/inicio';
/** Teto exigível ([RN-PORTAL-101]). */
const ASSURANCE_CEILING: AssuranceLevel = 'avancada';
const TARGET_LEVEL = 'avancada';
const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';

/** Segmentos de `path` casam com a URL (`:param` casa qualquer segmento). */
function matchesPath(entry: RouteManifestEntry, route: string): boolean {
  const url = route.split('?')[0].replace(/^\//, '');
  const routeSegments = url.length > 0 ? url.split('/') : [];
  const pathSegments = entry.path.length > 0 ? entry.path.split('/') : [];
  if (routeSegments.length !== pathSegments.length) return false;
  return pathSegments.every(
    (segment, index) =>
      segment.startsWith(':') || segment === routeSegments[index],
  );
}

function entryFor(route: string): RouteManifestEntry | null {
  return (
    PORTAL_ROUTE_MANIFEST.find((entry) => matchesPath(entry, route)) ?? null
  );
}

@Injectable()
export class AssinaturaFacade {
  private readonly session = inject(SessionFacade);
  private readonly resumeService = inject(ResumeService);

  private readonly phaseState = signal<ElevationPhase>('idle');
  private readonly errorState = signal<ErrorPresentation | null>(null);
  private readonly contextState = signal<ElevationContext | null>(null);
  private readonly startedState = signal<ElevationStarted | null>(null);

  readonly phase = this.phaseState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly context = this.contextState.asReadonly();
  /** `{ redirectUrl, resumeToken, elevationId }` (OD-P59); o `resumeToken` nunca é exibido. */
  readonly started = this.startedState.asReadonly();

  resolveContext(queryParams: ParamMap): void {
    const resumeRoute =
      queryParams.get(RESUME_QUERY_PARAM) ??
      this.resumeService.peek()?.route ??
      DEFAULT_RESUME_ROUTE;
    const entry = entryFor(resumeRoute);
    const actKey = entry?.serviceKey ?? null;
    const requirement =
      actKey !== null ? this.session.requirementFor(actKey) : null;
    // Matriz do servidor quando é um nível; senão o teto — a elevação só existe para `avancada`
    // ([RN-PORTAL-101]; uma rota `simples` nunca é motivo de elevação, C-3c-56).
    const required: AssuranceLevel = isAssuranceLevel(requirement?.level)
      ? requirement.level
      : ASSURANCE_CEILING;
    const current = this.session.assuranceLevel();
    this.contextState.set({
      resumeRoute,
      actKey,
      required,
      current,
      sufficient:
        current !== null &&
        ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[required],
    });
  }

  /** `SessionFacade.requestElevation` (grava a retomada ANTES do POST); sucesso → `redirecting`. */
  async start(method: ElevationMethod): Promise<ElevationStarted | null> {
    const context = this.contextState();
    const resumeRoute = context?.resumeRoute ?? DEFAULT_RESUME_ROUTE;
    this.phaseState.set('starting');
    this.errorState.set(null);
    this.startedState.set(null);
    try {
      const started = await this.session.requestElevation({
        targetLevel: TARGET_LEVEL,
        method,
        resumeRoute,
        draft: this.resumeService.peek()?.draft ?? null,
      });
      this.startedState.set(started);
      this.phaseState.set('redirecting');
      return started;
    } catch (error: unknown) {
      this.fail(error, resumeRoute);
      return null;
    }
  }

  /** Retorno do gov.br (parâmetros `source_pending`, OD-P15) → `completeElevation` → `done`. */
  async complete(elevationId: string, resumeToken: string): Promise<boolean> {
    const resumeRoute =
      this.contextState()?.resumeRoute ?? DEFAULT_RESUME_ROUTE;
    this.phaseState.set('completing');
    this.errorState.set(null);
    try {
      await this.session.completeElevation(elevationId, resumeToken);
      // Matriz ato → nível relida do servidor antes da retomada (§6 T-27; M8).
      await this.session.load();
      this.phaseState.set('done');
      return true;
    } catch (error: unknown) {
      this.fail(error, resumeRoute);
      return false;
    }
  }

  /** Rota de retomada após `done`: `ResumeService.peek()?.route ?? context.resumeRoute` (não consome). */
  resumeTarget(): string {
    return (
      this.resumeService.peek()?.route ??
      this.contextState()?.resumeRoute ??
      DEFAULT_RESUME_ROUTE
    );
  }

  private fail(error: unknown, resumeRoute: string): void {
    const presentation = presentError(error, { resumeRoute });
    this.errorState.set(presentation);
    this.phaseState.set(
      presentation.code === SERVICE_UNAVAILABLE_CODE ? 'unavailable' : 'error',
    );
  }
}
