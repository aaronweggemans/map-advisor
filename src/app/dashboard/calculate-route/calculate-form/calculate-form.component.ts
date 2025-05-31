import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  combineLatest,
  Observable,
  Subject,
  switchMap,
  tap
} from "rxjs";
import {Coordinates, RouteForm} from "../calculate-route.models";
import {ROUTE_LOCATION} from "../../../map/map.component.models";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CalculateRouteService} from "../calculate-route.service";
import {MapService} from "../../../map/map.service";
import { DEFAULT_LOADING_SETTINGS } from '../../../app.contants';
import {PdokSuggestionInputComponent} from "../pdok-suggestion-input/pdok-suggestion-input.component";
import {NgxLoadingModule} from "ngx-loading";
import {AsyncPipe, NgForOf} from "@angular/common";

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
export class CalculateFormComponent implements OnInit {
  @Output() validFormSubmit: EventEmitter<RouteForm> = new EventEmitter();
  @Output() twoLocationsSet: EventEmitter<[Coordinates, Coordinates]> = new EventEmitter();

  protected readonly DEFAULT_LOADING_SETTINGS = DEFAULT_LOADING_SETTINGS;
  protected readonly fuelTypes = ["autogas", "cng", "diesel", "diesel_special", "euro98", "euro95"];

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
    private readonly calculateRouteService: CalculateRouteService,
    private readonly mapService: MapService,
  ) {}

  ngOnInit() {
    this.requestPDOKCoordinatesAndConfigureMap(this.start.valueChanges, ROUTE_LOCATION.LOCATION_A).pipe(
      tap((coords) => this.locationA$.next(coords)),
      tap((coords) => this.mapService.flyTo(coords))
    ).subscribe();

    this.requestPDOKCoordinatesAndConfigureMap(this.end.valueChanges, ROUTE_LOCATION.LOCATION_B).pipe(
      tap((coords) => this.locationB$.next(coords))
    ).subscribe();

    combineLatest([this.locationA$, this.locationB$]).subscribe((data) => {
      this.twoLocationsSet.emit(data);
      this.radius.enable({ emitEvent: false });
      this.amount.enable();
      this.fuelType.enable();
    });
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
}

type RouteFormGroup = { [K in keyof RouteForm]: AbstractControl<RouteForm[K]> }
