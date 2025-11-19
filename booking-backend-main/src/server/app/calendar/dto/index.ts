import {
  PaginatedResponse as IPaginatedResponse,
  PaginationMetaData as IPaginationMetaData,
} from "../../../../database-client/src/Schema";

export class PaginatedResponse<T> implements IPaginatedResponse<T> {
  data: T[];
  metaData: IPaginationMetaData;

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.metaData = new PaginationMetaData(total, page, limit);
  }
}

export class PaginationMetaData implements IPaginationMetaData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;

  constructor(total: number, page: number, limit: number) {
    this.totalItems = total;
    this.totalPages = Math.ceil(total / limit);
    this.currentPage = page;
    this.itemsPerPage = limit;
  }
}
