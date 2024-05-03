import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-map-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './map-menu.component.html',
  styleUrl: './map-menu.component.scss',
})
export class MapMenuComponent {
  mouseEnter() {
    console.log('mouse enter');
  }

  mouseLeave() {
    console.log('Mouse leave');
  }
}
