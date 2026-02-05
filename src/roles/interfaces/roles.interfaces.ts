import { UpdateRoleDto } from '../dto/update-role.dto';

export interface IUpdatePayload extends UpdateRoleDto {
  slug?: string;
}
