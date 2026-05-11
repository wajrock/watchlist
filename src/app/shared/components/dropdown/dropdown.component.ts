import { Component, input } from '@angular/core';

@Component({
    selector: 'app-dropdown',
    imports: [],
    templateUrl: './dropdown.component.html',
    styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
    value = input.required<string>();
}
