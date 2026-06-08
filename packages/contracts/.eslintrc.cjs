module.exports = {
  root: true,
  extends: [require.resolve('@app/config')],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
};
