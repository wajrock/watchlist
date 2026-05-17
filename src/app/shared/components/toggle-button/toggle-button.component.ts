import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParamOptions } from '../../models/models';

@Component({
    selector: 'app-toggle-button',
    imports: [FormsModule, CommonModule],
    templateUrl: './toggle-button.component.html',
    styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent implements OnChanges, AfterViewInit {
    @Input() options!: Array<ParamOptions>;
    @Input() type: 'cta' | 'secondary-cta' | 'label' = 'secondary-cta';
    @Input() border: boolean = false;
    @Input() defaultOption: number = 0;
    public animate: boolean = true;
    @Input() size: 'small' | 'medium' | 'large' = 'small';

    @Output() onIndexSelected = new EventEmitter<number>();

    @ViewChild('hover') hover!: ElementRef;

    itemSelected: number = 0;

    ngAfterViewInit(): void {
        this.swichPositionHover(this.defaultOption, false);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['defaultOption']) {
            this.swichPositionHover(this.defaultOption, false);
        }
    }

    swichPositionHover(position: number, byUser: boolean) {
        this.animate = byUser;
        this.itemSelected = position;

        if (byUser) {
            this.onIndexSelected.emit(position);
        }

        if (this.hover) {
            if (byUser) {
                this.hover.nativeElement.style.transition = `transform .3s`;
            } else {
                this.hover.nativeElement.style.transition = ``;
            }
            const translateX = position === 0 ? '0%' : '100%';

            this.hover.nativeElement.style.transform = `translateX(${translateX})`;
        }
    }
}
