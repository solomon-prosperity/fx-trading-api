import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import slugify from 'slugify';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
// import { Admin } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUpdatePayload } from './interfaces/roles.interfaces';
// import { generateRandomString } from '../common/helpers';
import { PermissionsService } from '../permissions/permissions.service';
import { paginateResult } from '../common/helpers';
import { FindManyInterface } from 'src/common/utils/interfaces';
// import { GetRoleUsersDto } from './dto/get-role-users.dto';
import { GetRolesDto } from './dto/get-roles.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    // @InjectRepository(Admin)
    // private readonly adminRepository: Repository<Admin>,
    private dataSource: DataSource,
    private permissionsService: PermissionsService,
  ) {}

  async create(payload: CreateRoleDto): Promise<Role> {
    try {
      const response: Role = await this.dataSource.transaction(
        async (manager) => {
          const { name, permissions, description } = payload;
          const slug = slugify(name).toLowerCase();
          const is_role = await this.roleRepository.findOneBy({
            slug,
          });
          if (is_role)
            throw new ConflictException('Role with this name already exists');
          const valid_permissions =
            await this.permissionsService.findMany(permissions);

          if (valid_permissions.length !== permissions.length) {
            throw new NotFoundException('Some permissions were not found.');
          }
          const role = this.roleRepository.create({
            name,
            description,
            permissions: valid_permissions,
            slug,
          });
          await manager.save(role);
          return role;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAll(payload: GetRolesDto): Promise<FindManyInterface> {
    try {
      const { page = 1, limit = 20 } = payload;
      const [roles, total] = await this.roleRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });
      const pagination = paginateResult(total, page, limit);
      return { docs: roles, pagination };
    } catch (error) {
      throw error;
    }
  }

  async findOne(role_id: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({
        role_id,
      });
      if (!role) throw new NotFoundException('Role not found');
      return role;
    } catch (error) {
      throw error;
    }
  }

  async findOneBySlug(slug: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({
        slug,
      });
      if (!role) throw new NotFoundException('Role not found');
      return role;
    } catch (error) {
      throw error;
    }
  }

  async update(role_id: string, payload: UpdateRoleDto): Promise<Role | null> {
    try {
      const response: Role | null = await this.dataSource.transaction(
        async (manager) => {
          const { name, permissions, remove_permissions } = payload;
          const role = await this.roleRepository.findOneBy({
            role_id,
          });
          if (!role) throw new NotFoundException('Role not found');
          if (!role) throw new NotFoundException('Role not found');
          if (role.is_default)
            throw new ForbiddenException('Role cannot be updated');
          let update_payload: IUpdatePayload = {
            ...payload,
          };
          if (name) {
            const slug = slugify(name).toLowerCase();
            const role = await this.roleRepository.findOneBy({
              slug,
            });
            if (role && role.role_id !== role_id)
              throw new ConflictException(
                'A Role with this name already exists',
              );
            update_payload = {
              ...update_payload,
              slug,
            };
          }
          const valid_permissions = role.permissions;
          if (permissions && permissions.length > 0) {
            const validated_permissions =
              await this.permissionsService.findMany(permissions);
            if (validated_permissions.length !== permissions.length) {
              throw new NotFoundException('Some permissions were not found.');
            }
            permissions.forEach((perm) => {
              const idx = role.permissions.findIndex(
                (permission) => permission.permission_id === perm,
              );
              if (idx < 0) {
                const valid_permission_idx = validated_permissions.findIndex(
                  (vperm) => vperm.permission_id === perm,
                );
                valid_permissions.push(
                  validated_permissions[valid_permission_idx],
                );
              }
            });
          }
          if (remove_permissions && remove_permissions.length > 0) {
            const validated_permissions =
              await this.permissionsService.findMany(remove_permissions);
            if (validated_permissions.length !== remove_permissions.length) {
              throw new NotFoundException('Some permissions were not found.');
            }
            remove_permissions.forEach((perm) => {
              const idx = role.permissions.findIndex(
                (permission) => permission.permission_id === perm,
              );
              if (idx >= 0) valid_permissions.splice(idx, 1);
            });
          }

          delete update_payload.permissions;
          const $update_payload = update_payload as Omit<
            typeof update_payload,
            'permissions'
          >;
          role.permissions = valid_permissions;
          manager.merge(Role, role, $update_payload);
          const updatedRole = await manager.save(role);
          if (!updatedRole) {
            throw new InternalServerErrorException('Update operation failed');
          }

          return updatedRole;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async remove(role_id: string): Promise<number | null | undefined> {
    try {
      const role = await this.roleRepository.findOne({
        where: { role_id },
        relations: ['users'],
      });
      if (!role) throw new NotFoundException('Role not found');
      if (role.is_default)
        throw new ForbiddenException('Role cannot be deleted');
      if (role.users.length > 0)
        throw new ForbiddenException(
          'You cannot remove this role because it has users assigned to it. Reassigned users first.',
        );
      const removed_role = await this.roleRepository.delete(role_id);
      return removed_role.affected;
    } catch (error) {
      throw error;
    }
  }

  async getRoleUsers(role_id: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: {
          role_id,
        },
        relations: ['users'],
      });
      if (!role) throw new NotFoundException('Role not found');
      return role;
    } catch (error) {
      throw error;
    }
  }
}
