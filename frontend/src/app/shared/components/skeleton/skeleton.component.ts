import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton-item" 
      [ngClass]="type"
      [style.width]="width" 
      [style.height]="height"
      [style.borderRadius]="radius"
      [class.animate]="animate">
    </div>
  `,
  styles: [`
    .skeleton-item {
      background: var(--border-main);
      background: linear-gradient(
        90deg, 
        var(--border-main) 25%, 
        var(--hover) 50%, 
        var(--border-main) 75%
      );
      background-size: 200% 100%;
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    .animate {
      animation: skeleton-loading 1.5s infinite linear;
    }

    .circle { border-radius: 50%; }
    .line { border-radius: 4px; height: 12px; }
    .rect { border-radius: 8px; }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    // Dark theme overrides are handled by CSS variables automatically
  `]
})
export class SkeletonComponent {
  @Input() type: 'line' | 'circle' | 'rect' = 'line';
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() radius: string = '';
  @Input() animate: boolean = true;
}
