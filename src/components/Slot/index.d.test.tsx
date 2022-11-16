import {join as pathJoin} from 'path';
import {create} from 'ts-node';

const ts = create({
    cwd: __dirname,
    transpileOnly: false,
    ignore: [
        'lib/slots.d.ts',
    ],
});

const testFilename = pathJoin(__dirname, 'test.tsx');

describe('<Slot  /> typing', () => {
    const header = `
        import {Slot} from './index';
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

        const fullCode = prefix + code.trim();

        return {
            code: fullCode,
            codePosition: fullCode.lastIndexOf('=>') + 1,
        };
    }

    function compileCode(opts: CodeOptions): void {
        ts.compile(assembleCode(opts).code, testFilename);
    }

    function getParameterType(opts: CodeOptions): string {
        const assembledCode = assembleCode(opts);

        const info = ts.getTypeInfo(assembledCode.code, testFilename, assembledCode.codePosition);

        const match = info.name.match(/function\(\w+: (.+?)\):/s);

        if (match != null) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    it('should allow a renderer that accepts JSON objects or covariants for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts JSON objects or covariants for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: true) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should allow a renderer that accepts the initial value for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {foo: string}|boolean) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts the initial value for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should allow a renderer that accepts the fallback value for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {foo: string}|boolean) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts the fallback value for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should allow a renderer that accepts both the initial and fallback values for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {foo: string}|boolean|number) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts both the initial and fallback values for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {foo: string}|boolean) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should require a renderer that accepts both the fallback and initial values for unmapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {foo: string}|number) => typeof params}
                </Slot>;
            `,
            mapping: false,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should infer the renderer parameter type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {params => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getParameterType(code)).toBe('HomeBannerProps');
    });

    it('should allow a covariant renderer parameter type for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: {title: string}) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a compatible renderer for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'}>
                    {(params: {foo: string}) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should infer the renderer parameter type also from the initial value for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {params => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getParameterType(code)).toBe('boolean | HomeBannerProps');
    });

    it('should allow a renderer that accepts the initial value for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {title: string}|boolean) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts the initial value for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true}>
                    {(params: {title: string}) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should infer the renderer parameter type also from the fallback value for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {params => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getParameterType(code)).toBe('boolean | HomeBannerProps');
    });

    it('should allow a renderer that accepts the fallback value for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {title: string}|boolean) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts the fallback value for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} fallback={true}>
                    {(params: {title: string}) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should infer the renderer parameter type from both the initial and fallback values for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {params => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();

        expect(getParameterType(code)).toBe('number | boolean | HomeBannerProps');
    });

    it('should allow a renderer that accepts both the initial and fallback values for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {title: string}|boolean|number) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).not.toThrow();
    });

    it('should require a renderer that accepts both the initial and fallback values for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {title: string}|boolean) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).toThrow();
    });

    it('should require a renderer that accepts both the fallback and initial values for mapped slots', () => {
        const code: CodeOptions = {
            code: `
                <Slot id={'home-banner'} initial={true} fallback={1}>
                    {(params: {title: string}|number) => typeof params}
                </Slot>;
            `,
            mapping: true,
        };

        expect(() => compileCode(code)).toThrow();
    });
});
