// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.command-matrix.spec.ts" (C-02-71; C-01-11).
// Um `it` por comando × papel: 16 × 36 = 576, sobre `StynxDashboardSessionFacade.can`, sem
// amostragem (A15).
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import {
  DashboardSessionFacade,
  StynxDashboardSessionFacade,
} from './core/session.facade.js';
import { DETRAN_ROLES_FIXTURE } from '../testing/roles.fixture.js';
import {
  COMMAND_MATRIX_FIXTURE,
  expectedCommandResult,
} from '../testing/command-matrix.fixture.js';
import { sessionForRoles } from '../testing/stynx-session.stub.js';

const COMMANDS = Object.keys(COMMAND_MATRIX_FIXTURE);

const CASES = COMMANDS.flatMap((command) =>
  DETRAN_ROLES_FIXTURE.map((role) => ({ command, role })),
);

describe('app.command-matrix.spec.ts', () => {
  it('dado COMMAND_MATRIX_FIXTURE quando contado então 16 comandos e 576 pares comando × papel', () => {
    expect(COMMANDS).toHaveLength(16);
    expect(CASES).toHaveLength(16 * 36);
  });

  it.each(CASES)(
    'dado o comando $command e o papel $role quando session.can então = expectedCommandResult (C-02-71)',
    ({ command, role }) => {
      TestBed.configureTestingModule({
        providers: [
          { provide: StynxSessionService, useValue: sessionForRoles([role]) },
          {
            provide: DashboardSessionFacade,
            useClass: StynxDashboardSessionFacade,
          },
        ],
      });
      const facade = TestBed.inject(DashboardSessionFacade);
      expect(facade.can(command)).toBe(expectedCommandResult(command, role));
    },
  );
});
