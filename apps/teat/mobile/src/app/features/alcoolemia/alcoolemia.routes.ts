import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const ALCOOLEMIA_ROUTES: Routes = [
  teatRoute(
    {
      path: 'alcohol-start',
      uxCode: 'UX-MOB-050',
      sourceSheet: 'IU-TEAT-alcohol-start.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-start.page.ts#AlcoholStartPageComponent',
    },
    () =>
      import('./pages/alcohol-start.page.js').then(
        (module) => module.AlcoholStartPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-device',
      uxCode: 'UX-MOB-051',
      sourceSheet: 'IU-TEAT-alcohol-device.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-device.page.ts#AlcoholDevicePageComponent',
    },
    () =>
      import('./pages/alcohol-device.page.js').then(
        (module) => module.AlcoholDevicePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-result',
      uxCode: 'UX-MOB-052',
      sourceSheet: 'IU-TEAT-alcohol-result.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-result.page.ts#AlcoholResultPageComponent',
    },
    () =>
      import('./pages/alcohol-result.page.js').then(
        (module) => module.AlcoholResultPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-refusal',
      uxCode: 'UX-MOB-053',
      sourceSheet: 'IU-TEAT-alcohol-refusal.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-refusal.page.ts#AlcoholRefusalPageComponent',
    },
    () =>
      import('./pages/alcohol-refusal.page.js').then(
        (module) => module.AlcoholRefusalPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-signs',
      uxCode: 'UX-MOB-054',
      sourceSheet: 'IU-TEAT-alcohol-signs.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-signs.page.ts#AlcoholSignsPageComponent',
    },
    () =>
      import('./pages/alcohol-signs.page.js').then(
        (module) => module.AlcoholSignsPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-forward',
      uxCode: 'UX-MOB-055',
      sourceSheet: 'IU-TEAT-alcohol-forward.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-forward.page.ts#AlcoholForwardPageComponent',
    },
    () =>
      import('./pages/alcohol-forward.page.js').then(
        (module) => module.AlcoholForwardPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-links',
      uxCode: 'UX-MOB-056',
      sourceSheet: 'IU-TEAT-alcohol-links.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-links.page.ts#AlcoholLinksPageComponent',
    },
    () =>
      import('./pages/alcohol-links.page.js').then(
        (module) => module.AlcoholLinksPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'alcohol-term',
      uxCode: 'UX-MOB-057',
      sourceSheet: 'IU-TEAT-alcohol-term.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/alcoolemia/pages/alcohol-term.page.ts#AlcoholTermPageComponent',
    },
    () =>
      import('./pages/alcohol-term.page.js').then(
        (module) => module.AlcoholTermPageComponent,
      ),
  ),
];
