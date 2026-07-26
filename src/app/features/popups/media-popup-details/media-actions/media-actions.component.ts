import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import {
    LucideCirclePlus,
    LucideCircleX,
    LucideDynamicIcon,
    LucideEye,
    LucideEyeOff,
    LucideHeart,
    LucidePlay,
    LucideThumbsDown,
    LucideThumbsUp,
    LucideTrash,
} from '@lucide/angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ApiMedia, GRADE } from '../../../../shared/models/firebase.models';
import { ACTIONS_VIEW, CONTENT_TYPE, PAGE_VIEW_TYPE } from '../../../../shared/models/models';

@Component({
    selector: 'app-media-actions',
    imports: [
        ButtonComponent,
        CommonModule,
        LucidePlay,
        LucideCirclePlus,
        LucideEye,
        LucideEyeOff,
        LucideDynamicIcon,
        LucideCircleX,
        LucideThumbsDown,
        LucideThumbsUp,
        LucideHeart,
        LucideTrash,
    ],
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

    gradesBtnContent = computed<{ icon: any; text: string }>(() => {
        const mediaGrade = this.mediaGrade();
        const mediaDetails = this.mediaDetails();

        if (mediaGrade === GRADE.LOVE) {
            return { icon: LucideHeart, text: "J'adore" };
        } else if (mediaGrade === GRADE.LIKE) {
            return { icon: LucideThumbsUp, text: "J'aime" };
        } else if (mediaGrade === GRADE.DONT_LIKE) {
            return { icon: LucideThumbsDown, text: "J'aime pas" };
        }
        return {
            icon: LucideThumbsUp,
            text: `Noter ${mediaDetails.type === CONTENT_TYPE.MOVIE ? 'ce film' : 'cette série'}`,
        };
    });
}
