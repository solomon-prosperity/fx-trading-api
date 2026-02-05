import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Country } from './entities/country.entity';
import { CurrencyApiService } from 'src/common/services/currency-api.service';
import { RedisService } from 'src/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FindManyInterface } from 'src/common/utils/interfaces';
import { paginateResult } from 'src/common/helpers';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly currencyApiService: CurrencyApiService,
    private readonly redisService: RedisService,
  ) {}

  async findMany(
    query: Partial<Country>,
    page: number = 1,
    limit: number = 20,
  ): Promise<FindManyInterface> {
    try {
      const [countries, total] = await this.countryRepository.findAndCount({
        where: query,
        take: limit,
        skip: (page - 1) * limit,
        order: { created_at: 'DESC' },
      });
      const pagination = paginateResult(total, page, limit);
      return { docs: countries, pagination };
    } catch (error) {
      throw error;
    }
  }

  async findOne(query: FindOptionsWhere<Country>): Promise<Country | null> {
    try {
      const country = await this.countryRepository.findOne({
        where: query,
      });
      return country;
    } catch (error) {
      throw error;
    }
  }

  async updateExchangeRate() {
    try {
      const countries = await this.countryRepository.find();
      const currencies = await this.currencyApiService.getCurrencies();

      let update_count = 0;
      const rates: Record<string, string> = {};

      for (const country of countries) {
        if (currencies.data.hasOwnProperty(country.currency_code!)) {
          const currency = currencies.data[country.currency_code!];
          country.exchange_rate = String(currency.value);
          await this.countryRepository.save(country);
          update_count++;
          rates[country.currency_code!] = String(currency.value);
        }
      }

      const cacheData = {
        base: 'USD',
        rates,
        source: 'currencyapi',
        fetched_at: new Date().toISOString(),
      };

      await this.redisService.cacheSingle(
        'exchangeRates',
        JSON.stringify(cacheData),
        3600000,
      ); // 1 hour
      this.logger.log(`Updated exchange rate for ${update_count} countries`);
    } catch (error) {
      throw error;
    }
  }

  async fetchCountryData(
    countryCode?: string,
    currencyCode?: string,
  ): Promise<Country | null> {
    const key = countryCode
      ? `countryData_${countryCode}`
      : `countryData_${currencyCode}`;
    const country = await this.redisService.getCachedItem(key);

    if (!country) {
      if (!countryCode && !currencyCode) {
        return null;
      }
      const query = countryCode
        ? { country_code: countryCode }
        : { currency_code: currencyCode };
      const country = await this.findOne(query);
      if (!country) {
        return null;
      }
      // update cache
      await this.redisService.cacheSingle(
        key,
        JSON.stringify(country),
        3600000,
      ); // 1 hour ttl in milliseconds
      return country;
    }
    return JSON.parse(country);
  }

  public async getExchangeRate(from: string, to: string): Promise<number> {
    const key = `countryData_${from}_${to}`;
    const countryRate = await this.redisService.getCachedItem(key);
    if (countryRate) {
      return +countryRate;
    }
    const [fromCountry, toCountry] = await Promise.all([
      this.fetchCountryData(undefined, from),
      this.fetchCountryData(undefined, to),
    ]);
    if (!fromCountry || !toCountry) {
      throw new BadRequestException(`Unable to convert from ${from} to ${to}`);
    }
    if (fromCountry.exchange_rate && toCountry.exchange_rate) {
      const rate = +toCountry.exchange_rate / +fromCountry.exchange_rate;
      await this.redisService.cacheSingle(key, JSON.stringify(rate), 3600000); // 1 hour ttl in milliseconds
      return rate;
    }
    const response = await this.currencyApiService.compareCurrencies(from, to);
    const rate = response.data[to].value;
    // update cache
    await this.redisService.cacheSingle(key, JSON.stringify(rate), 3600000); // 1 hour ttl in milliseconds
    return +rate;
  }

  public async convertCurrency({
    from,
    to,
    amount,
  }: {
    from: string;
    to: string;
    amount: number;
  }): Promise<{ rate: string; converted_amount: number }> {
    if (from === to) {
      return { rate: '1', converted_amount: +amount };
    }

    const rate = await this.getExchangeRate(from, to);

    if (!rate || rate <= 0) {
      throw new BadRequestException(`Unable to convert from ${from} to ${to}`);
    }

    return {
      rate: String(rate),
      converted_amount: +(amount * rate).toFixed(2),
    };
  }

  async getFxRates(base: string = 'USD'): Promise<object> {
    try {
      const cachedDataStr =
        await this.redisService.getCachedItem('exchangeRates');
      if (!cachedDataStr)
        throw new BadRequestException('No exchange rates found');

      const cachedData = JSON.parse(cachedDataStr);
      const { rates, fetched_at } = cachedData;

      if (base.toUpperCase() === 'USD') {
        return {
          base: 'USD',
          rates,
          fetched_at,
        };
      }

      const baseUpper = base.toUpperCase();
      if (!rates.hasOwnProperty(baseUpper)) {
        throw new BadRequestException(`Unsupported base currency: ${base}`);
      }

      const baseRateInUSD = parseFloat(rates[baseUpper]);
      const derivedRates: Record<string, string> = {};

      // USD in terms of new base
      derivedRates['USD'] = (1 / baseRateInUSD).toFixed(6);

      for (const currency in rates) {
        if (currency === baseUpper) {
          derivedRates[currency] = '1.000000';
        } else {
          const rateInUSD = parseFloat(rates[currency]);
          derivedRates[currency] = (rateInUSD / baseRateInUSD).toFixed(6);
        }
      }

      return {
        base: baseUpper,
        rates: derivedRates,
        fetched_at,
      };
    } catch (error) {
      throw error;
    }
  }
}
