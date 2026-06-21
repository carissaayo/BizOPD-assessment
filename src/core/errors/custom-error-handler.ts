export class ThrowException extends Error {
  statusCode: number;
  status: string;
  data?: unknown;
  isOperational: boolean;
  errorCode?: string;

  constructor(
    message: string,
    statusCode: number,
    data: unknown = null,
    errorCode?: string,
  ) {
    super(message);
    this.statusCode = statusCode;

    if (statusCode >= 400 && statusCode < 500) {
      this.status = "failed";
    } else if (statusCode >= 500) {
      this.status = "error";
    } else {
      this.status = "success";
    }

    if (data) {
      this.data = data;
    }

    if (errorCode) {
      this.errorCode = errorCode;
    }

    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  NOT_ACCEPTABLE = "NOT_ACCEPTABLE",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  CONFLICT = "CONFLICT",
  GONE = "GONE",
  HTTP_VERSION_NOT_SUPPORTED = "HTTP_VERSION_NOT_SUPPORTED",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  UNSUPPORTED_MEDIA_TYPE = "UNSUPPORTED_MEDIA_TYPE",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  BAD_GATEWAY = "BAD_GATEWAY",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT",
  PRECONDITION_FAILED = "PRECONDITION_FAILED",
}

const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.BAD_REQUEST]: "Bad Request",
  [ErrorCode.UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.FORBIDDEN]: "Forbidden",
  [ErrorCode.NOT_FOUND]: "Not Found",
  [ErrorCode.METHOD_NOT_ALLOWED]: "Method Not Allowed",
  [ErrorCode.NOT_ACCEPTABLE]: "Not Acceptable",
  [ErrorCode.REQUEST_TIMEOUT]: "Request Timeout",
  [ErrorCode.CONFLICT]: "Conflict",
  [ErrorCode.GONE]: "Gone",
  [ErrorCode.HTTP_VERSION_NOT_SUPPORTED]: "HTTP Version Not Supported",
  [ErrorCode.PAYLOAD_TOO_LARGE]: "Payload Too Large",
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
  [ErrorCode.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
  [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal Server Error",
  [ErrorCode.NOT_IMPLEMENTED]: "Not Implemented",
  [ErrorCode.BAD_GATEWAY]: "Bad Gateway",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Service Unavailable",
  [ErrorCode.GATEWAY_TIMEOUT]: "Gateway Timeout",
  [ErrorCode.PRECONDITION_FAILED]: "Precondition Failed",
};

const ErrorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.NOT_ACCEPTABLE]: 406,
  [ErrorCode.REQUEST_TIMEOUT]: 408,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.GONE]: 410,
  [ErrorCode.HTTP_VERSION_NOT_SUPPORTED]: 505,
  [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: 415,
  [ErrorCode.UNPROCESSABLE_ENTITY]: 422,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
  [ErrorCode.BAD_GATEWAY]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.GATEWAY_TIMEOUT]: 504,
  [ErrorCode.PRECONDITION_FAILED]: 412,
};

export class LessError {
  static badRequest(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.BAD_REQUEST],
      ErrorStatusCodes[ErrorCode.BAD_REQUEST],
      data,
      ErrorCode.BAD_REQUEST,
    );
  }

  static unauthorized(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.UNAUTHORIZED],
      ErrorStatusCodes[ErrorCode.UNAUTHORIZED],
      data,
      ErrorCode.UNAUTHORIZED,
    );
  }

  static forbidden(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.FORBIDDEN],
      ErrorStatusCodes[ErrorCode.FORBIDDEN],
      data,
      ErrorCode.FORBIDDEN,
    );
  }

  static notFound(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.NOT_FOUND],
      ErrorStatusCodes[ErrorCode.NOT_FOUND],
      data,
      ErrorCode.NOT_FOUND,
    );
  }

  static methodNotAllowed(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.METHOD_NOT_ALLOWED],
      ErrorStatusCodes[ErrorCode.METHOD_NOT_ALLOWED],
      data,
      ErrorCode.METHOD_NOT_ALLOWED,
    );
  }

  static notAcceptable(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.NOT_ACCEPTABLE],
      ErrorStatusCodes[ErrorCode.NOT_ACCEPTABLE],
      data,
      ErrorCode.NOT_ACCEPTABLE,
    );
  }

  static requestTimeout(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.REQUEST_TIMEOUT],
      ErrorStatusCodes[ErrorCode.REQUEST_TIMEOUT],
      data,
      ErrorCode.REQUEST_TIMEOUT,
    );
  }

  static conflict(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.CONFLICT],
      ErrorStatusCodes[ErrorCode.CONFLICT],
      data,
      ErrorCode.CONFLICT,
    );
  }

  static gone(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.GONE],
      ErrorStatusCodes[ErrorCode.GONE],
      data,
      ErrorCode.GONE,
    );
  }

  static httpVersionNotSupported(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.HTTP_VERSION_NOT_SUPPORTED],
      ErrorStatusCodes[ErrorCode.HTTP_VERSION_NOT_SUPPORTED],
      data,
      ErrorCode.HTTP_VERSION_NOT_SUPPORTED,
    );
  }

  static payloadTooLarge(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.PAYLOAD_TOO_LARGE],
      ErrorStatusCodes[ErrorCode.PAYLOAD_TOO_LARGE],
      data,
      ErrorCode.PAYLOAD_TOO_LARGE,
    );
  }

  static unsupportedMediaType(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.UNSUPPORTED_MEDIA_TYPE],
      ErrorStatusCodes[ErrorCode.UNSUPPORTED_MEDIA_TYPE],
      data,
      ErrorCode.UNSUPPORTED_MEDIA_TYPE,
    );
  }

  static unprocessableEntity(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.UNPROCESSABLE_ENTITY],
      ErrorStatusCodes[ErrorCode.UNPROCESSABLE_ENTITY],
      data,
      ErrorCode.UNPROCESSABLE_ENTITY,
    );
  }

  static internalServerError(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.INTERNAL_SERVER_ERROR],
      ErrorStatusCodes[ErrorCode.INTERNAL_SERVER_ERROR],
      data,
      ErrorCode.INTERNAL_SERVER_ERROR,
    );
  }

  static notImplemented(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.NOT_IMPLEMENTED],
      ErrorStatusCodes[ErrorCode.NOT_IMPLEMENTED],
      data,
      ErrorCode.NOT_IMPLEMENTED,
    );
  }

  static badGateway(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.BAD_GATEWAY],
      ErrorStatusCodes[ErrorCode.BAD_GATEWAY],
      data,
      ErrorCode.BAD_GATEWAY,
    );
  }

  static serviceUnavailable(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.SERVICE_UNAVAILABLE],
      ErrorStatusCodes[ErrorCode.SERVICE_UNAVAILABLE],
      data,
      ErrorCode.SERVICE_UNAVAILABLE,
    );
  }

  static gatewayTimeout(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.GATEWAY_TIMEOUT],
      ErrorStatusCodes[ErrorCode.GATEWAY_TIMEOUT],
      data,
      ErrorCode.GATEWAY_TIMEOUT,
    );
  }

  static preconditionFailed(message?: string, data?: unknown) {
    return new ThrowException(
      message ?? ErrorMessages[ErrorCode.PRECONDITION_FAILED],
      ErrorStatusCodes[ErrorCode.PRECONDITION_FAILED],
      data,
      ErrorCode.PRECONDITION_FAILED,
    );
  }

  static custom(
    message: string,
    statusCode: number,
    data?: unknown,
    errorCode?: string,
  ) {
    return new ThrowException(message, statusCode, data, errorCode);
  }
}
