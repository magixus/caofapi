import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '@/audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, body, params } = request;
    const userAgent = request.get('user-agent') || '';

    // Extract resource from URL (e.g., /api/patients -> patients)
    const urlParts = url.split('/').filter(Boolean);
    const resource = urlParts[0] || 'unknown';

    // Map HTTP methods to audit actions
    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      GET: AuditAction.READ,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = actionMap[method] || AuditAction.READ;

    // Skip logging for certain endpoints (health checks, etc.)
    const skipEndpoints = ['/health', '/healthz', '/docs', '/favicon.ico'];
    if (skipEndpoints.some((endpoint) => url.includes(endpoint))) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;

        // Log successful operations
        if (user) {
          const resourceId = params?.id || body?.id || response?.id;
          
          await this.auditService.log({
            userId: user.userId,
            userEmail: user.email,
            userRole: user.roles?.join(', '),
            action,
            resource,
            resourceId,
            method,
            endpoint: url,
            ipAddress: ip,
            userAgent,
            status: 'success',
            message: `${method} ${url} completed successfully`,
            metadata: {
              duration,
              resourceId,
              statusCode: 200,
            },
          });
        }
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;

        // Log failed operations
        if (user) {
          await this.auditService.log({
            userId: user.userId,
            userEmail: user.email,
            userRole: user.roles?.join(', '),
            action,
            resource,
            method,
            endpoint: url,
            ipAddress: ip,
            userAgent,
            status: 'error',
            message: `${method} ${url} failed: ${error.message}`,
            metadata: {
              duration,
              error: error.message,
              statusCode: error.status || 500,
              stack: error.stack,
            },
          });
        }

        throw error;
      }),
    );
  }
}
