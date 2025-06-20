export interface Base {
  uuid?: string;
  code?: string;
  created_at?: string;
  last_modified_at?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Header {
  name: string;
  key: string;
  canFilter: boolean;
  canSort: boolean;
  filter: string;
  show: boolean;
  class?: string;
}