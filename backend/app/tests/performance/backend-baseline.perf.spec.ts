// INV-OPS-002; ADR-0044: finite request-path baseline, never a capacity claim.
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import type { INestApplication } from '@nestjs/common';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createDashboardApp,
  headers,
  restoreEnv,
} from '../e2e/dashboard-e2e.support.js';
import { assertDedicatedDatabaseEnvironment } from '../shared/rait-case-command.fixture.js';

const targets = JSON.parse(
  readFileSync(
    new URL('../../../../law/targets/performance.json', import.meta.url),
    'utf8',
  ),
) as { targets: Array<{ metric: string; threshold: number }> };
const threshold = (metric: string): number => {
  const value = targets.targets.find(
    (target) => target.metric === metric,
  )?.threshold;
  if (value === undefined || !Number.isFinite(value))
    throw new Error(`Missing target: ${metric}`);
  return value;
};
const warmup = 5;
const requests = 30;
const scenarios = [
  {
    name: 'rait-case-read',
    path: '/v1/inf/rait/cases/00000000-0000-7000-8000-000010000002',
    role: 'rait-analyst',
    shape: 'id',
  },
  {
    name: 'ops-agency-read',
    path: '/v1/ops/agency/units',
    role: 'agency-admin',
    shape: 'collection',
  },
  {
    name: 'dashboard-kpis',
    path: '/v1/dashboard/kpis',
    role: 'dash-operator',
    shape: 'coverage',
  },
] as const;
const results: Array<{
  name: string;
  samples_ms: number[];
  p50_ms: number;
  p95_ms: number;
  throughput_rps: number;
  requests: number;
  errors: number;
}> = [];
let app: INestApplication;

beforeAll(async () => {
  assertDedicatedDatabaseEnvironment();
  const client = new pg.Client({
    connectionString: process.env.STYNX_APP_DATABASE_URL,
  });
  await client.connect();
  try {
    const identity = await client.query<{ role: string }>(
      'select current_role as role',
    );
    expect(identity.rows[0]?.role).toBe('role_app_backend');
  } finally {
    await client.end();
  }
  app = await createDashboardApp();
}, 60_000);

afterAll(async () => {
  await app?.close();
  restoreEnv();
  if (results.length === scenarios.length)
    console.log(
      JSON.stringify({
        population: 'detran-request-path-baseline-v1',
        warmup_per_scenario: warmup,
        concurrency: 1,
        p50_ms: Math.max(...results.map((result) => result.p50_ms)),
        p95_ms: Math.max(...results.map((result) => result.p95_ms)),
        throughput_rps: Math.min(
          ...results.map((result) => result.throughput_rps),
        ),
        scenarios: results,
      }),
    );
});

const percentile = (samples: number[], p: number): number => {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * p) - 1]!;
};

describe('INV-OPS-002 — generous complete request-path baseline', () => {
  it.each(scenarios)(
    '$name respects the initial latency and throughput targets',
    async (scenario) => {
      const call = async () => {
        const response = await request(app.getHttpServer())
          .get(scenario.path)
          .set(headers(scenario.role))
          .timeout({ response: 6000, deadline: 10000 });
        expect(response.status, JSON.stringify(response.body)).toBe(200);
        if (scenario.shape === 'collection') {
          expect(
            Array.isArray(response.body) || Array.isArray(response.body.items),
          ).toBe(true);
        } else expect(response.body).toHaveProperty(scenario.shape);
      };
      for (let i = 0; i < warmup; i++) await call();
      const samples_ms: number[] = [];
      const started = performance.now();
      for (let i = 0; i < requests; i++) {
        const t0 = performance.now();
        await call();
        samples_ms.push(performance.now() - t0);
      }
      const duration = performance.now() - started;
      const result = {
        name: scenario.name,
        samples_ms,
        p50_ms: percentile(samples_ms, 0.5),
        p95_ms: percentile(samples_ms, 0.95),
        throughput_rps: (requests * 1000) / duration,
        requests: samples_ms.length,
        errors: 0,
      };
      results.push(result);
      expect(result.requests).toBe(requests);
      expect(result.p50_ms).toBeLessThanOrEqual(threshold('p50_ms'));
      expect(result.p95_ms).toBeLessThanOrEqual(threshold('p95_ms'));
      expect(result.throughput_rps).toBeGreaterThanOrEqual(1);
    },
  );
});
