import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';

import type { CreateProfessionalDto } from './dto/create-professional.dto.js';
import type { Professional } from './entities/professional.entity.js';
import {
  CouncilVerificationHttpAdapter,
  type CouncilVerificationReceipt,
  type CouncilVerificationRequest,
} from './council-verification.http-adapter.js';
import { ProfessionalRepository } from './repositories/professional.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

type ProfessionalKind =
  'MEDICO' | 'PSICOLOGO' | 'TECNICO_BIOMETRIA' | 'SUPERVISOR' | 'RECEPCAO';

interface CouncilIdentity extends CouncilVerificationRequest {}

interface CouncilCacheRow {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const SUPPORTED_KINDS = new Set<ProfessionalKind>([
  'MEDICO',
  'PSICOLOGO',
  'TECNICO_BIOMETRIA',
  'SUPERVISOR',
  'RECEPCAO',
]);

@Injectable()
export class ProfessionalLifecycleService {
  constructor(
    private readonly professionals: ProfessionalRepository,
    private readonly council: CouncilVerificationHttpAdapter,
  ) {}

  async create(input: CreateProfessionalDto): Promise<Professional> {
    const normalized = this.normalize(input);
    const identity = this.requireCouncilIdentity(normalized);
    if (identity) await this.ensureCouncilCached(identity);
    return this.professionals.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      await this.assertActiveClinic(tx, normalized.clinic_id);
      if (identity) {
        await this.assertActiveCouncil(tx, identity);
      }
      return this.professionals.create(normalized, transaction);
    });
  }

  async update(
    id: string,
    input: Partial<CreateProfessionalDto>,
  ): Promise<Professional> {
    if (!Object.values(input).some((value) => value !== undefined)) {
      return this.professionals.findOne(id);
    }
    const current = await this.loadCurrent(id);
    const patch = this.normalizePatch(input);
    const target = this.normalize({ ...current, ...patch });
    const identity = this.requireCouncilIdentity(target);
    if (identity) await this.ensureCouncilCached(identity);
    return this.professionals.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const locked = await tx.query<Professional & Record<string, unknown>>(
        'select * from ch.professional where id = $1 for update',
        [id],
      );
      const latest = locked.rows[0];
      if (!latest) throw new NotFoundException('Professional not found');
      if (latest.updated_at !== current.updated_at) {
        throw new ConflictException('Professional changed during validation');
      }
      await this.assertActiveClinic(tx, target.clinic_id);
      if (identity) {
        await this.assertActiveCouncil(tx, identity);
      }
      return this.professionals.update(id, patch, transaction);
    });
  }

  private loadCurrent(id: string): Promise<Professional> {
    return this.professionals.findOne(id);
  }

  private async ensureCouncilCached(identity: CouncilIdentity): Promise<void> {
    const cached = await this.professionals.transaction(async (transaction) =>
      this.findCouncil(transaction as SqlTransaction, identity),
    );
    if (cached) {
      if (cached.status !== 'ACTIVE') {
        throw new UnprocessableEntityException(
          'Professional council status is not active',
        );
      }
      return;
    }
    const receipt = await this.council.verify(identity);
    await this.professionals.transaction(async (transaction) =>
      this.persistReceipt(transaction as SqlTransaction, identity, receipt),
    );
    if (receipt.status !== 'ACTIVE') {
      throw new UnprocessableEntityException(
        'Professional council status is not active',
      );
    }
  }

  private async persistReceipt(
    tx: SqlTransaction,
    identity: CouncilIdentity,
    receipt: CouncilVerificationReceipt,
  ): Promise<void> {
    await tx.query(
      `insert into integration.professional_council_cache
        (council_type, council_number, council_state, professional_name,
         status, provider_checked_at, response_sha256)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (tenant_id, council_type, council_number, council_state)
       do update set professional_name = excluded.professional_name,
                     status = excluded.status,
                     provider_checked_at = excluded.provider_checked_at,
                     response_sha256 = excluded.response_sha256,
                     updated_at = now()`,
      [
        identity.councilType,
        identity.councilNumber,
        identity.councilState,
        receipt.professionalName ?? identity.professionalName,
        receipt.status,
        receipt.providerCheckedAt,
        receipt.responseSha256,
      ],
    );
  }

  private async assertActiveCouncil(
    tx: SqlTransaction,
    identity: CouncilIdentity,
  ): Promise<void> {
    const cached = await this.findCouncil(tx, identity);
    if (!cached || cached.status !== 'ACTIVE') {
      throw new UnprocessableEntityException(
        'Professional council status is not active',
      );
    }
  }

  private async findCouncil(
    tx: SqlTransaction,
    identity: CouncilIdentity,
  ): Promise<CouncilCacheRow | undefined> {
    const result = await tx.query<CouncilCacheRow>(
      `select status from integration.professional_council_cache
        where council_type = $1 and council_number = $2 and council_state = $3
        limit 1`,
      [identity.councilType, identity.councilNumber, identity.councilState],
    );
    return result.rows[0];
  }

  private async assertActiveClinic(
    tx: SqlTransaction,
    clinicId: string,
  ): Promise<void> {
    const clinic = await tx.query<{ id: string }>(
      'select id from ch.clinic where id = $1 and is_active',
      [clinicId],
    );
    if (!clinic.rows[0]) {
      throw new UnprocessableEntityException('Clinic not found or inactive');
    }
  }

  private requireCouncilIdentity(
    professional: CreateProfessionalDto,
  ): CouncilIdentity | undefined {
    const kind = professional.professional_kind as ProfessionalKind;
    if (!SUPPORTED_KINDS.has(kind)) {
      throw new UnprocessableEntityException(
        'Role not supported for professionals',
      );
    }
    const expected =
      kind === 'MEDICO' ? 'CRM' : kind === 'PSICOLOGO' ? 'CRP' : undefined;
    const type = professional.council_type;
    if (expected && type !== expected) {
      throw new UnprocessableEntityException(
        `Professionals ${kind} require an active ${expected} council`,
      );
    }
    if (expected || (type && type !== 'OUTRO')) {
      if (
        (type !== 'CRM' && type !== 'CRP') ||
        !professional.council_number ||
        !professional.council_state
      ) {
        throw new UnprocessableEntityException(
          'CRM/CRP verification requires type, number, and state',
        );
      }
      return {
        councilType: type,
        councilNumber: professional.council_number,
        councilState: professional.council_state,
        professionalName: professional.person_name,
      };
    }
    return undefined;
  }

  private normalize(input: CreateProfessionalDto): CreateProfessionalDto {
    const kind = input.professional_kind.trim().toUpperCase();
    return {
      ...input,
      clinic_id: input.clinic_id.trim(),
      person_name: input.person_name.trim(),
      document_cpf: input.document_cpf?.replace(/\D/gu, '') || null,
      professional_kind: kind,
      council_type: input.council_type?.trim().toUpperCase() || null,
      council_number: input.council_number?.trim().toUpperCase() || null,
      council_state: input.council_state?.trim().toUpperCase() || null,
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
    };
  }

  private normalizePatch(
    input: Partial<CreateProfessionalDto>,
  ): Partial<CreateProfessionalDto> {
    const normalized: Partial<CreateProfessionalDto> = { ...input };
    if (input.clinic_id !== undefined)
      normalized.clinic_id = input.clinic_id.trim();
    if (input.person_name !== undefined)
      normalized.person_name = input.person_name.trim();
    if (input.document_cpf !== undefined)
      normalized.document_cpf = input.document_cpf?.replace(/\D/gu, '') || null;
    if (input.professional_kind !== undefined)
      normalized.professional_kind = input.professional_kind
        .trim()
        .toUpperCase();
    if (input.council_type !== undefined)
      normalized.council_type =
        input.council_type?.trim().toUpperCase() || null;
    if (input.council_number !== undefined)
      normalized.council_number =
        input.council_number?.trim().toUpperCase() || null;
    if (input.council_state !== undefined)
      normalized.council_state =
        input.council_state?.trim().toUpperCase() || null;
    if (input.email !== undefined)
      normalized.email = input.email?.trim().toLowerCase() || null;
    if (input.phone !== undefined)
      normalized.phone = input.phone?.trim() || null;
    return normalized;
  }
}
