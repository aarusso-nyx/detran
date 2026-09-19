// Rota funcional de um serviço (contrato CTG-0003c §3.9, válida também para a home — A12(e)):
// pelo `serviceKey`, a primeira entrada do `PORTAL_ROUTE_MANIFEST` com esse serviço e sem
// parâmetro `:` no caminho → a própria rota; só entradas com parâmetro sobre um AIT
// (`defesa_previa`, `indicacao_condutor`, `pagamento`…) → a lista de origem `/autos`; outro
// parâmetro ou nenhuma entrada → `null` (sem botão/link funcional). Nunca `item.route` do catálogo
// (é caminho de fixture, `/servicos/…`). Função pura, sem injeção.
import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';

/** Lista de origem dos atos sobre um AIT (rotas com `:aitId`). */
const AUTOS_ROUTE = '/autos';
const AIT_PARAM = ':aitId';

export function functionalRouteFor(serviceKey: string): string | null {
  const entries = PORTAL_ROUTE_MANIFEST.filter(
    (entry) => entry.serviceKey === serviceKey,
  );
  if (entries.length === 0) return null;
  const direct = entries.find((entry) => !entry.path.includes(':'));
  if (direct) return `/${direct.path}`;
  return entries.some((entry) => entry.path.includes(AIT_PARAM))
    ? AUTOS_ROUTE
    : null;
}
