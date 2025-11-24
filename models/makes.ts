export interface MakeItem {
  name: string;
  models: string[];
}

export interface CarMakesResponse {
  count?: number;
  makes: MakeItem[];
}

export interface CategoryField {
  field_name: string;
  options: string[];
}
