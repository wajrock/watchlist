import { Component, computed, input, output, signal } from '@angular/core';
import { ACTIONS_VIEW, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../../shared/models/models';
import { ApiMedia, GRADE } from '../../../../shared/models/firebase.models';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-media-actions',
    imports: [ButtonComponent, CommonModule],
    templateUrl: './media-actions.component.html',
    styleUrl: './media-actions.component.scss',
    animations: [
        trigger('viewIconAnimation', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'scale(0.5)',
                }),
                animate(
                    '300ms ease-out',
                    style({
                        opacity: 1,
                        transform: 'scale(1)',
                    }),
                ),
            ]),
            transition(':leave', [style({ opacity: 0 })]),
        ]),
    ],
})
export class MediaActionsComponent {
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly GRADE = GRADE;
    readonly ACTION_VIEW = ACTIONS_VIEW;

    view = input.required<PAGE_VIEW_TYPE>();
    mediaDetails = input.required<ApiMedia>();
    mediaSeenStatus = input.required<boolean>();
    mediaGrade = input.required<GRADE>();
    actionsView = input.required<ACTIONS_VIEW>();

    add = output<void>();
    remove = output<void>();
    updateSeenStatus = output<void>();
    openTrailer = output<void>();
    updateGrade = output<GRADE>();
    changeActionsView = output<ACTIONS_VIEW>();

    gradesBtnContent = computed<{ icon: string; text: string }>(() => {
        const mediaGrade = this.mediaGrade();
        const mediaDetails = this.mediaDetails();

        if (mediaGrade === GRADE.LOVE) {
            return { icon: 'fa-heart', text: "J'adore" };
        } else if (mediaGrade === GRADE.LIKE) {
            return { icon: 'fa-thumbs-up', text: "J'aime" };
        } else if (mediaGrade === GRADE.DONT_LIKE) {
            return { icon: 'fa-thumbs-down', text: "J'aime pas" };
        }
        return {
            icon: 'fa-thumbs-up',
            text: `Noter ${mediaDetails.type === CONTENT_TYPE.MOVIE ? 'ce film' : 'cette série'}`,
        };
    });
}
