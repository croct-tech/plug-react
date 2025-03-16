/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};
