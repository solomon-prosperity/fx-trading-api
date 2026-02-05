import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { NotFoundException } from '@nestjs/common';

describe('CountriesController', () => {
  let controller: CountriesController;

  const mockCountriesService = {
    findMany: jest.fn(),
    findOne: jest.fn(),
    getFxRates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide: CountriesService,
          useValue: mockCountriesService,
        },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCountries', () => {
    it('should return many countries', async () => {
      const mockResponse = {
        docs: [{ id: '1', name: 'Nigeria' }],
        pagination: {},
      };
      mockCountriesService.findMany.mockResolvedValue(mockResponse);

      const result = await controller.getCountries({ page: 1, limit: 10 });

      expect(mockCountriesService.findMany).toHaveBeenCalledWith({}, 1, 10);
      expect(result).toEqual({
        response: mockResponse,
        message: 'Countries retrieved successfully!',
      });
    });
  });

  describe('getCountryById', () => {
    it('should return a country', async () => {
      const mockResponse = { id: '1', name: 'Nigeria' };
      mockCountriesService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.getCountryById('1');

      expect(mockCountriesService.findOne).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual({
        response: mockResponse,
        message: 'Country retrieved successfully!',
      });
    });

    it('should throw NotFoundException if country not found', async () => {
      mockCountriesService.findOne.mockResolvedValue(null);

      await expect(controller.getCountryById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFxRates', () => {
    it('should return fx rates', async () => {
      const mockResponse = [{ currency: 'NGN', rate: '1500' }];
      mockCountriesService.getFxRates.mockResolvedValue(mockResponse);

      const result = await controller.getFxRates({ base: 'USD' });

      expect(mockCountriesService.getFxRates).toHaveBeenCalledWith('USD');
      expect(result).toEqual({
        response: mockResponse,
        message: 'FX rates retrieved successfully!',
      });
    });
  });
});
