import {join as pathJoin} from 'path';
import {create} from 'ts-node';

const tsService = create({
    cwd: __dirname,
    ignore: [
        'src/slots.d.ts',
    ],
});

const testFilename = pathJoin(__dirname, 'test.tsx');

describe('Validations for Personalization component typing', () => {
    it('should compile the base case', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression= "aa" >
                {(foo: string) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).not.toThrowError();
    });

    it('should not compile if the received value is not a JsonValue', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa">
                {(foo: Error) => typeof foo}
            </Personalization>;
        `;
        expect(() => tsService.compile(code, testFilename)).toThrowError();
    });

    it('should compile with initial value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" initial={true}>
                {(foo: string|boolean) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).not.toThrowError();
    });

    it('should not compile without type of initial value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" initial={true}>
                {(foo: string) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).toThrowError();
    });

    it('should compile with fallback value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" fallback={1}>
                {(foo: string|number) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).not.toThrowError();
    });

    it('should not compile without type of fallback value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" fallback={1}>
                {(foo: string) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).toThrowError();
    });

    it('should compile with both initial and fallback values', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" initial={true} fallback={1}>
                {(foo: string|boolean|number) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).not.toThrowError();
    });

    it('should not compile with only the type of initial value when given a fallback value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" initial={true} fallback={1}>
                {(foo: string|boolean) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).toThrowError();
    });

    it('should not compile with only the type of fallback value when given an initial value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="aa" initial={true} fallback={1}>
                {(foo: string|number) => typeof foo}
            </Personalization>;
        `;

        expect(() => tsService.compile(code, testFilename)).toThrowError();
    });
});
