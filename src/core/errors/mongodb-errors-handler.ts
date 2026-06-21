/**
 * MongoDB error handlers — format common MongoDB/Mongoose error messages.
 */

export function handleValidationError(
  message: string,
): { message: string; statusCode: number } {
  if (!message.includes("validation failed")) {
    return { message, statusCode: 500 };
  }

  const errorParts = message.split(":").slice(-1)[0]?.trim() ?? message;
  const errors = errorParts
    .split(",")
    .map((error) => error.trim())
    .filter(Boolean);

  const formattedErrors = errors
    .map((error) => {
      const pathMatch = error.match(/Path `(.+)` is required/);
      if (pathMatch) {
        const field = pathMatch[1]?.split(".").pop();
        if (field) {
          return `${field.charAt(0).toUpperCase()}${field.slice(1)} is required`;
        }
      }
      return null;
    })
    .filter((error): error is string => Boolean(error));

  return {
    message: formattedErrors.join(", ") || "Validation failed",
    statusCode: 400,
  };
}

export function handleDuplicateKeyError(
  message: string,
): { message: string; statusCode: number } {
  if (!message.includes("duplicate key")) {
    return { message, statusCode: 500 };
  }

  const regex = /{([^}]*)}/;
  const match = message.match(regex);

  if (match?.[1]) {
    return {
      message: `${match[1].trim().replace(/"/g, "")} already exists`,
      statusCode: 400,
    };
  }

  return { message, statusCode: 500 };
}

export function handleCastError(
  message: string,
): { message: string; statusCode: number } {
  if (!message.includes("Cast to ObjectId failed")) {
    return { message, statusCode: 500 };
  }

  const regex = /model "([^"]+)"/;
  const match = message.match(regex);

  if (match?.[1]) {
    return {
      message: `The submitted ${match[1].trim()} ID cannot be found`,
      statusCode: 400,
    };
  }

  return { message, statusCode: 500 };
}

export function handleInvalidIdError(
  message: string,
): { message: string; statusCode: number } {
  if (
    !message.includes(
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
    ) &&
    !message.includes(
      "input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
    )
  ) {
    return { message, statusCode: 500 };
  }

  return {
    message: "You entered an invalid ID",
    statusCode: 400,
  };
}

export function processMongoDBError(
  message: string,
  statusCode: number,
): { message: string; statusCode: number } {
  if (message.includes("validation failed")) {
    return handleValidationError(message);
  }

  if (message.includes("duplicate key")) {
    return handleDuplicateKeyError(message);
  }

  if (message.includes("Cast to ObjectId failed")) {
    return handleCastError(message);
  }

  if (
    message.includes(
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
    ) ||
    message.includes(
      "input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
    )
  ) {
    return handleInvalidIdError(message);
  }

  return { message, statusCode: statusCode || 500 };
}

export function isMongoDBErrorMessage(message: string): boolean {
  const mongoErrors = [
    "validation failed",
    "duplicate key",
    "Cast to ObjectId failed",
    "string of 24 hex characters",
    "input must be a 24 character hex string",
  ];

  return mongoErrors.some((mongoErr) => message.includes(mongoErr));
}
