import { Injectable, signal } from '@angular/core';
import { CONTENT_TYPE, CONTENT_VIEW_TYPE } from '../../models/models';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    private readonly CONTENT_TYPE_KEY = 'contentType';
    private readonly CONTENT_VIEW_TYPE = 'contentViewType';

    contentType = signal<CONTENT_TYPE>(
        (localStorage.getItem(this.CONTENT_TYPE_KEY) as CONTENT_TYPE) || CONTENT_TYPE.MOVIE,
    );

    contentViewType = signal<CONTENT_VIEW_TYPE>(
        (localStorage.getItem(this.CONTENT_VIEW_TYPE) as CONTENT_VIEW_TYPE) ||
            CONTENT_VIEW_TYPE.NOT_SEEN,
    );

    setContentType(type: CONTENT_TYPE) {
        this.contentType.set(type);
        localStorage.setItem(this.CONTENT_TYPE_KEY, type);
    }

    setContentViewType(view: CONTENT_VIEW_TYPE) {
        this.contentViewType.set(view);
        localStorage.setItem(this.CONTENT_VIEW_TYPE, view);
    }
}
