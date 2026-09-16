// API pública manuscrita de @detran/portal-requests (work/rounds/R-0009/
// contracts/CTG-0002.md §14; plan R-0009 M24), reexportada pelo `src/index.ts`
// gerado via `module.handwrittenExports` de BP-PORTAL-REQUESTS-001 (ADR-0007):
// controlador, serviços, porta de delegação, protocolo, rascunhos, eventos e
// a tabela de transições do pedido.
export * from './delegation/delegation.service.js';
export * from './drafts.js';
export * from './events.js';
export * from './guards/request.transitions.js';
export * from './idempotency.service.js';
export * from './protocol.js';
export * from './requests.controller.js';
export * from './requests.service.js';
