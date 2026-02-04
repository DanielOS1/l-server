// export interface ApiResponse<T> {
//   status: string;
//   message: string;
//   data: T;
// }

export type ResponseStatus = 'success' | 'error' | 'fail';

export interface BaseResponse {
  status: ResponseStatus;
  message: string;
  timestamp: string;
}

export interface SuccessResponse<T> extends BaseResponse {
  status: 'success';
  data: T;
}

export interface ErrorReponse extends BaseResponse {
  status: 'error' | 'fail';
  errors?: string[];
  path?: string;
}

export interface PaginatedResponse<T> extends BaseResponse {
  status: 'success';
  data: T[];
  paginatino: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
