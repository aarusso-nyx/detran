import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminAddUserToGroupCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminResetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ListGroupsCommand,
  ListUsersCommand,
  type AttributeType,
  type UserType,
} from '@aws-sdk/client-cognito-identity-provider';

export interface CognitoAdminListQuery {
  email?: string;
  phone?: string;
  limit?: number;
  token?: string;
}

@Injectable()
export class PecCognitoAdminService {
  constructor(
    private readonly client: Pick<CognitoIdentityProviderClient, 'send'>,
    private readonly userPoolId: string,
  ) {}

  async list(query: CognitoAdminListQuery) {
    this.assertConfigured();
    const filters = [
      query.email ? `email ^= "${this.filterValue(query.email)}"` : '',
      query.phone ? `phone_number ^= "${this.filterValue(query.phone)}"` : '',
    ].filter(Boolean);
    const response = await this.client.send(
      new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: filters.join(' and ') || undefined,
        Limit: query.limit,
        PaginationToken: query.token,
      }),
    );
    return {
      items: (response.Users ?? []).map((user) => this.summary(user)),
      nextToken: response.PaginationToken,
    };
  }

  async get(username: string) {
    this.assertConfigured();
    const response = await this.client.send(
      new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      }),
    );
    return {
      username: response.Username,
      status: response.UserStatus,
      enabled: Boolean(response.Enabled),
      createdAt: response.UserCreateDate,
      updatedAt: response.UserLastModifiedDate,
      attributes: this.attributes(response.UserAttributes),
    };
  }

  async update(
    username: string,
    body: {
      email?: string;
      phone_number?: string;
      custom?: Record<string, string>;
    },
  ) {
    const attributes: AttributeType[] = [];
    if (body.email !== undefined)
      attributes.push({ Name: 'email', Value: body.email });
    if (body.phone_number !== undefined)
      attributes.push({ Name: 'phone_number', Value: body.phone_number });
    for (const [key, value] of Object.entries(body.custom ?? {}))
      attributes.push({ Name: `custom:${key}`, Value: value });
    this.assertConfigured();
    if (attributes.length)
      await this.client.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: this.userPoolId,
          Username: username,
          UserAttributes: attributes,
        }),
      );
    return this.get(username);
  }

  disable(username: string) {
    return this.ok(
      new AdminDisableUserCommand({
        UserPoolId: this.pool(),
        Username: username,
      }),
    );
  }
  enable(username: string) {
    return this.ok(
      new AdminEnableUserCommand({
        UserPoolId: this.pool(),
        Username: username,
      }),
    );
  }
  addToGroup(username: string, groupName: string) {
    return this.ok(
      new AdminAddUserToGroupCommand({
        UserPoolId: this.pool(),
        Username: username,
        GroupName: groupName,
      }),
    );
  }
  removeFromGroup(username: string, groupName: string) {
    return this.ok(
      new AdminRemoveUserFromGroupCommand({
        UserPoolId: this.pool(),
        Username: username,
        GroupName: groupName,
      }),
    );
  }

  async listGroups(username: string) {
    const response = await this.client.send(
      new AdminListGroupsForUserCommand({
        UserPoolId: this.pool(),
        Username: username,
      }),
    );
    return (response.Groups ?? []).map((group) => ({
      name: group.GroupName,
      description: group.Description,
    }));
  }
  async listAllGroups(query: { limit?: number; token?: string } = {}) {
    const response = await this.client.send(
      new ListGroupsCommand({
        UserPoolId: this.pool(),
        Limit: query.limit,
        NextToken: query.token,
      }),
    );
    return {
      items: (response.Groups ?? []).map((group) => ({
        name: group.GroupName,
        description: group.Description,
      })),
      nextToken: response.NextToken,
    };
  }
  async resetPassword(username: string) {
    try {
      return await this.ok(
        new AdminResetUserPasswordCommand({
          UserPoolId: this.pool(),
          Username: username,
        }),
      );
    } catch (error) {
      if ((error as { name?: string }).name === 'UserNotFoundException')
        throw new NotFoundException('Cognito user not found');
      if (
        ['NotAuthorizedException', 'AccessDeniedException'].includes(
          (error as { name?: string }).name ?? '',
        )
      )
        throw new ForbiddenException('Not authorized to reset password');
      throw error;
    }
  }
  async verify(username: string, body: { email?: boolean; phone?: boolean }) {
    const attributes: AttributeType[] = [];
    if (body.email) attributes.push({ Name: 'email_verified', Value: 'true' });
    if (body.phone)
      attributes.push({ Name: 'phone_number_verified', Value: 'true' });
    if (!attributes.length)
      throw new BadRequestException(
        'At least one verification target is required',
      );
    return this.ok(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: this.pool(),
        Username: username,
        UserAttributes: attributes,
      }),
    );
  }

  private async ok(command: unknown): Promise<{ ok: true }> {
    await this.client.send(command as never);
    return { ok: true };
  }
  private pool(): string {
    this.assertConfigured();
    return this.userPoolId;
  }
  private assertConfigured(): void {
    if (!this.userPoolId)
      throw new BadRequestException(
        'DETRAN_COGNITO_USER_POOL_ID is not configured',
      );
  }
  private filterValue(value: string): string {
    if (/['"\\]/u.test(value))
      throw new BadRequestException('Invalid Cognito filter value');
    return value;
  }
  private attributes(
    items: AttributeType[] | undefined,
  ): Record<string, string> {
    return Object.fromEntries(
      (items ?? [])
        .filter((item) => item.Name)
        .map((item) => [item.Name!, item.Value ?? '']),
    );
  }
  private summary(user: UserType) {
    const attributes = this.attributes(user.Attributes);
    return {
      username: user.Username,
      status: user.UserStatus,
      enabled: Boolean(user.Enabled),
      createdAt: user.UserCreateDate,
      updatedAt: user.UserLastModifiedDate,
      email: attributes.email ?? null,
      phone_number: attributes.phone_number ?? null,
    };
  }
}
