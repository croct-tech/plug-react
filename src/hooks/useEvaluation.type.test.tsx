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

describe('Validations for useEvaluation hook typing', () => {
    const header = `
        import {useEvaluation} from './useEvaluation';
    `;

    function compileCode(code: string) {
        tsService.compile(header + code, testFilename);
    }

    function getTypeName(code: string): string {
        const info = tsService.getTypeInfo(header + code.trim(), testFilename, header.length + 1);

        const match = info.name.match(/^\(alias\) (useEvaluation<.+?>)/s);

        if (match) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    function getReturnType(code: string): string {
        const info = tsService.getTypeInfo(header + code.trim(), testFilename, header.length + 1);

        const match = info.name.match(/\): (.+?)(?: \(\+.+\))?\nimport useEvaluation$/s);

        if (match) {
            return match[1].replace(/\s*\n\s*/g, '');
        }

        return info.name;
    }

    it('should compile the base case', () => {
        const code = `    
            useEvaluation('x');
        `;

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useEvaluation<JsonValue, JsonValue, JsonValue>');

        expect(getReturnType(code)).toBe('JsonValue');
    });

    it('should allow for restricting the return type', () => {
        const code = `
            useEvaluation<string>('x');
        `;

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useEvaluation<string, string, string>');

        expect(getReturnType(code)).toBe('string');
    });

    it('should include the type of the initial value on the return', () => {
        const code = `
            useEvaluation('x', {initial: undefined});
        `;

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useEvaluation<JsonValue, undefined, JsonValue>');

        expect(getReturnType(code)).toBe('JsonValue | undefined');
    });

    it('should include the type of the fallback value on the return', () => {
        const code = `
            useEvaluation('x', {fallback: new Error()});
        `;

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useEvaluation<JsonValue, JsonValue, Error>');

        expect(getReturnType(code)).toBe('Error | JsonValue');
    });

    it('should include the types of both the initial and the fallback values on the return', () => {
        const code = `
            useEvaluation('x', {initial: undefined, fallback: new Error()});
        `;

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useEvaluation<JsonValue, undefined, Error>');

        expect(getReturnType(code)).toBe('Error | JsonValue | undefined');
    });

    it('should accept typed initial and fallback values', () => {
        const code = `
            useEvaluation<string, undefined, Error>('x', {initial: undefined, fallback: new Error()});
        `;

        expect(() => compileCode(code)).not.toThrowError();

        expect(getTypeName(code)).toBe('useEvaluation<string, undefined, Error>');

        expect(getReturnType(code)).toBe('string | Error | undefined');
    });

    it('should not compile with return type that is not valid json', () => {
        const code = `
            useEvaluation<undefined>('x');
        `;

        expect(() => compileCode(code)).toThrowError();
    });
});
