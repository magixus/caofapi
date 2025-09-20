import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/decorators/roles.decorator';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';

@Controller('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('admin') // Assuming 'superadmin' is a role that can manage roles
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.rolesService.createRole(body.name);
  }

  @Post('assign')
  assign(@Body() body: { userId: string; roleId: string }) {
    return this.rolesService.assignRoleToUser(body.userId, body.roleId);
  }

  @Get()
  list() {
    return this.rolesService.listRoles();
  }
}
