import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  inject,
  PendingTasks,
  type OnInit,
  signal,
  type Type,
} from '@angular/core';
import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';
export {
  resolveBoatRoute,
  TEAT_BOAT_EXTENSION,
} from '../../navigation/guards/readiness.guard.js';
import {
  resolveBoatRoute,
  TEAT_BOAT_EXTENSION,
} from '../../navigation/guards/readiness.guard.js';

export interface BoatExtensionPort {
  installed(): boolean;
  load(route: string): Promise<unknown>;
}

@Directive()
abstract class BoatRouteBoundary implements OnInit {
  readonly externalComponent = signal<Type<unknown> | null>(null);
  protected abstract readonly routePath: string;
  private readonly extension = inject(TEAT_BOAT_EXTENSION);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly pendingTasks = inject(PendingTasks);

  ngOnInit(): void {
    void this.pendingTasks.run(async () => {
      const result = await resolveBoatRoute(this.routePath, this.extension);
      if (result.kind !== 'loaded' || typeof result.component !== 'function') {
        return;
      }
      this.externalComponent.set(result.component as Type<unknown>);
      this.changeDetector.detectChanges();
    });
  }
}

@Component({
  selector: 'teat-crash-start-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashStartBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-start';
}

@Component({
  selector: 'teat-crash-location-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashLocationBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-location';
}

@Component({
  selector: 'teat-crash-conditions-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashConditionsBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-conditions';
}

@Component({
  selector: 'teat-crash-vehicles-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashVehiclesBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-vehicles';
}

@Component({
  selector: 'teat-crash-people-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashPeopleBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-people';
}

@Component({
  selector: 'teat-crash-victims-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashVictimsBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-victims';
}

@Component({
  selector: 'teat-crash-dynamics-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashDynamicsBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-dynamics';
}

@Component({
  selector: 'teat-crash-sketch-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashSketchBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-sketch';
}

@Component({
  selector: 'teat-crash-evidence-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashEvidenceBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-evidence';
}

@Component({
  selector: 'teat-crash-ait-links-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashAitLinksBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-ait-links';
}

@Component({
  selector: 'teat-crash-damages-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashDamagesBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-damages';
}

@Component({
  selector: 'teat-crash-review-boundary',
  standalone: true,
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="externalComponent()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashReviewBoundaryComponent extends BoatRouteBoundary {
  protected readonly routePath = 'crash-review';
}

export const SINISTRO_ROUTES: Routes = [
  teatRoute(
    {
      path: 'crash-start',
      uxCode: 'UX-MOB-060',
      sourceSheet: 'IU-TEAT-crash-start.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashStartBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashStartBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-location',
      uxCode: 'UX-MOB-061',
      sourceSheet: 'IU-TEAT-crash-location.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashLocationBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashLocationBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-conditions',
      uxCode: 'UX-MOB-062',
      sourceSheet: 'IU-TEAT-crash-conditions.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashConditionsBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashConditionsBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-vehicles',
      uxCode: 'UX-MOB-063',
      sourceSheet: 'IU-TEAT-crash-vehicles.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashVehiclesBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashVehiclesBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-people',
      uxCode: 'UX-MOB-064',
      sourceSheet: 'IU-TEAT-crash-people.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashPeopleBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashPeopleBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-victims',
      uxCode: 'UX-MOB-065',
      sourceSheet: 'IU-TEAT-crash-victims.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashVictimsBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashVictimsBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-dynamics',
      uxCode: 'UX-MOB-066',
      sourceSheet: 'IU-TEAT-crash-dynamics.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashDynamicsBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashDynamicsBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-sketch',
      uxCode: 'UX-MOB-067',
      sourceSheet: 'IU-TEAT-crash-sketch.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashSketchBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashSketchBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-evidence',
      uxCode: 'UX-MOB-068',
      sourceSheet: 'IU-TEAT-crash-evidence.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashEvidenceBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashEvidenceBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-ait-links',
      uxCode: 'UX-MOB-069',
      sourceSheet: 'IU-TEAT-crash-ait-links.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashAitLinksBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashAitLinksBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-damages',
      uxCode: 'source_pending',
      sourceSheet: 'IU-BOAT-S-12.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashDamagesBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashDamagesBoundaryComponent,
  ),
  teatRoute(
    {
      path: 'crash-review',
      uxCode: 'UX-MOB-070',
      sourceSheet: 'IU-TEAT-crash-review.md',
      guardPlan: 'B+S, BOAT',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sinistro/sinistro.routes.ts#CrashReviewBoundaryComponent',
      boatExtension: true,
    },
    async () => CrashReviewBoundaryComponent,
  ),
];
