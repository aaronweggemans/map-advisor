import {Component, forwardRef, Input} from '@angular/core';
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
  EMPTY, filter,
  map,
  Observable,
  switchMap,
  tap
} from "rxjs";
import {PDOKAddressMatch} from "../calculate-route.models";
import {PdokSuggestionService} from "../pdok-suggestion.service";

@Component({
  selector: 'app-pdok-suggestion-input',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    AsyncPipe
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
  @Input() title: string = '';
  @Input() placeholder: string = 'Voer hier uw address in';

  private readonly _showSuggestions$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected readonly showSuggestions$: Observable<boolean> = this._showSuggestions$.asObservable();

  protected readonly suggestionInput: FormControl<string> = new FormControl('', { nonNullable: true });

  protected readonly suggestions$: Observable<PDOKAddressMatch[]> =
    this.suggestionInput.valueChanges.pipe((of) => this.mapAndFilterOnPostalCode(of));

  private onChange!: (value: string) => void;

  constructor(private readonly pdokSuggestionService: PdokSuggestionService) {
  }

  protected selectSuggestion(suggestion: PDOKAddressMatch): void {
    this._showSuggestions$.next(false);
    this.suggestionInput.setValue(suggestion.weergavenaam, { emitEvent: false });
    this.onChange(suggestion.id);
  }

  private mapAndFilterOnPostalCode(of$: Observable<string>): Observable<PDOKAddressMatch[]> {
    return of$.pipe(
      debounceTime(1000),
      map(value => value.trim()),
      filter((value) => value.length > 0),
      distinctUntilChanged(),
      switchMap((address) =>
        this.pdokSuggestionService.getSuggestionsOnAddress(address).pipe(
          catchError(() => {
            this.suggestionInput.disable();
            this._showSuggestions$.next(false);
            return EMPTY;
          })
        )
      ),
      tap(() => this._showSuggestions$.next(true)),
      map((suggestions) => suggestions.suggestions)
    );
  }

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

  writeValue(): void {}
}
