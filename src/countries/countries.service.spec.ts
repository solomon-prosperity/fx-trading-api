import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CurrencyApiService } from 'src/common/services/currency-api.service';
import { RedisService } from 'src/redis/redis.service';
import { BadRequestException } from '@nestjs/common';

describe('CountriesService', () => {
  let service: CountriesService;

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockCurrencyApiService = {
    getCurrencies: jest.fn(),
    compareCurrencies: jest.fn(),
  };

  const mockRedisService = {
    getCachedItem: jest.fn(),
    cacheSingle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: getRepositoryToken(Country),
          useValue: mockRepository,
        },
        {
          provide: CurrencyApiService,
          useValue: mockCurrencyApiService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertCurrency', () => {
    it('should return 1:1 if currencies are the same', async () => {
      const result = await service.convertCurrency({
        from: 'USD',
        to: 'USD',
        amount: 100,
      });
      expect(result).toEqual({ rate: '1', converted_amount: 100 });
    });

    it('should return converted amount using exchange rate', async () => {
      jest.spyOn(service, 'getExchangeRate').mockResolvedValue(1500);

      const result = await service.convertCurrency({
        from: 'USD',
        to: 'NGN',
        amount: 10,
      });

      expect(result.converted_amount).toBe(15000);
      expect(result.rate).toBe('1500');
    });

    it('should throw BadRequestException if rate retrieval fails', async () => {
      jest.spyOn(service, 'getExchangeRate').mockResolvedValue(0);

      await expect(
        service.convertCurrency({ from: 'USD', to: 'NGN', amount: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getExchangeRate', () => {
    it('should return cached rate if available', async () => {
      mockRedisService.getCachedItem.mockResolvedValue('1500');

      const result = await service.getExchangeRate('USD', 'NGN');

      expect(result).toBe(1500);
      expect(mockRedisService.getCachedItem).toHaveBeenCalledWith(
        'countryData_USD_NGN',
      );
    });

    it('should calculate rate from country data if cache misses', async () => {
      mockRedisService.getCachedItem.mockResolvedValue(null);
      const mockFrom = { currency_code: 'USD', exchange_rate: '1' };
      const mockTo = { currency_code: 'NGN', exchange_rate: '1500' };

      jest
        .spyOn(service, 'fetchCountryData')
        .mockResolvedValueOnce(mockFrom as any)
        .mockResolvedValueOnce(mockTo as any);

      const result = await service.getExchangeRate('USD', 'NGN');

      expect(result).toBe(1500);
    });
  });

  describe('getFxRates', () => {
    const mockRates = {
      USD: '1',
      NGN: '1500',
      EUR: '0.9',
    };
    const mockCachedData = JSON.stringify({
      rates: mockRates,
      fetched_at: new Date().toISOString(),
    });

    it('should return rates for USD base', async () => {
      mockRedisService.getCachedItem.mockResolvedValue(mockCachedData);

      const result: any = await service.getFxRates('USD');

      expect(result.base).toBe('USD');
      expect(result.rates).toEqual(mockRates);
    });

    it('should return derived rates for non-USD base', async () => {
      mockRedisService.getCachedItem.mockResolvedValue(mockCachedData);

      const result: any = await service.getFxRates('NGN');

      expect(result.base).toBe('NGN');
      expect(result.rates['USD']).toBe((1 / 1500).toFixed(6));
      expect(result.rates['NGN']).toBe('1.000000');
      expect(result.rates['EUR']).toBe((0.9 / 1500).toFixed(6));
    });

    it('should call updateExchangeRate and return rates if cache miss', async () => {
      mockRedisService.getCachedItem
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCachedData);

      jest.spyOn(service, 'updateExchangeRate').mockResolvedValue(undefined);

      const result: any = await service.getFxRates('USD');

      expect(service.updateExchangeRate).toHaveBeenCalled();
      expect(result.base).toBe('USD');
      expect(result.rates).toEqual(mockRates);
    });

    it('should throw BadRequestException if cache remains empty after update', async () => {
      mockRedisService.getCachedItem.mockResolvedValue(null);
      jest.spyOn(service, 'updateExchangeRate').mockResolvedValue(undefined);

      await expect(service.getFxRates('USD')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unsupported base currency', async () => {
      mockRedisService.getCachedItem.mockResolvedValue(mockCachedData);

      await expect(service.getFxRates('GBP')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
