// decorators/auditLog.js
import { logAudit } from '../utils/fileLogger.js';

export function AuditLog(action, targetNameGetter) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const req = args[0];
      const result = await originalMethod.apply(this, args);

      const userId = req.user?.id;
      if (userId) {
        const targetName = targetNameGetter ? targetNameGetter(req) : '未知目标';
        
        await logAudit({
          userId,
          username: req.user?.username,
          action,
          targetId: req.body.id || req.params.id,
          targetName,
          details: req.body,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      return result;
    };
    return descriptor;
  };
}