import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {Coordinates, PDOKAddress, PDOKAddressMatch, PDOKAddressSuggestion} from "./calculate-route.models";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PdokSuggestionService {
  constructor(private readonly httpClient: HttpClient) { }

  public getSuggestionsOnAddress(address: string): Observable<PDOKAddressMatch[]> {
    const params = new HttpParams()
      .set('q', address)
      .set('start', '0')
      .set('rows', '10')
      .set('sort', 'score desc,sortering asc,weergavenaam asc')
      .set('wt', 'json');

    return this.httpClient
      .get<PDOKSuggestionResponseDto>(`${environment.locationUrl}/suggest`, { params })
      .pipe(map(this.toAddressSuggestion), map((suggestions) => suggestions.suggestions));
  }

  public getLocation(id: string): Observable<Coordinates> {
    const params = new HttpParams().set('id', id);

    return this.httpClient
      .get<PDOKSuggestedAddressDto>(`${environment.locationUrl}/lookup`, { params })
      .pipe(map(this.toAddress), map(({ coordinates }) => coordinates));
  }

  private readonly toAddress = (locationDto: PDOKSuggestedAddressDto): PDOKAddress => ({
    ...locationDto.response.docs[0],
    coordinates: this.toCoordinates(locationDto.response.docs[0].centroide_ll)
  })

  private readonly toCoordinates = (wkt: string): Coordinates => {
    const match = wkt.match(/^POINT\(([-\d.]+) ([-\d.]+)\)$/);
    if (!match) throw new Error("Invalid WKT format");
    return { lat: parseFloat(match[2]), lon: parseFloat(match[1]) };
  }

  private readonly toAddressSuggestion = (suggestionResponseDto: PDOKSuggestionResponseDto): PDOKAddressSuggestion => ({
    numFound: suggestionResponseDto.response.numFound,
    start: suggestionResponseDto.response.start,
    maxScore: suggestionResponseDto.response.maxScore,
    numFoundExact: suggestionResponseDto.response.numFoundExact,
    suggestions: suggestionResponseDto.response.docs.map(this.toAddressMatch)
  });

  private readonly toAddressMatch = (doc: PDOKAddressDoc): PDOKAddressMatch => doc
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
