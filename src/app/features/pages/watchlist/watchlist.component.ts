import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import {
    CONTENT_TYPE,
    EnrichedMedia,
    EnrichedWatchlist,
    MergedMedia,
    ParamOptions,
    User,
    VIEW_TYPE,
    WatchlistItem,
} from '../../../shared/models';
import { CollectionService } from '../../../shared/services/collection.service';
import { UsersService } from '../../../shared/services/users.service';
import { NewWatchlistPopupComponent } from '../../new-watchlist-popup/new-watchlist-popup.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ItemPopupDetailsComponent } from '../../item-popup-details/item-popup-details.component';
import { AuthService } from '../../../shared/services/auth.service';
import { WatchlistService } from '../../../shared/services/watchlist.service';

@Component({
    selector: 'app-watchlist',
    imports: [
        ButtonComponent,
        CommonModule,
        AvatarComponent,
        NewWatchlistPopupComponent,
        ItemPopupDetailsComponent,
        CardComponent,
    ],
    templateUrl: './watchlist.component.html',
    styleUrl: './watchlist.component.scss',
    animations: [
        trigger('dropdownAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }),
                animate(
                    '300ms ease-out',
                    style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
                ),
            ]),
            transition(':leave', [
                animate(
                    '200ms ease-in',
                    style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }),
                ),
            ]),
        ]),
    ],
})
export class WatchlistComponent implements OnInit {
    // INTERFACES
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly VIEW_TYPE = VIEW_TYPE;

    // INJECTS
    private router = inject(Router);
    private collectionService: CollectionService = inject(CollectionService);
    private usersService = inject(UsersService);
    private authService = inject(AuthService);
    private watchlistService = inject(WatchlistService);
    private cdr = inject(ChangeDetectorRef);

    // SIGNALS
    filter = signal<CONTENT_TYPE>(CONTENT_TYPE.MOVIE);
    view = signal<VIEW_TYPE>(VIEW_TYPE.NOT_SEEN);
    fullCollection = signal<MergedMedia[]>([]);
    // watchlist = signal<MergedMedia[]>([]);

    selectedInfo = signal<EnrichedMedia | null>(null);

    showDetailsPopup = signal<boolean>(false);
    showNewWatchlistPopup = signal<boolean>(false);

    animatePopupDetails = signal<boolean>(true);

    isWatchlistSelectorOpen = signal<boolean>(false);

    loading = signal<boolean>(true);

    noResults = signal<boolean>(false);

    user = toSignal(this.authService.user$);
    watchlist = toSignal(this.watchlistService.activeWatchlist$);
    filteredWatchlist = computed(() => {
        const list = this.watchlist();

        const filter = this.filter();
        const view = this.view();
        if (!list) return null;

        const filteredMedias = list.medias.filter((media) => {
            return media.mediaDetails.type === filter && media.isSeen === (view === VIEW_TYPE.SEEN);
        });

        return { ...list, medias: filteredMedias };
    });

    initialsLoggedUser = computed<string>(() => this.user()?.name[0].toUpperCase() ?? '');

    activeWatchlistId = signal<string | null>(localStorage.getItem('activeWatchlistId'));

    userWatchlists = toSignal(this.watchlistService.watchlists$);

    // OPTIONS
    contentTypeOptions: Array<ParamOptions> = [
        { id: CONTENT_TYPE.MOVIE, value: 'Films' },
        { id: CONTENT_TYPE.TV, value: 'Séries' },
    ];
    viewOptions: Array<ParamOptions> = [
        { id: VIEW_TYPE.SEEN, value: 'A voir' },
        { id: VIEW_TYPE.NOT_SEEN, value: 'Vus' },
    ];

    // OTHER
    @ViewChild('watchlistWrapper') watchlistWrapper!: ElementRef<HTMLDivElement>;
    @ViewChild('dropdownMenu') dropdownMenu!: ElementRef<HTMLDivElement>;

    async ngOnInit(): Promise<void> {
        if (localStorage.getItem('filter')) {
            this.filter.set(localStorage.getItem('filter') as CONTENT_TYPE);
        }

        if (localStorage.getItem('view-watchlist')) {
            this.view.set(localStorage.getItem('view-watchlist') as VIEW_TYPE);
        }

        if (this.activeWatchlistId()) {
            this.updateWatchlist();
        }
    }

    setContentType(contentType: CONTENT_TYPE) {
        this.filter.set(contentType);
        localStorage.setItem('filter', contentType);

        this.cdr.detectChanges();

        setTimeout(() => {
            this.watchlistWrapper.nativeElement.scrollTop = 0;
        }, 0);
    }

    updateWatchlist(): void {
        this.collectionService.getWatchlistMedias(this.activeWatchlistId()!).subscribe((medias) => {
            this.loading.set(false);
            this.fullCollection.set(
                medias.sort((a, b) => {
                    const dateA = new Date(a.mediaWatchlistInfos!.dateAddedToWatchlist).getTime();
                    const dateB = new Date(b.mediaWatchlistInfos!.dateAddedToWatchlist).getTime();
                    return dateA - dateB;
                }),
            );
        });
    }

    openSearchView(): void {
        this.router.navigate(['search']);
    }

    setView(view: VIEW_TYPE): void {
        this.view.set(view);
        localStorage.setItem('view-watchlist', this.view());
    }

    handleShowDetails(info: EnrichedMedia) {
        this.selectedInfo.set(info);
        this.showDetailsPopup.set(true);
    }

    closeDetailsPopup() {
        this.showDetailsPopup.set(false);
        this.animatePopupDetails.set(true);
    }

    handleUpdate() {
        this.animatePopupDetails.set(false);
    }

    async logOut() {
        await this.authService.logout();
        this.router.navigateByUrl('/access', { replaceUrl: true });
    }

    toggleWatchlistSelector(): void {
        this.isWatchlistSelectorOpen.update((value) => !value);
    }

    selectWatchlist(watchlistId: string): void {
        this.watchlistService.setActiveId(watchlistId);
        this.isWatchlistSelectorOpen.set(false);
    }

    createNewWatchlist(): void {
        this.showNewWatchlistPopup.set(true);
        this.isWatchlistSelectorOpen.set(false);
    }

    onNewWatchlistCreated(newWatchlist: WatchlistItem): void {
        this.showNewWatchlistPopup.set(false);
        this.watchlistService.setActiveId(newWatchlist.uidWatchlist);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (
            this.isWatchlistSelectorOpen() &&
            this.dropdownMenu &&
            !this.dropdownMenu.nativeElement.contains(event.target as Node)
        ) {
            this.isWatchlistSelectorOpen.set(false);
        }
    }
}
