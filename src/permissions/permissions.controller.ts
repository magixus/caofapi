import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/decorators/roles.decorator';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('admin')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Post()
  create(@Body() body: { action: string; resource: string }) {
    return this.permissionsService.createPermission(body.action, body.resource);
  }

  @Post('assign')
  assign(@Body() body: { permissionId: string; roleId: string }) {
    return this.permissionsService.assignPermissionToRole(
      body.permissionId,
      body.roleId,
    );
  }

  @Get('role/:roleId')
  getPermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getPermissionsForRole(roleId);
  }
}
