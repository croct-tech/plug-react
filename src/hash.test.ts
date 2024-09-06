import {hash} from './hash';

describe('hash', () => {
    it('should generate a hash from a string', () => {
        const result = hash('foo');

        expect(result).toEqual('18cc6');
        expect(result).toEqual(hash('foo'));
    });

    it('should handle special characters', () => {
        expect(hash('✨')).toEqual('2728');
        expect(hash('💥')).toEqual('d83d');
        expect(hash('✨💥')).toEqual('59615');
    });

    it('should generate a hash from an empty string', () => {
        const result = hash('');

        expect(result).toEqual('0');
    });
});
