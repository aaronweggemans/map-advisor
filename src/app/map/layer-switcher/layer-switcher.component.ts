import { Component, EventEmitter, Output } from '@angular/core';
import { TileTheme } from '../map.component.models';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-layer-switcher',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './layer-switcher.component.html',
  styleUrl: './layer-switcher.component.scss',
})
export class LayerSwitcherComponent {
  @Output() setTheme: EventEmitter<TileTheme> = new EventEmitter<TileTheme>();

  protected switchTheme(theme: TileTheme): false {
    this.setTheme.emit(theme);
    return false;
  }
}
