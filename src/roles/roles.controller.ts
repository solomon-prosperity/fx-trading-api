import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@ApiTags('Roles')
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('/v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create Role' })
  @ApiBody({ type: CreateRoleDto })
  @Permissions(['create:Role'])
  @Post()
  async create(@Body() payload: CreateRoleDto) {
    const response = await this.rolesService.create(payload);
    return {
      response,
      message: 'Role created successfully!',
    };
  }

  @ApiOperation({ summary: 'Get All Roles' })
  @ApiQuery({ type: GetRolesDto })
  @Permissions(['view:Role'])
  @Get()
  @HttpCode(200)
  async findAll(@Query() payload: GetRolesDto) {
    const response = await this.rolesService.findAll(payload);
    return {
      response,
      message: 'Roles retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get role users' })
  @ApiParam({ name: 'role_id', description: 'ID of the role' })
  @Permissions(['view:Role'])
  @Get(':role_id/users')
  @HttpCode(200)
  async getRoleUsers(@Param('role_id') role_id: string) {
    const response = await this.rolesService.getRoleUsers(role_id);
    return {
      response,
      message: 'Role users retrieved successfully',
    };
  }

  @ApiOperation({ summary: 'Get a role' })
  @ApiParam({ name: 'role_id', description: 'ID of the role' })
  @Permissions(['view:Role'])
  @Get(':role_id')
  @HttpCode(200)
  async findOne(@Param('role_id') role_id: string) {
    const response = await this.rolesService.findOne(role_id);
    return {
      response,
      message: 'Role retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'role_id', description: 'ID of the role' })
  @ApiBody({ type: UpdateRoleDto })
  @Permissions(['update:Role'])
  @Put(':role_id')
  async update(
    @Param('role_id') role_id: string,
    @Body() payload: UpdateRoleDto,
  ) {
    const response = await this.rolesService.update(role_id, payload);
    return {
      response,
      message: 'Role updated successfully!',
    };
  }

  @ApiOperation({ summary: 'Remove a role' })
  @ApiParam({ name: 'role_id', description: 'ID of the permission' })
  @Permissions(['delete:Role'])
  @Delete(':role_id')
  @HttpCode(200)
  async remove(@Param('role_id') role_id: string) {
    const response = await this.rolesService.remove(role_id);
    return {
      response,
      message: 'Role removed successfully!',
    };
  }
}
