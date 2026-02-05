import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { GetCountriesDto } from './dto/get-countries.dto';
import { GetFxRatesDto } from './dto/get-fx-rates.dto';

@ApiTags('FX')
@Controller('/v1/fx')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @ApiOperation({ summary: 'Get list of countries' })
  @Get('/countries')
  async getCountries(@Query() query: GetCountriesDto) {
    const response = await this.countriesService.findMany(
      {},
      query.page || 1,
      query.limit || 20,
    );
    return {
      response: response,
      message: 'Countries retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get country by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Country ID' })
  @Get('/countries/:id')
  async getCountryById(@Param('id') id: string) {
    const response = await this.countriesService.findOne({ id });
    if (!response) {
      throw new NotFoundException('Country not found');
    }
    return {
      response: response,
      message: 'Country retrieved successfully!',
    };
  }

  @ApiOperation({ summary: 'Get FX Rates' })
  @Get('rates')
  async getFxRates(@Query() query: GetFxRatesDto) {
    const response = await this.countriesService.getFxRates(query.base);
    return {
      response,
      message: 'FX rates retrieved successfully!',
    };
  }
}
