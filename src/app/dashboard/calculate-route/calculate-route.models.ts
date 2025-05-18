export type PDOKAddressSuggestion = {
  numFound: number
  start: number
  maxScore: number
  numFoundExact: boolean
  suggestions: PDOKAddressMatch[]
}

export type PDOKAddressMatch = {
  type: string
  weergavenaam: string
  adrestype: string
  id: string
  score: number
}

export type PDOKAddress = {
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
  coordinates: Coordinates,
  nummeraanduiding_id: string
  waterschapscode: string
  adresseerbaarobject_id: string
  huisnummer: number
  provincieafkorting: string
  centroide_rd: string
  straatnaam: string
}

export type ORSRoutePlan = {
  bbox: number[]
  type: string
  properties: ORSProperties,
  geometry: ORSGeometry
}

export type ORSProperties = {
  segments: ORSSegment[]
  way_points: number[]
  summary: ORSSummary
}

export type ORSSegment = {
  distance: number
  duration: number
  steps: ORSStep[]
}

export type ORSSummary = {
  distance: number
  duration: string
}

export type ORSStep = {
  distance: number
  duration: number
  type: number
  instruction: string
  name: string
  way_points: Array<number>
  exit_number?: number
}

export type ORSGeometry = {
  coordinates: number[][]
  type: string
}

export type Coordinates = { lat: number, lon: number }

