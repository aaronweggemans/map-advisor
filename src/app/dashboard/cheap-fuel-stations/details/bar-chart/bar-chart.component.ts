import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bar-chart.component.html',
})
export class BarChartComponent implements OnChanges {
  private fuelStationsChart: Chart<any> | null = null;

  @Input({ required: true }) barChartData!: BarChartData;

  private chartJsColors = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
  ];

  ngOnChanges(): void {
    this.fuelStationsChart?.destroy();

    this.fuelStationsChart = new Chart('fuel-stations', {
      type: 'bar',
      data: {
        labels: this.barChartData.labels,
        datasets: [
          {
            label: 'Costs',
            data: this.barChartData.data,
            backgroundColor: this.chartJsColors,
            borderColor: this.chartJsColors,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

interface BarChartData {
  labels: string[];
  data: string[];
}
