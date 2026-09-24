import type { Route, Routes } from '@angular/router';
import { TEAT_ROUTES } from '../app/app.routes';

export async function loadConcreteRoutes(): Promise<readonly Route[]> {
  const groups = await Promise.all(
    TEAT_ROUTES.map(async (mount) => {
      if (typeof mount.loadChildren !== 'function') {
        throw new Error('teat-root-route-without-load-children');
      }
      const loaded = await mount.loadChildren();
      if (!Array.isArray(loaded)) {
        throw new Error('teat-feature-routes-not-array');
      }
      return loaded as Routes;
    }),
  );
  return groups.flat();
}
