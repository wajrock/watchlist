import { SafeUrlPipe } from './safe-url.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafeUrlPipe', () => {
    let pipe: SafeUrlPipe;
    let mockSanitizer: any;

    beforeEach(() => {
        mockSanitizer = {
            bypassSecurityTrustResourceUrl: vi.fn((url: string) => `safebypass:${url}`),
        };
        pipe = new SafeUrlPipe(mockSanitizer as DomSanitizer);
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return an empty string if the video key is missing or empty', () => {
        const result = pipe.transform('');
        expect(result).toBe('');
        expect(mockSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    });

    it('should build the correct YouTube embed URL and bypass security checks', () => {
        const videoKey = 'dQw4w9WgXcQ';
        const expectedUrl =
            'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1';

        const result = pipe.transform(videoKey);

        expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(expectedUrl);
        expect(result).toBe(`safebypass:${expectedUrl}`);
    });
});
