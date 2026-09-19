// CTG-0004 §15.2 (R-0008, TASK-0009, adenda pós-iteração 1) — porta de
// feature flags para os comandos de medidas administrativas.
//
// `teat.monitored_custody` (DT-015) nunca é lido por `process.env` dentro do
// domínio (`inf/measures`): o app resolve o valor real a partir de
// `detranFeatureFlagSet()` (mesma fonte que `app.module.ts` usa para
// `teat.speed_meters`) e o injeta via o token `MEASURE_FEATURE_FLAGS`
// exportado por `@detran/inf-measures`. `@Global()` porque quem consome a
// porta é `MeasuresModule`, que não importa este módulo diretamente — mesmo
// padrão de `TeatSyncModule`/`TeatEvidencePortsModule`.
import { Global, Module } from '@nestjs/common';
import {
  MEASURE_FEATURE_FLAGS,
  type MeasureFeatureFlags,
} from '@detran/inf-measures';

import { detranFeatureFlagSet } from './detran-runtime.js';

export const TEAT_MEASURE_FEATURE_FLAGS_PROVIDER = {
  provide: MEASURE_FEATURE_FLAGS,
  useFactory: (): MeasureFeatureFlags => ({
    isEnabled: (flag: string) =>
      detranFeatureFlagSet().flags[flag]?.default === true,
  }),
};

@Global()
@Module({
  providers: [TEAT_MEASURE_FEATURE_FLAGS_PROVIDER],
  exports: [MEASURE_FEATURE_FLAGS],
})
export class TeatMeasuresPortsModule {}
