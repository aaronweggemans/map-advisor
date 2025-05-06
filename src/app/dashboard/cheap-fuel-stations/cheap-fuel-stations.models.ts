export type FuelStationSummary = {
  id: number;
  lat: number;
  lon: number;
  price: number;
  price_indication?: number;
}

export type FuelStation = {
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

export type Coordinate = {
  id: number | null;
  south_west_lat: number;
  south_west_lon: number;
  north_east_lat: number;
  north_east_lon: number;
}

export type Prices = {
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
