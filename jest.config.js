module.exports = {
    projects: [
        {
            displayName: 'browser',
            testEnvironment: 'jsdom',
            testRegex: `${__dirname}/src/.*(?<!\\.ssr)\\.test.tsx?$`,
        },
        {
            displayName: 'server',
            testEnvironment: 'node',
            testRegex: `${__dirname}/src/.*\\.ssr\\.test.tsx?$`,
        },
    ],
};
