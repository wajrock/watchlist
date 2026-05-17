import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);

    transform(key: string): unknown {
        if (!key) return '';

        const options = '?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1';

        const url = `https://www.youtube.com/embed/${key}${options}`;

        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
