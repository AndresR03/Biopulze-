/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.mjs", "**/tests/**/*.spec.mjs"],
  setupFiles: ["<rootDir>/tests/setup.mjs"],
  transform: {},
  moduleNameMapper: {},
  testPathIgnorePatterns: ["/node_modules/"],
  forceExit: true,
  collectCoverageFrom: [
    "CONTROLLERS/**/*.mjs",
    "middleware/**/*.mjs",
    "SERVICES/**/*.mjs"
  ],
  coverageDirectory: "tests/coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true
};
