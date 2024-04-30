import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FuelStation } from './cheap-fuel-stations.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CheapFuelStationsService {
  private readonly _url = 'http://localhost:8080/';

  constructor(private httpClient: HttpClient) {}

  getCheapFuelStations(): Observable<FuelStation> {
    return this.httpClient
      .get<FuelStationDTO>(`${this._url}api/v1/fuel-stations`)
      .pipe(map(this._toFuelStation));
  }

  private _toFuelStation = (fuelStation: FuelStationDTO) => ({
    ...fuelStation,
    lat: fuelStation.location_lat,
    lon: fuelStation.location_lon,
    coordinate: this._toCoordinate(fuelStation.coordinate),
  });

  private _toCoordinate = (coordinate: CoordinateDTO | undefined) => ({
    id: coordinate?.id ? coordinate?.id : null,
    south_west_lat: coordinate?.southwest_lat ? coordinate?.southwest_lat : 0,
    south_west_lon: coordinate?.southwest_lon ? coordinate?.southwest_lon : 0,
    north_east_lat: coordinate?.northeast_lat ? coordinate?.northeast_lat : 0,
    north_east_lon: coordinate?.northeast_lon ? coordinate?.northeast_lon : 0,
  });
}

interface FuelStationDTO {
  id: number;
  name: string;
  brand_name: string;
  display_name: string;
  location_lat: number;
  location_lon: number;
  street: string;
  postal_code: string;
  city: string;
  coordinate?: CoordinateDTO;
  prices: PricesDTO;
}

interface CoordinateDTO {
  id: number;
  southwest_lat: number;
  southwest_lon: number;
  northeast_lat: number;
  northeast_lon: number;
}

interface PricesDTO {
  id: number;
  fueltype: string;
  station: string;
  price: number;
  price_level: string;
  record: string;
  source: string;
}
