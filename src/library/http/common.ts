export enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Patch = 'patch',
  Delete = 'delete'
}

export enum HttpStatusCode {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  NotAcceptable = 406,
  Conflict = 409,
  PreconditionFailed = 412,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  ServiceUnavailable = 503
}

export  interface HttpHeaders {
  [name: string]: string
}
