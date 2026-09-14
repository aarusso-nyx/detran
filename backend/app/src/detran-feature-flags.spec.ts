import { afterEach, describe, expect, it } from 'vitest';

import {
  detranFeatureEnvironmentName,
  detranFeatureFlagSet,
} from './detran-runtime.js';

const names = [
  'DETRAN_FEATURE_TEAT_SPEED_METERS',
  'DETRAN_FEATURE_SPEED_METERS',
];

afterEach(() => {
  for (const name of names) delete process.env[name];
});

describe('detranFeatureFlagSet', () => {
  it('normaliza cada sequência não alfanumérica em um único separador de ambiente', () => {
    expect(
      detranFeatureEnvironmentName(
        `dashboard${'..'}critical${'---'}extinction`,
      ),
    ).toBe('DETRAN_FEATURE_DASHBOARD_CRITICAL_EXTINCTION');
  });

  it('dado defaults gerados quando consultar então teat.speed_meters inicia false', () => {
    expect(detranFeatureFlagSet().flags['teat.speed_meters'].default).toBe(
      false,
    );
  });

  it('dado override canônico on/true/1 quando consultar então ativa a flag', () => {
    for (const value of ['on', 'true', '1']) {
      process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = value;
      expect(detranFeatureFlagSet().flags['teat.speed_meters'].default).toBe(
        true,
      );
      delete process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
    }
  });

  it('dado override canônico definido quando alias legado também existe então canônico prevalece', () => {
    process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = 'off';
    process.env.DETRAN_FEATURE_SPEED_METERS = 'on';
    expect(detranFeatureFlagSet().flags['teat.speed_meters'].default).toBe(
      false,
    );
  });

  it('dado somente alias legado quando consultar então controla teat.speed_meters', () => {
    process.env.DETRAN_FEATURE_SPEED_METERS = 'on';
    expect(detranFeatureFlagSet().flags['teat.speed_meters'].default).toBe(
      true,
    );
  });
});
