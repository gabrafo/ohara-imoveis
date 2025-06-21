module.exports = {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  tsconfigFile: "tsconfig.json",
  ignoreStatic: true,
  concurrency: 4,
  timeoutMS: 60000,
  jest: {
    configFile: './test/jest.config.js',
    enableFindRelatedTests: true
  },
  mutate: [
    "src/feature-types/feature-types.controller.ts",
    "src/feature-types/feature-types.service.ts",
    "src/owners/owners.controller.ts",
    "src/owners/owners.service.ts",
    "src/app.controller.ts",
    "src/app.service.ts",
    "src/users/users.controller.ts",
    "src/users/users.service.ts",
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  }
};