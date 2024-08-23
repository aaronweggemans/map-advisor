import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bar-chart.component.html',
})
export class BarChartComponent {
  private fuelStationsChart: Chart<'bar', string[]> | null = null;

  @Input({ required: true }) set barChartData({ labels, data }: BarChartData) {
    this.fuelStationsChart?.destroy();
    new Chart('fuel-stations', {
      type: 'bar',
      options: { scales: { y: { beginAtZero: true } } },
      data: {
        labels,
        datasets: [
          {
            label: 'Costs',
            data,
            backgroundColor: this.chartJsColors,
            borderColor: this.chartJsColors,
          },
        ],
      },
    });
  }

  private chartJsColors = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
  ];
}

interface BarChartData {
  labels: string[];
  data: string[];
}
