import { Module } from '@nestjs/common';
import { CountriesModule } from 'src/countries/countries.module';
import { LocalisationCronService } from './services/localisation.service';

@Module({
  imports: [CountriesModule],
  providers: [LocalisationCronService],
})
export class CronModule {}
