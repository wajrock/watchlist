import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class NavbarService {
    readonly showNavbar = signal<boolean>(true);

    hide() {
        this.showNavbar.set(false);
    }
    show() {
        this.showNavbar.set(true);
    }
}
