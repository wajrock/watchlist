import { Injectable, signal } from '@angular/core';
import { Toast, TOAST_TYPE } from '../../models/toast.model';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    currentToast = signal<Toast | null>(null);

    show(toast: Toast): void {
        this.currentToast.set(toast);

        setTimeout(() => {
            this.currentToast.set(null);
        }, 3000);
    }
}
