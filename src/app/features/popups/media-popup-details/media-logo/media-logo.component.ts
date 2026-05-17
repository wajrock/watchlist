import { Component, input } from '@angular/core';
import { ApiMedia } from '../../../../shared/models/firebase.models';
import { TMDB_IMG_BASE_URL } from '../../../../shared/constants/constants';

@Component({
    selector: 'app-media-logo',
    imports: [],
    templateUrl: './media-logo.component.html',
    styleUrl: './media-logo.component.scss',
})
export class MediaLogoComponent {
    TMDB_IMG_BASE_URL = TMDB_IMG_BASE_URL;
    mediaDetails = input.required<ApiMedia>();
}
