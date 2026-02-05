import {
  Controller,
  Get,
  Body,
  Put,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { instanceToPlain } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { Request as ExpressRequest } from 'express';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get a user profile' })
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async findOne(@CurrentUser() currentUser: User) {
    const response = await this.usersService.getUser({
      user_id: currentUser.user_id,
    });
    return {
      response: instanceToPlain(response),
      message: 'User retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Update a user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @Put('me')
  async update(
    @CurrentUser() currentUser: User,
    @Body() payload: UpdateProfileDto,
  ) {
    const response = await this.usersService.updateProfile(
      currentUser.user_id,
      payload,
    );
    return {
      response: instanceToPlain(response),
      message: 'User updated successfully!',
    };
  }

  @ApiOperation({ summary: 'Change Password' })
  @ApiBody({ type: ChangePasswordDto })
  @Put('password')
  async changePassword(
    @CurrentUser() currentUser: User,
    @Body() payload: ChangePasswordDto,
    @Request() request: ExpressRequest,
  ) {
    const response = await this.usersService.changePassword(
      currentUser.user_id,
      payload,
      request,
    );
    return {
      response: instanceToPlain(response),
      message: 'Password updated successfully!',
    };
  }

  @ApiOperation({ summary: 'Delete a user account' })
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser() currentUser: User) {
    const response = await this.usersService.deleteAccount(currentUser.user_id);
    return {
      response: instanceToPlain(response),
      message: 'Account deactivated successfully!',
    };
  }
}
