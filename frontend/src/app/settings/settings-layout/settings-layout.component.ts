import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './settings-layout.component.html',
  styleUrl: './settings-layout.component.scss'
})
export class SettingsLayoutComponent {

}
