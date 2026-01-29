;import { defineConfig } from 'eslint/config';
import { configs } from '@croct/eslint-plugin';

export default defineConfig(
    configs.react,
    configs.typescript,
    {
        ignores: [
            'build/**',
            'node_modules/**',
            'dist/',
            '.snapshots/',
            '*.min.js',
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
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
    },
    {
        rules: {
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/only-throw-error': 'off',
            'import/no-default-export': 'off',
        },
    },
    {
        files: [
            '**/*.stories.tsx',
            'jest.config.mjs',
        ],
        rules: {
            'import/no-default-export': 'off',
        },
    }
);