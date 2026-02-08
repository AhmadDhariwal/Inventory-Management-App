import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  template: `
    <div class="scanner-container">
      <div class="scanner-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" (click)="onClose()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="scanner-window">
        <zxing-scanner
          [formats]="allowedFormats"
          (scanSuccess)="onScanSuccess($event)"
          (scanError)="onScanError($event)"
          [enable]="enabled"
          [tryHarder]="true">
        </zxing-scanner>
        
        <div class="scanner-overlay">
          <div class="laser"></div>
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
        </div>
      </div>
      
      <div class="scanner-footer">
        <p>Position the barcode within the frame to scan</p>
      </div>
    </div>
  `,
  styles: [`
    .scanner-container {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      max-width: 500px;
      margin: 0 auto;
    }
    .scanner-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-main);
      border-bottom: 1px solid var(--border-main);
    }
    .scanner-window {
      position: relative;
      aspect-ratio: 4/3;
      background: #000;
    }
    .scanner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .laser {
      width: 80%;
      height: 2px;
      background: rgba(255, 0, 0, 0.5);
      box-shadow: 0 0 10px red;
      position: absolute;
      animation: scan 2s infinite ease-in-out;
    }
    @keyframes scan {
      0%, 100% { top: 20%; }
      50% { top: 80%; }
    }
    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: var(--brand-primary);
      border-style: solid;
      border-width: 0;
    }
    .top-left { top: 15%; left: 15%; border-top-width: 4px; border-left-width: 4px; }
    .top-right { top: 15%; right: 15%; border-top-width: 4px; border-right-width: 4px; }
    .bottom-left { bottom: 15%; left: 15%; border-bottom-width: 4px; border-left-width: 4px; }
    .bottom-right { bottom: 15%; right: 15%; border-bottom-width: 4px; border-right-width: 4px; }
    
    .scanner-footer {
      padding: 1rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-main);
      cursor: pointer;
      font-size: 1.2rem;
    }
  `]
})
export class BarcodeScannerComponent {
  @Input() title: string = 'Scan Barcode';
  @Input() enabled: boolean = true;
  @Output() scanSuccess = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX
  ];

  onScanSuccess(result: string) {
    this.scanSuccess.emit(result);
  }

  onScanError(error: any) {
    console.error('Scanner error:', error);
  }

  onClose() {
    this.close.emit();
  }
}
