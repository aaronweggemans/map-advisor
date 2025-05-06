import { Component, Input } from '@angular/core';
import { TileTheme } from '../map.component.models';

@Component({
  selector: 'app-map-sidebar',
  standalone: true,
  templateUrl: './map-sidebar.component.html',
  styleUrl: './map-sidebar.component.scss',
})
export class MapSidebarComponent {
  @Input() theme: TileTheme = 'LIGHT';
}
