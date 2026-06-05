import { LogoStylePipe } from './logo-style.pipe';

describe('LogoStylePipe', () => {
    let pipe: LogoStylePipe;

    beforeEach(() => {
        pipe = new LogoStylePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return extra wide styles when aspect_ratio is greater than 5', () => {
        const result = pipe.transform(6);

        expect(result).toEqual({
            'aspect-ratio': '6',
            width: '17rem',
            height: 'auto',
        });
    });

    it('should return medium wide styles when aspect_ratio is between 2 and 5', () => {
        const result = pipe.transform(3.5);

        expect(result).toEqual({
            'aspect-ratio': '3.5',
            width: '12rem',
            height: 'auto',
        });
    });

    it('should return tall or square styles when aspect_ratio is 2 or less', () => {
        const result = pipe.transform(1.5);

        expect(result).toEqual({
            'aspect-ratio': '1.5',
            width: 'auto',
            height: '7rem',
        });
    });
});
