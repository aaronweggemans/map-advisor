import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {
  combineLatest,
  Observable,
  Subject,
  switchMap,
  tap
} from "rxjs";
import {Coordinates, RouteForm} from "../calculate-route.models";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MapService} from "../../../map/map.service";
import {ALL_SUPPORTED_FUEL_TYPES} from '../../../app.contants';
import {PdokSuggestionInputComponent} from "../pdok-suggestion-input/pdok-suggestion-input.component";
import {NgxLoadingModule} from "ngx-loading";
import {AsyncPipe, NgForOf} from "@angular/common";
import {PdokSuggestionService} from "../pdok-suggestion.service";
import {LayerGroup, layerGroup} from "leaflet";

@Component({
  selector: 'app-calculate-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PdokSuggestionInputComponent,
    NgxLoadingModule,
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './calculate-form.component.html',
})
export class CalculateFormComponent implements OnInit, OnDestroy {
  @Output() validFormSubmit: EventEmitter<RouteForm> = new EventEmitter();
  @Output() twoLocationsSet: EventEmitter<[Coordinates, Coordinates]> = new EventEmitter();

  private readonly PDOK_MARKER_LAYER_A = layerGroup();
  private readonly PDOK_MARKER_LAYER_B = layerGroup();

  protected readonly fuelTypes = ALL_SUPPORTED_FUEL_TYPES

  private readonly locationA$: Subject<Coordinates> = new Subject();
  private readonly locationB$: Subject<Coordinates> = new Subject();

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
    private readonly pdokSuggestionService: PdokSuggestionService,
    private readonly mapService: MapService,
  ) {}

  ngOnInit() {
    this.requestPDOKCoordinatesAndConfigureMap(this.start.valueChanges, this.PDOK_MARKER_LAYER_A)
      .subscribe((coords) => (this.locationA$.next(coords), this.mapService.flyTo(coords)));

    this.requestPDOKCoordinatesAndConfigureMap(this.end.valueChanges, this.PDOK_MARKER_LAYER_B)
      .subscribe((coords) => this.locationB$.next(coords));

    combineLatest([this.locationA$, this.locationB$]).subscribe((data) => {
      this.twoLocationsSet.emit(data);
      this.radius.enable({ emitEvent: false });
      this.amount.enable();
      this.fuelType.enable();
    });
  }

  ngOnDestroy() {
    this.mapService.removeLayerFromMap(this.PDOK_MARKER_LAYER_A);
    this.mapService.removeLayerFromMap(this.PDOK_MARKER_LAYER_B);
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
    this._submitted$.next(true);

    if(this.form.valid) {
      this.validFormSubmit.emit(this.form.getRawValue())
    }
  }

  private requestPDOKCoordinatesAndConfigureMap(of$: Observable<string>, layer: LayerGroup): Observable<Coordinates> {
    return of$.pipe(
      switchMap((id: string) => this.pdokSuggestionService.getLocation(id)),
      tap((coordinates) => {
        this._submitted$.next(false)
        this.mapService.appendMarker(coordinates.lat, coordinates.lon, layer);
        this.radius.patchValue(0, { emitEvent: false })
      }),
    )
  }
}

type RouteFormGroup = { [K in keyof RouteForm]: AbstractControl<RouteForm[K]> }
