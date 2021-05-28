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

describe('Validations for useContent hook typing', () => {
    const header = `
        import {useContent} from './useContent';
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

        return {
            code: prefix + code.trim(),
            codePosition: prefix.length + 1,
        };
    }

    function compileCode(opts: CodeOptions) {
        tsService.compile(assembleCode(opts).code, testFilename);
    }

    function getTypeName(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = tsService.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/^\(alias\) (useContent<.+?>)/s);

        if (match) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    function getReturnType(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = tsService.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/\): (.+?)(?: \(\+.+\))\nimport useContent$/s);

        if (match) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    it('should compile the base case without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner');
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<NullableJsonObject, NullableJsonObject, NullableJsonObject>',
        );

        expect(getReturnType(code)).toBe('NullableJsonObject');
    });

    it('should compile with initial value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true});
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<NullableJsonObject, boolean, NullableJsonObject>',
        );

        expect(getReturnType(code)).toBe('boolean | NullableJsonObject');
    });

    it('should compile with fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {fallback: 1});
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<NullableJsonObject, NullableJsonObject, number>',
        );

        expect(getReturnType(code)).toBe('number | NullableJsonObject');
    });

    it('should compile with initial and fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true, fallback: 1});
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<NullableJsonObject, boolean, number>',
        );

        expect(getReturnType(code)).toBe('number | boolean | NullableJsonObject');
    });

    it('should compile with type narrowing without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}>('home-banner');
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, {foo: string;}, {foo: string;}>',
        );

        expect(getReturnType(code)).toBe('{foo: string;}');
    });

    it('should compile type narrowing and initial value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}, boolean>('home-banner', {initial: true});
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, boolean, {foo: string;}>',
        );

        expect(getReturnType(code)).toBe('boolean | {foo: string;}');
    });

    it('should compile with type narrowing and fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}, never, number>('home-banner', {fallback: 1});
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, never, number>',
        );

        expect(getReturnType(code)).toBe('number | {foo: string;}');
    });

    it('should compile type narrowing, initial value and fallback value without mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}, boolean, number>('home-banner', {initial: true, fallback: 1});
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, boolean, number>',
        );

        expect(getReturnType(code)).toBe('number | boolean | {foo: string;}');
    });

    it('should not compile type narrowing unassailable to nullable json object', () => {
        const code: CodeOptions = {
            code: `
                useContent<true>('home-banner');
            `,
            withMapping: false,
        };

        expect(() => compileCode(code)).toThrowError();
    });

    it('should compile the base case with mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner');
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useContent<"home-banner">');

        expect(getReturnType(code)).toBe('HomeBannerProps');
    });

    it('should compile with initial value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true});
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useContent<boolean, "home-banner">');

        expect(getReturnType(code)).toBe('boolean | HomeBannerProps');
    });

    it('should compile with fallback value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {fallback: 1});
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useContent<number, "home-banner">');

        expect(getReturnType(code)).toBe('number | HomeBannerProps');
    });

    it('should compile with initial value, fallback value and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true, fallback: 1});
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useContent<boolean, number, "home-banner">');

        expect(getReturnType(code)).toBe('number | boolean | HomeBannerProps');
    });

    it('should not compile with return type parameter and mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{title: string}>('home-banner');
            `,
            withMapping: true,
        };

        expect(() => compileCode(code)).toThrowError();
    });
});
