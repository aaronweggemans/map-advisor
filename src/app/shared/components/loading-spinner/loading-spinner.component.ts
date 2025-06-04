import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  @Input() width: string = '5em';
  @Input() height: string = '5em';
  @Input() direction: Directions = 'center';
}

type Directions = 'center' | 'left' | 'right';
