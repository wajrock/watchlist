import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideSparkles } from '@lucide/angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MergedMedia } from '../../../shared/models/firebase.models';
import { CardInfo, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../shared/models/models';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { NavbarService } from '../../../shared/services/navbar/navbar.service';
import { ScrollService } from '../../../shared/services/scroll/scroll.service';
import { MediaPopupDetailsComponent } from '../../popups/media-popup-details/media-popup-details.component';
import { ClassicSearchComponent } from './classic-search/classic-search.component';
import { MagicSearchComponent } from './magic-search/magic-search.component';
@Component({
    selector: 'app-search',
    imports: [
        FormsModule,
        MediaPopupDetailsComponent,
        ButtonComponent,
        ClassicSearchComponent,
        MagicSearchComponent,
        LucideSparkles,
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
})
export class SearchComponent {
    // CONSTANTS
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;
    readonly Array = Array;

    // INJECTS
    private router = inject(Router);
    private navbarService = inject(NavbarService);
    protected filterService = inject(FilterService);
    private scrollService = inject(ScrollService);

    // Signals
    selectedInfo = signal<CardInfo | null>(null);
    noResults = signal<boolean>(false);
    showDetailsPopup = signal<boolean>(false);
    isMagicSearchActivated = signal<boolean>(false);

    fullCollection = signal<MergedMedia[]>([]);

    searchValue = signal<string>('');
    contentTypeFilter = this.filterService.contentType;

    geminiSearchQuery = signal('');

    // MISC.
    @ViewChild('searchPage') searchPage!: ElementRef<HTMLDivElement>;

    // METHODS
    constructor() {
        this.scrollService.scrollToTop.subscribe((scrollToTop) => {
            if (scrollToTop) {
                this.searchPage.nativeElement.scrollTo(0, 0);
                this.scrollService.shouldScrollToTop.set(false);
            }
        });
    }

    switchView() {
        const newType =
            this.contentTypeFilter() === CONTENT_TYPE.MOVIE ? CONTENT_TYPE.TV : CONTENT_TYPE.MOVIE;

        this.filterService.setContentType(newType);
    }

    switchSearchType() {
        this.isMagicSearchActivated.update((value) => !value);
        if (this.isMagicSearchActivated()) {
            this.navbarService.hide();
        } else {
            this.navbarService.show();
        }
    }

    closeSearchPage() {
        this.router.navigate([''], { replaceUrl: true });
    }

    handleShowDetails(info: CardInfo) {
        this.selectedInfo.set(info);
        this.showDetailsPopup.set(true);
    }

    closeDetailsPopup() {
        this.showDetailsPopup.set(false);
    }

    onMediaAddedToWatchlist(): void {
        this.closeDetailsPopup();
    }

    async onSearchSubmit() {
        this.geminiSearchQuery.set(this.searchValue());
    }
}
