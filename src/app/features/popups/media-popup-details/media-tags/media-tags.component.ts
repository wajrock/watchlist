import { Component, input } from '@angular/core';
import { ApiMedia } from '../../../../shared/models/firebase.models';
import { CONTENT_TYPE } from '../../../../shared/models/models';
import { DisplayRuntimePipe } from '../../../../shared/pipes/display-runtime.pipe';
import { DisplayGenrePipe } from '../../../../shared/pipes/display-genre.pipe';
import { DisplayDatePipe } from '../../../../shared/pipes/display-date.pipe';
import { DisplaySeasonsNumberPipe } from '../../../../shared/pipes/display-seasons-number.pipe';

@Component({
    selector: 'app-media-tags',
    imports: [
        DisplayRuntimePipe,
        DisplayGenrePipe,
        DisplayRuntimePipe,
        DisplayDatePipe,
        DisplaySeasonsNumberPipe,
    ],
    templateUrl: './media-tags.component.html',
    styleUrl: './media-tags.component.scss',
})
export class MediaTagsComponent {
    CONTENT_TYPE = CONTENT_TYPE;
    mediaDetails = input.required<ApiMedia>();
    contentType = input.required<CONTENT_TYPE>();
}
