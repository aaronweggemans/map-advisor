import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import {Router, RouterOutlet, RoutesRecognized} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {tap} from "rxjs";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(private readonly title: Title, private router: Router) {
    this.router.events.pipe(
      tap((data) => {
        if(data instanceof RoutesRecognized) {
          const title = data.state.root.firstChild?.data['title']

          if(title) {
            this.title.setTitle(`GeoLijn - ${title ?? 'loading'}`);
          } else {
            throw Error('De gebruiker heeft voor deze route geen titel gedefinieerd!')
          }
        }
      })).subscribe();
  }
}
