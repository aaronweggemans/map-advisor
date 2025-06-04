import { Component, Input } from '@angular/core';
import {MunicipalityProperty} from "../../dashboard.models";

@Component({
  selector: 'app-selected-municipality',
  standalone: true,
  imports: [],
  templateUrl: './selected-municipality.component.html',
  styleUrl: './selected-municipality.component.scss'
})
export class SelectedMunicipalityComponent {
  @Input({ required: true }) selectedMunicipality!: MunicipalityProperty;
}
