import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaActionsComponent } from './media-actions.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ACTIONS_VIEW, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../../shared/models/models';
import { GRADE } from '../../../../shared/models/firebase.models';
import { LucideHeart, LucideThumbsDown, LucideThumbsUp } from '@lucide/angular';

describe('MediaActionsComponent', () => {
    let component: MediaActionsComponent;
    let fixture: ComponentFixture<MediaActionsComponent>;

    const baseMedia = {
        id: 123,
        type: CONTENT_TYPE.MOVIE,
        title: 'Inception',
        releaseDate: '2010',
        posterPath: '',
        backdropPath: '',
        overview: '',
        voteAverage: 8.8,
        adult: false,
        popularity: 90,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MediaActionsComponent, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(MediaActionsComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('view', PAGE_VIEW_TYPE.WATCHLIST);
        fixture.componentRef.setInput('mediaDetails', baseMedia);
        fixture.componentRef.setInput('mediaSeenStatus', false);
        fixture.componentRef.setInput('mediaGrade', GRADE.NO_GRADE);
        fixture.componentRef.setInput('actionsView', ACTIONS_VIEW.DEFAULT);

        fixture.detectChanges();
    });

    it('should create and map core configurations', () => {
        expect(component).toBeTruthy();
    });

    describe('gradesBtnContent computed evaluation matrix', () => {
        it('should structure specific return parameters matching LOVE grade values', () => {
            fixture.componentRef.setInput('mediaGrade', GRADE.LOVE);
            fixture.detectChanges();

            expect(component.gradesBtnContent()).toEqual({
                icon: LucideHeart,
                text: "J'adore",
            });
        });

        it('should structure specific return parameters matching LIKE grade values', () => {
            fixture.componentRef.setInput('mediaGrade', GRADE.LIKE);
            fixture.detectChanges();

            expect(component.gradesBtnContent()).toEqual({
                icon: LucideThumbsUp,
                text: "J'aime",
            });
        });

        it('should structure specific return parameters matching DONT_LIKE grade values', () => {
            fixture.componentRef.setInput('mediaGrade', GRADE.DONT_LIKE);
            fixture.detectChanges();

            expect(component.gradesBtnContent()).toEqual({
                icon: LucideThumbsDown,
                text: "J'aime pas",
            });
        });

        it('should return unrated string labels localized for movie contents when grade is NONE', () => {
            fixture.componentRef.setInput('mediaGrade', GRADE.NO_GRADE);
            fixture.componentRef.setInput('mediaDetails', {
                ...baseMedia,
                type: CONTENT_TYPE.MOVIE,
            });
            fixture.detectChanges();

            expect(component.gradesBtnContent()).toEqual({
                icon: LucideThumbsUp,
                text: 'Noter ce film',
            });
        });

        it('should return unrated string labels localized for tv show contents when grade is NONE', () => {
            fixture.componentRef.setInput('mediaGrade', GRADE.NO_GRADE);
            fixture.componentRef.setInput('mediaDetails', { ...baseMedia, type: CONTENT_TYPE.TV });
            fixture.detectChanges();

            expect(component.gradesBtnContent()).toEqual({
                icon: LucideThumbsUp,
                text: 'Noter cette série',
            });
        });
    });
});
