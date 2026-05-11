import { Component, input } from '@angular/core';

@Component({
    selector: 'app-avatar',
    imports: [],
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
    initials = input.required<string>();
}
