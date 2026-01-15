import {join as pathJoin} from 'path';
import {create} from 'ts-node';

const tsService = create({
    cwd: __dirname,
    transpileOnly: false,
});

const testFilename = pathJoin(__dirname, 'test.tsx');

describe('useContent typing', () => {
    const header = `
        import {useContent} from './useContent';
    `;

    const slotMapping = `
        type HomeBanner = {
            title: string,
            subtitle: string,
        };
        
        type Banner = {
            title: string,
            subtitle: string,
        };
        
        type Carousel = {
            title: string,
            subtitle: string,
        };
        
        declare module '@croct/plug/slot' {
            type HomeBannerV1 = HomeBanner & {_component: 'banner@v1' | null};
        
            interface VersionedSlotMap {
                'home-banner': {
                    'latest': HomeBannerV1,
                    '1': HomeBannerV1,
                };
            }
        }
        
        declare module '@croct/plug/component' {
            interface VersionedComponentMap {
                'banner': {
                    'latest': Banner,
                    '1': Banner,
                };
                'carousel': {
                    'latest': Carousel,
                    '1': Carousel,
                };
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

        if (match !== null) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    function getReturnType(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = tsService.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/\): (.+?)(?: \(\+.+\))\nimport useContent$/s);

        if (match !== null) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    it('should infer whether the schema is requested', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {schema: true});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<"home-banner", {schema: true;}>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<HomeBannerV1, {schema: true;}>');
    });

    it('should define the return type as a JSON object by default for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner');
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<JsonObject, JsonObject, JsonObject, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<JsonObject, FetchResponseOptions>');
    });

    it('should define the return type as an union of component for unknown slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('dynamic-id' as any);
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe(
            'useContent<any, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe(
            'FetchResponse<(Banner & {_component: "banner@1" | null;}) | '
            + '(Carousel & {_component: "carousel@1" | null;}), FetchResponseOptions>',
        );
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
            'useContent<JsonObject, boolean, JsonObject, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<boolean | JsonObject, FetchResponseOptions>');
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
            'useContent<JsonObject, JsonObject, number, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<number | JsonObject, FetchResponseOptions>');
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
            'useContent<JsonObject, boolean, number, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<number | boolean | JsonObject, FetchResponseOptions>');
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
            'useContent<{foo: string;}, {foo: string;}, {foo: string;}, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<{foo: string;}, FetchResponseOptions>');
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
            'useContent<{foo: string;}, boolean, {foo: string;}, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<boolean | {foo: string;}, FetchResponseOptions>');
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
            'useContent<{foo: string;}, never, number, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<number | {foo: string;}, FetchResponseOptions>');
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
            'useContent<{foo: string;}, boolean, number, FetchResponseOptions>',
        );

        expect(getReturnType(code)).toBe('FetchResponse<number | boolean | {foo: string;}, FetchResponseOptions>');
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

        expect(getTypeName(code)).toBe('useContent<"home-banner", FetchResponseOptions>');

        expect(getReturnType(code)).toBe('FetchResponse<HomeBannerV1, FetchResponseOptions>');
    });

    it('should include the type of the initial value on the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<boolean, "home-banner", FetchResponseOptions>');

        expect(getReturnType(code)).toBe('FetchResponse<boolean | HomeBannerV1, FetchResponseOptions>');
    });

    it('should include the type of the fallback value on the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {fallback: 1});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<number, "home-banner", FetchResponseOptions>');

        expect(getReturnType(code)).toBe('FetchResponse<number | HomeBannerV1, FetchResponseOptions>');
    });

    it('should include the types of both the initial and fallback values on the return type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                useContent('home-banner', {initial: true, fallback: 1});
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getTypeName(code)).toBe('useContent<boolean, number, "home-banner", FetchResponseOptions>');

        expect(getReturnType(code)).toBe('FetchResponse<number | boolean | HomeBannerV1, FetchResponseOptions>');
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
