import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { translateBoat } from '../i18n-catalog.js';

const BOAT_PAGE_TEMPLATE = `
  <main>
    <h1>{{ translate(title) }}</h1>
    <p role="status">{{ translate(status) }}</p>
  </main>
`;

abstract class BoatPage {
  abstract readonly title: string;
  readonly status: string = 'boat.states.EM_ATENDIMENTO';

  private readonly i18n = inject(StynxI18nService, { optional: true });

  translate(key: string): string {
    const runtimeValue = this.i18n?.translate(key);
    if (
      runtimeValue !== undefined &&
      runtimeValue !== key &&
      !runtimeValue.startsWith('source_pending:')
    ) {
      return runtimeValue;
    }
    return translateBoat(key) ?? key;
  }
}

@Component({
  selector: 'boat-crash-start-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashStartPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_start.title';
}
@Component({
  selector: 'boat-crash-location-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashLocationPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_location.title';
}
@Component({
  selector: 'boat-crash-conditions-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashConditionsPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_conditions.title';
}
@Component({
  selector: 'boat-crash-vehicles-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashVehiclesPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_vehicles.title';
}
@Component({
  selector: 'boat-crash-people-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashPeoplePageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_people.title';
}
@Component({
  selector: 'boat-crash-victims-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashVictimsPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_victims.title';
}
@Component({
  selector: 'boat-crash-dynamics-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashDynamicsPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_dynamics.title';
}
@Component({
  selector: 'boat-crash-sketch-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashSketchPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_sketch.title';
}
@Component({
  selector: 'boat-crash-evidence-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashEvidencePageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_evidence.title';
  override readonly status = 'boat.legal.photo_scene_not_suffering';
}
@Component({
  selector: 'boat-crash-ait-links-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashAitLinksPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_ait_links.title';
}
@Component({
  selector: 'boat-crash-damages-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashDamagesPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_damages.title';
}
@Component({
  selector: 'boat-crash-review-page',
  standalone: true,
  template: BOAT_PAGE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashReviewPageComponent extends BoatPage {
  readonly title = 'boat.screens.crash_review.title';
}
