import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '@/audit/audit.service';

export const RESOURCE_ROLES_KEY = 'resourceRoles';

export interface ResourceRoleConfig {
  resource: string;
  action: string;
  allowedRoles: string[];
}

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<ResourceRoleConfig>(
      RESOURCE_ROLES_KEY,
      context.getHandler(),
    );

    if (!config) {
      return true; // No specific resource role requirements
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get user roles from the user object
    const userRoles = user.roles || [];
    const hasRequiredRole = config.allowedRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      // Log the unauthorized attempt
      await this.auditService.logAccessDenied(
        user.userId,
        user.email,
        userRoles.join(', '),
        config.resource,
        config.allowedRoles,
        request.url,
        request.ip,
      );

      throw new ForbiddenException(
        `Access denied. Only ${config.allowedRoles.join(', ')} can ${config.action} ${config.resource}. Your role(s): ${userRoles.join(', ')}`,
      );
    }

    return true;
  }
}
