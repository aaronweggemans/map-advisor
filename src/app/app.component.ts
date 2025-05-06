import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotifierModule } from 'angular-notifier';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [DashboardComponent, NotifierModule],
})
export class AppComponent {}
