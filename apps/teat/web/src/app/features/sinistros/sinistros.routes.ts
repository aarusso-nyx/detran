import type { Routes } from '@angular/router';
import type { Type } from '@angular/core';
import {
  CONTEXTUAL_PRODUCT_GUARDS,
  PRODUCT_GUARDS,
} from '../../core/guards.js';
import type { TeatWebRole } from '../../core/roles.js';
import {
  CrashComplementPage,
  CrashDetailPage,
  CrashesListPage,
  RenaestIntegrationPage,
  SinistroPage,
  SubjectRequestPage,
} from './sinistros.pages.js';

const ROLES: readonly TeatWebRole[] = [
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
];

const route = (
  path: string,
  component: Type<SinistroPage>,
  sheet: string,
  uxCode: string,
  titleKey: string,
  contextual = false,
  sse = false,
) => ({
  path,
  loadComponent: async () => component,
  canMatch: [...(contextual ? CONTEXTUAL_PRODUCT_GUARDS : PRODUCT_GUARDS)],
  data: {
    sheet,
    uxCode,
    allowedRoles: ROLES,
    titleKey,
    module: 'sinistros',
    client: '@detran/boat-mobile',
    page: component.name,
    boat: true,
    sse,
    purpose: contextual,
    audit: contextual,
    actionAllowedRoles:
      path === 'crash-complement'
        ? {
            validate: ['processing-operator', 'traffic-authority'] as const,
          }
        : path === 'renaest-integration'
          ? {
              close: ['field-supervisor', 'traffic-authority'] as const,
            }
          : undefined,
  },
});

export const SINISTROS_ROUTES: Routes = [
  route(
    'crashes-list',
    CrashesListPage,
    'IU-TEAT-crashes-list',
    'UX-WEB-060',
    'teat.screens.crashes-list.title',
  ),
  route(
    'crash-detail',
    CrashDetailPage,
    'IU-TEAT-crash-detail',
    'UX-WEB-061',
    'teat.screens.crash-detail.title',
    true,
  ),
  route(
    'crash-complement',
    CrashComplementPage,
    'IU-TEAT-crash-complement',
    'UX-WEB-062',
    'teat.screens.crash-complement.title',
    true,
  ),
  route(
    'renaest-integration',
    RenaestIntegrationPage,
    'IU-TEAT-renaest-integration',
    'UX-WEB-063',
    'teat.screens.renaest-integration.title',
    false,
    true,
  ),
];

const SUBJECT_REQUEST_LEAF = {
  path: 'titular',
  loadComponent: async () => SubjectRequestPage,
  canMatch: [...CONTEXTUAL_PRODUCT_GUARDS],
  data: {
    sheet: 'IU-BOAT-W-05',
    uxCode: 'source_pending',
    screenId: 'source_pending',
    allowedRoles: ['processing-operator', 'AUDITOR'] as const,
    titleKey: 'boat.screens.crash_subject_request.title',
    module: 'sinistros',
    client: '@detran/boat-mobile',
    page: SubjectRequestPage.name,
    boat: true,
    sse: false,
    purpose: true,
    audit: true,
  },
};

export const SUBJECT_REQUEST_ROUTE = {
  path: 'fiscalizacao',
  children: [
    {
      path: 'sinistros',
      children: [SUBJECT_REQUEST_LEAF],
    },
  ],
};
