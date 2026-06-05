import { DisplaySeasonsNumberPipe } from './display-seasons-number.pipe';

describe('DisplaySeasonsNumberPipe', () => {
    let pipe: DisplaySeasonsNumberPipe;

    beforeEach(() => {
        pipe = new DisplaySeasonsNumberPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "1 Saison" without an "s" when the input is 1', () => {
        const result = pipe.transform(1);
        expect(result).toBe('1 Saison');
    });

    it('should return "0 Saison" without an "s" when the input is 0', () => {
        const result = pipe.transform(0);
        expect(result).toBe('0 Saison');
    });

    it('should return "2 Saisons" with an "s" when the input is greater than 1', () => {
        const result = pipe.transform(2);
        expect(result).toBe('2 Saisons');
    });
});
