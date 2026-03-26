// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  createdBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Role {
  id: 'admin' | 'viewer';
  name: string;
  description?: string;
  permissions: string[];
}

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  roleId: 'admin' | 'viewer';
  joinedAt: Date;
  invitedBy?: string;
  role?: Role;
  organization?: Organization;
}

export interface OrganizationWithRole extends Organization {
  role: Role;
  membership: {
    joinedAt: Date;
    invitedBy?: string;
  };
}
