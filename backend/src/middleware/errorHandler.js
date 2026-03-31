function errorHandlerMiddleware(error, request, response, next) {
  console.error(error);

  if (response.headersSent) {
    return next(error);
  }

  response.status(500).json({
    success: false,
    error: "Internal server error",
  });
}

module.exports = errorHandlerMiddleware;
