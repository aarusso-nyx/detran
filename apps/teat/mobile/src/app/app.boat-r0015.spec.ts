import { expect, it } from 'vitest';
import {
  BOAT_ROUTE_PATHS,
  TEAT_ROUTE_FIXTURE,
} from '../testing/route-contract.fixture';

const EXPECTED_BOAT_PATHS = [
  'crash-start',
  'crash-location',
  'crash-conditions',
  'crash-vehicles',
  'crash-people',
  'crash-victims',
  'crash-dynamics',
  'crash-sketch',
  'crash-evidence',
  'crash-ait-links',
  'crash-damages',
  'crash-review',
] as const;

it('dado o contrato BOAT mobile quando enumerado então fixa as doze telas na ordem S-01..S-12/S-11', () => {
  expect(BOAT_ROUTE_PATHS).toEqual(EXPECTED_BOAT_PATHS);
  expect(TEAT_ROUTE_FIXTURE).toHaveLength(71);
  expect(
    TEAT_ROUTE_FIXTURE.filter((route) => !route.guards.includes('BOAT')),
  ).toHaveLength(59);
  expect(
    TEAT_ROUTE_FIXTURE.find((route) => route.path === 'crash-damages'),
  ).toMatchObject({
    uxCode: 'source_pending',
    sourceSheet: 'IU-BOAT-S-12.md',
    guards: 'B+S, BOAT',
  });
});
