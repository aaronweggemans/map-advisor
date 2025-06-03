import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import { environment } from '../../environments/environment';
import {Position} from "geojson";
import {FuelStation, FuelStationSummary, Municipality, MunicipalityProperty} from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private readonly httpClient: HttpClient) { }

  public findFuelStationById(id: number): Observable<FuelStation> {
    return this.httpClient
      .get<FuelStationDTO>(`${environment.url}api/v1/fuel-stations/find/${id}`)
      .pipe(map(this._toFuelStation));
  }

  public getAllFuelStationsOnCoordinates(coordinates: Position[][], fueltype: string): Observable<FuelStationSummary[]> {
    const body = this.coordinatesToBody(coordinates);
    return this.httpClient.post<FuelStationSummaryDTO[]>(`${environment.url}api/v1/fuel-stations/${fueltype}/coordinates`, body)
      .pipe(map(this._toFuelStationSummary));
  }

  public getDutchMunicipalities(): Observable<Municipality[]> {
    return this.httpClient.get<MunicipalityRootDto>('./assets/municipalities/dutch-municipalities.json')
      .pipe(map(this.toMunicipalities));
  }

  private toMunicipalities = (res: MunicipalityRootDto): Municipality[] =>
    res.features.map(this.toFeature)

  private toFeature = (res: MunicipalityFeatureDto): Municipality => ({
    ...res,
    geometry: {
      ...res.geometry,
      coordinates: (() => {
        if(this.isPolygon(res.geometry)) {
          return res.geometry.coordinates
            .flatMap((coordinate) => coordinate.map(this.castToLatitudeLongitude));
        }

        if(this.isMultiPolygon(res.geometry)) {
          return res.geometry.coordinates
            .flatMap((coordinate) => coordinate.map((coords) =>
              coords.map(this.castToLatitudeLongitude)));
        }

        // Never reached
        return []
      })()
    },
    properties: this.toProperties(res.properties),
  })

  private toProperties = (res: MunicipalityPropertyDto): MunicipalityProperty => ({
    name: res.Gemeentenaam,
    code: res.Gemeentecode,
    numberOfInhabitants: res.aant_inw,
    area: res.Shape__Area,
    covidInfections: res.Aantal_Besmettingen,
    province: res.Provincie,
    region: res.Veiligheidsregio,
  })

  private castToLatitudeLongitude(latLong: number[]): number[] {
    return [latLong[1], latLong[0]]
  }

  private readonly isPolygon = (geometry: MunicipalityGeometryDto): geometry is { type: 'Polygon'; coordinates: number[][][] } =>
    geometry.type === 'Polygon';

  private readonly isMultiPolygon = (geometry: MunicipalityGeometryDto): geometry is { type: 'MultiPolygon'; coordinates: number[][][][] } =>
    geometry.type === 'MultiPolygon';

  private _toFuelStationSummary = (
    fuelStation: FuelStationSummaryDTO[]
  ): FuelStationSummary[] =>
    fuelStation.map((fuelStation) => ({
      ...fuelStation,
      lat: fuelStation.location_lat,
      lon: fuelStation.location_lon,
      price: fuelStation.price,
    })).sort((fuelStation) => fuelStation.price);

  private _toFuelStation = (fuelStation: FuelStationDTO): FuelStation => ({
    ...fuelStation,
    lat: fuelStation.location_lat,
    lon: fuelStation.location_lon,
    coordinate: this._toCoordinate(fuelStation.coordinate),
    prices: this._toPrices(fuelStation.prices),
  });

  private _toCoordinate = (coordinate: CoordinateDTO | undefined) => ({
    id: coordinate?.id ? coordinate?.id : null,
    south_west_lat: coordinate?.southwest_lat ? coordinate?.southwest_lat : 0,
    south_west_lon: coordinate?.southwest_lon ? coordinate?.southwest_lon : 0,
    north_east_lat: coordinate?.northeast_lat ? coordinate?.northeast_lat : 0,
    north_east_lon: coordinate?.northeast_lon ? coordinate?.northeast_lon : 0,
  });

  private _toPrices = (prices: PricesDTO[]) => prices.map((prices) => prices);

  private readonly coordinatesToBody = (coordinates: Position[][]): CoordinatesBody => ({
    coordinates: coordinates[0].map((coord) => ({ latitude: coord[1], longitude: coord[0] }))
  })
}

type FuelStationSummaryDTO = {
  id: number;
  location_lat: number;
  location_lon: number;
  price: number;
}

type FuelStationDTO = {
  id: number;
  name: string;
  brand_name: string;
  display_name: string;
  location_lat: number;
  location_lon: number;
  street: string;
  postal_code: string;
  city: string;
  coordinate: CoordinateDTO;
  prices: PricesDTO[];
}

type CoordinateDTO = {
  id: number;
  southwest_lat: number;
  southwest_lon: number;
  northeast_lat: number;
  northeast_lon: number;
}

type PricesDTO = {
  id: number;
  fueltype: string;
  station: string;
  price: number;
  price_level: string;
  record: string;
  source: string;
}

type CoordinatesBody = {
  coordinates: {
    latitude: number
    longitude: number
  }[]
}

type MunicipalityRootDto = {
  features: MunicipalityFeatureDto[];
  links: MunicipalityLinkDto
  timeStamp: string
  type: string
}

type MunicipalityLinkDto = {
  href: string
  rel: string
  title: string
  type: string
}

type MunicipalityFeatureDto = {
  type: 'Polygon' | 'MultiPolygon'
  geometry: MunicipalityGeometryDto
  properties: MunicipalityPropertyDto
  id: number
}

type MunicipalityGeometryDto = {
  type: string
  coordinates: number[][][] | number[][][][]
}

type MunicipalityPropertyDto = {
  Gemeentenaam: string
  Gemeentecode: string
  gemeentencode: number
  aant_inw: number
  p_65_eo_jr: number
  Shape__Area: number
  Shape__Length: number
  Aantal_Besmettingen: number
  Provincie: string
  Veiligheidsregio: string
  GGD_regio: string
}
