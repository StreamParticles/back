module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      // TO-DO increase this threshold by the time
      branches: 50,
      functions: 45,
      lines: 60,
      // statements: -10,
    },
  },
  rootDir: "./src",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/config/",
    "/models/",
    "/types/",
  ],
  moduleNameMapper: {
    "^#constants(.*)$": "<rootDir>/constants$1",
    "^#controllers(.*)$": "<rootDir>/controllers$1",
    "^#daos(.*)$": "<rootDir>/daos$1",
    "^#middlewares(.*)$": "<rootDir>/middlewares$1",
    "^#processes(.*)$": "<rootDir>/processes$1",
    "^#services(.*)$": "<rootDir>/services$1",
    "^#types_(.*)$": "<rootDir>/types$1",
    "^#utils(.*)$": "<rootDir>/utils$1",
    "^#models(.*)$": "<rootDir>/models$1",
    "^#validators(.*)$": "<rootDir>/validators$1",
  },
};
