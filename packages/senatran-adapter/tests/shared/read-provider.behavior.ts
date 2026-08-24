import { expect } from 'vitest';

import type { SenatranPorts } from '../../src/ports.js';

export async function expectReadProviderBehavior(
  ports: SenatranPorts,
  fixtures: { cpf: string; plate?: string },
): Promise<void> {
  const driver = await ports.wsdenatranRead.findDriverByCpf(fixtures.cpf);
  expect(driver?.cpf).toBe(fixtures.cpf);
  expect(driver?.licenseNumber).toBeTruthy();
  if (fixtures.plate) {
    const vehicle = await ports.wsdenatranRead.findVehicleByPlate(
      fixtures.plate,
    );
    expect(vehicle?.plate).toBe(fixtures.plate);
    expect(vehicle?.renavam).toBeTruthy();
  }
}
