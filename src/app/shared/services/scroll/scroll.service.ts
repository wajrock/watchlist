import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root',
})
export class ScrollService {
    shouldScrollToTop = signal<boolean>(false);

    scrollToTop = toObservable(this.shouldScrollToTop);
}
