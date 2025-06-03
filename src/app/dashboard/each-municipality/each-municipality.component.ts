import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapService} from '../../map/map.service';
import {CommonModule} from '@angular/common';
import {NgxLoadingModule} from 'ngx-loading';
import {DashboardService} from "../dashboard.service";
import {FeatureGroup, LatLngTuple, LeafletMouseEvent, polygon, PolylineOptions} from "leaflet";
import {FuelStationSummary, Municipality, MunicipalityProperty} from "../dashboard.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {SearchByMunicipalityComponent} from "./search-by-municipality/search-by-municipality.component";
import {SelectedMunicipalityComponent} from "./selected-municipality/selected-municipality.component";
import {Observable, Subject, switchMap} from "rxjs";
import {MunicipalityForm} from "./each-municipality.models";
import {Position} from "geojson";

@Component({
  selector: 'app-each-municipality',
  standalone: true,
  templateUrl: './each-municipality.component.html',
  imports: [CommonModule, NgxLoadingModule, SearchResultsComponent, SearchByMunicipalityComponent, SelectedMunicipalityComponent],
})
export class EachMunicipalityComponent implements OnInit, OnDestroy {
  private readonly _selectedMunicipality$: Subject<MunicipalityProperty> = new Subject();
  protected readonly selectedMunicipality$: Observable<MunicipalityProperty> = this._selectedMunicipality$.asObservable();

  private readonly _results$: Subject<MergeFormAndCoords> = new Subject<MergeFormAndCoords>();
  protected readonly results$: Observable<FuelStationSummary[]> = this._results$.asObservable().pipe(
    switchMap((data) =>
      this.dashboardService.getAllFuelStationsOnCoordinates(data.coordinates, data.fuelType)
    ),
  );

  private readonly municipalitiesLayer = new FeatureGroup();
  private readonly selectedMunicipalityLayer = new FeatureGroup();

  private readonly POLYGON_BORDER: PolylineOptions = {color: '#071C39', weight: 2, fillOpacity: 0, className: 'leaflet-cursor-grab' };
  private readonly DEFAULT_POLYGON_DESIGN: PolylineOptions = {color: '#5C636B', fillColor: '#5C636B', weight: 2, fillOpacity: 0.2}
  private readonly HOVER_POLYGON_DESIGN: PolylineOptions = {color: '#071C39', fillColor: '#071C39', weight: 5, fillOpacity: 0.7}

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly mapService: MapService,
  ) {
  }

  ngOnInit() {
    this.dashboardService.getDutchMunicipalities().subscribe((data) => this.showAllMunicipalities(data))
  }

  ngOnDestroy() {
    this.mapService.removeLayerFromMap(this.municipalitiesLayer);
    this.mapService.removeLayerFromMap(this.selectedMunicipalityLayer);
  }

  protected formSubmitted(formValues: MunicipalityForm) {
    const bufferLayer = this.selectedMunicipalityLayer?.toGeoJSON();

    if (bufferLayer && bufferLayer.type === "FeatureCollection" && bufferLayer.features[0].geometry.type === "Polygon") {
      const coordinates = bufferLayer.features[0].geometry.coordinates;
      this._results$.next({ coordinates, ...formValues })
    }
  }

  private showAllMunicipalities(features: Municipality[]): void {
    features.forEach((municipality: Municipality) => {
      const polygonCoords = municipality.geometry.coordinates as LatLngTuple[][];
      const poly = polygon(polygonCoords, { ...this.DEFAULT_POLYGON_DESIGN, id: municipality.id } as PolylineOptions);
      poly.on('mouseover', (e) => e.target.setStyle(this.HOVER_POLYGON_DESIGN));
      poly.on('mouseout', (e) => e.target.setStyle(this.DEFAULT_POLYGON_DESIGN));
      poly.on('click', (e) => this.onPolygonClick(e, features));
      poly.addTo(this.municipalitiesLayer);
    });

    this.mapService.addLayerToMap(this.municipalitiesLayer);
  }

  private onPolygonClick(e: LeafletMouseEvent, municipalities: Municipality[]): void {
    const municipality = municipalities.find(({ id }) => id === e.target.options.id)!;
    this._selectedMunicipality$.next(municipality.properties);
    this.mapService.flyWithZoom(e.target.getBounds())
    this.mapService.removeLayerFromMap(this.municipalitiesLayer);

    polygon(municipality.geometry.coordinates as LatLngTuple[][], this.POLYGON_BORDER)
      .addTo(this.selectedMunicipalityLayer);

    this.mapService.addLayerToMap(this.selectedMunicipalityLayer);
  }
}

type MergeFormAndCoords = MunicipalityForm & { coordinates: Position[][] };
