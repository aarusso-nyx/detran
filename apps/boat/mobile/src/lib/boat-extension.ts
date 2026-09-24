import type { Type } from '@angular/core';

const pages: Readonly<Record<string, () => Promise<Type<unknown>>>> = {
  'crash-start': async () =>
    (await import('./pages/boat-pages.js')).CrashStartPageComponent,
  'crash-location': async () =>
    (await import('./pages/boat-pages.js')).CrashLocationPageComponent,
  'crash-conditions': async () =>
    (await import('./pages/boat-pages.js')).CrashConditionsPageComponent,
  'crash-vehicles': async () =>
    (await import('./pages/boat-pages.js')).CrashVehiclesPageComponent,
  'crash-people': async () =>
    (await import('./pages/boat-pages.js')).CrashPeoplePageComponent,
  'crash-victims': async () =>
    (await import('./pages/boat-pages.js')).CrashVictimsPageComponent,
  'crash-dynamics': async () =>
    (await import('./pages/boat-pages.js')).CrashDynamicsPageComponent,
  'crash-sketch': async () =>
    (await import('./pages/boat-pages.js')).CrashSketchPageComponent,
  'crash-evidence': async () =>
    (await import('./pages/boat-pages.js')).CrashEvidencePageComponent,
  'crash-ait-links': async () =>
    (await import('./pages/boat-pages.js')).CrashAitLinksPageComponent,
  'crash-damages': async () =>
    (await import('./pages/boat-pages.js')).CrashDamagesPageComponent,
  'crash-review': async () =>
    (await import('./pages/boat-pages.js')).CrashReviewPageComponent,
};

export interface BoatExtension {
  installed(): boolean;
  load(route: string): Promise<unknown>;
}

export function createBoatExtension(): BoatExtension {
  return {
    installed: () => true,
    async load(route: string): Promise<unknown> {
      const page = pages[route];
      if (page === undefined)
        throw new Error('boat-extension-route-unavailable');
      return page();
    },
  };
}
