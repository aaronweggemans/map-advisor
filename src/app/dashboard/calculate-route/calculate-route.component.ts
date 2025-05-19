import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {PdokSuggestionInputComponent} from "./pdok-suggestion-input/pdok-suggestion-input.component";
import {PDOKAddress, ORSRoutePlan, ORSProperties} from "./calculate-route.models";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  map,
  Observable,
  Subject,
  switchMap,
  tap
} from "rxjs";
import {CalculateRouteService} from "./calculate-route.service";
import {MapService} from "../../map/map.service";
import {ROUTE_LOCATION} from "../../map/map.component.models";
import {AsyncPipe, NgIf} from "@angular/common";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'app-calculate-route',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PdokSuggestionInputComponent,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './calculate-route.component.html'
})
export class CalculateRouteComponent implements OnInit {
  private readonly locationA$: Subject<PDOKAddress> = new Subject();
  private readonly locationB$: Subject<PDOKAddress> = new Subject();

  private readonly _showAdditionalInformation: Subject<boolean> = new BehaviorSubject(false);
  protected readonly showAdditionalInformation$: Observable<boolean> = this._showAdditionalInformation.asObservable();

  private readonly _explanation$: Subject<ORSProperties> = new Subject();
  protected readonly explanation$: Observable<ORSProperties> = this._explanation$.asObservable();

  protected readonly form =  new FormGroup<RouteFormGroup>({
    start: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    end: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    radius: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(50, { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly calculateRouteService: CalculateRouteService,
    private readonly mapService: MapService,
    private readonly notifierService: NotifierService
  ) {}

  ngOnInit() {
    this.start.valueChanges.pipe(
      switchMap((id: string) => this.calculateRouteService.getLocation(id)),
      tap((location) => this.locationA$.next(location)),
      tap(({ coordinates }) => {
        this.mapService.flyTo(coordinates.lat, coordinates.lon);
        this.mapService.appendMarker(coordinates.lat, coordinates.lon, ROUTE_LOCATION.LOCATION_A);
      }),
    ).subscribe();

    this.end.valueChanges.pipe(
      switchMap((id: string) => this.calculateRouteService.getLocation(id)),
      tap((location) => this.locationB$.next(location)),
      tap(({ coordinates }) => {
        this.mapService.flyTo(coordinates.lat, coordinates.lon);
        this.mapService.appendMarker(coordinates.lat, coordinates.lon, ROUTE_LOCATION.LOCATION_B);
      }),
    ).subscribe();

    combineLatest([this.locationA$, this.locationB$]).pipe(this.setRouteAndCenterMiddle.bind(this)).subscribe();
    this.radius.valueChanges.pipe(tap((radius) => this.mapService.appendBufferToPolyLine(radius))).subscribe();
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

  get amount(): AbstractControl<number> {
    return this.form.get('amount')!;
  }

  protected onFormSubmit() {
    if(this.form.valid) {
      console.log('Call to backend')
    }
  }

  private setRouteAndCenterMiddle(of$: Observable<[PDOKAddress, PDOKAddress]>) {
    return of$.pipe(
      debounceTime(2000),
      map(([a, b]) => ({ a: a.coordinates, b: b.coordinates })),
      switchMap(({ a, b }) => this.calculateRouteService.getRoute(a, b).pipe(
        catchError((error) => {
          this.notifierService.show({ type: 'error',  message: `Something went wrong: ${error.statusText}` });
          return EMPTY;
        }))
      ),
      tap((data: ORSRoutePlan) => {
        this.mapService.drawPolyLine(data.geometry.coordinates);
        this._showAdditionalInformation.next(true);
        this._explanation$.next(data.properties);
      })
    )
  }
}

type RouteFormGroup = { [K in keyof RouteForm]: AbstractControl<RouteForm[K]> }
type RouteForm = { start: string; end: string; radius: number, amount: number }

