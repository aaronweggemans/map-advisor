import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-map-top-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './map-top-navbar.component.html',
  styleUrl: './map-top-navbar.component.scss'
})
export class MapTopNavbarComponent {

}
