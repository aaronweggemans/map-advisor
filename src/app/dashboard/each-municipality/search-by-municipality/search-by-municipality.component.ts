import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ALL_SUPPORTED_FUEL_TYPES} from "../../../app.contants";
import {MunicipalityForm} from "../each-municipality.models";
import {BehaviorSubject, Subject} from "rxjs";

@Component({
  selector: 'app-search-by-municipality',
  standalone: true,
  imports: [NgForOf, ReactiveFormsModule, AsyncPipe, NgIf],
  templateUrl: './search-by-municipality.component.html',
  styleUrl: './search-by-municipality.component.scss'
})
export class SearchByMunicipalityComponent {
  @Output() formSubmit: EventEmitter<MunicipalityForm> = new EventEmitter();
  @Output() refreshPage: EventEmitter<void> = new EventEmitter();

  @Input() set enableForm(enableForm: boolean) {

    if(enableForm) {
      this._isButtonDisabled$.next(false);
      this.form.enable();
    }
  }

  private readonly _isButtonDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  protected readonly isButtonDisabled$ = this._isButtonDisabled$.asObservable();

  private readonly _showRefreshButton: Subject<boolean> = new Subject<boolean>();
  protected readonly showRefreshButton$ = this._showRefreshButton.asObservable();

  protected readonly fuelTypes = ALL_SUPPORTED_FUEL_TYPES;
  protected readonly form = new FormGroup<MunicipalityFormGroup>({
    fuelType: new FormControl({ value: 'euro95', disabled: true }, { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl({ value: 10, disabled: true }, { nonNullable: true, validators: [Validators.required] }),
  });

  get amount(): AbstractControl<number> {
    return this.form.get('amount')!;
  }

  protected onFormSubmit() {
    if(this.form.valid) {
      this._isButtonDisabled$.next(true);
      this.formSubmit.emit(this.form.getRawValue());
      this._showRefreshButton.next(true)
    }
  }

  protected refresh() {
    this._showRefreshButton.next(false);
    this.refreshPage.emit();
  }
}

type MunicipalityFormGroup = { [K in keyof MunicipalityForm]: AbstractControl<MunicipalityForm[K]> }
