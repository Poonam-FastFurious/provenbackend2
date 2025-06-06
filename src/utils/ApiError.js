class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static handleError(err, req, res, next) {
    const { statusCode, message, errors } = err;
    
    // Ensure it's returning JSON format, not HTML
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors, // You can customize this as per your needs
    });
  }
}

export { ApiError };
