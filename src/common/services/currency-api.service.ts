import { Injectable, HttpException, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { CurrencyApiResponse } from '../utils/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyApiService {
  private readonly logger = new Logger(CurrencyApiService.name);

  constructor(private readonly configService: ConfigService) {}

  async getCurrencies(): Promise<CurrencyApiResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        let result: CurrencyApiResponse;
        try {
          const response: AxiosResponse<CurrencyApiResponse> = await axios.get(
            `${this.configService.get('CURRENCY_API_BASE_URL')}/v3/latest`,
            {
              headers: {
                apikey: this.configService.get('CURRENCY_API_KEY'),
              },
            },
          );
          result = response.data;
        } catch (error) {
          if (error.status && error.status < 500) {
            this.logger.error({ em: error.response.data });
            throw new HttpException(
              `Provider Error: ${error.response.data.message || 'Unknown Provider Error'}`,
              422,
            );
          } else {
            this.logger.error({ em: error.response });
            throw new HttpException('Unknown Provider Error', 422);
          }
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async compareCurrencies(
    base_currency: string,
    target_currency: string,
  ): Promise<CurrencyApiResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        let result: CurrencyApiResponse;
        try {
          const response: AxiosResponse<CurrencyApiResponse> = await axios.get(
            `${this.configService.get('CURRENCY_API_BASE_URL')}/v3/latest?base_currency=${base_currency}&currencies=${target_currency}`,
            {
              headers: {
                apikey: this.configService.get('CURRENCY_API_KEY'),
              },
            },
          );
          result = response.data;
        } catch (error) {
          if (error.status && error.status < 500) {
            this.logger.error({ em: error.response.data });
            throw new HttpException(
              `Provider Error: ${error.response.data.message || 'Unknown Provider Error'}`,
              422,
            );
          } else {
            this.logger.error({ em: error.response });
            throw new HttpException('Unknown Provider Error', 422);
          }
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
