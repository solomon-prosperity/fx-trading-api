import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import slugify from 'slugify';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreateManyPermissionDto } from './dto/create-many-permissions';
import { IUpdatePayload } from './interfaces/permissions.interfaces';
import { paginateResult } from '../common/helpers';
import { FindManyInterface } from 'src/common/utils/interfaces';
import { GetPermissionsDto } from './dto/get-permissions.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreatePermissionDto): Promise<Permission> {
    try {
      const response: Permission = await this.dataSource.transaction(
        async (manager) => {
          const { name } = payload;
          const slug = slugify(name).toLowerCase();
          const is_permission = await this.permissionRepository.findOneBy({
            slug,
          });
          if (is_permission)
            throw new ConflictException(
              'Permission with this name already exists',
            );
          const permission = this.permissionRepository.create({
            ...payload,
            slug,
          });
          await manager.save(permission);
          return permission;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createMany(payload: CreateManyPermissionDto): Promise<Permission[]> {
    try {
      const response: Permission[] = await this.dataSource.transaction(
        async (manager) => {
          const permission_slugs = payload.permissions.map((perm) =>
            slugify(perm.name).toLowerCase(),
          );
          const permissions = await this.permissionRepository.findBy({
            slug: In(permission_slugs),
          });
          if (permissions.length > 0)
            throw new ConflictException('Some permissions already exists');
          const permissions_to_save = payload.permissions.map((perm) => {
            return this.permissionRepository.create({
              ...perm,
              slug: slugify(perm.name).toLowerCase(),
            });
          });
          const result = await manager.save(permissions_to_save);
          return result;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAll(payload: GetPermissionsDto): Promise<FindManyInterface> {
    try {
      const { page = 1, limit = 20 } = payload;
      const [permissions, total] = await this.permissionRepository.findAndCount(
        {
          skip: (page - 1) * limit,
          take: limit,
        },
      );
      const pagination = paginateResult(total, page, limit);
      return { docs: permissions, pagination };
    } catch (error) {
      throw error;
    }
  }

  async findMany(permission_ids: string[]): Promise<Permission[]> {
    try {
      const permissions = await this.permissionRepository.findBy({
        permission_id: In(permission_ids),
      });
      return permissions;
    } catch (error) {
      throw error;
    }
  }

  async findOne(permission_id: string): Promise<Permission> {
    try {
      const permission = await this.permissionRepository.findOneBy({
        permission_id,
      });
      if (!permission) throw new NotFoundException('Permission not found');
      return permission;
    } catch (error) {
      throw error;
    }
  }

  async update(
    permission_id: string,
    payload: UpdatePermissionDto,
  ): Promise<Permission | null> {
    try {
      const response: Permission | null = await this.dataSource.transaction(
        async (manager) => {
          const { name } = payload;
          const permission = await this.permissionRepository.findOneBy({
            permission_id,
          });
          if (!permission) throw new NotFoundException('Permission not found');
          let update_payload: IUpdatePayload = {
            ...payload,
          };
          if (name) {
            const slug = slugify(name).toLowerCase();
            const permission = await this.permissionRepository.findOneBy({
              slug,
            });
            if (permission && permission.permission_id !== permission_id)
              throw new ConflictException(
                'A Permission with this name already exists',
              );
            update_payload = {
              ...update_payload,
              slug,
            };
          }
          await manager.update(Permission, permission_id, update_payload);
          const $permission = await manager.findOneBy(Permission, {
            permission_id,
          });
          if (!$permission)
            throw new InternalServerErrorException('Update opeartion failed');
          return $permission;
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async remove(permission_id: string): Promise<number | null | undefined> {
    try {
      const permission = await this.permissionRepository.delete(permission_id);
      if (permission.affected === 0)
        throw new NotFoundException('Permission not found');
      return permission.affected;
    } catch (error) {
      throw error;
    }
  }
}
