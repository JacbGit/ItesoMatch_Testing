module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "modules/**/*.js",
    "middlewares/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**",
  ],
  coverageReporters: ["json", "json-summary", "lcov", "text", "html"],
  verbose: true,
  testTimeout: 15000,
};
