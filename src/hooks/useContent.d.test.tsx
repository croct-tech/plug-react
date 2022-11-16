import {join as pathJoin} from 'path';
import {create} from 'ts-node';

const tsService = create({
    cwd: __dirname,
    transpileOnly: false,
    ignore: [
        'lib/slots.d.ts',
    ],
});

const testFilename = pathJoin(__dirname, 'test.tsx');

describe('useContent typing', () => {
    const header = `
        import {useContent} from './useContent';
    `;

    const slotMapping = `
        type HomeBannerProps = {
            title: string,
            subtitle: string,
        };
        
        declare module '@croct/plug/slot' {
            interface SlotMap {
                'home-banner': HomeBannerProps;
            }
        }
    `;

    type CodeOptions = {
        code: string,
        mapping: boolean,
    };

    type AssembledCode = {
        code: string,
        codePosition: number,
    };

    function assembleCode({code, mapping}: CodeOptions): AssembledCode {
        const prefix = mapping
            ? header + slotMapping
            : header;

        return {
            code: prefix + code.trim(),
            codePosition: prefix.length + 1,
        };
    }

    function compileCode(opts: CodeOptions): void {
        tsService.compile(assembleCode(opts).code, testFilename);
    }

    function getTypeName(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = tsService.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/^\(alias\) (useContent<.+?>)/s);

        if (match != null) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    function getReturnType(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = tsService.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/\): (.+?)(?: \(\+.+\))\nimport useContent$/s);

        if (match != null) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    it('should define the return type as a JSON object by default for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner');
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<JsonObject, JsonObject, JsonObject>',
        );

        expect(getReturnType(code)).toBe('JsonObject');
    });

    it('should include the type of the initial value on the return type for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true});
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<JsonObject, boolean, JsonObject>',
        );

        expect(getReturnType(code)).toBe('boolean | JsonObject');
    });

    it('should include the type of the fallback value on the return type for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {fallback: 1});
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<JsonObject, JsonObject, number>',
        );

        expect(getReturnType(code)).toBe('number | JsonObject');
    });

    it('should include the types of both the initial and fallback values on the return type for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true, fallback: 1});
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<JsonObject, boolean, number>',
        );

        expect(getReturnType(code)).toBe('number | boolean | JsonObject');
    });

    it('should allow narrowing the return type for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}>('home-banner');
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, {foo: string;}, {foo: string;}>',
        );

        expect(getReturnType(code)).toBe('{foo: string;}');
    });

    it('should allow specifying the initial value type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}, boolean>('home-banner', {initial: true});
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, boolean, {foo: string;}>',
        );

        expect(getReturnType(code)).toBe('boolean | {foo: string;}');
    });

    it('should allow specifying the fallback value type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}, never, number>('home-banner', {fallback: 1});
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, never, number>',
        );

        expect(getReturnType(code)).toBe('number | {foo: string;}');
    });

    it('show allow specifying the initial and fallback value types for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{foo: string}, boolean, number>('home-banner', {initial: true, fallback: 1});
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<{foo: string;}, boolean, number>',
        );

        expect(getReturnType(code)).toBe('number | boolean | {foo: string;}');
    });

    it('should require specifying JSON object as return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<true>('home-banner');
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should infer the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner');
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<"home-banner">');

        expect(getReturnType(code)).toBe('HomeBannerProps');
    });

    it('should include the type of the initial value on the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<boolean, "home-banner">');

        expect(getReturnType(code)).toBe('boolean | HomeBannerProps');
    });

    it('should include the type of the fallback value on the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {fallback: 1});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<number, "home-banner">');

        expect(getReturnType(code)).toBe('number | HomeBannerProps');
    });

    it('should include the types of both the initial and fallback values on the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true, fallback: 1});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<boolean, number, "home-banner">');

        expect(getReturnType(code)).toBe('number | boolean | HomeBannerProps');
    });

    it('should not allow overriding the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent<{title: string}>('home-banner');
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).toThrow();
    });
});
