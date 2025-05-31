import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map, Observable} from "rxjs";
import {
  Coordinates,
  ORSRoutePlan,
  ORSProperties, ORSSummary
} from "./calculate-route.models";

@Injectable({
  providedIn: 'root'
})
export class ORSRouteService {
  constructor(private httpClient: HttpClient) {
  }

  public getRoute(from: Coordinates, to: Coordinates): Observable<ORSRoutePlan> {
    const params = new HttpParams()
      .set('start', `${from.lon},${from.lat}`)
      .set('end', `${to.lon},${to.lat}`)
      .set('api_key', environment.openRouteServiceKey);

    return this.httpClient
      .get<ORSApiResponseDto>(`${environment.openRouteServiceUrl}directions/driving-car`, { params })
      .pipe(map((response: ORSApiResponseDto) => this.toORSRoutePlan(response.features[0])))
  }

  private readonly toORSRoutePlan = (feature: ORSRouteFeatureDto): ORSRoutePlan => ({
    ...feature,
    properties: this.toProperties(feature.properties)
  });

  private readonly toProperties = (properties: ORSRoutePropertiesDto): ORSProperties => ({
    ...properties,
    summary: this.toSummary(properties.summary)
  });

  private readonly toSummary = (summary: ORSRouteSummaryDto): ORSSummary => ({
    distance: Math.trunc(summary.distance) / 1000,
    duration: (() => {
      const date = new Date(0);
      date.setSeconds(summary.duration);
      return date.toISOString().substring(11, 19);
    })()
  });
}

type ORSApiResponseDto = {
  type: string
  bbox: number[]
  features: ORSRouteFeatureDto[]
  metadata: ORSRouteMetaDataDto
}

type ORSRouteFeatureDto = {
  bbox: number[]
  type: string
  properties: ORSRoutePropertiesDto,
  geometry: ORSRouteGeometryDto
}

type ORSRouteMetaDataDto = {
  attribution: string
  service: string
  timestamp: number
  query: ORSRouteQueryDto,
  engine: ORSRouteEngineDto,
}

type ORSRoutePropertiesDto = {
  segments: ORSRouteSegmentDto[]
  way_points: number[]
  summary: ORSRouteSummaryDto
}

type ORSRouteGeometryDto = {
  coordinates: number[][]
  type: string
}

type ORSRouteSegmentDto = {
  distance: number
  duration: number
  steps: ORSRouteStepDto[]
}

type ORSRouteQueryDto = {
  coordinates: number[][]
  profile: string
  profileName: string
  format: string
}

type ORSRouteEngineDto = {
  version: string
  build_date: string
  graph_date: string
}

type ORSRouteSummaryDto = {
  distance: number
  duration: number
}

type ORSRouteStepDto = {
  distance: number
  duration: number
  type: number
  instruction: string
  name: string
  way_points: Array<number>
  exit_number?: number
}
