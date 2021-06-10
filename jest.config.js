const path = require('path');

module.exports = {
    projects: [
        {
            displayName: 'browser',
            testEnvironment: 'jsdom',
            testRegex: path.join(__dirname, 'src', '.+(?<!\\.ssr)\\.test.tsx?$'),
        },
        {
            displayName: 'server',
            testEnvironment: 'node',
            testRegex: path.join(__dirname, 'src', '.+\\.ssr\\.test.tsx?$'),
        },
    ],
};
