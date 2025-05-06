import { Component, Input } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.component.html',
})
export class BarChartComponent {
  private fuelStationsChart: Chart<'bar', string[]> | null = null;

  @Input({ required: true }) set barChartData(barChartData: BarChartData) {
    this.fuelStationsChart?.destroy();
    this.fuelStationsChart = new Chart('fuel-stations', {
      type: 'bar',
      options: { scales: { y: { beginAtZero: true } } },
      data: {
        labels: barChartData.labels,
        datasets: [
          {
            label: 'Costs',
            data: barChartData.data,
            backgroundColor: this.chartJsColors,
            borderColor: this.chartJsColors,
          },
        ],
      },
    });
  }

  private readonly chartJsColors: string[] = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
  ];
}

type BarChartData = {
  labels: string[];
  data: string[];
}
