import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'build/**',
      'baseline/**',
      'node_modules/**',
      'coverage/**',
      // Generated — regenerate via `npm run types` rather than lint/fix by hand.
      'src/types/dev-test.ts',
      'src/types/dev-feature.ts',
      'src/types/test.ts',
      'src/types/feature.ts',
      // Legacy CommonJS app being replaced phase-by-phase (specs/001-modernize-ts-react). Not
      // part of "the new codebase" the lint/file-size gates apply to (plan.md Constraints) —
      // each of these is deleted by a task in that migration (T046/T080/T088/T107) once its
      // TypeScript replacement lands, not brought up to the new lint standard in place.
      'public/**',
      'views/**',
      'app.js',
      'bin/www',
      'build.js',
      'test.js',
      'routes/**',
      'src/feature-helper.js',
      'src/test-id-helper.js',
      'src/sp-md-to-obj.js',
      'scripts/**',
      'data/validate.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['client/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Every accessibility semantic this migration relies on is hand-written to match the
      // pre-migration markup exactly (see specs/001-modernize-ts-react/plan.md's Accessibility
      // Design section) — keep jsx-a11y at "error" rather than downgrading any rule, since a
      // silenced rule here is exactly the kind of drift the migration promises not to introduce.
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['server/**/*.ts', 'src/**/*.ts', 'tools/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Warn, not error: tooling that walks build/*.json ahead of the generated types
      // (src/types/*.ts, Phase 1) legitimately needs `any` at that boundary. Keep it visible in
      // `npm run lint` output rather than silencing it outright.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
