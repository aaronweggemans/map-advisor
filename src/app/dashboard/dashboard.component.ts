import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import {Router, RouterOutlet, RoutesRecognized} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {filter, tap} from "rxjs";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(private readonly title: Title, private router: Router) {
    this.router.events.pipe(
      filter((data): data is RoutesRecognized => data instanceof RoutesRecognized),
      tap((data) => this.title.setTitle(`GeoLijn - ${data.state.root.firstChild?.data['title']}`))
    ).subscribe();
  }
}
