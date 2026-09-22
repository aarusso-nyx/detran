// Parâmetros de rota das páginas (contrato CTG-0002a §3; route-manifest.md): `:orgao` é um token
// de `RAIT_JUDGING_BODIES` (`jari` | `cetran`) e os ids (`:id`, `:caseId`, `:loteId`) são uuids do
// servidor. As abas de `/casos/:id` são filhas do layout e, com a estratégia de herança padrão
// do router (`emptyOnly`), não recebem o `:id` do pai — `routeParam` sobe a árvore até achar o
// parâmetro. Nenhum valor é inventado: parâmetro ausente → `''`; `:orgao` fora do vocabulário →
// `jari` NÃO é assumido: devolve o primeiro token só para tipagem, e o `roleGuard`/servidor
// rejeitam a rota inválida (`rait.errors.forbidden_orgao`).
import type { ActivatedRoute } from '@angular/router';
import { RAIT_JUDGING_BODIES, type RaitJudgingBody } from '../data/models';

const ORGAO_PARAM = 'orgao';

/** Primeiro valor de `name` na rota ativa ou nos ancestrais; `''` quando ausente. */
export function routeParam(route: ActivatedRoute, name: string): string {
  let current: ActivatedRoute | null = route;
  while (current !== null) {
    const value = current.snapshot?.paramMap.get(name);
    if (value !== null && value !== undefined) return value;
    current = current.parent;
  }
  return '';
}

export function judgingBodyOf(route: ActivatedRoute): RaitJudgingBody {
  const raw = routeParam(route, ORGAO_PARAM);
  const found = RAIT_JUDGING_BODIES.find((token) => token === raw);
  return found ?? RAIT_JUDGING_BODIES[0];
}
