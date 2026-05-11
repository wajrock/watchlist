import {
    Component,
    computed,
    EventEmitter,
    inject,
    input,
    Input,
    Output,
    signal,
} from '@angular/core';
import axios from 'axios';
import { CollectionService } from '../../shared/services/collection.service';
import { CommonModule } from '@angular/common';
import { DisplayRatePipe } from '../../shared/pipes/display-rate.pipe';
import { DisplayRuntimePipe } from '../../shared/pipes/display-runtime.pipe';
import { DisplayGenrePipe } from '../../shared/pipes/display-genre.pipe';
import { DisplaySeasonsNumberPipe } from '../../shared/pipes/display-seasons-number.pipe';
import { DisplayDatePipe } from '../../shared/pipes/display-date.pipe';
import { DisplayProviderPipe } from '../../shared/pipes/display-provider.pipe';
import { PopupComponent } from '../../shared/components/popup/popup.component';
import {
    ApiMedia,
    CollectionMedia,
    CONTENT_TYPE,
    EnrichedMedia,
    MergedMedia,
    WatchlistMediaAdd,
} from '../../shared/models';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { UsersService } from '../../shared/services/users.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-item-popup-details',
    imports: [
        PopupComponent,
        CommonModule,
        DisplayRatePipe,
        DisplayRuntimePipe,
        DisplayGenrePipe,
        DisplaySeasonsNumberPipe,
        DisplayDatePipe,
        DisplayProviderPipe,
        ButtonComponent,
    ],
    templateUrl: './item-popup-details.component.html',
    styleUrl: './item-popup-details.component.scss',
})
export class ItemPopupDetailsComponent {
    private authService = inject(AuthService);
    itemInfos = input.required<EnrichedMedia>();
    @Input() contentType!: CONTENT_TYPE;
    @Input({ required: true }) view!: 'watchlist' | 'search';
    @Input() animateOnInit = true;

    @Output() addedToCollection = new EventEmitter<void>();
    @Output() removedFromCollection = new EventEmitter<void>();
    @Output() updating = new EventEmitter<void>();

    @Output() close = new EventEmitter<void>();

    collectionService = inject(CollectionService);
    usersService = inject(UsersService);

    provider: string = 'Inconnu';
    duration!: number;
    numberSeasons!: number;
    genre!: string;

    imgBaseUrl = 'https://image.tmdb.org/t/p/';
    currentBackdropSrc = '';
    highResLoaded = false;

    isAddedButtonClicked = false;
    isDeletedButtonClicked = false;
    isViewedButtonClicked = false;
    isCloseButtonClicked = false;

    isProviderRequestDone = false;
    isDetailsRequestDone = false;

    ownerName = toSignal(
        toObservable(this.itemInfos).pipe(
            map((infos) => infos?.addedByUserId),
            switchMap((user) => (user ? this.usersService.getUser(user.uid) : of(null))),
            map((user) => user?.name),
        ),
    );

    currentWatchlistId = signal<string>(localStorage.getItem('activeWatchlistId')!);

    hasMediaSeen = signal<boolean>(false);

    user = toSignal(this.authService.user$);

    async ngOnInit() {
        if (this.view === 'watchlist') {
            this.hasMediaSeen.set(this.itemInfos()!.isSeen);
        }

        this.currentBackdropSrc =
            this.imgBaseUrl + 'w300' + this.itemInfos().mediaDetails.backdrop_path;
        const highResImg = new Image();
        highResImg.src = this.imgBaseUrl + 'w780' + this.itemInfos().mediaDetails.backdrop_path;
        highResImg.onload = () => {
            this.currentBackdropSrc = highResImg.src;
            this.highResLoaded = true;
        };
        if (this.view === 'search') {
            const headers = {
                accept: 'application/json',
                Authorization:
                    'Bearer ***REMOVED***',
            };
            const providerResponse = await axios.get(
                `https://api.themoviedb.org/3/${this.contentType}/${this.itemInfos().mediaDetails.apiId}/watch/providers`,
                { headers },
            );
            const flatRateOptions = providerResponse.data.results?.FR?.flatrate || [];
            if (flatRateOptions.length > 0) {
                this.provider = flatRateOptions[0].provider_name;
            }
            this.isProviderRequestDone = true;
            const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/${this.contentType}/${this.itemInfos().mediaDetails.apiId}?language=fr-FR`,
                { headers },
            );
            this.genre = detailsResponse.data.genres[0].name;
            if (this.contentType === 'movie') {
                this.duration = detailsResponse.data.runtime;
            } else {
                this.numberSeasons = detailsResponse.data.number_of_seasons!;
            }
            this.isDetailsRequestDone = true;
        } else {
            this.provider = this.itemInfos().mediaDetails.provider!;
            this.genre = this.itemInfos().mediaDetails.genre!;
            if (this.contentType === 'movie') {
                this.duration = this.itemInfos().mediaDetails.runtime!;
            } else {
                this.numberSeasons = this.itemInfos().mediaDetails.numberSeason!;
            }
        }
    }

    onClose() {
        this.close.emit();
    }

    addToCollection() {
        const durationsInfos =
            this.contentType === 'movie'
                ? { runtime: this.duration }
                : { numberSeason: this.numberSeasons };

        const apiMediaInfos: ApiMedia = {
            ...this.itemInfos().mediaDetails,
            genre: this.genre,
            provider: this.provider,
            dateAddedToCollection: new Date().toISOString(),
            ...durationsInfos,
        };

        const mediaWatchlistInfos: WatchlistMediaAdd = {
            addedByUserId: this.user()!.uid,
            isSeen: this.hasMediaSeen(),
            dateAddedToWatchlist: new Date().toISOString(),
        };
        this.collectionService
            .addMediaToWatchlist(this.currentWatchlistId(), apiMediaInfos, mediaWatchlistInfos)
            .subscribe((response: boolean) => {
                if (response) {
                    this.addedToCollection.emit();
                }
            });
    }

    removeFromCollection() {
        this.collectionService
            .removeMediaFromWatchlist(this.currentWatchlistId(), this.itemInfos().uidMedia)
            .subscribe((response) => {
                if (response) {
                    this.close.emit();
                }
            });
        this.close.emit();
    }

    changeSeenStatus() {
        if (this.view === 'search') {
            this.hasMediaSeen.update((value) => !value);
            this.addToCollection();
        } else {
            this.collectionService
                .updateMediaSeenStatus(
                    this.currentWatchlistId(),
                    this.itemInfos().uidMedia,
                    !this.hasMediaSeen(),
                )
                .subscribe((response) => {
                    if (response) {
                        this.hasMediaSeen.update((value) => !value);
                    }
                });
        }
    }
}
