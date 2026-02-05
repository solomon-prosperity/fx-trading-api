export const defaultPermissions = [
  // Admin Permissions
  {
    name: 'create:Admin',
    slug: 'create_admin',
    entity: 'Admin',
    action: 'create',
    description: 'Can invite other admins',
  },
  {
    name: 'view:Admin',
    slug: 'view_admin',
    entity: 'Admin',
    action: 'view',
    description: 'Can view admin list',
  },
  {
    name: 'update:Admin',
    slug: 'update_admin',
    entity: 'Admin',
    action: 'update',
    description: 'Can update admin profiles',
  },
  {
    name: 'sanction:Admin',
    slug: 'sanction_admin',
    entity: 'Admin',
    action: 'sanction',
    description: 'Can suspend/deactivate admins',
  },

  // User Permissions
  {
    name: 'view:User',
    slug: 'view_user',
    entity: 'User',
    action: 'view',
    description: 'Can view user list',
  },
  {
    name: 'update:User',
    slug: 'update_user',
    entity: 'User',
    action: 'update',
    description: 'Can update user profiles',
  },
  {
    name: 'delete:User',
    slug: 'delete_user',
    entity: 'User',
    action: 'delete',
    description: 'Can delete users',
  },
  {
    name: 'sanction:User',
    slug: 'sanction_user',
    entity: 'User',
    action: 'sanction',
    description: 'Can suspend/unsuspend users',
  },

  // Transaction Permissions
  {
    name: 'view:Transaction',
    slug: 'view_transaction',
    entity: 'Transaction',
    action: 'view',
    description: 'Can view transactions',
  },
  {
    name: 'view:Analytics',
    slug: 'view_analytics',
    entity: 'Transaction',
    action: 'view',
    description: 'Can view financial analytics',
  },

  // Role & Permission Permissions
  {
    name: 'view:Role',
    slug: 'view_role',
    entity: 'Role',
    action: 'view',
    description: 'Can view roles',
  },
  {
    name: 'create:Role',
    slug: 'create_role',
    entity: 'Role',
    action: 'create',
    description: 'Can create roles',
  },
  {
    name: 'update:Role',
    slug: 'update_role',
    entity: 'Role',
    action: 'update',
    description: 'Can update roles',
  },
  {
    name: 'view:Permission',
    slug: 'view_permission',
    entity: 'Permission',
    action: 'view',
    description: 'Can view permissions',
  },

  // Activity Permissions
  {
    name: 'view:Activity',
    slug: 'view_activity',
    entity: 'Activity',
    action: 'view',
    description: 'Can view activity logs',
  },

  // Wallet Permissions
  {
    name: 'view:Wallet',
    slug: 'view_wallet',
    entity: 'Wallet',
    action: 'view',
    description: 'Can view wallets',
  },
];
