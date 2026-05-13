module.exports = {
  root: true,
  extends: ['@app/config/eslint-base'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
};
