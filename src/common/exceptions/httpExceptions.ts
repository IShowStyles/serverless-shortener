class HttpException extends Error {
  name: string;
  statusCode: number;
  validationErrors?: any;

  constructor(name: string, statusCode: number, description: string, validationErrors?: any) {
    super(description);
    this.name = name;
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  UNAUTHORIZED = 401,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  INTERNAL_SERVER = 500,
}

export { HttpException, HttpStatusCode }