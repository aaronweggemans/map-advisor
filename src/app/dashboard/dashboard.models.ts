export type FuelStationSummary = {
  id: number;
  lat: number;
  lon: number;
  price: number;
  price_indication: number;
  fade: string;
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

export type Municipality = {
  type: string
  geometry: MunicipalityGeometry
  properties: MunicipalityProperty
  id: number
}

export type MunicipalityGeometry = {
  type: string
  coordinates: number[][] | number[][][]
}

export type MunicipalityProperty = {
  name: string
  code: string
  numberOfInhabitants: number
  area: number
  covidInfections: number
  province: string
  region: string
}
