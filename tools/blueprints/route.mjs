// Single normalisation for blueprint REST routes. Blueprints declare
// `api.basePath` and `api.resources[].path` in mixed conventions
// (`"/v1/inf/ait/"` + `"aits"`, or `"/v1"` + `"/example-records"`); every
// generator must join them through here so the NestJS controller prefix and
// the published OpenAPI paths can never disagree.
export function joinRoute(...segments) {
  const joined = segments
    .map((segment) => String(segment ?? '').trim())
    .filter(Boolean)
    .join('/')
    .replace(/\/{2,}/gu, '/')
    .replace(/\/+$/u, '');
  return `/${joined.replace(/^\/+/u, '')}`;
}
