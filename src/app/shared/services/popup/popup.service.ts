import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PopupService {
    isPopupOpen = signal(false);

    open(): void {
        this.isPopupOpen.set(true);
    }

    close(): void {
        this.isPopupOpen.set(false);
    }
}
