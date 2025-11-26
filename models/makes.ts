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

export interface CityItem {
  id?: number;
  governorate_id?: number;
  name: string;
}

export interface GovernorateItem {
  id?: number;
  name: string;
  cities: string[];
}

export interface GovernoratesResponse {
  count?: number;
  governorates: GovernorateItem[];
}
