export interface ErrorDetail {
  field: string;
  message: string;
}

// שגיאה "צפויה" עם קוד HTTP - נתפסת ב-errorHandler ומוחזרת ללקוח
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: ErrorDetail[]) =>
  new AppError(400, 'VALIDATION_ERROR', message, details);
export const unauthorized = (message = 'יש להתחבר כדי לבצע פעולה זו') =>
  new AppError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'אין לך הרשאה לבצע פעולה זו') =>
  new AppError(403, 'FORBIDDEN', message);
export const notFound = (message = 'הפריט לא נמצא') => new AppError(404, 'NOT_FOUND', message);
export const conflict = (message: string) => new AppError(409, 'CONFLICT', message);
