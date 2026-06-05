import { DisplayProviderPipe } from './display-provider.pipe';

describe('DisplayProviderPipe', () => {
    let pipe: DisplayProviderPipe;

    beforeEach(() => {
        pipe = new DisplayProviderPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return the original string if provider is "Inconnu"', () => {
        const result = pipe.transform('Inconnu');
        expect(result).toBe('Inconnu');
    });

    it('should handle Amazon Channel providers and replace Plus with +', () => {
        const result = pipe.transform('Amazon Channel Premium');
        expect(result).toBe('Amazon');
    });

    it('should replace "Plus" or "plus" with "+" and keep at most two words', () => {
        const resultWithCapitalPlus = pipe.transform('Canal Plus Series');
        expect(resultWithCapitalPlus).toBe('Canal+');

        const resultWithLowerPlus = pipe.transform('Paramount plus Gold');
        expect(resultWithLowerPlus).toBe('Paramount+');
    });

    it('should format a regular provider name correctly without changing it', () => {
        const result = pipe.transform('Netflix Premium Ultra');
        expect(result).toBe('Netflix Premium');
    });
});
