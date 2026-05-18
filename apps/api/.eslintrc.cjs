module.exports = {
  root: true,
  extends: [require.resolve('@app/config')],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  ignorePatterns: [
    'dist/**',
    'src/**/*.d.ts',
    'src/**/*.js',
    'src/**/*.spec.ts',
    'src/**/*.e2e-spec.ts',
  ],
  rules: {
    'import/no-default-export': 'off',
  },
};
