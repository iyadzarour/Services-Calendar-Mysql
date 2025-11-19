export interface PaginatedForm {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMetaData {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metaData: PaginationMetaData;
}

export interface Attachment {
  title: string;
  url: string;
}
