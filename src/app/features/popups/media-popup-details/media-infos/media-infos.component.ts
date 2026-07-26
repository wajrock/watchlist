import { Component, input } from '@angular/core';
import { LucideStar, LucideTvMinimal } from '@lucide/angular';
import { ApiMedia } from '../../../../shared/models/firebase.models';
import { PAGE_VIEW_TYPE } from '../../../../shared/models/models';
import { DisplayProviderPipe } from '../../../../shared/pipes/display-provider.pipe';
import { DisplayRatePipe } from '../../../../shared/pipes/display-rate.pipe';

@Component({
    selector: 'app-media-infos',
    imports: [DisplayRatePipe, DisplayProviderPipe, LucideStar, LucideTvMinimal],
    templateUrl: './media-infos.component.html',
    styleUrl: './media-infos.component.scss',
})
export class MediaInfosComponent {
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;

    view = input.required<PAGE_VIEW_TYPE>();
    mediaDetails = input.required<ApiMedia>();
    ownerName = input.required<string | undefined>();
}
