module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ['./setup-jest.ts'],
  collectCoverage: true,
  coverageDirectory: "./coverage",
  testEnvironment: 'jsdom',
  coverageReporters: ['json', 'lcov', 'html'],
  roots: ['./src/app'],
  reporters: ['default'],
};
