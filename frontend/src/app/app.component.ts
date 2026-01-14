import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // templateUrl: './app.component.html',
  // styleUrl: './app.component.scss'
  template: `
   <!-- <app-navbar></app-navbar> -->
   <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'frontend';
}
