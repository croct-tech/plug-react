import {join as pathJoin} from 'path';
import {create} from 'ts-node';

const tsService = create({
    cwd: __dirname,
    transpileOnly: false,
    ignore: [
        'src/slots.d.ts',
    ],
});

const testFilename = pathJoin(__dirname, 'test.tsx');

describe('Validations for Slot component typing', () => {
    const header = `
        import {Slot} from './index';
    `;

    const typeMapping = `
        import {NullableJsonObject} from '@croct/plug/sdk/json';

        type HomeBannerProps = {
            title: string,
            subtitle: string,
        };
        
        declare module '@croct/plug/fetch' {
            interface SlotMap extends Record<string, NullableJsonObject> {
                'home-banner': HomeBannerProps;
            }
        }
    `;

    type CodeOptions = { code: string, withMapping: boolean };
    type AssembledCode = { code: string, codePosition: number };

    function assembleCode({code, withMapping}: CodeOptions): AssembledCode {
        const prefix = withMapping
            ? header + typeMapping
            : header;

        const fullCode = prefix + code.trim();

        return {
            code: fullCode,
            codePosition: fullCode.lastIndexOf('=>') + 1,
        };
    }

    function compileCode(opts: CodeOptions) {
        tsService.compile(assembleCode(opts).code, testFilename);
    }

    function getParameterType(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = tsService.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/function\(\w+: (.+?)\):/s);

        if (match) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    it('should compile with type narrowing without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile without wither type narrowing nor mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {params => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should not compile with type narrowing not assignable to a nullable json object without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: true) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile with type narrowing and initial and without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {foo: string}|boolean) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile with type narrowing excluding the type of initial value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile with type narrowing and fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {foo: string}|boolean) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile with type narrowing excluding the type of fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile with type narrowing, initial value and fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {foo: string}|boolean|number) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile with type narrowing including only the type of initial value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {foo: string}|boolean) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should not compile with type narrowing including only the type of fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {foo: string}|number) => typeof params}
                </Slot>;
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile the base case with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {params => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getParameterType(code)).toBe('HomeBannerProps');
    });

    it('should compile with type narrowing and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: {title: string}) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile with type narrowing incompatible with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile with initial value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {params => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getParameterType(code)).toBe('boolean | HomeBannerProps');
    });

    it('should compile with type narrowing, initial value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {title: string}|boolean) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile with type narrowing excluding type of initial value with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {title: string}) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile with fallback value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {params => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getParameterType(code)).toBe('boolean | HomeBannerProps');
    });

    it('should compile with type narrowing, fallback value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {title: string}|boolean) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile type narrowing excluding type of fallback value with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {title: string}) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile with initial value, fallback value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {params => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getParameterType(code)).toBe('number | boolean | HomeBannerProps');
    });

    it('should compile with type narrowing, initial value, fallback value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {title: string}|boolean|number) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();
    });

    it('should not compile with type narrowing including only the type of initial value with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {title: string}|boolean) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should not compile with type narrowing including only the type of fallback value with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {title: string}|number) => typeof params}
                </Slot>;
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).toThrowError();
    });
});
