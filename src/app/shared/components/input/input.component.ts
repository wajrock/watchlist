import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-input',
    imports: [],
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
})
export class InputComponent {
    type = input.required<string>();
    name = input.required<string>();
    id = input.required<string>();
    placeholder = input.required<string>();
    value = input<string>('');
    spellcheck = input<boolean>(false);
    autocorrect = input<boolean>(false);
    autocapitalize = input<boolean>(false);
    autocomplete = input<string>('');
    disabled = input<boolean>(false);
    hasErrorMessage = input<boolean>(false);

    onInput = output<Event>();
}
