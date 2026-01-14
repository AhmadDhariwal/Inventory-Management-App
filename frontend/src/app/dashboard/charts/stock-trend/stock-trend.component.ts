import { Component, Input, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-stock-trend',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './stock-trend.component.html',
  styleUrl: './stock-trend.component.scss'
})

export class StockTrendComponent implements OnInit {

  @Input() monthlyStockData: number[] = [];
  @Input() months: string[] = [];

  public chartOptions!: ChartOptions;

  ngOnInit(): void {
    this.chartOptions = {
      series: [
        {
          name: 'Stock Level',
          data: this.monthlyStockData
        }
      ],
      chart: {
        type: 'line',
        height: 320,
        toolbar: { show: false }
      },
      title: {
        text: 'Stock Trend (Last 6 Months)',
        align: 'left'
      },
      xaxis: {
        categories: this.months
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      }
    };
  }
}
