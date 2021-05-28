import {join as pathJoin} from 'path';
import {create} from 'ts-node';

const ts = create({
    cwd: __dirname,
    ignore: [
        'src/slots.d.ts',
    ],
});

const testFilename = pathJoin(__dirname, 'test.tsx');

describe('<Personalization/> typing', () => {
    it('should a renderer that accepts JSON values or covariants', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" >
                {(foo: string) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).not.toThrowError();
    });

    it('should require a renderer that accepts JSON values or covariants', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true">
                {(foo: Error) => typeof foo}
            </Personalization>;
        `;
        expect(() => ts.compile(code, testFilename)).toThrowError();
    });

    it('should allow a renderer that accepts the initial value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" initial={true}>
                {(foo: string|boolean) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).not.toThrowError();
    });

    it('should require a renderer that accepts the initial value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" initial={true}>
                {(foo: string) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).toThrowError();
    });

    it('should allow a renderer that accepts the fallback value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" fallback={1}>
                {(foo: string|number) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).not.toThrowError();
    });

    it('should require a renderer that accepts the fallback value', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" fallback={1}>
                {(foo: string) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).toThrowError();
    });

    it('should allow a renderer that accepts both the initial and fallback values', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" initial={true} fallback={1}>
                {(foo: string|boolean|number) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).not.toThrowError();
    });

    it('should require a renderer that accepts both the initial and fallback values', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" initial={true} fallback={1}>
                {(foo: string|boolean) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).toThrowError();
    });

    it('should require a renderer that accepts both the fallback and initial values', () => {
        const code = `
            import {Personalization} from './index';

            <Personalization expression="true" initial={true} fallback={1}>
                {(foo: string|number) => typeof foo}
            </Personalization>;
        `;

        expect(() => ts.compile(code, testFilename)).toThrowError();
    });
});
