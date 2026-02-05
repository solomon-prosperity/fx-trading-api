import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { ActivitiesServices } from 'src/activities/activities.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { CompleteAdminSignupDto } from './dto/complete-admin-signup.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetAdminsDto } from './dto/get-admins-dto';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { AdminGetTransactionsDto } from 'src/transactions/dto/admin-get-transactions.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetActivitiesDto } from 'src/activities/dto/get-activities.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { instanceToPlain } from 'class-transformer';
import { Admin } from './entities/admin.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Admins')
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('/v1/admin')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesServices,
  ) {}

  @ApiOperation({ summary: 'Invite Admin' })
  @ApiBody({ type: InviteAdminDto })
  @Permissions(['create:Admin'])
  @Post()
  async inviteAdmin(@Body() payload: InviteAdminDto) {
    const response = await this.adminsService.inviteAdmin(payload);
    return {
      response: instanceToPlain(response),
      message: 'Admin invited successfully!',
    };
  }

  @ApiOperation({ summary: 'Get Admins' })
  @ApiQuery({ type: GetAdminsDto })
  @Get()
  @Permissions(['view:Admin'])
  @HttpCode(200)
  async getAdmins(@Query() payload: GetAdminsDto) {
    const response = await this.adminsService.getAdmins(payload);
    return {
      response: instanceToPlain(response),
      message: 'Admins retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Complete Admin Signup' })
  @ApiBody({ type: CompleteAdminSignupDto })
  @Public()
  @Post('complete-signup')
  @HttpCode(200)
  async completeSignup(@Body() payload: CompleteAdminSignupDto) {
    const response = await this.adminsService.completeSignup(payload);
    return {
      response: instanceToPlain(response),
      message: 'Admin updated successfully!',
    };
  }

  @ApiOperation({ summary: 'Update Profile' })
  @ApiBody({ type: UpdateProfileDto })
  @Put('me')
  @HttpCode(200)
  async updateProfile(
    @Body() payload: UpdateProfileDto,
    @CurrentUser() currentUser: Admin,
  ) {
    const response = await this.adminsService.updateProfile(
      currentUser.admin_id,
      payload,
    );
    return {
      response: instanceToPlain(response),
      message: 'Admin updated successfully!',
    };
  }

  @ApiOperation({ summary: 'Change Password' })
  @ApiBody({ type: ChangePasswordDto })
  @Put('password')
  @HttpCode(200)
  async changePassword(
    @Body() payload: ChangePasswordDto,
    @CurrentUser() currentUser: Admin,
  ) {
    const response = await this.adminsService.changePassword(
      currentUser.admin_id,
      payload,
    );
    return {
      response: instanceToPlain(response),
      message: 'Password updated successfully!',
    };
  }

  @ApiOperation({ summary: 'Get Profile' })
  @Get('me')
  @HttpCode(200)
  async getProfile(@CurrentUser() currentUser: Admin) {
    const response = await this.adminsService.getAdmin(currentUser.admin_id);
    return {
      response: instanceToPlain(response),
      message: 'Admin retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get Transactions' })
  @ApiQuery({ type: AdminGetTransactionsDto })
  @Permissions(['view:Transaction'])
  @Get('transactions')
  @HttpCode(200)
  async AdminGetTransactions(@Query() payload: AdminGetTransactionsDto) {
    const response =
      await this.transactionsService.adminGetTransactions(payload);
    return {
      response: instanceToPlain(response),
      message: 'Transactions retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get Transaction' })
  @ApiParam({ name: 'transaction_id', description: 'ID of the transaction' })
  @Permissions(['view:Transaction'])
  @Get('transactions/:transaction_id')
  @HttpCode(200)
  async AdminGetTransaction(@Param('transaction_id') transaction_id: string) {
    const response =
      await this.transactionsService.adminGetTransaction(transaction_id);
    return {
      response: instanceToPlain(response),
      message: 'Transaction retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get Users' })
  @ApiQuery({ type: GetUsersDto })
  @Permissions(['view:User'])
  @Get('users')
  @HttpCode(200)
  async GetUsers(@Query() payload: GetUsersDto) {
    const response = await this.usersService.getUsers(payload);
    return {
      response: instanceToPlain(response),
      message: 'Users retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get User Stats' })
  @Permissions(['view:Analytics'])
  @Get('users/stats')
  @HttpCode(200)
  async getUserStatistics() {
    const response = await this.usersService.getUserStatistics();
    return {
      response: instanceToPlain(response),
      message: 'User stats retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get User' })
  @ApiParam({ name: 'user_id', description: 'ID of the user' })
  @Permissions(['view:User'])
  @Get('users/:user_id')
  @HttpCode(200)
  async GetUser(@Param('user_id') user_id: string) {
    const response = await this.usersService.getUser({ user_id });
    return {
      response: instanceToPlain(response),
      message: 'User retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get Activities' })
  @ApiQuery({ type: GetActivitiesDto })
  @Permissions(['view:Activity'])
  @Get('/activities')
  @HttpCode(200)
  async getActivities(@Query() query: GetActivitiesDto) {
    const response = await this.activitiesService.findAll(query);
    return {
      response,
      message: 'Activities retrieved successfully',
    };
  }

  @ApiOperation({ summary: 'Get Admin' })
  @ApiParam({ name: 'admin_id', description: 'ID of the admin' })
  @Permissions(['view:Admin'])
  @Get('/:admin_id')
  @HttpCode(200)
  async getAdmin(@Param('admin_id') admin_id: string) {
    const response = await this.adminsService.getAdmin(admin_id);
    return {
      response: instanceToPlain(response),
      message: 'Admin retrieved successfully!',
    };
  }
}
