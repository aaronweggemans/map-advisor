import { Component, EventEmitter, Output } from '@angular/core';
import { TileTheme } from '../map.component.models';

@Component({
  selector: 'app-layer-switcher',
  standalone: true,
  imports: [],
  templateUrl: './layer-switcher.component.html',
  styleUrl: './layer-switcher.component.scss',
})
export class LayerSwitcherComponent {
  @Output() setTheme: EventEmitter<TileTheme> = new EventEmitter<TileTheme>();

  switchTheme(theme: TileTheme) {
    this.setTheme.emit(theme);
  }
}
