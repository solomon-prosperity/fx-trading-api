import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';
import { Events } from '../data/events';
import { Resources } from '../data/resources';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  public readonly entity_id: string;

  @IsString()
  @IsNotEmpty()
  public readonly activity: string;

  @IsString()
  @IsEnum(['admin', 'user'])
  @IsNotEmpty()
  public readonly entity: string;

  @IsString()
  @IsEnum(Resources)
  @IsNotEmpty()
  public readonly resource: string;

  @IsString()
  @IsEnum(Events)
  @IsNotEmpty()
  public readonly event: string;

  @IsDateString()
  @IsNotEmpty()
  public readonly event_date: string;
}
