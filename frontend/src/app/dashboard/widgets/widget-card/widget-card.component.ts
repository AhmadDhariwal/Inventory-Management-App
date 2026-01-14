import { CommonModule } from '@angular/common';
import { Component,Input} from '@angular/core';

@Component({
  selector: 'app-widget-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget-card.component.html',
  styleUrl: './widget-card.component.scss'
})
export class WidgetCardComponent {
@Input() title!: string;       // Widget title
  @Input() value!: number;       // Main number or stat
  @Input() icon?: string;        // Optional icon class
  @Input() color?: string;       // Card color / border
  @Input() trend?: 'up' | 'down'; // Trend indicator
}
