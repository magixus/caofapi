import { SetMetadata } from '@nestjs/common';
import { RESOURCE_ROLES_KEY, ResourceRoleConfig } from '@/guards/resource-access.guard';

export const RequireResourceRoles = (
  resource: string,
  action: string,
  allowedRoles: string[],
) => SetMetadata(RESOURCE_ROLES_KEY, { resource, action, allowedRoles } as ResourceRoleConfig);
