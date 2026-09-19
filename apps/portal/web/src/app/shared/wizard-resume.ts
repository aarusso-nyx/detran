// Retomada do wizard (contrato CTG-0003b §3.4; [UC-PORTAL-019] AC-4; T02 §5): dois pontos de
// retomada, nesta ordem de preferência — (1) o `ResumeService` (rota + rascunho guardados antes
// da elevação de nível), consumido SÓ quando a rota e o alvo coincidem; (2) o pedido aberto sobre
// o alvo (`openRequestId` do AIT) lido do servidor: em `PEDIDO_EM_COMPOSICAO` vira ponto de
// retomada (sem novo `POST requests`); em estado posterior é um processo existente e a página
// direciona a `/processos/<id>`. Nenhum rascunho local: o servidor é a única fonte.
import type { ResumeService } from '../core/resume.service';
import { etagOf } from '../data/portal-command.models';
import type { PortalClient } from '../data/portal.client';
import type { RequestDetail } from '../data/portal-read.models';
import {
  WIZARD_STEPS,
  type WizardResumeDraft,
  type WizardStep,
  type WizardTarget,
} from './service-wizard.store';

const COMPOSITION_STATE = 'PEDIDO_EM_COMPOSICAO';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWizardStep(value: unknown): value is WizardStep {
  return (WIZARD_STEPS as readonly unknown[]).includes(value);
}

/** Forma mínima de um `WizardResumeDraft` guardado pelo `ServiceWizardStore.resumeDraft`. */
function asResumeDraft(value: unknown): WizardResumeDraft | null {
  if (!isRecord(value)) return null;
  const requestId = value['requestId'];
  const serviceKey = value['serviceKey'];
  const step = value['step'];
  if (
    typeof requestId !== 'string' ||
    typeof serviceKey !== 'string' ||
    !isWizardStep(step)
  ) {
    return null;
  }
  return value as unknown as WizardResumeDraft;
}

function matchesTarget(
  draft: WizardResumeDraft,
  target: WizardTarget,
): boolean {
  return (
    draft.serviceKey === target.serviceKey &&
    (draft.targetId ?? null) === (target.targetId ?? null)
  );
}

/**
 * `ResumeService.peek()` com `route === resumeRoute` e rascunho com `serviceKey`/`targetId` do
 * alvo → `ResumeService.resume()` (consome) e devolve o `WizardResumeDraft`; senão `null` e o
 * ponto guardado fica intacto ([UC-PORTAL-019] AC-4).
 */
export function resumePointFor(
  resume: ResumeService,
  resumeRoute: string,
  target: WizardTarget,
): WizardResumeDraft | null {
  const point = resume.peek();
  if (!point || point.route !== resumeRoute) return null;
  const draft = asResumeDraft(point.draft);
  if (!draft || !matchesTarget(draft, target)) return null;
  resume.resume();
  return draft;
}

/**
 * `GET requests/{openRequestId}`: estado `PEDIDO_EM_COMPOSICAO` e `serviceKey` do alvo →
 * `{ requestId, serviceKey, targetKind, targetId, step: 'composicao', etag: etag ?? etagOf(version),
 * values: request.draft }`; estado posterior → `'existing_request'` (a página direciona a
 * `/processos/<id>`); `serviceKey` diferente → `null`. Erros da leitura propagam ao chamador.
 */
export async function resumeFromOpenRequest(
  client: PortalClient,
  openRequestId: string,
  target: WizardTarget,
): Promise<WizardResumeDraft | 'existing_request' | null> {
  const result = await client.getRequest(openRequestId);
  const detail = result.body as Partial<RequestDetail>;
  const request = detail.request;
  if (!request || request.serviceKey !== target.serviceKey) return null;
  if (request.state !== COMPOSITION_STATE) return 'existing_request';
  return {
    requestId: request.requestId ?? openRequestId,
    serviceKey: request.serviceKey,
    targetKind: request.targetKind ?? target.targetKind,
    targetId: request.targetId ?? target.targetId ?? null,
    step: 'composicao',
    etag:
      result.etag ??
      (typeof request.version === 'number' ? etagOf(request.version) : null),
    values: isRecord(request.draft) ? request.draft : null,
  };
}
