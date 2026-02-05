import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Transactions')
@UseGuards(AuthGuard('jwt'))
@Controller('/v1/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Get Transactions' })
  @ApiQuery({ type: GetTransactionsDto })
  @Get()
  async findAll(
    @CurrentUser() currentUser: User,
    @Query() payload: GetTransactionsDto,
  ) {
    const response = await this.transactionsService.getTransactions(
      currentUser.user_id,
      payload,
    );
    return {
      response: response,
      message: 'Transactions retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get a transaction' })
  @ApiParam({ name: 'transaction_id', description: 'ID of the transaction' })
  @Get(':transaction_id')
  async getTransaction(
    @Param('transaction_id') transaction_id: string,
    @CurrentUser() currentUser: User,
  ) {
    const response = await this.transactionsService.getTransaction(
      currentUser.user_id,
      transaction_id,
    );
    return {
      response: response,
      message: 'Transaction retrieved successfully!',
    };
  }
}
