import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'boat-severity-picker',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeverityPickerComponent {
  readonly label = 'boat.screens.crash_start.title';
}
@Component({
  selector: 'boat-conditions-quad',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionsQuadComponent {
  readonly label = 'boat.screens.crash_conditions.title';
}
@Component({
  selector: 'boat-involved-list',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvolvedListComponent {
  readonly label = 'boat.screens.crash_people.title';
}
@Component({
  selector: 'boat-victim-card',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VictimCardComponent {
  readonly label = 'boat.screens.crash_victims.title';
}
@Component({
  selector: 'boat-scene-duty-checklist',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneDutyChecklistComponent {
  readonly label = 'boat.screens.crash_dynamics.title';
}
@Component({
  selector: 'boat-damage-witness-form',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DamageWitnessFormComponent {
  readonly label = 'boat.screens.crash_damages.title';
}
@Component({
  selector: 'boat-crash-links-panel',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrashLinksPanelComponent {
  readonly label = 'boat.screens.crash_ait_links.title';
}
@Component({
  selector: 'boat-preliminary-report-button',
  standalone: true,
  template: '<button type="button" [attr.aria-label]="label"></button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreliminaryReportButtonComponent {
  readonly label = 'boat.screens.crash_review.title';
}
@Component({
  selector: 'boat-minimum-data-checklist',
  standalone: true,
  template: '<section [attr.aria-label]="label"></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinimumDataChecklistComponent {
  readonly label = 'boat.screens.crash_review.title';
}
