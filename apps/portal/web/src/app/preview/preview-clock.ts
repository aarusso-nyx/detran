// Source: src/testing/http-fixtures.ts FIXED_CLOCK_ISO (CTG-0003a §9).
import { Injectable } from '@angular/core';
import { PortalClock } from '../core/clock';

@Injectable()
export class PreviewClock extends PortalClock {
  override now(): Date {
    return new Date('2026-09-14T12:00:00-04:00');
  }
}
