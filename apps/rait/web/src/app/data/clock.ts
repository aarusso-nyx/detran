// Relógio injetável do app (contrato CTG-0002b §3.2; OD-R12-032; CODESTYLE.md "no Date.now() in
// domain code (inject Clock)"): ÚNICO lugar de `apps/rait/web` com `Date.now()`. Serve só à
// validade do cache de leitura (`data/facades/read-store.ts`, TTL); nenhum prazo, tempestividade
// ou ordem é calculado no cliente ([RN-RAIT-005], [RN-RAIT-141]). Substituído nos testes por
// `src/testing/clock.stub.ts` (`{ provide: RaitClock, useValue: createClockStub() }`).
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RaitClock {
  /** Milissegundos desde a época (só para TTL de cache). */
  now(): number {
    return Date.now();
  }
}
