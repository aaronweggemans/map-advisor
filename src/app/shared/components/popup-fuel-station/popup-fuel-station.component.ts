import {Component, Input} from '@angular/core';
import {FuelStation} from "../../../dashboard/dashboard.models";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'app-popup-fuel-station',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './popup-fuel-station.component.html'
})
export class PopupFuelStationComponent {
  // Be aware that required doesn't do anything here...
  @Input({ required: true }) fuelStation!: FuelStation;

  private readonly _activeTab$: BehaviorSubject<Tabs> = new BehaviorSubject<Tabs>('general');
  protected readonly activeTab$: Observable<Tabs> = this._activeTab$.asObservable();

  protected switchContent(event: Event, tab: Tabs): void {
    event.preventDefault();
    this._activeTab$.next(tab);
  }
}

type Tabs = 'general' | 'prices';
