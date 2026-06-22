export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};