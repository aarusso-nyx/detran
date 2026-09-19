// PortalClock (contrato CTG-0003a §1; CODESTYLE.md §TypeScript: sem `Date.now()` em código de
// domínio — o relógio é injetado). `acceptedAt` do `ConsequenceDialog` e o `now` do
// `OfflineDocumentStore` vêm daqui; os specs substituem por `useValue` com o relógio fixo do §9.
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root', useFactory: () => new SystemClock() })
export abstract class PortalClock {
  abstract now(): Date;
}

export class SystemClock extends PortalClock {
  now(): Date {
    return new Date();
  }
}
