/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  create(@Body() body: { name: string; companyId: string }) {
    return this.rolesService.createRole(body.name, body.companyId);
  }

  @Post('assign')
  assign(@Body() body: { userId: string; roleId: string }) {
    return this.rolesService.assignRoleToUser(body.userId, body.roleId);
  }

  @Get('company/:companyId')
  list(@Param('companyId') companyId: string) {
    return this.rolesService.listRoles(companyId);
  }
}
