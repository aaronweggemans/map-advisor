import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-detail-fuel-prices',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar-detail-fuel-prices.component.html',
})
export class SidebarDetailFuelPricesComponent {
  @Output() closeSidebar: EventEmitter<void> = new EventEmitter();
}
