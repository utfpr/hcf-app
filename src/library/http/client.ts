import { HttpHeaders, HttpMethod, HttpStatusCode } from "./common";

export interface HttpClientRequestParams {
  method: HttpMethod;
  url: string;
  headers?: HttpHeaders;
  params?: Record<string, unknown>;
  body?: any;
}

export interface HttpClientResponse<Body = unknown> {
  statusCode: HttpStatusCode;
  headers: HttpHeaders;
  json(): Promise<Body>
  text(): Promise<string>
  blob(): Promise<Blob>
}

export interface HttpClientGetParams {
  url: string;
  params?: Record<string, unknown>;
}

export interface HttpClientPostParams<Body = unknown> {
  url: string;
  body: Body;
}

export interface HttpClientPutParams<Body = unknown> {
  url: string;
  body: Body;
}

export interface HttpClientPatchParams<Body = unknown> {
  url: string;
  body: Body;
}

export interface HttpClientDeleteParams {
  url: string;
}

export class HttpClient {
  readonly baseUrl: string;

  constructor(params: {baseUrl: string}) {
    this.baseUrl = params.baseUrl;
  }

  async request<Body = unknown>(params: HttpClientRequestParams): Promise<HttpClientResponse<Body>> {
    const url = new URL(params.url, this.baseUrl);
    if (params.params) {
      for (const [key, value] of Object.entries(params.params)) {
        url.searchParams.set(key, value as string);
      }
    }

    const contentType = params.headers?.['Content-Type'];
    let body: RequestInit['body'];
    if (contentType === 'application/json') {
      body = JSON.stringify(params.body);
    } else {
      body = params.body;
    }

    const response = await fetch(url.toString(), {
      method: params.method,
      headers: params.headers,
      body,
    });

    return {
      statusCode: response.status,
      headers: response.headers as unknown as HttpHeaders,
      json() { return response.json() },
      text() { return response.text() },
      blob() { return response.blob() },
    };
  }

  async get<Body = unknown>(params: HttpClientGetParams): Promise<HttpClientResponse<Body>> {
    return this.request<Body>({
      method: HttpMethod.Get,
      url: params.url,
      params: params.params,
    });
  }

  async post<Body = unknown>(params: HttpClientPostParams): Promise<HttpClientResponse<Body>> {
    return this.request<Body>({
      method: HttpMethod.Post,
      url: params.url,
      body: params.body,
    });
  }

  async put<Body = unknown>(params: HttpClientPutParams): Promise<HttpClientResponse<Body>> {
    return this.request<Body>({
      method: HttpMethod.Put,
      url: params.url,
      body: params.body,
    });
  }

  async patch<Body = unknown>(params: HttpClientPatchParams): Promise<HttpClientResponse<Body>> {
    return this.request<Body>({
      method: HttpMethod.Patch,
      url: params.url,
      body: params.body,
    });
  }

  async delete<Body = unknown>(params: HttpClientDeleteParams): Promise<HttpClientResponse<Body>> {
    return this.request<Body>({
      method: HttpMethod.Delete,
      url: params.url,
    });
  }
}
