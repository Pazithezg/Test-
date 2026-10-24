export class ApplicationError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, 404, details);
  }
}

export class AiProviderError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, 502, details);
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message = 'Too many requests, please slow down') {
    super(message, 429);
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, 500, details);
  }
}
