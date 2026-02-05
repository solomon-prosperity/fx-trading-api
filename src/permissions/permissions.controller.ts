import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@ApiTags('Permissions')
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('/v1/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Get All Permissions' })
  @ApiQuery({ type: GetPermissionsDto })
  @Permissions(['view:Permission'])
  @Get()
  @HttpCode(200)
  async findAll(@Query() payload: GetPermissionsDto) {
    const response = await this.permissionsService.findAll(payload);
    return {
      response,
      message: 'Permissions retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get a permission' })
  @ApiParam({ name: 'permission_id', description: 'ID of the permission' })
  @Permissions(['view:Permission'])
  @Get(':permission_id')
  @HttpCode(200)
  async findOne(@Param('permission_id') permission_id: string) {
    const response = await this.permissionsService.findOne(permission_id);
    return {
      response,
      message: 'Permission retrieved successfully!',
    };
  }
}
