// @ts-check
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/**', '.astro/**', '.wrangler/**', '.cache/**'] },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.astro'] },
    },
    rules: {
      // <script>内の `new Foo()` だけの文を式文と誤判定する
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'inline style は使わず、Tailwind のユーティリティか CSS のクラスで書く',
        },
      ],
    },
  },
  {
    ignores: ['src/lib/posts.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'astro:content',
              importNames: ['getCollection'],
              message: '下書きがビルドに混ざるため、src/lib/posts.ts の getPosts() を使う',
            },
          ],
        },
      ],
    },
  },
];
