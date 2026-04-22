//  Operational errors — those we expect and want to surface cleanly to the client

export class ApiError extends Error {
  readonly statusCode: number;
  readonly isOperational = true;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  // Factory helpers
  static badRequest(msg = 'Bad Request', details?: unknown) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Not Found') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }
  static tooMany(msg = 'Too Many Requests') {
    return new ApiError(429, msg);
  }
  static internal(msg = 'Internal Server Error') {
    return new ApiError(500, msg);
  }
}
