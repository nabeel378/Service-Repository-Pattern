import StaticStringKeys from '../utils/constant';

export class ApplicationError extends Error {
  public code:number 

  constructor(code: number, message: string, ...args: any) {
    super(...args);
    this.code = code;
    this.message = message;
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message: string, ...args: any) {
    console.log(message,"BASD")
    super(400, message, ...args);
  }
}

export class ConflictRequestError extends ApplicationError {
  constructor(message: string, ...args: any) {
    super(409, message, ...args);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string, ...args: any) {
    super(403, message, args);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = "Not Found!") {
    super(404, message, arguments);
  }
}

export class MissingFieldError extends BadRequestError {
  constructor(fieldName: string,message = "is required", ...args: any) {
    super(`${fieldName} ${message}`, args);
  }
}

export class InternalError extends ApplicationError {
  constructor(message: string) {
    super(500, message, arguments);
  }
}

export class InvalidCredentialError extends BadRequestError {
  constructor(...args: any) {
    super(StaticStringKeys.INVALID_CREDENTIAL, args);
  }
}

export class InvalidTokenError extends BadRequestError {
  constructor(type: string, ...args: any) {
    if (type === 'ACCESS') {
      super(StaticStringKeys.INVALID_ACCESS_TOKEN, args);
    } else {
      super(StaticStringKeys.INVALID_REFRESH_TOKEN, args);
    }
  }
}

export class InvalidIdError extends BadRequestError {
  constructor(...args: any) {
    super(StaticStringKeys.REPOSITORY_ERROR_INVALID_ID, args);
  }
}

export class RepositoryMissingField extends BadRequestError {
  constructor(...args: any) {
    super('Field missing', args);
  }
}
