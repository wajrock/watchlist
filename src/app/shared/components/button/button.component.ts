import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-button',
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
})
export class ButtonComponent {
    @Input() customClass: string = '';

    @Output() action = new EventEmitter<void>();

    isClicked: boolean = false;

    handleClick() {
        this.action.emit();
    }

    handleTouchEnd() {
        this.isClicked = false;
    }
}
