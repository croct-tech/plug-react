/**
 * @private
 */
export function hash(value: string): string {
    let code = 0;

    for (const char of value) {
        const charCode = char.charCodeAt(0);

        code = (code << 5) - code + charCode;
        code |= 0; // Convert to 32bit integer
    }

    return code.toString(16);
}
