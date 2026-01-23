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
  }
};
