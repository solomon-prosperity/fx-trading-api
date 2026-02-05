import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
  Body,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WalletsService } from './wallets.service';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { TradeCurrencyDto } from './dto/trade-currency.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { EmailVerifiedGuard } from 'src/common/guards/email-verified.guard';
import { Request } from 'express';

@ApiTags('Wallets')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('v1/wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @ApiOperation({ summary: 'Get Wallets' })
  @ApiQuery({ name: 'currency', required: false, type: String })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getWallets(
    @CurrentUser() currentUser: User,
    @Query('currency') currency?: string,
  ) {
    const response = await this.walletsService.getWallets(
      currentUser,
      currency,
    );
    return {
      response,
      message: 'Wallets retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Fund Wallet' })
  @Post('fund')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  async fundWallet(
    @CurrentUser() currentUser: User,
    @Body() payload: FundWalletDto,
    @Req() request: Request,
  ) {
    const response = await this.walletsService.fundWallet(
      currentUser,
      payload,
      request,
    );
    return {
      response,
      message: 'Wallet funded successfully!',
    };
  }

  @ApiOperation({ summary: 'Convert Wallet Currency' })
  @Post('convert')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  async convertCurrency(
    @CurrentUser() currentUser: User,
    @Body() payload: ConvertCurrencyDto,
    @Req() request: Request,
  ) {
    const response = await this.walletsService.convertCurrency(
      currentUser,
      payload,
      request,
    );
    return {
      response,
      message: 'Currency conversion successful!',
    };
  }

  @ApiOperation({ summary: 'Trade Currency' })
  @Post('trade')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  async trade(
    @CurrentUser() currentUser: User,
    @Body() payload: TradeCurrencyDto,
    @Req() request: Request,
  ) {
    const response = await this.walletsService.trade(
      currentUser,
      payload,
      request,
    );
    return {
      response,
      message: 'Trade executed successfully!',
    };
  }
}
