// Synthetic presets source: src/testing/session-facade.stub.ts SESSION_FACADE_PRESETS.
// Narrow assurance override: the real facade otherwise prioritizes the advanced me fixture
// over the selected simples claim. Account, matrix, representations and commands stay inherited.
import { Injectable, computed, inject } from '@angular/core';
import type {
  StynxSessionService,
  StynxSessionState,
} from '@stynx-nyx/angular-auth';
import { BehaviorSubject } from 'rxjs';
import {
  PortalSessionFacade,
  type AssuranceLevel,
} from '../core/session.facade';
import { PreviewStateService } from './preview-state.service';
import { PreviewActionLog } from './preview-action-log';

@Injectable()
export class PreviewSessionFacade extends PortalSessionFacade {
  private readonly preview = inject(PreviewStateService);
  override readonly assuranceLevel = computed<AssuranceLevel | null>(() => {
    const role = this.preview.role();
    return role === 'anonimo' ? null : role;
  });
}

@Injectable()
export class PreviewStynxSessionService implements Pick<
  StynxSessionService,
  keyof StynxSessionService
> {
  private readonly preview = inject(PreviewStateService);
  private readonly log = inject(PreviewActionLog);
  readonly state = computed<StynxSessionState>(() => {
    const role = this.preview.role();
    return {
      active: role !== 'anonimo',
      accessToken: null,
      refreshToken: null,
      sid: null,
      permissions: [],
      tenantId: '00000000-0000-7000-8000-00000000a001',
      claims: role === 'anonimo' ? null : { assurance_level: role },
    };
  });
  readonly active = computed(() => this.state().active);
  private readonly states = new BehaviorSubject(this.state());
  readonly active$ = this.states.asObservable();
  snapshot(): StynxSessionState {
    return this.state();
  }
  hasAllPermissions(required: string[]): boolean {
    return required.length === 0;
  }
  hasAnyPermissions(_required: string[]): boolean {
    return false;
  }
  login(): void {
    this.log.record('login');
  }
  loginRedirect(): void {
    this.log.record('loginRedirect');
  }
  completeLogin(_url?: string): Promise<StynxSessionState> {
    this.log.record('completeLogin');
    // No successful authentication callback is synthesized.
    return Promise.resolve({ ...this.state(), active: false });
  }
  logout(): Promise<void> {
    this.log.record('logout');
    return Promise.resolve();
  }
  getAccessToken(): Promise<string | null> {
    return Promise.resolve(null);
  }
  refresh(): Promise<string | null> {
    return Promise.resolve(null);
  }
  onAuthFailure(): Promise<void> {
    return Promise.resolve();
  }
  switchTenant(_tenantId: string): Promise<StynxSessionState> {
    return Promise.resolve(this.state());
  }
}
