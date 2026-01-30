import { useOrganization } from '@/providers/OrganizationProvider';

type Permission = 'read' | 'write' | 'delete' | 'invite';

/**
 * Hook para verificar permisos del usuario en la organización actual
 */
export function usePermissions() {
  const { userRole } = useOrganization();

  const can = (permission: Permission): boolean => {
    if (!userRole) return false;
    
    // Admins pueden hacer todo
    if (userRole === 'admin') return true;
    
    // Viewers solo pueden leer
    if (userRole === 'viewer') {
      return permission === 'read';
    }
    
    return false;
  };

  return {
    isAdmin: userRole === 'admin',
    isViewer: userRole === 'viewer',
    can,
    canRead: can('read'),
    canWrite: can('write'),
    canDelete: can('delete'),
    canInvite: can('invite'),
  };
}
