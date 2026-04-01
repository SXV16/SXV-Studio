import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface DialogOptions {
  type: 'alert' | 'confirm' | 'prompt';
  title: string;
  message: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogSubject = new Subject<DialogOptions>();
  dialogState$ = this.dialogSubject.asObservable();
  
  private resolveFn: any;

  constructor() { }

  alert(message: string, title: string = 'SXV Studio'): Promise<void> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.dialogSubject.next({
        type: 'alert',
        title,
        message,
        confirmText: 'OK'
      });
    });
  }

  confirm(message: string, title: string = 'Confirm Action', confirmText: string = 'Proceed', cancelText: string = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.dialogSubject.next({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText
      });
    });
  }

  prompt(message: string, defaultValue: string = '', title: string = 'Input Required', confirmText: string = 'OK', cancelText: string = 'Cancel'): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.dialogSubject.next({
        type: 'prompt',
        title,
        message,
        defaultValue,
        confirmText,
        cancelText
      });
    });
  }

  close(result: any) {
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
    this.dialogSubject.next({} as DialogOptions);
  }
}
