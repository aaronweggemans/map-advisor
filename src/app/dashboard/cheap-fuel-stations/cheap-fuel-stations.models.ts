export interface FuelStation {
  id: number;
  name: string;
  brand_name: string;
  display_name: string;
  lat: number;
  lon: number;
  street: string;
  postal_code: string;
  city: string;
  coordinate: Coordinate;
  price_indication?: number;
  prices: Prices[];
}

export interface Coordinate {
  id: number | null;
  south_west_lat: number;
  south_west_lon: number;
  north_east_lat: number;
  north_east_lon: number;
}

export interface Prices {
  id: number;
  fueltype: string;
  station: string;
  price: number;
  price_level: string;
  record: string;
  source: string;
}

export type SoortFuelType =
  | 'autogas'
  | 'cng'
  | 'diesel'
  | 'diesel_special'
  | 'euro98'
  | 'euro95';
