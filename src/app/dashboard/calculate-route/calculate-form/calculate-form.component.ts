import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  map,
  Observable,
  Subject,
  switchMap,
  tap
} from "rxjs";
import {Coordinates, ORSProperties, ORSRoutePlan} from "../calculate-route.models";
import {ROUTE_LOCATION} from "../../../map/map.component.models";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CalculateRouteService} from "../calculate-route.service";
import {MapService} from "../../../map/map.service";
import {NotifierService} from "angular-notifier";
import { DEFAULT_LOADING_SETTINGS } from '../../../app.contants';
import {PdokSuggestionInputComponent} from "../pdok-suggestion-input/pdok-suggestion-input.component";
import {NgxLoadingModule} from "ngx-loading";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {FuelStationSummary} from "../../cheap-fuel-stations/cheap-fuel-stations.models";
import {DashboardService} from "../../dashboard.service";

@Component({
  selector: 'app-calculate-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PdokSuggestionInputComponent,
    NgxLoadingModule,
    NgForOf,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './calculate-form.component.html',
})
export class CalculateFormComponent implements OnInit {
  private fuelStations: FuelStationSummary[] = [];

  @Output() getORSProperties: EventEmitter<ORSProperties> = new EventEmitter<ORSProperties>();
  @Output() getFuelStations: EventEmitter<FuelStationSummary[]> = new EventEmitter<FuelStationSummary[]>();

  protected readonly DEFAULT_LOADING_SETTINGS = DEFAULT_LOADING_SETTINGS;
  protected readonly fuelTypes = ["autogas", "cng", "diesel", "diesel_special", "euro98", "euro95"];

  private readonly locationA$: Subject<Coordinates> = new Subject();
  private readonly locationB$: Subject<Coordinates> = new Subject();

  private readonly _isLoading$: Subject<boolean> = new Subject();
  protected readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  private readonly _submitted$: Subject<boolean> = new Subject();
  protected readonly submitted$: Observable<boolean> = this._submitted$.asObservable();

  protected readonly form =  new FormGroup<RouteFormGroup>({
    start: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    end: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    radius: new FormControl({ value: 0, disabled: true }, { nonNullable: true, validators: [Validators.required] }),
    fuelType: new FormControl({ value: 'euro95', disabled: true }, { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl({ value: 10, disabled: true }, { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly calculateRouteService: CalculateRouteService,
    private readonly mapService: MapService,
    private readonly dashboardService: DashboardService,
    private readonly notifierService: NotifierService
  ) {}

  ngOnInit() {
    this.requestPDOKCoordinatesAndConfigureMap(this.start.valueChanges, ROUTE_LOCATION.LOCATION_A).pipe(
      tap((coords) => this.locationA$.next(coords)),
      tap((coords) => this.mapService.flyTo(coords))
    ).subscribe();

    this.requestPDOKCoordinatesAndConfigureMap(this.end.valueChanges, ROUTE_LOCATION.LOCATION_B).pipe(
      tap((coords) => this.locationB$.next(coords))
    ).subscribe();

    this.radius.valueChanges.pipe(
      distinctUntilChanged(),
      tap((radius) => this.mapService.appendBufferToPolyLine(radius))
    ).subscribe();

    this.amount.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(50),
      tap((amount) => this.mapService.appendOrRemoveFuelStation(amount)),
      tap((amount) => this.getFuelStations.emit(this.fuelStations.slice(0, amount)))
    ).subscribe();

    combineLatest([this.locationA$, this.locationB$]).pipe(this.setRouteAndCenterMiddle.bind(this)).subscribe();
  }

  get start(): AbstractControl<string> {
    return this.form.get('start')!;
  }

  get end(): AbstractControl<string> {
    return this.form.get('end')!;
  }

  get radius(): AbstractControl<number> {
    return this.form.get('radius')!;
  }

  get fuelType(): AbstractControl<string> {
    return this.form.get('fuelType')!;
  }

  get amount(): AbstractControl<number> {
    return this.form.get('amount')!;
  }

  protected onFormSubmit() {
    this._isLoading$.next(true);

    if(this.form.valid && this.mapService.bufferLayer) {
      const bufferLayer = this.mapService.bufferLayer.toGeoJSON();

      if (bufferLayer.type === "FeatureCollection" && bufferLayer.features[0].geometry.type === "Polygon") {
        const coordinates = bufferLayer.features[0].geometry.coordinates;
        this.dashboardService.getAllFuelStationsOnCoordinates(coordinates, this.fuelType.value).pipe(
          catchError(this.handleError.bind(this)),
          tap((fuelStations) => {
            this.fuelStations = fuelStations;
            this.getFuelStations.emit(fuelStations.slice(0, this.amount.value));
            this.mapService.appendAllFuelStationSummaries(fuelStations, this.amount.value)
            this._isLoading$.next(false)
            this._submitted$.next(true)
          }),
        ).subscribe();
      }
    }
  }

  private setRouteAndCenterMiddle(of$: Observable<[Coordinates, Coordinates]>): Observable<ORSRoutePlan> {
    return of$.pipe(
      map(([a, b]) => ({ a, b })),
      switchMap(({ a, b }) => this.calculateRouteService.getRoute(a, b).pipe(
        catchError(this.handleError.bind(this)))
      ),
      tap((data: ORSRoutePlan) => {
        this.mapService.drawPolyLine(data.geometry.coordinates);
        this.getORSProperties.emit(data.properties);
        this.radius.enable();
        this.amount.enable();
        this.fuelType.enable();
      })
    )
  }

  private requestPDOKCoordinatesAndConfigureMap(of$: Observable<string>, firstOrSecond: ROUTE_LOCATION): Observable<Coordinates> {
    return of$.pipe(
      switchMap((id: string) => this.calculateRouteService.getLocation(id)),
      tap((coordinates) => {
        this._submitted$.next(false)
        this.mapService.appendMarker(coordinates.lat, coordinates.lon, firstOrSecond);
        this.mapService.clearDots();
        this.radius.patchValue(0, { emitEvent: false })
      }),
    )
  }

  private handleError() {
    this.notifierService.show({ type: 'error',  message: `Something went wrong!`});
    this._isLoading$.next(false)
    return EMPTY;
  }
}

type RouteFormGroup = { [K in keyof RouteForm]: AbstractControl<RouteForm[K]> }
type RouteForm = { start: string; end: string; radius: number, fuelType: string, amount: number }
