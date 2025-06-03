import { Component, Input } from '@angular/core';
import {MunicipalityProperty} from "../../dashboard.models";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-selected-municipality',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './selected-municipality.component.html',
  styleUrl: './selected-municipality.component.scss'
})
export class SelectedMunicipalityComponent {
  @Input({ required: true }) selectedMunicipality!: MunicipalityProperty;
}
