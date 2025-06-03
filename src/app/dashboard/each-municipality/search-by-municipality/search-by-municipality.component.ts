import {Component, EventEmitter, Output} from '@angular/core';
import {NgForOf} from "@angular/common";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ALL_SUPPORTED_FUEL_TYPES} from "../../../app.contants";
import {MunicipalityForm} from "../each-municipality.models";

@Component({
  selector: 'app-search-by-municipality',
  standalone: true,
  imports: [NgForOf, ReactiveFormsModule],
  templateUrl: './search-by-municipality.component.html',
  styleUrl: './search-by-municipality.component.scss'
})
export class SearchByMunicipalityComponent {
  @Output() formSubmit: EventEmitter<MunicipalityForm> = new EventEmitter();

  protected readonly fuelTypes = ALL_SUPPORTED_FUEL_TYPES;
  protected readonly form = new FormGroup<MunicipalityFormGroup>({
    fuelType: new FormControl('euro95', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(10, { nonNullable: true, validators: [Validators.required] }),
  });

  get amount(): AbstractControl<number> {
    return this.form.get('amount')!;
  }

  protected onFormSubmit() {
    if(this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue())
    }
  }
}

type MunicipalityFormGroup = { [K in keyof MunicipalityForm]: AbstractControl<MunicipalityForm[K]> }
