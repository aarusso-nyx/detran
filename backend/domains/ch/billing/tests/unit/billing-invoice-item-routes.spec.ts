import {
  METHOD_METADATA,
  MODULE_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants.js';
import { RequestMethod } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { BillingModule } from '../../src/billing.module.js';

/**
 * Hotfix fix/generated-billing-invoice-item-routes (decisão do Architect):
 * `BillingInvoiceItem` não expõe rota gerada. O vínculo item → fatura é
 * exclusivo de `BillingLifecycleService.closeInvoice`, que grava `linked_by`
 * sob a guarda do ciclo de vida; o `POST v1/ch/billing/billing-invoice-item`
 * gerado falhava sempre com 23502 (`linked_by` não gravável, sem padrão) e
 * contornaria essa guarda. Lê os mesmos metadados (`controllers` do módulo,
 * `path`/`method` dos handlers) que o `RouterExplorer` do Nest usa para
 * registrar rotas, sem subir a aplicação nem o banco.
 */

interface MountedRoute {
  controller: string;
  handler: string;
  method: string;
  path: string;
}

function joinPath(...parts: unknown[]): string {
  return parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .map((part) => String(part ?? '').replace(/^\/+|\/+$/gu, ''))
    .filter(Boolean)
    .join('/');
}

function mountedRoutes(module: object): MountedRoute[] {
  const controllers = (Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    module,
  ) ?? []) as (Function & { name: string; prototype: object })[];
  const routes: MountedRoute[] = [];
  for (const controller of controllers) {
    const prefix: unknown = Reflect.getMetadata(PATH_METADATA, controller);
    for (const handler of Object.getOwnPropertyNames(controller.prototype)) {
      if (handler === 'constructor') continue;
      const fn = (controller.prototype as Record<string, unknown>)[handler];
      if (typeof fn !== 'function') continue;
      const path: unknown = Reflect.getMetadata(PATH_METADATA, fn);
      if (path === undefined) continue;
      const method = Reflect.getMetadata(METHOD_METADATA, fn) as
        RequestMethod | undefined;
      routes.push({
        controller: controller.name,
        handler,
        method: RequestMethod[method ?? RequestMethod.GET],
        path: joinPath(prefix, path),
      });
    }
  }
  return routes;
}

describe('BillingModule — rotas de billing-invoice-item', () => {
  it('dado o BillingModule gerado quando as rotas são registradas então nenhuma rota …/billing-invoice-item existe (vínculo só por closeInvoice)', () => {
    const routes = mountedRoutes(BillingModule);
    // Sanidade: a leitura de metadados enxerga as rotas reais do módulo.
    expect(routes.map((route) => `${route.method} ${route.path}`)).toContain(
      'GET v1/ch/billing/invoices',
    );

    const invoiceItemRoutes = routes.filter(
      (route) =>
        route.path.includes('billing-invoice-item') ||
        route.controller === 'BillingInvoiceItemController',
    );
    expect(
      invoiceItemRoutes.map(
        (route) =>
          `${route.method} ${route.path} (${route.controller}.${route.handler})`,
      ),
    ).toEqual([]);
  });
});
