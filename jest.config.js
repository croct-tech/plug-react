module.exports = {
    projects: [
        {
            displayName: 'browser',
            testEnvironment: 'jsdom',
            testRegex: '(?<!\\.ssr)\\.test.tsx?$',
        },
        {
            displayName: 'server',
            testEnvironment: 'node',
            testRegex: '\\.ssr\\.test.tsx?$',
        },
    ],
};
