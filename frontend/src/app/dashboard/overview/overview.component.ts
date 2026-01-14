import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit{

 loading = true;
  error: string | null = null;

  stats: any = null;

   constructor( private dashboardService: DashboardService) {}

   ngOnInit() : void {
    this.loadDashboard();
   }

    loadDashboard(): void {
    this.dashboardService.getdashboardstats().subscribe({
      next: data => {
        this.stats = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
});
    }
  }
