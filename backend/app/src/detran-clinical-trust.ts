import { Injectable, OnModuleInit } from '@nestjs/common';
import type { StynxHealthIndicator } from '@stynx-nyx/health';

import { PadesSigningHttpAdapter } from '@detran/ch-clinical-reports';

export class DetranClinicalTrustReadiness implements StynxHealthIndicator {
  readonly name = 'clinical-trust';
  private signing: PadesSigningHttpAdapter | undefined;

  bind(signing: PadesSigningHttpAdapter): void {
    this.signing = signing;
  }

  async assertReady(): Promise<void> {
    if (!this.signing) {
      throw new Error('Clinical trust readiness is not bound');
    }
    await this.signing.checkCapabilities();
  }

  async check(): Promise<{
    status: 'up' | 'down';
    details?: Record<string, unknown>;
  }> {
    try {
      await this.assertReady();
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        details: {
          reason:
            error instanceof Error ? error.message : 'unknown trust failure',
        },
      };
    }
  }
}

@Injectable()
export class DetranClinicalTrustReadinessBinder implements OnModuleInit {
  constructor(
    private readonly signing: PadesSigningHttpAdapter,
    private readonly readiness: DetranClinicalTrustReadiness,
  ) {}

  async onModuleInit(): Promise<void> {
    this.readiness.bind(this.signing);
    await this.readiness.assertReady();
  }
}
