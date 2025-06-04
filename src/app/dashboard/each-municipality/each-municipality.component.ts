import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../map/map.service';
import {CommonModule} from '@angular/common';
import {NgxLoadingModule} from 'ngx-loading';
import {DashboardService} from "../dashboard.service";
import {FeatureGroup, LatLngTuple, layerGroup, LayerGroup, LeafletMouseEvent, polygon, PolylineOptions} from "leaflet";
import {FuelStationSummary, Municipality, MunicipalityProperty} from "../dashboard.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {SearchByMunicipalityComponent} from "./search-by-municipality/search-by-municipality.component";
import {SelectedMunicipalityComponent} from "./selected-municipality/selected-municipality.component";
import {Observable, Subject, tap, withLatestFrom} from "rxjs";
import {MunicipalityForm} from "./each-municipality.models";
import {Coordinates} from "../calculate-route/calculate-route.models";

@Component({
  selector: 'app-each-municipality',
  standalone: true,
  templateUrl: './each-municipality.component.html',
  imports: [CommonModule, NgxLoadingModule, SearchResultsComponent, SearchByMunicipalityComponent, SelectedMunicipalityComponent],
})
export class EachMunicipalityComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SearchByMunicipalityComponent) searchByComponent!: SearchByMunicipalityComponent;

  private readonly allPlacedFuelStations: LayerGroup = layerGroup();

  private readonly _selectedMunicipality$: Subject<MunicipalityProperty> = new Subject();
  protected readonly selectedMunicipality$: Observable<MunicipalityProperty> = this._selectedMunicipality$.asObservable();

  private readonly _allFuelStations$: Subject<FuelStationSummary[]> = new Subject();
  private readonly _filteredFuelStations$: Subject<FuelStationSummary[]> = new Subject();
  protected readonly fuelStations$: Observable<FuelStationSummary[]> = this._filteredFuelStations$.asObservable();

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
    this.getAllMunicipalities();
  }

  ngAfterViewInit() {
    this.searchByComponent.amount.valueChanges.pipe(
      withLatestFrom(this._allFuelStations$.asObservable()),
      tap(([ amount, fuelStations ]) => {
        const filterFuelStations = fuelStations.slice(0, amount);
        this._filteredFuelStations$.next(filterFuelStations)
        this.allPlacedFuelStations.clearLayers();
        filterFuelStations.forEach(({lat, lon, fade}) =>
          this.mapService.appendCircleOnColorIndication(lat, lon, fade, this.allPlacedFuelStations))
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.mapService.removeLayerFromMap(this.municipalitiesLayer);
    this.mapService.removeLayerFromMap(this.selectedMunicipalityLayer);
    this.mapService.removeLayerFromMap(this.allPlacedFuelStations);
    this.mapService.centerBackToDefaultLocation();
  }

  protected refreshPage() {
    this.mapService.removeLayerFromMap(this.municipalitiesLayer);
    this.mapService.removeLayerFromMap(this.selectedMunicipalityLayer);
    this.allPlacedFuelStations.clearLayers();
    this._filteredFuelStations$.next([]);
    this.getAllMunicipalities();
  }

  protected formSubmitted(formValues: MunicipalityForm) {
    const bufferLayer = this.selectedMunicipalityLayer?.toGeoJSON();

    if (bufferLayer && bufferLayer.type === "FeatureCollection" && bufferLayer.features[0].geometry.type === "Polygon") {
      const coordinates = [bufferLayer.features[0].geometry.coordinates.flat()];

      this.dashboardService.getAllFuelStationsOnCoordinates(coordinates, formValues.fuelType).pipe(
        tap((fuelStations) => {
          this._allFuelStations$.next(fuelStations);

          // Manually emits the amount when
          this.searchByComponent.amount.updateValueAndValidity();
        }),
      ).subscribe();
    }
  }

  protected fuelStationIsSelected(fuelStation: FuelStationSummary) {
    this.dashboardService.findFuelStationById(fuelStation.id).subscribe(() => {
      // see calculate route, should be merged!
      const coordinates: Coordinates = { lat: fuelStation.lat, lon: fuelStation.lon };
      this.mapService.flyTo(coordinates);
    })
  }

  private getAllMunicipalities(): void {
    this.dashboardService.getDutchMunicipalities().subscribe((features) => {
      features.forEach((municipality: Municipality) => {
        const polygonCoords = municipality.geometry.coordinates as LatLngTuple[][];
        const poly = polygon(polygonCoords, { ...this.DEFAULT_POLYGON_DESIGN, id: municipality.id } as PolylineOptions);
        poly.on('mouseover', (e) => e.target.setStyle(this.HOVER_POLYGON_DESIGN));
        poly.on('mouseout', (e) => e.target.setStyle(this.DEFAULT_POLYGON_DESIGN));
        poly.on('click', (e) => this.onPolygonClick(e, features));
        poly.addTo(this.municipalitiesLayer);
      });

      this.mapService.addLayerToMap(this.municipalitiesLayer);
    })
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
