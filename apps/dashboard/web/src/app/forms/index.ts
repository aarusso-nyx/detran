// R-0016 TASK-0006 (Engineer). Agregador dos 9 schemas de `forms/` (contrato CTG-0002.md §11).
// `DashboardFormSlug` é duplicado aqui, literal, da união de `app.route-manifest.ts` (§2):
// `forms/` é folha e não importa `src/app/app.route-manifest.ts` (fronteira TASK-0005 ×
// TASK-0006, §14.2).
import type { ZodType } from 'zod';

import { AckAlertaSchema } from './ack-alerta.schema.js';
import { EncerrarAlertaSchema } from './encerrar-alerta.schema.js';
import { CausaRaizSchema } from './causa-raiz.schema.js';
import { AvancarCicloSchema } from './avancar-ciclo.schema.js';
import { FinalidadeN2Schema } from './finalidade-n2.schema.js';
import { ExportarSchema } from './exportar.schema.js';
import { ConfigurarIndicadorSchema } from './configurar-indicador.schema.js';
import { SolicitarRelatorioSchema } from './solicitar-relatorio.schema.js';
import { AuditoriaTransparenciaSchema } from './auditoria-transparencia.schema.js';

export * from './form-gate.js';
export * from './ack-alerta.schema.js';
export * from './encerrar-alerta.schema.js';
export * from './causa-raiz.schema.js';
export * from './avancar-ciclo.schema.js';
export * from './finalidade-n2.schema.js';
export * from './exportar.schema.js';
export * from './configurar-indicador.schema.js';
export * from './solicitar-relatorio.schema.js';
export * from './auditoria-transparencia.schema.js';

export type DashboardFormSlug =
  | 'ack-alerta'
  | 'encerrar-alerta'
  | 'causa-raiz'
  | 'avancar-ciclo'
  | 'finalidade-n2'
  | 'exportar'
  | 'configurar-indicador'
  | 'solicitar-relatorio'
  | 'auditoria-transparencia';

export const FORM_SCHEMAS: Readonly<Record<DashboardFormSlug, ZodType>> = {
  'ack-alerta': AckAlertaSchema,
  'encerrar-alerta': EncerrarAlertaSchema,
  'causa-raiz': CausaRaizSchema,
  'avancar-ciclo': AvancarCicloSchema,
  'finalidade-n2': FinalidadeN2Schema,
  exportar: ExportarSchema,
  'configurar-indicador': ConfigurarIndicadorSchema,
  'solicitar-relatorio': SolicitarRelatorioSchema,
  'auditoria-transparencia': AuditoriaTransparenciaSchema,
};
