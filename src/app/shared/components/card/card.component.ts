import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import axios from 'axios';
import { ItemPopupDetailsComponent } from '../../../features/item-popup-details/item-popup-details.component';
import { MergedMedia, CONTENT_TYPE, EnrichedWatchlist, EnrichedMedia } from '../../models';

@Component({
    selector: 'app-card',
    imports: [ItemPopupDetailsComponent, CommonModule],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
    @Input({ required: true }) view!: 'watchlist' | 'search';
    @Input({ required: true }) info!: EnrichedMedia;
    @Input() contentType!: CONTENT_TYPE;
    @Output() isCardPopupOpen = new EventEmitter<boolean>();
    @Output() itemAddedToCollection = new EventEmitter<boolean>();
    @Output() showDetails = new EventEmitter<EnrichedMedia>();

    @ViewChild('toastWrap') toast!: ElementRef;

    showDetailsPopup: boolean = false;
    animatePopup = true;

    logo: any = { path: null, aspectRatio: null };
    videoKey!: string;

    async ngOnInit() {
        const headers = {
            accept: 'application/json',
            Authorization:
                'Bearer ***REMOVED***',
        };
        const logoResponse = await axios.get(
            `https://api.themoviedb.org/3/${this.contentType}/${this.info.mediaDetails.apiId}/images`,
            { headers },
        );
        const logos = logoResponse.data.logos;

        const sortByVotes = (a: any, b: any) => b.vote_count - a.vote_count;

        let logo = logos.filter((l: any) => l.iso_639_1 === 'fr').sort(sortByVotes)[0];

        if (!logo) {
            logo = logos.filter((l: any) => l.iso_639_1 === 'en').sort(sortByVotes)[0];
        }

        if (logo) {
            this.logo = {
                path: logo.file_path,
                aspect_ratio: logo.aspect_ratio,
            };
        }
    }

    openDetailsPopup() {
        this.showDetails.emit({
            ...this.info,
            mediaDetails: { ...this.info.mediaDetails, logo: this.logo },
        });
    }

    closeDetailsPopup() {
        this.showDetailsPopup = false;
        this.isCardPopupOpen.emit(false);
    }

    handleAddItem(): void {
        this.closeDetailsPopup();
    }

    handleUpdate() {
        this.animatePopup = false;
    }
}
