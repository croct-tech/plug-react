export function isSsr(): boolean {
    return typeof window === 'undefined';
}
