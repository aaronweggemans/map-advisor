import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {map, Observable} from "rxjs";
import {
  PDOKAddressMatch,
  PDOKAddressSuggestion,
  PDOKAddress,
  Coordinates,
  ORSRoutePlan,
  ORSProperties, ORSSummary
} from "./calculate-route.models";

@Injectable({
  providedIn: 'root'
})
export class CalculateRouteService {
  constructor(private httpClient: HttpClient) {
  }

  public getSuggestionsOnAddress(address: string): Observable<PDOKAddressSuggestion> {
    const params = new HttpParams()
      .set('q', address)
      .set('start', '0')
      .set('rows', '10')
      .set('sort', 'score desc,sortering asc,weergavenaam asc')
      .set('wt', 'json');

    return this.httpClient
      .get<PDOKSuggestionResponseDto>(`${environment.locationUrl}/suggest`, { params })
      .pipe(map(this.toAddressSuggestion));
  }

  public getLocation(id: string): Observable<Coordinates> {
    const params = new HttpParams().set('id', id);

    return this.httpClient
      .get<PDOKSuggestedAddressDto>(`${environment.locationUrl}/lookup`, { params })
      .pipe(map(this.toAddress), map(({ coordinates }) => coordinates));
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

  private readonly toAddressSuggestion = (suggestionResponseDto: PDOKSuggestionResponseDto): PDOKAddressSuggestion => ({
    numFound: suggestionResponseDto.response.numFound,
    start: suggestionResponseDto.response.start,
    maxScore: suggestionResponseDto.response.maxScore,
    numFoundExact: suggestionResponseDto.response.numFoundExact,
    suggestions: suggestionResponseDto.response.docs.map(this.toAddressMatch)
  });

  private readonly toAddressMatch = (doc: PDOKAddressDoc): PDOKAddressMatch => doc

  private readonly toAddress = (locationDto: PDOKSuggestedAddressDto): PDOKAddress => ({
    ...locationDto.response.docs[0],
    coordinates: this.toCoordinates(locationDto.response.docs[0].centroide_ll)
  })

  private readonly toCoordinates = (wkt: string): Coordinates => {
    const match = wkt.match(/^POINT\(([-\d.]+) ([-\d.]+)\)$/);
    if (!match) throw new Error("Invalid WKT format");
    return { lat: parseFloat(match[2]), lon: parseFloat(match[1]) };
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

type PDOKSuggestedAddressDto = {
  response: {
    numFound: number
    start: number
    maxScore: number
    numFoundExact: boolean
    docs: {
      bron: string
      woonplaatscode: string
      type: string
      woonplaatsnaam: string
      wijkcode: string
      huis_nlt: string
      openbareruimtetype: string
      buurtnaam: string
      gemeentecode: string
      rdf_seealso: string
      weergavenaam: string
      straatnaam_verkort: string
      id: string
      gekoppeld_perceel: Array<string>
      gemeentenaam: string
      buurtcode: string
      wijknaam: string
      identificatie: string
      openbareruimte_id: string
      waterschapsnaam: string
      provinciecode: string
      postcode: string
      provincienaam: string
      centroide_ll: string
      nummeraanduiding_id: string
      waterschapscode: string
      adresseerbaarobject_id: string
      huisnummer: number
      provincieafkorting: string
      centroide_rd: string
      straatnaam: string
    }[]
  }
}

type PDOKSuggestionResponseDto = {
  response: {
    numFound: number
    start: number
    maxScore: number
    numFoundExact: boolean
    docs: PDOKAddressDoc[]
  }
  highlighting: { [id: string]: { suggest: string[]; } };
  spellcheck: {
    suggestions: unknown[]
    collations: unknown[]
  }
}

type PDOKAddressDoc = {
  type: string
  weergavenaam: string
  adrestype: string
  id: string
  score: number
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
