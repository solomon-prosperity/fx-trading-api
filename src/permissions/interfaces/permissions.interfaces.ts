import { UpdatePermissionDto } from '../dto/update-permission.dto';

export interface IUpdatePayload extends UpdatePermissionDto {
  slug?: string;
}
