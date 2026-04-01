import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService, DialogOptions } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit, OnDestroy {
  @ViewChild('promptInput') promptInput!: ElementRef;
  
  isOpen = false;
  options: DialogOptions | null = null;
  inputValue: string = '';
  private subscription!: Subscription;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.subscription = this.dialogService.dialogState$.subscribe((opts) => {
      if (opts && opts.type) {
        this.options = opts;
        this.inputValue = opts.defaultValue || '';
        this.isOpen = true;
        if (opts.type === 'prompt') {
          setTimeout(() => {
            if (this.promptInput) this.promptInput.nativeElement.focus();
          }, 100);
        }
      } else {
        this.isOpen = false;
        this.options = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  cancel() {
    this.dialogService.close(this.options?.type === 'prompt' ? null : false);
  }

  confirm() {
    if (this.options?.type === 'prompt') {
      this.dialogService.close(this.inputValue);
    } else if (this.options?.type === 'confirm') {
      this.dialogService.close(true);
    } else {
      this.dialogService.close(null);
    }
  }

  onOverlayClick(event: MouseEvent) {
  }
}
