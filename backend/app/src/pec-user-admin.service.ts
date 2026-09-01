import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
export interface PecUserAdminCommand {
  email: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
  oidcSub?: string;
  isActive?: boolean;
  roles: string[];
}
export interface PecUserAdminQuery {
  page?: number;
  pageSize?: number;
}

const USER_SELECT = `u.id, u.email, u.display_name as "displayName",
  u.given_name as "givenName", u.family_name as "familyName",
  u.oidc_sub as "oidcSub", u.is_active as "isActive",
  u.created_at as "createdAt", u.updated_at as "updatedAt"`;

@Injectable()
export class PecUserAdminService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  list(query: PecUserAdminQuery = {}) {
    const pageSize = Math.min(Math.max(query.pageSize ?? 50, 1), 500);
    const offset = (Math.max(query.page ?? 1, 1) - 1) * pageSize;
    return this.transaction(
      async (tx, tenantId) =>
        (
          await tx.query(
            `select ${USER_SELECT}, coalesce(array_agg(r.key order by r.key) filter (where r.key is not null), '{}') as roles
         from auth.users u join auth.memberships m on m.user_id = u.id
    left join auth.membership_roles mr on mr.membership_id = m.id
    left join auth.roles r on r.id = mr.role_id
        where m.tenant_id = $1::uuid
     group by u.id order by u.display_name, u.email limit $2 offset $3`,
            [tenantId, pageSize, offset],
          )
        ).rows,
      true,
    );
  }

  create(command: PecUserAdminCommand) {
    return this.transaction(async (tx, tenantId) => {
      const roleIds = await this.roleIds(command.roles, tenantId, tx);
      const user = (
        await tx.query<{ id: string }>(
          `insert into auth.users (tenant_id, email, display_name, given_name, family_name, oidc_sub, is_active)
         values ($1::uuid, $2, $3, $4, $5, $6, $7) returning id`,
          [
            tenantId,
            command.email.trim().toLowerCase(),
            command.displayName.trim(),
            command.givenName?.trim() || null,
            command.familyName?.trim() || null,
            command.oidcSub ?? null,
            command.isActive ?? true,
          ],
        )
      ).rows[0];
      const membership = (
        await tx.query<{ id: string }>(
          `insert into auth.memberships (tenant_id, user_id, is_active) values ($1::uuid, $2::uuid, $3) returning id`,
          [tenantId, user.id, command.isActive ?? true],
        )
      ).rows[0];
      await this.replaceRoles(membership.id, roleIds, tx);
      return this.find(user.id, tenantId, tx);
    });
  }

  update(id: string, command: Partial<PecUserAdminCommand>) {
    return this.transaction(async (tx, tenantId) => {
      const fields: string[] = [];
      const values: unknown[] = [];
      const add = (field: string, value: unknown) => {
        values.push(value);
        fields.push(`${field} = $${values.length}`);
      };
      if (command.email !== undefined)
        add('email', command.email.trim().toLowerCase());
      if (command.displayName !== undefined)
        add('display_name', command.displayName.trim());
      if (command.givenName !== undefined)
        add('given_name', command.givenName?.trim() || null);
      if (command.familyName !== undefined)
        add('family_name', command.familyName?.trim() || null);
      if (command.oidcSub !== undefined)
        add('oidc_sub', command.oidcSub || null);
      if (command.isActive !== undefined) add('is_active', command.isActive);
      if (fields.length) {
        values.push(id, tenantId);
        const updated = await tx.query(
          `update auth.users u set ${fields.join(', ')}, updated_at = now()
            from auth.memberships m where u.id = $${values.length - 1}::uuid and m.user_id = u.id and m.tenant_id = $${values.length}::uuid returning u.id`,
          values,
        );
        if (!updated.rows[0]) throw new NotFoundException('User not found');
      }
      if (command.roles !== undefined) {
        const membership = await this.membership(id, tenantId, tx);
        await this.replaceRoles(
          membership.id,
          await this.roleIds(command.roles, tenantId, tx),
          tx,
        );
      }
      return this.find(id, tenantId, tx);
    });
  }

  deactivate(id: string) {
    return this.transaction(async (tx, tenantId) => {
      const result = await tx.query(
        `with membership as (
           update auth.memberships set is_active = false
            where user_id = $1::uuid and tenant_id = $2::uuid returning user_id)
         update auth.users set is_active = false, updated_at = now()
          where id in (select user_id from membership) returning id`,
        [id, tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException('User not found');
      return this.find(id, tenantId, tx);
    });
  }

  private async roleIds(
    keys: string[],
    tenantId: string,
    tx: SqlTransaction,
  ): Promise<string[]> {
    const unique = [...new Set(keys)];
    if (!unique.length)
      throw new UnprocessableEntityException(
        'At least one role must be provided',
      );
    const rows = (
      await tx.query<{ id: string; key: string }>(
        `select distinct on (key) id, key from auth.roles
        where key = any($2::text[]) and (tenant_id = $1::uuid or tenant_id is null)
        order by key, (tenant_id = $1::uuid) desc`,
        [tenantId, unique],
      )
    ).rows;
    const found = new Set(rows.map((row) => row.key));
    const missing = unique.filter((key) => !found.has(key));
    if (missing.length)
      throw new UnprocessableEntityException(
        `Roles not found: ${missing.join(', ')}`,
      );
    return rows.map((row) => row.id);
  }
  private async replaceRoles(
    membershipId: string,
    roleIds: string[],
    tx: SqlTransaction,
  ) {
    await tx.query(
      'delete from auth.membership_roles where membership_id = $1::uuid',
      [membershipId],
    );
    for (const roleId of roleIds)
      await tx.query(
        'insert into auth.membership_roles (membership_id, role_id) values ($1::uuid, $2::uuid) on conflict do nothing',
        [membershipId, roleId],
      );
  }
  private async membership(
    userId: string,
    tenantId: string,
    tx: SqlTransaction,
  ) {
    const row = (
      await tx.query<{ id: string }>(
        'select id from auth.memberships where user_id = $1::uuid and tenant_id = $2::uuid',
        [userId, tenantId],
      )
    ).rows[0];
    if (!row) throw new NotFoundException('User not found');
    return row;
  }
  private async find(userId: string, tenantId: string, tx: SqlTransaction) {
    const row = (
      await tx.query(
        `select ${USER_SELECT}, coalesce(array_agg(r.key order by r.key) filter (where r.key is not null), '{}') as roles
         from auth.users u join auth.memberships m on m.user_id = u.id
    left join auth.membership_roles mr on mr.membership_id = m.id
    left join auth.roles r on r.id = mr.role_id
        where u.id = $1::uuid and m.tenant_id = $2::uuid group by u.id`,
        [userId, tenantId],
      )
    ).rows[0];
    if (!row) throw new NotFoundException('User not found');
    return row;
  }
  private transaction<T>(
    work: (tx: SqlTransaction, tenantId: string) => Promise<T>,
    readonly = false,
  ): Promise<T> {
    const tenantId = this.requestContext.snapshot().tenantId;
    if (!tenantId)
      throw new UnprocessableEntityException('Tenant context is required');
    return this.database.tx((tx) => work(tx as SqlTransaction, tenantId), {
      role: 'app',
      readonly,
    });
  }
}
