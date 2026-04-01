import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-waveform',
  template: '<canvas #waveCanvas [width]="widthPx" height="30" style="display: block; opacity: 0.8;"></canvas>'
})
export class WaveformComponent implements AfterViewInit, OnChanges {
  @Input() buffer: AudioBuffer | undefined;
  @Input() widthPx: number = 200;
  @Input() color: string = '#ffffff';

  @ViewChild('waveCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['buffer'] || changes['widthPx'] || changes['color']) {
      this.draw();
    }
  }

  draw() {
    if (!this.canvasRef || !this.canvasRef.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.buffer) return;

    const data = this.buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = this.color;
    
    // Sub-sample massive Float32Array into logical pixel boundaries
    for (let i = 0; i < canvas.width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        // Find local peak limits safely within each discrete block
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        
        // Draw absolute differential strip dynamically mapping peaks natively
        ctx.fillRect(i, amp - (max * amp), 1, Math.max(1, (max - min) * amp));
    }
  }
}
