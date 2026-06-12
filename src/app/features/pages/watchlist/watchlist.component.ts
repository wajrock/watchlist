import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

import { EnrichedMedia, MergedMedia, WatchlistItem } from '../../../shared/models/firebase.models';
import {
    CardInfo,
    CONTENT_TYPE,
    CONTENT_VIEW_TYPE,
    PAGE_VIEW_TYPE,
    POPUP,
} from '../../../shared/models/models';
import { WatchlistMembersCountPipe } from '../../../shared/pipes/watchlist-members-count.pipe';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { AddMembersPopupComponent } from '../../popups/add-members-popup/add-members-popup.component';
import { MediaPopupDetailsComponent } from '../../popups/media-popup-details/media-popup-details.component';
import { MembersPopupComponent } from '../../popups/members-popup/members-popup.component';
import { NewWatchlistPopupComponent } from '../../popups/new-watchlist-popup/new-watchlist-popup.component';
import { WatchlistsPopupComponent } from '../../popups/watchlists-popup/watchlists-popup.component';

@Component({
    selector: 'app-watchlist',
    imports: [
        ButtonComponent,
        CommonModule,
        AvatarComponent,
        NewWatchlistPopupComponent,
        MediaPopupDetailsComponent,
        CardComponent,
        WatchlistsPopupComponent,
        MembersPopupComponent,
        AddMembersPopupComponent,
    ],
    providers: [WatchlistMembersCountPipe],
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
export class WatchlistComponent {
    // INTERFACES
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly CONTENT_VIEW_TYPE = CONTENT_VIEW_TYPE;
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;
    readonly POPUP = POPUP;
    readonly Array = Array;

    // INJECTS
    private router = inject(Router);
    private authService = inject(AuthService);
    private watchlistService = inject(WatchlistService);
    private filterService = inject(FilterService);
    protected watchlistMembersCountPipe = inject(WatchlistMembersCountPipe);

    // SIGNALS
    readonly contentTypeFilter = this.filterService.contentType;
    readonly contentViewTypeFilter = this.filterService.contentViewType;

    fullCollection = signal<MergedMedia[]>([]);
    selectedInfo = signal<CardInfo | null>(null);

    showDetailsPopup = signal<boolean>(false);
    showWatchlistsPopup = signal<boolean>(false);
    showNewWatchlistPopup = signal<boolean>(false);
    showMembersPopup = signal<boolean>(false);
    showAddMembersPopup = signal<boolean>(false);

    // ASYNC STATE
    user = toSignal(this.authService.user$);
    activeWatchlist = toSignal(this.watchlistService.activeWatchlist$);
    userWatchlists = toSignal(this.watchlistService.watchlists$);

    // COMPUTED
    filteredWatchlist = computed(() => {
        const watchlist = this.activeWatchlist();
        const contentType = this.contentTypeFilter();
        const contentViewType = this.contentViewTypeFilter();

        if (!watchlist) return null;

        const filteredMedias = watchlist.medias.filter((media) => {
            return (
                media.mediaDetails.type === contentType &&
                media.isSeen === (contentViewType === CONTENT_VIEW_TYPE.SEEN)
            );
        });

        return { ...watchlist, medias: filteredMedias };
    });
    activeMembers = computed(() =>
        this.activeWatchlist()?.members?.filter((member) => member.invitationAccepted),
    );

    // OTHER
    @ViewChild('watchlistWrapper') watchlistWrapper!: ElementRef<HTMLDivElement>;
    @ViewChild('dropdownMenu') dropdownMenu!: ElementRef<HTMLDivElement>;

    // METHODS
    setContentType(contentType: CONTENT_TYPE) {
        this.filterService.setContentType(contentType);
        setTimeout(() => {
            this.watchlistWrapper.nativeElement.scrollTop = 0;
        }, 0);
    }

    openSearchView(): void {
        this.router.navigate(['/search'], { replaceUrl: true });
    }

    setView(view: CONTENT_VIEW_TYPE): void {
        this.filterService.setContentViewType(view);
    }

    openPopup(popup: POPUP, data?: EnrichedMedia) {
        switch (popup) {
            case POPUP.ITEM_DETAILS:
                this.selectedInfo.set(data!);
                this.showDetailsPopup.set(true);
                return;
            case POPUP.NEW_WATCHLIST:
                this.showNewWatchlistPopup.set(true);
                break;
            case POPUP.WATCHLISTS:
                this.showWatchlistsPopup.set(true);
                break;
            case POPUP.MEMBERS:
                this.showMembersPopup.set(true);
                break;
            case POPUP.ADD_MEMBERS:
                this.showAddMembersPopup.set(true);
                break;
            default:
                return;
        }
    }

    closePopup(popup: POPUP) {
        switch (popup) {
            case POPUP.ITEM_DETAILS:
                this.showDetailsPopup.set(false);
                break;
            case POPUP.NEW_WATCHLIST:
                this.showNewWatchlistPopup.set(false);
                break;
            case POPUP.WATCHLISTS:
                this.showWatchlistsPopup.set(false);
                break;
            case POPUP.MEMBERS:
                this.showMembersPopup.set(false);
                break;
            case POPUP.ADD_MEMBERS:
                this.showAddMembersPopup.set(false);
                this.showMembersPopup.set(true);
                break;
            default:
                return;
        }
    }

    openProfile(): void {
        this.router.navigate(['/profile'], { replaceUrl: true });
    }

    handleNewWatchlist(newWatchlist: WatchlistItem): void {
        this.showNewWatchlistPopup.set(false);
        this.watchlistService.setActiveId(newWatchlist.uidWatchlist);
    }
}
