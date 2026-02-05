import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  EntityManager,
  FindOptionsWhere,
} from 'typeorm';
import { generateUniqueId } from 'src/common/helpers';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/users/entities/user.entity';
import {
  IUpdateWallet,
  ICreateWallet,
  ICreditWallet,
  IDebitWallet,
} from './interfaces/wallets.interfaces';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { TradeCurrencyDto, TradeAction } from './dto/trade-currency.dto';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  TransactionFlow,
  TransactionStatus,
  TransactionType,
} from 'src/transactions/enums/transaction.enum';
import { CountriesService } from 'src/countries/countries.service';

import { Request } from 'express';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly transactionsService: TransactionsService,
    private readonly countriesService: CountriesService,
    private readonly rabbitmqService: RabbitmqService,
    private dataSource: DataSource,
  ) {}

  async create(
    payload: ICreateWallet,
    manager: EntityManager,
  ): Promise<Wallet> {
    try {
      const new_wallet = this.walletRepository.create({
        user_id: payload.user.user_id,
        currency: payload.currency,
      });
      await manager.save(new_wallet);
      return new_wallet;
    } catch (error) {
      throw error;
    }
  }

  async findOne(query: FindOptionsWhere<Wallet>): Promise<Wallet | null> {
    try {
      const wallet = await this.walletRepository.findOneBy(query);
      if (!wallet) throw new NotFoundException('Wallet not found');
      return wallet;
    } catch (error) {
      throw error;
    }
  }

  async update(
    wallet_id: string,
    payload: IUpdateWallet,
    manager: EntityManager,
  ): Promise<Wallet> {
    try {
      const wallet = await manager.findOne(Wallet, {
        where: { wallet_id },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      manager.merge(Wallet, wallet, payload);
      const updated_wallet = await manager.save(wallet);
      return updated_wallet!;
    } catch (error) {
      throw error;
    }
  }

  async getWallets(current_user: User, currency?: string) {
    try {
      const where: FindOptionsWhere<Wallet> = {
        user_id: current_user.user_id,
      };
      if (currency) where.currency = currency;
      const wallets = await this.walletRepository.find({
        where,
      });
      return wallets;
    } catch (error) {
      throw error;
    }
  }

  async debit(payload: IDebitWallet): Promise<Transaction> {
    try {
      const {
        wallet_id,
        amount,
        manager,
        description,
        type,
        exchange_rate,
        metadata,
      } = payload;
      const wallet = await manager.findOne(Wallet, {
        where: { wallet_id },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < amount) {
        throw new ForbiddenException('Insufficient wallet balance');
      }
      const new_wallet_balance = wallet.balance - amount;
      await this.update(
        wallet_id,
        {
          balance: new_wallet_balance,
        },
        manager,
      );
      const user_id = wallet.user_id;
      const txn_reference = generateUniqueId();
      const txn_payload = {
        user_id: user_id,
        wallet_id: wallet.wallet_id,
        session_id: txn_reference,
        currency: wallet.currency,
        reference: txn_reference,
        status: TransactionStatus.COMPLETED,
        type: type as TransactionType,
        flow: TransactionFlow.DEBIT,
        amount: amount,
        exchange_rate,
        description,
        metadata,
      };
      const transaction = await this.transactionsService.create(
        txn_payload,
        manager,
      );
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async credit(payload: ICreditWallet): Promise<Transaction> {
    try {
      const {
        wallet_id,
        amount,
        manager,
        description,
        type,
        exchange_rate,
        metadata,
      } = payload;
      const wallet = await manager.findOne(Wallet, {
        where: { wallet_id },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      const new_wallet_balance = wallet.balance + amount;
      await this.update(
        wallet_id,
        {
          balance: new_wallet_balance,
        },
        manager,
      );
      const user_id = wallet.user_id;
      const txn_reference = generateUniqueId();
      const txn_payload = {
        user_id: user_id,
        wallet_id: wallet.wallet_id,
        session_id: txn_reference,
        currency: wallet.currency,
        reference: txn_reference,
        status: TransactionStatus.COMPLETED,
        type: type,
        flow: TransactionFlow.CREDIT,
        amount: amount,
        exchange_rate,
        description,
        metadata,
      };
      const transaction = await this.transactionsService.create(
        txn_payload,
        manager,
      );
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async fundWallet(
    current_user: User,
    payload: FundWalletDto,
    request: Request,
  ): Promise<Transaction> {
    try {
      const amount = Math.round(payload.amount);
      const { currency } = payload;

      const response: Transaction = await this.dataSource.transaction(
        async (manager) => {
          let wallet = await manager.findOne(Wallet, {
            where: {
              user_id: current_user.user_id,
              currency,
            },
          });

          if (!wallet) {
            wallet = await this.create(
              { user: current_user, currency },
              manager,
            );
          }

          const transaction = await this.credit({
            wallet_id: wallet.wallet_id,
            amount,
            exchange_rate: '1',
            manager,
            description: `Wallet funding - ${currency}`,
            type: TransactionType.FUNDING,
          });
          return transaction;
        },
      );

      const request_meta = {
        ip:
          request.ip ||
          request.headers['x-forwarded-for'] ||
          request.socket.remoteAddress,
        user_agent: request.headers['user-agent'],
      };

      await this.rabbitmqService.publishMessage([
        {
          worker: 'activity',
          message: {
            action: 'log',
            type: 'activity',
            data: {
              entity_id: current_user.user_id,
              activity: `Funded ${currency} wallet with ${amount}`,
              entity: 'user',
              resource: 'Wallet',
              event: 'Credit',
              event_date: new Date(),
              request: request_meta,
            },
          },
        },
      ]);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async convertCurrency(
    current_user: User,
    payload: ConvertCurrencyDto,
    request: Request,
  ): Promise<object> {
    try {
      const { from_currency, to_currency, amount } = payload;
      const { rate, converted_amount } =
        await this.countriesService.convertCurrency({
          from: from_currency,
          to: to_currency,
          amount: amount / 100,
        });
      const final_amount = Math.round(converted_amount * 100);

      const response = await this.dataSource.transaction(async (manager) => {
        const from_wallet = await manager.findOne(Wallet, {
          where: {
            user_id: current_user.user_id,
            currency: from_currency,
          },
        });

        if (!from_wallet)
          throw new NotFoundException(`${from_currency} Wallet not found`);

        let to_wallet = await manager.findOne(Wallet, {
          where: {
            user_id: current_user.user_id,
            currency: to_currency,
          },
        });

        if (!to_wallet) {
          to_wallet = await this.create(
            { user: current_user, currency: to_currency },
            manager,
          );
        }

        const debit_transaction = await this.debit({
          wallet_id: from_wallet.wallet_id,
          amount,
          exchange_rate: rate,
          manager,
          description: `Currency conversion: ${from_currency} to ${to_currency}`,
          type: TransactionType.CONVERSION,
        });

        const credit_transaction = await this.credit({
          wallet_id: to_wallet.wallet_id,
          amount: final_amount,
          exchange_rate: rate,
          manager,
          description: `Currency conversion: ${from_currency} to ${to_currency}`,
          type: TransactionType.CONVERSION,
        });

        return {
          debit_transaction,
          credit_transaction,
          rate,
          converted_amount,
        };
      });

      const request_meta = {
        ip:
          request.ip ||
          request.headers['x-forwarded-for'] ||
          request.socket.remoteAddress,
        user_agent: request.headers['user-agent'],
      };

      await this.rabbitmqService.publishMessage([
        {
          worker: 'activity',
          message: {
            action: 'log',
            type: 'activity',
            data: {
              entity_id: current_user.user_id,
              activity: `Converted ${amount} ${from_currency} to ${final_amount} ${to_currency} at rate ${rate}`,
              entity: 'user',
              resource: 'Wallet',
              event: 'Update',
              event_date: new Date(),
              request: request_meta,
            },
          },
        },
      ]);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async trade(
    current_user: User,
    payload: TradeCurrencyDto,
    request: Request,
  ): Promise<object> {
    try {
      const { base_currency, quote_currency, amount, action } = payload;
      let from_currency: string;
      let to_currency: string;
      let from_amount: number;

      if (action === TradeAction.BUY) {
        // User wants to buy 'amount' of base_currency using quote_currency
        from_currency = quote_currency;
        to_currency = base_currency;

        const exchange_rate = await this.countriesService.getExchangeRate(
          from_currency,
          to_currency,
        );

        if (!exchange_rate) {
          throw new BadRequestException(
            `Unable to get exchange rate for ${from_currency} to ${to_currency}`,
          );
        }

        // How much quote_currency do we need to get 'amount' of base_currency?
        from_amount = Math.ceil(amount / exchange_rate);
      } else {
        // User wants to sell 'amount' of base_currency for quote_currency
        from_currency = base_currency;
        to_currency = quote_currency;
        from_amount = amount;
      }

      const { rate, converted_amount } =
        await this.countriesService.convertCurrency({
          from: from_currency,
          to: to_currency,
          amount: from_amount / 100,
        });

      const final_credit_amount = Math.round(converted_amount * 100);

      const response = await this.dataSource.transaction(async (manager) => {
        const from_wallet = await manager.findOne(Wallet, {
          where: {
            user_id: current_user.user_id,
            currency: from_currency,
          },
        });

        if (!from_wallet)
          throw new NotFoundException(`${from_currency} Wallet not found`);

        let to_wallet = await manager.findOne(Wallet, {
          where: {
            user_id: current_user.user_id,
            currency: to_currency,
          },
        });

        if (!to_wallet) {
          to_wallet = await this.create(
            { user: current_user, currency: to_currency },
            manager,
          );
        }

        const debit_transaction = await this.debit({
          wallet_id: from_wallet.wallet_id,
          amount: from_amount,
          exchange_rate: rate,
          manager,
          description: `Trade ${action}: ${from_currency} to ${to_currency}`,
          type: TransactionType.TRADE,
          metadata: { action },
        });

        const credit_transaction = await this.credit({
          wallet_id: to_wallet.wallet_id,
          amount: final_credit_amount,
          exchange_rate: rate,
          manager,
          description: `Trade ${action}: ${from_currency} to ${to_currency}`,
          type: TransactionType.TRADE,
          metadata: { action },
        });

        return {
          debit_transaction,
          credit_transaction,
          rate,
          converted_amount,
          action,
        };
      });

      const request_meta = {
        ip:
          request.ip ||
          request.headers['x-forwarded-for'] ||
          request.socket.remoteAddress,
        user_agent: request.headers['user-agent'],
      };

      await this.rabbitmqService.publishMessage([
        {
          worker: 'activity',
          message: {
            action: 'log',
            type: 'activity',
            data: {
              entity_id: current_user.user_id,
              activity: `Executed trade: ${action} ${amount} ${base_currency} with ${quote_currency}. Final exchange: ${from_amount} ${from_currency} for ${final_credit_amount} ${to_currency} at rate ${rate}`,
              entity: 'user',
              resource: 'Wallet',
              event: 'Update',
              event_date: new Date(),
              request: request_meta,
            },
          },
        },
      ]);

      return response;
    } catch (error) {
      throw error;
    }
  }
}
