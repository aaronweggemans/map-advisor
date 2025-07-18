import {Component, forwardRef, HostBinding, Input} from '@angular/core';
import {
  ControlValueAccessor, FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from "@angular/forms";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  map,
  Observable, of, Subject,
  switchMap,
  tap
} from "rxjs";
import {PDOKAddressMatch} from "../../calculate-route.models";
import {PdokSuggestionService} from "../../pdok-suggestion.service";
import {LoadingSpinnerComponent} from "../../../../shared/components/loading-spinner/loading-spinner.component";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'app-pdok-suggestion-input',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    AsyncPipe,
    LoadingSpinnerComponent
  ],
  templateUrl: './pdok-suggestion-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PdokSuggestionInputComponent),
      multi: true
    }
  ]
})
export class PdokSuggestionInputComponent implements ControlValueAccessor {
  @HostBinding('attr.id') hostId = null

  @Input() placeholder: string = 'Voer hier uw address in';
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) id: string = '';

  private readonly _showSuggestions$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected readonly showSuggestions$: Observable<boolean> = this._showSuggestions$.asObservable();

  private readonly _isLoading$: Subject<boolean> = new Subject<boolean>();
  protected readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  protected readonly suggestionInput: FormControl<string> = new FormControl('', { nonNullable: true });

  protected readonly suggestions$ = this.suggestionInput.valueChanges.pipe(
    tap(() => this._showSuggestions$.next(false)),
    debounceTime(500),
    tap(() => console.log('Waiting for suggestions...')),
    map(value => value.trim()),
    distinctUntilChanged(),
    switchMap(value => value ? this.fetchSuggestions(value) : of([]))
  );

  private onChange!: (value: string) => void;

  constructor(private readonly pdokSuggestionService: PdokSuggestionService, private readonly notifierService: NotifierService) {}

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(): void {}

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.suggestionInput.disable();
    } else {
      this.suggestionInput.enable();
    }
  }

  writeValue(value: string): void {
    this.suggestionInput.setValue(value);
  }

  protected selectSuggestion(suggestion: PDOKAddressMatch): void {
    this._showSuggestions$.next(false);
    this.suggestionInput.setValue(suggestion.weergavenaam, {emitEvent: false});
    this.onChange(suggestion.id);
  }

  private fetchSuggestions(address: string): Observable<PDOKAddressMatch[]> {
    this._isLoading$.next(true);
    return this.pdokSuggestionService.getSuggestionsOnAddress(address).pipe(
      catchError(() => {
        this.notifierService.show({ type: 'error', message: 'Er ging iets mis met het ophalen van de suggesties' });
        this._isLoading$.next(false);
        this._showSuggestions$.next(false);
        return EMPTY;
      }),
      tap(() => {
        this._isLoading$.next(false);
        this._showSuggestions$.next(true);
      })
    );
  }
}
