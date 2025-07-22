/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
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
