// Workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: [
        'plugin:@croct/react',
        'plugin:@croct/typescript',
    ],
    plugins: ['@croct'],
    parserOptions: {
        project: ['./tsconfig.json'],
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
        jest: {
            version: 'detect',
        },
    },
    overrides: [
        {
            files: [
                '**/*.stories.tsx',
            ],
            rules: {
                'import/no-default-export': 'off',
            },
        },
    ],
};
