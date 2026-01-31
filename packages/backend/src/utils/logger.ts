export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  audit: (action: string, userId: string, resource: string, meta?: any) => {
    console.log(
      `[AUDIT] ${new Date().toISOString()} - User:${userId} Action:${action} Resource:${resource}`,
      meta || ''
    );
  },
  
  // Multi-tenant aware logging
  tenantAction: (organizationId: string, userId: string, action: string, resource: string, meta?: any) => {
    console.log(
      `[TENANT_ACTION] ${new Date().toISOString()} - Org:${organizationId} User:${userId} Action:${action} Resource:${resource}`,
      meta || ''
    );
  },
  
  // Service role usage audit
  serviceRoleAccess: (table: string, operation: string, meta?: any) => {
    console.warn(
      `[SERVICE_ROLE] ${new Date().toISOString()} - Table:${table} Operation:${operation}`,
      meta || ''
    );
  }
};
